"""
Flask application entry point for Render deployment.
This file provides a direct app reference for gunicorn.
"""
from wsgi import app as application

# Make 'app' available for gunicorn app:app syntax
app = application

if __name__ == "__main__":
    app.run()

