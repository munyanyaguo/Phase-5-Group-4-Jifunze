import re
import secrets
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt, create_access_token, create_refresh_token

from models.user import User, ROLES
from models.reset_password import ResetPassword
from models.base import db

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

# JWT blocklist - in production, use Redis or database
jwt_blocklist = set()


class RegisterResource(Resource):
    def post(self):
        data = request.get_json() or {}

        required_fields = ['name', 'email', 'role', 'school_id', 'password']
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return {"message": f"{field} is required"}, 400

        name = data.get("name", "").strip()
        email = data.get("email", "").lower().strip()
        role = data.get("role", "").lower().strip()
        school_id = int(str(data.get("school_id", "")).strip())
        password = data.get("password", "").strip()

        if not EMAIL_REGEX.match(email):
            return {"message": "Invalid email format"}, 400
        if len(password) < 6:
            return {"message": "Password is too short"}, 400
        if User.query.filter_by(email=email).first():
            return {"message": "Email already registered"}, 400
        if role not in ROLES:
            return {"message": f"Invalid role. Must be one of {ROLES}"}, 400

        try:
            new_user = User(
                name=name,
                email=email,
                role=role,
                school_id=school_id
            )
            new_user.set_password(password)

            db.session.add(new_user)
            db.session.commit()

            return {
                "message": "User registered successfully",
                "user": new_user.to_dict()
            }, 201

        except ValueError as e:
            return {"message": str(e)}, 400
        except Exception as e:
            db.session.rollback()
            return {"message": "Something went wrong", "error": str(e)}, 500


class LoginResource(Resource):
    def post(self):
        data = request.get_json() or {}

        if not data.get('email') or not data.get('password'):
            return {"message": "Email and password are required"}, 400

        email = data.get("email", "").lower().strip()
        password = data.get("password", "")
        user = User.query.filter_by(email=email).first()

        try:
            if not user or not user.check_password(password):
                return {"message": "Invalid credentials"}, 401

            claims = {
                "role": user.role,
                "email": user.email,
                "school_id": user.school_id
            }
            access_token = create_access_token(identity=user.public_id, additional_claims=claims)
            refresh_token = create_refresh_token(identity=user.public_id, additional_claims=claims)

            response = {
                "message": "Success",
                "data": {
                    "access_token": access_token,
                    "refresh_token": refresh_token,
                    "email": user.email,
                    "role": user.role,
                    "name": user.name,
                    "school_id": user.school_id
                }
            }, 200
            return response

        except Exception as e:
            return {"message": "Something went wrong", "error": str(e)}, 500


class LogoutResource(Resource):
    @jwt_required()
    def post(self):
        try:
            jti = get_jwt().get("jti")
            jwt_blocklist.add(jti)
            return {"message": "Logout successful"}, 200
        except Exception as e:
            return {"message": "Something went wrong during logout", "error": str(e)}, 500


class ResetPasswordResource(Resource):
    def post(self):
        """Request password reset - generates token and sends email"""
        data = request.get_json() or {}
        
        if not data.get('email'):
            return {"message": "Email is required"}, 400
            
        email = data.get("email", "").lower().strip()
        
        if not EMAIL_REGEX.match(email):
            return {"message": "Invalid email format"}, 400
            
        user = User.query.filter_by(email=email).first()
        
        # Always return success message for security (don't reveal if email exists)
        if not user:
            return {"message": "If email exists, password reset instructions have been sent"}, 200
            
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
            
            return {
                "message": "If email exists, password reset instructions have been sent",
                "reset_token": token  # Remove this in production - only for testing
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": "Something went wrong", "error": str(e)}, 500
    
    def patch(self):
        """Reset password using token"""
        data = request.get_json() or {}
        
        required_fields = ['token', 'new_password']
        for field in required_fields:
            if field not in data or not str(data[field]).strip():
                return {"message": f"{field} is required"}, 400
                
        token = data.get("token", "").strip()
        new_password = data.get("new_password", "").strip()
        
        if len(new_password) < 6:
            return {"message": "Password is too short"}, 400
            
        # Find valid reset token
        reset_request = ResetPassword.find_valid_token(token)
        if not reset_request:
            return {"message": "Invalid or expired reset token"}, 400
            
        try:
            # Get the user
            user = User.query.get(reset_request.user_id)
            if not user:
                return {"message": "User not found"}, 404
                
            # Update password
            user.set_password(new_password)
            
            # Mark token as used
            reset_request.mark_as_used()
            
            # Commit changes
            db.session.commit()
            
            return {"message": "Password reset successful"}, 200
            
        except Exception as e:
            db.session.rollback()
            return {"message": "Something went wrong", "error": str(e)}, 500