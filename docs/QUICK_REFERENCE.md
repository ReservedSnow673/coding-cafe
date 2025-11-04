# PlakshaConnect - Quick Reference Guide

## 🚀 Quick Start Commands

### First Time Setup
```bash
# 1. Install PostgreSQL (if not already installed)
brew install postgresql@15
brew services start postgresql@15

# 2. Run the automated setup script
./setup.sh
```

### Daily Development

**Terminal 1 - Backend**
```bash
cd backend
conda activate ./venv
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm run dev
```

## 📋 Common Commands

### Backend

```bash
# Activate Python environment
cd backend && conda activate ./venv

# Install new package
pip install package-name
pip freeze > requirements.txt

# Database migrations
alembic revision --autogenerate -m "Description"  # Create migration
alembic upgrade head                              # Apply migrations
alembic downgrade -1                              # Rollback one version
alembic history                                   # View migration history
alembic current                                   # Current migration version

# Run backend server
uvicorn app.main:app --reload                     # With auto-reload
uvicorn app.main:app --host 0.0.0.0 --port 8000  # Custom host/port

# Run tests (when implemented)
pytest
pytest --cov=app                                  # With coverage
```

### Frontend

```bash
# Install new package
npm install package-name

# Development
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint

# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Database

```bash
# Connect to PostgreSQL
psql plakshaconnect

# Common psql commands
\dt                 # List all tables
\d table_name       # Describe table
\l                  # List databases
\c database_name    # Connect to database
\q                  # Quit

# Backup and restore
pg_dump plakshaconnect > backup.sql           # Backup
psql plakshaconnect < backup.sql              # Restore

# Reset database
dropdb plakshaconnect && createdb plakshaconnect
cd backend && alembic upgrade head
```

## 🔗 URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js app |
| Backend API | http://localhost:8000 | FastAPI server |
| API Docs (Swagger) | http://localhost:8000/docs | Interactive API documentation |
| API Docs (ReDoc) | http://localhost:8000/redoc | Alternative API docs |

## 📁 Important Files

### Configuration
- `backend/.env` - Backend environment variables
- `backend/alembic.ini` - Database migration config
- `frontend/next.config.js` - Next.js configuration
- `frontend/tailwind.config.js` - Tailwind CSS config

### Entry Points
- `backend/app/main.py` - FastAPI application
- `frontend/app/page.tsx` - Frontend homepage
- `frontend/app/layout.tsx` - Root layout

## 🗄️ Database Models

| Model | File | Description |
|-------|------|-------------|
| User | `models/user.py` | User authentication and profiles |
| OTPRequest | `models/otp.py` | Email/phone verification |
| Location | `models/location.py` | Location sharing |
| ChatGroup | `models/chat.py` | Group chats |
| ChatMessage | `models/chat.py` | Chat messages |
| Announcement | `models/announcement.py` | Campus announcements |
| Issue | `models/issue.py` | Issue reporting |
| IssueComment | `models/issue.py` | Issue comments |
| Team | `models/team.py` | Student teams/clubs |
| TeamMember | `models/team.py` | Team membership |
| MessReview | `models/mess_review.py` | Mess meal reviews |
| Challenge | `models/challenge.py` | Campus challenges |
| ChallengeCompletion | `models/challenge.py` | Challenge tracking |

## 🛠️ Troubleshooting

### Backend won't start
```bash
# Check if conda environment is activated
conda activate ./venv

# Verify Python version (should be 3.12.x)
python --version

# Reinstall dependencies
pip install -r requirements.txt

# Check if port 8000 is already in use
lsof -ti:8000 | xargs kill -9
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf .next node_modules package-lock.json
npm install

# Check if port 3000 is in use
lsof -ti:3000 | xargs kill -9
```

### Database connection issues
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql
# or
pg_ctl status

# Start PostgreSQL
brew services start postgresql@15

# Verify database exists
psql -l | grep plakshaconnect

# Check credentials in backend/.env
cat backend/.env | grep DATABASE_URL
```

### Migration errors
```bash
# Check current migration state
cd backend
alembic current

# View pending migrations
alembic history

# Reset migrations (CAUTION: deletes data!)
alembic downgrade base
rm migrations/versions/*.py
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong secrets** - Generate with:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. **Different secrets for dev/prod** - Use separate `.env` files
4. **Keep dependencies updated** - Regular `npm audit` and `pip list --outdated`

## 📦 Adding New Features

### New API Endpoint
1. Create router in `backend/app/routers/`
2. Define Pydantic schemas
3. Implement endpoint logic
4. Add router to `backend/app/main.py`
5. Test at http://localhost:8000/docs

### New Frontend Page
1. Create file in `frontend/app/[route]/page.tsx`
2. Add components in `frontend/components/`
3. Use API client from `frontend/lib/api.ts`
4. Add navigation links

### New Database Table
1. Create model in `backend/app/models/`
2. Import in `backend/migrations/env.py`
3. Generate migration: `alembic revision --autogenerate -m "Add new table"`
4. Review migration file
5. Apply: `alembic upgrade head`

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 💬 Need Help?

Check these files:
- `README.md` - Complete project overview
- `CURRENT_STATUS.md` - Setup status and next steps
- `docs/SETUP.md` - Detailed setup guide
- `docs/API_DOCS.md` - API reference

## 🎯 Development Workflow

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Update dependencies**
   ```bash
   cd backend && pip install -r requirements.txt
   cd ../frontend && npm install
   ```

3. **Run migrations**
   ```bash
   cd backend
   alembic upgrade head
   ```

4. **Start development servers**
   ```bash
   # Terminal 1
   cd backend && conda activate ./venv && uvicorn app.main:app --reload
   
   # Terminal 2
   cd frontend && npm run dev
   ```

5. **Make changes and test**

6. **Commit and push**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin feature-branch
   ```
