from sqlalchemy.orm import Session

from app.models.graduation_rule import GraduationRule


class GraduationRuleRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self):
        return self.db.query(GraduationRule).all()

    def get_by_id(self, rule_id: int):
        return (
            self.db.query(GraduationRule)
            .filter(GraduationRule.rule_id == rule_id)
            .first()
        )

    def get_by_admission_year(self, admission_year: int):
        return (
            self.db.query(GraduationRule)
            .filter(GraduationRule.admission_year == admission_year)
            .all()
        )

    def create(self, rule: GraduationRule):
        self.db.add(rule)
        self.db.commit()
        self.db.refresh(rule)
        return rule