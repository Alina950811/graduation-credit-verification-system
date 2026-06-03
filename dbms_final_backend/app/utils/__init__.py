from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from app.config import settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user_payload(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )

        user_id = payload.get("sub")
        student_id = payload.get("student_id")
        username = payload.get("username")

        if user_id is None or student_id is None or username is None:
            raise HTTPException(status_code=401, detail="無效的登入憑證")

        return {
            "user_id": int(user_id),
            "student_id": int(student_id),
            "username": username
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="無效或過期的登入憑證")