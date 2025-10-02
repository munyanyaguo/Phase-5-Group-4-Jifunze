from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from .base import BaseModel

class Notification(BaseModel):
    __tablename__ = "notifications"

    user_public_id = Column(String(50), ForeignKey("users.public_id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=True)
    type = Column(String(50), default="info")  # info, success, warning, error
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)  # Optional link to related resource

    # Relationship
    user = relationship("User", backref="notifications", foreign_keys=[user_public_id])

    def __repr__(self):
        return f"<Notification {self.title} for {self.user_public_id}>"
