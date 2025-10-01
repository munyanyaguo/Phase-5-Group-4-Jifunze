"""Tests for Resource schema"""
import pytest
from app.schemas.resources import ResourceSchema


class TestResourceSchema:
    """Test ResourceSchema validation"""

    def test_dump_resource(self, app):
        """Test serializing resource data"""
        with app.app_context():
            from app.models.resource import Resource
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

            resource = Resource(
                course_id=course.id,
                uploaded_by_public_id=educator.public_id,
                title="Test Resource",
                url="https://example.com/resource.pdf",
                type="pdf"
            )
            db.session.add(resource)
            db.session.commit()

            schema = ResourceSchema()
            result = schema.dump(resource)

            assert result["title"] == "Test Resource"
            assert result["url"] == "https://example.com/resource.pdf"
            assert result["type"] == "pdf"
