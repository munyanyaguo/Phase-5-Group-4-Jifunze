import pytest
from app import create_app
from app.extensions import db


@pytest.fixture(scope="session")
def app():
    app = create_app("testing")
    return app


@pytest.fixture(scope="function", autouse=True)
def setup_database(app):
    with app.app_context():
        db.create_all()
        yield
        db.session.remove()
        db.drop_all()