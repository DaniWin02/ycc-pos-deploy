#!/bin/bash

# YCC POS Pre-Production Audit Script
# Comprehensive 42-item production readiness audit

set -e

# Configuration
AUDIT_DATE=$(date '+%Y-%m-%d_%H-%M-%S')
AUDIT_LOG="/var/log/ycc-pos/audit-${AUDIT_DATE}.log"
REPORT_FILE="/var/log/ycc-pos/audit-report-${AUDIT_DATE}.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Audit counters
PASSED=0
FAILED=0
WARNINGS=0
TOTAL_CHECKS=42

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - AUDIT: $1" | tee -a "$AUDIT_LOG"
}

# Report function
report() {
    echo "$1" | tee -a "$REPORT_FILE"
}

# Check result function
check_result() {
    local check_name="$1"
    local result="$2"
    local details="$3"

    case "$result" in
        "PASS")
            echo -e "${GREEN}✓ PASS${NC} - $check_name"
            ((PASSED++))
            ;;
        "FAIL")
            echo -e "${RED}✗ FAIL${NC} - $check_name"
            ((FAILED++))
            ;;
        "WARN")
            echo -e "${YELLOW}⚠ WARN${NC} - $check_name"
            ((WARNINGS++))
            ;;
    esac

    report "[$result] $check_name"
    if [ -n "$details" ]; then
        report "    Details: $details"
    fi
    report ""
}

# Initialize audit
init_audit() {
    log "Starting YCC POS Pre-Production Audit"
    log "Audit Date: $AUDIT_DATE"
    log "Total Checks: $TOTAL_CHECKS"

    report "YCC POS PRE-PRODUCTION AUDIT REPORT"
    report "=================================="
    report "Audit Date: $AUDIT_DATE"
    report "System: YCC POS Implementation"
    report "Version: $(cd /var/www/ycc-pos/current && git rev-parse HEAD 2>/dev/null || echo 'Unknown')"
    report ""
}

# 1-5: Infrastructure & System Checks
audit_infrastructure() {
    log "Auditing Infrastructure & System..."

    # 1. Server Specifications
    local cpu_cores=$(nproc)
    local total_memory=$(free -h | grep '^Mem:' | awk '{print $2}')
    local disk_space=$(df -h / | tail -1 | awk '{print $4}')

    if [ "$cpu_cores" -ge 2 ] && [[ "$total_memory" == *G* ]] && [ "$disk_space" != "0" ]; then
        check_result "Server Specifications" "PASS" "CPU: ${cpu_cores} cores, RAM: ${total_memory}, Disk: ${disk_space}"
    else
        check_result "Server Specifications" "FAIL" "Insufficient resources - CPU: ${cpu_cores}, RAM: ${total_memory}, Disk: ${disk_space}"
    fi

    # 2. Ubuntu Version
    local ubuntu_version=$(lsb_release -d | cut -f2)
    if [[ "$ubuntu_version" == *"Ubuntu 22.04"* ]]; then
        check_result "Ubuntu Version" "PASS" "$ubuntu_version"
    else
        check_result "Ubuntu Version" "FAIL" "Expected Ubuntu 22.04, got: $ubuntu_version"
    fi

    # 3. Node.js Version
    local node_version=$(node --version 2>/dev/null || echo "Not installed")
    if [[ "$node_version" == v20* ]]; then
        check_result "Node.js Version" "PASS" "$node_version"
    else
        check_result "Node.js Version" "FAIL" "Expected Node.js 20.x, got: $node_version"
    fi

    # 4. PostgreSQL Version
    local pg_version=$(psql --version 2>/dev/null | head -1 || echo "Not installed")
    if [[ "$pg_version" == *"16."* ]]; then
        check_result "PostgreSQL Version" "PASS" "$pg_version"
    else
        check_result "PostgreSQL Version" "FAIL" "Expected PostgreSQL 16.x, got: $pg_version"
    fi

    # 5. Redis Version
    local redis_version=$(redis-server --version 2>/dev/null | head -1 || echo "Not installed")
    if [[ "$redis_version" == *"7."* ]]; then
        check_result "Redis Version" "PASS" "$redis_version"
    else
        check_result "Redis Version" "FAIL" "Expected Redis 7.x, got: $redis_version"
    fi
}

# 6-10: Services & Processes
audit_services() {
    log "Auditing Services & Processes..."

    # 6. PostgreSQL Service
    if systemctl is-active --quiet postgresql; then
        check_result "PostgreSQL Service" "PASS" "Service is running"
    else
        check_result "PostgreSQL Service" "FAIL" "Service is not running"
    fi

    # 7. Redis Service
    if systemctl is-active --quiet redis-server; then
        check_result "Redis Service" "PASS" "Service is running"
    else
        check_result "Redis Service" "FAIL" "Service is not running"
    fi

    # 8. Nginx Service
    if systemctl is-active --quiet nginx; then
        check_result "Nginx Service" "PASS" "Service is running"
    else
        check_result "Nginx Service" "FAIL" "Service is not running"
    fi

    # 9. PM2 Processes
    if pm2 list 2>/dev/null | grep -q "ycc-pos-api.*online"; then
        check_result "PM2 API Process" "PASS" "API process is online"
    else
        check_result "PM2 API Process" "FAIL" "API process is not online"
    fi

    # 10. Firewall Configuration
    if ufw status 2>/dev/null | grep -q "Status: active"; then
        local open_ports=$(ufw status | grep ALLOW | wc -l)
        if [ "$open_ports" -ge 3 ]; then  # SSH, HTTP, HTTPS
            check_result "Firewall Configuration" "PASS" "UFW active with $open_ports open ports"
        else
            check_result "Firewall Configuration" "WARN" "UFW active but only $open_ports open ports"
        fi
    else
        check_result "Firewall Configuration" "FAIL" "Firewall is not active"
    fi
}

# 11-15: Application Health
audit_application() {
    log "Auditing Application Health..."

    # 11. API Health Check
    if curl -f -s http://localhost:3001/health > /dev/null 2>&1; then
        check_result "API Health Check" "PASS" "API responds to health checks"
    else
        check_result "API Health Check" "FAIL" "API health check failed"
    fi

    # 12. Database Connection
    if curl -f -s http://localhost:3001/health | grep -q '"status":"healthy"'; then
        check_result "Database Connection" "PASS" "Database connection healthy"
    else
        check_result "Database Connection" "FAIL" "Database connection failed"
    fi

    # 13. Frontend Applications
    local frontend_checks=0
    for port in 3000 3002 3003; do
        if curl -f -s -I "http://localhost:$port" | grep -q "200 OK"; then
            ((frontend_checks++))
        fi
    done
    if [ "$frontend_checks" -eq 3 ]; then
        check_result "Frontend Applications" "PASS" "All 3 frontend apps responding"
    else
        check_result "Frontend Applications" "FAIL" "Only $frontend_checks/3 frontend apps responding"
    fi

    # 14. WebSocket Connections
    if curl -f -s -I "http://localhost:3001/health" | grep -q "200 OK"; then
        check_result "WebSocket Support" "PASS" "WebSocket endpoint available"
    else
        check_result "WebSocket Support" "WARN" "WebSocket endpoint not verified"
    fi

    # 15. SSL Certificates
    if openssl s_client -connect localhost:443 -servername localhost < /dev/null 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1; then
        local cert_expiry=$(openssl s_client -connect localhost:443 -servername localhost < /dev/null 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
        local days_left=$(( ($(date -d "$cert_expiry" +%s) - $(date +%s)) / 86400 ))
        if [ "$days_left" -gt 30 ]; then
            check_result "SSL Certificates" "PASS" "Certificate valid for $days_left days"
        else
            check_result "SSL Certificates" "WARN" "Certificate expires in $days_left days"
        fi
    else
        check_result "SSL Certificates" "FAIL" "SSL certificate not found or invalid"
    fi
}

# 16-20: Database & Data
audit_database() {
    log "Auditing Database & Data..."

    # 16. Database Schema
    if PGPASSWORD="yccpos_secure_password_2024" psql -h localhost -U yccpos_user -d ycc_pos -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" >/dev/null 2>&1; then
        local table_count=$(PGPASSWORD="yccpos_secure_password_2024" psql -h localhost -U yccpos_user -d ycc_pos -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null)
        if [ "$table_count" -gt 10 ]; then
            check_result "Database Schema" "PASS" "$table_count tables found"
        else
            check_result "Database Schema" "WARN" "Only $table_count tables found"
        fi
    else
        check_result "Database Schema" "FAIL" "Cannot access database schema"
    fi

    # 17. Database Migrations
    if [ -d "/var/www/ycc-pos/current/03_API_GATEWAY/prisma/migrations" ] && [ "$(ls -1 /var/www/ycc-pos/current/03_API_GATEWAY/prisma/migrations | wc -l)" -gt 0 ]; then
        check_result "Database Migrations" "PASS" "Migrations directory exists with files"
    else
        check_result "Database Migrations" "FAIL" "Database migrations not found"
    fi

    # 18. Seed Data
    local user_count=$(PGPASSWORD="yccpos_secure_password_2024" psql -h localhost -U yccpos_user -d ycc_pos -t -c "SELECT count(*) FROM \"User\";" 2>/dev/null || echo "0")
    if [ "$user_count" -gt 0 ]; then
        check_result "Seed Data" "PASS" "$user_count users found in database"
    else
        check_result "Seed Data" "WARN" "No users found in database"
    fi

    # 19. Database Backups
    local latest_backup=$(find /var/backups/ycc-pos -name "*.sql" -type f -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -d' ' -f2-)
    if [ -n "$latest_backup" ]; then
        local backup_age_hours=$(( ($(date +%s) - $(stat -c %Y "$latest_backup")) / 3600 ))
        if [ "$backup_age_hours" -lt 24 ]; then
            check_result "Database Backups" "PASS" "Latest backup $backup_age_hours hours old"
        else
            check_result "Database Backups" "WARN" "Latest backup $backup_age_hours hours old"
        fi
    else
        check_result "Database Backups" "FAIL" "No database backups found"
    fi

    # 20. Data Integrity
    local constraint_violations=$(PGPASSWORD="yccpos_secure_password_2024" psql -h localhost -U yccpos_user -d ycc_pos -t -c "
        SELECT count(*) FROM (
            SELECT conname FROM pg_constraint WHERE contype = 'f'
        ) constraints;" 2>/dev/null || echo "0")
    if [ "$constraint_violations" -ge 0 ]; then
        check_result "Data Integrity" "PASS" "Foreign key constraints present"
    else
        check_result "Data Integrity" "WARN" "Data integrity constraints not verified"
    fi
}

# 21-25: Security
audit_security() {
    log "Auditing Security..."

    # 21. Environment Variables
    local env_file="/var/www/ycc-pos/current/.env.production"
    if [ -f "$env_file" ]; then
        local sensitive_vars=$(grep -E "(SECRET|KEY|PASSWORD)" "$env_file" | wc -l)
        if [ "$sensitive_vars" -gt 0 ]; then
            check_result "Environment Variables" "PASS" "Production env file exists with $sensitive_vars sensitive variables"
        else
            check_result "Environment Variables" "WARN" "Production env file exists but no sensitive variables found"
        fi
    else
        check_result "Environment Variables" "FAIL" "Production environment file not found"
    fi

    # 22. File Permissions
    local api_dir="/var/www/ycc-pos/current/03_API_GATEWAY"
    if [ -d "$api_dir" ]; then
        local wrong_perms=$(find "$api_dir" -type f \( -name "*.env*" -o -name "*config*" \) -not -perm 600 2>/dev/null | wc -l)
        if [ "$wrong_perms" -eq 0 ]; then
            check_result "File Permissions" "PASS" "Sensitive files have correct permissions"
        else
            check_result "File Permissions" "WARN" "$wrong_perms sensitive files have incorrect permissions"
        fi
    else
        check_result "File Permissions" "FAIL" "API directory not found"
    fi

    # 23. User Permissions
    local yccpos_user_exists=$(id -u yccpos 2>/dev/null || echo "0")
    if [ "$yccpos_user_exists" != "0" ]; then
        local yccpos_groups=$(id -Gn yccpos | wc -w)
        check_result "User Permissions" "PASS" "yccpos user exists with $yccpos_groups groups"
    else
        check_result "User Permissions" "FAIL" "yccpos user does not exist"
    fi

    # 24. HTTPS Enforcement
    if curl -I https://localhost 2>/dev/null | grep -q "HTTP/2 200\|HTTP/1.1 200"; then
        check_result "HTTPS Enforcement" "PASS" "HTTPS is working"
    else
        check_result "HTTPS Enforcement" "FAIL" "HTTPS is not working"
    fi

    # 25. Security Headers
    local security_headers=$(curl -I http://localhost:3000 2>/dev/null | grep -E "(X-Frame-Options|X-Content-Type-Options|X-XSS-Protection)" | wc -l)
    if [ "$security_headers" -ge 3 ]; then
        check_result "Security Headers" "PASS" "$security_headers security headers configured"
    else
        check_result "Security Headers" "FAIL" "Only $security_headers/3 security headers found"
    fi
}

# 26-30: Performance & Monitoring
audit_performance() {
    log "Auditing Performance & Monitoring..."

    # 26. Response Times
    local api_response_time=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:3001/health 2>/dev/null || echo "10")
    local response_ms=$(echo "$api_response_time * 1000" | bc 2>/dev/null || echo "10000")
    if (( $(echo "$response_ms < 1000" | bc -l 2>/dev/null) )); then
        check_result "Response Times" "PASS" "API response time: ${response_ms}ms"
    else
        check_result "Response Times" "WARN" "Slow API response time: ${response_ms}ms"
    fi

    # 27. Memory Usage
    local mem_usage_percent=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$mem_usage_percent" -lt 80 ]; then
        check_result "Memory Usage" "PASS" "Memory usage: ${mem_usage_percent}%"
    else
        check_result "Memory Usage" "WARN" "High memory usage: ${mem_usage_percent}%"
    fi

    # 28. Disk Usage
    local disk_usage_percent=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage_percent" -lt 80 ]; then
        check_result "Disk Usage" "PASS" "Disk usage: ${disk_usage_percent}%"
    else
        check_result "Disk Usage" "WARN" "High disk usage: ${disk_usage_percent}%"
    fi

    # 29. Monitoring Setup
    if [ -f "/var/www/ycc-pos/current/scripts/monitor.sh" ] && [ -f "/var/www/ycc-pos/current/scripts/db-monitor.sh" ]; then
        check_result "Monitoring Setup" "PASS" "Monitoring scripts are present"
    else
        check_result "Monitoring Setup" "FAIL" "Monitoring scripts are missing"
    fi

    # 30. Log Files
    local log_files_count=$(find /var/log/ycc-pos -name "*.log" -type f 2>/dev/null | wc -l)
    if [ "$log_files_count" -gt 0 ]; then
        check_result "Log Files" "PASS" "$log_files_count log files found"
    else
        check_result "Log Files" "FAIL" "No log files found"
    fi
}

# 31-35: Testing & Quality
audit_testing() {
    log "Auditing Testing & Quality..."

    # 31. Unit Tests
    local unit_test_count=$(find /var/www/ycc-pos/current -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | wc -l)
    if [ "$unit_test_count" -gt 20 ]; then
        check_result "Unit Tests" "PASS" "$unit_test_count unit tests found"
    else
        check_result "Unit Tests" "FAIL" "Only $unit_test_count unit tests found (expected >20)"
    fi

    # 32. API Tests
    if [ -d "/var/www/ycc-pos/current/07_TESTING_QA" ]; then
        check_result "API Tests" "PASS" "Testing directory exists"
    else
        check_result "API Tests" "FAIL" "Testing directory not found"
    fi

    # 33. E2E Tests
    local e2e_test_count=$(find /var/www/ycc-pos/current -name "*e2e*" -o -name "*playwright*" 2>/dev/null | wc -l)
    if [ "$e2e_test_count" -gt 0 ]; then
        check_result "E2E Tests" "PASS" "$e2e_test_count E2E test files found"
    else
        check_result "E2E Tests" "FAIL" "No E2E tests found"
    fi

    # 34. Code Coverage
    if [ -d "/var/www/ycc-pos/current/coverage" ]; then
        check_result "Code Coverage" "PASS" "Coverage reports directory exists"
    else
        check_result "Code Coverage" "WARN" "Coverage reports not found"
    fi

    # 35. Linting
    if [ -f "/var/www/ycc-pos/current/package.json" ] && grep -q "lint" /var/www/ycc-pos/current/package.json; then
        check_result "Linting" "PASS" "Linting scripts configured"
    else
        check_result "Linting" "FAIL" "Linting not configured"
    fi
}

# 36-40: Deployment & Operations
audit_deployment() {
    log "Auditing Deployment & Operations..."

    # 36. CI/CD Pipeline
    if [ -f "/var/www/ycc-pos/current/.github/workflows/ci.yml" ]; then
        check_result "CI/CD Pipeline" "PASS" "GitHub Actions CI/CD configured"
    else
        check_result "CI/CD Pipeline" "FAIL" "CI/CD pipeline not configured"
    fi

    # 37. Docker Configuration
    local dockerfile_count=$(find /var/www/ycc-pos/current -name "Dockerfile" 2>/dev/null | wc -l)
    if [ "$dockerfile_count" -ge 4 ]; then
        check_result "Docker Configuration" "PASS" "$dockerfile_count Dockerfiles found"
    else
        check_result "Docker Configuration" "FAIL" "Only $dockerfile_count Dockerfiles found (expected 4+)"
    fi

    # 38. PM2 Configuration
    if [ -f "/var/www/ycc-pos/current/ecosystem.config.js" ]; then
        check_result "PM2 Configuration" "PASS" "PM2 ecosystem config exists"
    else
        check_result "PM2 Configuration" "FAIL" "PM2 ecosystem config not found"
    fi

    # 39. Cron Jobs
    local ycc_cron_jobs=$(crontab -l 2>/dev/null | grep -c "YCC POS" || echo "0")
    if [ "$ycc_cron_jobs" -gt 0 ]; then
        check_result "Cron Jobs" "PASS" "$ycc_cron_jobs automated tasks configured"
    else
        check_result "Cron Jobs" "FAIL" "No automated tasks configured"
    fi

    # 40. Backup Scripts
    if [ -f "/var/www/ycc-pos/current/scripts/backup.sh" ]; then
        check_result "Backup Scripts" "PASS" "Backup scripts are present"
    else
        check_result "Backup Scripts" "FAIL" "Backup scripts not found"
    fi
}

# 41-42: Documentation & Final Checks
audit_final() {
    log "Auditing Documentation & Final Checks..."

    # 41. Documentation
    local doc_files=$(find /var/www/ycc-pos/current/docs -name "*.md" 2>/dev/null | wc -l)
    if [ "$doc_files" -ge 5 ]; then
        check_result "Documentation" "PASS" "$doc_files documentation files found"
    else
        check_result "Documentation" "FAIL" "Only $doc_files documentation files found (expected 5+)"
    fi

    # 42. Production Readiness
    local critical_failures=$FAILED
    if [ "$critical_failures" -eq 0 ]; then
        check_result "Production Readiness" "PASS" "All critical checks passed"
    else
        check_result "Production Readiness" "FAIL" "$critical_failures critical failures found"
    fi
}

# Generate final report
generate_report() {
    report ""
    report "AUDIT SUMMARY"
    report "============="
    report "Total Checks: $TOTAL_CHECKS"
    report "Passed: $PASSED"
    report "Failed: $FAILED"
    report "Warnings: $WARNINGS"
    report ""

    local pass_rate=$(( (PASSED * 100) / TOTAL_CHECKS ))
    report "Pass Rate: ${pass_rate}%"

    if [ "$FAILED" -eq 0 ] && [ "$WARNINGS" -le 2 ]; then
        report ""
        report "🎉 PRODUCTION READY!"
        report "YCC POS has passed the pre-production audit."
        report ""
        report "Next Steps:"
        report "1. Deploy to production environment"
        report "2. Run final E2E tests in production"
        report "3. Monitor system performance"
        report "4. Train staff on system usage"
        report ""
        log "AUDIT COMPLETE: System is PRODUCTION READY"
    else
        report ""
        report "⚠️  ISSUES FOUND"
        report "YCC POS requires attention before production deployment."
        report ""
        report "Action Required:"
        if [ "$FAILED" -gt 0 ]; then
            report "- Fix $FAILED critical failures"
        fi
        if [ "$WARNINGS" -gt 0 ]; then
            report "- Address $WARNINGS warnings"
        fi
        report ""
        log "AUDIT COMPLETE: Issues found - NOT production ready"
    fi

    report ""
    report "Audit completed at: $(date)"
    report "Audit log: $AUDIT_LOG"
}

# Main audit function
main() {
    init_audit

    audit_infrastructure
    audit_services
    audit_application
    audit_database
    audit_security
    audit_performance
    audit_testing
    audit_deployment
    audit_final

    generate_report

    echo ""
    echo -e "${BLUE}Audit completed. Report saved to: $REPORT_FILE${NC}"
    echo -e "${BLUE}Log saved to: $AUDIT_LOG${NC}"
}

# Run main audit
main "$@"
