"""Merge teammate's and my UUID changes (no-op)

Revision ID: 519b8e00b4fb
Revises: bcf92740b66c, be71704f8178
Create Date: 2025-09-28 13:45:07.014385

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '519b8e00b4fb'
down_revision = ('bcf92740b66c', 'be71704f8178')
branch_labels = None
depends_on = None


def upgrade():
    # This is a merge migration; no schema changes.
    pass


def downgrade():
    # This is a merge migration; no schema changes.
    pass
