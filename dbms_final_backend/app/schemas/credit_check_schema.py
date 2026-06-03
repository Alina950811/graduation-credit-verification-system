from pydantic import BaseModel
from typing import Optional

class CreditCheckRuleResult(BaseModel):
    rule_id: int
    category_id: int
    main_type: str
    sub_type: Optional[str] = None

    required_courses: Optional[int] = None
    passed_courses: int
    missing_courses_count: Optional[int] = None

    required_credits:Optional[int] = None
    earned_credits: int
    missing_credits: Optional[int] = None

    is_passed: bool


class MissingRequiredCourse(BaseModel):
    course_id: str
    course_name: str
    credits: int


class RequiredCourseCheckResult(BaseModel):
    required_total: int
    passed_required: int
    missing_required: int
    is_passed: bool
    missing_courses: list[MissingRequiredCourse]


class CreditCheckResponse(BaseModel):
    student_id: str
    admission_year: int
    required_course_check: RequiredCourseCheckResult
    results: list[CreditCheckRuleResult]


class CreditCheckSummaryResponse(BaseModel):
    student_id: str
    total_rules: int
    passed_rules: int
    failed_rules: int
    progress_percent: float
    is_graduation_ready: bool