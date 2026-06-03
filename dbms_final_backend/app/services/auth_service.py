from datetime import datetime, timedelta, timezone

from jose import jwt
from passlib.context import CryptContext

from app.config import settings
from app.models.user import User
from app.repositories.student_repository import StudentRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth_schema import UserRegister, UserLogin


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    def __init__(
        self,
        user_repository: UserRepository,
        student_repository: StudentRepository
    ):
        self.user_repository = user_repository
        self.student_repository = student_repository

    def hash_password(self, password: str):
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, password_hash: str):
        return pwd_context.verify(plain_password, password_hash)

    def create_access_token(self, data: dict):
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

        payload = data.copy()
        payload.update({"exp": expire})

        return jwt.encode(
            payload,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )

    def register(self, register_data: UserRegister):
        student = self.student_repository.get_by_id(register_data.student_id)

        if student is None:
            return None, "找不到學生"

        existing_username = self.user_repository.get_by_username(
            register_data.username
        )

        if existing_username is not None:
            return None, "帳號已存在"

        existing_student_user = self.user_repository.get_by_student_id(
            register_data.student_id
        )

        if existing_student_user is not None:
            return None, "此學生已建立帳號"

        user = User(
            student_id=register_data.student_id,
            username=register_data.username,
            password_hash=self.hash_password(register_data.password)
        )

        created_user = self.user_repository.create(user)

        return created_user, None

    def login(self, login_data: UserLogin):
        user = self.user_repository.get_by_username(login_data.username)

        if user is None:
            return None

        if not self.verify_password(login_data.password, user.password_hash):
            return None

        token = self.create_access_token({
            "sub": str(user.user_id),
            "student_id": user.student_id,
            "username": user.username
        })

        return token