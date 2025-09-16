import os
from dotenv import load_dotenv
from flask import Flask
from .extensions import cors, db, migrate

# Load the right .env file
flask_env = os.getenv("FLASK_ENV", "production")

if flask_env == "development":
    dotenv_file = ".env.development"
else:
    dotenv_file = ".env.production"

if os.path.exists(dotenv_file):
    load_dotenv(dotenv_file)
    print(f"Loaded environment from {dotenv_file}")
else:
    print(f"No {dotenv_file} file found, falling back to system environment.")


def create_app():
    app = Flask(__name__)
    # Config
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev_secret")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if app.config["SQLALCHEMY_DATABASE_URI"].startswith("postgresql"):
        app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"connect_args": {"sslmode": "require"}}

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app, origins=os.getenv("CORS_ORIGINS", "*").split(","))

    return app
