from pydantic import BaseModel, EmailStr, field_serializer
from typing import Optional, Any
from ..models.enums import UserRole

class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: UserRole = UserRole.CLIENT
    bar_council_number: Optional[str] = None   # Bar Council of Maharashtra & Goa
    enrollment_year: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str

class UserResponse(BaseModel):
    id: Any
    email: str
    full_name: str
    role: Any

    @field_serializer("id")
    def serialize_id(self, value: Any) -> str:
        return str(value)

    @field_serializer("role")
    def serialize_role(self, value: Any) -> str:
        return value.value if hasattr(value, "value") else str(value)

    class Config:
        from_attributes = True