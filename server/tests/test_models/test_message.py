"""Tests for Message model"""
import pytest
from datetime import datetime
from app.models.message import Message
from app.models.course import Course
from app.models.user import User
from app.models.school import School
from app.extensions import db


class TestMessageModel:
    """Test Message model functionality"""

    def test_create_message(self, app):
        """Test creating a message"""
        with app.app_context():
            # Setup
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

            # Create message
            message = Message(
                user_public_id=educator.public_id,
                course_id=course.id,
                content="Hello class!",
                timestamp=datetime.utcnow()
            )
            db.session.add(message)
            db.session.commit()

            assert message.id is not None
            assert message.content == "Hello class!"
            assert message.user_public_id == educator.public_id
            assert message.course_id == course.id

    def test_message_user_relationship(self, app):
        """Test message-user relationship"""
        with app.app_context():
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

            assert message.user == educator
            assert message in educator.messages

    def test_message_course_relationship(self, app):
        """Test message-course relationship"""
        with app.app_context():
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

            assert message.course == course
            assert message in course.messages

    def test_message_reply(self, app):
        """Test message reply functionality"""
        with app.app_context():
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

            parent_message = Message(
                user_public_id=educator.public_id,
                course_id=course.id,
                content="Original message",
                timestamp=datetime.utcnow()
            )
            db.session.add(parent_message)
            db.session.commit()

            reply = Message(
                user_public_id=educator.public_id,
                course_id=course.id,
                parent_id=parent_message.id,
                content="Reply message",
                timestamp=datetime.utcnow()
            )
            db.session.add(reply)
            db.session.commit()

            assert reply.parent == parent_message
            assert reply in parent_message.replies
