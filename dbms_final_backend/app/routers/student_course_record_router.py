from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app.repositories.student_course_record_repository import StudentCourseRecordRepository
from app.schemas.student_course_record_schema import (
    StudentCourseRecordCreate,
    StudentCourseRecordResponse,
)
from app.services.student_course_record_service import StudentCourseRecordService
from app.utils.auth import get_current_user_payload
router = APIRouter(
    prefix="/student-course-records",
    tags=["Student Course Records"]
)


def get_record_service(db: Session = Depends(get_db)):
    repository = StudentCourseRecordRepository(db)
    return StudentCourseRecordService(repository)


@router.get("/", response_model=list[StudentCourseRecordResponse])
def get_records(service: StudentCourseRecordService = Depends(get_record_service)):
    return service.get_all_records()


@router.get("/student/{student_id}", response_model=list[StudentCourseRecordResponse])
def get_records_by_student(
    student_id: str,
    service: StudentCourseRecordService = Depends(get_record_service)
):
    return service.get_records_by_student_id(student_id)


@router.post("/", response_model=StudentCourseRecordResponse)
def create_record(
    record_data: StudentCourseRecordCreate,
    service: StudentCourseRecordService = Depends(get_record_service)
):
    return service.create_record(record_data)


@router.get("/me", response_model=list[StudentCourseRecordResponse])
def get_my_records(
    current_user: dict = Depends(get_current_user_payload),
    service: StudentCourseRecordService = Depends(get_record_service)
):
    student_id = current_user["student_id"]

    return service.get_records_by_student_id(student_id)


@router.post("/upload")
async def upload_my_records(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user_payload),
    service: StudentCourseRecordService = Depends(get_record_service)
):
    if not file.filename.endswith(".json"):
        raise HTTPException(status_code=400, detail="請上傳 JSON 檔案")

    content = await file.read()
    json_content = content.decode("utf-8-sig")

    student_id = current_user["student_id"]

    records, error = service.upload_records_from_school_json(
        student_id=student_id,
        json_content=json_content
    )

    if error is not None:
        raise HTTPException(status_code=400, detail=error)

    return {
        "message": "學校修課資料上傳成功",
        "count": len(records)
    }


@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    current_user: dict = Depends(get_current_user_payload),
    service: StudentCourseRecordService = Depends(get_record_service)
):
    success = service.delete_record(record_id, current_user["student_id"])
    if not success:
        raise HTTPException(status_code=404, detail="找不到修課紀錄")
    return {"message": "刪除成功"}