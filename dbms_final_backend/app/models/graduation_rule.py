from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.database import Base


class GraduationRule(Base):
    __tablename__ = "graduation_rules"

    rule_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    admission_year: Mapped[int] = mapped_column(Integer, nullable=False)

    category_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("course_categories.category_id"),
        nullable=False
    )

    min_courses: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    min_credits: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    category = relationship("CourseCategory", back_populates="graduation_rules")