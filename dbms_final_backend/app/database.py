from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.config import settings


class Base(DeclarativeBase):
    """
    所有 SQLAlchemy ORM Model 的共同基底類別
    之後 Student、Course 等資料表都會繼承這個 Base
    """
    pass


# 建立資料庫引擎
# engine 負責管理 Python 和 MySQL 之間的連線
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_size=20,
    max_overflow=30,
    pool_pre_ping=True
)


# 建立 Session 工廠
# Session 是我們實際用來查詢、新增、修改、刪除資料的物件
SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False
)


def get_db():
    """
    FastAPI dependency
    每次 API 被呼叫時，提供一個資料庫 session
    API 結束後自動關閉 session
    """
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()