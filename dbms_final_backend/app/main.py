from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.student_router import router as student_router
from app.routers.course_router import router as course_router
from app.routers.student_course_record_router import router as record_router
from app.routers.course_category_router import router as category_router
from app.routers.course_category_mapping_router import router as mapping_router
from app.routers.graduation_rule_router import router as graduation_rule_router
from app.routers.credit_check_router import router as credit_check_router
from app.routers.auth_router import router as auth_router
from app.routers.required_course_router import router as required_course_router
from app.routers.recommendation_router import router as recommendation_router

app = FastAPI(
    title="Graduation Credit Verification System",
    description="畢業學分檢核系統後端 API",
    version="0.1.0"
)

# CORS middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student_router)
app.include_router(course_router)
app.include_router(record_router)
app.include_router(category_router)
app.include_router(mapping_router)
app.include_router(graduation_rule_router)
app.include_router(credit_check_router)
app.include_router(auth_router)
app.include_router(required_course_router)
app.include_router(recommendation_router)

@app.get("/")
def root():
    return {
        "message": "Graduation Credit Verification System API is running"
    }