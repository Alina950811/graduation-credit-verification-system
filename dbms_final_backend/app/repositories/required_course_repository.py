from sqlalchemy.orm import Session

from app.models.required_course import RequiredCourse


class RequiredCourseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(RequiredCourse).all()

    def get_by_admission_year(self, admission_year: int):
        return (
            self.db.query(RequiredCourse)
            .filter(RequiredCourse.admission_year == admission_year)
            .all()
        )

    def create(self, required_course: RequiredCourse):
        self.db.add(required_course)
        self.db.commit()
        self.db.refresh(required_course)
        return required_course