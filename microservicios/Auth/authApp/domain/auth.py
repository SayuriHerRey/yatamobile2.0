from pydantic import BaseModel
from enum import Enum
from typing import Optional

class Role(str, Enum):
    student = "student"
    staff = "staff"

class User(BaseModel):
    id: str
    email: str
    name: str
    hashed_password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: Role

class LoginRequest(BaseModel):
    email: str
    password: str