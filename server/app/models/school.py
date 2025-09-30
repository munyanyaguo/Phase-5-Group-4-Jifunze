from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel, db
from .user import User

class School(BaseModel):
    __tablename__ = "schools"

    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)

    # Owner relationship
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    owner = relationship(
        "User",
        back_populates="owned_schools",
        foreign_keys=[owner_id]  # Explicit foreign key to avoid ambiguity
    )

    # Users in this school
    users = relationship(
        "User",
        back_populates="school",
        foreign_keys="User.school_id"  # Explicit FK pointing to user's school_id
    )

    # Courses in this school (optional)
    courses = relationship(
        "Course",
        back_populates="school",
        foreign_keys="Course.school_id"  # Avoid ambiguous joins
    )

    def __repr__(self):
        return f"<School {self.name}>"
