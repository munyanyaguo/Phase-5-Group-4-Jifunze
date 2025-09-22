from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError

from app.models.school import School
from app.models.user import User, ROLES
from app.models.base import db
from app.schemas.schools import SchoolSchema
from app.schemas.user import UserSchema
from app.utils.responses import success_response, error_response

# Initialize schemas
school_schema = SchoolSchema()
schools_schema = SchoolSchema(many=True)
user_schema = UserSchema()
users_schema = UserSchema(many=True)

class SchoolResource(Resource):
    @jwt_required()
    def get(self, school_id=None):
        """Get school by ID or current user's school"""
        try:
            if school_id:
                #Get specific school by ID
                school = School.query.get(school_id)
                if not school:
                    return error_response("School not found", status_code=404)
                
                # Check if user has access to this school
                current_user_public_id = get_jwt_identity()
                current_user = User.query.filter_by(public_id=current_user_public_id).first()
                current_user_claims = get_jwt()

                #Only managers can view any school, others can only view their own
                if (current_user_claims.get("role") != "manager" and
                    current_user.school_id != school_id):
                    return error_response("Not authorized to view this school", status_code=403)
                return success_response("School retrieved successfully", {"school": school_schema.dump(school)})
            else:
                current_user_public_id = get_jwt_identity()
                current_user = User.query.filter_by(public_id=current_user_public_id).first()

                if not current_user or not current_user.school:
                    return error_response("User school not found", status_code=404)
                return success_response("School retrieved successfully", {"school": school_schema.dump(current_user.school)})
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)
        
    @jwt_required()
    def put(self, school_id):
        """Update school details (managers only)"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()

            # Only managers can update school details
            if current_user_claims.get("role") != "manager":
                return error_response("Not authorized to update school", status_code=403)
            school = School.query.get(school_id)
            if not school:
                return error_response("School not found", status_code=404)
            
            # Managers can only update their own school
            if current_user.school_id != school_id:
                return error_response("Can only update your school", status_code=403)
            # Validate input data
            try:
                validated_data = school_schema.load(request.get_json() or {}, partial=True)
            except ValidationError as err:
                return error_response("Validation error", err.messages, status_code=400)
            # Update school fields
            for field, value in validated_data.items():
                if field not in ["id", "created_at", "updated_at", "users", "courses"]:
                    setattr(school,  field, value)
            school.save()
            return success_response("School updated successfully", {"school": school_schema.dump(school)})
        
        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)
        
class SchoolListResource(Resource):
    @jwt_required()
    def get(self):
        """Get list of schools (limited access)"""
        try:
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()

            # For now users can only see their own school
            if current_user and current_user.school:
                schools = [current_user.school]
                return success_response("Schools retrieved successfully", {
                    "schools": schools_schema.dump(schools),
                    "total": len(schools)
                })
            else:
                return success_response("Schools retrived successfully", {
                    "schools": [],
                    "total": 0
                })
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)
        
class SchoolStatsResource(Resource):
    @jwt_required()
    def get(self, school_id=None):
        """Get school statistics"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()

            # Determine which school to get stats for
            target_school_id = school_id or current_user.school_id

            # Check suthorization
            if (current_user_claims.get("role") != "manager" and
                current_user.school_id != target_school_id):
                return error_response("Not authorized to view school stats", status_code=403)
            school = School.query.get(target_school_id)
            if not school:
                return error_response("School not found", status_code=404)
            
            # Calculate stats
            stats = {}

            # User counts by role
            for role in ROLES:
                count = User.query.filter(User.school_id == target_school_id, User.role == role).count()
            stats[f"{role}s"] = count

            # Total users
            stats["total_users"] = User.query.filter(User.school_id == target_school_id).count()

            # Course count
            stats["total_courses"] = len(school.courses)

            # Recent registrations (last 30 days)
            from datetime import datetime, timedelta
            month_ago = datetime.now() - timedelta(days=30)
            recent_users = User.query.filter(
                User.school_id == target_school_id,
                User.created_at >= month_ago
            ).count()
            stats["recent_registrations"] = recent_users

            return success_response("School stats retrieved successfully", {
                "school": school_schema.dump(school),
                "stats": stats
            })
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

class SchoolUsersResource(Resource):
    @jwt_required()
    def get(self, school_id):
        """Get all users in a school with filtering"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()

            # Check authorization
            if (current_user_claims.get("role") != "manager" and
                current_user.school_id != school_id):
                return error_response("Not authorized to view school users", status_code=403)
            
            school = School.query.get(school_id)
            if not school:
                return error_response("School not found", status_code=404)
            
            # Build query
            query = User.query.filter(User.school_id == school_id)

            # Apply filters
            role = request.args.get("role")
            if role and role in ROLES:
                query = query.filter(User.role == role)

            search = request.args.get("search")
            if search:
                search_term = f"%{search}%"
                query = query.filter(
                    User.name.ilike(search_term) | User.email.ilike(search_term)
                )
            
            # Pagination
            try:
                page = int(request.args.get("page", 1))
                per_page = min(int(request.args.get("per_page", 20)), 100)
            except ValueError:
                return error_response("Invalid pagination parameters", status_code=400)
            
            users = query.paginate(page=page, per_page=per_page, error_out=False)
            return success_response("School users retrieved successfully", {
                "school": {"id": school.id, "name": school.name},
                "users": users_schema.dump(users.items),
                "pagination": {
                    "page": users.page,
                    "pages": users.pages,
                    "per_page": users.per_page,
                    "total": users.total,
                    "has_next": users.has_next,
                    "has_prev": users.has_prev
                }
            })
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

class SchoolCoursesResource(Resource):
    @jwt_required()
    def get(self, school_id):
        """Get all courses in a school"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()
            
            # Check authorization
            if (current_user_claims.get('role') != 'manager' and 
                current_user.school_id != school_id):
                return error_response("Not authorized to view school courses", status_code=403)
            
            school = School.query.get(school_id)
            if not school:
                return error_response("School not found", status_code=404)
            
            # Get courses with optional filtering
            query = school.courses
            
            # Filter by educator if specified
            educator_id = request.args.get('educator_id')
            if educator_id:
                try:
                    educator_id = int(educator_id)
                    query = [course for course in query if course.educator_id == educator_id]
                except ValueError:
                    return error_response("Invalid educator_id parameter", status_code=400)
            
            # Search functionality
            search = request.args.get('search')
            if search:
                search_term = search.lower()
                query = [course for course in query if 
                          search_term in course.title.lower() or 
                          (course.descrip<<<<<<< feature/authtion and search_term in course.description.lower())]
            
            # Use your existing CourseSchema
            try:
                from app.schemas.course import courses_schema
                courses_data = courses_schema.dump(query)
            except ImportError:
                # Fallback to manual serialization if import fails
                courses_data = []
                for course in query:
                    course_dict = {
                        'id': course.id,
                        'title': course.title,
                        'description': course.description,
                        'educator_id': course.educator_id,
                        'school_id': course.school_id,
                        'created_at': course.created_at.isoformat() if course.created_at else None,
                        'updated_at': course.updated_at.isoformat() if course.updated_at else None
                    }
                    courses_data.append(course_dict)
            
            return success_response("School courses retrieved successfully", {
                "school": {"id": school.id, "name": school.name},
                "courses": courses_data,
                "total": len(courses_data)
            })
            
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)
        
class SchoolDashboardResource(Resource):
    @jwt_required()
    def get(self, school_id=None):
        """Get dashboard data (managers only)"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()

            # Only managers can access school dashboard
            if current_user_claims.get("role") != "manager":
                return error_response("Only managers can access school dashboard", status_code=403)
            
            # Use provided school_id or current user's school
            target_school_id = school_id or current_user.school_id

            # Managers can only view their own school's dashboard
            if current_user.school_id != target_school_id:
                return error_response("Can only view your own school dashboard", status_code=403)
            
            school = School.query.get(target_school_id)
            if not school:
                return error_response("School not found", status_code=404)
            
            # Complie dashboard data
            dashboard_data = {
                "school": school_schema.dump(school),
                "stats": {},
                "recent_activity": {}
            }
            # User stats
            for role in ROLES:
                count = User.query.filter(User.school_id == target_school_id, User.role == role).count()
                dashboard_data["stats"][f"{role}s"] = count

            dashboard_data["stats"]["total_users"] = sum(dashboard_data["stats"].values)
            dashboard_data["stats"]["total_courses"] = len(school.courses)

            # Recent actiivity
            from datetime import datetime, timedelta
            week_ago = datetime.now() - timedelta(days=7)

            recent_users = User.query.filter(
                User.school_id == target_school_id,
                User.created_at >= week_ago
            ).count()
            dashboard_data["recent_activity"]["new_users_this_week"] = recent_users

            return success_response("School dashboard retrieved successfully", {"dashboard": dashboard_data})
        
        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)