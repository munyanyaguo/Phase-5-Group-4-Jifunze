import uuid
from flask_bcrypt import Bcrypt
from sqlalchemy import Enum
from sqlalchemy.orm import validates

from .base import BaseModel, db


bcrypt = Bcrypt()

ROLES = ("student", "educator", "manager")


class User(BaseModel):
    __tablename__ = "users"

    public_id = db.Column(
        db.String(50), unique=True, nullable=False, default=lambda: str(uuid.uuid4())
    )
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(Enum(*ROLES, name="role_enum"), nullable=False)
    school_id = db.Column(db.Integer, db.ForeignKey("schools.id"), nullable=True)

    # Relationships
    school = db.relationship("School", back_populates="users", foreign_keys="User.school_id")
    courses = db.relationship("Course", back_populates="educator", foreign_keys="Course.educator_id")
    resources = db.relationship("Resource", back_populates="uploader", foreign_keys="Resource.uploaded_by")
    messages = db.relationship("Message", back_populates="user", foreign_keys="Message.user_id")
    enrollments = db.relationship("Enrollment", back_populates="user", cascade="all, delete-orphan",lazy="select")
    attendance = db.relationship("Attendance", back_populates="user",foreign_keys="Attendance.user_id")
    verifications = db.relationship("Attendance",back_populates="verifier",foreign_keys="Attendance.verified_by")
    reset_passwords = db.relationship("ResetPassword", back_populates="user")
    # Password methods
    def set_password(self, password: str):
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password: str) -> bool:
        return bcrypt.check_password_hash(self.password_hash, password)

    @validates("email")
    def validate_email(self, key, email):
        if "@" not in email or "." not in email:
            raise ValueError("Invalid email format")
        return email.lower()

    @validates("role")
    def validate_role(self, key, role):
        if role not in ROLES:
            raise ValueError(f"Invalid role: {role}. Must be one of {ROLES}")
        return role

    def __repr__(self):
        return f"<User {self.name} ({self.role})>"
