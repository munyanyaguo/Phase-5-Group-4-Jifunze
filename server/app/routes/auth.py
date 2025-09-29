import secrets
from flask import request
from flask_restful import Resource
from flask_jwt_extended import (
    jwt_required, get_jwt, create_access_token, create_refresh_token
)
from marshmallow import ValidationError

from app.models.user import User
from app.models.reset_password import ResetPassword
from app.models.base import db
from app.schemas.auth import (
    RegisterSchema, ResetPasswordRequestSchema, 
    ResetPasswordConfirmSchema, LoginSchema
)
from app.schemas.user import UserSchema
from app.utils.responses import success_response, error_response

# Initialize schemas
register_schema = RegisterSchema()
user_schema = UserSchema()
login_schema = LoginSchema()
reset_password_request_schema = ResetPasswordRequestSchema()
reset_password_confirm_schema = ResetPasswordConfirmSchema()

# JWT blocklist (⚠️ For production, store in Redis or DB)
jwt_blocklist = set()


# ------------------------------
# Helper function
# ------------------------------
def serialize_course(course):
    return {
        "id": course.id,
        "title": course.title,
        "description": course.description,
        "resources": [
            {"id": res.id, "title": res.title, "url": res.url} 
            for res in getattr(course, "resources", [])
        ]
    }


# ------------------------------
# Register User
# ------------------------------
class RegisterResource(Resource):
    def post(self):
        try:
            validated_data = register_schema.load(request.get_json() or {})
        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)

        try:
            user_data = {
                "name": validated_data["name"],
                "email": validated_data["email"],
                "role": validated_data["role"],
                "school_id": validated_data.get("school_id")
            }

            new_user = User(**user_data)
            new_user.set_password(validated_data["password"])

            db.session.add(new_user)
            db.session.commit()

            return success_response(
                "User registered successfully",
                {"user": user_schema.dump(new_user)},
                status_code=201
            )
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


# ------------------------------
# Login
# ------------------------------
class LoginResource(Resource):
    def post(self):
        try:
            validated_data = login_schema.load(request.get_json() or {})
        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)

        email = validated_data["email"]
        password = validated_data["password"]
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return error_response("Invalid credentials", status_code=401)

        # JWT tokens
        claims = {
            "role": user.role,
            "email": user.email,
            "school_id": user.school_id
        }
        access_token = create_access_token(identity=user.public_id, additional_claims=claims)
        refresh_token = create_refresh_token(identity=user.public_id, additional_claims=claims)

        # Courses depending on role
        if user.role == "educator":
            user_courses = [serialize_course(c) for c in user.courses]
        elif user.role == "student":
            user_courses = [serialize_course(e.course) for e in user.enrollments]
        else:
            user_courses = []

        token_data = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": {
                "id": user.public_id,
                "email": user.email,
                "role": user.role,
                "name": user.name,
                "school_id": user.school_id,
                "courses": user_courses
            }
        }

        return success_response("Login successful", token_data)


# ------------------------------
# Logout
# ------------------------------
class LogoutResource(Resource):
    @jwt_required()
    def post(self):
        try:
            jti = get_jwt().get("jti")
            jwt_blocklist.add(jti)
            return success_response("Logout successful")
        except Exception as e:
            return error_response("Something went wrong during logout", {"error": str(e)}, status_code=500)


# ------------------------------
# Reset Password
# ------------------------------
class ResetPasswordResource(Resource):
    def post(self):
        """Step 1: Request password reset"""
        try:
            validated_data = reset_password_request_schema.load(request.get_json() or {})
        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)

        email = validated_data["email"]
        user = User.query.filter_by(email=email).first()

        # Generic success response to prevent email enumeration
        success_message = "If that email exists, reset instructions have been sent"

        if not user:
            return success_response(success_message)

        try:
            token = secrets.token_urlsafe(32)
            reset_request = ResetPassword.create_reset_token(user_id=user.id, token=token, hours_valid=24)

            db.session.add(reset_request)
            db.session.commit()

            # ⚠️ In production, send the token via email, not API
            return success_response(success_message, {"reset_token": token})

        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    def patch(self):
        """Step 2: Reset password using token"""
        try:
            validated_data = reset_password_confirm_schema.load(request.get_json() or {})
        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)

        token = validated_data["token"]
        new_password = validated_data["new_password"]

        reset_request = ResetPassword.find_valid_token(token)
        if not reset_request:
            return error_response("Invalid or expired reset token", status_code=400)

        try:
            user = User.query.get(reset_request.user_id)
            if not user:
                return error_response("User not found", status_code=404)

            user.set_password(new_password)
            reset_request.mark_as_used()

            db.session.commit()
            return success_response("Password reset successful")

        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)
