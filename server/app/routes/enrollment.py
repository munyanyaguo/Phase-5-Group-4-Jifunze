# app/resources/enrollments.py
from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity
from datetime import datetime

from app.models import db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.schemas.enrollment import enrollment_schema, enrollments_schema
from app.utils.responses import error_response


class EnrollmentListResource(Resource):
    @jwt_required()
    def get(self, school_id=None, course_id=None):
        """
        List enrollments.

        - Admin: can list all, or filter by school/course if provided
        - Manager: can list only within their own school; supports
          /schools/<school_id>/enrollments and /courses/<course_id>/enrollments
        """
        claims = get_jwt()
        role = claims.get("role")

        # Base query
        query = Enrollment.query

        if role == "admin":
            # Admin can filter optionally
            if course_id is not None:
                query = query.filter_by(course_id=course_id)
            if school_id is not None:
                # Filter by course.school_id when school_id is given
                query = (
                    query.join(Course, Enrollment.course_id == Course.id)
                    .filter(Course.school_id == school_id)
                )
            results = query.all()
            return enrollments_schema.dump(results), 200

        if role == "manager":
            # Scope to schools owned by this manager OR the manager's assigned school
            manager_public_id = get_jwt_identity()
            manager = User.query.filter_by(public_id=manager_public_id).first()
            if not manager:
                return error_response("Manager not found", 404)

            from app.models.school import School
            owned_school_ids = [s.id for s in School.query.filter_by(owner_id=manager.id).all()]
            scope_school_ids = set(owned_school_ids)
            if manager.school_id:
                scope_school_ids.add(manager.school_id)
            if not scope_school_ids:
                return error_response("No school scope found for this manager", 404)

            # Base joins
            query = (
                query
                .join(Course, Enrollment.course_id == Course.id)
                .join(User, Enrollment.user_public_id == User.public_id)
            )

            # If specific school requested, ensure it's in scope
            if school_id is not None:
                if school_id not in scope_school_ids:
                    return error_response("Unauthorized: cannot access another school's enrollments.", 403)
                query = query.filter(Course.school_id == school_id)
            else:
                query = query.filter(Course.school_id.in_(list(scope_school_ids)))

            if course_id is not None:
                query = query.filter(Enrollment.course_id == course_id)

            results = query.all()
            return enrollments_schema.dump(results), 200

        return error_response("Admins or managers only.", 403)

    @jwt_required()
    def post(self):
        """
        Enroll a student into a course.
        - Manager or Admin required
        - Manager can only enroll students in their own school
        """
        claims = get_jwt()
        role = claims.get("role")

        if role not in ["admin", "manager"]:
            return error_response("Only managers or admins can enroll students.", 403)

        data = request.get_json() or {}
        user_public_id = data.get("user_public_id")
        course_id = data.get("course_id")

        if not user_public_id or not course_id:
            return error_response("Both user_public_id and course_id are required.", 400)

        # Fetch DB entities
        user = User.query.filter_by(public_id=user_public_id).first()
        course = Course.query.get(course_id)

        if not user:
            return error_response("Student not found.", 404)
        if not course:
            return error_response("Course not found.", 404)

        # Ensure both user + course belong to a school
        if not user.school_id:
            return error_response("Student is not assigned to any school.", 400)
        if not course.school_id:
            return error_response("Course is not assigned to any school.", 400)

        # Enforce school scope for managers
        if role == "manager":
            # Verify manager is scoped to the course's school (owner or assigned)
            manager_public_id = get_jwt_identity()
            manager = User.query.filter_by(public_id=manager_public_id).first()
            if not manager:
                return error_response("Manager not found", 404)
            from app.models.school import School
            school = School.query.get(course.school_id)
            if not school:
                return error_response("Course school not found", 404)
            if not (school.owner_id == manager.id or (manager.school_id and manager.school_id == school.id)):
                return error_response("Unauthorized: course belongs to another school.", 403)
            if str(user.school_id) != str(course.school_id):
                return error_response("Unauthorized: student belongs to another school.", 403)

        # Prevent duplicate enrollment
        existing = Enrollment.query.filter_by(
            user_public_id=user.public_id,
            course_id=course.id
        ).first()
        if existing:
            return error_response("Student is already enrolled in this course.", 400)

        # Create enrollment
        enrollment = Enrollment(
            user_public_id=user.public_id,
            user_id=user.id,
            course_id=course.id,
            date_enrolled=datetime.utcnow()
        )

        db.session.add(enrollment)
        db.session.commit()

        return enrollment_schema.dump(enrollment), 201


class EnrollmentResource(Resource):
    @jwt_required()
    def get(self, enrollment_id):
        """Get a single enrollment by id."""
        enrollment = Enrollment.query.get_or_404(enrollment_id)
        return enrollment_schema.dump(enrollment), 200

    @jwt_required()
    def delete(self, enrollment_id):
        """Delete an enrollment (manager/admin only)."""
        claims = get_jwt()
        role = claims.get("role")

        enrollment = Enrollment.query.get_or_404(enrollment_id)

        if role == "manager":
            # Verify manager is scoped to the course's school (owner or assigned)
            manager_public_id = get_jwt_identity()
            manager = User.query.filter_by(public_id=manager_public_id).first()
            if not manager:
                return error_response("Manager not found", 404)
            from app.models.school import School
            course_school_id = enrollment.course.school_id
            school = School.query.get(course_school_id)
            if not school:
                return error_response("Course school not found", 404)
            if not (school.owner_id == manager.id or (manager.school_id and manager.school_id == school.id)):
                return error_response("Unauthorized: cannot modify enrollments outside your schools.", 403)

        db.session.delete(enrollment)
        db.session.commit()
        return {"message": "Enrollment deleted successfully"}, 200
