
from .base import db, BaseModel

# Import all models here so they register with SQLAlchemy
from .user import User
from .school import School
from .course import Course
from .enrollment import Enrollment
from .attendance import Attendance
from .resource import Resource
from .message import Message

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
]
