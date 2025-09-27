"""Switch user references to UUIDs

Revision ID: 8cac0639ef94
Revises: 1ffd9a2da04f
Create Date: 2025-09-27 13:03:13.638605

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8cac0639ef94'
down_revision = '1ffd9a2da04f'
branch_labels = None
depends_on = None


def upgrade():
    # ATTENDANCE
    with op.batch_alter_table("attendance", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_public_id", sa.String(50), nullable=True))
        batch_op.add_column(sa.Column("verified_by_public_id", sa.String(50), nullable=True))

    # Backfill
    op.execute("""
        UPDATE attendance a
        SET user_public_id = u.public_id
        FROM users u
        WHERE a.user_id = u.id
    """)
    op.execute("""
        UPDATE attendance a
        SET verified_by_public_id = u.public_id
        FROM users u
        WHERE a.verified_by = u.id
    """)

    with op.batch_alter_table("attendance", schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f("unique_attendance"), type_="unique")
        batch_op.create_unique_constraint("unique_attendance", ["user_public_id", "course_id", "date"])
        batch_op.drop_constraint(batch_op.f("attendance_verified_by_fkey"), type_="foreignkey")
        batch_op.drop_constraint(batch_op.f("attendance_user_id_fkey"), type_="foreignkey")
        batch_op.create_foreign_key(None, "users", ["user_public_id"], ["public_id"])
        batch_op.create_foreign_key(None, "users", ["verified_by_public_id"], ["public_id"])
        batch_op.drop_column("user_id")
        batch_op.drop_column("verified_by")
        batch_op.alter_column("user_public_id", nullable=False)

    # ENROLLMENTS
    with op.batch_alter_table("enrollments", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_public_id", sa.String(50), nullable=True))

    op.execute("""
        UPDATE enrollments e
        SET user_public_id = u.public_id
        FROM users u
        WHERE e.user_id = u.id
    """)

    with op.batch_alter_table("enrollments", schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f("unique_user_course"), type_="unique")
        batch_op.create_unique_constraint("unique_user_course", ["user_public_id", "course_id"])
        batch_op.drop_constraint(batch_op.f("enrollments_user_id_fkey"), type_="foreignkey")
        batch_op.create_foreign_key(None, "users", ["user_public_id"], ["public_id"])
        batch_op.drop_column("user_id")
        batch_op.alter_column("user_public_id", nullable=False)

    # MESSAGES
    with op.batch_alter_table("messages", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_public_id", sa.String(50), nullable=True))

    op.execute("""
        UPDATE messages m
        SET user_public_id = u.public_id
        FROM users u
        WHERE m.user_id = u.id
    """)

    with op.batch_alter_table("messages", schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f("messages_user_id_fkey"), type_="foreignkey")
        batch_op.create_foreign_key(None, "users", ["user_public_id"], ["public_id"])
        batch_op.drop_column("user_id")
        batch_op.alter_column("user_public_id", nullable=False)

    # RESOURCES
    with op.batch_alter_table("resources", schema=None) as batch_op:
        batch_op.add_column(sa.Column("uploaded_by_public_id", sa.String(50), nullable=True))

    op.execute("""
        UPDATE resources r
        SET uploaded_by_public_id = u.public_id
        FROM users u
        WHERE r.uploaded_by = u.id
    """)

    with op.batch_alter_table("resources", schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f("resources_uploaded_by_fkey"), type_="foreignkey")
        batch_op.create_foreign_key(None, "users", ["uploaded_by_public_id"], ["public_id"])
        batch_op.drop_column("uploaded_by")
        batch_op.alter_column("uploaded_by_public_id", nullable=False)


def downgrade():
    # RESOURCES
    with op.batch_alter_table("resources", schema=None) as batch_op:
        batch_op.add_column(sa.Column("uploaded_by", sa.Integer(), nullable=True))

    op.execute("""
        UPDATE resources r
        SET uploaded_by = u.id
        FROM users u
        WHERE r.uploaded_by_public_id = u.public_id
    """)

    with op.batch_alter_table("resources", schema=None) as batch_op:
        batch_op.drop_constraint(None, type_="foreignkey")
        batch_op.create_foreign_key(batch_op.f("resources_uploaded_by_fkey"), "users", ["uploaded_by"], ["id"])
        batch_op.drop_column("uploaded_by_public_id")
        batch_op.alter_column("uploaded_by", nullable=False)

    # MESSAGES
    with op.batch_alter_table("messages", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=True))

    op.execute("""
        UPDATE messages m
        SET user_id = u.id
        FROM users u
        WHERE m.user_public_id = u.public_id
    """)

    with op.batch_alter_table("messages", schema=None) as batch_op:
        batch_op.drop_constraint(None, type_="foreignkey")
        batch_op.create_foreign_key(batch_op.f("messages_user_id_fkey"), "users", ["user_id"], ["id"])
        batch_op.drop_column("user_public_id")
        batch_op.alter_column("user_id", nullable=False)

    # ENROLLMENTS
    with op.batch_alter_table("enrollments", schema=None) as batch_op:
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=True))

    op.execute("""
        UPDATE enrollments e
        SET user_id = u.id
        FROM users u
        WHERE e.user_public_id = u.public_id
    """)

    with op.batch_alter_table("enrollments", schema=None) as batch_op:
        batch_op.drop_constraint(None, type_="foreignkey")
        batch_op.create_foreign_key(batch_op.f("enrollments_user_id_fkey"), "users", ["user_id"], ["id"])
        batch_op.drop_constraint("unique_user_course", type_="unique")
        batch_op.create_unique_constraint(batch_op.f("unique_user_course"), ["user_id", "course_id"])
        batch_op.drop_column("user_public_id")
        batch_op.alter_column("user_id", nullable=False)

    # ATTENDANCE
    with op.batch_alter_table("attendance", schema=None) as batch_op:
        batch_op.add_column(sa.Column("verified_by", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=True))

    op.execute("""
        UPDATE attendance a
        SET user_id = u.id
        FROM users u
        WHERE a.user_public_id = u.public_id
    """)
    op.execute("""
        UPDATE attendance a
        SET verified_by = u.id
        FROM users u
        WHERE a.verified_by_public_id = u.public_id
    """)

    with op.batch_alter_table("attendance", schema=None) as batch_op:
        batch_op.drop_constraint(None, type_="foreignkey")
        batch_op.drop_constraint(None, type_="foreignkey")
        batch_op.create_foreign_key(batch_op.f("attendance_user_id_fkey"), "users", ["user_id"], ["id"])
        batch_op.create_foreign_key(batch_op.f("attendance_verified_by_fkey"), "users", ["verified_by"], ["id"])
        batch_op.drop_constraint("unique_attendance", type_="unique")
        batch_op.create_unique_constraint(batch_op.f("unique_attendance"), ["user_id", "course_id", "date"])
        batch_op.drop_column("verified_by_public_id")
        batch_op.drop_column("user_public_id")
        batch_op.alter_column("user_id", nullable=False)
