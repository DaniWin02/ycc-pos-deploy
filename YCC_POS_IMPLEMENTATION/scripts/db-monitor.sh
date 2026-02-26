#!/bin/bash

# YCC POS Database Monitoring Script
# Monitors PostgreSQL performance, connections, and health

set -e

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-ycc_pos}"
DB_USER="${DB_USER:-yccpos_user}"
DB_PASSWORD="${DB_PASSWORD:-yccpos_secure_password_2024}"
LOG_FILE="/var/log/ycc-pos/database-monitoring.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - DB: $1" >> "$LOG_FILE"
    echo -e "${BLUE}[DB MONITOR]${NC} $1"
}

# Database query function
db_query() {
    local query="$1"
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$query" 2>/dev/null
}

# Check database connectivity
check_db_connectivity() {
    log "Checking database connectivity..."

    if db_query "SELECT 1;" >/dev/null 2>&1; then
        log "${GREEN}Database connection successful${NC}"
        return 0
    else
        log "${RED}Database connection failed${NC}"
        return 1
    fi
}

# Monitor active connections
monitor_connections() {
    log "Monitoring database connections..."

    local active_connections=$(db_query "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';")
    local total_connections=$(db_query "SELECT count(*) FROM pg_stat_activity;")
    local idle_connections=$(db_query "SELECT count(*) FROM pg_stat_activity WHERE state = 'idle';")

    log "Active connections: $active_connections"
    log "Total connections: $total_connections"
    log "Idle connections: $idle_connections"

    # Alert if too many active connections
    if [ "$active_connections" -gt 50 ]; then
        /var/www/ycc-pos/current/scripts/alert.sh database-error "High active connections: $active_connections"
    fi

    # Alert if total connections too high
    if [ "$total_connections" -gt 100 ]; then
        /var/www/ycc-pos/current/scripts/alert.sh database-error "High total connections: $total_connections"
    fi
}

# Monitor database size
monitor_db_size() {
    log "Monitoring database size..."

    local db_size=$(db_query "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));")
    local largest_tables=$(db_query "
        SELECT
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 5;
    ")

    log "Database size: $db_size"
    log "Largest tables:"
    echo "$largest_tables" | while read -r line; do
        if [ -n "$line" ]; then
            log "  $line"
        fi
    done
}

# Monitor slow queries
monitor_slow_queries() {
    log "Monitoring slow queries..."

    # This requires pg_stat_statements extension
    local slow_queries=$(db_query "
        SELECT
            query,
            calls,
            total_time,
            mean_time,
            rows
        FROM pg_stat_statements
        WHERE mean_time > 1000  -- queries taking more than 1 second on average
        ORDER BY mean_time DESC
        LIMIT 10;
    " 2>/dev/null || echo "")

    if [ -n "$slow_queries" ]; then
        log "${YELLOW}Slow queries detected:${NC}"
        echo "$slow_queries" | while read -r line; do
            if [ -n "$line" ]; then
                log "  $line"
            fi
        done

        # Alert if too many slow queries
        local slow_query_count=$(echo "$slow_queries" | wc -l)
        if [ "$slow_query_count" -gt 5 ]; then
            /var/www/ycc-pos/current/scripts/alert.sh database-error "Multiple slow queries detected: $slow_query_count queries > 1s"
        fi
    else
        log "${GREEN}No slow queries detected${NC}"
    fi
}

# Monitor table bloat
monitor_table_bloat() {
    log "Monitoring table bloat..."

    local bloated_tables=$(db_query "
        SELECT
            schemaname,
            tablename,
            n_dead_tup,
            n_live_tup,
            CASE WHEN n_live_tup > 0 THEN round((n_dead_tup::float / n_live_tup::float) * 100, 2) ELSE 0 END as bloat_ratio
        FROM pg_stat_user_tables
        WHERE n_dead_tup > 1000
        ORDER BY n_dead_tup DESC
        LIMIT 5;
    ")

    if [ -n "$bloated_tables" ]; then
        log "${YELLOW}Potentially bloated tables:${NC}"
        echo "$bloated_tables" | while read -r line; do
            if [ -n "$line" ]; then
                log "  $line"
            fi
        done
    else
        log "${GREEN}No significant table bloat detected${NC}"
    fi
}

# Monitor index usage
monitor_index_usage() {
    log "Monitoring index usage..."

    local unused_indexes=$(db_query "
        SELECT
            schemaname,
            tablename,
            indexname,
            idx_scan
        FROM pg_stat_user_indexes
        WHERE idx_scan = 0
        AND schemaname = 'public'
        ORDER BY tablename, indexname
        LIMIT 10;
    ")

    if [ -n "$unused_indexes" ]; then
        log "${YELLOW}Unused indexes found:${NC}"
        echo "$unused_indexes" | while read -r line; do
            if [ -n "$line" ]; then
                log "  $line"
            fi
        done
    else
        log "${GREEN}All indexes are being used${NC}"
    fi
}

# Monitor replication status (if applicable)
monitor_replication() {
    log "Monitoring replication status..."

    # Check if this is a standby server
    local is_standby=$(db_query "SELECT pg_is_in_recovery();" 2>/dev/null || echo "false")

    if [ "$is_standby" = "t" ]; then
        log "This is a standby server"

        local lag_bytes=$(db_query "SELECT pg_wal_lsn_diff(pg_last_wal_replay_lsn(), pg_last_wal_receive_lsn()) as lag_bytes;")
        local lag_mb=$(( lag_bytes / 1024 / 1024 ))

        log "Replication lag: ${lag_mb}MB"

        if [ "$lag_mb" -gt 100 ]; then
            /var/www/ycc-pos/current/scripts/alert.sh database-error "High replication lag: ${lag_mb}MB"
        fi
    else
        log "This is the primary server"
    fi
}

# Monitor locks
monitor_locks() {
    log "Monitoring database locks..."

    local blocking_locks=$(db_query "
        SELECT
            blocked_locks.pid as blocked_pid,
            blocked_activity.usename as blocked_user,
            blocking_locks.pid as blocking_pid,
            blocking_activity.usename as blocking_user,
            blocked_activity.query as blocked_query
        FROM pg_locks blocked_locks
        JOIN pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
        JOIN pg_locks blocking_locks ON blocking_locks.locktype = blocked_locks.locktype
            AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
            AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
            AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
            AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
            AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
            AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
            AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
            AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
            AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
            AND blocking_locks.pid != blocked_locks.pid
        JOIN pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
        WHERE NOT blocked_locks.granted;
    ")

    if [ -n "$blocking_locks" ]; then
        log "${RED}Blocking locks detected:${NC}"
        echo "$blocking_locks" | while read -r line; do
            if [ -n "$line" ]; then
                log "  $line"
            fi
        done

        local lock_count=$(echo "$blocking_locks" | wc -l)
        if [ "$lock_count" -gt 5 ]; then
            /var/www/ycc-pos/current/scripts/alert.sh database-error "Multiple blocking locks detected: $lock_count"
        fi
    else
        log "${GREEN}No blocking locks detected${NC}"
    fi
}

# Generate database report
generate_report() {
    log "Generating database health report..."

    local report_file="/var/log/ycc-pos/db-health-report-$(date +%Y%m%d).txt"

    {
        echo "YCC POS Database Health Report"
        echo "Generated: $(date)"
        echo "Server: $(hostname)"
        echo "Database: $DB_NAME"
        echo "========================================"
        echo ""

        echo "Connection Status:"
        db_query "SELECT version();" 2>/dev/null || echo "Connection failed"
        echo ""

        echo "Database Size:"
        db_query "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));"
        echo ""

        echo "Active Connections:"
        db_query "SELECT count(*) FROM pg_stat_activity WHERE state = 'active';"
        echo ""

        echo "Top 10 Largest Tables:"
        db_query "
            SELECT
                schemaname || '.' || tablename as table_name,
                pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
            LIMIT 10;
        "
        echo ""

        echo "Table Statistics:"
        db_query "
            SELECT
                schemaname,
                count(*) as table_count,
                sum(n_tup_ins) as total_inserts,
                sum(n_tup_upd) as total_updates,
                sum(n_tup_del) as total_deletes
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
            GROUP BY schemaname;
        "

    } > "$report_file"

    log "Database health report generated: $report_file"
}

# Main monitoring function
main() {
    log "Starting database monitoring..."

    if ! check_db_connectivity; then
        /var/www/ycc-pos/current/scripts/alert.sh database-error "Database connectivity check failed"
        exit 1
    fi

    monitor_connections
    monitor_db_size
    monitor_slow_queries
    monitor_table_bloat
    monitor_index_usage
    monitor_replication
    monitor_locks

    # Generate weekly report (on Sundays)
    if [ "$(date +%u)" = "7" ]; then
        generate_report
    fi

    log "${GREEN}Database monitoring completed${NC}"
}

# Run main function
main "$@"
