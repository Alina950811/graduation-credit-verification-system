from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.student_course_record import StudentCourseRecord
from app.models.course import Course
from app.models.course_category import CourseCategory
from app.models.course_category_mapping import CourseCategoryMapping
from app.models.graduation_rule import GraduationRule
from app.models.required_course import RequiredCourse


class CreditCheckRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_student_by_id(self, student_id: str):
        return (
            self.db.query(Student)
            .filter(Student.student_id == student_id)
            .first()
        )

    def get_rules_by_admission_year(self, admission_year: int):
        return (
            self.db.query(GraduationRule)
            .filter(GraduationRule.admission_year == admission_year)
            .all()
        )

    def get_passed_records_by_category(self, student_id: str, category_id: int):
        return (
            self.db.query(StudentCourseRecord)
            .join(Course, StudentCourseRecord.course_id == Course.course_id)
            .join(
                CourseCategoryMapping,
                Course.course_id == CourseCategoryMapping.course_id
            )
            .filter(StudentCourseRecord.student_id == student_id)
            .filter(StudentCourseRecord.is_passed == True)
            .filter(CourseCategoryMapping.category_id == category_id)
            .all()
        )

    def get_required_courses_by_admission_year(self, admission_year: int):
        return (
            self.db.query(RequiredCourse)
            .filter(RequiredCourse.admission_year == admission_year)
            .all()
        )

    def get_passed_course_ids_by_student(self, student_id: str):
        records = (
            self.db.query(StudentCourseRecord)
            .filter(StudentCourseRecord.student_id == student_id)
            .filter(StudentCourseRecord.is_passed == True)
            .all()
        )

        return {record.course_id for record in records}

    def get_category_by_id(self, category_id: int):
        return (
            self.db.query(CourseCategory)
            .filter(CourseCategory.category_id == category_id)
            .first()
        )