# CivilBridge Production Deployment Guide

## Overview
This guide covers deploying CivilBridge to production using Docker Compose with MySQL and Redis.

## Prerequisites

### Server Requirements
- **OS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB SSD
- **CPU**: Minimum 2 cores, Recommended 4+ cores
- **Network**: Public IP with ports 80, 443 open

### Software Requirements
- Docker 20.10+
- Docker Compose 2.0+
- Git
- SSL certificate (Let's Encrypt recommended)

## Environment Setup

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo apt install git -y

# Create project directory
sudo mkdir -p /var/www/civilbridge
sudo chown $USER:$USER /var/www/civilbridge
```

### 2. Clone Repository
```bash
cd /var/www/civilbridge
git clone https://github.com/your-username/civilbridge.git .
```

### 3. Environment Configuration
```bash
# Copy production environment template
cp .env.production .env.local

# Edit environment variables
nano .env.local
```

**Required Environment Variables:**
```env
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL="mysql://civilbridge:your_password@db:3306/civilbridge_prod"
DB_ROOT_PASSWORD="your_root_password"
DB_PASSWORD="your_password"

# JWT
JWT_SECRET="your-super-secure-jwt-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-token-secret-key-min-32-chars"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# CORS
CORS_ORIGIN="https://yourdomain.com,https://www.yourdomain.com"

# CSRF
CSRF_SECRET="your-csrf-secret-key-min-32-chars"

# Redis
REDIS_PASSWORD="your-redis-password"

# Monitoring
GRAFANA_PASSWORD="your-grafana-password"

# AI Service
GEMINI_API_KEY="your-gemini-api-key"

# Error Tracking (Optional)
SENTRY_DSN="your-sentry-dsn"
```

### 4. SSL Certificate Setup
```bash
### 5. Create Required Directories
```bash
# Create directories for persistent data
sudo mkdir -p /var/www/civilbridge/{logs,uploads,backups}
sudo mkdir -p /var/backups/civilbridge

# Set permissions
sudo chown -R $USER:$USER /var/www/civilbridge
sudo chmod -R 755 /var/www/civilbridge/uploads
```

## Deployment

### Manual Deployment
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Check service status
docker-compose -f docker-compose.prod.yml ps
```

## Service URLs

- **Application**: https://yourdomain.com
- **API**: https://yourdomain.com/api
- **Health Check**: https://yourdomain.com/health

## Maintenance

### Daily Tasks
```bash
# Check service status
docker-compose -f docker-compose.prod.yml ps

# View recent logs
docker-compose -f docker-compose.prod.yml logs --tail=100

# Check disk space
df -h
```

### Weekly Tasks
```bash
# Update application
cd /var/www/civilbridge
git pull origin main
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Clean up Docker images
docker image prune -f

# Check backup retention
ls -la /var/backups/civilbridge
```

### Monthly Tasks
```bash
# Update Docker
sudo apt update && sudo apt upgrade docker docker-compose

# Renew SSL certificate (Certbot auto-renews, but verify)
sudo certbot renew --dry-run

# Review and rotate secrets if needed
```

## Backup Strategy

### Automated Database Backups
The system includes automatic daily backups at 2 AM.

### Manual Backup
```bash
# Database backup
docker exec civilbridge-db mysqldump -u root -p civilbridge_prod > backup.sql

# File backup
tar -czf uploads_backup.tar.gz uploads/

# Configuration backup
tar -czf config_backup.tar.gz .env.local
```

### Restore from Backup
```bash
# Restore database
docker exec -i civilbridge-db mysql -u root -p civilbridge_prod < backup.sql

# Restore files
tar -xzf uploads_backup.tar.gz
```

## Security

### Network Security
- Firewall configured to allow only necessary ports
- SSL/TLS encryption enforced
- Rate limiting on API endpoints
- CSRF protection enabled

### Application Security
- Environment variables contain sensitive data
- JWT tokens with expiration
- Password hashing with bcrypt
- Input validation and sanitization

### Server Security
```bash
# Configure firewall
sudo ufw enable
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp # HTTPS
sudo ufw deny 3000/tcp # Block direct API access

# Disable root login
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh
```

## Troubleshooting

### Common Issues

#### Service Won't Start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs api

# Check configuration
docker-compose -f docker-compose.prod.yml config

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### Database Connection Issues
```bash
# Check database container
docker exec civilbridge-db mysql -u root -p

# Check network connectivity
docker network ls
docker network inspect civilbridge_civilbridge-network
```

#### High Memory Usage
```bash
# Check container resource usage
docker stats

# Restart memory-intensive services
docker-compose -f docker-compose.prod.yml restart api
```

#### SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

```

### Performance Optimization

#### Database Optimization
```sql
-- Add indexes to frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- Optimize MySQL configuration
SET GLOBAL innodb_buffer_pool_size = 256M;
SET GLOBAL max_connections = 200;
```

#### Caching
- Redis for session storage
- Nginx for static file caching
- Application-level caching for frequent queries

#### Load Balancing
- Use multiple API instances
- Configure Nginx upstream load balancing
- Consider CDN for static assets

## Scaling

### Horizontal Scaling
```yaml
# In docker-compose.prod.yml, add replicas:
services:
  api:
    deploy:
      replicas: 3
```

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add read replicas for database

## Rollback Procedure

### Quick Rollback
```bash
# Rollback to previous commit
git checkout <previous-commit-hash>
docker-compose -f docker-compose.prod.yml up -d --build
```

### Full Rollback
```bash
# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database from backup
docker exec -i civilbridge-db mysql -u root -p civilbridge_prod < backup.sql

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

## Support

### Logs Location
- Application logs: `/var/www/civilbridge/logs/`
- Docker logs: `docker-compose logs`

### Monitoring
- Health check endpoints

### Emergency Contacts
- DevOps team: devops@civilbridge.rw
- System admin: admin@civilbridge.rw

---

**Note**: Always test deployment in staging environment before production deployment.
