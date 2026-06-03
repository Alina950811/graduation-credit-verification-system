from sqlalchemy import ForeignKey, Integer,String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CourseCategoryMapping(Base):
    __tablename__ = "course_category_mappings"

    course_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("courses.course_id"),
        primary_key=True
    )

    category_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("course_categories.category_id"),
        primary_key=True
    )

    course = relationship("Course", back_populates="category_mappings")
    category = relationship("CourseCategory", back_populates="course_mappings")