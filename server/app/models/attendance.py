from .base import BaseModel, db
from .user import User
from .course import Course



class Attendance(BaseModel):
    __tablename__ = "attendance"

    user_public_id = db.Column(db.String(50), db.ForeignKey("users.public_id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # present, absent, late
    verified_by_public_id = db.Column(
    "verified_by",  # maps to existing DB column
    db.String(50),
    db.ForeignKey("users.public_id"),
    nullable=True
)
    # Relationships
    user = db.relationship(
        "User", foreign_keys=[user_public_id], back_populates="attendance", primaryjoin="Attendance.user_public_id==User.public_id"
    )
    course = db.relationship("Course", back_populates="attendance")
    verifier = db.relationship("User", foreign_keys=[verified_by_public_id], back_populates="verifications", primaryjoin="Attendance.verified_by_public_id==User.public_id")

    __table_args__ = (
        db.UniqueConstraint("user_public_id", "course_id", "date", name="unique_attendance"),
    )

    def __repr__(self):
        return f"<Attendance user={self.user_public_id}, course={self.course_id}, date={self.date}>"
