"""merge multiple heads (no-op)

Revision ID: 1ffd9a2da04f
Revises: 003d5328a85a, 15fd3a346d2e
Create Date: 2025-09-24 23:35:02.621402

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1ffd9a2da04f'
down_revision = ('003d5328a85a', '15fd3a346d2e')
branch_labels = None
depends_on = None


def upgrade():
    # This is a merge migration; no schema changes.
    pass


def downgrade():
    # This is a merge migration; no schema changes.
    pass
