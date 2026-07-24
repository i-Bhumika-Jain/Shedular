from pydantic import BaseModel


class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: dict


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: list | None = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
