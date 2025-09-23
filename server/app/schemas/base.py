from marshmallow import Schema, fields
from app.extensions import ma

class BaseSchema(ma.SQLAlchemySchema):
    """Base schema with common fields"""
    id = fields.Integer(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)