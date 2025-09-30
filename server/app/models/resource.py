from .base import BaseModel, db
from .user import User
from .course import Course

class Resource(BaseModel):
    __tablename__ = "resources"

    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    uploaded_by_public_id = db.Column(db.String(50), db.ForeignKey("users.public_id"), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # pdf, video, doc, etc.

    # Relationships
    course = db.relationship("Course", back_populates="resources", foreign_keys=[course_id])
    uploader = db.relationship(
        "User",
        back_populates="resources",
        foreign_keys=[uploaded_by_public_id],  # ⚠️ explicitly specify the foreign key
        primaryjoin="Resource.uploaded_by_public_id==User.public_id"
    )

    def __repr__(self):
        return f"<Resource {self.title} ({self.type})>"
