import axios from 'axios';
import { CourseRecord, GradRule, RecommendedCourse, ClassroomTransit, StudentDashboard } from '../types';
import {
  initialClassroomTransits,
  initialUploadHistory
} from '../mock/data';

// Create the real Axios instance pointing to the FastAPI backend
export const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // FastAPI backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Axios Request Interceptor to automatically append JWT Bearer Token if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Axios Response Interceptor to handle 401 Unauthorized and redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('student_id');
      localStorage.removeItem('student_dashboard');
      localStorage.removeItem('isLoggedIn');
      window.location.hash = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper to initialize LocalStorage with frontend-only configs if empty
const initLocalStorage = () => {
  if (!localStorage.getItem('upload_history')) {
    localStorage.setItem('upload_history', JSON.stringify(initialUploadHistory));
  }
};

initLocalStorage();

// Cache maps for course metadata to prevent redundant API lookups
let courseDetailsMap: Map<string, { name: string, credits: number, categoryIds: number[], type: 'required' | 'elective' | 'general' | 'pe' | 'english' }> = new Map();

const resolveCourseDetails = async () => {
  if (courseDetailsMap.size > 0) return courseDetailsMap;

  try {
    const [coursesRes, categoriesRes, mappingsRes] = await Promise.all([
      apiClient.get('/courses/'),
      apiClient.get('/course-categories/'),
      apiClient.get('/course-category-mappings/')
    ]);

    const courses = coursesRes.data;
    const mappings = mappingsRes.data;

    // Group category IDs by course_id
    const courseCatIdsMap = new Map<string, number[]>();
    mappings.forEach((m: any) => {
      const list = courseCatIdsMap.get(m.course_id) || [];
      list.push(m.category_id);
      courseCatIdsMap.set(m.course_id, list);
    });

    courses.forEach((c: any) => {
      const categoryIds = courseCatIdsMap.get(c.course_id) || [];
      
      // Determine a singular 'type' for legacy UI compatibility
      let type: 'required' | 'elective' | 'general' | 'pe' | 'english' = 'elective';
      if (categoryIds.some((id: number) => id >= 1 && id <= 4)) {
        type = 'required';
      } else if (categoryIds.includes(15)) {
        type = 'english';
      } else if (categoryIds.includes(16)) {
        type = 'pe';
      } else if (categoryIds.some((id: number) => id >= 6 && id <= 14)) {
        type = 'general';
      } else if (categoryIds.includes(5)) {
        type = 'elective';
      }

      courseDetailsMap.set(c.course_id, {
        name: c.course_name,
        credits: c.credits,
        categoryIds,
        type
      });
    });
  } catch (e) {
    console.error("Error resolving course details:", e);
  }

  return courseDetailsMap;
};

export const graduationService = {
  // Reset database state to mock initial (Cleared from localStorage side)
  async resetData(): Promise<void> {
    localStorage.removeItem('upload_history');
    localStorage.setItem('upload_history', JSON.stringify(initialUploadHistory));
  },

  // Auth Integration
  async login(studentId: string, password: string): Promise<{ success: boolean; token: string; student: StudentDashboard }> {
    if (!studentId) {
      throw new Error('請輸入學號');
    }
    if (!password) {
      throw new Error('請輸入密碼');
    }

    const params = new URLSearchParams();
    params.append('username', studentId);
    params.append('password', password);

    const response = await apiClient.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const token = response.data.access_token;
    localStorage.setItem('token', token);
    localStorage.setItem('student_id', studentId);

    // Fetch the dashboard info for the student profile
    const dashboard = await this.getDashboardData();

    return {
      success: true,
      token: token,
      student: dashboard
    };
  },

  // Dashboard API
  async getDashboardData(): Promise<StudentDashboard> {
    const studentId = localStorage.getItem('student_id') || '111001001';

    const [studentRes, creditCheckRes, recordsRes, detailsMap] = await Promise.all([
      apiClient.get(`/students/${studentId}`),
      apiClient.get('/credit-check/me'),
      apiClient.get('/student-course-records/me'),
      resolveCourseDetails()
    ]);

    const student = studentRes.data;
    const creditCheck = creditCheckRes.data;
    const records = recordsRes.data;

    let rawRequiredGeneral = 0;
    let rawGroupA = 0;
    let rawGroupB = 0;
    let rawGroupC = 0;
    let rawChinese = 0;
    let rawNature = 0;
    let rawSocial = 0;
    let rawHumanity = 0;
    let rawInfo = 0;
    let rawCollege = 0;
    let rawEnglish = 0;
    let rawPe = 0;

    let totalRawNonPeCredits = 0;

    records.forEach((r: any) => {
      if (!r.is_passed) return;
      const details = detailsMap.get(r.course_id);
      if (!details) return;
      
      const credits = details.credits;
      const categoryIds = details.categoryIds || [];

      if (categoryIds.includes(16)) {
        rawPe += 1;
      } else {
        totalRawNonPeCredits += credits;
        
        if (categoryIds.includes(1)) rawRequiredGeneral += credits;
        if (categoryIds.includes(2)) rawGroupA += credits;
        if (categoryIds.includes(3)) rawGroupB += credits;
        if (categoryIds.includes(4)) rawGroupC += credits;
        if (categoryIds.includes(6)) rawChinese += credits;
        if (categoryIds.includes(7)) rawNature += credits;
        if (categoryIds.includes(8)) rawSocial += credits;
        if (categoryIds.includes(9)) rawHumanity += credits;
        if (categoryIds.includes(10)) rawInfo += credits;
        if (categoryIds.includes(11)) rawCollege += credits;
        if (categoryIds.includes(15)) rawEnglish += credits;
      }
    });

    const completedRequired = rawRequiredGeneral + Math.min(rawGroupA, 6) + Math.min(rawGroupB, 3) + Math.min(rawGroupC, 3);
    const completedPe = rawPe;

    const cappedChinese = Math.min(rawChinese, 3);
    const cappedInfo = Math.min(rawInfo, 3);
    const cappedCollege = Math.min(rawCollege, 3);
    const cappedNature = Math.min(rawNature, 7);
    const cappedSocial = Math.min(rawSocial, 7);
    const cappedHumanity = Math.min(rawHumanity, 7);
    const cappedEnglish = Math.min(rawEnglish, 6);

    const sumCappedGE = cappedChinese + cappedInfo + cappedCollege + cappedNature + cappedSocial + cappedHumanity + cappedEnglish;
    const completedGeneral = Math.min(sumCappedGE, 28);

    const completedElective = totalRawNonPeCredits - completedRequired - completedGeneral;
    const totalCompleted = completedRequired + completedGeneral + completedElective;
    const totalRequired = 128;

    const requiredTarget = 57;
    const electiveTarget = 43;
    const generalTarget = 28;
    const peTarget = 4;
    const englishTarget = "大學英文 2 門";
    const englishPassed = rawEnglish >= 6;

    const categoryProgress = {
      required: { completed: completedRequired, target: requiredTarget },
      elective: { completed: completedElective, target: electiveTarget },
      general: { completed: completedGeneral, target: generalTarget },
      pe: { completed: completedPe, target: peTarget },
      english: { completed: englishPassed, target: englishTarget }
    };

    const missingCourses = creditCheck.required_course_check.missing_courses.map((c: any) => c.course_name);

    const dashboard = {
      studentName: student.name,
      studentId: student.student_id,
      department: student.department,
      currentSemester: "112 學年度第二學期",
      totalRequiredCredits: totalRequired,
      totalCompletedCredits: totalCompleted,
      missingCredits: Math.max(0, totalRequired - totalCompleted),
      missingRequiredCount: creditCheck.required_course_check.missing_required,
      missingRequiredCourses: missingCourses,
      categoryProgress
    };

    localStorage.setItem('student_dashboard', JSON.stringify(dashboard));
    return dashboard;
  },

  // Course Record API
  async getCourseRecords(): Promise<CourseRecord[]> {
    const [recordsRes, detailsMap] = await Promise.all([
      apiClient.get('/student-course-records/me'),
      resolveCourseDetails()
    ]);

    return recordsRes.data.map((r: any) => {
      const details = detailsMap.get(r.course_id);
      return {
        id: String(r.record_id),
        semester: r.semester,
        courseId: r.course_id,
        courseName: details?.name || "未定義課程",
        credits: details?.credits ?? 0,
        grade: r.grade !== null ? String(r.grade) : (r.is_passed ? "Pass" : "F"),
        type: details?.type ?? 'elective'
      };
    });
  },

  async addCourseRecord(record: Omit<CourseRecord, 'id'>): Promise<CourseRecord> {
    const studentId = localStorage.getItem('student_id') || '110306078';

    // 1. Check if course exists
    let courseExists = false;
    try {
      await apiClient.get(`/courses/${record.courseId}`);
      courseExists = true;
    } catch (e) {
      courseExists = false;
    }

    if (!courseExists) {
      // Create Course
      await apiClient.post('/courses/', {
        course_id: record.courseId,
        course_name: record.courseName,
        credits: record.credits,
        taught_by: null
      });

      // Determine category ID based on record type
      let categoryId = 2; // Default elective
      if (record.type === 'required') categoryId = 1;
      else if (record.type === 'elective') categoryId = 2;
      else if (record.type === 'general') categoryId = 3;
      else if (record.type === 'pe') categoryId = 4;
      else if (record.type === 'english') categoryId = 5;

      // Create Mapping
      await apiClient.post('/course-category-mappings/', {
        course_id: record.courseId,
        category_id: categoryId
      });
    }

    // 2. Parse grade to integer
    const numericGrade = parseInt(record.grade);
    const isPassed = !isNaN(numericGrade) ? numericGrade >= 60 : (
      record.grade.toLowerCase() === 'pass' || 
      ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-'].includes(record.grade.toUpperCase())
    );

    const response = await apiClient.post('/student-course-records/', {
      student_id: studentId,
      course_id: record.courseId,
      semester: record.semester,
      grade: isNaN(numericGrade) ? null : numericGrade,
      is_passed: isPassed
    });

    // Clear local cache to force refresh in subsequent calls
    courseDetailsMap.clear();

    return {
      id: String(response.data.record_id),
      semester: record.semester,
      courseId: record.courseId,
      courseName: record.courseName,
      credits: record.credits,
      grade: record.grade,
      type: record.type
    };
  },

  async deleteCourseRecord(id: string): Promise<void> {
    await apiClient.delete(`/student-course-records/${parseInt(id)}`);
    courseDetailsMap.clear();
  },

  // Graduation Check Rules API
  async getGraduationRules(): Promise<GradRule[]> {
    const [creditCheckRes, dashboard] = await Promise.all([
      apiClient.get('/credit-check/me'),
      this.getDashboardData()
    ]);

    const creditCheck = creditCheckRes.data;
    const results = creditCheck.results || [];
    const rules: GradRule[] = [];

    // Helper to find a specific result by category_id
    const findResultByCat = (catId: number) => {
      return results.find((res: any) => res.category_id === catId);
    };

    // 1. 一般必修課程
    const reqGeneral = findResultByCat(1);
    const missingCompulsoryNames = creditCheck.required_course_check.missing_courses.map((c: any) => `【${c.course_name}】`).join('、');
    rules.push({
      id: "compulsory_general",
      name: "一般必修課程全數通過",
      type: "必修",
      required: "45 學分 (15 門課程)",
      completed: reqGeneral ? `${reqGeneral.earned_credits} 學分 (${reqGeneral.passed_courses} 門)` : "0 學分 (0 門)",
      progress: reqGeneral ? Math.min(100, Math.round((reqGeneral.passed_courses / 15) * 100)) : 0,
      status: creditCheck.required_course_check.is_passed ? "completed" : "failed",
      details: creditCheck.required_course_check.is_passed 
        ? "已修畢所有核心系一般必修課程" 
        : `尚缺：${missingCompulsoryNames} 未修（計 ${creditCheck.required_course_check.missing_required} 門課程）`
    });

    // 2. 群A必選修課程
    const reqA = findResultByCat(2);
    const reqACompleted = reqA ? reqA.earned_credits : 0;
    const reqAPassed = reqA ? reqA.passed_courses : 0;
    const isAPassed = reqA ? reqA.is_passed : false;
    rules.push({
      id: "group_a",
      name: "群A必選修課程 (至少 2 門)",
      type: "必修",
      required: "6 學分 (2 門)",
      completed: `${reqACompleted} 學分 (${reqAPassed} 門)`,
      progress: Math.min(100, Math.round((reqAPassed / 2) * 100)),
      status: isAPassed ? "completed" : "failed",
      details: isAPassed 
        ? `已修滿群A選修課程，累計 ${reqACompleted} 學分` + (reqACompleted > 6 ? `，溢出 ${reqACompleted - 6} 學分已併入選修` : "")
        : `群A選修課程不足，尚缺 ${Math.max(0, 2 - reqAPassed)} 門課程`
    });

    // 3. 群B必選修課程
    const reqB = findResultByCat(3);
    const reqBCompleted = reqB ? reqB.earned_credits : 0;
    const reqBPassed = reqB ? reqB.passed_courses : 0;
    const isBPassed = reqB ? reqB.is_passed : false;
    rules.push({
      id: "group_b",
      name: "群B必選修課程 (至少 1 門)",
      type: "必修",
      required: "3 學分 (1 門)",
      completed: `${reqBCompleted} 學分 (${reqBPassed} 門)`,
      progress: Math.min(100, Math.round((reqBPassed / 1) * 100)),
      status: isBPassed ? "completed" : "failed",
      details: isBPassed 
        ? `已修滿群B選修課程，累計 ${reqBCompleted} 學分` + (reqBCompleted > 3 ? `，溢出 ${reqBCompleted - 3} 學分已併入選修` : "")
        : `群B選修課程不足，尚缺 ${Math.max(0, 1 - reqBPassed)} 門課程`
    });

    // 4. 群C必選修課程
    const reqC = findResultByCat(4);
    const reqCCompleted = reqC ? reqC.earned_credits : 0;
    const reqCPassed = reqC ? reqC.passed_courses : 0;
    const isCPassed = reqC ? reqC.is_passed : false;
    rules.push({
      id: "group_c",
      name: "群C必選修課程 (至少 1 門)",
      type: "必修",
      required: "3 學分 (1 門)",
      completed: `${reqCCompleted} 學分 (${reqCPassed} 門)`,
      progress: Math.min(100, Math.round((reqCPassed / 1) * 100)),
      status: isCPassed ? "completed" : "failed",
      details: isCPassed 
        ? `已修滿群C選修課程，累計 ${reqCCompleted} 學分` + (reqCCompleted > 3 ? `，溢出 ${reqCCompleted - 3} 學分已併入選修` : "")
        : `群C選修課程不足，尚缺 ${Math.max(0, 1 - reqCPassed)} 門課程`
    });

    // 5. 中文通識
    const chineseGe = findResultByCat(6);
    const isChinesePassed = chineseGe ? chineseGe.is_passed : false;
    rules.push({
      id: "chinese_ge",
      name: "中文通識門檻",
      type: "通識",
      required: "3 學分 (1 門)",
      completed: `${chineseGe ? chineseGe.earned_credits : 0} 學分`,
      progress: isChinesePassed ? 100 : 0,
      status: isChinesePassed ? "completed" : "failed",
      details: isChinesePassed ? "中文通識已修習通過" : "中文通識尚未修習通過"
    });

    // 6. 資訊通識
    const infoGe = findResultByCat(10);
    const isInfoPassed = infoGe ? infoGe.is_passed : false;
    const infoEarned = infoGe ? infoGe.earned_credits : 0;
    rules.push({
      id: "info_ge",
      name: "資訊通識門檻 (最少 2 學分，採計上限 3 學分)",
      type: "通識",
      required: "2 學分",
      completed: `${infoEarned} 學分`,
      progress: infoEarned >= 2 ? 100 : Math.round((infoEarned / 2) * 100),
      status: isInfoPassed ? "completed" : "failed",
      details: isInfoPassed 
        ? `資訊通識已達標（修得 ${infoEarned} 學分）` + (infoEarned > 3 ? `，超出 3 學分之部分不採計於通識 28 學分內` : "")
        : "資訊通識學分不足，需再修習資訊通識課程"
    });

    // 7. 自然通識
    const natureGe = findResultByCat(7);
    const isNaturePassed = natureGe ? natureGe.is_passed : false;
    const natureEarned = natureGe ? natureGe.earned_credits : 0;
    rules.push({
      id: "nature_ge",
      name: "自然通識門檻 (最少 3 學分，採計上限 7 學分)",
      type: "通識",
      required: "3 學分",
      completed: `${natureEarned} 學分`,
      progress: natureEarned >= 3 ? 100 : Math.round((natureEarned / 3) * 100),
      status: isNaturePassed ? "completed" : "failed",
      details: isNaturePassed 
        ? `自然通識已達標（修得 ${natureEarned} 學分）` + (natureEarned > 7 ? `，超出 7 學分之部分不採計於通識 28 學分內` : "")
        : "自然通識學分不足，需再修習自然通識課程"
    });

    // 8. 社會通識
    const socialGe = findResultByCat(8);
    const isSocialPassed = socialGe ? socialGe.is_passed : false;
    const socialEarned = socialGe ? socialGe.earned_credits : 0;
    rules.push({
      id: "social_ge",
      name: "社會通識門檻 (最少 3 學分，採計上限 7 學分)",
      type: "通識",
      required: "3 學分",
      completed: `${socialEarned} 學分`,
      progress: socialEarned >= 3 ? 100 : Math.round((socialEarned / 3) * 100),
      status: isSocialPassed ? "completed" : "failed",
      details: isSocialPassed 
        ? `社會通識已達標（修得 ${socialEarned} 學分）` + (socialEarned > 7 ? `，超出 7 學分之部分不採計於通識 28 學分內` : "")
        : "社會通識學分不足，需再修習社會通識課程"
    });

    // 9. 人文通識
    const humanityGe = findResultByCat(9);
    const isHumanityPassed = humanityGe ? humanityGe.is_passed : false;
    const humanityEarned = humanityGe ? humanityGe.earned_credits : 0;
    rules.push({
      id: "humanity_ge",
      name: "人文通識門檻 (最少 3 學分，採計上限 7 學分)",
      type: "通識",
      required: "3 學分",
      completed: `${humanityEarned} 學分`,
      progress: humanityEarned >= 3 ? 100 : Math.round((humanityEarned / 3) * 100),
      status: isHumanityPassed ? "completed" : "failed",
      details: isHumanityPassed 
        ? `人文通識已達標（修得 ${humanityEarned} 學分）` + (humanityEarned > 7 ? `，超出 7 學分之部分不採計於通識 28 學分內` : "")
        : "人文通識學分不足，需再修習人文通識課程"
    });

    // 10. 核心通識-自然
    const coreNature = findResultByCat(12);
    const isCoreNaturePassed = coreNature ? coreNature.is_passed : false;
    const coreNatureCount = coreNature ? coreNature.passed_courses : 0;
    rules.push({
      id: "core_nature",
      name: "核心通識-自然 (至少 1 門)",
      type: "核心通識",
      required: "3 學分 (1 門)",
      completed: `${coreNature ? coreNature.earned_credits : 0} 學分 (${coreNatureCount} 門)`,
      progress: isCoreNaturePassed ? 100 : 0,
      status: isCoreNaturePassed ? "completed" : "failed",
      details: isCoreNaturePassed ? "核心通識-自然課程已通過" : "尚未修習核心通識-自然課程"
    });

    // 11. 核心通識-社會
    const coreSocial = findResultByCat(13);
    const isCoreSocialPassed = coreSocial ? coreSocial.is_passed : false;
    const coreSocialCount = coreSocial ? coreSocial.passed_courses : 0;
    rules.push({
      id: "core_social",
      name: "核心通識-社會 (至少 1 門)",
      type: "核心通識",
      required: "3 學分 (1 門)",
      completed: `${coreSocial ? coreSocial.earned_credits : 0} 學分 (${coreSocialCount} 門)`,
      progress: isCoreSocialPassed ? 100 : 0,
      status: isCoreSocialPassed ? "completed" : "failed",
      details: isCoreSocialPassed ? "核心通識-社會課程已通過" : "尚未修習核心通識-社會課程"
    });

    // 12. 核心通識-人文
    const coreHumanity = findResultByCat(14);
    const isCoreHumanityPassed = coreHumanity ? coreHumanity.is_passed : false;
    const coreHumanityCount = coreHumanity ? coreHumanity.passed_courses : 0;
    rules.push({
      id: "core_humanity",
      name: "核心通識-人文 (至少 1 門)",
      type: "核心通識",
      required: "3 學分 (1 門)",
      completed: `${coreHumanity ? coreHumanity.earned_credits : 0} 學分 (${coreHumanityCount} 門)`,
      progress: isCoreHumanityPassed ? 100 : 0,
      status: isCoreHumanityPassed ? "completed" : "failed",
      details: isCoreHumanityPassed ? "核心通識-人文課程已通過" : "尚未修習核心通識-人文課程"
    });

    // 13. 書院通識
    const collegeGe = findResultByCat(11);
    const collegeEarned = collegeGe ? collegeGe.earned_credits : 0;
    rules.push({
      id: "college_ge",
      name: "書院通識 (上限 3 學分)",
      type: "通識",
      required: "0-3 學分",
      completed: `${collegeEarned} 學分`,
      progress: 100, // 書院通識為選修，最少 0 學分
      status: "completed",
      details: collegeEarned > 3 
        ? `書院通識已修 ${collegeEarned} 學分，超出 3 學分之部分不採計於通識 28 學分內` 
        : `書院通識已修得 ${collegeEarned} 學分`
    });

    // 14. 核心通識跨領域門檻
    const coreGeCheck = creditCheck.core_ge_check;
    const isCoreGeCheckPassed = coreGeCheck ? coreGeCheck.is_passed : false;
    const passedCoreCats = coreGeCheck ? coreGeCheck.passed_categories : 0;
    const totalCoreCourses = coreGeCheck ? coreGeCheck.total_core_courses : 0;
    rules.push({
      id: "core_ge_cross_domain",
      name: "核心通識跨領域門檻 (需修習至少 2 不同類別且達 2 門)",
      type: "核心通識",
      required: "2 類別 & 2 門",
      completed: `${passedCoreCats} 類別 (${totalCoreCourses} 門)`,
      progress: isCoreGeCheckPassed ? 100 : Math.round((passedCoreCats / 2) * 50 + Math.min(1, totalCoreCourses) * 50),
      status: isCoreGeCheckPassed ? "completed" : "failed",
      details: isCoreGeCheckPassed 
        ? `已達成跨領域核心通識要求（修讀自然、社會、人文中之 ${passedCoreCats} 類，共 ${totalCoreCourses} 門）`
        : "核心通識跨領域不符：需在自然、社會、人文三類核心通識中，選修至少兩大不同類別，且累計修滿兩門課程。"
    });

    // 15. 大學英文
    const english = findResultByCat(15);
    const isEnglishPassed = english ? english.is_passed : false;
    const englishEarned = english ? english.earned_credits : 0;
    const englishCourses = english ? english.passed_courses : 0;
    rules.push({
      id: "english_course",
      name: "外文英文課程 (大學英文 2 門共 6 學分)",
      type: "英文",
      required: "6 學分 (2 門)",
      completed: `${englishEarned} 學分 (${englishCourses} 門)`,
      progress: Math.min(100, Math.round((englishEarned / 6) * 100)),
      status: isEnglishPassed ? "completed" : "failed",
      details: isEnglishPassed
        ? "已通過大學英文課程門檻"
        : `英文課程學分不足，尚缺 ${Math.max(0, 2 - englishCourses)} 門課程（${Math.max(0, 6 - englishEarned)} 學分）`
    });

    // 16. 體育必修
    const pe = findResultByCat(16);
    const isPePassed = pe ? pe.is_passed : false;
    const pePassed = pe ? pe.passed_courses : 0;
    rules.push({
      id: "pe_course",
      name: "體育必修學期門檻",
      type: "體育",
      required: "4 學期",
      completed: `${pePassed} 學期`,
      progress: Math.min(100, Math.round((pePassed / 4) * 100)),
      status: isPePassed ? "completed" : "failed",
      details: isPePassed 
        ? "已修滿 4 學期體育必修課程" 
        : `體育學期數不足，目前已修 ${pePassed} / 4 學期`
    });

    // 17. 通識學分門檻
    const geCompleted = dashboard.categoryProgress.general.completed;
    const geTarget = 28;
    rules.push({
      id: "general_credits",
      name: "通識學分累計門檻",
      type: "通識",
      required: "28 學分",
      completed: `${geCompleted} 學分`,
      progress: Math.min(100, Math.round((geCompleted / geTarget) * 100)),
      status: geCompleted >= geTarget ? "completed" : "failed",
      details: geCompleted >= geTarget 
        ? "已獲得 28 通識學分（已扣除單項溢出之學分，額外溢出之學分計入選修）" 
        : `通識學分不足，目前採計 ${geCompleted} 學分，尚缺 ${28 - geCompleted} 學分`
    });

    // 18. 專業選修學分門檻
    const eleCompleted = dashboard.categoryProgress.elective.completed;
    const eleTarget = 43;
    rules.push({
      id: "elective_credits",
      name: "專業選修學分門檻",
      type: "選修",
      required: "43 學分",
      completed: `${eleCompleted} 學分`,
      progress: Math.min(100, Math.round((eleCompleted / eleTarget) * 100)),
      status: eleCompleted >= eleTarget ? "completed" : "failed",
      details: eleCompleted >= eleTarget 
        ? `專業選修已達標（累計修得 ${eleCompleted} 學分）`
        : `專業選修學分不足，目前已修得 ${eleCompleted} 學分，尚缺 ${eleTarget - eleCompleted} 學分。系外選修、群A/B/C溢出學分及通識溢出學分皆已併入此項計算。`
    });

    // 19. 最低畢業總學分
    const totalCompleted = dashboard.totalCompletedCredits;
    rules.push({
      id: "total_credits",
      name: "最低畢業總學分",
      type: "畢業總學分",
      required: "128 學分",
      completed: `${totalCompleted} 學分`,
      progress: Math.min(100, Math.round((totalCompleted / 128) * 100)),
      status: totalCompleted >= 128 ? "completed" : "failed",
      details: totalCompleted >= 128 
        ? `已滿足 128 總畢業學分門檻（目前累計 ${totalCompleted} 學分）` 
        : `總畢業學分不足，目前累計僅修得 ${totalCompleted} 學分，尚缺 ${128 - totalCompleted} 學分`
    });

    return rules;
  },

  // Course Recommendations API
  async getRecommendedCourses(): Promise<RecommendedCourse[]> {
    const studentId = localStorage.getItem('student_id') || '110306078';
    const response = await apiClient.get(`/recommendations/${studentId}`);

    return response.data.map((item: any) => {
      let category = "專業選修推薦";
      if (item.category_id === 1) category = "核心必修（補修）";
      else if (item.category_id === 3) category = "通識課程補修";

      let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
      if (item.peer_pass_rate >= 0.95) difficulty = 'Easy';
      else if (item.peer_pass_rate < 0.8) difficulty = 'Hard';

      return {
        courseId: item.course_id,
        courseName: item.course_name,
        category: category,
        credits: item.credits,
        passRate: Math.round(item.peer_pass_rate * 100),
        difficulty: difficulty,
        semester: "113學年度第一學期 (秋季)"
      };
    });
  },

  // Classroom Warnings API (Kept local since geo-coordinates and schedules are not DB-modeled)
  async getClassroomTransits(): Promise<ClassroomTransit[]> {
    return initialClassroomTransits;
  },

  // Upload History API (Kept local in LocalStorage)
  async getUploadHistory(): Promise<any[]> {
    return JSON.parse(localStorage.getItem('upload_history') || '[]');
  },

  // Parse CSV and append to system records
  async parseAndImportCSV(csvText: string, filename: string): Promise<{ success: boolean; importedCount: number }> {
    const lines = csvText.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new Error("CSV 格式不正確：請確保有標題行與資料行");
    }

    const importedRecords: Omit<CourseRecord, 'id'>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
      if (parts.length >= 5) {
        const semester = parts[0] || "112學年度第二學期";
        const courseId = parts[1] || `703${Math.floor(Math.random() * 1000000)}`;
        const courseName = parts[2] || "未命名課程";
        const credits = parseFloat(parts[3]) || 3;
        const grade = parts[4] || "A";
        
        let type: 'required' | 'elective' | 'general' | 'pe' | 'english' = 'elective';
        const typeField = parts[5]?.toLowerCase() || '';
        
        if (typeField.includes('必修') || typeField.includes('required')) {
          type = 'required';
        } else if (typeField.includes('通識') || typeField.includes('general')) {
          type = 'general';
        } else if (typeField.includes('體育') || typeField.includes('pe')) {
          type = 'pe';
        } else if (typeField.includes('英文') || typeField.includes('english')) {
          type = 'english';
        } else {
          if (courseName.includes('通識') || courseName.includes('科學與') || courseName.includes('跨領域')) {
            type = 'general';
          } else if (courseName.includes('體育')) {
            type = 'pe';
          } else if (courseName.includes('英文')) {
            type = 'english';
          } else if (['計算機', '演算法', '資料結構', '微積分', '線性代數', '作業系統', '軟體工程', '系統程式'].some(k => courseName.includes(k))) {
            type = 'required';
          }
        }

        importedRecords.push({
          semester,
          courseId,
          courseName,
          credits,
          grade,
          type
        });
      }
    }

    if (importedRecords.length === 0) {
      throw new Error("無法解析任何有效的修課學期紀錄。請檢查欄位順序！");
    }

    // Sequentially upload each record to the FastAPI backend
    for (const rec of importedRecords) {
      await this.addCourseRecord(rec);
    }

    // Update upload history locally
    const history = JSON.parse(localStorage.getItem('upload_history') || '[]');
    const newHistory = {
      id: `h_${Date.now()}`,
      filename,
      uploadAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      fileSize: `${(csvText.length / 1024).toFixed(1)} KB`,
      status: "解析成功",
      recordsCount: importedRecords.length
    };
    history.unshift(newHistory);
    localStorage.setItem('upload_history', JSON.stringify(history));

    return {
      success: true,
      importedCount: importedRecords.length
    };
  }
};
