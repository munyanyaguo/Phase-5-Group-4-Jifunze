from flask_restful import Api
from flask import Blueprint
from .courses import CourseListResource, CourseResource

api_bp = Blueprint("api", __name__, url_prefix="/api")
api = Api(api_bp)

# Course endpoints
api.add_resource(CourseListResource, "/courses")
api.add_resource(CourseResource, "/courses/<int:course_id>")
