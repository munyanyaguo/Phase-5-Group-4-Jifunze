"""Tests for Auth schemas"""
import pytest
from marshmallow import ValidationError
from app.schemas.auth import LoginSchema, RegisterSchema


class TestLoginSchema:
    """Test LoginSchema validation"""

    def test_valid_login_data(self, app):
        """Test schema with valid login data"""
        with app.app_context():
            schema = LoginSchema()
            data = {
                "email": "test@example.com",
                "password": "password123"
            }
            result = schema.load(data)
            assert result["email"] == "test@example.com"
            assert result["password"] == "password123"

    def test_missing_email(self, app):
        """Test schema with missing email"""
        with app.app_context():
            schema = LoginSchema()
            data = {"password": "password123"}
            with pytest.raises(ValidationError):
                schema.load(data)

    def test_missing_password(self, app):
        """Test schema with missing password"""
        with app.app_context():
            schema = LoginSchema()
            data = {"email": "test@example.com"}
            with pytest.raises(ValidationError):
                schema.load(data)


class TestRegisterSchema:
    """Test RegisterSchema validation"""

    def test_valid_register_data(self, app):
        """Test schema with valid registration data"""
        with app.app_context():
            schema = RegisterSchema()
            data = {
                "name": "Test User",
                "email": "test@example.com",
                "password": "password123",
                "role": "student"
            }
            result = schema.load(data)
            assert result["name"] == "Test User"
            assert result["email"] == "test@example.com"
            assert result["role"] == "student"

    def test_invalid_role(self, app):
        """Test schema with invalid role"""
        with app.app_context():
            schema = RegisterSchema()
            data = {
                "name": "Test User",
                "email": "test@example.com",
                "password": "password123",
                "role": "superadmin"
            }
            with pytest.raises(ValidationError):
                schema.load(data)
