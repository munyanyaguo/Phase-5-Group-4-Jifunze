# app/schemas/message.py
from marshmallow import validate, fields
from app.extensions import ma
from app.models.message import Message
from app.models.user import User
from app.models.course import Course
from app.schemas.user import UserSchema
from app.schemas.course import CourseSchema


class MessageSchema(ma.SQLAlchemySchema):
    class Meta:
        model = Message
        load_instance = True

    id = ma.auto_field()
    user_id = ma.auto_field(required=True)
    course_id = ma.auto_field(required=True)
    parent_id = ma.auto_field(allow_none=True)
    content = ma.auto_field(required=True, validate=validate.Length(min=2))
    timestamp = ma.auto_field()

    # Nested minimal user & course details (for responses only)
    user = fields.Nested(
        lambda: UserSchema(only=("id", "name")),
        dump_only=True
    )
    course = fields.Nested(
        lambda: CourseSchema(only=("id", "title")),
        dump_only=True
    )


# Single & multiple
message_schema = MessageSchema()
messages_schema = MessageSchema(many=True)
