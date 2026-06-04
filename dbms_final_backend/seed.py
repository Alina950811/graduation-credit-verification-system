# seed.py
import sys
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.database import SessionLocal, engine, Base
from app.models.student import Student
from app.models.user import User
from app.models.course import Course
from app.models.course_category import CourseCategory
from app.models.course_category_mapping import CourseCategoryMapping
from app.models.graduation_rule import GraduationRule
from app.models.required_course import RequiredCourse
from app.models.student_course_record import StudentCourseRecord

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    # Make sure tables exist
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

    db: Session = SessionLocal()
    try:
        # Clear existing data to allow full reset and clean state
        print("Clearing existing data from tables...")
        db.query(StudentCourseRecord).delete()
        db.query(CourseCategoryMapping).delete()
        db.query(RequiredCourse).delete()
        db.query(GraduationRule).delete()
        db.query(CourseCategory).delete()
        db.query(User).delete()
        db.query(Student).delete()
        db.query(Course).delete()
        db.commit()
        print("Data cleared successfully.")

        # 1. Seed Student Profile
        student_id = "110306078"
        student = db.query(Student).filter(Student.student_id == student_id).first()
        if not student:
            student = Student(
                student_id=student_id,
                name="聖結石",
                admission_year=110,
                department="資訊科學系 (Computer Science)"
            )
            db.add(student)
            db.flush()
            print(f"Student {student.name} created.")
        else:
            print("Student already exists.")

        # 2. Seed User Login
        user = db.query(User).filter(User.username == student_id).first()
        if not user:
            user = User(
                student_id=student_id,
                username=student_id,
                password_hash=pwd_context.hash("password123")
            )
            db.add(user)
            db.flush()
            print(f"User for {student_id} created (password: password123).")
        else:
            print("User already exists.")

        # 3. Seed Course Categories
        # IDs: 1: 必修, 2: 選修, 3: 通識, 4: 體育, 5: 英文
        categories_data = [
            (1, "必修", None),
            (2, "選修", None),
            (3, "通識", None),
            (4, "體育", None),
            (5, "英文", None)
        ]
        
        for cat_id, main, sub in categories_data:
            cat = db.query(CourseCategory).filter(CourseCategory.category_id == cat_id).first()
            if not cat:
                cat = CourseCategory(category_id=cat_id, main_type=main, sub_type=sub)
                db.add(cat)
                print(f"Category {main} added.")
        db.flush()

        # 4. Seed Graduation Rules for Year 110
        # Category rules:
        # Rule 1: Category 2 (選修) min_credits=18
        # Rule 2: Category 3 (通識) min_credits=28
        # Rule 3: Category 4 (體育) min_courses=4
        # Rule 4: Category 5 (英文) min_credits=3
        rules_data = [
            (2, None, 18), # 選修
            (3, None, 28), # 通識
            (4, 4, None),  # 體育 (4 courses)
            (5, None, 3)   # 英文
        ]
        
        for cat_id, min_c, min_cr in rules_data:
            rule = db.query(GraduationRule).filter(
                GraduationRule.admission_year == 110,
                GraduationRule.category_id == cat_id
            ).first()
            if not rule:
                rule = GraduationRule(
                    admission_year=110,
                    category_id=cat_id,
                    min_courses=min_c,
                    min_credits=min_cr
                )
                db.add(rule)
                print(f"Graduation rule for Category ID {cat_id} added.")
        db.flush()

        # 5. Seed Course listings and Category Mappings
        # We need to populate courses and link them to categories
        courses_to_seed = [
            # Core required courses
            ("703001001", "計算機概論 (Introduction to CS)", 3, 1),
            ("703002001", "微積分甲 (Calculus I)", 4, 1),
            ("000101001", "大學英文 (Freshman English)", 3, 5),
            ("000311020", "通識：自然科學與生命體驗", 2, 3),
            ("000201001", "體育 (健康體能)", 0, 4),
            ("703003001", "程式設計 (Programming Guilds)", 3, 1),
            ("703004001", "線性代數 (Linear Algebra)", 3, 1),
            ("000315011", "通識：歷史與多元社會", 2, 3),
            ("000102001", "大學中文 (Freshman Chinese)", 3, 1),
            ("000202001", "體育 (桌球)", 0, 4),
            ("703005001", "資料結構 (Data Structures)", 3, 1),
            ("703006001", "離散數學 (Discrete Mathematics)", 3, 1),
            ("703007001", "數位系統設計 (Digital Systems)", 3, 1),
            ("703021001", "專業選修：虛擬實境導論", 3, 2),
            ("000318041", "通識：藝術與媒體美學", 3, 3),
            ("703008001", "演算法 (Algorithms)", 3, 1),
            ("703009001", "作業系統 (Operating Systems)", 3, 1),
            ("703022001", "專業選修：資料庫系統原理", 3, 2),
            ("000312015", "通識：憲政法治與人權", 3, 3),
            ("000203001", "體育 (太極拳)", 0, 4),
            ("703010001", "計算機組織 (Computer Architecture)", 3, 1),
            ("703023001", "專業選修：人工智慧導論", 3, 2),
            ("703024001", "專業選修：網頁前端開發技術", 3, 2),
            ("000314052", "通識：哲學思辨與永續生活", 3, 3),
            ("000204001", "體育 (網球)", 0, 4),
            ("703011001", "軟體工程 (Software Engineering)", 3, 1),
            ("703025001", "專業選修：熱門機器學習實務", 3, 2),
            ("703026001", "專業選修：雲端運算與系統架構", 3, 2),
            ("000320011", "通識：跨文化溝通專題", 2, 3),
            ("703027001", "專業選修：物聯網感知技術", 3, 2),
            ("703028001", "專業選修：巨量資料分析", 3, 2),
            ("703012002", "微積分甲 (Calculus II)", 4, 1),
            ("703013002", "物件導向程式設計 (Object-Oriented Programming)", 3, 1),
            ("000325001", "通識：現代生物學與生物技術", 3, 3),
            ("703014002", "機率與統計 (Probability & Statistics)", 3, 1),
            ("703015002", "數位系統設計實驗 (Digital Systems Lab)", 1, 1),
            ("000326001", "通識：民主路上的法律思辨", 3, 3),
            ("703016002", "系統程式 (System Programming)", 3, 1),
            ("000327001", "通識：臺灣歷史與文化", 3, 3),
            ("703017002", "資訊科學專題(一) (CS Project I)", 1, 1),
            ("703030002", "資訊科學專題(二) (CS Project II)", 1, 2),
            ("000328001", "通識：基礎日語一", 2, 3),
            # Missing core required courses (recommendation candidates)
            ("703013001", "計算機網路 (Computer Networks)", 3, 1),
            ("703014001", "編譯器設計 (Compiler Design)", 3, 1),
            # Recommendation candidates
            ("703056002", "巨量資料分析與應用 (Big Data Analytics)", 3, 2),
            ("000317024", "通識：全球科技革命與人類文明", 2, 3),
            ("703058001", "區塊鏈與去中心化應用 (Blockchain & dApps)", 3, 2),
        ]

        for course_id, name, credits, cat_id in courses_to_seed:
            course = db.query(Course).filter(Course.course_id == course_id).first()
            if not course:
                course = Course(course_id=course_id, course_name=name, credits=credits)
                db.add(course)
                db.flush()
                print(f"Course {name} created.")
            
            # Map course to category
            mapping = db.query(CourseCategoryMapping).filter(
                CourseCategoryMapping.course_id == course_id,
                CourseCategoryMapping.category_id == cat_id
            ).first()
            if not mapping:
                mapping = CourseCategoryMapping(course_id=course_id, category_id=cat_id)
                db.add(mapping)
                print(f"Mapped {name} to Category ID {cat_id}.")
        db.flush()

        # 6. Seed Required Compulsory Courses for Admission Year 110
        # In the checklist, there are 19 core courses that make up 58 credits total
        required_course_ids = [
            "703001001", "703002001", "703003001", "703004001",
            "703005001", "703006001", "703007001", "703008001",
            "703009001", "703010001", "703011001", "703012002",
            "703013002", "703014002", "703015002", "703016002",
            "703017002", "703013001", "703014001"
        ]
        
        for course_id in required_course_ids:
            rc = db.query(RequiredCourse).filter(
                RequiredCourse.admission_year == 110,
                RequiredCourse.course_id == course_id
            ).first()
            if not rc:
                rc = RequiredCourse(admission_year=110, course_id=course_id)
                db.add(rc)
                print(f"Added RequiredCourse {course_id} for year 110.")
        db.flush()

        # 7. Seed Student Course Records (excluding calculation network & compilers to simulate missing 2 courses)
        # We will populate student's grades from freshman to senior year (110-1 to 112-2)
        records_data = [
            # Semester, Course ID, Grade, IsPassed
            ("110學年度第一學期", "703001001", 85, True), # A
            ("110學年度第一學期", "703002001", 77, True), # B+
            ("110學年度第一學期", "000101001", 80, True), # A-
            ("110學年度第一學期", "000311020", 75, True), # Pass/75
            ("110學年度第一學期", "000201001", 92, True), # PE Pass
            
            ("110學年度第二學期", "703003001", 90, True), # A+
            ("110學年度第二學期", "703004001", 73, True), # B
            ("110學年度第二學期", "000315011", 85, True), # A
            ("110學年度第二學期", "000102001", 70, True), # B-
            ("110學年度第二學期", "000202001", 88, True), # PE Pass
            ("110學年度第二學期", "703012002", 82, True), # A-
            ("110學年度第二學期", "703013002", 85, True), # A
            ("110學年度第二學期", "000325001", 85, True), # A
            
            ("111學年度第一學期", "703005001", 77, True), # B+
            ("111學年度第一學期", "703006001", 68, True), # C+
            ("111學年度第一學期", "703007001", 82, True),
            ("111學年度第一學期", "703021001", 85, True), # VR (Elective)
            ("111學年度第一學期", "000318041", 75, True), # Art
            ("111學年度第一學期", "703014002", 73, True), # Prob
            ("111學年度第一學期", "703015002", 85, True), # Digital Lab
            ("111學年度第一學期", "000326001", 77, True),
            
            ("111學年度第二學期", "703008001", 80, True), # Algo
            ("111學年度第二學期", "703009001", 60, True), # OS
            ("111學年度第二學期", "703022001", 73, True), # DB (Elective)
            ("111學年度第二學期", "000312015", 75, True),
            ("111學年度第二學期", "000203001", 90, True), # PE Pass
            ("111學年度第二學期", "703016002", 70, True), # SysProg
            ("111學年度第二學期", "000327001", 80, True),
            
            ("112學年度第一學期", "703010001", 70, True), # Comp Architecture
            ("112學年度第一學期", "703023001", 90, True), # AI (Elective)
            ("112學年度第一學期", "703024001", 85, True), # Web (Elective)
            ("112學年度第一學期", "000314052", 75, True),
            ("112學年度第一學期", "000204001", 85, True), # PE Pass
            ("112學年度第一學期", "703017002", 80, True), # CS Project I
            ("112學年度第一學期", "703030002", 85, True), # CS Project II (Elective)
            ("112學年度第一學期", "000328001", 75, True),
            
            ("112學年度第二學期", "703011001", 80, True), # SoftEng
            ("112學年度第二學期", "703025001", 85, True), # ML (Elective)
            ("112學年度第二學期", "703026001", 77, True), # Cloud (Elective)
            ("112學年度第二學期", "000320011", 85, True),
            ("112學年度第二學期", "703027001", 80, True), # IoT (Elective)
            ("112學年度第二學期", "703028001", 77, True), # BigData (Elective)
        ]

        for sem, course_id, grade, passed in records_data:
            rec = db.query(StudentCourseRecord).filter(
                StudentCourseRecord.student_id == student_id,
                StudentCourseRecord.course_id == course_id
            ).first()
            if not rec:
                rec = StudentCourseRecord(
                    student_id=student_id,
                    course_id=course_id,
                    semester=sem,
                    grade=grade,
                    is_passed=passed
                )
                db.add(rec)
                print(f"Added Course Record for {course_id} in {sem}.")
        
        db.commit()
        print("Database seeded successfully with all matching data!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed()
