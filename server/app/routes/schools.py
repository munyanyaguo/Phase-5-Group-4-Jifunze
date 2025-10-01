from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError
from datetime import datetime, timedelta

from app.models.school import School
from app.models.user import User, ROLES
from app.models.base import db
from app.models.course import Course
from app.models.attendance import Attendance

from app.schemas.schools import SchoolSchema
from app.schemas.user import UserSchema
from app.utils.responses import success_response, error_response

school_schema = SchoolSchema()
user_schema = UserSchema()

# Initialize schemas
school_schema = SchoolSchema()
schools_schema = SchoolSchema(many=True)
user_schema = UserSchema()
users_schema = UserSchema(many=True)

# -------------------- School Resource --------------------
class SchoolResource(Resource):
    @jwt_required()
    def get(self, school_id=None):
        """Get a school by ID or current user's school"""
        try:
            current_user_public_id = get_jwt_identity()
            current_user_claims = get_jwt()
            user = User.query.filter_by(public_id=current_user_public_id).first()
            if not user:
                return error_response("User not found", status_code=404)

            # Get school by ID
            if school_id:
                school = School.query.filter_by(id=school_id).first()
                if not school:
                    return error_response("School not found", status_code=404)

                # Managers: check ownership
                if current_user_claims.get("role") == "manager" and school.owner_id != user.id:
                    return error_response("Can only view your own school", status_code=403)

                # Normal users: can only view their assigned school
                if current_user_claims.get("role") != "manager" and user.school_id != school.id:
                    return error_response("Not authorized to view this school", status_code=403)

                return success_response("School retrieved successfully", {"school": school_schema.dump(school)})

            # If no school_id, return user's school (for normal users) or all owned schools (for managers)
            if current_user_claims.get("role") == "manager":
                schools = School.query.filter_by(owner_id=user.id).all()
            else:
                if not user.school:
                    return error_response("No school found for user", status_code=404)
                schools = [user.school]

            return success_response(
                "Schools retrieved successfully",
                {"schools": schools_schema.dump(schools), "total": len(schools)}
            )

        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    @jwt_required()
    def put(self, school_id):
        """Update a school (managers only)"""
        try:
            current_user_public_id = get_jwt_identity()
            current_user_claims = get_jwt()
            user = User.query.filter_by(public_id=current_user_public_id).first()
            if not user:
                return error_response("User not found", status_code=404)

            if current_user_claims.get("role") != "manager":
                return error_response("Only managers can update schools", status_code=403)

            school = School.query.filter_by(id=school_id, owner_id=user.id).first()
            if not school:
                return error_response("School not found or you do not have permission", status_code=404)

            # Validate input data
            try:
                validated_data = school_schema.load(request.get_json() or {}, partial=True)
            except ValidationError as err:
                return error_response("Validation error", err.messages, status_code=400)

            # Update allowed fields
            for field, value in validated_data.items():
                if field not in ["id", "created_at", "updated_at", "users", "courses"]:
                    setattr(school, field, value)

            db.session.commit()
            return success_response("School updated successfully", {"school": school_schema.dump(school)})

        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    @jwt_required()
    def delete(self, school_id):
        """Delete a school (managers only)"""
        try:
            current_user_public_id = get_jwt_identity()
            current_user_claims = get_jwt()
            user = User.query.filter_by(public_id=current_user_public_id).first()
            if not user:
                return error_response("User not found", status_code=404)

            if current_user_claims.get("role") != "manager":
                return error_response("Only managers can delete schools", status_code=403)

            school = School.query.filter_by(id=school_id, owner_id=user.id).first()
            if not school:
                return error_response("School not found or you do not have permission", status_code=404)

            db.session.delete(school)
            db.session.commit()
            return success_response("School deleted successfully")

        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)


# -------------------- School List Resource --------------------
class SchoolListResource(Resource):
    @jwt_required()
    def get(self):
        """Get list of schools (managers: all owned, users: their school)"""
        try:
            current_user_public_id = get_jwt_identity()
            current_user_claims = get_jwt()
            user = User.query.filter_by(public_id=current_user_public_id).first()
            if not user:
                return error_response("User not found", status_code=404)

            if current_user_claims.get("role") == "manager":
                schools = School.query.filter_by(owner_id=user.id).all()
            else:
                schools = [user.school] if user.school else []

            return success_response("Schools retrieved successfully", {
                "schools": schools_schema.dump(schools),
                "total": len(schools)
            })

        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

    @jwt_required()
    def post(self):
        """Create a new school (managers only)"""
        try:
            current_user_public_id = get_jwt_identity()
            current_user_claims = get_jwt()
            user = User.query.filter_by(public_id=current_user_public_id).first()
            if not user:
                return error_response("User not found", status_code=404)

            if current_user_claims.get("role") != "manager":
                return error_response("Only managers can create schools", status_code=403)

            request_data = request.get_json()
            if not request_data:
                return error_response("No data provided", status_code=400)

            try:
                validated_data = school_schema.load(request_data)
            except ValidationError as err:
                return error_response("Validation error", err.messages, status_code=400)

            # Create school with manager as owner
            school = School(
                name=validated_data['name'],
                address=validated_data.get('address'),
                phone=validated_data.get('phone'),
                owner_id=user.id
            )
            db.session.add(school)
            db.session.commit()
            return success_response("School created successfully", {"school": school_schema.dump(school)}, status_code=201)

        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)
        
class SchoolStatsResource(Resource):
    @jwt_required()
    def get(self, school_id=None):
        """Get school statistics (attendance + course-based performance)"""
        try:
            current_user_claims = get_jwt()
            current_user_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_public_id).first()

            # Determine which school to get stats for
            target_school_id = school_id or current_user.school_id

            # Authorization: managers can only view their own schools
            if (current_user_claims.get("role") != "manager" and
                current_user.school_id != target_school_id):
                return error_response("Not authorized to view school stats", status_code=403)

            school = School.query.get(target_school_id)
            if not school:
                return error_response("School not found", status_code=404)

            # --- Attendance Summary ---
            # Attendance has no direct school_id; compute via Course.school_id
            total_sessions = (
                db.session.query(Attendance)
                .join(Course, Attendance.course_id == Course.id)
                .filter(Course.school_id == target_school_id)
                .count()
            )
            present_sessions = (
                db.session.query(Attendance)
                .join(Course, Attendance.course_id == Course.id)
                .filter(Course.school_id == target_school_id, Attendance.status == "present")
                .count()
            )
            attendance_rate = round((present_sessions / total_sessions) * 100, 2) if total_sessions > 0 else 0

            # --- Course Performance ---
            performance_data = []
            for course in school.courses:
                total_course_attendance = Attendance.query.filter_by(course_id=course.id).count()
                present_course_attendance = Attendance.query.filter_by(course_id=course.id, status="present").count()

                avg_attendance = round(
                    (present_course_attendance / total_course_attendance) * 100, 2
                ) if total_course_attendance > 0 else 0

                performance_data.append({
                    "course": course.title,
                    "avg_attendance": avg_attendance
                })

            return success_response("School stats retrieved successfully", {
                "school": school_schema.dump(school),
                "attendance": attendance_rate,
                "courses": performance_data
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
                          (course.description and search_term in course.description.lower())]
            
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
            claims = get_jwt()
            current_public_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_public_id).first()

            # Only managers can access school dashboard
            if claims.get("role") != "manager":
                return error_response("Only managers can access school dashboard", status_code=403)

            # If a specific school_id is provided, return that one
            if school_id:
                schools = School.query.filter_by(id=school_id, owner_id=current_user.id).all()
            else:
                # Otherwise, return all schools owned by this manager
                schools = School.query.filter_by(owner_id=current_user.id).all()

            if not schools:
                return error_response("No schools found for this manager", status_code=404)

            dashboard_data = {
                "total_schools": len(schools),
                "stats": {"students": 0, "educators": 0, "managers": 0, "total_users": 0, "total_courses": 0},
                "recent_activity": {"new_users_this_week": 0},
                "schools": []
            }

            week_ago = datetime.utcnow() - timedelta(days=7)

            for school in schools:
                school_stats = {
                    "id": school.id,
                    "name": school.name,
                    "students": User.query.filter_by(school_id=school.id, role="student").count(),
                    "educators": User.query.filter_by(school_id=school.id, role="educator").count(),
                    "managers": User.query.filter_by(school_id=school.id, role="manager").count(),
                    "total_courses": Course.query.filter_by(school_id=school.id).count(),
                    "new_users_this_week": User.query.filter(
                        User.school_id == school.id,
                        User.created_at >= week_ago
                    ).count()
                }

                # Add to aggregated totals
                dashboard_data["stats"]["students"] += school_stats["students"]
                dashboard_data["stats"]["educators"] += school_stats["educators"]
                dashboard_data["stats"]["managers"] += school_stats["managers"]
                dashboard_data["stats"]["total_courses"] += school_stats["total_courses"]
                dashboard_data["recent_activity"]["new_users_this_week"] += school_stats["new_users_this_week"]

                dashboard_data["schools"].append(school_stats)

            dashboard_data["stats"]["total_users"] = (
                dashboard_data["stats"]["students"] +
                dashboard_data["stats"]["educators"] +
                dashboard_data["stats"]["managers"]
            )

            return success_response("Dashboard retrieved successfully", {"dashboard": dashboard_data})

        except Exception as e:
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

class SchoolAssignmentResource(Resource):
    @jwt_required()
    def post(self, school_id, role):
        """Assign an educator or student to a school"""
        current_user_claims = get_jwt()
        current_user_id = get_jwt_identity()

        # Only manager
        if current_user_claims.get("role") != "manager":
            return error_response("Not authorized", 403)

        school = School.query.filter_by(id=school_id, owner_id=current_user_id).first()
        if not school:
            return error_response("School not found or not owned by you", 404)

        data = request.get_json()
        email = data.get("email")
        if not email:
            return error_response("Email required", 400)

        user = User.query.filter_by(email=email.lower()).first()
        if not user:
            return error_response("User not found", 404)

        if role == "educator":
            if user.role != "educator":
                return error_response("User is not an educator", 400)
            # Add school_id if not already associated
            if school not in user.schools:
                user.schools.append(school)
        elif role == "student":
            if user.role != "student":
                return error_response("User is not a student", 400)
            if user.school_id and user.school_id != school.id:
                return error_response("Student already assigned to a school", 400)
            user.school_id = school.id
        else:
            return error_response("Invalid role", 400)

        db.session.commit()
        return success_response(f"{role.capitalize()} assigned successfully", {"school": school_schema.dump(school)})  
    
class SchoolAssignUserResource(Resource):
    @jwt_required()
    def post(self, school_id, role):
        try:
            if role not in ["student", "educator"]:
                return error_response("Role must be 'student' or 'educator'", status_code=400)

            current_user_claims = get_jwt()
            current_user_id = get_jwt_identity()
            current_user = User.query.filter_by(public_id=current_user_id).first()

            # Only managers can assign users
            if current_user_claims.get("role") != "manager":
                return error_response("Only managers can assign users", status_code=403)

            # Manager can only assign to their own school
            school = School.query.get(school_id)
            if not school or school.owner_id != current_user.id:
                return error_response("You can only assign users to your own school", status_code=403)

            # Get email from request
            data = request.get_json()
            email = data.get("email")
            if not email:
                return error_response("Email is required", status_code=400)

            # Find user by email
            user = User.query.filter_by(email=email.lower()).first()
            if not user:
                return error_response("User not found", status_code=404)

            # Assign user to this school
            if role == "student" and user.role != "student":
                return error_response("Cannot assign non-student as student", status_code=400)
            if role == "educator" and user.role != "educator":
                return error_response("Cannot assign non-educator as educator", status_code=400)

            user.school_id = school.id
            db.session.commit()

            return success_response(f"{role.capitalize()} assigned to school successfully", {"user": user_schema.dump(user)})

        except Exception as e:
            db.session.rollback()
            return error_response("Something went wrong", {"error": str(e)}, status_code=500)

class EducatorsByManagerResource(Resource):
    @jwt_required()
    def get(self):
        current_user_public_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_public_id).first()
        if not user or user.role != "manager":
            return error_response("Only managers can view their educators", status_code=403)

        # Get all schools owned by this manager
        schools = School.query.filter_by(owner_id=user.id).all()
        educators = []

        for school in schools:
            for u in school.users:  # assuming School has a 'users' backref
                if u.role == "educator":
                    educators.append({
                        "id": u.id,
                        "name": u.name,
                        "email": u.email,
                        "school": school.name,
                        "courses": [c.title for c in u.courses]  # assuming educator has courses
                    })

        return success_response("Educators retrieved successfully", {"educators": educators})
    
class ManagerStudentsResource(Resource):
    @jwt_required()
    def get(self):
        current_user_public_id = get_jwt_identity()
        user = User.query.filter_by(public_id=current_user_public_id).first()
        if not user or user.role != "manager":
            return error_response("Only managers can view their students", status_code=403)

        # Get all schools owned by this manager
        schools = School.query.filter_by(owner_id=user.id).all()
        students = []

        for school in schools:
            for u in school.users:  # assuming School has a 'users' backref
                if u.role == "student":
                    students.append({
                        "id": u.id,
                        "public_id": u.public_id,
                        "name": u.name,
                        "email": u.email,
                        "school": school.name,
                        "school_id": school.id,
                        "courses": [c.title for c in u.courses]  # if students have courses
                    })

        return success_response("Students retrieved successfully", {"students": students})
    
class UserListResource(Resource):
    @jwt_required()
    def get(self):
        """List users (with optional role filter)"""
        role = request.args.get("role")
        query = User.query
        if role and role in ROLES:
            query = query.filter_by(role=role)

        users = query.all()
        return success_response("Users retrieved successfully", {"users": users_schema.dump(users)})

    @jwt_required()
    def post(self):
        """Create new user (e.g. student)"""
        data = request.get_json()
        if not data:
            return error_response("No data provided", 400)

        try:
            user = user_schema.load(data)
        except Exception as e:
            return error_response("Validation error", str(e), 400)

        db.session.add(user)
        db.session.commit()
        return success_response("User created successfully", {"user": user_schema.dump(user)}, 201)


class UserResource(Resource):
    @jwt_required()
    def get(self, user_id):
        user = User.query.get_or_404(user_id)
        return success_response("User retrieved successfully", {"user": user_schema.dump(user)})

    @jwt_required()
    def put(self, user_id):
        user = User.query.get_or_404(user_id)
        data = request.get_json() or {}
        for field, value in data.items():
            if hasattr(user, field) and field not in ["id", "public_id"]:
                setattr(user, field, value)
        db.session.commit()
        return success_response("User updated successfully", {"user": user_schema.dump(user)})

    @jwt_required()
    def delete(self, user_id):
        user = User.query.get_or_404(user_id)
        db.session.delete(user)
        db.session.commit()
        return success_response("User deleted successfully")
    

class ManagerUsersResource(Resource):
    @jwt_required()
    def get(self):
        """Get all users under manager’s schools"""
        current_public_id = get_jwt_identity()
        manager = User.query.filter_by(public_id=current_public_id).first()
        if not manager or manager.role != "manager":
            return error_response("Only managers can view this", 403)

        schools = School.query.filter_by(owner_id=manager.id).all()
        user_list = []
        for school in schools:
            user_list.extend(school.users)

        return success_response("Users retrieved successfully", {"users": users_schema.dump(user_list)})    