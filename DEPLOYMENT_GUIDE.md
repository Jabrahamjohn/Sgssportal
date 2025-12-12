# SGSS Medical Fund Portal - Production Deployment Guide

## 🚀 Overview

This guide provides step-by-step instructions for deploying the SGSS Medical Fund Portal to a production environment.

## 📋 Pre-Deployment Checklist

### Code Readiness
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Security audit completed
- [ ] Dependencies updated
- [ ] Documentation current
- [ ] Database migrations tested
- [ ] Backup strategy in place

### Infrastructure
- [ ] Production server provisioned
- [ ] Database server configured
- [ ] Domain name registered
- [ ] SSL certificate obtained
- [ ] Email service configured
- [ ] Storage solution set up
- [ ] Monitoring tools configured
- [ ] Backup system ready

### Security
- [ ] All secrets moved to environment variables
- [ ] `DEBUG=False` in production
- [ ] Secure cookies enabled
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Firewall rules configured
- [ ] Security headers set

## 🏗️ Deployment Architecture

### Recommended Stack

```
┌─────────────────────────────────────────┐
│          Load Balancer / CDN            │
│         (CloudFlare / AWS ALB)          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│        Web Server (Nginx/Apache)        │
│     - Serve static files                │
│     - Reverse proxy to app              │
│     - SSL termination                   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│    Application Server (Gunicorn)        │
│     - Django app                        │
│     - Multiple workers                  │
└────────────────┬────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│  PostgreSQL  │  │    Redis     │
│   Database   │  │  (Cache/Jobs)│
└──────────────┘  └──────────────┘
        │
        ▼
┌──────────────┐
│   S3/Cloud   │
│   Storage    │
└──────────────┘
```

## 📦 Option 1: VPS Deployment (Ubuntu)

### Step 1: Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.12 python3.12-venv python3-pip \
    postgresql postgresql-contrib nginx redis-server \
    git supervisor certbot python3-certbot-nginx

# Create app user
sudo useradd -m -s /bin/bash sgssapp
sudo su - sgssapp
```

### Step 2: Application Setup

```bash
# Clone repository
git clone https://github.com/Jabrahamjohn/Sgssportal.git
cd Sgssportal/Backend

# Create virtual environment
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Create .env file
cat > .env << 'EOF'
DEBUG=False
SECRET_KEY=YOUR_SUPER_SECRET_KEY_HERE
DATABASE_URL=postgres://sgss_user:secure_password@localhost:5432/sgss_production
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_SECURE=True
TIME_ZONE=Africa/Nairobi
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=YOUR_SENDGRID_API_KEY
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
EOF

# Generate secret key
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
# Copy output and update SECRET_KEY in .env
```

### Step 3: Database Setup

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE sgss_production;
CREATE USER sgss_user WITH PASSWORD 'secure_password';
ALTER ROLE sgss_user SET client_encoding TO 'utf8';
ALTER ROLE sgss_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE sgss_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE sgss_production TO sgss_user;
\q

# Run migrations
cd ~/Sgssportal/Backend
source venv/bin/activate
python manage.py migrate
python manage.py collectstatic --noinput

# Create superuser
python manage.py createsuperuser

# Create groups
python manage.py shell << EOF
from django.contrib.auth.models import Group
Group.objects.get_or_create(name='Committee')
Group.objects.get_or_create(name='Admin')
Group.objects.get_or_create(name='Member')
EOF
```

### Step 4: Gunicorn Setup

```bash
# Test Gunicorn
cd ~/Sgssportal/Backend
source venv/bin/activate
gunicorn --bind 0.0.0.0:8000 sgss_medical_fund.wsgi:application

# Create Gunicorn config
cat > ~/Sgssportal/Backend/gunicorn_config.py << 'EOF'
import multiprocessing

bind = "127.0.0.1:8000"
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 50
timeout = 30
keepalive = 2
accesslog = "/var/log/sgss/gunicorn-access.log"
errorlog = "/var/log/sgss/gunicorn-error.log"
loglevel = "info"
EOF

# Create log directory
sudo mkdir -p /var/log/sgss
sudo chown sgssapp:sgssapp /var/log/sgss
```

### Step 5: Supervisor Configuration

```bash
# Exit from sgssapp user
exit

# Create supervisor config
sudo nano /etc/supervisor/conf.d/sgss.conf
```

```ini
[program:sgss]
command=/home/sgssapp/Sgssportal/Backend/venv/bin/gunicorn -c /home/sgssapp/Sgssportal/Backend/gunicorn_config.py sgss_medical_fund.wsgi:application
directory=/home/sgssapp/Sgssportal/Backend
user=sgssapp
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/log/sgss/supervisor.log
environment=PATH="/home/sgssapp/Sgssportal/Backend/venv/bin"
```

```bash
# Update supervisor
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl status sgss
```

### Step 6: Nginx Configuration

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/sgss
```

```nginx
upstream sgss_backend {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    client_max_body_size 10M;

    # Static files
    location /static/ {
        alias /home/sgssapp/Sgssportal/Backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /home/sgssapp/Sgssportal/Backend/media/;
        expires 7d;
    }

    # API and admin
    location / {
        proxy_pass http://sgss_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/sgss /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 7: Frontend Deployment

```bash
# Build frontend
cd ~/Sgssportal/Frontend
npm install
npm run build

# Serve via Nginx (add to nginx config)
```

```nginx
server {
    listen 443 ssl http2;
    server_name portal.yourdomain.com;

    # SSL config...

    root /home/sgssapp/Sgssportal/Frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 🐳 Option 2: Docker Deployment

### Production Docker Compose

```yaml
# docker-compose.prod.yml
version: '3.9'

services:
  db:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - sgss_network

  redis:
    image: redis:7-alpine
    restart: always
    networks:
      - sgss_network

  backend:
    build:
      context: ./Backend
      dockerfile: Dockerfile.prod
    command: gunicorn -c gunicorn_config.py sgss_medical_fund.wsgi:application
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    env_file:
      - .env.prod
    depends_on:
      - db
      - redis
    networks:
      - sgss_network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/static
      - media_volume:/media
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - backend
    networks:
      - sgss_network

volumes:
  postgres_data:
  static_volume:
  media_volume:

networks:
  sgss_network:
    driver: bridge
```

## ☁️ Option 3: Cloud Deployment

### AWS Deployment

**Services Used:**
- **EC2:** Application servers
- **RDS:** PostgreSQL database
- **S3:** Static files and media
- **CloudFront:** CDN
- **Route 53:** DNS
- **SES:** Email service
- **ElastiCache:** Redis

### Heroku Deployment

```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create sgss-medical-fund

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set SECRET_KEY=your_secret_key
heroku config:set DEBUG=False
heroku config:set ALLOWED_HOSTS=sgss-medical-fund.herokuapp.com

# Deploy
git push heroku main

# Run migrations
heroku run python Backend/manage.py migrate
heroku run python Backend/manage.py createsuperuser
```

### Render Deployment

1. Connect GitHub repository
2. Configure build command: `cd Backend && pip install -r requirements.txt`
3. Configure start command: `cd Backend && gunicorn sgss_medical_fund.wsgi`
4. Add environment variables
5. Deploy

## 🔒 Post-Deployment Security

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### Fail2Ban Setup

```bash
sudo apt install fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### Regular Updates

```bash
# Create update script
cat > ~/update_sgss.sh << 'EOF'
#!/bin/bash
cd ~/Sgssportal
git pull
source Backend/venv/bin/activate
pip install -r Backend/requirements.txt
python Backend/manage.py migrate
python Backend/manage.py collectstatic --noinput
sudo supervisorctl restart sgss
EOF

chmod +x ~/update_sgss.sh
```

## 📊 Monitoring Setup

### Health Checks

```bash
# Add to cron
crontab -e

# Check every 5 minutes
*/5 * * * * curl -f https://yourdomain.com/api/health/ || echo "Health check failed" | mail -s "SGSS Portal Down" admin@yourdomain.com
```

### Log Monitoring

```bash
# View logs
sudo tail -f /var/log/sgss/gunicorn-error.log
sudo supervisorctl tail -f sgss
```

## 🔄 Backup Strategy

### Database Backup

```bash
# Create backup script
cat > ~/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/sgssapp/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Dump database
pg_dump -U sgss_user sgss_production | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://sgss-backups/
EOF

chmod +x ~/backup_db.sh

# Add to cron (daily at 2 AM)
crontab -e
0 2 * * * /home/sgssapp/backup_db.sh
```

## 🆘 Troubleshooting

### Issue: 502 Bad Gateway
**Solution:** Check Gunicorn is running: `sudo supervisorctl status sgss`

### Issue: Static files not loading
**Solution:** Run `python manage.py collectstatic` and check Nginx config

### Issue: Database connection failed
**Solution:** Verify DATABASE_URL and PostgreSQL service status

### Issue: CSRF errors
**Solution:** Verify CSRF_TRUSTED_ORIGINS matches your domain

## 📞 Support

For deployment issues:
- Email: admin@sgssmedicalfund.org
- GitHub Issues: [Link]

## 📚 Additional Resources

- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Best Practices](https://www.postgresql.org/docs/current/admin.html)
