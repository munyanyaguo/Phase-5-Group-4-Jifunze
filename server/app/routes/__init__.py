from flask_restful import Api
from flask import Blueprint

# -------------------
# Import resources
# -------------------
from .courses import CourseListResource, CourseResource
from .attendance import AttendanceListResource, AttendanceResource
from .auth import RegisterResource, LoginResource, LogoutResource, ResetPasswordResource
from .users import (
    UserResource, UserListResource,
    UserProfileResource, UsersBySchoolResource,
    UserDashboardResource, UserPasswordResetResource
)
from .schools import (
    SchoolListResource, SchoolResource,
    SchoolAssignUserResource, EducatorsByManagerResource, ManagerStudentsResource,
    SchoolStatsResource, SchoolUsersResource, SchoolCoursesResource, SchoolDashboardResource, UserListResource, UserResource, ManagerUsersResource
)
from .messages import MessageListResource, MessageResource
from .resources import ResourceListApi, ResourceDetailApi, CourseResourcesApi
from .enrollment import EnrollmentListResource, EnrollmentResource

# -------------------
# Blueprint and API
# -------------------
api_bp = Blueprint("api", __name__, url_prefix="/api")
api = Api(api_bp)

# -------------------
# Auth endpoints
# -------------------
api.add_resource(RegisterResource, "/auth/register")
api.add_resource(LoginResource, "/auth/login")
api.add_resource(LogoutResource, "/auth/logout")
api.add_resource(ResetPasswordResource, "/auth/reset-password")
api.add_resource(UserPasswordResetResource, "/auth/reset-password-token")

# -------------------
# User endpoints
# -------------------
api.add_resource(UserListResource, "/users")  # GET all users, POST new
api.add_resource(UserResource, "/users/me", "/users/<int:user_id>")  # GET/PUT own profile or by ID
api.add_resource(UserProfileResource, "/users/profile")
api.add_resource(UserDashboardResource, "/users/dashboard")
api.add_resource(UsersBySchoolResource, "/schools/<int:school_id>/users")  # Users in a school

# -------------------
# School endpoints
# -------------------
api.add_resource(SchoolListResource, "/schools")  # List & create
api.add_resource(SchoolResource, "/schools/<int:school_id>")  # GET, PUT, DELETE
api.add_resource(SchoolAssignUserResource, "/schools/<int:school_id>/assign/<string:role>")  # Assign student/educator
api.add_resource(EducatorsByManagerResource, "/manager/educators")  # Manager's educators
api.add_resource(ManagerStudentsResource, "/manager/students")  # Manager's students
api.add_resource(SchoolStatsResource, "/schools/<int:school_id>/stats")  # School stats
api.add_resource(SchoolUsersResource, "/schools/<int:school_id>/users")  # Filtered school users
api.add_resource(SchoolCoursesResource, "/schools/<int:school_id>/courses")  # School courses
api.add_resource(SchoolDashboardResource, "/schools/dashboard", "/schools/<int:school_id>/dashboard")  # School dashboard for manager
api.add_resource(ManagerUsersResource, "/manager/users")  # Manager's users
# api.add_resource(UserListResource, "/users")  # GET all users, POST new
# api.add_resource(UserResource, "/users/<int:user_id>")
# -------------------
# Course endpoints
# -------------------
api.add_resource(CourseListResource, "/courses")  # GET all, POST new
api.add_resource(CourseResource, "/courses/<int:course_id>")  # GET, PUT, DELETE
api.add_resource(CourseResourcesApi, "/courses/<int:course_id>/resources")  # Course resources

# -------------------
# Attendance endpoints
# -------------------
api.add_resource(AttendanceListResource, "/attendance")  # GET, POST
api.add_resource(AttendanceResource, "/attendance/<int:attendance_id>")  # GET, PUT, DELETE

# -------------------
# Message endpoints
# -------------------
api.add_resource(MessageListResource, "/messages")  # GET, POST
api.add_resource(MessageResource, "/messages/<int:message_id>")  # GET, PUT, DELETE

# -------------------
# Resource endpoints
# -------------------
api.add_resource(ResourceListApi, "/resources")  # GET, POST
api.add_resource(ResourceDetailApi, "/resources/<int:resource_id>")  # GET, PUT, DELETE

# -------------------
# Enrollment endpoints
# -------------------
api.add_resource(EnrollmentListResource, "/enrollments")  # GET, POST
api.add_resource(EnrollmentResource, "/enrollments/<int:enrollment_id>")  # GET, PUT, DELETE
