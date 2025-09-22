def success_response(message, data=None, status_code=200):
    """
    Standard success JSON response
    """
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return response, status_code


def error_response(message, errors=None, status_code=400):
    """
    Standard error JSON response
    """
    response = {"success": False, "message": message}
    if errors is not None:
        response["errors"] = errors
    return response, status_code
