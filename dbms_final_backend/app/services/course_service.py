from app.models.course import Course
from app.repositories.course_repository import CourseRepository
from app.schemas.course_schema import CourseCreate


class CourseService:
    def __init__(self, repository: CourseRepository):
        self.repository = repository

    def get_all_courses(self):
        return self.repository.get_all()

    def get_course_by_id(self, course_id: str):
        return self.repository.get_by_id(course_id)

    def create_course(self, course_data: CourseCreate):
        course = Course(
            course_id=course_data.course_id,
            course_name=course_data.course_name,
            credits=course_data.credits,
            taught_by=course_data.taught_by,
        )

        return self.repository.create(course)