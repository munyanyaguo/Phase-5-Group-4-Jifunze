from .base import BaseModel, db


class Resource(BaseModel):
    __tablename__ = "resources"

    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # pdf, video, doc, etc.

    # Relationships
    course = db.relationship("Course", back_populates="resources")
    uploader = db.relationship("User", back_populates="resources")

    def __repr__(self):
        return f"<Resource {self.title} ({self.type})>"
