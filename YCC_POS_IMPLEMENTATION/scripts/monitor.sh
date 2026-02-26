#!/bin/bash

# YCC POS Infrastructure Monitoring Script
# This script monitors system resources, services, and sends alerts

set -e

# Configuration
LOG_FILE="/var/log/ycc-pos/monitoring.log"
ALERT_EMAIL="admin@yccpos.com"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
    echo -e "$1"
}

# Alert function
send_alert() {
    local severity="$1"
    local message="$2"
    local details="$3"

    log "${RED}[ALERT $severity] $message${NC}"

    # Send email alert
    if command -v mail &> /dev/null; then
        echo "YCC POS Alert - $severity
$message

Details: $details

Server: $(hostname)
Time: $(date)
Uptime: $(uptime)

System Status:
$(system_status)" | mail -s "YCC POS Alert - $severity" "$ALERT_EMAIL"
    fi

    # Send Slack alert
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 YCC POS Alert - $severity\\n$message\\nDetails: $details\"}" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
}

# System status function
system_status() {
    echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')"
    echo "Memory Usage: $(free | grep Mem | awk '{printf "%.2f%%", $3/$2 * 100.0}')"
    echo "Disk Usage: $(df / | tail -1 | awk '{print $5}')"
    echo "Load Average: $(uptime | awk -F'load average:' '{ print $2 }')"
}

# Check system resources
check_system_resources() {
    log "Checking system resources..."

    # CPU usage check
    CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
    if (( $(echo "$CPU_USAGE > 90" | bc -l) )); then
        send_alert "CRITICAL" "High CPU usage detected" "CPU usage: ${CPU_USAGE}%"
    elif (( $(echo "$CPU_USAGE > 75" | bc -l) )); then
        send_alert "WARNING" "High CPU usage detected" "CPU usage: ${CPU_USAGE}%"
    fi

    # Memory usage check
    MEM_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
    if (( $(echo "$MEM_USAGE > 90" | bc -l) )); then
        send_alert "CRITICAL" "High memory usage detected" "Memory usage: ${MEM_USAGE}%"
    elif (( $(echo "$MEM_USAGE > 80" | bc -l) )); then
        send_alert "WARNING" "High memory usage detected" "Memory usage: ${MEM_USAGE}%"
    fi

    # Disk usage check
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        send_alert "CRITICAL" "High disk usage detected" "Disk usage: ${DISK_USAGE}%"
    elif [ "$DISK_USAGE" -gt 80 ]; then
        send_alert "WARNING" "High disk usage detected" "Disk usage: ${DISK_USAGE}%"
    fi

    log "${GREEN}System resources check completed${NC}"
}

# Check services status
check_services() {
    log "Checking services status..."

    # Check PostgreSQL
    if systemctl is-active --quiet postgresql; then
        log "${GREEN}PostgreSQL is running${NC}"
    else
        send_alert "CRITICAL" "PostgreSQL service is down" "PostgreSQL service is not running"
    fi

    # Check Redis
    if systemctl is-active --quiet redis-server; then
        log "${GREEN}Redis is running${NC}"
    else
        send_alert "CRITICAL" "Redis service is down" "Redis service is not running"
    fi

    # Check Nginx
    if systemctl is-active --quiet nginx; then
        log "${GREEN}Nginx is running${NC}"
    else
        send_alert "CRITICAL" "Nginx service is down" "Nginx service is not running"
    fi

    # Check PM2
    if pm2 list &>/dev/null; then
        PM2_STATUS=$(pm2 list | grep -E "(ycc-pos-api|online|stopped|errored)" | wc -l)
        if [ "$PM2_STATUS" -gt 0 ]; then
            log "${GREEN}PM2 processes are running${NC}"
        else
            send_alert "CRITICAL" "PM2 processes are not running" "No active PM2 processes found"
        fi
    else
        send_alert "CRITICAL" "PM2 is not available" "PM2 command failed"
    fi
}

# Check application health
check_application_health() {
    log "Checking application health..."

    # Check API health
    if curl -f -s http://localhost:3001/health > /dev/null; then
        log "${GREEN}API health check passed${NC}"
    else
        send_alert "CRITICAL" "API health check failed" "API is not responding on port 3001"
    fi

    # Check database connection through API
    if curl -f -s "http://localhost:3001/health" | grep -q '"status":"healthy"'; then
        log "${GREEN}Database connection is healthy${NC}"
    else
        send_alert "CRITICAL" "Database connection failed" "API reports unhealthy database connection"
    fi

    # Check frontend accessibility
    if curl -f -s -I http://localhost:3000 | grep -q "200 OK"; then
        log "${GREEN}POS frontend is accessible${NC}"
    else
        send_alert "WARNING" "POS frontend is not accessible" "Frontend not responding on port 3000"
    fi

    if curl -f -s -I http://localhost:3002 | grep -q "200 OK"; then
        log "${GREEN}KDS frontend is accessible${NC}"
    else
        send_alert "WARNING" "KDS frontend is not accessible" "Frontend not responding on port 3002"
    fi

    if curl -f -s -I http://localhost:3003 | grep -q "200 OK"; then
        log "${GREEN}Admin frontend is accessible${NC}"
    else
        send_alert "WARNING" "Admin frontend is not accessible" "Frontend not responding on port 3003"
    fi
}

# Check backup status
check_backups() {
    log "Checking backup status..."

    BACKUP_DIR="/var/backups/ycc-pos"
    LAST_BACKUP=$(find "$BACKUP_DIR" -name "*.sql" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)

    if [ -n "$LAST_BACKUP" ]; then
        LAST_BACKUP_TIME=$(stat -c %Y "$LAST_BACKUP")
        CURRENT_TIME=$(date +%s)
        HOURS_SINCE_BACKUP=$(( (CURRENT_TIME - LAST_BACKUP_TIME) / 3600 ))

        if [ "$HOURS_SINCE_BACKUP" -gt 24 ]; then
            send_alert "WARNING" "Backup is outdated" "Last backup was $HOURS_SINCE_BACKUP hours ago"
        else
            log "${GREEN}Backup is recent (${HOURS_SINCE_BACKUP} hours ago)${NC}"
        fi
    else
        send_alert "CRITICAL" "No backups found" "No database backups found in $BACKUP_DIR"
    fi
}

# Check SSL certificates
check_ssl_certificates() {
    log "Checking SSL certificates..."

    if command -v certbot &> /dev/null; then
        # Check certificate expiry (if using Let's Encrypt)
        CERT_EXPIRY=$(certbot certificates 2>/dev/null | grep -A 2 "Certificate Name:" | grep "Expiry Date:" | head -1 | cut -d: -f2- | xargs)

        if [ -n "$CERT_EXPIRY" ]; then
            EXPIRY_TIMESTAMP=$(date -d "$CERT_EXPIRY" +%s)
            CURRENT_TIMESTAMP=$(date +%s)
            DAYS_LEFT=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))

            if [ "$DAYS_LEFT" -lt 7 ]; then
                send_alert "CRITICAL" "SSL certificate expires soon" "Certificate expires in $DAYS_LEFT days"
            elif [ "$DAYS_LEFT" -lt 30 ]; then
                send_alert "WARNING" "SSL certificate expires soon" "Certificate expires in $DAYS_LEFT days"
            else
                log "${GREEN}SSL certificate is valid (${DAYS_LEFT} days remaining)${NC}"
            fi
        fi
    fi
}

# Check log files for errors
check_logs() {
    log "Checking log files for errors..."

    LOG_FILES=(
        "/var/log/ycc-pos/combined.log"
        "/var/log/nginx/error.log"
        "/var/log/postgresql/postgresql-16-main.log"
    )

    for log_file in "${LOG_FILES[@]}"; do
        if [ -f "$log_file" ]; then
            # Count recent errors (last hour)
            RECENT_ERRORS=$(grep -c "ERROR\|CRITICAL\|FATAL" "$log_file" 2>/dev/null || echo "0")

            if [ "$RECENT_ERRORS" -gt 10 ]; then
                send_alert "WARNING" "High error rate in logs" "Found $RECENT_ERRORS errors in $log_file in the last hour"
            fi
        fi
    done
}

# Performance metrics
collect_performance_metrics() {
    log "Collecting performance metrics..."

    # API response times (if available)
    if command -v curl &> /dev/null; then
        API_RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:3001/health 2>/dev/null || echo "0")
        if (( $(echo "$API_RESPONSE_TIME > 5.0" | bc -l 2>/dev/null) )); then
            send_alert "WARNING" "Slow API response" "API health check took ${API_RESPONSE_TIME}s"
        fi
    fi

    # Database query performance
    # This would require more sophisticated monitoring tools like pg_stat_statements
    log "${GREEN}Performance metrics collected${NC}"
}

# Main monitoring function
main() {
    log "${YELLOW}Starting YCC POS monitoring check...${NC}"

    check_system_resources
    check_services
    check_application_health
    check_backups
    check_ssl_certificates
    check_logs
    collect_performance_metrics

    log "${GREEN}YCC POS monitoring check completed${NC}"
}

# Run main function
main "$@"
