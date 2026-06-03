from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.graduation_rule_repository import GraduationRuleRepository
from app.schemas.graduation_rule_schema import (
    GraduationRuleCreate,
    GraduationRuleResponse,
)
from app.services.graduation_rule_service import GraduationRuleService


router = APIRouter(
    prefix="/graduation-rules",
    tags=["Graduation Rules"]
)


def get_rule_service(db: Session = Depends(get_db)):
    repository = GraduationRuleRepository(db)
    return GraduationRuleService(repository)


@router.get("/", response_model=list[GraduationRuleResponse])
def get_rules(service: GraduationRuleService = Depends(get_rule_service)):
    return service.get_all_rules()


@router.get("/{rule_id}", response_model=GraduationRuleResponse)
def get_rule(
    rule_id: int,
    service: GraduationRuleService = Depends(get_rule_service)
):
    rule = service.get_rule_by_id(rule_id)

    if rule is None:
        raise HTTPException(status_code=404, detail="找不到畢業規則")

    return rule


@router.get("/year/{admission_year}", response_model=list[GraduationRuleResponse])
def get_rules_by_year(
    admission_year: int,
    service: GraduationRuleService = Depends(get_rule_service)
):
    return service.get_rules_by_admission_year(admission_year)


@router.post("/", response_model=GraduationRuleResponse)
def create_rule(
    rule_data: GraduationRuleCreate,
    service: GraduationRuleService = Depends(get_rule_service)
):
    return service.create_rule(rule_data)