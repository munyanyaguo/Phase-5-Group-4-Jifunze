# server/app/resources/schools.py
from flask import request
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from marshmallow import ValidationError

from app.models.school import School
from app.models.user import User, ROLES
from app.models.base import db
from app.schemas.schools import SchoolSchema
from app.utils.responses import success_response, error_response

school_schema = SchoolSchema()
schools_schema = SchoolSchema(many=True)


def get_current_user():
    """Return the current user object or None (uses public_id stored in JWT)."""
    public_id = get_jwt_identity()
    if not public_id:
        return None
    return User.query.filter_by(public_id=public_id).first()


class SchoolResource(Resource):
    @jwt_required()
    def get(self, school_id):
        current_user_id = get_jwt_identity()
        school = School.query.get_or_404(school_id)

        if school.owner_id != current_user_id:
            return {"success": False, "message": "Not authorized to view this school"}, 403

        return {"success": True, "data": school_schema.dump(school)}

    @jwt_required()
    def put(self, school_id):
        current_user_id = get_jwt_identity()
        school = School.query.get_or_404(school_id)

        if school.owner_id != current_user_id:
            return {"success": False, "message": "Not authorized to update this school"}, 403

        data = reqparse.RequestParser()
        data.add_argument("name", type=str)
        data.add_argument("address", type=str)
        args = data.parse_args()

        if args["name"]:
            school.name = args["name"]
        if args["address"]:
            school.address = args["address"]

        db.session.commit()
        return {"success": True, "message": "School updated successfully", "data": school_schema.dump(school)}

    @jwt_required()
    def delete(self, school_id):
        current_user_id = get_jwt_identity()
        school = School.query.get_or_404(school_id)

        if school.owner_id != current_user_id:
            return {"success": False, "message": "Not authorized to delete this school"}, 403

        db.session.delete(school)
        db.session.commit()
        return {"success": True, "message": "School deleted successfully"}


class SchoolListResource(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user.role == "manager":
            schools = School.query.filter_by(owner_id=user.id).all()
        else:
            # maybe allow admins to see all
            schools = School.query.all()

        return {"success": True, "data": {"schools": schools_schema.dump(schools)}}, 200

    @jwt_required()
    def post(self):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        if user.role != "manager":
            return {"success": False, "message": "Only managers can create schools"}, 403

        data = reqparse.RequestParser()
        data.add_argument("name", type=str, required=True, help="School name is required")
        data.add_argument("address", type=str, required=False)
        args = data.parse_args()

        new_school = School(
            name=args["name"],
            address=args["address"],
            owner_id=user.id
        )
        db.session.add(new_school)
        db.session.commit()

        return {"success": True, "message": "School created successfully", "data": school_schema.dump(new_school)}, 201# ---------------------------
# STUB: School Stats
# ---------------------------
class SchoolStatsResource(Resource):
    @jwt_required()
    def get(self, school_id=None):
        return {"message": "School stats endpoint not implemented yet"}, 200


# ---------------------------
# STUB: School Users
# ---------------------------
class SchoolUsersResource(Resource):
    @jwt_required()
    def get(self, school_id):
        return {"message": f"School users endpoint not implemented yet for school {school_id}"}, 200


# ---------------------------
# STUB: School Courses
# ---------------------------
class SchoolCoursesResource(Resource):
    @jwt_required()
    def get(self, school_id):
        return {"message": f"School courses endpoint not implemented yet for school {school_id}"}, 200


# ---------------------------
# STUB: School Dashboard
# ---------------------------
class SchoolDashboardResource(Resource):
    @jwt_required()
    def get(self, school_id=None):
        return {"message": "School dashboard endpoint not implemented yet"}, 200