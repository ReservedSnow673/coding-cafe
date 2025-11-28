# 🚀 PlakshaConnect - Developer Quick Reference

## One-Command Setup

```bash
# Backend
cd backend && chmod +x setup.sh && ./setup.sh && ./venv/bin/uvicorn app.main:app --reload

# Frontend (new terminal)
cd frontend && npm install && echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local && npm run dev
```

---

## Essential URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main app |
| Backend API | http://localhost:8000 | API server |
| API Docs | http://localhost:8000/docs | Interactive API testing |
| Uploads | http://localhost:8000/uploads/ | Static files |

---

## Common Commands

### Backend
```bash
# Activate virtual environment
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations
./venv/bin/python -m alembic upgrade head

# Create new migration
./venv/bin/python -m alembic revision --autogenerate -m "description"

# Start server
./venv/bin/uvicorn app.main:app --reload --port 8000

# Start with log level
./venv/bin/uvicorn app.main:app --reload --log-level debug
```

### Frontend
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Format code
npm run format
```

### Database
```bash
# Create database
createdb plakshaconnect

# Drop database
dropdb plakshaconnect

# Connect to database
psql plakshaconnect

# Backup database
pg_dump plakshaconnect > backup.sql

# Restore database
psql plakshaconnect < backup.sql
```

---

## Environment Variables Checklist

### Backend (.env)
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `SECRET_KEY` - Random secret for security
- [ ] `JWT_SECRET` - Random secret for JWT
- [ ] `SMTP_HOST` - Email server (e.g., smtp.gmail.com)
- [ ] `SMTP_PORT` - Email port (usually 587)
- [ ] `SMTP_USER` - Email username
- [ ] `SMTP_PASSWORD` - Email password (App Password for Gmail)
- [ ] `SMTP_FROM` - From email address
- [ ] `CORS_ORIGINS` - Frontend URL (http://localhost:3000)

### Frontend (.env.local)
- [ ] `NEXT_PUBLIC_API_URL` - Backend URL (http://localhost:8000)

---

## API Testing with cURL

### Authentication
```bash
# Request OTP
curl -X POST http://localhost:8000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@plaksha.edu.in"}'

# Verify OTP
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@plaksha.edu.in", "otp_code": "123456"}'

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@plaksha.edu.in",
    "full_name": "Test User",
    "year": 2,
    "branch": "CSE"
  }'
```

### Profile Management
```bash
TOKEN="your_jwt_token_here"

# Get current user
curl -X GET http://localhost:8000/api/users/me \
  -H "Authorization: Bearer $TOKEN"

# Update profile
curl -X PUT http://localhost:8000/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name",
    "bio": "My new bio"
  }'

# Upload profile picture
curl -X POST http://localhost:8000/api/users/me/profile-picture \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/image.jpg"
```

### Chat
```bash
# Create group
curl -X POST http://localhost:8000/api/chat/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Study Group",
    "description": "CS Study Group"
  }'

# Get groups
curl -X GET http://localhost:8000/api/chat/groups \
  -H "Authorization: Bearer $TOKEN"

# Get messages
curl -X GET "http://localhost:8000/api/chat/groups/{group_id}/messages?limit=50" \
  -H "Authorization: Bearer $TOKEN"
```

---

## WebSocket Testing

### JavaScript (Browser Console)
```javascript
// Connect to chat
const token = 'your_jwt_token';
const groupId = 'group_uuid';
const ws = new WebSocket(`ws://localhost:8000/api/chat/ws/${groupId}?token=${token}`);

ws.onopen = () => {
  console.log('✅ Connected');
  
  // Send message
  ws.send(JSON.stringify({
    type: 'message',
    content: 'Hello from WebSocket!'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Received:', data);
};

ws.onerror = (error) => {
  console.error('❌ Error:', error);
};

ws.onclose = () => {
  console.log('👋 Disconnected');
};

// Send typing indicator
ws.send(JSON.stringify({
  type: 'typing',
  is_typing: true
}));

// Close connection
ws.close();
```

### Python (Testing Script)
```python
import asyncio
import websockets
import json

async def test_websocket():
    token = "your_jwt_token"
    group_id = "group_uuid"
    uri = f"ws://localhost:8000/api/chat/ws/{group_id}?token={token}"
    
    async with websockets.connect(uri) as websocket:
        print("✅ Connected")
        
        # Send message
        await websocket.send(json.dumps({
            "type": "message",
            "content": "Hello from Python!"
        }))
        
        # Receive messages
        while True:
            message = await websocket.recv()
            print(f"📨 Received: {message}")

asyncio.run(test_websocket())
```

---

## Database Queries

### Useful PostgreSQL Queries
```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Recent users
SELECT email, full_name, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;

-- Active locations
SELECT u.full_name, l.latitude, l.longitude, l.visibility
FROM locations l
JOIN users u ON l.user_id = u.id
WHERE l.is_active = true;

-- Chat groups with member count
SELECT g.name, COUNT(m.user_id) as member_count
FROM chat_groups g
LEFT JOIN chat_members m ON g.id = m.group_id
GROUP BY g.id, g.name;

-- Messages per group
SELECT g.name, COUNT(m.id) as message_count
FROM chat_groups g
LEFT JOIN chat_messages m ON g.id = m.group_id
GROUP BY g.id, g.name
ORDER BY message_count DESC;

-- Recent OTP requests
SELECT email, otp_code, expires_at, is_verified
FROM otp_requests
ORDER BY created_at DESC
LIMIT 10;
```

---

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'app'`
```bash
# Solution: Make sure you're in the backend directory
cd backend
./venv/bin/python -m uvicorn app.main:app --reload
```

**Problem**: `psycopg2.OperationalError: FATAL: database "plakshaconnect" does not exist`
```bash
# Solution: Create the database
createdb plakshaconnect
```

**Problem**: `ImportError: cannot import name 'X' from 'app.models.Y'`
```bash
# Solution: Check model imports in app/models/__init__.py
# Make sure all models are exported
```

**Problem**: Email not sending
```bash
# Check SMTP settings in .env
# For Gmail, use App Password (not regular password)
# Test SMTP connection:
python3 -c "
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('your-email', 'your-app-password')
print('✅ SMTP works!')
server.quit()
"
```

### Frontend Issues

**Problem**: `Module not found: Can't resolve '@/contexts'`
```bash
# Solution: Check tsconfig.json paths
# Make sure '@' is mapped to the root
npm install
```

**Problem**: API calls fail with CORS error
```bash
# Solution: Check CORS_ORIGINS in backend .env
# Should match frontend URL (http://localhost:3000)
```

**Problem**: Profile picture not displaying
```bash
# Solution: Check NEXT_PUBLIC_API_URL in .env.local
# Make sure it matches backend URL
```

### WebSocket Issues

**Problem**: WebSocket connection fails
```bash
# 1. Check JWT token is valid
# 2. Verify user is member of the group
# 3. Check WebSocket URL format: ws://localhost:8000/api/chat/ws/{group_id}?token={token}
# 4. Look at backend logs for errors
```

**Problem**: Messages not broadcasting
```bash
# Check connection manager in backend logs
# Verify multiple clients can connect
# Test with browser console (see WebSocket Testing section)
```

---

## File Structure Quick Reference

```
backend/
├── app/
│   ├── core/           # Configuration, security, database
│   ├── models/         # SQLAlchemy models
│   ├── routers/        # API endpoints
│   ├── schemas/        # Pydantic schemas
│   ├── services/       # Business logic
│   └── main.py         # FastAPI app
├── migrations/         # Alembic migrations
│   └── versions/       # Migration files
├── uploads/            # Uploaded files
│   └── profile_pictures/
├── .env               # Environment variables (not in git)
├── .env.example       # Environment template
├── requirements.txt   # Python dependencies
└── setup.sh          # Setup script

frontend/
├── app/               # Next.js pages
│   ├── profile/      # Profile page
│   ├── chat/         # Chat pages
│   ├── login/        # Login page
│   └── ...
├── components/        # Reusable components
├── contexts/          # React contexts (state)
├── hooks/            # Custom hooks
├── lib/              # Utilities
│   ├── api.ts        # API client
│   └── devMode.ts    # Dev mode config
├── types/            # TypeScript types
└── .env.local        # Environment variables (not in git)
```

---

## Git Workflow

```bash
# Check status
git status

# Create feature branch
git checkout -b feature/new-feature

# Add changes
git add .

# Commit with meaningful message
git commit -m "Add profile picture upload feature"

# Push to remote
git push origin feature/new-feature

# After review, merge to main
git checkout main
git merge feature/new-feature
git push origin main
```

---

## Performance Tips

### Backend
- Use indexes on frequently queried fields
- Implement caching (Redis) for repeated queries
- Use connection pooling (already configured)
- Paginate large result sets
- Use async database operations where possible

### Frontend
- Use Next.js Image component for images
- Implement lazy loading for lists
- Cache API responses
- Debounce search inputs
- Use React.memo for expensive components

### Database
```sql
-- Add index for email lookups
CREATE INDEX idx_users_email ON users(email);

-- Add index for location queries
CREATE INDEX idx_locations_active ON locations(is_active, user_id);

-- Add composite index for messages
CREATE INDEX idx_messages_group_created ON chat_messages(group_id, created_at DESC);
```

---

## Security Checklist

- [ ] JWT_SECRET is random and secret
- [ ] SECRET_KEY is random and secret
- [ ] SMTP password is App Password (not main password)
- [ ] CORS_ORIGINS only includes trusted domains
- [ ] Database password is strong
- [ ] .env files are in .gitignore
- [ ] File upload size limits enforced
- [ ] File upload types validated
- [ ] SQL injection prevented (using ORM)
- [ ] XSS prevented (using Pydantic validation)

---

## Deployment Checklist

### Backend
- [ ] Set `DEBUG=False` in production
- [ ] Set `ENVIRONMENT=production`
- [ ] Use production database
- [ ] Set up SSL/TLS
- [ ] Configure proper CORS origins
- [ ] Set up logging
- [ ] Configure file upload to cloud storage
- [ ] Set up WebSocket with Redis (for multiple servers)
- [ ] Add rate limiting
- [ ] Set up monitoring (Sentry, etc.)

### Frontend
- [ ] Update `NEXT_PUBLIC_API_URL` to production API
- [ ] Build optimized production bundle
- [ ] Configure CDN for static files
- [ ] Set up analytics
- [ ] Add error tracking
- [ ] Configure caching headers
- [ ] Test on mobile devices
- [ ] Add PWA support

### Database
- [ ] Set up automated backups
- [ ] Configure connection pooling
- [ ] Set up monitoring
- [ ] Create read replicas (if needed)
- [ ] Optimize indexes
- [ ] Set up migration rollback plan

---

## Useful Links

- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Next.js Docs**: https://nextjs.org/docs
- **SQLAlchemy Docs**: https://docs.sqlalchemy.org/
- **Alembic Docs**: https://alembic.sqlalchemy.org/
- **Pydantic Docs**: https://docs.pydantic.dev/
- **WebSocket Protocol**: https://datatracker.ietf.org/doc/html/rfc6455
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## Quick Fixes

```bash
# Clear Python cache
find . -type d -name __pycache__ -exec rm -rf {} +
find . -type f -name "*.pyc" -delete

# Reset database
dropdb plakshaconnect
createdb plakshaconnect
cd backend && ./venv/bin/python -m alembic upgrade head

# Clear Next.js cache
cd frontend
rm -rf .next
npm run build

# Restart everything
# Terminal 1
cd backend && ./venv/bin/uvicorn app.main:app --reload

# Terminal 2
cd frontend && npm run dev
```

---

## Support

- 📧 Email: [Your Support Email]
- 📚 Documentation: See README.md, FIXES_APPLIED.md, ENHANCEMENTS.md
- 🐛 Issues: Check backend logs and frontend console
- 💬 Community: [Your Discord/Slack]

---

**Happy Coding! 🚀**
