from pydantic import BaseModel
from typing import Optional

class CourseCreate(BaseModel):
    course_id: str
    course_name: str
    credits: int
    taught_by: Optional[str] = None

class CourseResponse(BaseModel):
    course_id: str
    course_name: str
    credits: int
    taught_by: Optional[str] = None

    class Config:
        from_attributes = True