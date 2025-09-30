import pytest
from uuid import uuid4
from datetime import datetime, timedelta, timezone
from app.models.user import User
from app.models.reset_password import ResetPassword
from app import db

@pytest.fixture
def student_user(app):
    """Fixture to create a test student user"""
    with app.app_context():
        user = User(
            public_id=str(uuid4()),
            name="Test Student",
            email="student@example.com",
            role="student"
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

class TestRegisterRoute:
    """Test user registration endpoint"""

    def test_register_success(self, app, client):
        """Test successful user registration"""
        with app.app_context():
            data = {
                "name": "Test User",
                "email": "testuser@example.com",
                "password": "SecurePass123!",
                "role": "student"
            }
            response = client.post("/api/auth/register", json=data)
            
            assert response.status_code == 201
            assert response.json["success"] is True
            assert "user" in response.json["data"]
            assert response.json["data"]["user"]["email"] == "testuser@example.com"

    def test_register_missing_fields(self, client):
        """Test registration with missing required fields"""
        data = {"email": "incomplete@example.com"}
        response = client.post("/api/auth/register", json=data)
        
        assert response.status_code == 400
        assert response.json["success"] is False

    def test_register_duplicate_email(self, app, client, student_user):
        """Test registration with existing email"""
        with app.app_context():
            data = {
                "name": "Duplicate User",
                "email": student_user.email,
                "password": "SecurePass123!",
                "role": "student"
            }
            response = client.post("/api/auth/register", json=data)
            
            assert response.status_code == 400

    def test_register_invalid_role(self, client):
        """Test registration with invalid role"""
        data = {
            "name": "Bad Role",
            "email": "badrole@example.com",
            "password": "SecurePass123!",
            "role": "superadmin"
        }
        response = client.post("/api/auth/register", json=data)
        
        assert response.status_code == 400

class TestLoginRoute:
    """Test user login endpoint"""

    def test_login_success(self, app, client, student_user):
        """Test successful login"""
        with app.app_context():
            data = {
                "email": student_user.email,
                "password": "password123"
            }
            response = client.post("/api/auth/login", json=data)
            
            assert response.status_code == 200
            assert response.json["success"] is True
            assert "access_token" in response.json["data"]
            assert "refresh_token" in response.json["data"]
            assert "user" in response.json["data"]

    def test_login_invalid_password(self, app, client, student_user):
        """Test login with wrong password"""
        with app.app_context():
            data = {
                "email": student_user.email,
                "password": "wrongpassword"
            }
            response = client.post("/api/auth/login", json=data)
            
            assert response.status_code == 401
            assert response.json["success"] is False

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email"""
        data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        response = client.post("/api/auth/login", json=data)
        
        assert response.status_code == 401

    def test_login_missing_credentials(self, client):
        """Test login with missing fields"""
        response = client.post("/api/auth/login", json={})
        
        assert response.status_code == 400

class TestLogoutRoute:
    """Test user logout endpoint"""

    def test_logout_success(self, app, client, auth_headers):
        """Test successful logout"""
        with app.app_context():
            response = client.post("/api/auth/logout", headers=auth_headers)
            
            assert response.status_code == 200
            assert response.json["success"] is True

    def test_logout_without_token(self, client):
        """Test logout without authentication"""
        response = client.post("/api/auth/logout")
        
        assert response.status_code == 401

class TestTokenRefreshRoute:
    """Test token refresh endpoint"""

    def test_refresh_token_success(self, app, client, student_user):
        """Test successful token refresh"""
        with app.app_context():
            login_data = {
                "email": student_user.email,
                "password": "password123"
            }
            login_response = client.post("/api/auth/login", json=login_data)
            refresh_token = login_response.json["data"]["refresh_token"]
            
            headers = {"Authorization": f"Bearer {refresh_token}"}
            response = client.post("/api/auth/refresh", headers=headers)
            
            assert response.status_code == 200
            assert "access_token" in response.json["data"]
            assert "refresh_token" in response.json["data"]

    def test_refresh_without_token(self, client):
        """Test refresh without token"""
        response = client.post("/api/auth/refresh")
        
        assert response.status_code == 401

    def test_refresh_with_access_token(self, app, client, auth_headers):
        """Test refresh with access token (should fail)"""
        with app.app_context():
            response = client.post("/api/auth/refresh", headers=auth_headers)
            
            assert response.status_code == 422  # Wrong token type

class TestResetPasswordRoute:
    """Test password reset endpoints"""

    def test_request_password_reset(self, app, client, student_user):
        """Test requesting password reset"""
        with app.app_context():
            data = {"email": student_user.email}
            response = client.post("/api/auth/reset-password", json=data)
            
            assert response.status_code == 200
            assert "reset_token" in response.json["data"]

    def test_request_reset_nonexistent_email(self, client):
        """Test reset request for non-existent email (should still return success)"""
        data = {"email": "nonexistent@example.com"}
        response = client.post("/api/auth/reset-password", json=data)
        
        assert response.status_code == 200

    def test_reset_with_invalid_token(self, client):
        """Test reset with invalid token"""
        data = {
            "token": "invalidtoken123",
            "new_password": "NewPass123!"
        }
        response = client.patch("/api/auth/reset-password", json=data)
        
        assert response.status_code == 400

    def test_reset_with_expired_token(self, app, client, student_user):
        """Test reset with expired token"""
        with app.app_context():
            reset = ResetPassword.create_reset_token(
                user_id=student_user.id,
                token="expiredtoken",
                hours_valid=0
            )
            reset.created_at = datetime.now(timezone.utc) - timedelta(hours=25)
            db.session.add(reset)
            db.session.commit()
            
            data = {
                "token": "expiredtoken",
                "new_password": "NewPass123!"
            }
            response = client.patch("/api/auth/reset-password", json=data)
            
            assert response.status_code == 400