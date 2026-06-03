from pydantic import BaseModel


class RequiredCourseCreate(BaseModel):
    admission_year: int
    course_id: str


class RequiredCourseResponse(BaseModel):
    admission_year: int
    course_id: str

    class Config:
        from_attributes = True