from sqlalchemy.orm import validates
from sqlalchemy import event

from .base import BaseModel, db
from .user import User
from .course import Course


class Enrollment(BaseModel):
    __tablename__ = "enrollments"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user_public_id = db.Column(db.String(50), db.ForeignKey("users.public_id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    date_enrolled = db.Column(db.DateTime, nullable=False)

    # Relationships
    user = db.relationship(
        "User",
        back_populates="enrollments",
        primaryjoin="Enrollment.user_public_id==User.public_id",
        foreign_keys=[user_public_id],
    )
    course = db.relationship("Course", back_populates="enrollments")

    # Unique constraint: one student can only be enrolled once in a course
    __table_args__ = (
        db.UniqueConstraint("user_public_id", "course_id", name="unique_user_course"),
    )

    @validates("date_enrolled")
    def validate_date(self, key, date_enrolled):
        if not date_enrolled:
            raise ValueError("Enrollment must have a date_enrolled")
        return date_enrolled

    def __repr__(self):
        return f"<Enrollment user={self.user_public_id}, course={self.course_id}>"


# -----------------------------
# Data integrity: ensure student and course belong to same school
# -----------------------------
def _assert_same_school(mapper, connection, target: Enrollment):
    """
    Prevent creating/updating an Enrollment where the student's school_id
    differs from the course's school_id.
    """
    # Fetch linked user and course using the same connection
    user_row = connection.execute(
        User.__table__.select().where(User.public_id == target.user_public_id)
    ).fetchone()
    course_row = connection.execute(
        Course.__table__.select().where(Course.id == target.course_id)
    ).fetchone()

    if not user_row or not course_row:
        raise ValueError("Invalid enrollment: user or course not found")

    user_school_id = user_row.school_id
    course_school_id = course_row.school_id

    if user_school_id is None or course_school_id is None:
        raise ValueError("Invalid enrollment: user and course must be assigned to a school")

    if str(user_school_id) != str(course_school_id):
        raise ValueError("Invalid enrollment: student and course belong to different schools")


event.listen(Enrollment, "before_insert", _assert_same_school)
event.listen(Enrollment, "before_update", _assert_same_school)
