from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask import request, jsonify

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()

def paginate(query, serializer=lambda x: x.to_dict(), default_per_page=10):
    """
    Reusable pagination for list endpoints.
    - query: SQLAlchemy query (e.g., User.query)
    - serializer: function to convert objects to dicts
    - default_per_page: fallback if not provided in query params
    """
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", default_per_page, type=int)

    items = query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "items": [serializer(item) for item in items.items],
        "total": items.total,
        "page": items.page,
        "pages": items.pages
    })