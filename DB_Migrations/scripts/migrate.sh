#!/bin/bash

# Migration script for PlakshaConnect Database
# This script creates all database tables in the correct order

set -e

echo "Starting PlakshaConnect Database Migration"
echo "=========================================="
echo ""

# Database connection parameters
DB_NAME="${DB_NAME:-plakshaconnect}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Function to execute SQL file
execute_sql_file() {
    local file=$1
    local filename=$(basename "$file")
    echo "Executing: $filename"
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file"
    if [ $? -eq 0 ]; then
        echo "SUCCESS: $filename"
    else
        echo "ERROR: Failed to execute $filename"
        exit 1
    fi
    echo ""
}

# Check if database exists
echo "Checking database connection..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT version();" > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Cannot connect to database '$DB_NAME'"
    echo "Please ensure PostgreSQL is running and the database exists"
    echo ""
    echo "To create the database, run:"
    echo "  createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME"
    exit 1
fi

echo "Database connection successful"
echo ""

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TABLE_MODELS_DIR="$SCRIPT_DIR/../table_Models"

# Check if table_Models directory exists
if [ ! -d "$TABLE_MODELS_DIR" ]; then
    echo "ERROR: table_Models directory not found at $TABLE_MODELS_DIR"
    exit 1
fi

echo "Migration Steps:"
echo "1. Create ENUM types and base functions"
echo "2. Create all tables with foreign key relationships"
echo "3. Create indexes for performance optimization"
echo "4. Create triggers for automatic timestamp updates"
echo ""

read -p "Continue with migration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "Starting table creation..."
echo "=========================="
echo ""

# Execute SQL files in order
for sql_file in "$TABLE_MODELS_DIR"/*.sql; do
    if [ -f "$sql_file" ]; then
        execute_sql_file "$sql_file"
    fi
done

echo ""
echo "=========================================="
echo "Migration completed successfully!"
echo "=========================================="
echo ""
echo "Created tables:"
echo "  1. users - User accounts and profiles"
echo "  2. otp_requests - OTP verification"
echo "  3. locations - Location sharing"
echo "  4. chat_groups - Group chats"
echo "  5. chat_messages - Chat messages"
echo "  6. announcements - Campus announcements"
echo "  7. issues - Issue reporting"
echo "  8. issue_comments - Issue comments"
echo "  9. teams - Student teams/clubs"
echo " 10. team_members - Team membership"
echo " 11. mess_reviews - Meal reviews"
echo " 12. challenges - Campus challenges"
echo " 13. challenge_completions - Challenge tracking"
echo ""
echo "Database is ready for use!"
