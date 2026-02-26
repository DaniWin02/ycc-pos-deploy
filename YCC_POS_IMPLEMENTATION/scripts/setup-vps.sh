#!/bin/bash

# YCC POS VPS Setup Script
# This script sets up a Ubuntu 22.04 LTS VPS for YCC POS deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/var/www/ycc-pos"
POSTGRES_DB="ycc_pos"
POSTGRES_USER="yccpos_user"
POSTGRES_PASSWORD="yccpos_secure_password_2024"
REDIS_PASSWORD="yccpos_redis_password_2024"
DOMAIN="pos.yccpos.com"
SSL_EMAIL="admin@pos.yccpos.com"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root"
fi

# System information
log "Starting YCC POS VPS setup..."
log "System: $(lsb_release -d | grep DESCRIPTION | cut -d'=' -f2)"
log "Architecture: $(uname -m)"
log "Kernel: $(uname -r)"

# Update system packages
log "Updating system packages..."
apt update && apt upgrade -y || error "Failed to update system packages"

# Install essential packages
log "Installing essential packages..."
apt install -y \
    curl \
    wget \
    git \
    unzip \
    htop \
    vim \
    nano \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    build-essential \
    || error "Failed to install essential packages"

# Install Node.js 20.x
log "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    || error "Failed to install Node.js"

# Verify Node.js installation
NODE_VERSION=$(node --version)
log "Node.js installed: $NODE_VERSION"

# Install pnpm
log "Installing pnpm..."
npm install -g pnpm || error "Failed to install pnpm"

# Verify pnpm installation
PNPM_VERSION=$(pnpm --version)
log "pnpm installed: $PNPM_VERSION"

# Install PostgreSQL 16
log "Installing PostgreSQL 16..."
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF28A7F3D38A96A281E7D716A4B8A5C084C2F41DDB31A70DBF98C7B5D56FF02E9A620A686F | sudo apt-key add -
echo "deb https://apt.postgresql.org/pub/repos/apt/  $(lsb_release -cs)-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-16 postgresql-client-16 postgresql-contrib-16 || error "Failed to install PostgreSQL"

# Verify PostgreSQL installation
POSTGRES_VERSION=$(psql --version | grep PostgreSQL | cut -d' ' -f1)
log "PostgreSQL installed: $POSTGRES_VERSION"

# Install Redis 7
log "Installing Redis 7..."
add-apt-repository ppa:redislabs/redis -y
apt update
apt install -y redis-server || error "Failed to install Redis"

# Verify Redis installation
REDIS_VERSION=$(redis-server --version | cut -d' ' -f3)
log "Redis installed: $REDIS_VERSION"

# Install Nginx
log "Installing Nginx..."
apt install -y nginx || error "Failed to install Nginx"

# Verify Nginx installation
NGINX_VERSION=$(nginx -v 2>&1 | grep nginx/ | cut -d' ' -f3)
log "Nginx installed: $NGINX_VERSION"

# Install PM2
log "Installing PM2..."
npm install -g pm2 || error "Failed to install PM2"

# Verify PM2 installation
PM2_VERSION=$(pm2 --version)
log "PM2 installed: $PM2_VERSION"

# Install Certbot for SSL
log "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx || error "Failed to install Certbot"

# Create project directory
log "Creating project directory..."
mkdir -p "$PROJECT_ROOT"
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$PROJECT_ROOT/backups"

# Setup PostgreSQL
log "Setting up PostgreSQL..."

# Start PostgreSQL service
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql -c "CREATE DATABASE $POSTGRES_DB;" || error "Failed to create database"
sudo -u postgres psql -c "CREATE USER $POSTGRES_USER WITH ENCRYPTED PASSWORD '$POSTGRES_PASSWORD';" || error "Failed to create database user"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;" || error "Failed to grant privileges"
sudo -u postgres psql -c "ALTER USER $POSTERS_USER WITH SUPERUSER;" || warning "Failed to grant superuser privileges"

# Test PostgreSQL connection
sudo -u postgres psql -d "$POSTGRES_DB" -c "SELECT version();" > /dev/null || error "Failed to connect to PostgreSQL"

# Setup Redis
log "Setting up Redis..."

# Configure Redis
sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
sed -i 's/#bind 127.0.0.1 ::1/bind 0.0.0.0/' /etc/redis/redis.conf

# Set Redis password
echo "requirepass $REDIS_PASSWORD" >> /etc/redis/redis.conf

# Start Redis service
systemctl start redis-server
systemctl enable redis-server

# Test Redis connection
redis-cli ping > /dev/null || error "Failed to connect to Redis"

# Setup Nginx
log "Setting up Nginx..."

# Create Nginx user
useradd -r -s /var/www yccpos || warning "User yccpos already exists"
mkdir -p /var/www/ycc-pos
chown -R yccpos:yccpos /var/www/ycc-pos

# Create Nginx configuration directory
mkdir -p "$PROJECT_ROOT/nginx"

# Create basic Nginx configuration
cat > "$PROJECT_ROOT/nginx/ycc-pos.conf" << 'EOF'
# YCC POS Nginx Configuration
upstream api {
    server 127.0.0.1:3001;
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://$DOMAIN$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL configuration (will be updated by Certbot)
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend applications
    location / {
        root /var/www/ycc-pos/current/pos;
        try_files $uri $uri/ /index.html =404;
    }

    location /kds {
        root /var/www/ycc-pos/current/kds;
        try_files $uri $uri/ /index.html =404;
    }

    location /admin {
        root /var/www/ycc-pos/current/admin;
        try_files $uri $uri/ /index.html =404;
    }

    # API proxy
    location /api/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://api/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
}
EOF

# Create Nginx sites configuration
cat > /etc/nginx/sites-available/ycc-pos << 'EOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://$DOMAIN$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    include /etc/letsencrypt/options-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    include $PROJECT_ROOT/nginx/ycc-pos.conf;
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/ycc-pos /etc/nginx/sites-enabled/

# Remove default Nginx site
rm -f /etc/nginx/sites-enabled/default || true

# Test Nginx configuration
nginx -t || error "Nginx configuration test failed"

# Restart Nginx
systemctl restart nginx
systemctl enable nginx

# Create PM2 ecosystem configuration
cat > "$PROJECT_ROOT/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'ycc-pos-api',
    script: 'api/dist/index.js',
    cwd: '/var/www/ycc-pos/current',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001,
      DATABASE_URL: 'postgresql://yccpos_user:yccpos_secure_password_2024@localhost:5432/ycc_pos',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'your-super-secret-jwt-key-change-in-production',
      JWT_REFRESH_SECRET: 'your-super-secret-refresh-key-change-in-production'
    },
    error_file: './logs/api-error.log',
    out_file: './logs/api-out.log',
    log_file: './logs/api-combined.log',
    time: true
  }]
};
EOF

# Create log rotation configuration
cat > /etc/logrotate.d/ycc-pos << 'EOF'
/var/www/ycc-pos/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 yccpos yccpos
    postrotate
        systemctl reload pm2
    endscript
}
EOF

# Create environment file template
cat > "$PROJECT_ROOT/.env.production.example" << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://yccpos_user:yccpos_secure_password_2024@localhost:5432/ycc_pos

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Server Configuration
NODE_ENV=production
PORT=3001

# CORS Configuration
CORS_ORIGIN=https://pos.yccpos.com,https://kds.yccpos.com,https://admin.yccpos.com

# SSL Configuration
SSL_CERT_PATH=/etc/letsencrypt/live/pos.yccpos.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/pos.yccpos.com/privkey.pem

# Logging
LOG_LEVEL=info
EOF

# Set permissions
chown -R yccpos:yccpos "$PROJECT_ROOT"
chmod +x "$PROJECT_ROOT/scripts/deploy.sh"

# Create systemd service for auto-start
cat > /etc/systemd/system/ycc-pos-api.service << 'EOF'
[Unit]
Description=YCC POS API
After=network.target

[Service]
Type=simple
User=yccpos
WorkingDirectory=/var/www/ycc-pos/current
ExecStart=/usr/bin/pm2 start ycc-pos-api
ExecReload=/bin/kill -s USR2 ycc-pos-api
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

[Install]
WantedBy=multi-user.target
EOF

# Enable and start the service
systemctl daemon-reload
systemctl enable ycc-pos-api

# Setup firewall
log "Setting up firewall..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3001/tcp
ufw enable

# Create backup script
cat > "$PROJECT_ROOT/scripts/backup.sh" << 'EOF'
#!/bin/bash

# YCC POS Backup Script
set -e

BACKUP_DIR="/var/backups/ycc-pos"
TIMESTAMP=\$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p "\$BACKUP_DIR"

# Database backup
echo "Creating database backup..."
sudo -u postgres pg_dump ycc_pos > "\$BACKUP_DIR/db_backup_\$TIMESTAMP.sql"

# Files backup
echo "Creating files backup..."
tar -czf "\$BACKUP_DIR/files_backup_\$TIMESTAMP.tar.gz" -C /var/www/ycc-pos current/

echo "Backup completed: \$BACKUP_DIR/db_backup_\$TIMESTAMP.sql"
echo "Backup completed: \$BACKUP_DIR/files_backup_\$TIMESTAMP.tar.gz"
EOF

chmod +x "$PROJECT_ROOT/scripts/backup.sh"

# Setup cron job for daily backups at 2 AM
echo "0 2 * * * /var/www/ycc-pos/scripts/backup.sh" | crontab -

# Create monitoring script
cat > "$PROJECT_ROOT/scripts/monitor.sh" << 'EOF'
#!/bin/bash

# YCC POS Monitoring Script
set -e

LOG_FILE="/var/www/ycc-pos/logs/monitor.log"
TIMESTAMP=\$(date +'%Y-%m-%d %H:%M:%S')

# Function to log messages
log() {
    echo "[\$TIMESTAMP] \$1" >> "\$LOG_FILE"
}

# Check API health
if ! curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "❌ API is down"
    # Restart API
    cd /var/www/ycc-pos/current
    pm2 restart ycc-pos-api
    log "🔄 API restarted"
else
    log "✅ API is healthy"
fi

# Check disk space
DISK_USAGE=\$(df /var/www/ycc-pos | awk 'NR==2 {print \$5}' | sed 's/%//')
if [ "\$DISK_USAGE" -gt 80 ]; then
    log "⚠️ Disk usage high: \${DISK_USAGE}%"
fi

# Check memory usage
MEM_USAGE=\$(free | awk 'NR==2{printf "%.2f", \$3*100/\$2}' | sed 's/%//')
if [ "\$MEM_USAGE" -gt 80 ]; then
    log "⚠️ Memory usage high: \${MEM_USAGE}%"
fi

# Check PostgreSQL
if ! systemctl is-active --quiet postgresql; then
    log "❌ PostgreSQL is down"
    systemctl start postgresql
    log "🔄 PostgreSQL restarted"
else
    log "✅ PostgreSQL is running"
fi

# Check Redis
if ! systemctl is-active --quiet redis-server; then
    log "❌ Redis is down"
    systemctl start redis-server
    log "🔄 Redis restarted"
else
    log "✅ Redis is running"
fi

# Check Nginx
if ! systemctl is-active --quiet nginx; then
    log "❌ Nginx is down"
    systemctl start nginx
    log "🔄 Nginx restarted"
else
    log "✅ Nginx is running"
fi

# Check PM2 processes
if ! pm2 list | grep -q "ycc-pos-api"; then
    log "❌ PM2 API process not running"
    cd /var/www/ycc-pos/current
    pm2 start ycc-pos-api
    log "🔄 PM2 API process started"
else
    log "✅ PM2 API process is running"
fi
EOF

chmod +x "$PROJECT_ROOT/scripts/monitor.sh"

# Setup monitoring cron job every 5 minutes
echo "*/5 * * * * /var/www/ycc-pos/scripts/monitor.sh" | crontab -

# Create SSL setup script
cat > "$PROJECT_ROOT/scripts/setup-ssl.sh" << 'EOF'
#!/bin/bash

# YCC POS SSL Setup Script
set -e

DOMAIN="pos.yccpos.com"
EMAIL="admin@pos.yccpos.com"

echo "Setting up SSL for \$DOMAIN with Let's Encrypt..."

# Stop Nginx to free up port 80
systemctl stop nginx

# Obtain SSL certificate
certbot certonly --standalone \
    --email "\$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "\$DOMAIN" \
    --rsa-key-size 4096 \
    || error "Failed to obtain SSL certificate"

# Start Nginx
systemctl start nginx

echo "SSL setup completed for \$DOMAIN"
echo "Certificate path: /etc/letsencrypt/live/\$DOMAIN/fullchain.pem"
echo "Private key path: /etc/letsencrypt/live/\$DOMAIN/privkey.pem"

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
EOF

chmod +x "$PROJECT_ROOT/scripts/setup-ssl.sh"

# Display setup completion
log "VPS setup completed successfully!"
echo ""
echo -e "${GREEN}🎉 YCC POS VPS Setup Complete${NC}"
echo ""
echo "📋 System Information:"
echo "   - Node.js: $NODE_VERSION"
echo "   - pnpm: $PNPM_VERSION"
echo "   - PostgreSQL: $POSTGRES_VERSION"
echo "   - Redis: $REDIS_VERSION"
echo "   - Nginx: $NGINX_VERSION"
echo "   - PM2: $PM2_VERSION"
echo ""
echo "📁 Project Directory: $PROJECT_ROOT"
echo "🔐 Database: $POSTGRES_DB"
echo "🗄️ Redis: localhost:6379"
echo "🌐 Web Server: Nginx on ports 80/443"
echo "🚀 API Server: PM2 on port 3001"
echo ""
echo "🔑 Database Credentials:"
echo "   - Database: $POSTGRES_DB"
echo "   - User: $POSTGRES_USER"
echo "   - Password: $POSTGRES_PASSWORD"
echo ""
echo "🔑 Redis Password: $REDIS_PASSWORD"
echo ""
echo "📝 Next Steps:"
echo "1. Copy your project code to $PROJECT_ROOT"
echo "2. Update .env.production with real secrets"
echo "   - Database URL"
echo "   - JWT secrets"
echo "   - Domain configuration"
echo "3. Run: sudo bash $PROJECT_ROOT/scripts/deploy.sh"
echo "4. Setup SSL: sudo bash $PROJECT_ROOT/scripts/setup-ssl.sh"
echo ""
echo "📋 Useful Commands:"
echo "   - Deploy: sudo bash $PROJECT_ROOT/scripts/deploy.sh"
echo "   - Backup: sudo bash $PROJECT_ROOT/scripts/backup.sh"
echo "   - Monitor: sudo bash $PROJECT_ROOT/scripts/monitor.sh"
echo "   - SSL Setup: sudo bash $PROJECT_ROOT/scripts/setup-ssl.sh"
echo "   - PM2 Status: pm2 status"
echo "   - View Logs: tail -f $PROJECT_ROOT/logs/api-combined.log"
echo ""
echo -e "${GREEN}🚀 Ready for deployment!${NC}"
