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

        missing_courses = []

        for required_course in required_courses:
            if required_course.course_id not in passed_course_ids:
                missing_courses.append({
                    "course_id": required_course.course.course_id,
                    "course_name": required_course.course.course_name,
                    "credits": required_course.course.credits
                })

        required_course_check = {
            "required_total": len(required_courses),
            "passed_required": len(required_courses) - len(missing_courses),
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

            course_passed = True
            credit_passed = True

            if rule.min_courses is not None:
                course_passed = passed_courses >= rule.min_courses

            if rule.min_credits is not None:
                credit_passed = earned_credits >= rule.min_credits

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
                    rule.min_credits - earned_credits,
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
                "earned_credits": earned_credits,
                "missing_credits": missing_credits,

                "is_passed": course_passed and credit_passed
            })

        return {
            "student_id": student.student_id,
            "admission_year": student.admission_year,
            "required_course_check": required_course_check,
            "results": results
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