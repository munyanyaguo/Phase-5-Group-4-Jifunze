"""Tests for School schema"""
import pytest
from app.schemas.schools import SchoolSchema
from app.models.school import School
from app.models.user import User
from app.extensions import db


class TestSchoolSchema:
    """Test SchoolSchema validation"""

    def test_dump_school(self, app):
        """Test serializing school data"""
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

            schema = SchoolSchema()
            result = schema.dump(school)

            assert result["name"] == "Test School"
            assert result["address"] == "123 Test St"
            assert result["phone"] == "1234567890"
