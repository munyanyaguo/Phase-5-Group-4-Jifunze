import pytest
from flask_jwt_extended import create_access_token
from app import create_app
from app.extensions import db
from app.models import Course, Resource, User, School


@pytest.fixture(scope="session")
def app():
    app = create_app("testing")
    return app


@pytest.fixture(scope="function")
def client(app):
    """Flask test client"""
    return app.test_client()


@pytest.fixture(scope="function", autouse=True)
def setup_database(app):
    """Recreate database before each test"""
    with app.app_context():
        db.create_all()
        yield
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope="function")
def sample_data(app):
    """Create sample data for tests"""
    with app.app_context():
        # Create a test school
        school = School(name="Test School", address="Test Address", owner_id=1)
        db.session.add(school)
        db.session.commit()

        # Create test users
        manager = User(
            name="Test Manager",
            email="manager@test.com",
            role="manager",
            school_id=school.id
        )
        manager.set_password("password123")
        db.session.add(manager)

        educator = User(
            name="Test Educator",
            email="educator@test.com",
            role="educator",
            school_id=school.id
        )
        educator.set_password("password123")
        db.session.add(educator)

        student = User(
            name="Test Student",
            email="student@test.com",
            role="student",
            school_id=school.id
        )
        student.set_password("password123")
        db.session.add(student)

        db.session.commit()
        yield


@pytest.fixture
def auth_headers(app, sample_data):
    """Factory to generate headers with different roles"""
    def _make_headers(role="educator", school_id=None, user_id=None):
        with app.app_context():
            # Use actual user IDs from sample data if not provided
            if user_id is None:
                if role == "manager":
                    user_id = 1  # Test Manager ID
                elif role == "educator":
                    user_id = 2  # Test Educator ID
                else:  # student
                    user_id = 3  # Test Student ID

            # Use actual school ID from sample data if not provided
            if school_id is None:
                from app.models import School
                school = School.query.first()
                school_id = school.id if school else 1

            token = create_access_token(
                identity=str(user_id),
                additional_claims={"role": role, "school_id": school_id}
            )
        return {"Authorization": f"Bearer {token}"}
    return _make_headers
