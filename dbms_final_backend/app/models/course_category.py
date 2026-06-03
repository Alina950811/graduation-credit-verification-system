from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.database import Base


class CourseCategory(Base):
    __tablename__ = "course_categories"

    category_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    main_type: Mapped[str] = mapped_column(String(50), nullable=False)
    sub_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    course_mappings = relationship(
        "CourseCategoryMapping",
        back_populates="category",
        cascade="all, delete-orphan"
    )

    graduation_rules = relationship(
        "GraduationRule",
        back_populates="category"
    )