"""align attendance table to UUIDs

Revision ID: be71704f8178
Revises: 8cac0639ef94
Create Date: 2025-09-27 23:08:20.075318
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect

# revision identifiers, used by Alembic.
revision = 'be71704f8178'
down_revision = '8cac0639ef94'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()
    inspector = inspect(conn)

    attendance_cols = [c['name'] for c in inspector.get_columns('attendance')]
    attendance_fks = [fk['name'] for fk in inspector.get_foreign_keys('attendance')]
    attendance_uniques = [uc['name'] for uc in inspector.get_unique_constraints('attendance')]

    # Add verified_by_public_id if missing
    with op.batch_alter_table("attendance") as batch_op:
        if "verified_by_public_id" not in attendance_cols:
            batch_op.add_column(sa.Column("verified_by_public_id", sa.String(50), nullable=True))

    # Backfill if old verified_by column exists
    if "verified_by" in attendance_cols:
        # verified_by may be stored as VARCHAR in some environments; cast for safety
        op.execute("""
        UPDATE attendance a
        SET verified_by_public_id = u.public_id
        FROM users u
        WHERE a.verified_by::varchar = u.id::varchar
        """)

    with op.batch_alter_table("attendance") as batch_op:
        # Ensure user_public_id is NOT NULL
        if "user_public_id" in attendance_cols:
            batch_op.alter_column("user_public_id", nullable=False)

        # Drop old integer-based columns if they exist
        if "verified_by" in attendance_cols:
            batch_op.drop_column("verified_by")
        if "user_id" in attendance_cols:
            batch_op.drop_column("user_id")

        # Drop any existing FKs on user_public_id / verified_by_public_id
        for fk in attendance_fks:
            if "user_public_id" in fk:
                batch_op.drop_constraint(fk, type_="foreignkey")
            if "verified_by_public_id" in fk:
                batch_op.drop_constraint(fk, type_="foreignkey")

        # Recreate correct foreign keys with explicit names
        batch_op.create_foreign_key(
            "attendance_user_public_id_fkey",
            "users",
            ["user_public_id"],
            ["public_id"],
        )
        batch_op.create_foreign_key(
            "attendance_verified_by_public_id_fkey",
            "users",
            ["verified_by_public_id"],
            ["public_id"],
        )

        # Fix unique constraint
        if "unique_attendance" in attendance_uniques:
            batch_op.drop_constraint("unique_attendance", type_="unique")

        batch_op.create_unique_constraint(
            "unique_attendance", ["user_public_id", "course_id", "date"]
        )


def downgrade():
    conn = op.get_bind()
    inspector = inspect(conn)

    attendance_cols = [c['name'] for c in inspector.get_columns('attendance')]
    attendance_fks = [fk['name'] for fk in inspector.get_foreign_keys('attendance')]
    attendance_uniques = [uc['name'] for uc in inspector.get_unique_constraints('attendance')]

    with op.batch_alter_table("attendance") as batch_op:
        # Restore integer columns if needed
        if "verified_by" not in attendance_cols:
            batch_op.add_column(sa.Column("verified_by", sa.Integer(), nullable=True))
        if "user_id" not in attendance_cols:
            batch_op.add_column(sa.Column("user_id", sa.Integer(), nullable=True))

        # Drop UUID-based FKs
        for fk in attendance_fks:
            if "user_public_id" in fk:
                batch_op.drop_constraint(fk, type_="foreignkey")
            if "verified_by_public_id" in fk:
                batch_op.drop_constraint(fk, type_="foreignkey")

        # Recreate old FKs back to integer IDs
        batch_op.create_foreign_key(
            "attendance_user_id_fkey",
            "users",
            ["user_id"],
            ["id"],
        )
        batch_op.create_foreign_key(
            "attendance_verified_by_fkey",
            "users",
            ["verified_by"],
            ["id"],
        )

        # Restore old unique constraint
        if "unique_attendance" in attendance_uniques:
            batch_op.drop_constraint("unique_attendance", type_="unique")

        batch_op.create_unique_constraint(
            "unique_attendance", ["user_id", "course_id", "date"]
        )

        # Drop UUID columns
        if "verified_by_public_id" in attendance_cols:
            batch_op.drop_column("verified_by_public_id")
        if "user_public_id" in attendance_cols:
            batch_op.drop_column("user_public_id")
