from app.models.graduation_rule import GraduationRule
from app.repositories.graduation_rule_repository import GraduationRuleRepository
from app.schemas.graduation_rule_schema import GraduationRuleCreate


class GraduationRuleService:
    def __init__(self, repository: GraduationRuleRepository):
        self.repository = repository

    def get_all_rules(self):
        return self.repository.get_all()

    def get_rule_by_id(self, rule_id: int):
        return self.repository.get_by_id(rule_id)

    def get_rules_by_admission_year(self, admission_year: int):
        return self.repository.get_by_admission_year(admission_year)

    def create_rule(self, rule_data: GraduationRuleCreate):
        rule = GraduationRule(
            admission_year=rule_data.admission_year,
            category_id=rule_data.category_id,
            min_courses=rule_data.min_courses,
            min_credits=rule_data.min_credits,
        )

        return self.repository.create(rule)