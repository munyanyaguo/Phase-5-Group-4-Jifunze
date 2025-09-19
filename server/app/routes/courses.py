from flask import request
from flask_restful import Resource
from app.models import Course
from app.extensions import db, paginate


class CourseListResource(Resource):
    def get(self):
        """
        GET /courses?page=1&per_page=10&school_id=2&educator_id=7&search=AI

        Returns a paginated list of courses, ordered by creation date.
        Supports filtering:
        - school_id: only courses from a specific school
        - educator_id: only courses created by a specific educator
        - search: keyword search in title and description (case-insensitive)
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
        return paginate(query)

    def post(self):
        """
        POST /courses
        Create a new course.

        Required fields: title, educator_id, school_id
        Optional: description
        """
        data = request.get_json() or {}
        required = ["title", "educator_id", "school_id"]

        # Basic validation
        for field in required:
            if not str(data.get(field, "")).strip():
                return {"message": f"{field} is required"}, 400

        title = data["title"].strip()
        description = data.get("description", "").strip()
        educator_id = data["educator_id"]
        school_id = data["school_id"]

        # Prevent duplicate titles in the same school
        if Course.query.filter_by(title=title, school_id=school_id).first():
            return {
                "message": f"A course with the title '{title}' already exists in this school."
            }, 400

        try:
            new_course = Course(
                title=title,
                description=description,
                educator_id=educator_id,
                school_id=school_id,
            )
            db.session.add(new_course)
            db.session.commit()
            return {
                "message": "Course created successfully.",
                "course": new_course.to_dict(),
            }, 201
        except Exception as e:
            db.session.rollback()
            return {"message": "Error creating course.", "error": str(e)}, 500


class CourseResource(Resource):
    def get(self, course_id):
        """
        GET /courses/<id>
        Fetch a single course by ID.
        """
        course = Course.query.get_or_404(course_id)
        return course.to_dict(), 200

    def put(self, course_id):
        """
        PUT /courses/<id>
        Update a course.
        Fields allowed: title, description, educator_id
        """
        course = Course.query.get_or_404(course_id)
        data = request.get_json() or {}

        # Handle title update with duplicate check
        if "title" in data and data["title"].strip():
            new_title = data["title"].strip()
            if Course.query.filter(
                Course.title == new_title,
                Course.school_id == course.school_id,
                Course.id != course_id,
            ).first():
                return {
                    "message": f"Another course with the title '{new_title}' already exists in this school."
                }, 400
            course.title = new_title

        # Update optional fields
        if "description" in data:
            course.description = data["description"].strip()

        if "educator_id" in data:
            course.educator_id = data["educator_id"]

        try:
            db.session.commit()
            return {
                "message": "Course updated successfully.",
                "course": course.to_dict(),
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error updating course.", "error": str(e)}, 500

    def delete(self, course_id):
        """
        DELETE /courses/<id>
        Permanently remove a course.
        """
        course = Course.query.get_or_404(course_id)
        try:
            db.session.delete(course)
            db.session.commit()
            return {"message": f"Course '{course.title}' deleted successfully."}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Error deleting course.", "error": str(e)}, 500
