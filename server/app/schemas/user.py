from marshmallow import Schema, fields, validate, validates, ValidationError
from app.models.user import User, ROLES
from app.models.school import School
import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

class BaseSchema(Schema):
    """Base schema with common fields"""
    id = fields.Integer(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class UserSchema(BaseSchema):
    """Schema for User model"""
    public_id = fields.String(dump_only=True)
    name = fields.String(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True, validate=validate.Length(max=120))
    role = fields.String(required=True, validate=validate.OneOf(ROLES))
    school_id = fields.Integer(required=True)

    # Password fields
    password = fields.String(load_only=True, required=True, validate=validate.Length(min=6))
    password_hash = fields.String(dump_only=True)

    # Nested fields (using strings to avoid circular imports)
    school = fields.Nested('SchoolSchema', dump_only=True, exclude=["users"])
    courses = fields.Nested("CourseSchema", many=True, dump_only=True, exclude=["educator"])
    enrollments = fields.List(fields.Dict(), dump_only=True)

    @validates("email")
    def validate_email_format(self, value):
        if not EMAIL_REGEX.match(value):
            raise ValidationError("Invalid email format")
        
        # Check fi email already exists(for creation)
        if self.context.get("is_new_user", False):
            existing_user = User.query.filter_by(email=value.lower()).first()
            if existing_user:
                raise ValidationError("Email already registered")
            
    @validates("school_id")
    def validate_school_exists(self, value):
        if not School.query.get(value):
            raise ValidationError("School not found")

class UserCreateSchema(UserSchema):
    """Schema for creating users"""
    password = fields.String(load_only=True, required=True, validate=validate.Length(min=6))

    class Meta:
        exclude = ["password_hash"]

class UserUpdateSchema(Schema):
    """Schema for updating users"""
    name = fields.String(validate=validate.Length(min=2, max=100))
    email = fields.Email(validate=validate.Length(max=120))
    role = fields.String(validate=validate.OneOf(ROLES))
    school_id = fields.Integer()

    @validates("email")
    def validate_email_unique(self, value):
        if not EMAIL_REGEX.match(value):
            raise ValidationError("Invalid email format")
        
        # Check uniqueness excluding current user
        user_id = self.context.get("user_id")
        existing_user = User.query.filter(User.email == value.lower(), User.id != user_id).first()
        if existing_user:
            raise ValidationError("Email already taken")
    
    @validates("school_id")
    def validate_school_exists(self, value):
        if value and not School.query.get(value):
            raise ValidationError("School not found")
        
class PasswordChangeSchema(Schema):
    """Schema for changing password"""
    current_password = fields.String(load_only=True, required=True)
    new_password = fields.String(load_only=True, required=True, validate=validate.Length(min=6))

class UserListResponseSchema(Schema):
    """Schema for user list response"""
    users = fields.Nested(UserSchema, many=True)
    pagination = fields.Dict()

class UserStatsSchema(Schema):
    """Schema for user statistics"""
    students = fields.Integer()
    educators = fields.Integer()
    managers = fields.Integer()
    total_users = fields.Integer()
    recent_registrations = fields.Integer(allow_none=True)

class UserQuerySchema(Schema):
    """Schema for user query parameters"""
    role = fields.String(validate=validate.OneOf(ROLES))
    school_id = fields.Integer()
    search = fields.String()
    page = fields.Integer(validate=validate.Range(min=1), load_default=1)
    per_page = fields.Integer(validate=validate.Range(min=1, max=100), load_default=20)