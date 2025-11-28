"""Initial schema with all models

Revision ID: 001_initial
Revises: 
Create Date: 2025-11-18 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE user_role AS ENUM ('student', 'admin', 'moderator')")
    op.execute("CREATE TYPE visibility_level AS ENUM ('public', 'friends', 'private')")
    op.execute("CREATE TYPE member_role AS ENUM ('admin', 'member')")
    op.execute("CREATE TYPE announcement_category AS ENUM ('cultural', 'academic', 'sports', 'general', 'club', 'sc')")
    op.execute("CREATE TYPE issue_category AS ENUM ('maintenance', 'wifi', 'mess', 'hostel', 'academic', 'other')")
    op.execute("CREATE TYPE issue_status AS ENUM ('open', 'in_progress', 'resolved', 'closed')")
    op.execute("CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'dinner', 'snacks')")
    op.execute("CREATE TYPE challenge_type AS ENUM ('fitness', 'academic', 'social', 'creative', 'environmental', 'wellness')")
    op.execute("CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard')")
    
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('role', postgresql.ENUM('student', 'admin', 'moderator', name='user_role'), nullable=False, server_default='student', index=True),
        sa.Column('year', sa.Integer, nullable=True),
        sa.Column('branch', sa.String(100), nullable=True),
        sa.Column('hostel', sa.String(100), nullable=True),
        sa.Column('profile_picture', sa.String(500), nullable=True),
        sa.Column('bio', sa.Text, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true', index=True),
        sa.Column('is_verified', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Create OTP requests table
    op.create_table(
        'otp_requests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String, nullable=False, index=True),
        sa.Column('otp_code', sa.String, nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_verified', sa.Boolean, nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Create locations table
    op.create_table(
        'locations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('latitude', sa.Numeric(10, 7), nullable=False),
        sa.Column('longitude', sa.Numeric(10, 7), nullable=False),
        sa.Column('address', sa.String(500), nullable=True),
        sa.Column('visibility', postgresql.ENUM('public', 'friends', 'private', name='visibility_level'), nullable=False, server_default='public'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true', index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Create chat_groups table
    op.create_table(
        'chat_groups',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true', index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Create chat_members table
    op.create_table(
        'chat_members',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('group_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chat_groups.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('role', postgresql.ENUM('admin', 'member', name='member_role'), nullable=False, server_default='member'),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
    )
    op.create_unique_constraint('unique_group_member', 'chat_members', ['group_id', 'user_id'])
    
    # Create chat_messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('group_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('chat_groups.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('is_deleted', sa.Boolean, nullable=False, server_default='false', index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Create announcements table
    op.create_table(
        'announcements',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('category', postgresql.ENUM('cultural', 'academic', 'sports', 'general', 'club', 'sc', name='announcement_category'), nullable=False, index=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Create issues table
    op.create_table(
        'issues',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('category', postgresql.ENUM('maintenance', 'wifi', 'mess', 'hostel', 'academic', 'other', name='issue_category'), nullable=False, index=True),
        sa.Column('status', postgresql.ENUM('open', 'in_progress', 'resolved', 'closed', name='issue_status'), nullable=False, server_default='open', index=True),
        sa.Column('reported_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('upvotes', sa.Integer, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
    )
    
    # Create issue_comments table
    op.create_table(
        'issue_comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('issue_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('issues.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Create teams table
    op.create_table(
        'teams',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(200), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('requirements', sa.Text, nullable=True),
        sa.Column('tags', postgresql.ARRAY(sa.String), nullable=True),
        sa.Column('created_by', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('max_members', sa.Integer, nullable=True),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default='true', index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Create team_members table
    op.create_table(
        'team_members',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('team_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('teams.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('role', sa.String(50), nullable=True),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
    )
    op.create_unique_constraint('unique_team_member', 'team_members', ['team_id', 'user_id'])
    
    # Create mess_reviews table
    op.create_table(
        'mess_reviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('date', sa.Date, nullable=False, index=True),
        sa.Column('meal_type', postgresql.ENUM('breakfast', 'lunch', 'dinner', 'snacks', name='meal_type'), nullable=False, index=True),
        sa.Column('taste_rating', sa.Integer, nullable=False),
        sa.Column('hygiene_rating', sa.Integer, nullable=False),
        sa.Column('service_rating', sa.Integer, nullable=False),
        sa.Column('portion_rating', sa.Integer, nullable=False),
        sa.Column('overall_rating', sa.Numeric(3, 2), nullable=False),
        sa.Column('comment', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_unique_constraint('unique_user_meal_review', 'mess_reviews', ['user_id', 'date', 'meal_type'])
    
    # Create challenges table
    op.create_table(
        'challenges',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('creator_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('creator_name', sa.String(255), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('description', sa.Text, nullable=False),
        sa.Column('challenge_type', postgresql.ENUM('fitness', 'academic', 'social', 'creative', 'environmental', 'wellness', name='challenge_type'), nullable=False, index=True),
        sa.Column('difficulty', postgresql.ENUM('easy', 'medium', 'hard', name='difficulty_level'), nullable=False, index=True),
        sa.Column('points', sa.Integer, nullable=False, server_default='0'),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column('max_participants', sa.Integer, nullable=True),
        sa.Column('completion_password', sa.String(100), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    
    # Create challenge_participants table
    op.create_table(
        'challenge_participants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('challenge_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('challenges.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('user_name', sa.String(255), nullable=False),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP'), index=True),
        sa.Column('completed', sa.Boolean, nullable=False, server_default='false', index=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('progress', sa.Integer, nullable=False, server_default='0'),
    )
    op.create_unique_constraint('unique_challenge_participant', 'challenge_participants', ['challenge_id', 'user_id'])
    
    # Add constraints
    op.create_check_constraint('chk_challenge_dates', 'challenges', 'end_date > start_date')
    op.create_check_constraint('chk_points_range', 'challenges', 'points >= 0 AND points <= 1000')
    op.create_check_constraint('chk_progress_range', 'challenge_participants', 'progress >= 0 AND progress <= 100')
    op.create_check_constraint('chk_taste_rating', 'mess_reviews', 'taste_rating >= 1 AND taste_rating <= 5')
    op.create_check_constraint('chk_hygiene_rating', 'mess_reviews', 'hygiene_rating >= 1 AND hygiene_rating <= 5')
    op.create_check_constraint('chk_service_rating', 'mess_reviews', 'service_rating >= 1 AND service_rating <= 5')
    op.create_check_constraint('chk_portion_rating', 'mess_reviews', 'portion_rating >= 1 AND portion_rating <= 5')


def downgrade() -> None:
    # Drop all tables
    op.drop_table('challenge_participants')
    op.drop_table('challenges')
    op.drop_table('mess_reviews')
    op.drop_table('team_members')
    op.drop_table('teams')
    op.drop_table('issue_comments')
    op.drop_table('issues')
    op.drop_table('announcements')
    op.drop_table('chat_messages')
    op.drop_table('chat_members')
    op.drop_table('chat_groups')
    op.drop_table('locations')
    op.drop_table('otp_requests')
    op.drop_table('users')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS difficulty_level')
    op.execute('DROP TYPE IF EXISTS challenge_type')
    op.execute('DROP TYPE IF EXISTS meal_type')
    op.execute('DROP TYPE IF EXISTS issue_status')
    op.execute('DROP TYPE IF EXISTS issue_category')
    op.execute('DROP TYPE IF EXISTS announcement_category')
    op.execute('DROP TYPE IF EXISTS member_role')
    op.execute('DROP TYPE IF EXISTS visibility_level')
    op.execute('DROP TYPE IF EXISTS user_role')
