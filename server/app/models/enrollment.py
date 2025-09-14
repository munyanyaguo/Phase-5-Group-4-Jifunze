
from .base import db, BaseModel
from sqlalchemy.orm import validates

class Enrollment(BaseModel):
    __tablename__ = "enrollments"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    date_enrolled = db.Column(db.DateTime, nullable=False)

    # Relationships
    user = db.relationship("User", back_populates="enrollments")
    course = db.relationship("Course", back_populates="enrollments")

    # Unique constraint: one student can only be enrolled once in a course
    __table_args__ = (
        db.UniqueConstraint("user_id", "course_id", name="unique_user_course"),
    )

    @validates("date_enrolled")
    def validate_date(self, key, date_enrolled):
        if not date_enrolled:
            raise ValueError("Enrollment must have a date_enrolled")
        return date_enrolled

    def __repr__(self):
        return f"<Enrollment user={self.user_id}, course={self.course_id}>"
