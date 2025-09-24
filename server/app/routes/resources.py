from flask import request
from flask_restful import Resource as ApiResource
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.extensions import db, paginate
from functools import wraps
from werkzeug.utils import secure_filename  # For file uploads (if supported)

from app.models import Resource, Course
from app.schemas.resources import resource_schema, resources_schema
from app.utils.responses import success_response, error_response


def role_required(*roles):
    """
    Restrict access to certain roles.
    Usage: @role_required("educator", "manager")
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            claims = get_jwt()
            user_role = claims.get("role")

            if user_role not in roles:
                return error_response("Forbidden: insufficient role", 403)

            return fn(*args, **kwargs)
        return wrapper
    return decorator


class ResourceListApi(ApiResource):
    @jwt_required()
    def get(self):
        """List all resources with pagination"""
        query = Resource.query.order_by(Resource.created_at.desc())
        return paginate(query, resources_schema, resource_name="resources")

    @jwt_required()
    @role_required("educator", "manager")
    def post(self):
        """
        Create a new resource (educator/manager only).
        Supports either a URL or a file upload.
        """
        data = request.form.to_dict() if request.form else request.get_json()
        title = data.get("title")
        type_ = data.get("type")
        course_id = data.get("course_id")

        if not all([title, type_, course_id]):
            return error_response("Missing required fields", 400)

        # 🔹 Handle file upload OR URL
        url = data.get("url")
        file = request.files.get("file")

        if not url and not file:
            return error_response("Provide either a URL or a file", 400)

        if file:
            # Sanitize filename before saving
            filename = secure_filename(file.filename)
            file.save(f"uploads/{filename}")  # Example path
            url = f"/uploads/{filename}"

        # Validate course existence
        course = db.session.get(Course, course_id)
        if not course:
            return error_response("Invalid course_id", status_code=404)

        user_id = get_jwt_identity()
        resource = Resource(
            title=title,
            url=url,
            type=type_,
            course_id=course_id,
            uploaded_by=user_id,
        )
        db.session.add(resource)
        db.session.commit()

        return success_response("Resource created successfully", resource_schema.dump(resource), 201)


class ResourceDetailApi(ApiResource):
    @jwt_required()
    def get(self, resource_id):
        """Get a single resource"""
        resource = db.session.get(Resource, resource_id)
        if not resource:
            return error_response("Resource not found", status_code=404)
        return success_response("Fetched resource", resource_schema.dump(resource))

    @jwt_required()
    @role_required("educator", "manager")
    def put(self, resource_id):
        """Update resource (educator/manager only)"""
        resource = db.session.get(Resource, resource_id)
        if not resource:
            return error_response("Resource not found", status_code=404)
        data = request.get_json()

        if not data:
            return error_response("No data provided", 400)

        resource.title = data.get("title", resource.title)
        resource.url = data.get("url", resource.url)
        resource.type = data.get("type", resource.type)

        db.session.commit()
        return success_response("Resource updated successfully", resource_schema.dump(resource))

    @jwt_required()
    @role_required("educator", "manager")
    def delete(self, resource_id):
        """Delete resource (educator/manager only)"""
        resource = db.session.get(Resource, resource_id)
        if not resource:
            return error_response("Resource not found", status_code=404)
        db.session.delete(resource)
        db.session.commit()

        return success_response("Resource deleted successfully")

