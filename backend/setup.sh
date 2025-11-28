#!/bin/bash

# PlakshaConnect Backend Setup Script
# This script helps initialize the database and set up the backend

set -e

echo "PlakshaConnect Backend Setup"
echo "============================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

if [ ! -f ".env" ]; then
    echo -e "${YELLOW}WARNING: No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}Please edit .env file with your database credentials and SMTP settings${NC}"
    echo ""
    read -p "Press enter to continue after editing .env..."
fi

export $(cat .env | grep -v '^#' | xargs)

echo "Installing Python dependencies..."
./venv/bin/pip install -r requirements.txt

echo ""
echo "Database Setup"
echo "=============="

if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${RED}ERROR: PostgreSQL is not running on localhost:5432${NC}"
    echo "Please start PostgreSQL and try again"
    exit 1
fi

echo -e "${GREEN}[OK]${NC} PostgreSQL is running"

# Extract database name from DATABASE_URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')

echo ""
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo ""

if psql -h localhost -U $DB_USER -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo -e "${GREEN}[OK]${NC} Database '$DB_NAME' exists"
else
    echo -e "${YELLOW}WARNING: Database '$DB_NAME' does not exist${NC}"
    read -p "Create database? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        createdb -h localhost -U $DB_USER $DB_NAME
        echo -e "${GREEN}[OK]${NC} Database created"
    else
        echo -e "${RED}ERROR: Cannot proceed without database${NC}"
        exit 1
    fi
fi

echo ""
echo "Running database migrations..."
./venv/bin/python -m alembic upgrade head

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "To start the server:"
echo "  ./venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "API Documentation will be available at:"
echo "  http://localhost:8000/docs"
echo ""
