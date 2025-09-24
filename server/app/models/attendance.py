from .base import BaseModel, db
from .user import User
from .course import Course


class Attendance(BaseModel):
    __tablename__ = "attendance"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # present, absent, late
    verified_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)

    # Relationships
    user = db.relationship(
        "User", foreign_keys=[user_id], back_populates="attendance"
    )
    course = db.relationship("Course", back_populates="attendance")
    verifier = db.relationship("User", foreign_keys=[verified_by],back_populates="verifications")

    __table_args__ = (
        db.UniqueConstraint("user_id", "course_id", "date", name="unique_attendance"),
    )

    def __repr__(self):
        return f"<Attendance user={self.user_id}, course={self.course_id}, date={self.date}>"
