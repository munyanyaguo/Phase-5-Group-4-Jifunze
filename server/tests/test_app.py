import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_home_endpoint(client):
    response = client.get('/')
    assert response.status_code == 200
    assert b'Jifunze API' in response.data

def test_health_endpoint(client):
    response = client.get('/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['status'] == 'healthy'

def test_schools_endpoint(client):
    response = client.get('/schools')
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'schools' in json_data
    assert len(json_data['schools']) > 0

def test_courses_endpoint(client):
    response = client.get('/courses')
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'courses' in json_data