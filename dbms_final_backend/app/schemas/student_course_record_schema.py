from pydantic import BaseModel
from typing import Optional

class StudentCourseRecordCreate(BaseModel):
    student_id: str
    course_id: str
    semester: str
    grade: Optional[int] = None
    is_passed: bool = False


class StudentCourseRecordResponse(BaseModel):
    record_id: int
    student_id: str
    course_id: str
    semester: str
    grade: Optional[int] = None
    is_passed: bool

    class Config:
        from_attributes = True