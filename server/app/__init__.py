

import os
from dotenv import load_dotenv
from flask import Flask
from .extensions import cors, db, migrate
from flask_jwt_extended import JWTManager
from datetime import timedelta

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
    # Handle different configurations
    if config_name == "testing":
        app.config["SECRET_KEY"] = "test_secret_key"
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
        app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        app.config["TESTING"] = True
        app.config["WTF_CSRF_ENABLED"] = False
        app.config["JWT_SECRET_KEY"] = "test_jwt_secret"
        app.config["JWT_TOKEN_LOCATION"] = ["headers"]
        app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)  # ⬅ longer for tests
        app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    else:
        app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev_secret")
        app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
        app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
        app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "deV_jwt_secret")
        app.config["JWT_TOKEN_LOCATION"] = ["headers"]
        app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)   # ⬅ default 15 mins → 1 hr
        app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)  # ⬅ optional refresh

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
        # Allow local dev and optional production origins from env FRONTEND_ORIGINS (comma-separated)
        default_origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            # production client on Render
            "https://phase-5-group-4-jifunze.onrender.com",
        ]
        extra_origins = os.getenv("FRONTEND_ORIGINS", "").strip()
        if extra_origins:
            default_origins.extend([o.strip() for o in extra_origins.split(",") if o.strip()])

        cors.init_app(
            app,
            resources={r"/api/*": {"origins": default_origins}},
            supports_credentials=True,
            allow_headers=["Content-Type", "Authorization", "Cache-Control"],
            methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        )

    
    # JWT setup
    JWTManager(app)

    # Register blueprints
    from .routes import api_bp
    from .routes.root import root_bp
    app.register_blueprint(api_bp)
    app.register_blueprint(root_bp)  # Root routes without /api prefix
    return app
