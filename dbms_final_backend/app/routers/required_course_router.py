from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.required_course_repository import RequiredCourseRepository
from app.schemas.required_course_schema import (
    RequiredCourseCreate,
    RequiredCourseResponse,
)
from app.services.required_course_service import RequiredCourseService


router = APIRouter(
    prefix="/required-courses",
    tags=["Required Courses"]
)


def get_required_course_service(db: Session = Depends(get_db)):
    repository = RequiredCourseRepository(db)
    return RequiredCourseService(repository)


@router.get("/", response_model=list[RequiredCourseResponse])
def get_required_courses(
    service: RequiredCourseService = Depends(get_required_course_service)
):
    return service.get_all_required_courses()


@router.get("/year/{admission_year}", response_model=list[RequiredCourseResponse])
def get_required_courses_by_year(
    admission_year: int,
    service: RequiredCourseService = Depends(get_required_course_service)
):
    return service.get_required_courses_by_admission_year(admission_year)


@router.post("/", response_model=RequiredCourseResponse)
def create_required_course(
    required_course_data: RequiredCourseCreate,
    service: RequiredCourseService = Depends(get_required_course_service)
):
    return service.create_required_course(required_course_data)