# Setup Guide

This guide will help you set up PlakshaConnect for local development.

---

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**
- **npm** or **yarn**

---

## Clone the Repository

```bash
git clone <repository-url>
cd plaksha-connect
```

---

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 4. Run Development Server

```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`

---

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/plakshaconnect
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration (for OTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@plaksha.edu.in
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@plaksha.edu.in

# CORS
CORS_ORIGINS=http://localhost:3000

# Environment
ENVIRONMENT=development
```

### 5. Database Setup

#### Create Database

```bash
createdb plakshaconnect
```

Or using PostgreSQL CLI:

```sql
CREATE DATABASE plakshaconnect;
```

#### Run Migrations

```bash
# Initialize Alembic (first time only)
alembic init migrations

# Create initial migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head
```

### 6. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend API will be available at `http://localhost:8000`

API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## Database Migrations

### Creating a New Migration

After modifying database models:

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Applying Migrations

```bash
alembic upgrade head
```

### Reverting Migrations

```bash
# Downgrade one version
alembic downgrade -1

# Downgrade to specific version
alembic downgrade <revision_id>
```

### Viewing Migration History

```bash
alembic history
alembic current
```

---

## Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Test Frontend

Open `http://localhost:3000` in your browser. You should see the PlakshaConnect homepage.

### 3. Test WebSocket Connection

The WebSocket server runs on the same port as the backend API. Test connection at `ws://localhost:8000/ws/test`

---

## Development Workflow

### Running Both Frontend and Backend

**Option 1: Two separate terminals**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

**Option 2: Using a process manager**

Install `concurrently`:
```bash
npm install -g concurrently
```

Add to root `package.json`:
```json
{
  "scripts": {
    "dev": "concurrently \"cd backend && uvicorn app.main:app --reload\" \"cd frontend && npm run dev\""
  }
}
```

Run:
```bash
npm run dev
```

---

## Common Issues

### Port Already in Use

If port 3000 or 8000 is already in use:

**Frontend:**
```bash
PORT=3001 npm run dev
```

**Backend:**
```bash
uvicorn app.main:app --reload --port 8001
```

### Database Connection Error

Verify PostgreSQL is running:
```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql
```

Check database credentials in `.env` file.

### Python Package Installation Error

Upgrade pip:
```bash
pip install --upgrade pip
```

### Node Modules Error

Clear cache and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Next Steps

- Review the [STRUCTURE.md](./STRUCTURE.md) to understand the codebase organization
- Check [API_DOCS.md](./API_DOCS.md) for detailed API documentation
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions

---

## Development Tools

### Recommended VS Code Extensions

- **Python** (Microsoft)
- **Pylance** (Microsoft)
- **ESLint** (Microsoft)
- **Prettier** (Prettier)
- **TypeScript and JavaScript Language Features**
- **Tailwind CSS IntelliSense**
- **PostgreSQL** (Chris Kolkman)

### Code Formatting

**Backend (Python):**
```bash
pip install black isort
black .
isort .
```

**Frontend (TypeScript/JavaScript):**
```bash
npm run format
npm run lint
```

---

## Environment Variables Reference

### Frontend (.env.local)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8000` |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | `ws://localhost:8000` |

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `SECRET_KEY` | Application secret key | Random string (64+ chars) |
| `JWT_SECRET` | JWT signing secret | Random string (64+ chars) |
| `JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `30` |
| `SMTP_HOST` | Email server host | `smtp.gmail.com` |
| `SMTP_PORT` | Email server port | `587` |
| `SMTP_USER` | Email username | `your-email@plaksha.edu.in` |
| `SMTP_PASSWORD` | Email password | App-specific password |
| `SMTP_FROM` | From email address | `noreply@plaksha.edu.in` |
| `CORS_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `ENVIRONMENT` | Environment mode | `development` |

---

For additional help, refer to the documentation or create an issue in the repository.
