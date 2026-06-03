# 暫時工具
from app.database import Base, engine
from app.models import (
    Student,
    User,
    Course,
    StudentCourseRecord,
    CourseCategory,
    CourseCategoryMapping,
    GraduationRule,
    RequiredCourse,
)


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("資料表建立完成")


if __name__ == "__main__":
    create_tables()