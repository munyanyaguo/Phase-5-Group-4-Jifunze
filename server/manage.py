from flask.cli import FlaskGroup

from app import create_app
from app.models import (Attendance, Course, Enrollment, Message,  # noqa: F401
                        Resource, School, User, reset_password)

app = create_app()
cli = FlaskGroup(app)


from app.seed import seed as seed_cli  # noqa: E402
cli.add_command(seed_cli, name="seed")

if __name__ == "__main__":
    cli()
