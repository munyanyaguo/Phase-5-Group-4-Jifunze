from .base import BaseModel, db
from .user import User  # make sure this exists

class School(BaseModel):
    __tablename__ = "schools"

    name = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id", use_alter=True), nullable=False)

    # Relationships
    owner = db.relationship("User", back_populates="owned_schools", foreign_keys=[owner_id])
    users = db.relationship("User", back_populates="school", cascade="all, delete-orphan", foreign_keys=[User.school_id])
    courses = db.relationship("Course", back_populates="school", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<School id={self.id} name={self.name}>"
