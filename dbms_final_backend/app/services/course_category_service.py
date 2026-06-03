from app.models.course_category import CourseCategory
from app.repositories.course_category_repository import CourseCategoryRepository
from app.schemas.course_category_schema import CourseCategoryCreate


class CourseCategoryService:
    def __init__(self, repository: CourseCategoryRepository):
        self.repository = repository

    def get_all_categories(self):
        return self.repository.get_all()

    def get_category_by_id(self, category_id: int):
        return self.repository.get_by_id(category_id)

    def create_category(self, category_data: CourseCategoryCreate):
        category = CourseCategory(
            main_type=category_data.main_type,
            sub_type=category_data.sub_type,
        )

        return self.repository.create(category)