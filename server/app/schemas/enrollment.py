from app.extensions import ma
from app.models.enrollment import Enrollment
from app.schemas.base import BaseSchema
from marshmallow import validates, ValidationError, fields

class EnrollmentSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Enrollment
        load_instance = True
        ordered = True

    # Auto fields from model
    id = ma.auto_field()
    user_id = ma.auto_field()
    course_id = ma.auto_field()
    created_at = ma.auto_field()
    updated_at = ma.auto_field()
    

    # Nested relationships (with circular reference protection)
    user = fields.Nested('UserSchema', only=('id', 'name', 'email'))
    course = fields.Nested('CourseSchema', only=('id', 'title', 'description'))

    # Custom validation
    @validates('course_id')
    def validate_unique_enrollment(self, value):
        existing = Enrollment.query.filter_by(
            user_id=self.context.get('user_id'),
            course_id=value
        ).first()
        if existing:
            raise ValidationError("User is already enrolled in this course.")

# Schema instances
enrollment_schema = EnrollmentSchema()
enrollments_schema = EnrollmentSchema(many=True)