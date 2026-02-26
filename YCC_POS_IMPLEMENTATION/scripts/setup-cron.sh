#!/bin/bash

# YCC POS Cron Jobs Setup Script
# Sets up automated monitoring, backups, and maintenance tasks

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Setting up YCC POS cron jobs...${NC}"

# Create cron jobs for monitoring
setup_monitoring_cron() {
    echo "Setting up monitoring cron jobs..."

    # Create temporary cron file
    crontab -l 2>/dev/null > /tmp/current_cron || touch /tmp/current_cron

    # Remove existing YCC POS cron jobs
    sed -i '/# YCC POS/d' /tmp/current_cron

    # Add new monitoring cron jobs
    cat >> /tmp/current_cron << 'EOF'

# YCC POS Monitoring Jobs
# Run system monitoring every 5 minutes
*/5 * * * * /var/www/ycc-pos/current/scripts/monitor.sh

# Run database monitoring every 10 minutes
*/10 * * * * /var/www/ycc-pos/current/scripts/db-monitor.sh

# Check SSL certificates daily at 2 AM
0 2 * * * /var/www/ycc-pos/current/scripts/setup-ssl.sh check

# Database backup every 6 hours
0 */6 * * * /var/www/ycc-pos/current/scripts/backup.sh

# Log rotation daily at 3 AM
0 3 * * * /var/log/ycc-pos/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 yccpos yccpos
}

# Clean up old backups weekly (Sundays at 4 AM)
0 4 * * 0 /var/www/ycc-pos/current/scripts/cleanup.sh

# Performance monitoring every minute
* * * * * /var/www/ycc-pos/current/scripts/performance-check.sh

# PM2 process monitoring every 2 minutes
*/2 * * * * pm2 list | grep -q "ycc-pos-api" || pm2 restart ycc-pos-api
EOF

    # Install new cron jobs
    crontab /tmp/current_cron
    rm /tmp/current_cron

    echo -e "${GREEN}Monitoring cron jobs installed${NC}"
}

# Create performance check script
create_performance_script() {
    echo "Creating performance check script..."

    cat > /var/www/ycc-pos/current/scripts/performance-check.sh << 'EOF'
#!/bin/bash

# YCC POS Performance Check Script
# Quick performance monitoring for critical metrics

API_URL="http://localhost:3001"
LOG_FILE="/var/log/ycc-pos/performance.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - PERF: $1" >> "$LOG_FILE"
}

# Check API response time
check_api_performance() {
    local start_time=$(date +%s%N)
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds

    if [ "$response_code" -eq 200 ]; then
        log "API response time: ${response_time}ms"

        # Alert if response time > 2000ms
        if [ "$response_time" -gt 2000 ]; then
            /var/www/ycc-pos/current/scripts/alert.sh database-error "Slow API response: ${response_time}ms"
        fi
    else
        log "API health check failed: HTTP $response_code"
        /var/www/ycc-pos/current/scripts/alert.sh api-down "API health check failed: HTTP $response_code"
    fi
}

# Check database connection pool
check_db_pool() {
    # This would require a more sophisticated check
    # For now, just check if we can connect
    if PGPASSWORD="yccpos_secure_password_2024" psql -h localhost -U yccpos_user -d ycc_pos -c "SELECT 1;" >/dev/null 2>&1; then
        log "Database connection OK"
    else
        log "Database connection failed"
        /var/www/ycc-pos/current/scripts/alert.sh database-error "Database connection pool exhausted"
    fi
}

# Check memory usage
check_memory() {
    local mem_usage=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')

    if (( $(echo "$mem_usage > 85" | bc -l) )); then
        /var/www/ycc-pos/current/scripts/alert.sh high-resource "Memory usage: ${mem_usage}%"
    fi

    log "Memory usage: ${mem_usage}%"
}

# Run checks
check_api_performance
check_db_pool
check_memory
EOF

    chmod +x /var/www/ycc-pos/current/scripts/performance-check.sh
    echo -e "${GREEN}Performance check script created${NC}"
}

# Create cleanup script
create_cleanup_script() {
    echo "Creating cleanup script..."

    cat > /var/www/ycc-pos/current/scripts/cleanup.sh << 'EOF'
#!/bin/bash

# YCC POS Cleanup Script
# Cleans up old logs, backups, and temporary files

LOG_FILE="/var/log/ycc-pos/cleanup.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - CLEANUP: $1" >> "$LOG_FILE"
}

log "Starting cleanup process..."

# Clean old PM2 logs (keep last 7 days)
find /var/log/ycc-pos -name "pm2-*.log" -type f -mtime +7 -delete 2>/dev/null || true
log "Cleaned old PM2 logs"

# Clean old API logs (keep last 30 days)
find /var/log/ycc-pos -name "api-*.log" -type f -mtime +30 -delete 2>/dev/null || true
log "Cleaned old API logs"

# Clean old database monitoring reports (keep last 90 days)
find /var/log/ycc-pos -name "db-health-report-*.txt" -type f -mtime +90 -delete 2>/dev/null || true
log "Cleaned old database reports"

# Clean old backups (keep last 30)
cd /var/backups/ycc-pos
ls -t *.sql 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true
ls -t files_backup_* 2>/dev/null | tail -n +31 | xargs rm -f 2>/dev/null || true
log "Cleaned old backups"

# Clean old deployment directories (keep last 10)
cd /var/www/ycc-pos
ls -td deploy_* 2>/dev/null | tail -n +11 | xargs rm -rf 2>/dev/null || true
log "Cleaned old deployments"

# Clean Docker images (keep last 5 versions per image)
docker images ycc-pos/* --format "table {{.Repository}}:{{.Tag}}\t{{.ID}}" | tail -n +2 | head -n -5 | awk '{print $2}' | xargs docker rmi 2>/dev/null || true
log "Cleaned old Docker images"

log "Cleanup completed"
EOF

    chmod +x /var/www/ycc-pos/current/scripts/cleanup.sh
    echo -e "${GREEN}Cleanup script created${NC}"
}

# Create logrotate configuration
setup_logrotate() {
    echo "Setting up logrotate configuration..."

    cat > /etc/logrotate.d/ycc-pos << 'EOF'
/var/log/ycc-pos/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 yccpos yccpos
    postrotate
        pm2 reloadLogs
    endscript
}
EOF

    echo -e "${GREEN}Logrotate configuration created${NC}"
}

# Create systemd service for monitoring (optional)
create_monitoring_service() {
    echo "Creating systemd monitoring service..."

    cat > /etc/systemd/system/ycc-pos-monitor.service << 'EOF'
[Unit]
Description=YCC POS Monitoring Service
After=network.target postgresql.service redis-server.service

[Service]
Type=simple
User=yccpos
Group=yccpos
ExecStart=/var/www/ycc-pos/current/scripts/monitor.sh
Restart=always
RestartSec=60
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable ycc-pos-monitor.service
    systemctl start ycc-pos-monitor.service

    echo -e "${GREEN}Monitoring systemd service created and started${NC}"
}

# Main setup function
main() {
    echo -e "${YELLOW}Setting up YCC POS automated tasks...${NC}"

    # Create necessary directories
    mkdir -p /var/log/ycc-pos
    mkdir -p /var/run/ycc-pos
    chown -R yccpos:yccpos /var/log/ycc-pos /var/run/ycc-pos

    # Setup cron jobs
    setup_monitoring_cron

    # Create monitoring scripts
    create_performance_script
    create_cleanup_script

    # Setup log rotation
    setup_logrotate

    # Optional: Create systemd monitoring service
    read -p "Do you want to create a systemd monitoring service? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        create_monitoring_service
    fi

    echo -e "${GREEN}YCC POS cron jobs and monitoring setup completed!${NC}"
    echo ""
    echo "Active cron jobs:"
    crontab -l | grep "YCC POS"
    echo ""
    echo "Monitoring scripts available:"
    echo "  /var/www/ycc-pos/current/scripts/monitor.sh"
    echo "  /var/www/ycc-pos/current/scripts/db-monitor.sh"
    echo "  /var/www/ycc-pos/current/scripts/performance-check.sh"
    echo "  /var/www/ycc-pos/current/scripts/cleanup.sh"
}

# Run main function
main "$@"
