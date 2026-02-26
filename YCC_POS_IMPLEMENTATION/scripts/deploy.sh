#!/bin/bash

# YCC POS Deployment Script
# This script builds and deploys the entire YCC POS application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/var/www/ycc-pos"
BACKUP_DIR="/var/backups/ycc-pos"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="/var/log/ycc-pos/deploy.log"

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" | tee -a "$LOG_FILE"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
    error "This script must be run as root"
fi

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

log "Starting YCC POS deployment..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup database before deployment
log "Creating database backup..."
su - postgres -c "pg_dump ycc_pos > $BACKUP_DIR/db_backup_$TIMESTAMP.sql" || error "Failed to create database backup"

# Backup current deployment
if [ -d "$PROJECT_ROOT/current" ]; then
    log "Backing up current deployment..."
    cp -r "$PROJECT_ROOT/current" "$BACKUP_DIR/deployment_backup_$TIMESTAMP" || error "Failed to backup current deployment"
fi

# Navigate to project root
cd "$PROJECT_ROOT" || error "Project root directory not found: $PROJECT_ROOT"

# Pull latest changes from git
log "Pulling latest changes from repository..."
git pull origin main || error "Failed to pull latest changes"

# Install dependencies
log "Installing dependencies..."
pnpm install || error "Failed to install dependencies"

# Run tests
log "Running tests..."
pnpm test || error "Tests failed - deployment aborted"

# Build applications
log "Building applications..."

# Build API
log "Building API..."
cd apps/api
pnpm build || error "API build failed"
cd ../..

# Build POS
log "Building POS..."
cd apps/pos
pnpm build || error "POS build failed"
cd ../..

# Build KDS
log "Building KDS..."
cd apps/kds
pnpm build || error "KDS build failed"
cd ../..

# Build Admin
log "Building Admin..."
cd apps/admin
pnpm build || error "Admin build failed"
cd ../..

# Copy built files to deployment directory
log "Copying built files to deployment directory..."

# Create new deployment directory
DEPLOY_DIR="$PROJECT_ROOT/deploy_$TIMESTAMP"
mkdir -p "$DEPLOY_DIR"

# Copy API build
cp -r apps/api/dist "$DEPLOY_DIR/api" || error "Failed to copy API build"

# Copy frontend builds
cp -r apps/pos/dist "$DEPLOY_DIR/pos" || error "Failed to copy POS build"
cp -r apps/kds/dist "$DEPLOY_DIR/kds" || error "Failed to copy KDS build"
cp -r apps/admin/dist "$DEPLOY_DIR/admin" || error "Failed to copy Admin build"

# Copy environment files
if [ -f ".env.production" ]; then
    cp .env.production "$DEPLOY_DIR/.env" || error "Failed to copy environment file"
else
    warning ".env.production file not found, using .env.example"
    if [ -f ".env.example" ]; then
        cp .env.example "$DEPLOY_DIR/.env" || error "Failed to copy environment example"
    fi
fi

# Copy PM2 configuration
if [ -f "ecosystem.config.js" ]; then
    cp ecosystem.config.js "$DEPLOY_DIR/" || error "Failed to copy PM2 config"
fi

# Copy Nginx configuration
if [ -f "nginx/ycc-pos.conf" ]; then
    cp nginx/ycc-pos.conf "$DEPLOY_DIR/" || error "Failed to copy Nginx config"
fi

# Update current deployment symlink
log "Updating current deployment symlink..."
rm -f "$PROJECT_ROOT/current"
ln -s "$DEPLOY_DIR" "$PROJECT_ROOT/current" || error "Failed to update current deployment symlink"

# Restart PM2 processes
log "Restarting PM2 processes..."
cd "$PROJECT_ROOT/current"

# Stop existing processes
if pm2 list | grep -q "ycc-pos-api"; then
    pm2 stop ycc-pos-api || warning "Failed to stop existing API process"
fi

# Start API with PM2
if [ -f "ecosystem.config.js" ]; then
    pm2 start ecosystem.config.js || error "Failed to start API with PM2"
else
    # Start API without ecosystem config
    cd api
    NODE_ENV=production pm2 start dist/index.js --name "ycc-pos-api" || error "Failed to start API"
    cd ..
fi

# Wait for API to start
log "Waiting for API to start..."
sleep 5

# Health check for API
log "Performing health check on API..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "API health check passed"
else
    error "API health check failed"
fi

# Reload Nginx
log "Reloading Nginx configuration..."
nginx -t || error "Nginx configuration test failed"
nginx -s reload || error "Failed to reload Nginx"

# Health checks for all applications
log "Performing health checks..."

# Check API
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    log "✅ API is healthy"
else
    error "❌ API health check failed"
fi

# Check POS (assuming domain is pos.ycc.com)
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    log "✅ POS is healthy"
else
    warning "⚠️ POS health check failed (may need SSL setup)"
fi

# Check KDS (assuming domain is kds.ycc.com)
if curl -f http://localhost:3002 > /dev/null 2>&1; then
    log "✅ KDS is healthy"
else
    warning "⚠️ KDS health check failed (may need SSL setup)"
fi

# Check Admin (assuming domain is admin.ycc.com)
if curl -f http://localhost:3003 > /dev/null 2>&1; then
    log "✅ Admin is healthy"
else
    warning "⚠️ Admin health check failed (may need SSL setup)"
fi

# Clean up old deployments (keep last 5)
log "Cleaning up old deployments..."
cd "$PROJECT_ROOT"
ls -1t deploy_* | tail -n +6 | xargs rm -rf || warning "Failed to clean up old deployments"

# Clean up old backups (keep last 7)
cd "$BACKUP_DIR"
ls -1t *.sql | tail -n +8 | xargs rm -f || warning "Failed to clean up old database backups"
ls -1t deployment_backup_* | tail -n +8 | xargs rm -rf || warning "Failed to clean up old deployment backups"

log "Deployment completed successfully!"
log "Current deployment: $DEPLOY_DIR"
log "Database backup: $BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Display PM2 status
log "PM2 Process Status:"
pm2 status

# Display disk usage
log "Disk Usage:"
df -h "$PROJECT_ROOT"

# Display memory usage
log "Memory Usage:"
free -h

# Display last few lines of logs
log "Recent deployment logs:"
tail -10 "$LOG_FILE"

echo -e "${GREEN}🎉 YCC POS deployment completed successfully!${NC}"
echo -e "${GREEN}📍 API: http://localhost:3001${NC}"
echo -e "${GREEN}📍 POS: http://localhost:3000${NC}"
echo -e "${GREEN}📍 KDS: http://localhost:3002${NC}"
echo -e "${GREEN}📍 Admin: http://localhost:3003${NC}"
