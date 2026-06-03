from app.models.course_category_mapping import CourseCategoryMapping
from app.repositories.course_category_mapping_repository import CourseCategoryMappingRepository
from app.schemas.course_category_mapping_schema import CourseCategoryMappingCreate


class CourseCategoryMappingService:
    def __init__(self, repository: CourseCategoryMappingRepository):
        self.repository = repository

    def get_all_mappings(self):
        return self.repository.get_all()

    def create_mapping(self, mapping_data: CourseCategoryMappingCreate):
        mapping = CourseCategoryMapping(
            course_id=mapping_data.course_id,
            category_id=mapping_data.category_id,
        )

        return self.repository.create(mapping)