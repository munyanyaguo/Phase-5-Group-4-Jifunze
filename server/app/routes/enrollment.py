# app/resources/enrollments.py
from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt
from datetime import datetime

from app.models import db
from app.models.user import User
from app.models.course import Course
from app.models.enrollment import Enrollment
from app.schemas.enrollment import enrollment_schema, enrollments_schema
from app.utils.responses import error_response


class EnrollmentListResource(Resource):
    @jwt_required()
    def get(self):
        """List all enrollments (admin only)."""
        claims = get_jwt()
        if claims.get("role") != "admin":
            return error_response("Admins only.", 403)

        enrollments = Enrollment.query.all()
        return enrollments_schema.dump(enrollments), 200

    @jwt_required()
    def post(self):
        """
        Enroll a student into a course.
        - Manager or Admin required
        - Manager can only enroll students in their own school
        """
        claims = get_jwt()
        role = claims.get("role")
        school_id_claim = claims.get("school_id")

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
            if not school_id_claim:
                return error_response("JWT missing school_id. Check login claims.", 403)
            if str(course.school_id) != str(school_id_claim):
                return error_response("Unauthorized: course belongs to another school.", 403)
            if str(user.school_id) != str(school_id_claim):
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
        school_id_claim = claims.get("school_id")

        enrollment = Enrollment.query.get_or_404(enrollment_id)

        if role == "manager":
            if not school_id_claim:
                return error_response("JWT missing school_id.", 403)
            if str(enrollment.course.school_id) != str(school_id_claim):
                return error_response("Unauthorized: course belongs to another school.", 403)
            if str(enrollment.user.school_id) != str(school_id_claim):
                return error_response("Unauthorized: student belongs to another school.", 403)

        db.session.delete(enrollment)
        db.session.commit()
        return {"message": "Enrollment deleted successfully"}, 200
