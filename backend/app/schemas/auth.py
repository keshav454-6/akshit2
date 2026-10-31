from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    email: str

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None

class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    full_name: str
    role: str = "analyst"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
