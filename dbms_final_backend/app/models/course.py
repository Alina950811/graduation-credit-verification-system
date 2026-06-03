from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.database import Base


class Course(Base):
    __tablename__ = "courses"

    course_id: Mapped[str] = mapped_column(String(20), primary_key=True, index=True)
    course_name: Mapped[str] = mapped_column(String(100), nullable=False)
    credits: Mapped[int] = mapped_column(Integer, nullable=False)
    taught_by: Mapped[Optional[str]] = mapped_column(String(100), nullable=True) #欄位可以是字串，也可以是 None

    student_records = relationship(
        "StudentCourseRecord",
        back_populates="course"
    ) #一門課可以出現在很多學生的修課紀錄中

    category_mappings = relationship(
        "CourseCategoryMapping",
        back_populates="course",
        cascade="all, delete-orphan"
    ) #如果刪掉某門課，這門課底下的「課程類別對應資料」也會一起刪掉

    required_courses = relationship(
    "RequiredCourse",
    back_populates="course",
    cascade="all, delete-orphan"
    )