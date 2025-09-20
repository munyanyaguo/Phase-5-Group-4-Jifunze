from app.extensions import ma
from app.models import Course
from marshmallow import validates, ValidationError

class CourseSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Course
        load_instance = True   # Can load back into SQLAlchemy objects
        ordered = True         # Keeps JSON output consistent

    id = ma.auto_field()
    title = ma.auto_field()
    description = ma.auto_field()
    educator_id = ma.auto_field()
    school_id = ma.auto_field()
    created_at = ma.auto_field()
    updated_at = ma.auto_field()

# Single + multiple schemas
course_schema = CourseSchema()
courses_schema = CourseSchema(many=True)

@validates("title")
def validate_unique_title(self, value):
    if Course.query.filter_by(title=value).first():
        raise ValidationError("Course title must be unique per school.")
