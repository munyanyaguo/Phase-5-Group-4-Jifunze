from flask_restful import Api
from flask import Blueprint
from .courses import CourseListResource, CourseResource
from .attendance import AttendanceListResource, AttendanceResource
from .messages import MessageListResource, MessageResource
api_bp = Blueprint("api", __name__, url_prefix="/api")
api = Api(api_bp)

# Course endpoints
api.add_resource(CourseListResource, "/courses")
api.add_resource(CourseResource, "/courses/<int:course_id>")
# Attendance endpoints
api.add_resource(AttendanceListResource, "/attendance")
api.add_resource(AttendanceResource, "/attendance/<int:attendance_id>")
# Message endpoints
api.add_resource(MessageListResource, "/messages")
api.add_resource(MessageResource, "/messages/<int:message_id>")

