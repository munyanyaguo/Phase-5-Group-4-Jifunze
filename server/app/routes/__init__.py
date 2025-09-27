from flask_restful import Api
from flask import Blueprint
from .courses import CourseListResource, CourseResource
from .attendance import AttendanceListResource, AttendanceResource
from .auth import RegisterResource, LoginResource, LogoutResource, ResetPasswordResource
from .users import (
    UserResource, UserListResource, UserPasswordResource, 
    UserProfileResource, UsersBySchoolResource, UserDashboardResource
)
from .schools import (
    SchoolResource, SchoolListResource, SchoolStatsResource,
    SchoolUsersResource, SchoolCoursesResource, SchoolDashboardResource
)
from .messages import MessageListResource, MessageResource
from .resources import ResourceListApi, ResourceDetailApi
from .enrollment import EnrollmentListResource, EnrollmentResource

api_bp = Blueprint("api", __name__, url_prefix="/api")
api = Api(api_bp)

# Course endpoints
api.add_resource(CourseListResource, "/courses")  # GET all, POST new
api.add_resource(CourseResource, "/courses/<int:course_id>")  # GET, PUT, DELETE

# Attendance endpoints
api.add_resource(AttendanceListResource, "/attendance")  # GET, POST
api.add_resource(AttendanceResource, "/attendance/<int:attendance_id>")  # GET, PUT, DELETE

# Auth endpoints
api.add_resource(RegisterResource, "/auth/register")
api.add_resource(LoginResource, "/auth/login")
api.add_resource(LogoutResource, "/auth/logout")
api.add_resource(ResetPasswordResource, "/auth/reset-password")

# User endpoints
api.add_resource(UserListResource, "/users")  # GET, POST
api.add_resource(UserResource, "/users/me", "/users/<int:user_id>")  # GET, PUT, DELETE
api.add_resource(UserPasswordResource, "/users/password")
api.add_resource(UserProfileResource, "/users/profile")
api.add_resource(UserDashboardResource, "/users/dashboard")
api.add_resource(UsersBySchoolResource, "/schools/<int:school_id>/users")

# School endpoints (CRUD enabled)
api.add_resource(SchoolListResource, "/schools")  # GET all, POST new
api.add_resource(SchoolResource, "/schools/me", "/schools/<int:school_id>")  # GET, PUT, DELETE
api.add_resource(SchoolStatsResource, "/schools/stats", "/schools/<int:school_id>/stats")
api.add_resource(SchoolUsersResource, "/schools/<int:school_id>/users")
api.add_resource(SchoolCoursesResource, "/schools/<int:school_id>/courses")
api.add_resource(SchoolDashboardResource, "/schools/dashboard", "/schools/<int:school_id>/dashboard")

# Message endpoints
api.add_resource(MessageListResource, "/messages")  # GET, POST
api.add_resource(MessageResource, "/messages/<int:message_id>")  # GET, PUT, DELETE

# Resource endpoints
api.add_resource(ResourceListApi, "/resources")  # GET, POST
api.add_resource(ResourceDetailApi, "/resources/<int:resource_id>")  # GET, PUT, DELETE

# Enrollment endpoints
api.add_resource(EnrollmentListResource, "/enrollments")  # GET, POST
api.add_resource(EnrollmentResource, "/enrollments/<int:enrollment_id>")  # GET, PUT, DELETE
