from app.extensions import ma
from app.models.attendance import Attendance
from app.schemas.base import BaseSchema
from marshmallow import validate

class AttendanceSchema(BaseSchema):
    class Meta:
        model = Attendance
        load_instance = True

    id = ma.auto_field()
    user_id = ma.auto_field()
    course_id = ma.auto_field()
    date = ma.auto_field()
    status = ma.auto_field(validate=validate.OneOf(["present", "absent", "late"]))
    verified_by = ma.auto_field()

attendance_schema = AttendanceSchema()
attendances_schema = AttendanceSchema(many=True)
