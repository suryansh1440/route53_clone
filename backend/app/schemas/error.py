from pydantic import BaseModel


class ErrorResponse(BaseModel):
    """Standard error response returned by all API errors."""
    detail: str
    field: str | None = None
    code: str | None = None
