import pytest
from datetime import datetime
from app.models.course import Course
from app.models.user import User
from app.models.school import School
from app.extensions import db

@pytest.fixture
def school(app):
    with app.app_context():
        school = School(
            name="Test School",
            address="123 School St",
            phone="1234567890"
        )
        db.session.add(school)
        db.session.commit()
        return school

@pytest.fixture
def educator(app, school):
    with app.app_context():
        educator = User(
            username="test_educator",
            email="educator@test.com",
            password="password123",
            role="educator",
            school_id=school.id
        )
        db.session.add(educator)
        db.session.commit()
        return educator

@pytest.fixture
def course(app, educator):
    with app.app_context():
        course = Course(
            title="Test Course",
            description="Test Description",
            educator_id=educator.id,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow()
        )
        db.session.add(course)
        db.session.commit()
        return course

def test_course_creation(course):
    """Test if course is created with correct attributes"""
    assert course.title == "Test Course"
    assert course.description == "Test Description"
    assert course.educator_id is not None
    assert isinstance(course.start_date, datetime)
    assert isinstance(course.end_date, datetime)

def test_course_educator_relationship(course, educator):
    """Test if course-educator relationship is established correctly"""
    assert course.educator == educator
    assert course in educator.courses

def test_course_update(app, course):
    """Test course attribute updates"""
    with app.app_context():
        course.title = "Updated Course"
        db.session.commit()
        updated_course = Course.query.get(course.id)
        assert updated_course.title == "Updated Course"

def test_course_deletion(app, course):
    """Test if course deletion works correctly"""
    with app.app_context():
        course_id = course.id
        db.session.delete(course)
        db.session.commit()
        deleted_course = Course.query.get(course_id)
        assert deleted_course is None

def test_course_creation_without_educator(app):
    """Test that course cannot be created without an educator"""
    with app.app_context():
        course = Course(
            title="Invalid Course",
            description="No Educator"
        )
        db.session.add(course)
        with pytest.raises(Exception):
            db.session.commit()
        db.session.rollback()