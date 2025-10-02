"""Tests for Attendance model"""
import pytest
from datetime import date
from app.models.attendance import Attendance
from app.models.course import Course
from app.models.user import User
from app.models.school import School
from app.extensions import db


class TestAttendanceModel:
    """Test Attendance model functionality"""

    def test_create_attendance(self, app):
        """Test creating an attendance record"""
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

            assert attendance.id is not None
            assert attendance.user_public_id == student.public_id
            assert attendance.course_id == course.id
            assert attendance.status == "present"
            assert attendance.verified_by_public_id == educator.public_id

    def test_attendance_user_relationship(self, app):
        """Test attendance-user relationship"""
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

            attendance = Attendance(
                user_public_id=student.public_id,
                course_id=course.id,
                date=date.today(),
                status="present",
                verified_by_public_id=educator.public_id
            )
            db.session.add(attendance)
            db.session.commit()

            assert attendance.user == student
            assert attendance in student.attendance

    def test_attendance_course_relationship(self, app):
        """Test attendance-course relationship"""
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

            attendance = Attendance(
                user_public_id=student.public_id,
                course_id=course.id,
                date=date.today(),
                status="present",
                verified_by_public_id=educator.public_id
            )
            db.session.add(attendance)
            db.session.commit()

            assert attendance.course == course
            assert attendance in course.attendance

    def test_attendance_statuses(self, app):
        """Test different attendance statuses"""
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

            for status in ["present", "absent", "late"]:
                attendance = Attendance(
                    user_public_id=student.public_id,
                    course_id=course.id,
                    date=date(2025, 1, 1 + ["present", "absent", "late"].index(status)),
                    status=status,
                    verified_by_public_id=educator.public_id
                )
                db.session.add(attendance)
                db.session.commit()
                
                assert attendance.status == status
