from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy.exc import SQLAlchemyError

from app.models import Course
from app.extensions import db, paginate
from app.schemas.course import course_schema, courses_schema
from app.utils.responses import success_response, error_response


def require_roles(*roles):
    """Helper to enforce RBAC inside route handlers."""
    claims = get_jwt()
    user_role = claims.get("role")
    if user_role not in roles:
        return False, error_response("Unauthorized: insufficient role.", status_code=403)
    return True, None


class CourseListResource(Resource):
    def get(self):
        """
        GET /courses?page=1&per_page=10&school_id=2&educator_id=7&search=AI
        Paginated list of courses, with filtering and search.
        Public or authenticated (optional).
        """
        query = Course.query

        # Filters
        school_id = request.args.get("school_id", type=int)
        if school_id:
            query = query.filter_by(school_id=school_id)

        educator_id = request.args.get("educator_id", type=int)
        if educator_id:
            query = query.filter_by(educator_id=educator_id)

        search = request.args.get("search", type=str)
        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                (Course.title.ilike(term)) |
                (Course.description.ilike(term))
            )

        query = query.order_by(Course.created_at.desc())
        return paginate(query, courses_schema)

    @jwt_required()
    def post(self):
        """
        POST /courses
        Create a new course.
        Restricted: only educators/managers.
        """
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        user_school_id = claims.get("school_id")

        json_data = request.get_json() or {}
        errors = course_schema.validate(json_data)
        if errors:
            return error_response("Validation failed.", errors, 400)

        title = (json_data.get("title") or "").strip()

        # Force course into user's school
        json_data["school_id"] = user_school_id

        if Course.query.filter_by(title=title, school_id=user_school_id).first():
            return error_response(
                f"A course with the title '{title}' already exists in your school.",
                status_code=400
            )

        try:
            new_course = course_schema.load(json_data, session=db.session)
            db.session.add(new_course)
            db.session.commit()
            return success_response("Course created successfully.", course_schema.dump(new_course), 201)
        except SQLAlchemyError as e:
            db.session.rollback()
            return error_response("Error creating course.", str(e), 500)


class CourseResource(Resource):
    def get(self, course_id):
        """GET /courses/<id> (Public or Authenticated)."""
        course = Course.query.get(course_id)
        if not course:
            return error_response("Course not found.", status_code=404)
        return success_response("Course retrieved successfully.", course_schema.dump(course))

    @jwt_required()
    def put(self, course_id):
        """PUT /courses/<id> (Educator/Manager only)."""
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        user_school_id = claims.get("school_id")

        course = Course.query.get(course_id)
        if not course or course.school_id != user_school_id:
            return error_response("Course not found or not in your school.", 404)

        json_data = request.get_json() or {}
        errors = course_schema.validate(json_data)
        if errors:
            return error_response("Validation failed.", errors, 400)

        try:
            course_schema.load(json_data, instance=course, session=db.session)
            db.session.commit()
            return success_response("Course replaced successfully.", course_schema.dump(course))
        except SQLAlchemyError as e:
            db.session.rollback()
            return error_response("Error replacing course.", str(e), 500)

    @jwt_required()
    def patch(self, course_id):
        """PATCH /courses/<id> (Educator/Manager only)."""
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        user_school_id = claims.get("school_id")

        course = Course.query.get(course_id)
        if not course or course.school_id != user_school_id:
            return error_response("Course not found or not in your school.", 404)

        json_data = request.get_json() or {}
        errors = course_schema.validate(json_data, partial=True)
        if errors:
            return error_response("Validation failed.", errors, 400)

        try:
            course_schema.load(json_data, instance=course, session=db.session, partial=True)
            db.session.commit()
            return success_response("Course updated successfully.", course_schema.dump(course))
        except SQLAlchemyError as e:
            db.session.rollback()
            return error_response("Error updating course.", str(e), 500)

    @jwt_required()
    def delete(self, course_id):
        """DELETE /courses/<id> (Educator/Manager only)."""
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        user_school_id = claims.get("school_id")

        course = Course.query.get(course_id)
        if not course or course.school_id != user_school_id:
            return error_response("Course not found or not in your school.", 404)

        try:
            db.session.delete(course)
            db.session.commit()
            return success_response(f"Course '{course.title}' deleted successfully.")
        except SQLAlchemyError as e:
            db.session.rollback()
            return error_response("Error deleting course.", str(e), 500)
