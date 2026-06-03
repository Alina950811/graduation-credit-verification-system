from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.student_repository import StudentRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth_schema import UserRegister, UserLogin, TokenResponse
from app.services.auth_service import AuthService
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)


def get_auth_service(db: Session = Depends(get_db)):
    user_repository = UserRepository(db)
    student_repository = StudentRepository(db)
    return AuthService(user_repository, student_repository)


@router.post("/register")
def register(
    register_data: UserRegister,
    service: AuthService = Depends(get_auth_service)
):
    user, error = service.register(register_data)

    if error is not None:
        raise HTTPException(status_code=400, detail=error)

    return {
        "message": "註冊成功",
        "user_id": user.user_id,
        "student_id": user.student_id,
        "username": user.username
    }


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service)
):
    login_data = UserLogin(
        username=form_data.username,
        password=form_data.password
    )

    token = service.login(login_data)

    if token is None:
        raise HTTPException(status_code=401, detail="帳號或密碼錯誤")

    return {
        "access_token": token,
        "token_type": "bearer"
    }