from marshmallow import validates, ValidationError, fields
from app.extensions import ma
from app.models.resource import Resource
from app.schemas.base import BaseSchema

class ResourceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Resource
        include_fk = True
        load_instance = True
        
    
    # Auto fields
    id = ma.auto_field()
    title = ma.auto_field()
    url = ma.auto_field()
    course_id = ma.auto_field()
    uploaded_by = ma.auto_field()
    created_at = ma.auto_field()
    updated_at = ma.auto_field()

    # Nested user (uploader) and course (title)
    uploader = ma.Nested("UserSchema", only=("id", "name"), dump_only=True)
    course = ma.Nested("CourseSchema", only=("id", "title"), dump_only=True)

    @validates('course_id')
    def validate_course_exists(self, value):
        from app.models import Course
        if not Course.query.get(value):
            raise ValidationError("Course not found")

# Single + many
resource_schema = ResourceSchema()
resources_schema = ResourceSchema(many=True)