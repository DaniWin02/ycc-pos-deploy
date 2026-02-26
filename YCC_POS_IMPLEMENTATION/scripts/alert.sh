#!/bin/bash

# YCC POS Alerting System
# This script handles various alert conditions and notifications

set -e

# Configuration
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
DISCORD_WEBHOOK_URL="${DISCORD_WEBHOOK_URL:-}"
EMAIL_RECIPIENTS="${EMAIL_RECIPIENTS:-admin@yccpos.com}"
SMS_RECIPIENTS="${SMS_RECIPIENTS:-}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - ALERT: $1" >> /var/log/ycc-pos/alerts.log
    echo -e "${BLUE}[ALERT]${NC} $1"
}

# Send Slack alert
send_slack_alert() {
    local severity="$1"
    local title="$2"
    local message="$3"
    local color="$4"

    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local payload=$(cat <<EOF
{
    "attachments": [
        {
            "color": "$color",
            "title": "$title",
            "text": "$message",
            "fields": [
                {
                    "title": "Severity",
                    "value": "$severity",
                    "short": true
                },
                {
                    "title": "Server",
                    "value": "$(hostname)",
                    "short": true
                },
                {
                    "title": "Time",
                    "value": "$(date)",
                    "short": true
                }
            ],
            "footer": "YCC POS Monitoring",
            "ts": $(date +%s)
        }
    ]
}
EOF
)

        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$SLACK_WEBHOOK_URL" 2>/dev/null || log "Failed to send Slack alert"
    fi
}

# Send Discord alert
send_discord_alert() {
    local severity="$1"
    local title="$2"
    local message="$3"

    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        local color
        case "$severity" in
            "CRITICAL") color="15158332" ;;  # Red
            "WARNING") color="16776960" ;;   # Yellow
            "INFO") color="3447003" ;;       # Blue
            *) color="8421504" ;;            # Gray
        esac

        local payload=$(cat <<EOF
{
    "embeds": [
        {
            "title": "$title",
            "description": "$message",
            "color": $color,
            "fields": [
                {
                    "name": "Severity",
                    "value": "$severity",
                    "inline": true
                },
                {
                    "name": "Server",
                    "value": "$(hostname)",
                    "inline": true
                }
            ],
            "footer": {
                "text": "YCC POS Monitoring"
            },
            "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
        }
    ]
}
EOF
)

        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" \
            "$DISCORD_WEBHOOK_URL" 2>/dev/null || log "Failed to send Discord alert"
    fi
}

# Send email alert
send_email_alert() {
    local severity="$1"
    local subject="$2"
    local message="$3"

    if command -v mail &> /dev/null && [ -n "$EMAIL_RECIPIENTS" ]; then
        local body=$(cat <<EOF
YCC POS Alert - $severity

$subject

$message

Server: $(hostname)
Time: $(date)
Uptime: $(uptime)

System Status:
$(system_status)

Recent Logs:
$(tail -20 /var/log/ycc-pos/combined.log 2>/dev/null || echo "No recent logs available")

---
YCC POS Monitoring System
EOF
)

        echo "$body" | mail -s "YCC POS Alert - $severity: $subject" "$EMAIL_RECIPIENTS" || log "Failed to send email alert"
    fi
}

# Send SMS alert (requires external service like Twilio)
send_sms_alert() {
    local severity="$1"
    local message="$2"

    # This is a placeholder - implement with your SMS service
    if [ -n "$SMS_RECIPIENTS" ]; then
        log "SMS alerts not configured yet. Recipients: $SMS_RECIPIENTS"
        # Implement SMS sending logic here
        # Example with curl to SMS service API
        # curl -X POST "https://api.sms-service.com/send" \
        #     -d "to=$SMS_RECIPIENTS" \
        #     -d "message=YCC POS Alert - $severity: $message"
    fi
}

# System status function
system_status() {
    echo "CPU Usage: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')"
    echo "Memory Usage: $(free | grep Mem | awk '{printf "%.2f%%", $3/$2 * 100.0}')"
    echo "Disk Usage: $(df / | tail -1 | awk '{print $5}')"
    echo "Load Average: $(uptime | awk -F'load average:' '{ print $2 }')"
    echo "Active Connections: $(netstat -tun | grep ESTABLISHED | wc -l)"
}

# Generic alert function
send_alert() {
    local severity="$1"
    local title="$2"
    local message="$3"

    log "$severity: $title - $message"

    # Determine color based on severity
    local color
    case "$severity" in
        "CRITICAL") color="danger" ;;
        "WARNING") color="warning" ;;
        "INFO") color="good" ;;
        *) color="#808080" ;;
    esac

    # Send alerts through all configured channels
    send_slack_alert "$severity" "$title" "$message" "$color"
    send_discord_alert "$severity" "$title" "$message"
    send_email_alert "$severity" "$title" "$message"
    send_sms_alert "$severity" "$message"
}

# Specific alert types
alert_service_down() {
    local service="$1"
    send_alert "CRITICAL" "Service Down" "Service $service is not running on $(hostname)"
}

alert_high_resource_usage() {
    local resource="$1"
    local usage="$2"
    send_alert "WARNING" "High Resource Usage" "$resource usage is at ${usage}% on $(hostname)"
}

alert_backup_failure() {
    send_alert "CRITICAL" "Backup Failure" "Automated backup failed on $(hostname)"
}

alert_ssl_expiry() {
    local days="$1"
    send_alert "WARNING" "SSL Certificate Expiry" "SSL certificate expires in $days days on $(hostname)"
}

alert_database_error() {
    local error="$1"
    send_alert "CRITICAL" "Database Error" "Database error detected: $error on $(hostname)"
}

alert_api_down() {
    send_alert "CRITICAL" "API Down" "YCC POS API is not responding on $(hostname)"
}

alert_disk_space() {
    local usage="$1"
    send_alert "CRITICAL" "Disk Space Critical" "Disk usage at ${usage}% on $(hostname)"
}

# Test alerts function
test_alerts() {
    log "Testing alert system..."

    send_alert "INFO" "Alert Test" "This is a test alert from YCC POS monitoring system"
    send_alert "WARNING" "Warning Test" "This is a test warning alert"
    send_alert "CRITICAL" "Critical Test" "This is a test critical alert"

    log "Alert system test completed"
}

# Main function
case "$1" in
    "test")
        test_alerts
        ;;
    "service-down")
        alert_service_down "$2"
        ;;
    "high-resource")
        alert_high_resource_usage "$2" "$3"
        ;;
    "backup-failure")
        alert_backup_failure
        ;;
    "ssl-expiry")
        alert_ssl_expiry "$2"
        ;;
    "database-error")
        alert_database_error "$2"
        ;;
    "api-down")
        alert_api_down
        ;;
    "disk-space")
        alert_disk_space "$2"
        ;;
    *)
        echo "Usage: $0 {test|service-down|high-resource|backup-failure|ssl-expiry|database-error|api-down|disk-space}"
        echo ""
        echo "Examples:"
        echo "  $0 test"
        echo "  $0 service-down nginx"
        echo "  $0 high-resource CPU 95"
        echo "  $0 ssl-expiry 7"
        exit 1
        ;;
esac
