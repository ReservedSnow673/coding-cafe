#!/bin/bash

# Rollback script for PlakshaConnect Database
# This script drops all tables in reverse order to handle foreign key constraints

set -e

echo "PlakshaConnect Database Rollback"
echo "================================"
echo ""
echo "WARNING: This will delete all tables and data!"
echo ""

# Database connection parameters
DB_NAME="${DB_NAME:-plakshaconnect}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

read -p "Are you sure you want to continue? (type 'yes' to confirm) " -r
echo ""
if [[ ! $REPLY == "yes" ]]; then
    echo "Rollback cancelled"
    exit 0
fi

echo "Starting rollback..."
echo ""

# Drop tables in reverse order (to respect foreign key constraints)
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF

-- Drop tables in reverse order
DROP TABLE IF EXISTS challenge_completions CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS mess_reviews CASCADE;
DROP TABLE IF EXISTS team_members CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS issue_comments CASCADE;
DROP TABLE IF EXISTS issues CASCADE;
DROP TABLE IF EXISTS announcements CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS chat_groups CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS otp_requests CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop custom types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS visibility_level CASCADE;
DROP TYPE IF EXISTS announcement_category CASCADE;
DROP TYPE IF EXISTS issue_status CASCADE;
DROP TYPE IF EXISTS issue_category CASCADE;
DROP TYPE IF EXISTS meal_type CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "Rollback completed successfully"
    echo "All tables, types, and functions have been dropped"
else
    echo ""
    echo "ERROR: Rollback failed"
    exit 1
fi
