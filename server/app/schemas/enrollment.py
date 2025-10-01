# app/schemas/enrollment.py
from app.extensions import ma
from app.models.enrollment import Enrollment
from marshmallow import fields

class EnrollmentSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Enrollment
        load_instance = False
        ordered = True

    id = ma.auto_field()
    user_id = ma.auto_field()
    course_id = ma.auto_field()
    date_enrolled = ma.auto_field()
    created_at = ma.auto_field()
    updated_at = ma.auto_field()

    # expose nested minimal user + course info
    user = fields.Nested("UserSchema", only=("public_id", "name", "email"), dump_only=True)
    course = fields.Nested("CourseSchema", only=("id", "title", "description"), dump_only=True)

enrollment_schema = EnrollmentSchema()
enrollments_schema = EnrollmentSchema(many=True)
