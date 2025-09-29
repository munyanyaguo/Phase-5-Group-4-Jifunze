import secrets
from flask import request, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt, create_access_token, create_refresh_token, get_jwt_identity
from marshmallow import ValidationError

from app.models.user import User, ROLES
from app.models.reset_password import ResetPassword
from app.models.base import db
from app.schemas.auth import (RegisterSchema, ResetPasswordRequestSchema, 
    ResetPasswordConfirmSchema, LoginSchema)
from app.schemas.user import UserSchema
from app.utils.responses import success_response, error_response

# Initialize schemas
register_schema = RegisterSchema()
user_schema = UserSchema()
login_schema = LoginSchema()
reset_password_request_schema = ResetPasswordRequestSchema()
reset_password_confirm_schema = ResetPasswordConfirmSchema()

# JWT blocklist - in production, use Redis or database
jwt_blocklist = set()


class RegisterResource(Resource):
    def post(self):
        try:
            # Validate input data
            validated_data = register_schema.load(request.get_json() or {})
        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)

        try:
            # Create user with optional school_id
            user_data = {
                'name': validated_data['name'],
                'email': validated_data['email'],
                'role': validated_data['role'],
                # Only include school_id if it's in validated_data
                **({'school_id': validated_data['school_id']} if 'school_id' in validated_data else {})
            }
            
            new_user = User(**user_data)
            new_user.set_password(validated_data['password'])

            db.session.add(new_user)
            db.session.commit()

            return success_response("User registered successfully", {"user": user_schema.dump(new_user)}, status_code=201)

        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class LoginResource(Resource):
    def post(self):
        try:
            validated_data = login_schema.load(request.get_json() or {})
        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)

        email = validated_data['email']
        password = validated_data['password']
        user = User.query.filter_by(email=email).first()

        try:
            if not user or not user.check_password(password):
                return error_response("Invalid credentials", status_code=401)

            # Use string id for identity to avoid JWT subject error
            claims = {
                "role": user.role,
                "email": user.email,
                "school_id": user.school_id
            }
            access_token = create_access_token(identity=user.public_id, additional_claims=claims)
            refresh_token = create_refresh_token(identity=user.public_id, additional_claims=claims)

            # Build courses list depending on role
            user_courses = []

            if user.role == "educator":
                # Educator → their courses
                for course in user.courses:
                    course_data = {
                        "id": course.id,
                        "title": course.title,
                        "description": course.description,
                        "resources": [
                            {
                                "id": res.id,
                                "title": res.title,
                                "url": res.url
                            } for res in getattr(course, "resources", [])
                        ]
                    }
                    user_courses.append(course_data)

            elif user.role == "student":
                # Student → courses via enrollments
                for enrollment in user.enrollments:
                    course = enrollment.course
                    course_data = {
                        "id": course.id,
                        "title": course.title,
                        "description": course.description,
                        "resources": [
                            {
                                "id": res.id,
                                "title": res.title,
                                "url": res.url
                            } for res in getattr(course, "resources", [])
                        ]
                    }
                    user_courses.append(course_data)

            # Still expose UUID (public_id) to the frontend
            token_data = {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": {
                    "id": user.public_id,   # obfuscated UUID for frontend
                    "email": user.email,
                    "role": user.role,
                    "name": user.name,
                    "school_id": user.school_id,
                    "courses": user_courses
                }
            }

            return success_response("Login successful", token_data)

        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

class LogoutResource(Resource):
    @jwt_required()
    def post(self):
        try:
            jti = get_jwt().get("jti")
            jwt_blocklist.add(jti)
            return success_response("Logout successful")
        except Exception as e:
            return error_response("Something went wrong during logout", {"error": str(e)}, status_code=500)

class TokenRefreshResource(Resource):
    @jwt_required(refresh=True)
    def post(self):
        """
        POST /auth/refresh
        Requires a valid refresh token.
        Returns a new access token and a new refresh token (optional, but good practice).
        """
        try:
            current_user_public_id = get_jwt_identity()
            user = User.query.filter_by(public_id=current_user_public_id).first()
            if not user:
                return error_response("User not found for refresh token", status_code=401)

            # Rebuild claims for the new token
            claims = {
                "role": user.role,
                "email": user.email,
                "school_id": user.school_id
            }

            new_access_token = create_access_token(identity=current_user_public_id, additional_claims=claims, fresh=False)
            new_refresh_token = create_refresh_token(identity=current_user_public_id, additional_claims=claims)

            # Build courses list depending on role for the user object returned with the refresh
            user_courses = []
            if user.role == "educator":
                for course in user.courses:
                    user_courses.append({"id": course.id, "title": course.title}) # Simplified for refresh
            elif user.role == "student":
                for enrollment in user.enrollments:
                    course = enrollment.course
                    user_courses.append({"id": course.id, "title": course.title}) # Simplified for refresh


            return success_response(
                "Token refreshed successfully",
                {
                    "access_token": new_access_token,
                    "refresh_token": new_refresh_token,
                    "user": {
                        "id": user.public_id,
                        "email": user.email,
                        "role": user.role,
                        "name": user.name,
                        "school_id": user.school_id,
                        "courses": user_courses # Include updated courses if necessary
                    }
                }
            )
        except Exception as e:
            current_app.logger.error(f"Token refresh error: {str(e)}")
            return error_response("Failed to refresh token", {"error": str(e)}, status_code=401)

class ResetPasswordResource(Resource):
    def post(self):
        """Request password reset - generates token and sends email"""
        try:
            # Validate input data
            validated_data = reset_password_request_schema.load(request.get_json() or {})
        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)
            
        email = validated_data['email']
        user = User.query.filter_by(email=email).first()
        
        # Always return success message for security (don't reveal if email exists)
        success_message = "If email exists, password reset instructions have been sent"
        
        if not user:
            return success_response(success_message)
            
        try:
            # Generate secure random token
            token = secrets.token_urlsafe(32)
            
            # Create reset password record
            reset_request = ResetPassword.create_reset_token(
                user_id=user.id,
                token=token,
                hours_valid=24
            )
            
            # TODO: Send email with reset link containing the token
            # Example: send_reset_email(user.email, token)
            
            # Remove reset_token from production response
            return success_response(success_message, {"reset_token": token})
            
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)
    
    def patch(self):
        """Reset password using token"""
        try:
            # Validate input data
            validated_data = reset_password_confirm_schema.load(request.get_json() or {})
        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)
                
        token = validated_data['token']
        new_password = validated_data['new_password']
            
        # Find valid reset token
        reset_request = ResetPassword.find_valid_token(token)
        if not reset_request:
            return error_response("Invalid or expired reset token", status_code=400)
            
        try:
            # Get the user
            user = User.query.get(reset_request.user_id)
            if not user:
                return error_response("User not found", status_code=404)
                
            # Update password
            user.set_password(new_password)
            
            # Mark token as used
            reset_request.mark_as_used()
            
            # Commit changes
            db.session.commit()
            
            return success_response("Password reset successful")
            
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)