from .base import BaseModel, db
from .user import User
from .course import Course
from sqlalchemy.orm import synonym

class Attendance(BaseModel):
    __tablename__ = "attendance"

    # Foreign Keys
    user_public_id = db.Column(db.String(50), db.ForeignKey("users.public_id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(20), nullable=False)  # present, absent, late
    verified_by_public_id = db.Column(db.String(50), db.ForeignKey("users.public_id"), nullable=True)
    
    # Alias for simpler access
    verified_by = db.synonym('verified_by_public_id')

    # Relationships
    user = db.relationship("User", foreign_keys=[user_public_id], back_populates="attendance", lazy="joined")
    verifier = db.relationship("User", foreign_keys=[verified_by_public_id], back_populates="verifications")
    course = db.relationship("Course", back_populates="attendance", foreign_keys=[course_id])

    __table_args__ = (
        db.UniqueConstraint("user_public_id", "course_id", "date", name="unique_attendance"),
    )

    def __repr__(self):
        return f"<Attendance user={self.user_public_id}, course={self.course_id}, date={self.date}>"
