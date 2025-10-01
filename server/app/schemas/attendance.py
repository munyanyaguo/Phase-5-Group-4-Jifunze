from app.extensions import ma
from app.models.attendance import Attendance
from app.schemas.base import BaseSchema
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
    verified_by_public_id = ma.auto_field()
    
    # Include course details in the response
    course = fields.Nested('CourseSchema', only=['id', 'title', 'description'], dump_only=True)

attendance_schema = AttendanceSchema()
attendances_schema = AttendanceSchema(many=True)
