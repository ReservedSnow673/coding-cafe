"""Add buildings table and building_id to locations

Revision ID: 002_buildings
Revises: 001_initial
Create Date: 2025-11-18

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_buildings'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create building_type enum
    building_type_enum = postgresql.ENUM('academic', 'hostel', 'dining', 'sports', 'administrative', 'recreational', 'library', 'other', name='buildingtype')
    building_type_enum.create(op.get_bind())
    
    # Create buildings table
    op.create_table('buildings',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('code', sa.String(length=20), nullable=True),
        sa.Column('building_type', sa.Enum('academic', 'hostel', 'dining', 'sports', 'administrative', 'recreational', 'library', 'other', name='buildingtype'), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('floor_count', sa.String(length=10), nullable=True),
        sa.Column('capacity', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('code'),
        sa.UniqueConstraint('name')
    )
    
    # Add building_id to locations table
    op.add_column('locations', sa.Column('building_id', postgresql.UUID(as_uuid=True), nullable=True))
    op.create_index(op.f('ix_locations_building_id'), 'locations', ['building_id'], unique=False)
    op.create_foreign_key('fk_locations_building_id', 'locations', 'buildings', ['building_id'], ['id'], ondelete='SET NULL')


def downgrade() -> None:
    # Remove building_id from locations
    op.drop_constraint('fk_locations_building_id', 'locations', type_='foreignkey')
    op.drop_index(op.f('ix_locations_building_id'), table_name='locations')
    op.drop_column('locations', 'building_id')
    
    # Drop buildings table
    op.drop_table('buildings')
    
    # Drop enum
    building_type_enum = postgresql.ENUM('academic', 'hostel', 'dining', 'sports', 'administrative', 'recreational', 'library', 'other', name='buildingtype')
    building_type_enum.drop(op.get_bind())
