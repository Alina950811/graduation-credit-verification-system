from sqlalchemy.orm import Session

from app.models.course_category_mapping import CourseCategoryMapping


class CourseCategoryMappingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(CourseCategoryMapping).all()

    def create(self, mapping: CourseCategoryMapping):
        self.db.add(mapping)
        self.db.commit()
        self.db.refresh(mapping)
        return mapping