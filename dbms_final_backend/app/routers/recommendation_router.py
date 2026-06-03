from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.recommendation_service import RecommendationService
from app.schemas.recommendation import RecommendedCourse

router = APIRouter(prefix="/recommendations", tags=["Recommendation"])

@router.get("/{student_id}", response_model=List[RecommendedCourse])
def get_makeup_course_recommendations(student_id: str, db: Session = Depends(get_db)):
    service = RecommendationService(db)
    return service.get_recommendations(student_id)