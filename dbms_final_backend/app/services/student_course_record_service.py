import json

from app.models.course import Course
from app.models.student_course_record import StudentCourseRecord
from app.repositories.student_course_record_repository import StudentCourseRecordRepository
from app.schemas.student_course_record_schema import StudentCourseRecordCreate


class StudentCourseRecordService:
    def __init__(self, repository: StudentCourseRecordRepository):
        self.repository = repository

    def get_all_records(self):
        return self.repository.get_all()

    def get_records_by_student_id(self, student_id: int):
        return self.repository.get_by_student_id(student_id)

    def create_record(self, record_data: StudentCourseRecordCreate):
        record = StudentCourseRecord(
            student_id=record_data.student_id,
            course_id=record_data.course_id,
            semester=record_data.semester,
            grade=record_data.grade,
            is_passed=record_data.is_passed,
        )

        return self.repository.create(record)

    def parse_score(self, score_text: str):
        """
        將學校 JSON 裡的 score 轉成整數成績。
        如果是「停修」或「成績未到或無成績」，就回傳 None。
        """
        try:
            return int(float(score_text))
        except (ValueError, TypeError):
            return None

    def is_course_passed(self, score_text: str, score_if_pass: str):
        """
        判斷是否通過課程。
        目前規則：
        1. scoreIfPass == "No" → 不通過
        2. score 可以轉成數字且 >= 60 → 通過
        3. 停修 / 成績未到 / 無法轉數字 → 不通過
        """
        if score_if_pass == "No":
            return False

        score = self.parse_score(score_text)

        if score is None:
            return False

        return score >= 60

    def parse_school_json_records(self, json_content: str):
        """
        解析學校匯出的 JSON，只抓我們需要的 GradeRecords。
        """
        data = json.loads(json_content)

        learning_data = data[0]["課業學習"]
        grade_record_list = learning_data["gradeRecordList"]

        parsed_records = []

        for year_block in grade_record_list:
            grade_records = year_block["GradeRecords"]

            for item in grade_records:
                parsed_records.append({
                    "course_id": item["courseCode"],
                    "course_name": item["courseName"],
                    "credits": int(float(item["credit"])),
                    "semester": item["academicYearSemester"],
                    "grade": self.parse_score(item["score"]),
                    "is_passed": self.is_course_passed(
                        score_text=item["score"],
                        score_if_pass=item.get("scoreIfPass", "")
                    )
                })

        return parsed_records
    

    def upload_records_from_school_json(self, student_id: str, json_content: str):
        parsed_records = self.parse_school_json_records(json_content)

        records = []

        for item in parsed_records:
            course = self.repository.get_course_by_id(item["course_id"])

            if course is None:
                course = Course(
                    course_id=item["course_id"],
                    course_name=item["course_name"],
                    credits=item["credits"],
                    taught_by=None
                )

                self.repository.create_course(course)

            record = StudentCourseRecord(
                student_id=student_id,
                course_id=item["course_id"],
                semester=item["semester"],
                grade=item["grade"],
                is_passed=item["is_passed"]
            )

            records.append(record)

        created_records = self.repository.create_many(records)

        return created_records, None

    def delete_record(self, record_id: int, student_id: str):
        return self.repository.delete(record_id, student_id)