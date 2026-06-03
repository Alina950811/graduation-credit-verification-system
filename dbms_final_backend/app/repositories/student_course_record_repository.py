from sqlalchemy.orm import Session

from app.models.course import Course
from app.models.student_course_record import StudentCourseRecord


class StudentCourseRecordRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(StudentCourseRecord).all()

    def get_by_student_id(self, student_id: str):
        return (
            self.db.query(StudentCourseRecord)
            .filter(StudentCourseRecord.student_id == student_id)
            .all()
        )

    def get_course_by_id(self, course_id: str):
        return (
            self.db.query(Course)
            .filter(Course.course_id == course_id)
            .first()
        )

    def create_course(self, course: Course):
        self.db.add(course)
        self.db.flush()
        return course

    def create(self, record: StudentCourseRecord):
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def create_many(self, records: list[StudentCourseRecord]):
        self.db.add_all(records)
        self.db.commit()

        for record in records:
            self.db.refresh(record)

        return records

    def delete(self, record_id: int, student_id: str):
        record = (
            self.db.query(StudentCourseRecord)
            .filter(StudentCourseRecord.record_id == record_id)
            .filter(StudentCourseRecord.student_id == student_id)
            .first()
        )
        if record:
            self.db.delete(record)
            self.db.commit()
            return True
        return False