from pydantic import BaseModel
from typing import Optional

class CourseCategoryCreate(BaseModel):
    main_type: str
    sub_type: Optional[str] = None


class CourseCategoryResponse(BaseModel):
    category_id: int
    main_type: str
    sub_type: Optional[str] = None

    class Config:
        from_attributes = True