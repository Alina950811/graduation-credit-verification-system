from sqlalchemy.orm import Session
from sqlalchemy import select, func, Integer
from typing import List
from app.models.student import Student
from app.models.student_course_record import StudentCourseRecord
from app.models.course import Course
from app.models.course_category_mapping import CourseCategoryMapping
from app.models.graduation_rule import GraduationRule
from app.schemas.recommendation import RecommendedCourse

class RecommendationService:
    def __init__(self, db: Session):
        self.db = db

    def get_recommendations(self, student_id: str) -> List[RecommendedCourse]:
        # 1. 取得學生入學年份
        student = self.db.scalars(
            select(Student).where(Student.student_id == student_id)
        ).first()
        if not student:
            return []

        # 2. 找出學生「已通過」的各類別學分總和
        passed_credits = self.db.execute(
            select(
                CourseCategoryMapping.category_id,
                func.sum(Course.credits).label("earned_credits")
            )
            .join(StudentCourseRecord, StudentCourseRecord.course_id == CourseCategoryMapping.course_id)
            .join(Course, Course.course_id == CourseCategoryMapping.course_id)
            .where(
                StudentCourseRecord.student_id == student_id,
                StudentCourseRecord.is_passed == True
            )
            .group_by(CourseCategoryMapping.category_id)
        ).all()
        earned_dict = {row.category_id: row.earned_credits for row in passed_credits}

        # 3. 比對畢業規則，找出「缺漏學分」的類別
        rules = self.db.scalars(
            select(GraduationRule).where(GraduationRule.admission_year == student.admission_year)
        ).all()
        
        missing_categories = []
        for rule in rules:
            earned = earned_dict.get(rule.category_id, 0)
            if rule.min_credits and earned < rule.min_credits: #如果不符合畢業條件
                missing_categories.append(rule.category_id)

        if not missing_categories:
            # Check if total credits is less than 128
            # Sum up required (1), elective (2), general (3), and english (5) earned credits
            total_earned = sum(earned_dict.get(cat_id, 0) for cat_id in [1, 2, 3, 5])
            if total_earned < 128:
                # Still need general or elective courses to make up the 128 total
                missing_categories = [2, 3]
            else:
                return [] # 已滿足畢業條件

        # 4. 計算所有課程的同儕通過率 (通過人數 / 總修課人數)
        peer_stats = self.db.execute(
            select(
                StudentCourseRecord.course_id,
                func.count(StudentCourseRecord.record_id).label("total_attempts"),
                func.sum(func.cast(StudentCourseRecord.is_passed, Integer)).label("passed_attempts")
            )
            .group_by(StudentCourseRecord.course_id)
        ).all()
        
        # 建立通過率對照表
        pass_rate_map = {}
        for stat in peer_stats:
            rate = (stat.passed_attempts / stat.total_attempts) if stat.total_attempts > 0 else 0
            pass_rate_map[stat.course_id] = round(rate, 2)

        # 5. 撈出符合缺漏類別，且學生尚未通過的候選課程
        already_passed_subquery = select(StudentCourseRecord.course_id).where(
            StudentCourseRecord.student_id == student_id,
            StudentCourseRecord.is_passed == True
        )

        candidate_courses = self.db.execute(
            select(Course, CourseCategoryMapping.category_id)
            .join(CourseCategoryMapping, CourseCategoryMapping.course_id == Course.course_id)
            .where(
                CourseCategoryMapping.category_id.in_(missing_categories),
                Course.course_id.not_in(already_passed_subquery)
            )
        ).all()

        # 6. 計算最終推薦權重並排序
        recommendations = []
        for course, category_id in candidate_courses:
            peer_rate = pass_rate_map.get(course.course_id, 0.5) # 若無人修過，預設給予 0.5
            
            # 將通過率轉換為 1 (爽課) 或 0 (硬課)
            score = self._calculate_weight(peer_rate)

            recommendations.append(
                RecommendedCourse(
                    course_id=course.course_id,
                    course_name=course.course_name,
                    category_id=category_id,
                    credits=course.credits,
                    peer_pass_rate=peer_rate,
                    recommendation_score=score
                )
            )

        # 雙重條件排序：
        # 條件一：-x.recommendation_score (把 1 變成 -1, 0 變成 0。-1 排在 0 前面，確保爽課在上)
        # 條件二：x.course_id (若同為爽課或同為硬課，則依照課號 A-Z 或數字由小到大排列)
        recommendations.sort(key=lambda x: (-x.recommendation_score, x.course_id))
        
        return recommendations

    def _calculate_weight(self, pass_rate: float) -> float:
        """
        獨立的權重計算模組：
        若通過率 >= 60% (0.6)，判定為爽課 (1)
        若通過率 < 60%，判定為硬課 (0)
        """
        return 1.0 if pass_rate >= 0.6 else 0.0