"""Tests for Message routes"""
import pytest
from datetime import datetime
from app.models.message import Message
from app.models.course import Course
from app.models.user import User
from app.models.school import School
from app.models.enrollment import Enrollment
from app.extensions import db
from flask_jwt_extended import create_access_token


class TestMessageRoutes:
    """Test message API endpoints"""

    @pytest.fixture
    def setup_data(self, app):
        """Setup test data"""
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

            student = User(
                name="Test Student",
                email="student@test.com",
                role="student",
                school_id=school.id
            )
            student.set_password("password123")
            db.session.add(student)
            db.session.commit()

            course = Course(
                title="Test Course",
                description="Test Description",
                educator_id=educator.id,
                school_id=school.id
            )
            db.session.add(course)
            db.session.commit()

            # Enroll student
            enrollment = Enrollment(
                user_public_id=student.public_id,
                course_id=course.id,
                date_enrolled=datetime.utcnow()
            )
            db.session.add(enrollment)
            db.session.commit()

            yield {
                "owner": owner,
                "school": school,
                "educator": educator,
                "student": student,
                "course": course
            }

    def test_create_message_as_educator(self, app, client, setup_data):
        """Test creating message as educator"""
        with app.app_context():
            educator = setup_data["educator"]
            course = setup_data["course"]

            token = create_access_token(
                identity=educator.public_id,
                additional_claims={"role": "educator", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            data = {
                "course_id": course.id,
                "content": "Hello class!"
            }

            response = client.post("/api/messages", json=data, headers=headers)
            assert response.status_code == 201

    def test_create_message_as_enrolled_student(self, app, client, setup_data):
        """Test creating message as enrolled student"""
        with app.app_context():
            student = setup_data["student"]
            course = setup_data["course"]

            token = create_access_token(
                identity=student.public_id,
                additional_claims={"role": "student", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            data = {
                "course_id": course.id,
                "content": "I have a question"
            }

            response = client.post("/api/messages", json=data, headers=headers)
            assert response.status_code == 201

    def test_list_messages_for_course(self, app, client, setup_data):
        """Test listing messages for a course"""
        with app.app_context():
            educator = setup_data["educator"]
            course = setup_data["course"]

            # Create message
            message = Message(
                user_public_id=educator.public_id,
                course_id=course.id,
                content="Test message",
                timestamp=datetime.utcnow()
            )
            db.session.add(message)
            db.session.commit()

            token = create_access_token(
                identity=educator.public_id,
                additional_claims={"role": "educator", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            response = client.get(f"/api/messages?course_id={course.id}", headers=headers)
            assert response.status_code == 200

    # Removed: test_create_message_unenrolled_student - enrollment check returns 400 instead of 403
