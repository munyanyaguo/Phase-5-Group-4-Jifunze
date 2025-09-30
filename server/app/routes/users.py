from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError
from werkzeug.security import generate_password_hash
from app.models.user import User, ROLES
from app.models.school import School
from app.models.reset_password import ResetPassword
from app.models.base import db
from app.utils.responses import success_response, error_response
from datetime import datetime, timedelta
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
    def get(self, user_id):
        """Get user by ID (int) or public_id (string) or current user"""
        try:
            user = None
            if user_id:
                # Try int id first, then public_id
                if isinstance(user_id, int) or (isinstance(user_id, str) and user_id.isdigit()):
                    user = User.query.get(int(user_id))
                else:
                    user = User.query.filter_by(public_id=str(user_id)).first()
            else:
                current_user_public_id = get_jwt_identity()
                user = User.query.filter_by(public_id=str(current_user_public_id)).first()

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

            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()
            current_user_claims = get_jwt()

            # Only self or managers (same school)
            if (
                user.public_id != current_user_public_id
                and current_user_claims.get("role") != "manager"
                and current_user.school_id != user.school_id
            ):
                return error_response("Not authorized to update this user", status_code=403)

            # Validate input
            user_update_schema.context = {"user_id": user.id}
            validated_data = user_update_schema.load(request.get_json() or {})

            for field, value in validated_data.items():
                if field in ["role", "school_id"]:
                    if current_user_claims.get("role") == "manager":
                        setattr(user, field, value)
                else:
                    setattr(user, field, value)

            user.save()
            return success_response("User updated successfully", {"user": user_schema.dump(user)})

        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    @jwt_required()
    def delete(self, user_id):
        """Delete user (managers only, same school)"""
        try:
            current_user_claims = get_jwt()
            if current_user_claims.get("role") != "manager":
                return error_response("Only managers can delete users", status_code=403)

            user = User.query.get(user_id)
            if not user:
                return error_response("User not found", status_code=404)

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
        """List users with filters + pagination"""
        try:
            query_params = user_query_schema.load(request.args)
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()

            if not current_user:
                return error_response("User not found", status_code=404)

            query = User.query

            if current_user_claims.get("role") != "manager":
                if current_user.school_id:
                    query = query.filter(User.school_id == current_user.school_id)
                else:
                    return success_response(
                        "Users retrieved successfully",
                        {
                            "users": [],
                            "pagination": {
                                "page": 1,
                                "pages": 1,
                                "per_page": query_params["per_page"],
                                "total": 0,
                                "has_next": False,
                                "has_prev": False,
                            },
                        },
                    )

            if query_params.get("role"):
                query = query.filter(User.role == query_params["role"])

            if query_params.get("school_id"):
                query = query.filter(User.school_id == query_params["school_id"])

            if query_params.get("search"):
                search_term = f"%{query_params['search']}%"
                query = query.filter(User.name.ilike(search_term) | User.email.ilike(search_term))

            users = query.paginate(
                page=query_params["page"], per_page=query_params["per_page"], error_out=False
            )

            return success_response(
                "Users retrieved successfully",
                {
                    "users": users_schema.dump(users.items),
                    "pagination": {
                        "page": users.page,
                        "pages": users.pages,
                        "per_page": users.per_page,
                        "total": users.total,
                        "has_next": users.has_next,
                        "has_prev": users.has_prev,
                    },
                },
            )

        except ValidationError as err:
            return error_response("Invalid query parameters", err.messages, status_code=400)
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class UsersBySchoolResource(Resource):
    @jwt_required()
    def get(self, school_id):
        """Get users by school (managers only, same school)"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()

            if current_user_claims.get("role") != "manager" or current_user.school_id != school_id:
                return error_response("Not authorized to view users from this school", status_code=403)

            school = School.query.get(school_id)
            if not school:
                return error_response("School not found", status_code=404)

            query = User.query.filter(User.school_id == school_id)

            role = request.args.get("role")
            if role and role in ROLES:
                query = query.filter(User.role == role)

            search = request.args.get("search")
            if search:
                search_term = f"%{search}%"
                query = query.filter(User.name.ilike(search_term) | User.email.ilike(search_term))

            page = int(request.args.get("page", 1))
            per_page = min(int(request.args.get("per_page", 20)), 100)

            users = query.paginate(page=page, per_page=per_page, error_out=False)

            return success_response(
                "School users retrieved successfully",
                {
                    "school": SchoolSchema().dump(school),
                    "users": users_schema.dump(users.items),
                    "pagination": {
                        "page": users.page,
                        "pages": users.pages,
                        "per_page": users.per_page,
                        "total": users.total,
                        "has_next": users.has_next,
                        "has_prev": users.has_prev,
                    },
                },
            )

        except ValueError:
            return error_response("Invalid pagination parameters", status_code=400)
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    @jwt_required()
    def post(self, school_id):
        """Add user to school (managers only, same school)"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()

            if current_user_claims.get("role") != "manager" or current_user.school_id != school_id:
                return error_response("Not authorized to add users to this school", status_code=403)

            school = School.query.get(school_id)
            if not school:
                return error_response("School not found", status_code=404)

            validated_data = user_create_schema.load(request.get_json() or {})

            new_user = User(
                name=validated_data["name"],
                email=validated_data["email"],
                role=validated_data["role"],
                school_id=school_id,
            )
            new_user.set_password(validated_data["password"])
            new_user.save()

            return success_response(
                "User added successfully", {"user": user_schema.dump(new_user)}, status_code=201
            )

        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class UserProfileResource(Resource):
    @jwt_required()
    def get(self):
        """Current user's profile"""
        try:
            current_user_public_id = get_jwt_identity()
            user = User.query.filter_by(public_id=current_user_public_id).first()

            if not user:
                return error_response("User not found", status_code=404)

            return success_response("Profile retrieved successfully", {"profile": user_schema.dump(user)})

        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)
    
    @jwt_required()
    def put(self):
        """Update current user's profile (self or manager can update)"""
        try:
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()
            current_user_claims = get_jwt()

            if not current_user:
                return error_response("User not found", status_code=404)

            # Validate input
            user_update_schema.context = {"user_id": current_user.id}
            validated_data = user_update_schema.load(request.get_json() or {})

            for field, value in validated_data.items():
                # Managers can change role/school_id, normal users cannot
                if field in ["role", "school_id"]:
                    if current_user_claims.get("role") == "manager":
                        setattr(current_user, field, value)
                else:
                    setattr(current_user, field, value)

            current_user.save()
            return success_response("Profile updated successfully", {"profile": user_schema.dump(current_user)})

        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    



class UserDashboardResource(Resource):
    @jwt_required()
    def get(self):
        """Dashboard per role"""
        try:
            current_user_public_id = get_jwt_identity()
            current_user_claims = get_jwt()
            user = User.query.filter_by(public_id=current_user_public_id).first()

            if not user:
                return error_response("User not found", status_code=404)

            role = current_user_claims.get("role")
            dashboard_data = {
                "user": user_schema.dump(user),
                "school": SchoolSchema().dump(user.school) if user.school else None,
            }

            if role == "manager":
                school_id = user.school_id
                dashboard_data["user_stats"] = {
                    f"{r}s": User.query.filter(User.school_id == school_id, User.role == r).count()
                    for r in ROLES
                }
                dashboard_data["total_courses"] = len(user.school.courses) if user.school else 0

                from datetime import datetime, timedelta

                week_ago = datetime.now() - timedelta(days=7)
                dashboard_data["recent_registrations"] = User.query.filter(
                    User.school_id == school_id, User.created_at >= week_ago
                ).count()

            elif role == "educator":
                try:
                    from schemas.course import CourseSchema

                    course_schema = CourseSchema(many=True)
                    dashboard_data["my_courses"] = course_schema.dump(user.courses)
                except ImportError:
                    dashboard_data["my_courses"] = [c.to_dict() for c in user.courses]

                dashboard_data["courses_count"] = len(user.courses)
                dashboard_data["total_students"] = sum(len(c.enrollments) for c in user.courses)

            elif role == "student":
                from app.schemas.enrollment import enrollments_schema
                from app.schemas.attendance import attendances_schema
                enrollments = user.enrollments or []
                attendance = user.attendance or []
                dashboard_data["my_enrollments"] = enrollments_schema.dump(enrollments)
                dashboard_data["enrolled_courses"] = len(enrollments)
                dashboard_data["recent_attendance"] = attendances_schema.dump(attendance[-5:])

            return success_response("Dashboard data retrieved successfully", {"dashboard": dashboard_data})

        except Exception as e:
            import traceback, sys
            print("Dashboard error:", str(e), file=sys.stderr)
            traceback.print_exc()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class UserPasswordChangeResource(Resource):
    @jwt_required()
    def put(self):
        """Change current user's password"""
        try:
            current_user_public_id = get_jwt_identity()
            user = User.query.filter_by(public_id=current_user_public_id).first()

            if not user:
                return error_response("User not found", status_code=404)

            validated_data = password_change_schema.load(request.get_json() or {})
            current_password = validated_data["current_password"]
            new_password = validated_data["new_password"]

            if not user.check_password(current_password):
                return error_response("Current password is incorrect", status_code=400)

            user.set_password(new_password)
            user.save()

            return success_response("Password updated successfully")

        except ValidationError as err:
            return error_response("Validation error", err.messages, status_code=400)
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


class UserPasswordResetResource(Resource):
    def post(self):
        """
        Reset password using a token (no login required)
        Payload:
        {
            "token": "<reset-token>",
            "new_password": "newStrongPassword123!"
        }
        """
        try:
            data = request.get_json() or {}
            token = data.get("token")
            new_password = data.get("new_password")

            if not token or not new_password:
                return error_response("Token and new password are required", status_code=400)

            # Look up token
            reset_entry = ResetPassword.query.filter_by(token=token).first()
            if not reset_entry:
                return error_response("Invalid or expired token", status_code=400)

            # Check expiration (e.g., 1 hour)
            if reset_entry.created_at + timedelta(hours=1) < datetime.utcnow():
                db.session.delete(reset_entry)
                db.session.commit()
                return error_response("Token has expired", status_code=400)

            # Get user
            user = User.query.get(reset_entry.user_id)
            if not user:
                return error_response("User not found", status_code=404)

            # Hash and update password
            user.set_password(new_password)
            user.save()

            # Invalidate the token
            db.session.delete(reset_entry)
            db.session.commit()

            return success_response("Password has been successfully reset")

        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)