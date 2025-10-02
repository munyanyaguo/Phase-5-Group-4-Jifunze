"""Tests for Attendance routes"""
import pytest
from datetime import date
from app.models.attendance import Attendance
from app.models.course import Course
from app.models.user import User
from app.models.school import School
from app.extensions import db
from flask_jwt_extended import create_access_token


class TestAttendanceRoutes:
    """Test attendance API endpoints"""

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

            yield {
                "owner": owner,
                "school": school,
                "educator": educator,
                "student": student,
                "course": course
            }

    def test_create_attendance_as_educator(self, app, client, setup_data):
        """Test creating attendance as educator"""
        with app.app_context():
            educator = setup_data["educator"]
            student = setup_data["student"]
            course = setup_data["course"]

            token = create_access_token(
                identity=educator.public_id,
                additional_claims={"role": "educator", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            data = {
                "user_public_id": student.public_id,
                "course_id": course.id,
                "date": str(date.today()),
                "status": "present"
            }

            response = client.post("/api/attendance", json=data, headers=headers)
            assert response.status_code == 201

    def test_list_attendance(self, app, client, setup_data):
        """Test listing attendance records"""
        with app.app_context():
            educator = setup_data["educator"]
            student = setup_data["student"]
            course = setup_data["course"]

            # Create attendance
            attendance = Attendance(
                user_public_id=student.public_id,
                course_id=course.id,
                date=date.today(),
                status="present",
                verified_by_public_id=educator.public_id
            )
            db.session.add(attendance)
            db.session.commit()

            token = create_access_token(
                identity=educator.public_id,
                additional_claims={"role": "educator", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            response = client.get("/api/attendance", headers=headers)
            assert response.status_code == 200


    def test_delete_attendance(self, app, client, setup_data):
        """Test deleting attendance"""
        with app.app_context():
            educator = setup_data["educator"]
            student = setup_data["student"]
            course = setup_data["course"]

            # Create attendance
            attendance = Attendance(
                user_public_id=student.public_id,
                course_id=course.id,
                date=date.today(),
                status="present",
                verified_by_public_id=educator.public_id
            )
            db.session.add(attendance)
            db.session.commit()

            attendance_id = attendance.id

            token = create_access_token(
                identity=educator.public_id,
                additional_claims={"role": "educator", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            response = client.delete(f"/api/attendance/{attendance_id}", headers=headers)
            assert response.status_code == 200

    def test_create_attendance_unauthorized(self, app, client, setup_data):
        """Test creating attendance without proper role"""
        with app.app_context():
            student = setup_data["student"]
            course = setup_data["course"]

            token = create_access_token(
                identity=student.public_id,
                additional_claims={"role": "student", "school_id": setup_data["school"].id}
            )
            headers = {"Authorization": f"Bearer {token}"}

            data = {
                "user_public_id": student.public_id,
                "course_id": course.id,
                "date": str(date.today()),
                "status": "present"
            }

            response = client.post("/api/attendance", json=data, headers=headers)
            assert response.status_code == 403
