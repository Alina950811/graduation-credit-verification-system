from pydantic import BaseModel


class UserRegister(BaseModel):
    student_id: str
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"