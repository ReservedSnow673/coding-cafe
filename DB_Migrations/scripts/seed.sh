#!/bin/bash

# Seed script for PlakshaConnect Database
# This script inserts sample data for development and testing

set -e

echo "PlakshaConnect Database Seeding"
echo "================================"
echo ""

# Database connection parameters
DB_NAME="${DB_NAME:-plakshaconnect}"
DB_USER="${DB_USER:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "This will insert sample data into the database"
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Seeding cancelled"
    exit 0
fi

echo ""
echo "Inserting sample data..."
echo ""

psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<EOF

-- Insert sample users
INSERT INTO users (email, hashed_password, full_name, phone_number, role, year, branch, hostel, is_verified)
VALUES
    ('admin@plaksha.edu.in', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaLa3jl/YqK', 'Admin User', '+911234567890', 'admin', 4, 'Computer Science', 'Hostel A', true),
    ('student1@plaksha.edu.in', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaLa3jl/YqK', 'Student One', '+911234567891', 'student', 3, 'Computer Science', 'Hostel A', true),
    ('student2@plaksha.edu.in', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaLa3jl/YqK', 'Student Two', '+911234567892', 'student', 2, 'Mechanical Engineering', 'Hostel B', true),
    ('moderator@plaksha.edu.in', '\$2b\$12\$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5aqaLa3jl/YqK', 'Moderator User', '+911234567893', 'moderator', 4, 'Electrical Engineering', 'Hostel C', true);

-- Get user IDs for foreign key references
DO \$\$
DECLARE
    admin_id UUID;
    student1_id UUID;
    student2_id UUID;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@plaksha.edu.in';
    SELECT id INTO student1_id FROM users WHERE email = 'student1@plaksha.edu.in';
    SELECT id INTO student2_id FROM users WHERE email = 'student2@plaksha.edu.in';

    -- Insert sample announcements
    INSERT INTO announcements (title, content, category, posted_by)
    VALUES
        ('Welcome to PlakshaConnect', 'Welcome to the new campus social platform!', 'general', admin_id),
        ('Tech Talk Next Week', 'Join us for an exciting tech talk on AI and Machine Learning', 'event', admin_id),
        ('Sports Day Registration', 'Register now for the annual sports day', 'sports', admin_id);

    -- Insert sample teams
    INSERT INTO teams (name, description, created_by)
    VALUES
        ('Coding Club', 'For students passionate about coding and software development', admin_id),
        ('Robotics Team', 'Building the future with robotics', student1_id);

    -- Insert team members
    INSERT INTO team_members (team_id, user_id, role)
    SELECT t.id, student1_id, 'Member'
    FROM teams t WHERE t.name = 'Coding Club';

    INSERT INTO team_members (team_id, user_id, role)
    SELECT t.id, student2_id, 'Lead'
    FROM teams t WHERE t.name = 'Robotics Team';

    -- Insert sample issues
    INSERT INTO issues (title, description, category, status, reported_by, location)
    VALUES
        ('Broken AC in Room 101', 'The air conditioner is not working properly', 'maintenance', 'open', student1_id, 'Hostel A, Room 101'),
        ('Wi-Fi connectivity issues', 'Frequent disconnections in library', 'infrastructure', 'in_progress', student2_id, 'Library Building');

    -- Insert sample chat groups
    INSERT INTO chat_groups (name, description, created_by)
    VALUES
        ('CS 2025 Batch', 'Group for Computer Science students', student1_id),
        ('General Discussion', 'Campus-wide general discussion', admin_id);

    -- Insert sample challenges
    INSERT INTO challenges (title, description, points, created_by, start_date, end_date)
    VALUES
        ('Step Challenge', 'Walk 10,000 steps daily for a week', 100, admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days'),
        ('Code Marathon', 'Solve 50 coding problems in a month', 500, admin_id, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days');

END \$\$;

EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "Seeding completed successfully"
    echo ""
    echo "Sample data created:"
    echo "  - 4 users (1 admin, 1 moderator, 2 students)"
    echo "  - 3 announcements"
    echo "  - 2 teams with members"
    echo "  - 2 issues"
    echo "  - 2 chat groups"
    echo "  - 2 challenges"
    echo ""
    echo "Default password for all users: 'password'"
    echo ""
else
    echo ""
    echo "ERROR: Seeding failed"
    exit 1
fi
