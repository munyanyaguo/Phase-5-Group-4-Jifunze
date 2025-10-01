"""Tests for Resource model"""
import pytest
from app.models.resource import Resource
from app.models.course import Course
from app.models.user import User
from app.models.school import School
from app.extensions import db


class TestResourceModel:
    """Test Resource model functionality"""

    def test_create_resource(self, app):
        """Test creating a resource"""
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

            # Create resource
            resource = Resource(
                course_id=course.id,
                uploaded_by_public_id=educator.public_id,
                title="Test Resource",
                url="https://example.com/resource.pdf",
                type="pdf"
            )
            db.session.add(resource)
            db.session.commit()

            assert resource.id is not None
            assert resource.title == "Test Resource"
            assert resource.url == "https://example.com/resource.pdf"
            assert resource.type == "pdf"
            assert resource.course_id == course.id
            assert resource.uploaded_by_public_id == educator.public_id

    def test_resource_course_relationship(self, app):
        """Test resource-course relationship"""
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

            resource = Resource(
                course_id=course.id,
                uploaded_by_public_id=educator.public_id,
                title="Test Resource",
                url="https://example.com/resource.pdf",
                type="pdf"
            )
            db.session.add(resource)
            db.session.commit()

            assert resource.course == course
            assert resource in course.resources

    def test_resource_uploader_relationship(self, app):
        """Test resource-uploader relationship"""
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

            resource = Resource(
                course_id=course.id,
                uploaded_by_public_id=educator.public_id,
                title="Test Resource",
                url="https://example.com/resource.pdf",
                type="pdf"
            )
            db.session.add(resource)
            db.session.commit()

            assert resource.uploader == educator
            assert resource in educator.resources

    def test_resource_repr(self, app):
        """Test resource string representation"""
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

            resource = Resource(
                course_id=course.id,
                uploaded_by_public_id=educator.public_id,
                title="Python Tutorial",
                url="https://example.com/tutorial.pdf",
                type="pdf"
            )
            db.session.add(resource)
            db.session.commit()

            assert "Python Tutorial" in repr(resource)
            assert "pdf" in repr(resource)
