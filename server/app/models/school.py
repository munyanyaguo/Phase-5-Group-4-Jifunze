
from .base import db, BaseModel

class School(BaseModel):
    __tablename__ = "schools"

    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Relationships
    users = db.relationship("User", back_populates="school", cascade="all, delete-orphan")
    courses = db.relationship("Course", back_populates="school", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<School {self.name}>"
