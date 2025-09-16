from flask.cli import FlaskGroup

from app import create_app
from app.models import (Attendance, Course, Enrollment, Message,  # noqa: F401
                        Resource, School, User)

app = create_app()
cli = FlaskGroup(app)

if __name__ == "__main__":
    cli()
