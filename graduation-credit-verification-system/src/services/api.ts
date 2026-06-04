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
let courseDetailsMap: Map<string, { name: string, credits: number, type: 'required' | 'elective' | 'general' | 'pe' | 'english' }> = new Map();

const resolveCourseDetails = async () => {
  if (courseDetailsMap.size > 0) return courseDetailsMap;

  try {
    const [coursesRes, categoriesRes, mappingsRes] = await Promise.all([
      apiClient.get('/courses/'),
      apiClient.get('/course-categories/'),
      apiClient.get('/course-category-mappings/')
    ]);

    const courses = coursesRes.data;
    const categories = new Map<number, string>(categoriesRes.data.map((c: any) => [c.category_id, c.sub_type || c.main_type]));
    const mappings = mappingsRes.data;

    const courseCatMap = new Map<string, string>(
      mappings.map((m: any) => [m.course_id, categories.get(m.category_id) || ''])
    );

    courses.forEach((c: any) => {
      const backendType = courseCatMap.get(c.course_id) || '選修';
      let type: 'required' | 'elective' | 'general' | 'pe' | 'english' = 'elective';
      
      if (backendType.includes('必修') || backendType === 'required') type = 'required';
      else if (backendType.includes('選修') || backendType === 'elective') type = 'elective';
      else if (backendType.includes('通識') || backendType === 'general') type = 'general';
      else if (backendType.includes('體育') || backendType === 'pe') type = 'pe';
      else if (backendType.includes('英文') || backendType === 'english') type = 'english';

      courseDetailsMap.set(c.course_id, {
        name: c.course_name,
        credits: c.credits,
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
    const studentId = localStorage.getItem('student_id') || '110306078';

    const [studentRes, creditCheckRes, recordsRes, detailsMap] = await Promise.all([
      apiClient.get(`/students/${studentId}`),
      apiClient.get('/credit-check/me'),
      apiClient.get('/student-course-records/me'),
      resolveCourseDetails()
    ]);

    const student = studentRes.data;
    const creditCheck = creditCheckRes.data;
    const records = recordsRes.data;

    let completedRequired = 0;
    let completedElective = 0;
    let completedGeneral = 0;
    let completedPe = 0;
    let englishPassed = false;

    records.forEach((r: any) => {
      if (!r.is_passed) return;
      const details = detailsMap.get(r.course_id);
      const credits = details?.credits ?? 0;
      const type = details?.type ?? 'elective';

      if (type === 'required') completedRequired += credits;
      else if (type === 'elective') completedElective += credits;
      else if (type === 'general') completedGeneral += credits;
      else if (type === 'pe') completedPe += 1;
      else if (type === 'english') {
        completedElective += credits;
        englishPassed = true;
      }
    });

    const totalCompleted = completedRequired + completedElective + completedGeneral;
    const totalRequired = 128;

    let requiredTarget = 58;
    let electiveTarget = 18;
    let generalTarget = 28;
    let peTarget = 4;
    let englishTarget = "TOEIC 785 or equivalent";

    creditCheck.results.forEach((res: any) => {
      const typeLabel = (res.sub_type || res.main_type || '').toLowerCase();
      if (typeLabel.includes('必修')) {
        requiredTarget = res.required_credits || requiredTarget;
      } else if (typeLabel.includes('選修')) {
        electiveTarget = res.required_credits || electiveTarget;
      } else if (typeLabel.includes('通識')) {
        generalTarget = res.required_credits || generalTarget;
      } else if (typeLabel.includes('體育')) {
        peTarget = res.required_courses || peTarget;
      }
    });

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
    const rules: GradRule[] = [];

    // Helper to find a specific category check result from backend response
    const findResult = (keyword: string) => {
      if (!creditCheck.results) return undefined;
      return creditCheck.results.find((res: any) => {
        const label = (res.sub_type || res.main_type || '').toLowerCase();
        return label.includes(keyword);
      });
    };

    const reqResult = findResult("必修");
    const eleResult = findResult("選修");
    const genResult = findResult("通識");
    const peResult = findResult("體育");

    // 1. Required Course Rule
    const reqCheck = creditCheck.required_course_check;
    const missingCompulsoryNames = reqCheck.missing_courses.map((c: any) => `【${c.course_name}】`).join('、');
    const reqTarget = dashboard.categoryProgress.required.target;
    const reqCompleted = dashboard.categoryProgress.required.completed;
    rules.push({
      id: "r1",
      name: "系必修課程全數通過",
      type: "Major Required",
      required: `${reqTarget} 學分 (全數修畢)`,
      completed: `${reqCompleted} 學分`,
      progress: Math.min(100, Math.round((reqCompleted / reqTarget) * 100)),
      status: reqCheck.is_passed ? "completed" : (reqCompleted > (reqTarget * 0.7) ? "warning" : "failed"),
      details: reqCheck.is_passed 
        ? "已修畢所有核心系必修課程" 
        : `尚缺：${missingCompulsoryNames} 未修（計 ${reqCheck.missing_required * 3} 學分）`
    });

    // 2. Major Elective
    const eleTarget = dashboard.categoryProgress.elective.target;
    const eleCompleted = dashboard.categoryProgress.elective.completed;
    const isElePassed = eleResult ? eleResult.is_passed : eleCompleted >= eleTarget;
    rules.push({
      id: "r2",
      name: "專業選修學分門檻",
      type: "Major Elective",
      required: `>= ${eleTarget} 學分`,
      completed: `${eleCompleted} 學分`,
      progress: Math.min(100, Math.round((eleCompleted / eleTarget) * 100)),
      status: isElePassed ? "completed" : "failed",
      details: isElePassed
        ? `已修畢學分達到選修標準，累計超出 ${Math.max(0, eleCompleted - eleTarget)} 學分`
        : `尚需選修課程，累計不達指標 ${eleTarget} 學分，尚缺 ${Math.max(0, eleTarget - eleCompleted)} 學分`
    });

    // 3. General Education
    const genTarget = dashboard.categoryProgress.general.target;
    const genCompleted = dashboard.categoryProgress.general.completed;
    const isGenPassed = genResult ? genResult.is_passed : genCompleted >= genTarget;
    rules.push({
      id: "r3",
      name: "通識學分門檻",
      type: "General Education",
      required: `>= ${genTarget} 學分`,
      completed: `${genCompleted} 學分`,
      progress: Math.min(100, Math.round((genCompleted / genTarget) * 100)),
      status: isGenPassed ? "completed" : (genCompleted >= (genTarget * 0.8) ? "warning" : "failed"),
      details: isGenPassed
        ? `已修滿 ${genTarget} 學分通識課程`
        : `尚缺 ${Math.max(0, genTarget - genCompleted)} 學分通識主線學科`
    });

    // 4. Physical Education
    const peTarget = dashboard.categoryProgress.pe.target;
    const peCompleted = dashboard.categoryProgress.pe.completed;
    const isPePassed = peResult ? peResult.is_passed : peCompleted >= peTarget;
    rules.push({
      id: "r4",
      name: `體育 ${peTarget} 學期`,
      type: "Physical Education",
      required: `${peTarget} 學期必修`,
      completed: `${peCompleted} 學期`,
      progress: Math.min(100, Math.round((peCompleted / peTarget) * 100)),
      status: isPePassed ? "completed" : "failed",
      details: isPePassed
        ? `已通過 ${peTarget} 學期體育必修課程`
        : `體育學期數不夠（已修 ${peCompleted}/${peTarget} 學期）`
    });

    // 5. English Proficiency
    const englishPassed = dashboard.categoryProgress.english.completed;
    rules.push({
      id: "r5",
      name: "英文能力檢定門檻",
      type: "Language Proficiency",
      required: "TOEIC 785 分以上",
      completed: englishPassed ? "已通過 English 門檻" : "TOEIC 710 分 (未通過)",
      progress: englishPassed ? 100 : 0,
      status: englishPassed ? "completed" : "failed",
      details: englishPassed 
        ? "已通過外文英檢畢業門檻" 
        : "英文門檻未完成。需上傳符合之檢定證明，或於最後學年修讀並通過【進階英文學分班】"
    });

    // 6. Minimum Total Credits Rule
    const totalRequired = dashboard.totalRequiredCredits || 128;
    const totalCompleted = dashboard.totalCompletedCredits;
    rules.push({
      id: "r6",
      name: "最低畢業總學分",
      type: "Total Credits",
      required: `>= ${totalRequired} 學分`,
      completed: `${totalCompleted} 學分`,
      progress: Math.min(100, Math.round((totalCompleted / totalRequired) * 100)),
      status: totalCompleted >= totalRequired ? "completed" : (totalCompleted >= (totalRequired * 0.78) ? "warning" : "failed"),
      details: totalCompleted >= totalRequired
        ? `累計修得 ${totalCompleted} 學分，高過大專院校最低門檻`
        : `累計修得 ${totalCompleted} 學分，剩餘 ${Math.max(0, totalRequired - totalCompleted)} 學分`
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
