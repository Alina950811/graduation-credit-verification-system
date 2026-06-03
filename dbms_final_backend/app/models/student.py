from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Student(Base):
    __tablename__ = "students"

    student_id: Mapped[str] = mapped_column(String(20), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    admission_year: Mapped[int] = mapped_column(Integer, nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)

    course_records = relationship(
        "StudentCourseRecord",
        back_populates="student",
        cascade="all, delete-orphan"  #如果某個學生被刪掉，他底下的修課紀錄也會一起被刪掉。
    )

    user = relationship(
    "User",
    back_populates="student",
    uselist=False,
    cascade="all, delete-orphan"
    )