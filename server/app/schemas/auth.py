from marshmallow import Schema, fields, validate, validates, ValidationError
from app.models.user import User, ROLES
from app.models.school import School
import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


class LoginSchema(Schema):
    """Schema for user login"""
    email = fields.Email(required=True, validate=validate.Length(max=120))
    password = fields.String(
        required=True, 
        load_only=True, 
        validate=validate.Length(min=6, max=128)
    )


class RegisterSchema(Schema):
    """Schema for user registration"""
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True, validate=validate.Length(max=120))
    role = fields.String(required=True, validate=validate.OneOf(ROLES))
    school_id = fields.Integer(required=False)
    password = fields.String(
        required=True, 
        load_only=True, 
        validate=validate.Length(min=6, max=128)
    )

    @validates("email")
    def check_email_format_and_uniqueness(self, value, **kwargs):
        if not EMAIL_REGEX.match(value):
            raise ValidationError("Invalid email format")
        
        # Normalize to lowercase
        value = value.lower()

        # Check uniqueness
        existing_user = User.query.filter_by(email=value).first()
        if existing_user:
            raise ValidationError("Email already registered")

    @validates("school_id")
    def validate_school_exists(self, value, **kwargs):
        if value is not None and not School.query.get(value):
            raise ValidationError("School not found")


class ResetPasswordRequestSchema(Schema):
    """Schema for requesting password reset"""
    email = fields.Email(required=True, validate=validate.Length(max=120))


class ResetPasswordConfirmSchema(Schema):
    """Schema for password reset confirmation"""
    token = fields.String(required=True, validate=validate.Length(min=20))  # token safety
    new_password = fields.String(
        required=True, 
        validate=[
            validate.Length(min=6, max=128),
            validate.Regexp(
                r'^(?=.*[A-Z])(?=.*\d).+$',
                error="Password must contain at least one uppercase letter and one number"
            )
        ]
    )
