from .base import BaseModel, db
from .user import User
from .course import Course


class Message(BaseModel):
    __tablename__ = "messages"

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey("messages.id"), nullable=True)
    content = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False)

    # Relationships
    user = db.relationship("User", back_populates="messages", foreign_keys="Message.user_id")
    course = db.relationship("Course", back_populates="messages", foreign_keys="Message.course_id")
    replies = db.relationship(
        "Message", backref=db.backref("parent", remote_side="Message.id")
    )

    def __repr__(self):
        return f"<Message user={self.user_id}, course={self.course_id}, ts={self.timestamp}>"
