from sqlalchemy.orm import Session

from app.models.course_category import CourseCategory


class CourseCategoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(CourseCategory).all()

    def get_by_id(self, category_id: int):
        return (
            self.db.query(CourseCategory)
            .filter(CourseCategory.category_id == category_id)
            .first()
        )

    def create(self, category: CourseCategory):
        self.db.add(category)
        self.db.commit()
        self.db.refresh(category)
        return category