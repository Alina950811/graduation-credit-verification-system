from app.models.student import Student
from app.repositories.student_repository import StudentRepository
from app.schemas.student_schema import StudentCreate


class StudentService:
    def __init__(self, repository: StudentRepository):
        self.repository = repository

    def get_all_students(self):
        return self.repository.get_all()

    def get_student_by_id(self, student_id: str):
        return self.repository.get_by_id(student_id)

    def create_student(self, student_data: StudentCreate):
        student = Student(
            student_id=student_data.student_id,
            name=student_data.name,
            admission_year=student_data.admission_year,
            department=student_data.department,
        )

        return self.repository.create(student)