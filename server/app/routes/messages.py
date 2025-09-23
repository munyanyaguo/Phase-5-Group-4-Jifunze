from flask import request, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from datetime import datetime

from app.models import Message, Course, Enrollment, User
from app.extensions import db, paginate
from app.schemas.message import message_schema, messages_schema
from app.utils.responses import success_response, error_response
from app.routes.attendance import require_roles, assert_same_school_or_forbidden
from app.schemas.user import UserSchema
from app.schemas.course import CourseSchema


class MessageListResource(Resource):
    @jwt_required(optional=True)
    def get(self):
        """
        GET /messages?course_id=1&user_id=5
        Public list with filters (optional auth).
        """
        query = Message.query

        course_id = request.args.get("course_id", type=int)
        user_id = request.args.get("user_id", type=int)

        if course_id:
            query = query.filter_by(course_id=course_id)
        if user_id:
            query = query.filter_by(user_id=user_id)

        query = query.order_by(Message.created_at.desc())
        return paginate(query, messages_schema, resource_name="messages")

    @jwt_required()
    def post(self):
        """
        POST /messages
        Body: { "course_id": 2, "content": "Hello class!" }
        Allowed: student (if enrolled), educator (for own course), manager (for own school).
        """
        claims = get_jwt()
        json_data = request.get_json() or {}
        errors = message_schema.validate(json_data)
        if errors:
            return error_response("Validation failed.", status_code=400, errors=errors)

        user_id = claims.get("sub")   # current user id
        role = claims.get("role")
        course = Course.query.get(json_data.get("course_id"))
        if not course:
            return error_response("Course not found.", status_code=404)

        # Check school scope
        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), course.school_id)
        if scope_err:
            return scope_err

        # Role-specific restrictions
        if role == "educator" and course.educator_id != user_id:
            return error_response("You can only post in your own courses.", status_code=403)

        if role == "student":
            enrolled = Enrollment.query.filter_by(user_id=user_id, course_id=course.id).first()
            if not enrolled:
                return error_response("You are not enrolled in this course.", status_code=403)

        try:
            new_message = message_schema.load({**json_data, "user_id": user_id}, session=db.session)
            db.session.add(new_message)
            db.session.commit()
            return success_response("Message created successfully.", message_schema.dump(new_message), 201)
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on POST /messages: {str(e)}")
            return error_response("Error creating message.", status_code=500, errors=str(e))


class MessageResource(Resource):
    @jwt_required(optional=True)
    def get(self, message_id):
        """GET /messages/<id>"""
        message = Message.query.get(message_id)
        if not message:
            return error_response("Message not found.", status_code=404)
        return success_response("Fetched message.", message_schema.dump(message))

    @jwt_required()
    def put(self, message_id):
        """PUT /messages/<id> - replace message (manager or owner)."""
        claims = get_jwt()
        role, user_id = claims.get("role"), claims.get("sub")

        message = Message.query.get(message_id)
        if not message:
            return error_response("Message not found.", status_code=404)

        # Check school
        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), message.course.school_id)
        if scope_err:
            return scope_err

        # Only manager or the message owner
        if role != "manager" and message.user_id != user_id:
            return error_response("Forbidden.", status_code=403)

        json_data = request.get_json() or {}
        errors = message_schema.validate(json_data)
        if errors:
            return error_response("Validation failed.", status_code=400, errors=errors)

        try:
            updated = message_schema.load(json_data, instance=message, session=db.session)
            db.session.commit()
            return success_response("Message replaced successfully.", message_schema.dump(updated))
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on PUT /messages/{message_id}: {str(e)}")
            return error_response("Error updating message.", status_code=500, errors=str(e))

    @jwt_required()
    def patch(self, message_id):
        """PATCH /messages/<id> - partial update (manager or owner)."""
        claims = get_jwt()
        role, user_id = claims.get("role"), claims.get("sub")

        message = Message.query.get(message_id)
        if not message:
            return error_response("Message not found.", status_code=404)

        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), message.course.school_id)
        if scope_err:
            return scope_err

        if role != "manager" and message.user_id != user_id:
            return error_response("Forbidden.", status_code=403)

        json_data = request.get_json() or {}
        errors = message_schema.validate(json_data, partial=True)
        if errors:
            return error_response("Validation failed.", status_code=400, errors=errors)

        try:
            updated = message_schema.load(json_data, instance=message, session=db.session, partial=True)
            db.session.commit()
            return success_response("Message updated successfully.", message_schema.dump(updated))
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on PATCH /messages/{message_id}: {str(e)}")
            return error_response("Error updating message.", status_code=500, errors=str(e))

    @jwt_required()
    def delete(self, message_id):
        """DELETE /messages/<id> - only manager or message owner."""
        claims = get_jwt()
        role, user_id = claims.get("role"), claims.get("sub")

        message = Message.query.get(message_id)
        if not message:
            return error_response("Message not found.", status_code=404)

        scope_err = assert_same_school_or_forbidden(claims.get("school_id"), message.course.school_id)
        if scope_err:
            return scope_err

        if role != "manager" and message.user_id != user_id:
            return error_response("Forbidden.", status_code=403)

        try:
            db.session.delete(message)
            db.session.commit()
            return success_response(f"Message {message_id} deleted successfully.")
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"DB error on DELETE /messages/{message_id}: {str(e)}")
            return error_response("Error deleting message.", status_code=500, errors=str(e))
