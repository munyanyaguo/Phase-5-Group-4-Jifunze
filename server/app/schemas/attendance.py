from app.extensions import ma
from app.models.attendance import Attendance
from app.schemas.base import BaseSchema
from app.schemas.course import CourseSchema
from marshmallow import validate, fields

class AttendanceSchema(BaseSchema):
    class Meta:
        model = Attendance
        load_instance = True

    id = ma.auto_field()
    user_public_id = ma.auto_field()
    course_id = ma.auto_field()
    date = ma.auto_field()
    status = ma.auto_field(validate=validate.OneOf(["present", "absent", "late"]))
    #verified_by_public_id = ma.auto_field()

    # Include nested course info
    course = fields.Nested(CourseSchema, dump_only=True)

attendance_schema = AttendanceSchema()
attendances_schema = AttendanceSchema(many=True)
