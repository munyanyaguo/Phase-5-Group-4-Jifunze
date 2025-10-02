from .attendance import Attendance
from .base import BaseModel, db
from .course import Course
from .enrollment import Enrollment
from .message import Message
from .resource import Resource
from .school import School
from .reset_password import ResetPassword
from .notification import Notification
# Import all models here so they register with SQLAlchemy
from .user import User

__all__ = [
    "db",
    "BaseModel",
    "User",
    "School",
    "Course",
    "Enrollment",
    "Attendance",
    "Resource",
    "Message",
    "ResetPassword",
    "Notification",
]
