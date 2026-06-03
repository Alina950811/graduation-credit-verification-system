from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.course_repository import CourseRepository
from app.schemas.course_schema import CourseCreate, CourseResponse
from app.services.course_service import CourseService


router = APIRouter(
    prefix="/courses",
    tags=["Courses"]
)


def get_course_service(db: Session = Depends(get_db)):
    repository = CourseRepository(db)
    return CourseService(repository)


@router.get("/", response_model=list[CourseResponse])
def get_courses(service: CourseService = Depends(get_course_service)):
    return service.get_all_courses()


@router.get("/{course_id}", response_model=CourseResponse)
def get_course(
    course_id: str,
    service: CourseService = Depends(get_course_service)
):
    course = service.get_course_by_id(course_id)

    if course is None:
        raise HTTPException(status_code=404, detail="找不到課程")

    return course


@router.post("/", response_model=CourseResponse)
def create_course(
    course_data: CourseCreate,
    service: CourseService = Depends(get_course_service)
):
    return service.create_course(course_data)