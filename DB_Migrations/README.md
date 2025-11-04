# Database Migrations

This directory contains SQL table definitions and migration scripts for the PlakshaConnect database.

## Directory Structure

```
DB_Migrations/
├── table_Models/          SQL table definitions
│   ├── 01_users.sql
│   ├── 02_otp_requests.sql
│   ├── 03_locations.sql
│   ├── 04_chat_groups.sql
│   ├── 05_chat_messages.sql
│   ├── 06_announcements.sql
│   ├── 07_issues.sql
│   ├── 08_issue_comments.sql
│   ├── 09_teams.sql
│   ├── 10_team_members.sql
│   ├── 11_mess_reviews.sql
│   ├── 12_challenges.sql
│   └── 13_challenge_completions.sql
└── scripts/               Migration scripts
    ├── migrate.sh         Create all tables
    ├── rollback.sh        Drop all tables
    └── seed.sh            Insert sample data
```

## Prerequisites

- PostgreSQL 12 or higher installed
- Database created: `plakshaconnect`
- psql command-line tool available

## Quick Start

### 1. Create Database

```bash
createdb plakshaconnect
```

Or using psql:

```bash
psql postgres -c "CREATE DATABASE plakshaconnect;"
```

### 2. Run Migration

```bash
cd DB_Migrations/scripts
./migrate.sh
```

This will:
- Create all ENUM types
- Create all tables with proper relationships
- Create indexes for performance
- Create triggers for timestamp updates

### 3. Seed Sample Data (Optional)

```bash
./seed.sh
```

This inserts sample data for development:
- 4 users (admin, moderator, 2 students)
- 3 announcements
- 2 teams with members
- 2 issues
- 2 chat groups
- 2 challenges

Default password for all users: `password`

## Environment Variables

You can customize database connection using environment variables:

```bash
export DB_NAME=plakshaconnect
export DB_USER=postgres
export DB_HOST=localhost
export DB_PORT=5432

./migrate.sh
```

## Database Schema

### Users & Authentication
- **users** - User accounts with roles (student, admin, moderator)
- **otp_requests** - OTP verification for email/phone

### Social Features
- **locations** - User location sharing with visibility controls
- **chat_groups** - Group chat information
- **chat_messages** - Individual chat messages

### Campus Features
- **announcements** - Campus-wide announcements by category
- **issues** - Issue reporting with status tracking
- **issue_comments** - Comments on issues
- **teams** - Student teams and clubs
- **team_members** - Team membership with roles

### Activities
- **mess_reviews** - Meal ratings and reviews
- **challenges** - Campus challenges with points
- **challenge_completions** - User challenge tracking

## ENUM Types

The following PostgreSQL ENUM types are used:

- `user_role`: student, admin, moderator
- `visibility_level`: public, friends, private
- `announcement_category`: academic, event, general, urgent, sports, club
- `issue_status`: open, in_progress, resolved, closed
- `issue_category`: infrastructure, food, maintenance, security, other
- `meal_type`: breakfast, lunch, dinner, snacks

## Indexes

All tables include optimized indexes for:
- Foreign key relationships
- Frequently queried columns
- Composite indexes for common queries
- Timestamp-based sorting

## Triggers

Automatic `updated_at` timestamp triggers are set on all tables that have an `updated_at` column.

## Rollback

To drop all tables and start fresh:

```bash
cd DB_Migrations/scripts
./rollback.sh
```

WARNING: This will delete all data!

## Manual Migration

To run individual table creation:

```bash
psql -d plakshaconnect -f table_Models/01_users.sql
psql -d plakshaconnect -f table_Models/02_otp_requests.sql
# ... and so on
```

## Integration with Backend

The backend uses SQLAlchemy ORM with Alembic for migrations. These SQL files serve as:

1. **Documentation** - Clear schema reference
2. **Direct Migration** - Can be used instead of Alembic
3. **Database Setup** - Quick setup for development/production

To use with the backend:

```bash
# Option 1: Use these SQL migrations
cd DB_Migrations/scripts
./migrate.sh

# Option 2: Use Alembic (backend must match these schemas)
cd backend
alembic upgrade head
```

Both methods create the same database schema.

## Verification

After migration, verify tables:

```bash
psql plakshaconnect -c "\dt"
```

Check a specific table:

```bash
psql plakshaconnect -c "\d users"
```

View all indexes:

```bash
psql plakshaconnect -c "\di"
```

## Best Practices

1. **Always backup** before running migrations in production
2. **Test migrations** in development first
3. **Use transactions** - Migration script uses `set -e` for safety
4. **Verify schemas** match backend models
5. **Document changes** when modifying tables

## Troubleshooting

### Connection Failed

```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL
brew services start postgresql@15
```

### Database Does Not Exist

```bash
createdb plakshaconnect
```

### Permission Denied

```bash
# Grant permissions
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE plakshaconnect TO your_user;"
```

### Foreign Key Violations

Ensure tables are created in order (the migrate.sh script handles this).

## Maintenance

### Backup Database

```bash
pg_dump plakshaconnect > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
psql plakshaconnect < backup_20250104.sql
```

### Reset Development Database

```bash
./rollback.sh
./migrate.sh
./seed.sh
```
