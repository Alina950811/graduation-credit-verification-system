from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.course_category_mapping_repository import CourseCategoryMappingRepository
from app.schemas.course_category_mapping_schema import (
    CourseCategoryMappingCreate,
    CourseCategoryMappingResponse,
)
from app.services.course_category_mapping_service import CourseCategoryMappingService


router = APIRouter(
    prefix="/course-category-mappings",
    tags=["Course Category Mappings"]
)


def get_mapping_service(db: Session = Depends(get_db)):
    repository = CourseCategoryMappingRepository(db)
    return CourseCategoryMappingService(repository)


@router.get("/", response_model=list[CourseCategoryMappingResponse])
def get_mappings(service: CourseCategoryMappingService = Depends(get_mapping_service)):
    return service.get_all_mappings()


@router.post("/", response_model=CourseCategoryMappingResponse)
def create_mapping(
    mapping_data: CourseCategoryMappingCreate,
    service: CourseCategoryMappingService = Depends(get_mapping_service)
):
    return service.create_mapping(mapping_data)