from app.extensions import ma
from app.models import Course, School
from marshmallow import validates, ValidationError, fields
#from app.schemas.enrollment import EnrollmentSchema
from app.schemas.base import BaseSchema

class CourseSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Course
        load_instance = True   # Can load back into SQLAlchemy objects
        ordered = True         # Keeps JSON output consistent

    # Auto fields from model
    id = ma.auto_field()
    title = ma.auto_field()
    description = ma.auto_field()
    educator_id = ma.auto_field()
    school_id = ma.auto_field()
    created_at = ma.auto_field()
    updated_at = ma.auto_field()

    # Nested relationships
    educator = fields.Nested('UserSchema', only=('id', 'name', 'email'), dump_only=True)
    school = fields.Nested('SchoolSchema', only=('id', 'name'), dump_only=True)
    #enrollments = fields.Nested('EnrollmentSchema', many=True, exclude=('course',))
    resources = fields.Nested('ResourceSchema', many=True, exclude=('course',), dump_only=True)
    #messages = fields.Nested('MessageSchema', many=True, exclude=('course',))

    # Custom validation
    @validates("title")
    def validate_unique_title(self, value):
        existing = Course.query.filter_by(title=value).first()
        if existing and (not self.context.get('course') or existing != self.context.get('course')):
            raise ValidationError("Course title must be unique per school.")

    # @validates("school_id")
    # def validate_school_exists(self, value):
    #     if not School.query.get(value):
    #         raise ValidationError("School not found.")

# Schema instances
course_schema = CourseSchema()
courses_schema = CourseSchema(many=True)
