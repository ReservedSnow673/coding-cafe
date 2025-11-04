# PlakshaConnect - Current Setup Status

## ✅ Completed Tasks

### Frontend Setup
- ✅ Created Next.js 14 project with TypeScript
- ✅ Configured Tailwind CSS 3.3.6
- ✅ Installed all dependencies (402 packages)
- ✅ Created base layout and homepage
- ✅ Set up Axios API client with interceptors
- ✅ Created type definitions for User and AuthResponse
- ✅ Prepared folder structure for components, hooks, and contexts

### Backend Setup
- ✅ Created FastAPI project structure
- ✅ Set up Python 3.12.12 environment using conda (to avoid Python 3.13 compatibility issues)
- ✅ Installed all backend dependencies successfully:
  - FastAPI 0.104.1
  - Uvicorn 0.24.0
  - SQLAlchemy 2.0.23
  - Alembic 1.13.0
  - Pydantic 2.4.2
  - psycopg2-binary 2.9.9
  - python-jose, passlib, websockets, and other required packages
- ✅ Created core modules (config, database, security)
- ✅ Created all database models:
  - User (with UserRole enum)
  - OTPRequest
  - Location (with VisibilityLevel enum)
  - ChatGroup and ChatMessage
  - Announcement (with AnnouncementCategory enum)
  - Issue and IssueComment (with IssueStatus and IssueCategory enums)
  - Team and TeamMember
  - MessReview (with MealType enum)
  - Challenge and ChallengeCompletion
- ✅ Configured Alembic for database migrations
- ✅ Created `.env.example` and `.env` files

## 🔄 Next Steps (Required to Complete Setup)

### 1. Install PostgreSQL
PostgreSQL is required for the database. You have two options:

**Option A: Install via Homebrew (Recommended for macOS)**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Option B: Install Postgres.app**
- Download from https://postgresapp.com/
- This provides a GUI and is easier to manage

### 2. Create the Database
Once PostgreSQL is installed and running:

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE plakshaconnect;

# Create user (or use existing postgres user)
CREATE USER your_username WITH PASSWORD 'your_password';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE plakshaconnect TO your_username;

# Exit
\q
```

### 3. Update Environment Variables
Edit `backend/.env` with your actual database credentials:

```properties
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/plakshaconnect
SECRET_KEY=<generate-a-strong-random-key>
JWT_SECRET=<generate-another-strong-random-key>
```

To generate secure keys:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 4. Run Database Migrations
After PostgreSQL is set up and credentials are configured:

```bash
cd backend

# Activate the conda environment
conda activate ./venv

# Create initial migration
alembic revision --autogenerate -m "Initial migration with all tables"

# Apply migrations to database
alembic upgrade head
```

### 5. Start the Backend Server
```bash
cd backend
conda activate ./venv
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000
- API docs: http://localhost:8000/docs
- Alternative docs: http://localhost:8000/redoc

### 6. Start the Frontend Server
In a new terminal:
```bash
cd frontend
npm run dev
```

The frontend will be available at http://localhost:3000

## 📁 Project Structure

```
CC Uni Social Platform/
├── frontend/                    # Next.js frontend
│   ├── app/                    # Next.js 14 app directory
│   ├── components/             # React components
│   ├── lib/                    # Utilities (API client)
│   ├── types/                  # TypeScript type definitions
│   ├── package.json            # Node dependencies
│   └── ...config files
│
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── core/              # Core functionality
│   │   │   ├── config.py      # Settings
│   │   │   ├── database.py    # SQLAlchemy setup
│   │   │   └── security.py    # JWT, passwords, OTP
│   │   ├── models/            # SQLAlchemy models (9 files)
│   │   ├── routers/           # API endpoints (to be created)
│   │   └── main.py            # FastAPI app
│   ├── migrations/            # Alembic migrations
│   ├── venv/                  # Python 3.12 conda environment
│   ├── requirements.txt       # Python dependencies
│   ├── alembic.ini           # Alembic configuration
│   ├── .env                   # Environment variables
│   └── .env.example           # Example environment file
│
├── README.md                   # Project documentation
└── CURRENT_STATUS.md          # This file
```

## 🗃️ Database Schema

The migration will create the following tables:
- **users** - User accounts with roles and authentication
- **otp_requests** - OTP verification for email/phone
- **locations** - User location sharing
- **chat_groups** - Group chats
- **chat_messages** - Messages in group chats
- **announcements** - Campus announcements with categories
- **issues** - Issue reporting system
- **issue_comments** - Comments on issues
- **teams** - Student teams/clubs
- **team_members** - Team membership
- **mess_reviews** - Meal ratings and reviews
- **challenges** - Campus challenges
- **challenge_completions** - User challenge completion tracking

## 🐛 Issues Resolved

1. **Python 3.13 Compatibility**: Initially tried with Python 3.13, but encountered build errors with `psycopg2-binary` and `pydantic-core`. Resolved by creating a new conda environment with Python 3.12.12.

2. **psycopg2 vs psycopg2-binary**: Initially tried `psycopg2` which required PostgreSQL development libraries. Switched to `psycopg2-binary` which includes pre-compiled binaries.

## 💡 Tips

### Running Backend with Conda Environment
The backend uses a conda environment located at `backend/venv/`. To activate it:

```bash
cd backend
conda activate ./venv
```

### Database Management
- View migrations: `alembic history`
- Create new migration: `alembic revision --autogenerate -m "description"`
- Upgrade to latest: `alembic upgrade head`
- Downgrade one version: `alembic downgrade -1`
- Reset database: `alembic downgrade base && alembic upgrade head`

### API Development
- FastAPI automatically generates documentation at `/docs`
- Test API endpoints using the interactive docs
- Use the provided axios client in `frontend/lib/api.ts` for API calls

## 📝 Environment File Example

Make sure your `backend/.env` file has these variables:

```properties
# Database (update with your credentials)
DATABASE_URL=postgresql://your_user:your_pass@localhost:5432/plakshaconnect

# Security (generate strong random keys)
SECRET_KEY=your-secret-key
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (configure if you need OTP functionality)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-specific-password
SMTP_FROM=noreply@plakshaconnect.com

# CORS (add your frontend URL)
CORS_ORIGINS=http://localhost:3000

# Environment
ENVIRONMENT=development
DEBUG=True
```

## 🚀 Ready to Code!

Once you complete the "Next Steps" section above, you'll have:
- ✅ A fully functional Next.js frontend
- ✅ A FastAPI backend with all models defined
- ✅ PostgreSQL database with all tables created
- ✅ Development servers running
- ✅ API documentation available

You can then start building the actual features:
1. Authentication endpoints (register, login, OTP verification)
2. Location sharing APIs
3. Chat functionality with WebSockets
4. Announcements system
5. Issue reporting
6. Teams/clubs management
7. Mess reviews
8. Campus challenges

Happy coding! 🎉
