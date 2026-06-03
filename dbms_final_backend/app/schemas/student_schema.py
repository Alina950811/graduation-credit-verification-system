from pydantic import BaseModel


class StudentCreate(BaseModel):
    student_id: str
    name: str
    admission_year: int
    department: str


class StudentResponse(BaseModel):
    student_id: str
    name: str
    admission_year: int
    department: str

    class Config:
        from_attributes = True