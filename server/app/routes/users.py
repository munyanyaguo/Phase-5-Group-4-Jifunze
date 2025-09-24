from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError

from app.models.user import User, ROLES
from app.models.school import School
from app.models.base import db
from app.schemas.user import (
    UserSchema, UserCreateSchema, UserUpdateSchema, PasswordChangeSchema,
    UserListResponseSchema, UserStatsSchema, UserQuerySchema
)
from app.schemas.schools import SchoolSchema
from app.utils.responses import success_response, error_response

# Initialize schemas
user_schema = UserSchema()
users_schema = UserSchema(many=True)
user_create_schema = UserCreateSchema()
user_update_schema = UserUpdateSchema()
password_change_schema = PasswordChangeSchema()
user_list_response_schema = UserListResponseSchema()
user_stats_schema = UserStatsSchema()
user_query_schema = UserQuerySchema()


class UserResource(Resource):
    @jwt_required()
    def get(self, user_id=None):
        """Get user by ID or get current user"""
        try:
            if user_id:
                # Get specific user by ID
                user = User.query.get(user_id)
                if not user:
                    return error_response("User not found", status_code=404)
                return success_response("User retrieved successfully", {"user": user_schema.dump(user)})
            else:
                # Get current user from JWT
                current_user_public_id = get_jwt_identity()
                user = User.query.filter_by(public_id=current_user_public_id).first()
                if not user:
                    return error_response("User not found", status_code=404)
                return success_response("User retrieved successfully", {"user": user_schema.dump(user)})
                
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    @jwt_required()
    def put(self, user_id):
        """Update user information"""
        try:
            user = User.query.get(user_id)
            if not user:
                return error_response("User not found", status_code=404)
                
            # Check if current user can update this user
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()
            current_user_claims = get_jwt()
            
            # Users can update themselves, managers can update users in their school
            if (user.public_id != current_user_public_id and 
                current_user_claims.get('role') != 'manager' and
                current_user.school_id != user.school_id):
                return error_response("Not authorized to update this user", status_code=403)
                
            # Validate input data
            user_update_schema.context = {'user_id': user.id}
            try:
                validated_data = user_update_schema.load(request.get_json() or {})
            except ValidationError as err:
                return error_response("Validation error", err.messages, status_code=400)
            
            # Update allowed fields
            for field, value in validated_data.items():
                if field == 'role' or field == 'school_id':
                    # Only managers can update role and school_id
                    if current_user_claims.get('role') == 'manager':
                        setattr(user, field, value)
                else:
                    setattr(user, field, value)
                        
            user.save()
            return success_response("User updated successfully", {"user": user_schema.dump(user)})
            
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    @jwt_required()
    def delete(self, user_id):
        """Delete user (managers only)"""
        try:
            current_user_claims = get_jwt()
            if current_user_claims.get('role') != 'manager':
                return error_response("Only managers can delete users", status_code=403)
                
            user = User.query.get(user_id)
            if not user:
                return error_response("User not found", status_code=404)
                
            # Check if manager is from the same school
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()
            if current_user.school_id != user.school_id:
                return error_response("Can only delete users from your school", status_code=403)
                
            user.delete()
            return success_response("User deleted successfully")
            
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class UserListResource(Resource):
    @jwt_required()
    def get(self):
        """Get list of users with filtering and pagination"""
        try:
            # Validate query parameters
            try:
                query_params = user_query_schema.load(request.args)
            except ValidationError as err:
                return error_response("Invalid query parameters", err.messages, status_code=400)
                
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()
            
            # Build query based on user role
            query = User.query
            
            # Non-managers can only see users from their school
            if current_user_claims.get('role') != 'manager':
                query = query.filter(User.school_id == current_user.school_id)
            
            # Apply filters
            if query_params.get('role'):
                query = query.filter(User.role == query_params['role'])
                
            if query_params.get('school_id'):
                query = query.filter(User.school_id == query_params['school_id'])
                
            if query_params.get('search'):
                search_term = f"%{query_params['search']}%"
                query = query.filter(
                    User.name.ilike(search_term) | 
                    User.email.ilike(search_term)
                )
            
            # Pagination
            users = query.paginate(
                page=query_params['page'], 
                per_page=query_params['per_page'], 
                error_out=False
            )
            
            response_data = {
                "users": users_schema.dump(users.items),
                "pagination": {
                    "page": users.page,
                    "pages": users.pages,
                    "per_page": users.per_page,
                    "total": users.total,
                    "has_next": users.has_next,
                    "has_prev": users.has_prev
                }
            }
            
            return success_response("Users retrieved successfully", response_data)
            
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class UserPasswordResource(Resource):
    @jwt_required()
    def patch(self):
        """Change current user's password"""
        try:
            current_user_public_id = get_jwt_identity()
            user = User.query.filter_by(public_id=current_user_public_id).first()
            
            if not user:
                return error_response("User not found", status_code=404)
                
            # Validate input data
            try:
                validated_data = password_change_schema.load(request.get_json() or {})
            except ValidationError as err:
                return error_response("Validation error", err.messages, status_code=400)
                
            current_password = validated_data['current_password']
            new_password = validated_data['new_password']
            
            # Verify current password
            if not user.check_password(current_password):
                return error_response("Current password is incorrect", status_code=400)
                
            # Update password
            user.set_password(new_password)
            user.save()
            
            return success_response("Password updated successfully")
            
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class UsersBySchoolResource(Resource):
    @jwt_required()
    def get(self, school_id):
        """Get all users in a specific school (managers only)"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()
            
            # Only managers can view users by school, and only their own school
            if (current_user_claims.get('role') != 'manager' or 
                current_user.school_id != school_id):
                return error_response("Not authorized to view users from this school", status_code=403)
            
            # Verify school exists
            school = School.query.get(school_id)
            if not school:
                return error_response("School not found", status_code=404)
                
            # Get users with filtering
            query = User.query.filter(User.school_id == school_id)
            
            role = request.args.get('role')
            if role and role in ROLES:
                query = query.filter(User.role == role)
                
            search = request.args.get('search')
            if search:
                search_term = f"%{search}%"
                query = query.filter(User.name.ilike(search_term) | User.email.ilike(search_term))
            
            # Pagination
            try:
                page = int(request.args.get('page', 1))
                per_page = min(int(request.args.get('per_page', 20)), 100)
            except ValueError:
                return error_response("Invalid pagination parameters", status_code=400)
            
            users = query.paginate(page=page, per_page=per_page, error_out=False)
            
            response_data = {
                "school": SchoolSchema().dump(school),
                "users": users_schema.dump(users.items),
                "pagination": {
                    "page": users.page,
                    "pages": users.pages,
                    "per_page": users.per_page,
                    "total": users.total,
                    "has_next": users.has_next,
                    "has_prev": users.has_prev
                }
            }
            
            return success_response("School users retrieved successfully", response_data)
            
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    @jwt_required()
    def post(self, school_id):
        """Add new user to school (managers only)"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()
            
            # Only managers can add users, and only to their own school
            if (current_user_claims.get('role') != 'manager' or 
                current_user.school_id != school_id):
                return error_response("Not authorized to add users to this school", status_code=403)
            
            # Verify school exists
            school = School.query.get(school_id)
            if not school:
                return error_response("School not found", status_code=404)
                
            # Validate input data
            try:
                validated_data = user_create_schema.load(request.get_json() or {})
            except ValidationError as err:
                return error_response("Validation error", err.messages, status_code=400)

            new_user = User(
                name=validated_data['name'],
                email=validated_data['email'],
                role=validated_data['role'],
                school_id=school_id
            )
            new_user.set_password(validated_data['password'])
            new_user.save()

            return success_response("User added successfully", {"user": user_schema.dump(new_user)}, status_code=201)
            
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class UserProfileResource(Resource):
    @jwt_required()
    def get(self):
        """Get current user's profile with related data"""
        try:
            current_user_public_id = get_jwt_identity()
            user = User.query.filter_by(public_id=current_user_public_id).first()
            
            if not user:
                return error_response("User not found", status_code=404)
                
            return success_response("Profile retrieved successfully", {"profile": user_schema.dump(user)})
            
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class UserDashboardResource(Resource):
    @jwt_required()
    def get(self):
        """Get dashboard data based on user role"""
        try:
            current_user_public_id = get_jwt_identity()
            current_user_claims = get_jwt()
            user = User.query.filter_by(public_id=current_user_public_id).first()
            
            if not user:
                return error_response("User not found", status_code=404)
            
            role = current_user_claims.get('role')
            dashboard_data = {
                "user": user_schema.dump(user),
                "school": SchoolSchema().dump(user.school) if user.school else None
            }
            
            if role == 'manager':
                # Manager dashboard: school overview
                school_id = user.school_id
                
                # User counts by role
                dashboard_data['user_stats'] = {}
                for user_role in ROLES:
                    count = User.query.filter(
                        User.school_id == school_id,
                        User.role == user_role
                    ).count()
                    dashboard_data['user_stats'][f"{user_role}s"] = count
                
                # Course count
                dashboard_data['total_courses'] = len(user.school.courses) if user.school else 0
                
                # Recent activity (users registered in last 7 days)
                from datetime import datetime, timedelta
                week_ago = datetime.now() - timedelta(days=7)
                recent_users = User.query.filter(
                    User.school_id == school_id,
                    User.created_at >= week_ago
                ).count()
                dashboard_data['recent_registrations'] = recent_users
                
            elif role == 'educator':
                # Educator dashboard: teaching overview
                try:
                    from schemas.course import CourseSchema
                    course_schema = CourseSchema(many=True)
                    dashboard_data['my_courses'] = course_schema.dump(user.courses)
                except ImportError:
                    # Fallback if CourseSchema doesn't exist
                    dashboard_data['my_courses'] = [course.to_dict() for course in user.courses]
                
                dashboard_data['courses_count'] = len(user.courses)
                
                # Total students across all courses
                total_students = 0
                for course in user.courses:
                    total_students += len(course.enrollments)
                dashboard_data['total_students'] = total_students
                
            elif role == 'student':
                # Student dashboard: learning overview
                dashboard_data['my_enrollments'] = [enrollment.to_dict() for enrollment in user.enrollments]
                dashboard_data['enrolled_courses'] = len(user.enrollments)
                
                # Recent attendance
                dashboard_data['recent_attendance'] = [att.to_dict() for att in user.attendance[-5:]]
            
            return success_response("Dashboard data retrieved successfully", {"dashboard": dashboard_data})
            
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)