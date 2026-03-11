#!/bin/bash

# CivilBridge Production Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

# Configuration
ENVIRONMENT=${1:-production}
PROJECT_NAME="civilbridge"
BACKUP_DIR="/var/backups/$PROJECT_NAME"
LOG_FILE="/var/log/$PROJECT_NAME-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    error "Please run as root or with sudo"
    exit 1
fi

# Create necessary directories
mkdir -p "$BACKUP_DIR"
mkdir -p "/var/log"
mkdir -p "/var/www/$PROJECT_NAME"

log "Starting deployment for $ENVIRONMENT environment"

# Backup database if it exists
if docker ps | grep -q "${PROJECT_NAME}-db"; then
    log "Creating database backup..."
    docker exec "${PROJECT_NAME}-db" mysqldump -u root -p"$DB_ROOT_PASSWORD" civilbridge_prod > "$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
    log "Database backup completed"
fi

# Pull latest code
log "Pulling latest code..."
cd "/var/www/$PROJECT_NAME"
git pull origin main

# Build and deploy with Docker Compose
log "Building and deploying application..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
else
    docker-compose -f docker-compose.staging.yml down
    docker-compose -f docker-compose.staging.yml build --no-cache
    docker-compose -f docker-compose.staging.yml up -d
fi

# Wait for services to be healthy
log "Waiting for services to be healthy..."
sleep 30

# Health checks
log "Performing health checks..."

# Check API health
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    log "✓ API health check passed"
else
    error "✗ API health check failed"
    exit 1
fi

# Check database connection
if docker exec "${PROJECT_NAME}-db" mysqladmin ping -h localhost --silent; then
    log "✓ Database connection check passed"
else
    error "✗ Database connection check failed"
    exit 1
fi

# Check Redis connection
if docker exec "${PROJECT_NAME}-redis" redis-cli ping > /dev/null 2>&1; then
    log "✓ Redis connection check passed"
else
    error "✗ Redis connection check failed"
    exit 1
fi

# Clean up old Docker images
log "Cleaning up old Docker images..."
docker image prune -f

# Clean up old backups (keep last 30 days)
find "$BACKUP_DIR" -name "*.sql" -mtime +30 -delete 2>/dev/null || true

log "Deployment completed successfully!"

# Display service status
echo ""
log "Service Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
log "Deployment Summary:"
echo "- Environment: $ENVIRONMENT"
echo "- Timestamp: $(date)"
echo "- API URL: http://localhost:3000"
echo "- Health Check: http://localhost:3000/health"
echo "- Grafana: http://localhost:3001 (if enabled)"
echo "- Prometheus: http://localhost:9090 (if enabled)"
