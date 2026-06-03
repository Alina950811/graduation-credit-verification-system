from sqlalchemy.orm import Session

from app.models.course import Course


class CourseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(Course).all()

    def get_by_id(self, course_id: str):
        return (
            self.db.query(Course)
            .filter(Course.course_id == course_id)
            .first()
        )

    def create(self, course: Course):
        self.db.add(course)
        self.db.commit()
        self.db.refresh(course)
        return course