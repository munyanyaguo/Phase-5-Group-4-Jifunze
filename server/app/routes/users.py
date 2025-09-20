import re
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

from models.user import User, ROLES
from models.school import School
from models.base import db

# Email validation regex
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

class UserResource(Resource):
    @jwt_required()
    def get(self, user_id=None):
        """Get user ID or current user"""
        try:
            if user_id:
                user = User.query.get(user_id)
                if not user:
                    return {"message": "User not found"}, 404
                return {"user": user.to_dict()}, 200
            else:
                user_id = get_jwt_identity()
                user = User.query.filter_by(id=user_id).first()
                if not user:
                    return {"message": "User not found"}, 404
                return {"user": user.to_dict()}, 200
        except Exception as e:
            return {"message": "Something went wrong", "error": str(e)}, 500

    @jwt_required()
    def put(self, user_id):
        """Update user information"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {"message": "User not found"}, 404
            
            # Check if current user can update this user
            current_user_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_id).first()
            current_user_claims = get_jwt()

            if (user.public_id != current_user_id and 
                current_user_claims.get("role") != "manager" and 
                current_user.school_id != user.school_id):
                return {"message": "Not authorized to update this user"}, 403
            
            data = request.get_json() or {}

            # Update allowed fields
            if "name" in data:
                name = data.get("name", "").strip()
                if name:
                    user.name = name

                if "email" in data:
                    email = data.get("email", "").lower().strip()
                    if not EMAIL_REGEX.match(email):
                        return {"message": "Invalid email format"}, 400
                    # Check if email is taken
                    existing_user = User.query.filter(User.email == email, User.id != user.id).first()
                    if existing_user:
                        return {"message": "Emailalready taken"}, 400
                    user.email = email

                    # Only managers can update roles and school_id
                    if current_user_claims.get("role") == "manager":
                        if "role" in data:
                            role = data.get("role", "").lower().strip()
                            if role and role in ROLES:
                                user.role = role
                            elif role:
                                return {"message": f"Invalid role. Must be one of {ROLES}"}, 400
                        
                        if "school_id" in data:
                            school_id = data.get("school_id")
                            if school_id:
                                school = School.query.get(school_id)
                                if not school:
                                    return {"message": "School not found"}, 404
                                user.school_id =school_id
                    
                    user.save()
                    return {"message": "User updated successfully", "user": user.to_dict()}, 200
                
        except ValueError as ve:
            return {"message": str(ve)}, 400
        except Exception as e:
            db.session.rollback()
            return {"message": "Something went wrong", "error": str(e)}, 500
    
    @jwt_required()
    def delete(self, user_id):
        """Delete user"""
        try:
            current_user_claims = get_jwt()
            if current_user_claims.get("role") != "manager":
                return {"message": "Only managers can delete users"}, 403
            
            user = User.query.get(user_id)
            if not user:
                return {"message": "User not found"}, 404
            
            # Check if manager is from the same school
            current_user_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_id).first()
            if current_user.school_id != user.school_id:
                return {"message": "Can only delete users from your school"}, 403
            
            user.delete()
            return {"message": "User deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": "Something went wrong", "error": str(e)}, 500

