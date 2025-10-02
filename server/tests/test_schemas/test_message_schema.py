"""Tests for Message schema"""
import pytest
from app.schemas.message import MessageSchema


class TestMessageSchema:
    """Test MessageSchema validation"""

    def test_dump_message(self, app):
        """Test serializing message data"""
        with app.app_context():
            from datetime import datetime
            from app.models.message import Message
            from app.models.course import Course
            from app.models.user import User
            from app.models.school import School
            from app.extensions import db

            owner = User(name="Owner", email="owner@test.com", role="manager")
            owner.set_password("password123")
            db.session.add(owner)
            db.session.commit()

            school = School(name="Test School", address="Test Address", owner_id=owner.id)
            db.session.add(school)
            db.session.commit()

            educator = User(
                name="Test Educator",
                email="educator@test.com",
                role="educator",
                school_id=school.id
            )
            educator.set_password("password123")
            db.session.add(educator)
            db.session.commit()

            course = Course(
                title="Test Course",
                description="Test Description",
                educator_id=educator.id,
                school_id=school.id
            )
            db.session.add(course)
            db.session.commit()

            message = Message(
                user_public_id=educator.public_id,
                course_id=course.id,
                content="Hello class!",
                timestamp=datetime.utcnow()
            )
            db.session.add(message)
            db.session.commit()

            schema = MessageSchema()
            result = schema.dump(message)

            assert result["content"] == "Hello class!"
            assert result["user_public_id"] == educator.public_id
            assert result["course_id"] == course.id
