# app/routes/enrollments.py
from flask import request, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from datetime import datetime

from app.models import Enrollment, Course, User
from app.extensions import db, paginate
from app.schemas.enrollment import enrollment_schema, enrollments_schema
from app.utils.responses import success_response, error_response


def require_roles(*roles):
    claims = get_jwt()
    role = claims.get("role")
    if role not in roles:
        return False, error_response("Unauthorized: insufficient role.", 403)
    return True, None


def assert_same_school_or_forbidden(claims_school_id, resource_school_id):
    if claims_school_id is None:
        return error_response("Missing school claim in token.", 403)
    if claims_school_id != resource_school_id:
        return error_response("Unauthorized: different school scope.", 403)
    return None


class EnrollmentListResource(Resource):
    @jwt_required(optional=True)
    def get(self):
        """
        GET /enrollments?page=1&per_page=10&course_id=1&user_public_id=<uuid>
        Public list with filters.
        """
        query = Enrollment.query

        # Filters
        course_id = request.args.get("course_id", type=int)
        user_public_id = request.args.get("user_public_id", type=str)

        if course_id:
            query = query.filter_by(course_id=course_id)
        if user_public_id:
            query = query.filter_by(user_public_id=user_public_id)

        query = query.order_by(Enrollment.date_enrolled.desc())
        return paginate(query, enrollments_schema, resource_name="enrollments")

    @jwt_required()
    def post(self):
        """
        POST /enrollments
        Body:
        {
          "user_public_id": "uuid-string",
          "course_id": 2
        }
        Only managers/educators can enroll a user in a course in their school.
        """
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        json_data = request.get_json() or {}
        enrollment_schema.context = {"user_public_id": json_data.get("user_public_id")}
        errors = enrollment_schema.validate(json_data)
        if errors:
            return error_response("Validation failed.", 400, errors)

        # check course exists
        course = Course.query.get(json_data.get("course_id"))
        if not course:
            return error_response("Course not found.", 404)

        # check same school
        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), course.school_id)
        if scope_err:
            return scope_err

        try:
            enrollment = Enrollment(
                user_public_id=json_data["user_public_id"],
                course_id=json_data["course_id"],
                date_enrolled=datetime.utcnow()
            )
            db.session.add(enrollment)
            db.session.commit()

            return success_response(
                "User enrolled successfully.",
                enrollment_schema.dump(enrollment),
                201
            )
        except IntegrityError:
            db.session.rollback()
            return error_response("User already enrolled in this course.", 409)
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on POST /enrollments: {str(e)}")
            return error_response("Error enrolling user.", 500, str(e))


class EnrollmentResource(Resource):
    @jwt_required(optional=True)
    def get(self, enrollment_id):
        """GET /enrollments/<id>"""
        enrollment = Enrollment.query.get(enrollment_id)
        if not enrollment:
            return error_response("Enrollment not found.", 404)
        return success_response("Fetched enrollment.", enrollment_schema.dump(enrollment))

    @jwt_required()
    def put(self, enrollment_id):
        """
        PUT /enrollments/<id>
        Replace the enrollment record (user_public_id + course_id).
        Only educator/manager in same school allowed.
        """
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        enrollment = Enrollment.query.get(enrollment_id)
        if not enrollment:
            return error_response("Enrollment not found.", 404)

        # validate incoming data
        json_data = request.get_json() or {}
        enrollment_schema.context = {"user_public_id": json_data.get("user_public_id")}
        errors = enrollment_schema.validate(json_data)
        if errors:
            return error_response("Validation failed.", 400, errors)

        # check new course
        course = Course.query.get(json_data.get("course_id"))
        if not course:
            return error_response("Course not found.", 404)

        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), course.school_id)
        if scope_err:
            return scope_err

        try:
            enrollment.user_public_id = json_data["user_public_id"]
            enrollment.course_id = json_data["course_id"]
            enrollment.date_enrolled = datetime.utcnow()
            db.session.commit()

            return success_response(
                "Enrollment replaced successfully.",
                enrollment_schema.dump(enrollment)
            )
        except IntegrityError:
            db.session.rollback()
            return error_response("User already enrolled in this course.", 409)
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on PUT /enrollments/{enrollment_id}: {str(e)}")
            return error_response("Error updating enrollment.", 500, str(e))

    @jwt_required()
    def patch(self, enrollment_id):
        """
        PATCH /enrollments/<id>
        Partial update (e.g. change course_id only).
        Only educator/manager in same school allowed.
        """
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        enrollment = Enrollment.query.get(enrollment_id)
        if not enrollment:
            return error_response("Enrollment not found.", 404)

        json_data = request.get_json() or {}
        enrollment_schema.context = {"user_public_id": json_data.get("user_public_id")}
        errors = enrollment_schema.validate(json_data, partial=True)
        if errors:
            return error_response("Validation failed.", 400, errors)

        # if course_id is changing, validate new course + school scope
        if "course_id" in json_data:
            course = Course.query.get(json_data["course_id"])
            if not course:
                return error_response("Course not found.", 404)

            scope_err = assert_same_school_or_forbidden(claims.get("school_id"), course.school_id)
            if scope_err:
                return scope_err

            enrollment.course_id = json_data["course_id"]

        if "user_public_id" in json_data:
            enrollment.user_public_id = json_data["user_public_id"]

        try:
            db.session.commit()
            return success_response(
                "Enrollment updated successfully.",
                enrollment_schema.dump(enrollment)
            )
        except IntegrityError:
            db.session.rollback()
            return error_response("User already enrolled in this course.", 409)
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on PATCH /enrollments/{enrollment_id}: {str(e)}")
            return error_response("Error updating enrollment.", 500, str(e))

    @jwt_required()
    def delete(self, enrollment_id):
        """
        DELETE /enrollments/<id> - unenroll user
        Only educator/manager in same school allowed.
        """
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        enrollment = Enrollment.query.get(enrollment_id)
        if not enrollment:
            return error_response("Enrollment not found.", 404)

        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), enrollment.course.school_id)
        if scope_err:
            return scope_err

        try:
            db.session.delete(enrollment)
            db.session.commit()
            return success_response(f"Enrollment {enrollment_id} deleted successfully.")
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on DELETE /enrollments/{enrollment_id}: {str(e)}")
            return error_response("Error deleting enrollment.", 500, str(e))
