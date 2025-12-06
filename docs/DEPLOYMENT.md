# Deployment Guide

Production deployment options for PlakshaConnect.

## Local Development

For local setup, see [SETUP.md](./SETUP.md).

---

## Cloud Deployment

### Vercel + Railway

**Frontend (Vercel)**:

1. Connect GitHub repo to Vercel
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_WS_URL`
3. Deploy

**Backend (Railway)**:

1. Create Railway project
2. Connect GitHub repo
3. Add PostgreSQL database
4. Set environment variables:
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

5. Run migrations: `railway run alembic upgrade head`

---

## Docker Deployment

`docker-compose.yml`:
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

`backend/Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

`frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
```

Run:
```bash
docker-compose up --build
```

---

## Environment Variables

**Frontend** `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://api.plakshaconnect.com
NEXT_PUBLIC_WS_URL=wss://api.plakshaconnect.com
```

**Backend** `.env.production`:
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

## Database Migrations

On production server:

```bash
ssh user@server
cd /path/to/backend
source venv/bin/activate
alembic upgrade head
```

Rollback if needed:

```bash
alembic downgrade -1
```

---

## SSL Configuration

Install Let's Encrypt certificate:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d plakshaconnect.com
```

Nginx config:
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

Enable:
```bash
sudo ln -s /etc/nginx/sites-available/plakshaconnect /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

---

## Monitoring

View application logs:
```bash
tail -f app.log
```

Optional error tracking with Sentry:
```bash
pip install sentry-sdk[fastapi]
```

---

## Database Backups

Daily backup script:
```bash
#!/bin/bash
pg_dump plakshaconnect > /backups/backup_$(date +%Y%m%d).sql
```

Add to crontab: `0 2 * * * /path/to/backup.sh`

Restore:
```bash
psql plakshaconnect < backup_20251206.sql
```

---

## Scaling

Horizontal scaling:
- Load balancer (Nginx)
- Multiple backend instances
- Redis for caching
- Database read replicas

Vertical scaling:
- Increase uvicorn workers: `--workers 4`
- Adjust DB connection pool
- Upgrade server resources

---

## Security Checklist

- HTTPS/SSL enabled
- Random SECRET_KEY and JWT_SECRET (64+ chars)
- CORS limited to trusted origins
- Environment variables for secrets
- Rate limiting enabled
- Regular dependency updates
- Database firewall rules
- Input validation on all endpoints
- Regular backups
- Log monitoring

---

## Performance Tips

Backend:
- Redis caching
- Database indexes
- Connection pooling
- Async endpoints

Frontend:
- Next.js Image component
- Dynamic imports
- CDN for static assets

---

## Troubleshooting

Database issues: Check DATABASE_URL and PostgreSQL status

CORS errors: Verify CORS_ORIGINS includes your frontend URL

WebSocket fails: Use wss:// for HTTPS, check proxy config

Migrations fail: Check database permissions and connectivity

---

## Maintenance

Weekly: Review logs, check database performance

Monthly: Update dependencies, database optimization

Quarterly: Test backups, load testing, security audit

---

## Rollback

Code rollback:
```bash
git revert HEAD && git push
```

Database rollback:
```bash
alembic downgrade -1
```

---

For local development, see [SETUP.md](./SETUP.md).
