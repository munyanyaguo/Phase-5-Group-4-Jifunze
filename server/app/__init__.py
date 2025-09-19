# import os
# from dotenv import load_dotenv
# from flask import Flask
# from .extensions import cors, db, migrate

# # Load the right .env file
# flask_env = os.getenv("FLASK_ENV", "production")

# if flask_env == "development":
#     dotenv_file = ".env.development"
# else:
#     dotenv_file = ".env.production"

# if os.path.exists(dotenv_file):
#     load_dotenv(dotenv_file)
#     print(f"Loaded environment from {dotenv_file}")
# else:
#     print(f"No {dotenv_file} file found, falling back to system environment.")


# def create_app():
#     app = Flask(_name_)
#     # Config
#     app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev_secret")
#     app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
#     app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

#     db_uri = app.config.get("SQLALCHEMY_DATABASE_URI")
#     if db_uri and isinstance(db_uri, str) and db_uri.startswith("postgresql"):
#         app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"connect_args": {"sslmode": "require"}}

#     # Init extensions
#     db.init_app(app)
#     migrate.init_app(app, db)
#     cors.init_app(app, origins=os.getenv("CORS_ORIGINS", "*").split(","))

#     return app
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


def create_app(config_name=None):
    app = Flask(__name__)
    
    # Handle different configurations
    if config_name == "testing":
        # Testing configuration
        app.config["SECRET_KEY"] = "test_secret_key"
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        app.config["TESTING"] = True
        app.config["WTF_CSRF_ENABLED"] = False
    else:
        # Normal configuration (development/production)
        app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev_secret")
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
        app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

        # PostgreSQL SSL configuration for non-testing environments
        db_uri = app.config.get("SQLALCHEMY_DATABASE_URI")
        if db_uri and isinstance(db_uri, str) and db_uri.startswith("postgresql"):
            app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"connect_args": {"sslmode": "require"}}

    # Init extensions
    db.init_app(app)
    migrate.init_app(app, db)
    
    # CORS configuration
    if config_name == "testing":
        cors.init_app(app, origins=["*"])
    else:
        cors.init_app(app, origins=os.getenv("CORS_ORIGINS", "*").split(","))

    return app