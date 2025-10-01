from app.extensions import ma
from app.models.attendance import Attendance
from app.schemas.base import BaseSchema
from app.schemas.course import CourseSchema
from marshmallow import validate, fields

class UserBasicSchema(ma.Schema):
    """Basic user schema for nested display"""
    public_id = fields.String()
    name = fields.String()
    email = fields.String()

class AttendanceSchema(BaseSchema):
    class Meta:
        model = Attendance
        load_instance = True

    id = ma.auto_field()
    user_public_id = ma.auto_field()
    course_id = ma.auto_field()
    date = ma.auto_field()
    status = ma.auto_field(validate=validate.OneOf(["present", "absent", "late"]))
    #verified_by = ma.auto_field()

    # Include nested course and user info
    course = fields.Nested(CourseSchema, dump_only=True)
    user = fields.Nested(UserBasicSchema, dump_only=True)

attendance_schema = AttendanceSchema()
attendances_schema = AttendanceSchema(many=True)
