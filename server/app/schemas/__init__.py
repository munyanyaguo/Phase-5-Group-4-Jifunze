# app/schemas/__init__.py
"""
Central schema loader — ensures all Marshmallow schemas are imported
so that string-based Nested() references (e.g. "ResourceSchema") work.
"""

from .attendance import AttendanceSchema, attendance_schema, attendances_schema
from .auth import (
    LoginSchema,
    RegisterSchema,
    ResetPasswordRequestSchema,
    ResetPasswordConfirmSchema,
)
from .base import BaseSchema
from .course import CourseSchema, course_schema, courses_schema
from .enrollment import EnrollmentSchema, enrollment_schema, enrollments_schema
from .message import MessageSchema, message_schema, messages_schema
from .resources import ResourceSchema, resource_schema, resources_schema
from .schools import SchoolSchema
from .user import (
    UserSchema,
    UserCreateSchema,
    UserUpdateSchema,
    PasswordChangeSchema,
    UserListResponseSchema,
    UserStatsSchema,
    UserQuerySchema,
)

__all__ = [
    # Attendance
    "AttendanceSchema",
    "attendance_schema",
    "attendances_schema",

    # Auth
    "LoginSchema",
    "RegisterSchema",
    "ResetPasswordRequestSchema",
    "ResetPasswordConfirmSchema",

    # Base
    "BaseSchema",

    # Course
    "CourseSchema",
    "course_schema",
    "courses_schema",

    # Enrollment
    "EnrollmentSchema",
    "enrollment_schema",
    "enrollments_schema",

    # Message
    "MessageSchema",
    "message_schema",
    "messages_schema",

    # Resource
    "ResourceSchema",
    "resource_schema",
    "resources_schema",

    # School
    "SchoolSchema",

    # User
    "UserSchema",
    "UserCreateSchema",
    "UserUpdateSchema",
    "PasswordChangeSchema",
    "UserListResponseSchema",
    "UserStatsSchema",
    "UserQuerySchema",
]
