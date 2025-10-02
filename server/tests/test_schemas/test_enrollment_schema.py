"""Tests for Enrollment schema"""
import pytest
from app.schemas.enrollment import EnrollmentSchema


class TestEnrollmentSchema:
    """Test EnrollmentSchema validation"""

    def test_dump_enrollment(self, app):
        """Test serializing enrollment data"""
        with app.app_context():
            from datetime import datetime
            from app.models.enrollment import Enrollment
            from app.models.course import Course
            from app.models.user import User
            from app.models.school import School
            from app.extensions import db

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

            enrollment = Enrollment(
                user_public_id=student.public_id,
                course_id=course.id,
                date_enrolled=datetime.utcnow()
            )
            db.session.add(enrollment)
            db.session.commit()

            schema = EnrollmentSchema()
            result = schema.dump(enrollment)

            assert result["user_public_id"] == student.public_id
            assert result["course_id"] == course.id
            assert "date_enrolled" in result
