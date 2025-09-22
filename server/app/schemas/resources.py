from app.extensions import ma
from app.models import Resource

class ResourceSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Resource
        include_fk = True
        load_instance = True

    # Nested user (uploader) and course (title)
    uploader = ma.Nested("UserSchema", only=("id", "name"))
    course = ma.Nested("CourseSchema", only=("id", "title"))

# Single + many
resource_schema = ResourceSchema()
resources_schema = ResourceSchema(many=True)
