from marshmallow import Schema, fields, validate, validates, ValidationError
from app.models.user import User, ROLES
from app.models.school import School
from app.schemas.base import BaseSchema
import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

class LoginSchema(Schema):
    """Schema for user login"""
    email = fields.Email(required=True)
    password = fields.String(required=True, load_only=True)

class RegisterSchema(Schema):
    """Schema for user registration"""
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    role = fields.String(required=True, validate=validate.OneOf(ROLES))
    school_id = fields.Integer(required=False)
    password = fields.String(required=True, load_only=True, validate=validate.Length(min=6))

    @validates("email")
    def check_email_format_and_uniqueness(self, value, **kwargs):
        if not EMAIL_REGEX.match(value):
            raise ValidationError("Invalid email format")
        
        # Check if email already exists
        existing_user = User.query.filter_by(email=value.lower()).first()
        if existing_user:
            raise ValidationError("Email already registered")
    
    @validates("school_id")
    def validate_school_exists(self, value, **kwargs):
        if value is not None:  # Only validate if school_id is provided
            if not School.query.get(value):
                raise ValidationError("School not found")

class ResetPasswordRequestSchema(Schema):
    """Schema for requesting password reset"""
    email = fields.Email(required=True)

class ResetPasswordConfirmSchema(Schema):
    """Schema for password reset confirmation"""
    token = fields.String(required=True)
    new_password = fields.String(required=True, validate=validate.Length(min=6))