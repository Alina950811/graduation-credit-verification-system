from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.credit_check_repository import CreditCheckRepository
from app.schemas.credit_check_schema import (
    CreditCheckResponse,
    CreditCheckSummaryResponse,
)
from app.services.credit_check_service import CreditCheckService
from app.utils.auth import get_current_user_payload

router = APIRouter(
    prefix="/credit-check",
    tags=["Credit Check"]
)


def get_credit_check_service(db: Session = Depends(get_db)):
    repository = CreditCheckRepository(db)
    return CreditCheckService(repository)


@router.get("/students/{student_id}", response_model=CreditCheckResponse)
def check_student_graduation(
    student_id: str,
    service: CreditCheckService = Depends(get_credit_check_service)
):
    result = service.check_student_graduation(student_id)

    if result is None:
        raise HTTPException(status_code=404, detail="找不到學生")

    return result


@router.get("/students/{student_id}/summary", response_model=CreditCheckSummaryResponse)
def get_student_graduation_summary(
    student_id: str,
    service: CreditCheckService = Depends(get_credit_check_service)
):
    result = service.get_graduation_summary(student_id)

    if result is None:
        raise HTTPException(status_code=404, detail="找不到學生")

    return result

@router.get("/me", response_model=CreditCheckResponse)
def check_my_graduation(
    current_user: dict = Depends(get_current_user_payload),
    service: CreditCheckService = Depends(get_credit_check_service)
):
    student_id = current_user["student_id"]

    result = service.check_student_graduation(student_id)

    if result is None:
        raise HTTPException(status_code=404, detail="找不到學生")

    return result


@router.get("/me/summary", response_model=CreditCheckSummaryResponse)
def get_my_graduation_summary(
    current_user: dict = Depends(get_current_user_payload),
    service: CreditCheckService = Depends(get_credit_check_service)
):
    student_id = current_user["student_id"]

    result = service.get_graduation_summary(student_id)

    if result is None:
        raise HTTPException(status_code=404, detail="找不到學生")

    return result