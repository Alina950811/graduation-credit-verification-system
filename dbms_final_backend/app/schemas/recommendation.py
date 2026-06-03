from pydantic import BaseModel

class RecommendedCourse(BaseModel):
    course_id: str
    course_name: str
    category_id: int
    credits: int
    peer_pass_rate: float
    recommendation_score: float