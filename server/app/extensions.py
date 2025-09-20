from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask import request, url_for
from flask_marshmallow import Marshmallow
from app.utils.responses import success_response

db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
ma = Marshmallow()

def paginate(query, schema, default_per_page=10, resource_name="items"):
    """
    Reusable pagination for list endpoints with meta + links.
    - query: SQLAlchemy query (e.g., Course.query)
    - schema: Marshmallow schema (e.g., courses_schema)
    - resource_name: key under which items will appear in data
    """
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", default_per_page, type=int)

    items = query.paginate(page=page, per_page=per_page, error_out=False)

    # Build pagination links dynamically
    def make_url(p):
        return url_for(request.endpoint, page=p, per_page=per_page, **request.view_args, _external=True)

    links = {
        "self": make_url(items.page),
        "next": make_url(items.next_num) if items.has_next else None,
        "prev": make_url(items.prev_num) if items.has_prev else None
    }

    response_data = {
        resource_name: schema.dump(items.items),
        "meta": {
            "total": items.total,
            "page": items.page,
            "pages": items.pages,
            "per_page": per_page
        },
        "links": links
    }

    return success_response("Fetched paginated results successfully.", response_data)
