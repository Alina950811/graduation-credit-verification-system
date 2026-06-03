from app.models.required_course import RequiredCourse
from app.repositories.required_course_repository import RequiredCourseRepository
from app.schemas.required_course_schema import RequiredCourseCreate


class RequiredCourseService:
    def __init__(self, repository: RequiredCourseRepository):
        self.repository = repository

    def get_all_required_courses(self):
        return self.repository.get_all()

    def get_required_courses_by_admission_year(self, admission_year: int):
        return self.repository.get_by_admission_year(admission_year)

    def create_required_course(self, required_course_data: RequiredCourseCreate):
        required_course = RequiredCourse(
            admission_year=required_course_data.admission_year,
            course_id=required_course_data.course_id
        )

        return self.repository.create(required_course)