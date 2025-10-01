from marshmallow import validates_schema, ValidationError, fields
from app.extensions import ma
from app.models import Course, School, User

class CourseSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Course
        load_instance = True
        ordered = True

    id = ma.auto_field()
    title = ma.auto_field()
    description = ma.auto_field()
    educator_id = ma.auto_field()
    school_id = ma.auto_field()
    created_at = ma.auto_field()
    updated_at = ma.auto_field()

    educator = fields.Nested('UserSchema', only=('id', 'name', 'email'), dump_only=True)
    school = fields.Nested('SchoolSchema', only=('id', 'name'), dump_only=True)
    resources = fields.Nested('ResourceSchema', many=True, exclude=('course',), dump_only=True)

    def __init__(self, *args, **kwargs):
        context = kwargs.pop("context", {})
        super().__init__(*args, **kwargs)
        self.context = context

    @validates_schema
    def validate_fields(self, data, **kwargs):
        # Use school_id from payload first, else context (JWT)
        school_id = data.get("school_id") or self.context.get("school_id")
        educator_id = data.get("educator_id")
        title = data.get("title")

        if not school_id:
            raise ValidationError("school_id is required.", field_name="school_id")
        if not School.query.get(school_id):
            raise ValidationError(f"School with id {school_id} does not exist.", field_name="school_id")

        if educator_id is None:
            raise ValidationError("educator_id is required.", field_name="educator_id")
        if not User.query.get(educator_id):
            raise ValidationError(f"Educator with id {educator_id} does not exist.", field_name="educator_id")

        # Unique title per school
        if title:
            existing = Course.query.filter_by(title=title, school_id=school_id).first()
            current_course = self.context.get("course")
            if existing and (not current_course or existing.id != getattr(current_course, "id", None)):
                raise ValidationError("Course title must be unique within this school.", field_name="title")

# ✅ Schema instances
course_schema = CourseSchema()
courses_schema = CourseSchema(many=True)
