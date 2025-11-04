# Database Schema Synchronization

## Status

Backend SQLAlchemy models are now synchronized with the SQL table definitions.

## Changes Made

### 1. Users (users.py)
- Updated role enum: student, admin, moderator
- Added: hashed_password, full_name, phone_number, branch, bio
- Added: is_active, is_verified flags
- Renamed: name -> full_name, course -> branch
- Removed: club_admin, sc_admin roles

### 2. Locations (location.py)
- Renamed enum: LocationVisibility -> VisibilityLevel
- Updated values: all->public, added private
- Added: address, is_active flag, updated_at
- Removed: expires_at field
- Updated precision: latitude(10,8), longitude(11,8)

### 3. Chat Groups & Messages (chat.py)
- Removed: ChatGroupType enum and type/context_id fields
- Added: description, is_active, updated_at to ChatGroup
- Added: is_deleted, updated_at to ChatMessage
- Renamed: sender_id -> user_id in ChatMessage

### 4. Announcements (announcement.py)
- Updated categories: added event, urgent, club
- Removed: cultural category
- Added: is_active flag, updated_at
- Removed: expires_at field

### 5. Issues (issue.py)
- Updated IssueCategory: infrastructure, food, maintenance, security, other
- Updated IssueStatus: added closed state
- Added: location (string), image_url, updated_at
- Removed: resolved_by, upvotes, resolved_at

### 6. Teams (team.py)
- Added: is_active, logo_url, updated_at
- Removed: requirements, tags, max_members
- TeamMember: Added role field, unique constraint

### 7. Mess Reviews (mess_review.py)
- Simplified: single rating field (1-5) instead of multiple ratings
- Renamed: comment -> review, date -> meal_date
- Added: snacks to MealType enum, updated_at
- Added: unique constraint (user, meal_type, meal_date)

### 8. Challenges (challenge.py)
- Added: is_active, updated_at
- Added: date validation constraint
- ChallengeCompletion: Added proof_url, unique constraint

## Database Compatibility

The backend now uses:
- Explicit ENUM names (e.g., 'user_role', 'visibility_level')
- Matching column types and constraints
- Identical indexes and relationships
- Same CHECK and UNIQUE constraints

## Migration Options

### Option 1: Direct SQL Migration
```bash
cd DB_Migrations/scripts
./migrate.sh
```

### Option 2: Alembic Migration
```bash
cd backend
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

Both methods will create identical database schemas.

## Verification

After migration, verify schemas match:

```bash
# Check table structure
psql plakshaconnect -c "\d users"

# Check enum types
psql plakshaconnect -c "\dT+"

# Compare with backend models
cd backend
python -c "from app.models.user import User; print(User.__table__.columns)"
```

## Notes

- All ENUMs are now properly named for PostgreSQL
- All varchar fields have explicit length limits
- All tables have proper indexes matching SQL definitions
- Timestamps use timezone-aware DateTime
- Foreign keys all use CASCADE on delete
- Unique constraints match between SQL and ORM
