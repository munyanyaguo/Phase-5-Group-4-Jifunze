from marshmallow import Schema, fields, validate

class BaseSchema(Schema):
    """Base schema with common fields"""
    id = fields.Integer(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class SchoolSchema(BaseSchema):
    """Schema for School model"""
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    address = fields.String(allow_none=True, validate=validate.Length(max=255))
    owner_id = fields.Integer(required=True)

    # Nested fields (using strings to avoid circular imports)
    users = fields.Nested("UserSchema", many=True, dump_only=True, exclude=["school"])
    courses = fields.Nested("CourseSchema", many=True, dump_only=True, exclude=["school"])