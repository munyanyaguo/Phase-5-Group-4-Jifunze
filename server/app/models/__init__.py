from .attendance import Attendance
from .base import BaseModel, db
from .course import Course
from .enrollment import Enrollment
from .message import Message
from .resource import Resource
from .school import School
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
]
