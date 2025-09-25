from flask import Blueprint, jsonify, send_from_directory
from flask_restful import Resource
import os

# Create a blueprint for root routes (without /api prefix)
root_bp = Blueprint("root", __name__)

class RootResource(Resource):
    def get(self):
        """
        GET /
        Root endpoint that provides API information and available endpoints.
        """
        return jsonify({
            "message": "Welcome to Jifunze API",
            "version": "1.0.0",
            "description": "Educational platform API for schools, courses, users, and resources",
            "documentation": "/api/docs",
            "available_endpoints": {
                "authentication": "/api/auth/*",
                "courses": "/api/courses/*",
                "users": "/api/users/*",
                "schools": "/api/schools/*",
                "attendance": "/api/attendance/*",
                "messages": "/api/messages/*",
                "resources": "/api/resources/*"
            },
            "status": "running"
        })

class FaviconResource(Resource):
    def get(self):
        """
        GET /favicon.ico
        Serve favicon or return no content to prevent 404 errors.
        """
        # Try to serve favicon from static folder if it exists
        static_folder = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static')
        favicon_path = os.path.join(static_folder, 'favicon.ico')

        if os.path.exists(favicon_path):
            return send_from_directory(static_folder, 'favicon.ico')

        # Return 204 No Content to prevent 404 errors in browser
        from flask import Response
        return Response('', status=204, mimetype='image/x-icon')

# Add resources to the blueprint
from flask_restful import Api
api = Api(root_bp)
api.add_resource(RootResource, "/")
api.add_resource(FaviconResource, "/favicon.ico")
