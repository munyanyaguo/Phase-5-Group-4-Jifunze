"""Add phone column to schools safely

Revision ID: bcf92740b66c
Revises: ffd60cb92927
Create Date: 2025-09-27
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = 'bcf92740b66c'
down_revision = 'ffd60cb92927'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = inspect(conn)

    # --- ATTENDANCE ---
    attendance_cols = [c['name'] for c in inspector.get_columns('attendance')]
    with op.batch_alter_table('attendance') as batch_op:
        if 'user_id' not in attendance_cols:
            batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        if 'verified_by' not in attendance_cols:
            batch_op.add_column(sa.Column('verified_by', sa.String(length=50), nullable=True))
        # drop old column only if exists
        if 'verified_by_public_id' in attendance_cols:
            batch_op.drop_column('verified_by_public_id')

    # Populate user_id from user_public_id safely
    if 'user_public_id' in attendance_cols:
        op.execute("""
            UPDATE attendance a
            SET user_id = u.id
            FROM users u
            WHERE a.user_public_id = u.public_id
        """)

    with op.batch_alter_table('attendance') as batch_op:
        if 'user_id' in attendance_cols or 'user_id' not in attendance_cols:
            batch_op.alter_column('user_id', nullable=False)

    # --- ENROLLMENTS ---
    enroll_cols = [c['name'] for c in inspector.get_columns('enrollments')]
    with op.batch_alter_table('enrollments') as batch_op:
        if 'user_id' not in enroll_cols:
            batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))

    if 'user_public_id' in enroll_cols:
        op.execute("""
            UPDATE enrollments e
            SET user_id = u.id
            FROM users u
            WHERE e.user_public_id = u.public_id
        """)

    with op.batch_alter_table('enrollments') as batch_op:
        batch_op.alter_column('user_id', nullable=False)

    # --- SCHOOLS ---
    schools_cols = [c['name'] for c in inspector.get_columns('schools')]
    with op.batch_alter_table('schools') as batch_op:
        if 'phone' not in schools_cols:
            batch_op.add_column(sa.Column('phone', sa.String(length=20), nullable=True))
        batch_op.alter_column('name',
               existing_type=sa.VARCHAR(length=100),
               type_=sa.String(length=150),
               existing_nullable=False)

    # --- TIMESTAMP CORRECTIONS ---
    for table in ['attendance', 'enrollments', 'courses', 'messages', 'reset_passwords', 'resources', 'schools', 'users']:
        with op.batch_alter_table(table) as batch_op:
            for col in ['created_at', 'updated_at']:
                if col in [c['name'] for c in inspector.get_columns(table)]:
                    batch_op.alter_column(col,
                        existing_type=postgresql.TIMESTAMP(),
                        type_=sa.DateTime(timezone=True),
                        existing_nullable=True
                    )
