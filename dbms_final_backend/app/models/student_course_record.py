from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
from app.database import Base


class StudentCourseRecord(Base):
    __tablename__ = "student_course_records"

    record_id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    student_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("students.student_id"),
        nullable=False
    )

    course_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("courses.course_id"),
        nullable=False
    )

    semester: Mapped[str] = mapped_column(String(20), nullable=False)
    grade: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    is_passed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    student = relationship("Student", back_populates="course_records")
    course = relationship("Course", back_populates="student_records")