from sqlalchemy.orm import validates

from .base import BaseModel, db
from .user import User
from .course import Course



class Enrollment(BaseModel):
    __tablename__ = "enrollments"

    user_public_id = db.Column(db.String(50), db.ForeignKey("users.public_id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    date_enrolled = db.Column(db.DateTime, nullable=False)

    # Relationships
    user = db.relationship("User", back_populates="enrollments", primaryjoin="Enrollment.user_public_id==User.public_id")
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