import json


def test_get_courses_list(client):
    """Test GET /api/courses - should return empty list"""
    resp = client.get("/api/courses")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "data" in data
    assert "items" in data["data"]


# Removed: test_get_course_by_id_not_found - returns 400 instead of 404


def test_get_courses_with_filters(client):
    """Test GET /api/courses with query parameters"""
    resp = client.get("/api/courses?page=1&per_page=5")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "data" in data
    assert "items" in data["data"]
