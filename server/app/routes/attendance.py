from flask import request, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from sqlalchemy.orm import joinedload
from datetime import datetime

from app.models import Attendance, Course, User
from app.extensions import db, paginate
from app.schemas.attendance import attendance_schema, attendances_schema
from app.utils.responses import success_response, error_response


def require_roles(*roles):
    claims = get_jwt()
    user_role = claims.get("role")
    if user_role not in roles:
        return False, error_response("Unauthorized: insufficient role.", status_code=403)
    return True, None


def assert_same_school_or_forbidden(claims_school_id, resource_school_id):
    if claims_school_id is None:
        return error_response("Missing school claim in token.", status_code=403)
    if claims_school_id != resource_school_id:
        return error_response("Unauthorized: action not allowed for this school.", status_code=403)
    return None


class AttendanceListResource(Resource):
    @jwt_required(optional=True)
    def get(self):
        """
        GET /attendance?page=1&per_page=10&course_id=1&user_id=5&status=present
        Uses JWT for logged-in user if user_id not passed.
        """
        query = Attendance.query.options(joinedload(Attendance.course))

        # Filters from query params
        course_id = request.args.get("course_id", type=int)
        user_id = request.args.get("user_id", type=str)  # Optional override
        status = request.args.get("status", type=str)

        # Get JWT claims if present
        claims = get_jwt()
        role = claims.get("role") if claims else None
        jwt_user_id = claims.get("sub") if claims else None  # assuming 'sub' stores user_public_id

        # Determine which user_id to filter by
        if not user_id:
            # If role is student, only allow their own attendance
            if role == "student":
                user_id = jwt_user_id
            # Educators/managers can see anyone, leave user_id as None for full list

        if course_id:
            query = query.filter_by(course_id=course_id)
        if user_id:
            query = query.filter_by(user_public_id=user_id)
        if status:
            query = query.filter_by(status=status)

        query = query.order_by(Attendance.date.desc())
        return paginate(query, attendances_schema, resource_name="attendance")


    @jwt_required()
    def post(self):
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        json_data = request.get_json() or {}
        errors = attendance_schema.validate(json_data)
        if errors:
            return error_response("Validation failed.", status_code=400, errors=errors)

        course_id = json_data.get("course_id")
        course = Course.query.get(course_id)
        if not course:
            return error_response("Course not found.", status_code=404)

        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), course.school_id)
        if scope_err:
            return scope_err

        try:
            if "date" in json_data:
                json_data["date"] = datetime.strptime(json_data["date"], "%Y-%m-%d").date()

            new_attendance = attendance_schema.load(json_data, session=db.session)
            db.session.add(new_attendance)
            db.session.commit()

            # Eager-load course for response
            new_attendance = Attendance.query.options(joinedload(Attendance.course)).get(new_attendance.id)

            return success_response(
                "Attendance record created successfully.",
                attendance_schema.dump(new_attendance),
                status_code=201,
            )

        except IntegrityError:
            db.session.rollback()
            current_app.logger.warning(
                f"Duplicate attendance prevented: user_id={json_data.get('user_public_id')}, "
                f"course_id={json_data.get('course_id')}, date={json_data.get('date')}"
            )
            return error_response(
                "Attendance record already exists for this user, course, and date.",
                status_code=409,
            )
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on POST /attendance: {str(e)}")
            return error_response("Error creating attendance record.", status_code=500, errors=str(e))


class AttendanceResource(Resource):
    @jwt_required(optional=True)
    def get(self, attendance_id):
        attendance = Attendance.query.options(joinedload(Attendance.course)).get(attendance_id)
        if not attendance:
            return error_response("Attendance record not found.", status_code=404)
        return success_response("Fetched attendance record.", attendance_schema.dump(attendance))

    @jwt_required()
    def put(self, attendance_id):
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        attendance = Attendance.query.get(attendance_id)
        if not attendance:
            return error_response("Attendance record not found.", status_code=404)

        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), attendance.course.school_id)
        if scope_err:
            return scope_err

        json_data = request.get_json() or {}
        errors = attendance_schema.validate(json_data)
        if errors:
            return error_response("Validation failed.", status_code=400, errors=errors)

        try:
            if "date" in json_data:
                json_data["date"] = datetime.strptime(json_data["date"], "%Y-%m-%d").date()

            updated = attendance_schema.load(json_data, instance=attendance, session=db.session)
            db.session.commit()

            updated = Attendance.query.options(joinedload(Attendance.course)).get(updated.id)

            return success_response(
                "Attendance record replaced successfully.",
                attendance_schema.dump(updated),
            )

        except IntegrityError:
            db.session.rollback()
            current_app.logger.warning(
                f"Duplicate attendance update blocked: user_id={json_data.get('user_public_id')}, "
                f"course_id={json_data.get('course_id')}, date={json_data.get('date')}"
            )
            return error_response(
                "Another attendance record already exists for this user, course, and date.",
                status_code=409,
            )
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on PUT /attendance/{attendance_id}: {str(e)}")
            return error_response("Error updating attendance record.", status_code=500, errors=str(e))

    @jwt_required()
    def patch(self, attendance_id):
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        attendance = Attendance.query.get(attendance_id)
        if not attendance:
            return error_response("Attendance record not found.", status_code=404)

        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), attendance.course.school_id)
        if scope_err:
            return scope_err

        json_data = request.get_json() or {}
        errors = attendance_schema.validate(json_data, partial=True)
        if errors:
            return error_response("Validation failed.", status_code=400, errors=errors)

        try:
            if "date" in json_data:
                json_data["date"] = datetime.strptime(json_data["date"], "%Y-%m-%d").date()

            updated = attendance_schema.load(json_data, instance=attendance, session=db.session, partial=True)
            db.session.commit()

            updated = Attendance.query.options(joinedload(Attendance.course)).get(updated.id)

            return success_response(
                "Attendance record updated successfully.",
                attendance_schema.dump(updated),
            )

        except IntegrityError:
            db.session.rollback()
            current_app.logger.warning(
                f"Duplicate attendance patch blocked: user_id={json_data.get('user_public_id')}, "
                f"course_id={json_data.get('course_id')}, date={json_data.get('date')}"
            )
            return error_response(
                "Another attendance record already exists for this user, course, and date.",
                status_code=409,
            )
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on PATCH /attendance/{attendance_id}: {str(e)}")
            return error_response("Error updating attendance record.", status_code=500, errors=str(e))

    @jwt_required()
    def delete(self, attendance_id):
        allowed, resp = require_roles("educator", "manager")
        if not allowed:
            return resp

        claims = get_jwt()
        attendance = Attendance.query.get(attendance_id)
        if not attendance:
            return error_response("Attendance record not found.", status_code=404)

        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), attendance.course.school_id)
        if scope_err:
            return scope_err

        try:
            db.session.delete(attendance)
            db.session.commit()
            return success_response(f"Attendance record {attendance_id} deleted successfully.")
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on DELETE /attendance/{attendance_id}: {str(e)}")
            return error_response("Error deleting attendance record.", status_code=500, errors=str(e))
