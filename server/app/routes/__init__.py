from flask_restful import Api
from flask import Blueprint
from .courses import CourseListResource, CourseResource
from .attendance import AttendanceListResource, AttendanceResource
from .auth import RegisterResource, LoginResource, LogoutResource, ResetPasswordResource 
from .users import (UserResource, UserListResource, 
    UserProfileResource, UsersBySchoolResource, UserDashboardResource)
from .schools import (SchoolResource, SchoolListResource, SchoolStatsResource,
    SchoolUsersResource, SchoolCoursesResource, SchoolDashboardResource)
from .messages import MessageListResource, MessageResource
from .resources import ResourceListApi, ResourceDetailApi
from .enrollment import EnrollmentListResource, EnrollmentResource
from .resources import CourseResourcesApi
api_bp = Blueprint("api", __name__, url_prefix="/api")
api = Api(api_bp)

# Course endpoints
api.add_resource(CourseListResource, "/courses")
api.add_resource(CourseResource, "/courses/<int:course_id>")

# Attendance endpoints
api.add_resource(AttendanceListResource, "/attendance")
api.add_resource(AttendanceResource, "/attendance/<int:attendance_id>")

# Auth endpoints
api.add_resource(RegisterResource, "/auth/register")
api.add_resource(LoginResource, "/auth/login")
api.add_resource(LogoutResource, "/auth/logout")
api.add_resource(ResetPasswordResource, "/auth/reset-password")

# User endpoints
api.add_resource(UserListResource, "/users")
api.add_resource(UserResource, "/users/me", "/users/<int:user_id>")
api.add_resource(UserProfileResource, "/users/profile")
api.add_resource(UserDashboardResource, "/users/dashboard")
api.add_resource(UsersBySchoolResource, "/schools/<int:school_id>/users")

# School endpoints
api.add_resource(SchoolListResource, "/schools")
api.add_resource(SchoolResource, "/schools/me", "/schools/<int:school_id>")
api.add_resource(SchoolStatsResource, "/schools/stats", "/schools/<int:school_id>/stats")
api.add_resource(SchoolUsersResource, "/schools/<int:school_id>/users")
api.add_resource(SchoolCoursesResource, "/schools/<int:school_id>/courses")
api.add_resource(SchoolDashboardResource, "/schools/dashboard", "/schools/<int:school_id>/dashboard")

# Message endpoints
api.add_resource(MessageListResource, "/messages")
api.add_resource(MessageResource, "/messages/<int:message_id>")
# Resource endpoints
api.add_resource(ResourceListApi, "/resources")
api.add_resource(ResourceDetailApi, "/resources/<int:resource_id>")
api.add_resource(CourseResourcesApi, "/courses/<int:course_id>/resources")

# Enrollment endpoints
api.add_resource(EnrollmentListResource, "/enrollments")
api.add_resource(EnrollmentResource, "/enrollments/<int:enrollment_id>")


