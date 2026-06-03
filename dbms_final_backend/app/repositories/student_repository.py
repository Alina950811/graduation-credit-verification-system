from sqlalchemy.orm import Session

from app.models.student import Student


class StudentRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Student).all()

    def get_by_id(self, student_id: str):
        return (
            self.db.query(Student)
            .filter(Student.student_id == student_id)
            .first()
        )

    def create(self, student: Student):
        self.db.add(student)
        self.db.commit()
        self.db.refresh(student)
        return student