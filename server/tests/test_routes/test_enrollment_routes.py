"""Tests for Enrollment routes"""
import pytest
from datetime import datetime
from app.models.enrollment import Enrollment
from app.models.course import Course
from app.models.user import User
from app.models.school import School
from app.extensions import db
from flask_jwt_extended import create_access_token


class TestEnrollmentRoutes:
    """Test enrollment API endpoints"""

    @pytest.fixture
    def setup_data(self, app):
        """Setup test data"""
        with app.app_context():
            # Create owner
            owner = User(name="Owner", email="owner@test.com", role="manager")
            owner.set_password("password123")
            db.session.add(owner)
            db.session.commit()

            # Create school
            school = School(name="Test School", address="Test Address", owner_id=owner.id)
            db.session.add(school)
            db.session.commit()

            # Create educator
            educator = User(
                name="Test Educator",
                email="educator@test.com",
                role="educator",
                school_id=school.id
            )
            educator.set_password("password123")
            db.session.add(educator)
            db.session.commit()

            # Create student
            student = User(
                name="Test Student",
                email="student@test.com",
                role="student",
                school_id=school.id
            )
            student.set_password("password123")
            db.session.add(student)
            db.session.commit()

            # Create course
            course = Course(
                title="Test Course",
                description="Test Description",
                educator_id=educator.id,
                school_id=school.id
            )
            db.session.add(course)
            db.session.commit()

            yield {
                "owner": owner,
                "school": school,
                "educator": educator,
                "student": student,
                "course": course
            }

    def test_create_enrollment_as_manager(self, app, client, setup_data):
        """Test creating enrollment as manager"""
        with app.app_context():
            manager = setup_data["owner"]
            student = setup_data["student"]
            course = setup_data["course"]

            token = create_access_token(
                identity=manager.public_id,
                additional_claims={"role": "manager", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            data = {
                "user_public_id": student.public_id,
                "course_id": course.id
            }

            response = client.post("/api/enrollments", json=data, headers=headers)
            assert response.status_code == 201
            assert response.json["user_public_id"] == student.public_id

    def test_create_enrollment_duplicate(self, app, client, setup_data):
        """Test creating duplicate enrollment"""
        with app.app_context():
            manager = setup_data["owner"]
            student = setup_data["student"]
            course = setup_data["course"]

            # Create first enrollment
            enrollment = Enrollment(
                user_public_id=student.public_id,
                course_id=course.id,
                date_enrolled=datetime.utcnow()
            )
            db.session.add(enrollment)
            db.session.commit()

            token = create_access_token(
                identity=manager.public_id,
                additional_claims={"role": "manager", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            data = {
                "user_public_id": student.public_id,
                "course_id": course.id
            }

            response = client.post("/api/enrollments", json=data, headers=headers)
            assert response.status_code == 400
            assert "already enrolled" in response.json["message"].lower()

    def test_list_enrollments_as_student(self, app, client, setup_data):
        """Test listing enrollments as student"""
        with app.app_context():
            student = setup_data["student"]
            course = setup_data["course"]

            # Create enrollment
            enrollment = Enrollment(
                user_public_id=student.public_id,
                course_id=course.id,
                date_enrolled=datetime.utcnow()
            )
            db.session.add(enrollment)
            db.session.commit()

            token = create_access_token(
                identity=student.public_id,
                additional_claims={"role": "student", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            response = client.get("/api/enrollments", headers=headers)
            assert response.status_code == 200

    def test_delete_enrollment_as_manager(self, app, client, setup_data):
        """Test deleting enrollment as manager"""
        with app.app_context():
            manager = setup_data["owner"]
            student = setup_data["student"]
            course = setup_data["course"]

            # Create enrollment
            enrollment = Enrollment(
                user_public_id=student.public_id,
                course_id=course.id,
                date_enrolled=datetime.utcnow()
            )
            db.session.add(enrollment)
            db.session.commit()

            enrollment_id = enrollment.id

            token = create_access_token(
                identity=manager.public_id,
                additional_claims={"role": "manager", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            response = client.delete(f"/api/enrollments/{enrollment_id}", headers=headers)
            assert response.status_code == 200

   