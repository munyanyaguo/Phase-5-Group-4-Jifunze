from .base import BaseModel, db


class Course(BaseModel):
    __tablename__ = "courses"

    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    educator_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"), nullable=False)

    # Relationships
    educator = db.relationship("User", back_populates="courses", foreign_keys="Course.educator_id")
    school = db.relationship("School", back_populates="courses")
    enrollments = db.relationship(
        "Enrollment", back_populates="course", cascade="all, delete-orphan"
    )
    attendance = db.relationship(
        "Attendance", back_populates="course", cascade="all, delete-orphan"
    )
    resources = db.relationship(
        "Resource", back_populates="course", cascade="all, delete-orphan"
    )
    messages = db.relationship(
        "Message", back_populates="course", cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Course {self.title}>"
