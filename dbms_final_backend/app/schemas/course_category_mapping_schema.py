from pydantic import BaseModel


class CourseCategoryMappingCreate(BaseModel):
    course_id: str
    category_id: int


class CourseCategoryMappingResponse(BaseModel):
    course_id: str
    category_id: int

    class Config:
        from_attributes = True