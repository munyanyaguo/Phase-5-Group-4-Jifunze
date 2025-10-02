"""
Flask application entry point for Render deployment.
This file provides a direct app reference for gunicorn.
"""
from wsgi import app

# Export the app for gunicorn
application = app

if __name__ == "__main__":
    app.run()

