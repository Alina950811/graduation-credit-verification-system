from app.repositories.credit_check_repository import CreditCheckRepository


class CreditCheckService:
    def __init__(self, repository: CreditCheckRepository):
        self.repository = repository

    def check_student_graduation(self, student_id: int):
        student = self.repository.get_student_by_id(student_id)

        if student is None:
            return None

        rules = self.repository.get_rules_by_admission_year(
            student.admission_year
        )

        required_courses = self.repository.get_required_courses_by_admission_year(
            student.admission_year
        )

        passed_course_ids = self.repository.get_passed_course_ids_by_student(
            student.student_id
        )

        # Filter mandatory required courses (一般必修)
        mandatory_required_courses = []
        for rc in required_courses:
            is_mandatory = False
            for mapping in rc.course.category_mappings:
                cat = self.repository.get_category_by_id(mapping.category_id)
                if cat and cat.main_type == "必修" and cat.sub_type == "一般必修":
                    is_mandatory = True
                    break
            if is_mandatory:
                mandatory_required_courses.append(rc)

        missing_courses = []

        for required_course in mandatory_required_courses:
            if required_course.course_id not in passed_course_ids:
                missing_courses.append({
                    "course_id": required_course.course.course_id,
                    "course_name": required_course.course.course_name,
                    "credits": required_course.course.credits
                })

        required_course_check = {
            "required_total": len(mandatory_required_courses),
            "passed_required": len(mandatory_required_courses) - len(missing_courses),
            "missing_required": len(missing_courses),
            "is_passed": len(missing_courses) == 0,
            "missing_courses": missing_courses
        }

        results = []

        for rule in rules:
            passed_records = self.repository.get_passed_records_by_category(
                student_id=student.student_id,
                category_id=rule.category_id
            )

            counted_course_ids = set()
            earned_credits = 0

            for record in passed_records:
                if record.course_id not in counted_course_ids:
                    earned_credits += record.course.credits
                    counted_course_ids.add(record.course_id)

            passed_courses = len(counted_course_ids)

            # Apply credit capping rules based on category ID
            # 6: 中文通識 (max 3), 10: 資訊通識 (max 3)
            # 7: 自然通識 (max 7), 8: 社會通識 (max 7), 9: 人文通識 (max 7)
            # 11: 書院通識 (max 3), 15: 大學英文 (max 6)
            capped_earned_credits = earned_credits
            if rule.category_id in (6, 10, 11):
                capped_earned_credits = min(earned_credits, 3)
            elif rule.category_id in (7, 8, 9):
                capped_earned_credits = min(earned_credits, 7)
            elif rule.category_id == 15:
                capped_earned_credits = min(earned_credits, 6)

            course_passed = True
            credit_passed = True

            if rule.min_courses is not None:
                course_passed = passed_courses >= rule.min_courses

            if rule.min_credits is not None:
                credit_passed = capped_earned_credits >= rule.min_credits

            category = self.repository.get_category_by_id(rule.category_id)

            missing_courses_count = None
            missing_credits = None

            if rule.min_courses is not None:
                missing_courses_count = max(
                    rule.min_courses - passed_courses,
                    0
                )

            if rule.min_credits is not None:
                missing_credits = max(
                    rule.min_credits - capped_earned_credits,
                    0
                )

            results.append({
                "rule_id": rule.rule_id,
                "category_id": rule.category_id,
                "main_type": category.main_type if category else "未知分類",
                "sub_type": category.sub_type if category else None,

                "required_courses": rule.min_courses,
                "passed_courses": passed_courses,
                "missing_courses_count": missing_courses_count,

                "required_credits": rule.min_credits,
                "earned_credits": capped_earned_credits,
                "missing_credits": missing_credits,

                "is_passed": course_passed and credit_passed
            })

        # Check Core GE Rule (At least 2 different categories of core GE courses, min 6 credits)
        core_nature_records = self.repository.get_passed_records_by_category(student.student_id, 12)
        core_social_records = self.repository.get_passed_records_by_category(student.student_id, 13)
        core_humanity_records = self.repository.get_passed_records_by_category(student.student_id, 14)

        core_nature_ids = {r.course_id for r in core_nature_records}
        core_social_ids = {r.course_id for r in core_social_records}
        core_humanity_ids = {r.course_id for r in core_humanity_records}

        passed_core_categories = 0
        if core_nature_ids: passed_core_categories += 1
        if core_social_ids: passed_core_categories += 1
        if core_humanity_ids: passed_core_categories += 1

        total_core_courses = len(core_nature_ids | core_social_ids | core_humanity_ids)
        core_ge_passed = (passed_core_categories >= 2) and (total_core_courses >= 2)

        core_ge_check = {
            "is_passed": core_ge_passed,
            "passed_categories": passed_core_categories,
            "total_core_courses": total_core_courses
        }

        return {
            "student_id": student.student_id,
            "admission_year": student.admission_year,
            "required_course_check": required_course_check,
            "results": results,
            "core_ge_check": core_ge_check
        }

    def get_graduation_summary(self, student_id: int):
        check_result = self.check_student_graduation(student_id)

        if check_result is None:
            return None

        results = check_result["results"]
        required_course_check = check_result["required_course_check"]

        total_rules = len(results) + 1
        passed_rules = 0

        if required_course_check["is_passed"]:
            passed_rules += 1

        for result in results:
            if result["is_passed"]:
                passed_rules += 1

        failed_rules = total_rules - passed_rules
        progress_percent = round((passed_rules / total_rules) * 100, 2)

        return {
            "student_id": check_result["student_id"],
            "total_rules": total_rules,
            "passed_rules": passed_rules,
            "failed_rules": failed_rules,
            "progress_percent": progress_percent,
            "is_graduation_ready": failed_rules == 0
        }