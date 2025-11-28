"""Standard response formatters for API endpoints"""

from typing import Any, Dict, List, Optional
from fastapi import status


def success_response(
    data: Any = None,
    message: str = "Success",
    status_code: int = status.HTTP_200_OK
) -> Dict[str, Any]:
    """
    Format a success response.
    
    Args:
        data: Response data
        message: Success message
        status_code: HTTP status code
        
    Returns:
        Formatted response dictionary
    """
    response = {
        "success": True,
        "message": message,
    }
    
    if data is not None:
        response["data"] = data
    
    return response


def error_response(
    message: str = "An error occurred",
    errors: Optional[List[str]] = None,
    status_code: int = status.HTTP_400_BAD_REQUEST
) -> Dict[str, Any]:
    """
    Format an error response.
    
    Args:
        message: Error message
        errors: List of detailed error messages
        status_code: HTTP status code
        
    Returns:
        Formatted error dictionary
    """
    response = {
        "success": False,
        "message": message,
    }
    
    if errors:
        response["errors"] = errors
    
    return response


def paginated_response(
    items: List[Any],
    total: int,
    page: int = 1,
    page_size: int = 50,
    message: str = "Success"
) -> Dict[str, Any]:
    """
    Format a paginated response.
    
    Args:
        items: List of items for current page
        total: Total number of items
        page: Current page number
        page_size: Number of items per page
        message: Success message
        
    Returns:
        Formatted paginated response
    """
    return {
        "success": True,
        "message": message,
        "data": items,
        "pagination": {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
            "has_next": page * page_size < total,
            "has_prev": page > 1
        }
    }
