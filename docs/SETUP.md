# Setup Guide

Local development setup for PlakshaConnect.

## Prerequisites

Install these before starting:

- Node.js 18+
- Python 3.10+
- PostgreSQL 14+
- Git

## Getting Started

Clone the repository:

```bash
git clone https://github.com/ReservedSnow673/coding-cafe.git
cd coding-cafe
```

---

## Frontend Setup

Navigate to frontend and install dependencies:

```bash
cd frontend
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

Start the dev server:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## Backend Setup

Navigate to backend and set up Python environment:

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` file:

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

### Database Setup

Create the database:

```bash
createdb plakshaconnect
```

Run migrations:

```bash
alembic upgrade head
```

### Start Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000`

API docs available at:
- Swagger: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

---

## Database Migrations

Create new migration after model changes:

```bash
alembic revision --autogenerate -m "Add new field"
alembic upgrade head
```

Rollback if needed:

```bash
alembic downgrade -1
```

View migration history:

```bash
alembic history
```

---

## Verify Setup

Check backend health:

```bash
curl http://localhost:8000/health
```

Should return:
```json
{"status": "healthy", "database": "connected", "version": "2.0.0"}
```

Open `http://localhost:3000` to see the frontend.

---

## Development Workflow

Run both servers in separate terminals:

Terminal 1 - Backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

---

## Troubleshooting

**Port conflict**: Change port in command
```bash
PORT=3001 npm run dev  # Frontend
uvicorn app.main:app --reload --port 8001  # Backend
```

**Database connection fails**: Check PostgreSQL is running
```bash
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

**Python package errors**: Upgrade pip
```bash
pip install --upgrade pip
```

**Node modules issues**: Clean install
```bash
rm -rf node_modules package-lock.json && npm install
```

---

## Next Steps

- Check [API.md](./API.md) for complete API documentation
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

## Code Formatting

Backend:
```bash
pip install black isort
black .
isort .
```

Frontend:
```bash
npm run format
npm run lint
```

---

## Environment Variables

**Frontend** `.env.local`:
- `NEXT_PUBLIC_API_URL` - Backend URL (default: `http://localhost:8000`)
- `NEXT_PUBLIC_WS_URL` - WebSocket URL (default: `ws://localhost:8000`)

**Backend** `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - App secret (generate random 64+ chars)
- `JWT_SECRET` - JWT signing key (generate random 64+ chars)
- `JWT_ALGORITHM` - `HS256`
- `ACCESS_TOKEN_EXPIRE_MINUTES` - Token validity (default: `30`)
- `SMTP_HOST` - Email server (e.g., `smtp.gmail.com`)
- `SMTP_PORT` - Email port (usually `587`)
- `SMTP_USER` - Your @plaksha.edu.in email
- `SMTP_PASSWORD` - App-specific password
- `SMTP_FROM` - Sender email (e.g., `noreply@plaksha.edu.in`)
- `CORS_ORIGINS` - Allowed origins (e.g., `http://localhost:3000`)
- `ENVIRONMENT` - `development` or `production`

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).
