"""Add scheduling and pinning to announcements

Revision ID: 004_announcement_schedule
Revises: 003_notifications
Create Date: 2025-11-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_announcement_schedule'
down_revision = '003_notifications'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to announcements table
    op.add_column('announcements', sa.Column('is_pinned', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('announcements', sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('announcements', sa.Column('expires_at', sa.DateTime(timezone=True), nullable=True))
    
    # Create indexes
    op.create_index(op.f('ix_announcements_is_pinned'), 'announcements', ['is_pinned'], unique=False)
    op.create_index(op.f('ix_announcements_scheduled_at'), 'announcements', ['scheduled_at'], unique=False)
    op.create_index(op.f('ix_announcements_expires_at'), 'announcements', ['expires_at'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_announcements_expires_at'), table_name='announcements')
    op.drop_index(op.f('ix_announcements_scheduled_at'), table_name='announcements')
    op.drop_index(op.f('ix_announcements_is_pinned'), table_name='announcements')
    
    # Drop columns
    op.drop_column('announcements', 'expires_at')
    op.drop_column('announcements', 'scheduled_at')
    op.drop_column('announcements', 'is_pinned')
