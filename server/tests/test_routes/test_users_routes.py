import pytest
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from app.models.user import User
from app.models.school import School
from app.models.reset_password import ResetPassword
from app import db

@pytest.fixture
def manager_user(app, school):
    """Fixture to create a test manager user (to serve as school owner)"""
    with app.app_context():
        user = User(
            public_id=str(uuid4()),
            name="Test Manager",
            email="manager@example.com",
            role="manager",
            school_id=school.id  # Assign to the same school
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        yield user
        db.session.delete(user)
        db.session.commit()

@pytest.fixture
def school(app):
    """Fixture to create a test school with a temporary owner"""
    with app.app_context():
        # Create a temporary owner for the school
        temp_owner = User(
            public_id=str(uuid4()),
            name="Temp Owner",
            email="tempowner@example.com",
            role="manager"
        )
        temp_owner.set_password("password123")
        db.session.add(temp_owner)
        db.session.commit()
        
        school = School(
            name="Test School",
            owner_id=temp_owner.id
        )
        db.session.add(school)
        db.session.commit()
        yield school
        db.session.delete(school)
        db.session.delete(temp_owner)
        db.session.commit()

@pytest.fixture
def student_user(app, school):
    """Fixture to create a test student user"""
    with app.app_context():
        user = User(
            public_id=str(uuid4()),
            name="Test Student",
            email="student@example.com",
            role="student",
            school_id=school.id
        )
        user.set_password("password123")
        db.session.add(user)
        db.session.commit()
        yield user
        # Delete associated reset passwords first
        resets = ResetPassword.query.filter_by(user_id=user.id).all()
        for reset in resets:
            db.session.delete(reset)
        db.session.delete(user)
        db.session.commit()

@pytest.fixture
def auth_headers(app, client, student_user):
    """Fixture to provide valid JWT headers for authenticated requests"""
    with app.app_context():
        login_data = {
            "email": student_user.email,
            "password": "password123"
        }
        response = client.post("/api/auth/login", json=login_data)
        access_token = response.json["data"]["access_token"]
        return {"Authorization": f"Bearer {access_token}"}

@pytest.fixture
def manager_auth_headers(app, client, manager_user):
    """Fixture to provide valid JWT headers for manager user"""
    with app.app_context():
        login_data = {
            "email": manager_user.email,
            "password": "password123"
        }
        response = client.post("/api/auth/login", json=login_data)
        access_token = response.json["data"]["access_token"]
        return {"Authorization": f"Bearer {access_token}"}

class TestUserResource:
    """Test UserResource endpoints"""

    def test_get_user_by_id(self, app, client, student_user, auth_headers):
        """Test retrieving user by ID"""
        with app.app_context():
            response = client.get(f"/api/users/{student_user.id}", headers=auth_headers)
            assert response.status_code == 200
            assert response.json["success"] is True
            assert response.json["data"]["user"]["email"] == "student@example.com"

    def test_get_user_not_found(self, client, auth_headers):
        """Test retrieving non-existent user"""
        response = client.get("/api/users/9999", headers=auth_headers)
        assert response.status_code == 404
        assert response.json["success"] is False

    def test_update_user(self, app, client, student_user, auth_headers):
        """Test updating user information"""
        with app.app_context():
            data = {"name": "Updated Student"}
            response = client.put(f"/api/users/{student_user.id}", json=data, headers=auth_headers)
            assert response.status_code == 200
            assert response.json["success"] is True
            assert response.json["data"]["user"]["name"] == "Updated Student"


    def test_delete_user(self, app, client, student_user, manager_auth_headers):
        """Test deleting user by manager (same school)"""
        with app.app_context():
            response = client.delete(f"/api/users/{student_user.id}", headers=manager_auth_headers)
            assert response.status_code == 200
            assert response.json["success"] is True

class TestUserListResource:
    """Test UserListResource endpoints"""

    def test_list_users(self, app, client, manager_user, manager_auth_headers):
        """Test listing users with pagination"""
        with app.app_context():
            response = client.get("/api/users?page=1&per_page=10", headers=manager_auth_headers)
            assert response.status_code == 200
            assert response.json["success"] is True
            assert "users" in response.json["data"]
            assert "pagination" in response.json["data"]

    def test_list_users_filter_by_role(self, app, client, manager_auth_headers):
        """Test listing users filtered by role"""
        with app.app_context():
            response = client.get("/api/users?role=manager", headers=manager_auth_headers)
            assert response.status_code == 200
            assert response.json["success"] is True
            assert all(user["role"] == "manager" for user in response.json["data"]["users"])

class TestUsersBySchoolResource:
    """Test UsersBySchoolResource endpoints"""

    def test_get_users_by_school(self, app, client, school, manager_auth_headers):
        """Test getting users by school ID"""
        with app.app_context():
            response = client.get(f"/api/schools/{school.id}/users", headers=manager_auth_headers)
            assert response.status_code == 200
            assert response.json["success"] is True
            assert "school" in response.json["data"]
            assert "users" in response.json["data"]


    def test_add_user_invalid_data(self, app, client, school, manager_auth_headers):
        """Test adding user with invalid data"""
        with app.app_context():
            data = {"name": "Invalid User"}  # Missing required fields
            response = client.post(f"/api/schools/{school.id}/users", json=data, headers=manager_auth_headers)
            assert response.status_code == 400
            assert response.json["success"] is False

class TestUserProfileResource:
    """Test UserProfileResource endpoints"""

    def test_get_profile(self, app, client, student_user, auth_headers):
        """Test retrieving current user's profile"""
        with app.app_context():
            response = client.get("/api/users/profile", headers=auth_headers)
            assert response.status_code == 200
            assert response.json["success"] is True
            assert response.json["data"]["profile"]["email"] == "student@example.com"

    def test_update_profile(self, app, client, student_user, auth_headers):
        """Test updating current user's profile"""
        with app.app_context():
            data = {"name": "Updated Profile"}
            response = client.put("/api/users/profile", json=data, headers=auth_headers)
            assert response.status_code == 200
            assert response.json["success"] is True
            assert response.json["data"]["profile"]["name"] == "Updated Profile"

class TestUserDashboardResource:
    """Test UserDashboardResource endpoints"""

    def test_get_dashboard_manager(self, app, client, manager_user, manager_auth_headers):
        """Test retrieving dashboard for manager"""
        with app.app_context():
            response = client.get("/api/users/dashboard", headers=manager_auth_headers)
            assert response.status_code == 200
            assert response.json["success"] is True
            assert "user_stats" in response.json["data"]["dashboard"]

