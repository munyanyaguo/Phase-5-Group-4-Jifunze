"""Update attendance, enrollments, messages, and resources schemas to maintain UUID references safely for production

Revision ID: ffd60cb92927
Revises: 8cac0639ef94
Create Date: 2025-09-27
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.engine.reflection import Inspector
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = 'ffd60cb92927'
down_revision = '8cac0639ef94'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = inspect(conn)

    # --- ATTENDANCE ---
    attendance_cols = [c['name'] for c in inspector.get_columns('attendance')]
    with op.batch_alter_table("attendance") as batch_op:
        if "user_public_id" not in attendance_cols:
            batch_op.add_column(sa.Column("user_public_id", sa.String(50), nullable=True))
        if "verified_by_public_id" not in attendance_cols:
            batch_op.add_column(sa.Column("verified_by_public_id", sa.String(50), nullable=True))

    if 'user_id' in attendance_cols:
        op.execute("""
            UPDATE attendance a
            SET user_public_id = u.public_id
            FROM users u
            WHERE a.user_id = u.id
        """)

    if 'verified_by' in attendance_cols:
        op.execute("""
            UPDATE attendance a
            SET verified_by_public_id = u.public_id
            FROM users u
            WHERE a.verified_by = u.id
        """)

    with op.batch_alter_table("attendance") as batch_op:
        # Drop old constraints if exist
        for fk in ['attendance_user_id_fkey', 'attendance_verified_by_fkey']:
            if fk in [c['name'] for c in inspector.get_foreign_keys('attendance')]:
                batch_op.drop_constraint(fk, type_="foreignkey")
        # Replace unique constraint safely
        batch_op.drop_constraint(batch_op.f("unique_attendance"), type_="unique")
        batch_op.create_unique_constraint("unique_attendance", ["user_public_id", "course_id", "date"])
        batch_op.create_foreign_key(None, "users", ["user_public_id"], ["public_id"])
        batch_op.create_foreign_key(None, "users", ["verified_by_public_id"], ["public_id"])
        # Drop old columns if they exist
        if 'user_id' in attendance_cols:
            batch_op.drop_column("user_id")
        if 'verified_by' in attendance_cols:
            batch_op.drop_column("verified_by")
        batch_op.alter_column("user_public_id", nullable=False)


    # --- ENROLLMENTS ---
    enrollment_cols = [c['name'] for c in inspector.get_columns('enrollments')]
    with op.batch_alter_table("enrollments") as batch_op:
        if "user_public_id" not in enrollment_cols:
            batch_op.add_column(sa.Column("user_public_id", sa.String(50), nullable=True))

    if 'user_id' in enrollment_cols:
        op.execute("""
            UPDATE enrollments e
            SET user_public_id = u.public_id
            FROM users u
            WHERE e.user_id = u.id
        """)

    with op.batch_alter_table("enrollments") as batch_op:
        batch_op.drop_constraint(batch_op.f("unique_user_course"), type_="unique")
        batch_op.create_unique_constraint("unique_user_course", ["user_public_id", "course_id"])
        if 'user_id' in enrollment_cols:
            batch_op.drop_constraint(batch_op.f("enrollments_user_id_fkey"), type_="foreignkey")
        batch_op.create_foreign_key(None, "users", ["user_public_id"], ["public_id"])
        if 'user_id' in enrollment_cols:
            batch_op.drop_column("user_id")
        batch_op.alter_column("user_public_id", nullable=False)


    # --- MESSAGES ---
    messages_cols = [c['name'] for c in inspector.get_columns('messages')]
    with op.batch_alter_table("messages") as batch_op:
        if "user_public_id" not in messages_cols:
            batch_op.add_column(sa.Column("user_public_id", sa.String(50), nullable=True))

    if 'user_id' in messages_cols:
        op.execute("""
            UPDATE messages m
            SET user_public_id = u.public_id
            FROM users u
            WHERE m.user_id = u.id
        """)

    with op.batch_alter_table("messages") as batch_op:
        if 'user_id' in messages_cols:
            batch_op.drop_constraint(batch_op.f("messages_user_id_fkey"), type_="foreignkey")
            batch_op.drop_column("user_id")
        batch_op.create_foreign_key(None, "users", ["user_public_id"], ["public_id"])
        batch_op.alter_column("user_public_id", nullable=False)


    # --- RESOURCES ---
    resources_cols = [c['name'] for c in inspector.get_columns('resources')]
    with op.batch_alter_table("resources") as batch_op:
        if "uploaded_by_public_id" not in resources_cols:
            batch_op.add_column(sa.Column("uploaded_by_public_id", sa.String(50), nullable=True))

    if 'uploaded_by' in resources_cols:
        op.execute("""
            UPDATE resources r
            SET uploaded_by_public_id = u.public_id
            FROM users u
            WHERE r.uploaded_by = u.id
        """)

    with op.batch_alter_table("resources") as batch_op:
        if 'uploaded_by' in resources_cols:
            batch_op.drop_constraint(batch_op.f("resources_uploaded_by_fkey"), type_="foreignkey")
            batch_op.drop_column("uploaded_by")
        batch_op.create_foreign_key(None, "users", ["uploaded_by_public_id"], ["public_id"])
        batch_op.alter_column("uploaded_by_public_id", nullable=False)
