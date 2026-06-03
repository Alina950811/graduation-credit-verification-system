from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.course_category_repository import CourseCategoryRepository
from app.schemas.course_category_schema import (
    CourseCategoryCreate,
    CourseCategoryResponse,
)
from app.services.course_category_service import CourseCategoryService


router = APIRouter(
    prefix="/course-categories",
    tags=["Course Categories"]
)


def get_category_service(db: Session = Depends(get_db)):
    repository = CourseCategoryRepository(db)
    return CourseCategoryService(repository)


@router.get("/", response_model=list[CourseCategoryResponse])
def get_categories(service: CourseCategoryService = Depends(get_category_service)):
    return service.get_all_categories()


@router.get("/{category_id}", response_model=CourseCategoryResponse)
def get_category(
    category_id: int,
    service: CourseCategoryService = Depends(get_category_service)
):
    category = service.get_category_by_id(category_id)

    if category is None:
        raise HTTPException(status_code=404, detail="找不到課程分類")

    return category


@router.post("/", response_model=CourseCategoryResponse)
def create_category(
    category_data: CourseCategoryCreate,
    service: CourseCategoryService = Depends(get_category_service)
):
    return service.create_category(category_data)