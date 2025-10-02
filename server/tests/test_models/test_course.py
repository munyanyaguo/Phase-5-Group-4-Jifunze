"""Tests for Course model"""
import pytest
from app.models.course import Course
from app.models.user import User
from app.models.school import School
from app.extensions import db


class TestCourseModel:
    """Test Course model functionality"""

    def test_create_course(self, app):
        """Test creating a course"""
        with app.app_context():
            # Create school
            owner = User(name="Owner", email="owner@test.com", role="manager")
            owner.set_password("password123")
            db.session.add(owner)
            db.session.commit()

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

            # Create course
            course = Course(
                title="Test Course",
                description="Test Description",
                educator_id=educator.id,
                school_id=school.id
            )
            db.session.add(course)
            db.session.commit()

            assert course.id is not None
            assert course.title == "Test Course"
            assert course.description == "Test Description"
            assert course.educator_id == educator.id
            assert course.school_id == school.id

    def test_course_educator_relationship(self, app):
        """Test course-educator relationship"""
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

            assert course.educator == educator
            assert course in educator.courses

    def test_course_school_relationship(self, app):
        """Test course-school relationship"""
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

            assert course.school == school
            assert course in school.courses

    def test_course_repr(self, app):
        """Test course string representation"""
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
                title="Python Programming",
                description="Learn Python",
                educator_id=educator.id,
                school_id=school.id
            )
            db.session.add(course)
            db.session.commit()

            assert "Python Programming" in repr(course)

    def test_course_cascade_delete_enrollments(self, app):
        """Test that deleting a course cascades to enrollments"""
        with app.app_context():
            from app.models.enrollment import Enrollment
            from datetime import datetime

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

            enrollment_id = enrollment.id

            # Delete course
            db.session.delete(course)
            db.session.commit()

            # Check enrollment was deleted
            assert Enrollment.query.get(enrollment_id) is None
