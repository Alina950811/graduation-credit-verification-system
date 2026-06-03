from pydantic import BaseModel
from typing import Optional

class GraduationRuleCreate(BaseModel):
    admission_year: int
    category_id: int
    min_courses: Optional[int] = None
    min_credits: Optional[int] = None


class GraduationRuleResponse(BaseModel):
    rule_id: int
    admission_year: int
    category_id: int
    min_courses: Optional[int] = None
    min_credits: Optional[int] = None

    class Config:
        from_attributes = True