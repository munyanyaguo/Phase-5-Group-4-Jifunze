"""add reset_passwords table

Revision ID: 003d5328a85a
Revises: 8938196f2bb1
Create Date: 2025-09-24 12:36:03.011100

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '003d5328a85a'
down_revision = '8938196f2bb1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'reset_passwords',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=False),
        sa.Column('token', sa.String(100), nullable=False, unique=True),
        sa.Column('expires_at', sa.DateTime, nullable=False),
        sa.Column('used', sa.Boolean, nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime, server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime, server_default=sa.func.now(), nullable=False)
    )


def downgrade():
    op.drop_table('reset_passwords')