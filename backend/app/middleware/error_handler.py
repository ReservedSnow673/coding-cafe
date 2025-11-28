"""Error handling middleware for consistent error responses"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import Union
import logging

logger = logging.getLogger(__name__)


async def error_handler_middleware(request: Request, call_next):
    """
    Middleware to catch and format all unhandled exceptions.
    
    Returns consistent JSON error responses for all error types.
    """
    try:
        return await call_next(request)
    except Exception as exc:
        return await handle_exception(exc, request)


async def handle_exception(exc: Exception, request: Request) -> JSONResponse:
    """
    Handle different types of exceptions and return appropriate responses.
    
    Args:
        exc: The exception that was raised
        request: The FastAPI request object
        
    Returns:
        JSONResponse with error details
    """
    # Log the error
    logger.error(f"Error processing request {request.url}: {str(exc)}", exc_info=True)
    
    # Handle validation errors
    if isinstance(exc, RequestValidationError):
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "message": "Validation error",
                "errors": [str(err) for err in exc.errors()]
            }
        )
    
    # Handle database integrity errors
    if isinstance(exc, IntegrityError):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={
                "success": False,
                "message": "Database constraint violation",
                "detail": "The operation conflicts with existing data"
            }
        )
    
    # Handle general database errors
    if isinstance(exc, SQLAlchemyError):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "message": "Database error occurred",
                "detail": "Please try again later"
            }
        )
    
    # Handle all other errors
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "message": "Internal server error",
            "detail": str(exc) if request.app.debug else "An unexpected error occurred"
        }
    )


def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Custom handler for validation errors.
    
    Formats validation errors in a user-friendly way.
    """
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        errors.append(f"{field}: {message}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "message": "Validation failed",
            "errors": errors
        }
    )
