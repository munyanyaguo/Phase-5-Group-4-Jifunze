from .base import BaseModel, db
from .user import User
from .course import Course

class Attendance(BaseModel):
    __tablename__ = "attendance"

    # Foreign Keys
    user_public_id = db.Column(db.String(50), db.ForeignKey("users.public_id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    verified_by = db.Column(db.String(50), db.ForeignKey("users.public_id"), nullable=True)

    # Other fields
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # present, absent, late

    # Relationships
    user = db.relationship(
        "User",
        foreign_keys=[user_id],  # Use numeric ID for main user
        back_populates="attendance",
        lazy="joined"
    )
    verifier = db.relationship(
        "User",
        back_populates="verifications",
        foreign_keys="Attendance.verified_by"
    )
    course = db.relationship(
        "Course",
        back_populates="attendance",
        foreign_keys=[course_id]
    )

    __table_args__ = (
        db.UniqueConstraint("user_public_id", "course_id", "date", name="unique_attendance"),
    )

    def __repr__(self):
        return f"<Attendance user={self.user_public_id}, course={self.course_id}, date={self.date}>"
