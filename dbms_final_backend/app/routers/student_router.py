from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.student_repository import StudentRepository
from app.schemas.student_schema import StudentCreate, StudentResponse
from app.services.student_service import StudentService


router = APIRouter(
    prefix="/students",
    tags=["Students"]
)


def get_student_service(db: Session = Depends(get_db)):
    repository = StudentRepository(db)
    return StudentService(repository)


@router.get("/", response_model=list[StudentResponse])
def get_students(service: StudentService = Depends(get_student_service)):
    return service.get_all_students()


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: str,
    service: StudentService = Depends(get_student_service)
):
    student = service.get_student_by_id(student_id)

    if student is None:
        raise HTTPException(status_code=404, detail="找不到學生")

    return student


@router.post("/", response_model=StudentResponse)
def create_student(
    student_data: StudentCreate,
    service: StudentService = Depends(get_student_service)
):
    return service.create_student(student_data)