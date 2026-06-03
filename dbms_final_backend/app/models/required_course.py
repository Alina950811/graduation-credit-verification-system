from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class RequiredCourse(Base):
    __tablename__ = "required_courses"

    admission_year: Mapped[int] = mapped_column(
        Integer,
        primary_key=True
    )

    course_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("courses.course_id"),
        primary_key=True
    )

    course = relationship("Course")