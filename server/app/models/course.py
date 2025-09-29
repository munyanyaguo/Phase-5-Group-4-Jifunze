from .base import BaseModel, db

class Course(BaseModel):
    __tablename__ = "courses"

    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    educator_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"), nullable=False)

    # Relationships
    educator = db.relationship(
        "User",
        back_populates="courses",
        foreign_keys=[educator_id]  # explicit FK to avoid ambiguity
    )
    school = db.relationship(
        "School",
        back_populates="courses",
        foreign_keys=[school_id]  # optional but safer
    )
    enrollments = db.relationship(
        "Enrollment",
        back_populates="course",
        cascade="all, delete-orphan",
        foreign_keys="Enrollment.course_id"
    )
    attendance = db.relationship(
        "Attendance",
        back_populates="course",
        cascade="all, delete-orphan",
        foreign_keys="Attendance.course_id"
    )
    resources = db.relationship(
        "Resource",
        back_populates="course",
        cascade="all, delete-orphan",
        foreign_keys="Resource.course_id"
    )
    messages = db.relationship(
        "Message",
        back_populates="course",
        cascade="all, delete-orphan",
        foreign_keys="Message.course_id"
    )

    def __repr__(self):
        return f"<Course {self.title}>"
