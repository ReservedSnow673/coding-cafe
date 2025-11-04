# Deployment Guide

This guide covers deploying PlakshaConnect to various platforms and configuring production environments.

---

## Deployment Overview

PlakshaConnect can be deployed using several strategies:

1. **Local Deployment** - For development and testing
2. **Cloud Deployment** - For production use
3. **Containerized Deployment** - Using Docker

Currently, the application is configured for **local deployment**.

---

## Local Deployment

### Prerequisites

- PostgreSQL installed and running
- Node.js (v18+) installed
- Python (v3.10+) installed
- Sufficient disk space (~500MB)

### Steps

Follow the instructions in [SETUP.md](./SETUP.md) for complete local setup.

**Quick Start:**

1. Clone repository
2. Set up PostgreSQL database
3. Configure environment variables
4. Install dependencies (frontend + backend)
5. Run database migrations
6. Start backend server
7. Start frontend development server

---

## Production Deployment (Cloud)

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Frontend Deployment (Vercel)

**Step 1: Prepare for Deployment**

Update `next.config.js`:
```javascript
module.exports = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
}
```

**Step 2: Deploy to Vercel**

1. Push code to GitHub
2. Connect repository to Vercel
3. Configure environment variables:
   - `NEXT_PUBLIC_API_URL`: Your backend API URL
   - `NEXT_PUBLIC_WS_URL`: Your WebSocket URL
4. Deploy

**Vercel CLI Alternative:**
```bash
npm install -g vercel
cd frontend
vercel
```

---

#### Backend Deployment (Railway)

**Step 1: Prepare Backend**

Create `Procfile`:
```
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Create `runtime.txt`:
```
python-3.10.12
```

**Step 2: Deploy to Railway**

1. Create Railway account
2. Create new project
3. Connect GitHub repository
4. Add PostgreSQL database service
5. Configure environment variables (see below)
6. Deploy

**Environment Variables for Railway:**
```
DATABASE_URL=<provided_by_railway>
SECRET_KEY=<generate_secure_key>
JWT_SECRET=<generate_secure_key>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your_email>
SMTP_PASSWORD=<app_password>
SMTP_FROM=noreply@plaksha.edu.in
CORS_ORIGINS=https://your-frontend-domain.vercel.app
ENVIRONMENT=production
```

**Step 3: Run Migrations**

After deployment, run migrations via Railway CLI:
```bash
railway run alembic upgrade head
```

---

### Option 2: Render (Full Stack)

#### Backend Deployment

1. Create Render account
2. Create new Web Service
3. Connect GitHub repository
4. Configure:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add PostgreSQL database
6. Set environment variables
7. Deploy

#### Frontend Deployment

1. Create new Static Site on Render
2. Configure:
   - **Build Command:** `cd frontend && npm install && npm run build`
   - **Publish Directory:** `frontend/out`
3. Set environment variables
4. Deploy

---

### Option 3: DigitalOcean App Platform

**Frontend:**
1. Create App
2. Connect repository
3. Select frontend directory
4. Build settings: `npm run build`
5. Deploy

**Backend:**
1. Create App
2. Connect repository
3. Select backend directory
4. Add PostgreSQL database
5. Configure environment variables
6. Deploy

---

## Docker Deployment

### Docker Compose Setup

**Create `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: plakshaconnect
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/plakshaconnect
      SECRET_KEY: your-secret-key
      JWT_SECRET: your-jwt-secret
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_WS_URL: ws://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

**Backend Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
```

**Run with Docker Compose:**
```bash
docker-compose up --build
```

---

## Environment Configuration

### Production Environment Variables

#### Frontend (.env.production)
```env
NEXT_PUBLIC_API_URL=https://api.plakshaconnect.com
NEXT_PUBLIC_WS_URL=wss://api.plakshaconnect.com
```

#### Backend (.env.production)
```env
DATABASE_URL=postgresql://user:password@host:5432/plakshaconnect
SECRET_KEY=<64_char_random_string>
JWT_SECRET=<64_char_random_string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=alerts@plaksha.edu.in
SMTP_PASSWORD=<app_specific_password>
SMTP_FROM=noreply@plaksha.edu.in

CORS_ORIGINS=https://plakshaconnect.com,https://www.plakshaconnect.com

ENVIRONMENT=production
DEBUG=False

# Optional: Redis for caching
REDIS_URL=redis://localhost:6379

# Optional: Sentry for error tracking
SENTRY_DSN=https://...
```

---

## Database Migration in Production

### Initial Setup

```bash
# Connect to production server
ssh user@server

# Navigate to backend directory
cd /path/to/backend

# Activate virtual environment
source venv/bin/activate

# Run migrations
alembic upgrade head
```

### Applying New Migrations

```bash
# After deploying new code with migrations
alembic upgrade head

# Check current version
alembic current

# View migration history
alembic history
```

### Rollback Strategy

```bash
# Rollback one version
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision_id>
```

---

## SSL/HTTPS Configuration

### Using Let's Encrypt (Certbot)

**For Nginx:**
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d plakshaconnect.com -d www.plakshaconnect.com
```

**Auto-renewal:**
```bash
sudo certbot renew --dry-run
```

### Nginx Configuration

**`/etc/nginx/sites-available/plakshaconnect`:**
```nginx
server {
    listen 80;
    server_name plakshaconnect.com www.plakshaconnect.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name plakshaconnect.com www.plakshaconnect.com;

    ssl_certificate /etc/letsencrypt/live/plakshaconnect.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/plakshaconnect.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/plakshaconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Monitoring and Logging

### Application Logs

**Backend Logging:**

Update `app/main.py`:
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

**View Logs:**
```bash
tail -f app.log
```

### Error Tracking with Sentry

**Install:**
```bash
pip install sentry-sdk[fastapi]
```

**Configure in `app/main.py`:**
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    environment="production",
    traces_sample_rate=1.0
)
```

### Performance Monitoring

**Using New Relic:**
```bash
pip install newrelic
newrelic-admin run-program uvicorn app.main:app
```

---

## Backup Strategy

### Database Backups

**Automated Daily Backup:**

Create `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="plakshaconnect"

pg_dump $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

**Cron Job:**
```bash
crontab -e
# Add: 0 2 * * * /path/to/backup.sh
```

**Restore:**
```bash
psql plakshaconnect < backup_20251104_020000.sql
```

---

## Scaling Considerations

### Horizontal Scaling

**Load Balancer Configuration:**
- Use Nginx or cloud load balancer
- Distribute traffic across multiple backend instances
- Sticky sessions for WebSocket connections

**Database:**
- Use connection pooling (SQLAlchemy pool settings)
- Consider read replicas for read-heavy operations
- Implement caching (Redis) for frequently accessed data

### Vertical Scaling

**Backend:**
- Increase worker processes: `--workers 4`
- Adjust database connection pool size
- Increase server resources (CPU, RAM)

---

## Security Checklist

- [ ] Use HTTPS/SSL for all connections
- [ ] Set secure, random SECRET_KEY and JWT_SECRET
- [ ] Enable CORS only for trusted origins
- [ ] Use environment variables for sensitive data
- [ ] Implement rate limiting
- [ ] Regular security updates for dependencies
- [ ] Database access restricted to backend only
- [ ] Use prepared statements (SQLAlchemy ORM)
- [ ] Implement input validation and sanitization
- [ ] Set up firewall rules
- [ ] Regular database backups
- [ ] Monitor application logs for suspicious activity

---

## Performance Optimization

### Backend

1. **Enable Caching:**
   - Redis for session storage
   - Cache frequently accessed data

2. **Database Optimization:**
   - Add indexes on frequently queried columns
   - Use connection pooling
   - Optimize complex queries

3. **Async Operations:**
   - Use FastAPI async endpoints where possible
   - Background tasks for email sending

### Frontend

1. **Code Splitting:**
   - Next.js automatic code splitting
   - Dynamic imports for heavy components

2. **Image Optimization:**
   - Use Next.js Image component
   - Compress images

3. **Caching:**
   - Browser caching headers
   - CDN for static assets

---

## Troubleshooting

### Common Issues

**Database Connection Errors:**
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check firewall rules

**CORS Errors:**
- Verify CORS_ORIGINS includes frontend URL
- Check protocol (http vs https)

**WebSocket Connection Fails:**
- Use wss:// for HTTPS sites
- Check proxy configuration
- Verify WebSocket route is accessible

**Migration Failures:**
- Check database permissions
- Review migration file for errors
- Ensure database is accessible

---

## Maintenance

### Regular Tasks

**Weekly:**
- Review application logs
- Check database size and performance
- Monitor error rates

**Monthly:**
- Update dependencies
- Review and clean up old data
- Database optimization (VACUUM, ANALYZE)
- Security audit

**Quarterly:**
- Full backup test (restore and verify)
- Performance load testing
- Security penetration testing

---

## Rollback Procedure

In case of deployment issues:

1. **Code Rollback:**
   ```bash
   git revert HEAD
   git push
   # Redeploy
   ```

2. **Database Rollback:**
   ```bash
   alembic downgrade -1
   ```

3. **Full Rollback:**
   - Restore previous code version
   - Restore database backup
   - Clear cache
   - Restart services

---

## Support

For deployment issues:
1. Check application logs
2. Review error messages
3. Consult documentation
4. Create issue in repository with details

---

**Note:** For local development, continue using the setup described in [SETUP.md](./SETUP.md). Cloud deployment is for production use only.
