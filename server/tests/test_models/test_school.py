"""Tests for School model"""
import pytest
from app.models.school import School
from app.models.user import User
from app.extensions import db


class TestSchoolModel:
    """Test School model functionality"""

    def test_create_school(self, app):
        """Test creating a school"""
        with app.app_context():
            owner = User(name="Owner", email="owner@test.com", role="manager")
            owner.set_password("password123")
            db.session.add(owner)
            db.session.commit()

            school = School(
                name="Test School",
                address="123 Test St",
                phone="1234567890",
                owner_id=owner.id
            )
            db.session.add(school)
            db.session.commit()

            assert school.id is not None
            assert school.name == "Test School"
            assert school.address == "123 Test St"
            assert school.phone == "1234567890"
            assert school.owner_id == owner.id

    def test_school_owner_relationship(self, app):
        """Test school-owner relationship"""
        with app.app_context():
            owner = User(name="Owner", email="owner@test.com", role="manager")
            owner.set_password("password123")
            db.session.add(owner)
            db.session.commit()

            school = School(
                name="Test School",
                address="123 Test St",
                owner_id=owner.id
            )
            db.session.add(school)
            db.session.commit()

            assert school.owner == owner
            assert school in owner.owned_schools

    def test_school_users_relationship(self, app):
        """Test school-users relationship"""
        with app.app_context():
            owner = User(name="Owner", email="owner@test.com", role="manager")
            owner.set_password("password123")
            db.session.add(owner)
            db.session.commit()

            school = School(
                name="Test School",
                address="123 Test St",
                owner_id=owner.id
            )
            db.session.add(school)
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

            assert student in school.users
            assert student.school == school

    def test_school_repr(self, app):
        """Test school string representation"""
        with app.app_context():
            owner = User(name="Owner", email="owner@test.com", role="manager")
            owner.set_password("password123")
            db.session.add(owner)
            db.session.commit()

            school = School(
                name="Springfield High",
                address="123 Test St",
                owner_id=owner.id
            )
            db.session.add(school)
            db.session.commit()

            assert "Springfield High" in repr(school)

    def test_school_optional_fields(self, app):
        """Test school with optional fields"""
        with app.app_context():
            owner = User(name="Owner", email="owner@test.com", role="manager")
            owner.set_password("password123")
            db.session.add(owner)
            db.session.commit()

            school = School(
                name="Test School",
                owner_id=owner.id
            )
            db.session.add(school)
            db.session.commit()

            assert school.address is None
            assert school.phone is None
