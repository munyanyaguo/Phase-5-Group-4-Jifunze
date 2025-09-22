from flask import request, current_app
from flask_restful import Resource
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from datetime import datetime

from app.models import Attendance
from app.extensions import db, paginate
from app.schemas.attendance import attendance_schema, attendances_schema
from app.utils.responses import success_response, error_response


class AttendanceListResource(Resource):
    def get(self):
        """
        GET /attendance?page=1&per_page=10&course_id=1&user_id=5&status=present
        """
        query = Attendance.query

        # Filters
        course_id = request.args.get("course_id", type=int)
        user_id = request.args.get("user_id", type=int)
        status = request.args.get("status", type=str)

        if course_id:
            query = query.filter_by(course_id=course_id)
        if user_id:
            query = query.filter_by(user_id=user_id)
        if status:
            query = query.filter_by(status=status)

        query = query.order_by(Attendance.date.desc())
        return paginate(query, attendances_schema, resource_name="attendance")

    def post(self):
        """
        POST /attendance
        {
          "user_id": 1,
          "course_id": 2,
          "date": "2025-09-15",
          "status": "present",
          "verified_by": 3
        }
        """
        json_data = request.get_json() or {}
        errors = attendance_schema.validate(json_data)
        if errors:
            return error_response("Validation failed", 400, errors)

        try:
            # Parse date string
            if "date" in json_data:
                json_data["date"] = datetime.strptime(
                    json_data["date"], "%Y-%m-%d"
                ).date()

            new_attendance = attendance_schema.load(json_data, session=db.session)
            db.session.add(new_attendance)
            db.session.commit()

            return success_response(
                "Attendance record created successfully.",
                attendance_schema.dump(new_attendance),
                status_code=201,
            )

        except IntegrityError:
            db.session.rollback()
            current_app.logger.warning(
                f"Duplicate attendance: user_id={json_data.get('user_id')}, "
                f"course_id={json_data.get('course_id')}, date={json_data.get('date')}"
            )
            return error_response(
                "Attendance record already exists for this user, course, and date.",
                409,
            )

        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"Database error on POST /attendance: {str(e)}")
            return error_response("Error creating attendance record.", 500)


class AttendanceResource(Resource):
    def get(self, attendance_id):
        """
        GET /attendance/<id>
        """
        attendance = Attendance.query.get_or_404(attendance_id)
        return success_response(
            "Fetched attendance record.", attendance_schema.dump(attendance)
        )

    def put(self, attendance_id):
        """
        PUT /attendance/<id>
        Replace the entire attendance record
        """
        attendance = Attendance.query.get_or_404(attendance_id)
        json_data = request.get_json() or {}
        errors = attendance_schema.validate(json_data)
        if errors:
            return error_response("Validation failed", 400, errors)

        try:
            if "date" in json_data:
                json_data["date"] = datetime.strptime(
                    json_data["date"], "%Y-%m-%d"
                ).date()

            updated_attendance = attendance_schema.load(
                json_data, instance=attendance, session=db.session
            )
            db.session.commit()

            return success_response(
                "Attendance record updated successfully.",
                attendance_schema.dump(updated_attendance),
            )

        except IntegrityError:
            db.session.rollback()
            current_app.logger.warning(
                f"Duplicate attendance update blocked: user_id={json_data.get('user_id')}, "
                f"course_id={json_data.get('course_id')}, date={json_data.get('date')}"
            )
            return error_response(
                "Another attendance record already exists for this user, course, and date.",
                409,
            )

        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"Database error on PUT /attendance/{attendance_id}: {str(e)}")
            return error_response("Error updating attendance record.", 500)

    def patch(self, attendance_id):
        """
        PATCH /attendance/<id>
        Partially update fields
        """
        attendance = Attendance.query.get_or_404(attendance_id)
        json_data = request.get_json() or {}
        errors = attendance_schema.validate(json_data, partial=True)
        if errors:
            return error_response("Validation failed", 400, errors)

        try:
            if "date" in json_data:
                json_data["date"] = datetime.strptime(
                    json_data["date"], "%Y-%m-%d"
                ).date()

            updated_attendance = attendance_schema.load(
                json_data, instance=attendance, session=db.session, partial=True
            )
            db.session.commit()

            return success_response(
                "Attendance record partially updated.",
                attendance_schema.dump(updated_attendance),
            )

        except IntegrityError:
            db.session.rollback()
            current_app.logger.warning(
                f"Duplicate attendance patch blocked: user_id={json_data.get('user_id')}, "
                f"course_id={json_data.get('course_id')}, date={json_data.get('date')}"
            )
            return error_response(
                "Another attendance record already exists for this user, course, and date.",
                409,
            )

        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"Database error on PATCH /attendance/{attendance_id}: {str(e)}")
            return error_response("Error updating attendance record.", 500)

    def delete(self, attendance_id):
        """
        DELETE /attendance/<id>
        """
        attendance = Attendance.query.get_or_404(attendance_id)
        try:
            db.session.delete(attendance)
            db.session.commit()
            return success_response(
                f"Attendance record {attendance_id} deleted successfully."
            )
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"Database error on DELETE /attendance/{attendance_id}: {str(e)}")
            return error_response("Error deleting attendance record.", 500)
