# server/app/schemas/schools.py
from marshmallow import fields, validate
from app.schemas.base import BaseSchema

class SchoolSchema(BaseSchema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    address = fields.Str(required=False)
    phone = fields.Str(required=False)  # <-- Add this line
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    # ✅ include owner but exclude back-references to avoid recursion
    owner = fields.Nested("UserSchema", dump_only=True, exclude=["school", "owned_schools"])

    users = fields.Nested("UserSchema", many=True, dump_only=True, exclude=["school"])
    courses = fields.Nested("CourseSchema", many=True, dump_only=True, exclude=["school"])
