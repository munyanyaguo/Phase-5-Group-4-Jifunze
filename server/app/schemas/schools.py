# server/app/schemas/schools.py
from marshmallow import fields, validate
from app.schemas.base import BaseSchema

class SchoolSchema(BaseSchema):
    id = fields.Int(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    address = fields.String(allow_none=True, validate=validate.Length(max=255))
    owner_id = fields.Integer(dump_only=True)  # server assigns

    # ✅ include owner but exclude back-references to avoid recursion
    owner = fields.Nested("UserSchema", dump_only=True, exclude=["school", "owned_schools"])

    users = fields.Nested("UserSchema", many=True, dump_only=True, exclude=["school"])
    courses = fields.Nested("CourseSchema", many=True, dump_only=True, exclude=["school"])
