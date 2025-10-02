
from marshmallow import fields
from app.schemas.base import BaseSchema


class SchoolSchema(BaseSchema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    address = fields.Str(required=False)
    phone = fields.Str(required=False)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    owner = fields.Nested(
        "UserSchema",
        dump_only=True,
        exclude=["school", "owned_schools"]
    )

    # Users who belong to this school
    users = fields.Nested(
        "UserSchema",
        many=True,
        dump_only=True,
        exclude=["school", "owned_schools"]
    )

    # Courses offered in this school
    courses = fields.Nested(
        "CourseSchema",
        many=True,
        dump_only=True,
        exclude=["school"]
    )
