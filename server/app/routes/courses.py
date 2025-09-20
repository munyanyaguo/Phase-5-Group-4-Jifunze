from flask import request
from flask_restful import Resource
from sqlalchemy.exc import SQLAlchemyError
from app.models import Course
from app.extensions import db, paginate
from app.schemas.course import course_schema, courses_schema
from app.utils.responses import success_response, error_response


class CourseListResource(Resource):
    def get(self):
        """
        GET /courses?page=1&per_page=10&school_id=2&educator_id=7&search=AI
        Paginated list of courses, with filtering and search.
        """
        query = Course.query

        # Filter: school
        school_id = request.args.get("school_id", type=int)
        if school_id:
            query = query.filter_by(school_id=school_id)

        # Filter: educator
        educator_id = request.args.get("educator_id", type=int)
        if educator_id:
            query = query.filter_by(educator_id=educator_id)

        # Search: title + description
        search = request.args.get("search", type=str)
        if search:
            term = f"%{search.strip()}%"
            query = query.filter(
                (Course.title.ilike(term)) |
                (Course.description.ilike(term))
            )

        # Always return newest first
        query = query.order_by(Course.created_at.desc())

        return paginate(query, courses_schema)

    def post(self):
        """
        POST /courses
        Create a new course.
        Required: title, educator_id, school_id
        Optional: description
        """
        json_data = request.get_json() or {}

        # Validate
        errors = course_schema.validate(json_data)
        if errors:
            return error_response("Validation failed.", errors, 400)

        title = (json_data.get("title") or "").strip()
        school_id = json_data.get("school_id")

        # Prevent duplicate title in same school
        if Course.query.filter_by(title=title, school_id=school_id).first():
            return error_response(
                f"A course with the title '{title}' already exists in this school.", 
                status_code=400
            )

        try:
            new_course = course_schema.load(json_data, session=db.session)
            db.session.add(new_course)
            db.session.commit()
            return success_response(
                "Course created successfully.",
                course_schema.dump(new_course),
                201
            )
        except SQLAlchemyError as e:
            db.session.rollback()
            return error_response("Error creating course.", str(e), 500)


class CourseResource(Resource):
    def get(self, course_id):
        """GET /courses/<id>"""
        course = Course.query.get(course_id)
        if not course:
            return error_response("Course not found.", status_code=404)

        return success_response("Course retrieved successfully.", course_schema.dump(course))

    def put(self, course_id):
        """
        PUT /courses/<id>
        Replace a course (all required fields must be included).
        """
        course = Course.query.get(course_id)
        if not course:
            return error_response("Course not found.", status_code=404)

        json_data = request.get_json() or {}
        errors = course_schema.validate(json_data)  # full validation
        if errors:
            return error_response("Validation failed.", errors, 400)

        try:
            course_schema.load(json_data, instance=course, session=db.session)
            db.session.commit()
            return success_response(
                "Course replaced successfully.",
                course_schema.dump(course)
            )
        except SQLAlchemyError as e:
            db.session.rollback()
            return error_response("Error replacing course.", str(e), 500)

    def patch(self, course_id):
        """
        PATCH /courses/<id>
        Partially update a course.
        """
        course = Course.query.get(course_id)
        if not course:
            return error_response("Course not found.", status_code=404)

        json_data = request.get_json() or {}
        errors = course_schema.validate(json_data, partial=True)
        if errors:
            return error_response("Validation failed.", errors, 400)

        try:
            course_schema.load(json_data, instance=course, session=db.session, partial=True)
            db.session.commit()
            return success_response(
                "Course updated successfully.",
                course_schema.dump(course)
            )
        except SQLAlchemyError as e:
            db.session.rollback()
            return error_response("Error updating course.", str(e), 500)

    def delete(self, course_id):
        """DELETE /courses/<id>"""
        course = Course.query.get(course_id)
        if not course:
            return error_response("Course not found.", status_code=404)

        try:
            db.session.delete(course)
            db.session.commit()
            return success_response(f"Course '{course.title}' deleted successfully.")
        except SQLAlchemyError as e:
            db.session.rollback()
            return error_response("Error deleting course.", str(e), 500)
