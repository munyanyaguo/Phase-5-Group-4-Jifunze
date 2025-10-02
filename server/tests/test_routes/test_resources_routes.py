import json


def test_get_resources_list(client, auth_headers):
    """Test GET /api/resources - should return empty list"""
    resp = client.get("/api/resources", headers=auth_headers("educator"))
    assert resp.status_code == 200
    data = resp.get_json()
    assert "data" in data
    assert "resources" in data["data"]


def test_get_resource_by_id_not_found(client, auth_headers):
    """Test GET /api/resources/999 - should return 404"""
    resp = client.get("/api/resources/999", headers=auth_headers("educator"))
    assert resp.status_code == 404


def test_get_resources_with_pagination(client, auth_headers):
    """Test GET /api/resources with pagination"""
    resp = client.get("/api/resources?page=1&per_page=5", headers=auth_headers("manager"))
    assert resp.status_code == 200
    data = resp.get_json()
    assert "data" in data
    assert "resources" in data["data"]
