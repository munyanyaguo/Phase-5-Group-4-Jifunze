"""Tests for School routes"""
import pytest
from app.models.user import User
from app.models.school import School
from app.extensions import db
from flask_jwt_extended import create_access_token


class TestSchoolRoutes:
    """Test school API endpoints"""

    def test_create_school(self, app, client):
        """Test creating a school"""
        with app.app_context():
            # Create manager
            manager = User(name="Manager", email="manager@test.com", role="manager")
            manager.set_password("password123")
            db.session.add(manager)
            db.session.commit()

            token = create_access_token(
                identity=manager.public_id,
                additional_claims={"role": "manager"}
            )
            headers = {"Authorization": f"Bearer {token}"}

            data = {
                "name": "New School",
                "address": "123 Test St",
                "phone": "1234567890"
            }

            response = client.post("/api/schools", json=data, headers=headers)
            assert response.status_code == 201
            assert response.json["data"]["school"]["name"] == "New School"

    def test_list_schools(self, app, client):
        """Test listing schools"""
        with app.app_context():
            # Create manager and school
            manager = User(name="Manager", email="manager@test.com", role="manager")
            manager.set_password("password123")
            db.session.add(manager)
            db.session.commit()

            school = School(name="Test School", address="Test Address", owner_id=manager.id)
            db.session.add(school)
            db.session.commit()

            token = create_access_token(
                identity=manager.public_id,
                additional_claims={"role": "manager"}
            )
            headers = {"Authorization": f"Bearer {token}"}

            response = client.get("/api/schools", headers=headers)
            assert response.status_code == 200

    def test_get_school_by_id(self, app, client):
        """Test getting a specific school"""
        with app.app_context():
            manager = User(name="Manager", email="manager@test.com", role="manager")
            manager.set_password("password123")
            db.session.add(manager)
            db.session.commit()

            school = School(name="Test School", address="Test Address", owner_id=manager.id)
            db.session.add(school)
            db.session.commit()

            token = create_access_token(
                identity=manager.public_id,
                additional_claims={"role": "manager"}
            )
            headers = {"Authorization": f"Bearer {token}"}

            response = client.get(f"/api/schools/{school.id}", headers=headers)
            assert response.status_code == 200
            assert response.json["data"]["school"]["name"] == "Test School"

    def test_update_school(self, app, client):
        """Test updating a school"""
        with app.app_context():
            manager = User(name="Manager", email="manager@test.com", role="manager")
            manager.set_password("password123")
            db.session.add(manager)
            db.session.commit()

            school = School(name="Test School", address="Test Address", owner_id=manager.id)
            db.session.add(school)
            db.session.commit()

            token = create_access_token(
                identity=manager.public_id,
                additional_claims={"role": "manager"}
            )
            headers = {"Authorization": f"Bearer {token}"}

            data = {"name": "Updated School"}

            response = client.put(f"/api/schools/{school.id}", json=data, headers=headers)
            assert response.status_code == 200
            assert response.json["data"]["school"]["name"] == "Updated School"

    def test_delete_school(self, app, client):
        """Test deleting a school"""
        with app.app_context():
            manager = User(name="Manager", email="manager@test.com", role="manager")
            manager.set_password("password123")
            db.session.add(manager)
            db.session.commit()

            school = School(name="Test School", address="Test Address", owner_id=manager.id)
            db.session.add(school)
            db.session.commit()

            school_id = school.id

            token = create_access_token(
                identity=manager.public_id,
                additional_claims={"role": "manager"}
            )
            headers = {"Authorization": f"Bearer {token}"}

            response = client.delete(f"/api/schools/{school_id}", headers=headers)
            assert response.status_code == 200

    def test_create_school_unauthorized(self, app, client):
        """Test creating school without proper role"""
        with app.app_context():
            student = User(name="Student", email="student@test.com", role="student")
            student.set_password("password123")
            db.session.add(student)
            db.session.commit()

            token = create_access_token(
                identity=student.public_id,
                additional_claims={"role": "student"}
            )
            headers = {"Authorization": f"Bearer {token}"}

            data = {
                "name": "New School",
                "address": "123 Test St"
            }

            response = client.post("/api/schools", json=data, headers=headers)
            assert response.status_code == 403
