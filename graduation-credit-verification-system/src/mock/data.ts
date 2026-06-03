import { CourseRecord, GradRule, RecommendedCourse, ClassroomTransit, StudentDashboard } from '../types';

export const initialStudentDashboard: StudentDashboard = {
  studentName: "聖結石",
  studentId: "110306078",
  department: "資訊科學系 (Computer Science)",
  currentSemester: "112 學年度第二學期",
  totalRequiredCredits: 128,
  totalCompletedCredits: 106,
  missingCredits: 22,
  missingRequiredCount: 2,
  categoryProgress: {
    required: { completed: 52, target: 58 },
    elective: { completed: 28, target: 18 },
    general: { completed: 26, target: 28 },
    pe: { completed: 4, target: 4 }, // 4 semesters
    english: { completed: false, target: "TOEIC 785 or equivalent" }
  }
};

export const initialCourseRecords: CourseRecord[] = [
  // 110-1
  { id: "1", semester: "110學年度第一學期", courseId: "703001001", courseName: "計算機概論 (Introduction to CS)", credits: 3, grade: "A", type: "required" },
  { id: "2", semester: "110學年度第一學期", courseId: "703002001", courseName: "微積分甲 (Calculus I)", credits: 4, grade: "B+", type: "required" },
  { id: "3", semester: "110學年度第一學期", courseId: "000101001", courseName: "大學英文 (Freshman English)", credits: 3, grade: "A-", type: "english" },
  { id: "4", semester: "110學年度第一學期", courseId: "000311020", courseName: "通識：自然科學與生命體驗", credits: 2, grade: "Pass", type: "general" },
  { id: "5", semester: "110學年度第一學期", courseId: "000201001", courseName: "體育 (健康體能)", credits: 0, grade: "92", type: "pe" },

  // 110-2
  { id: "6", semester: "110學年度第二學期", courseId: "703003001", courseName: "程式設計 (Programming Guilds)", credits: 3, grade: "A+", type: "required" },
  { id: "7", semester: "110學年度第二學期", courseId: "703004001", courseName: "線性代數 (Linear Algebra)", credits: 3, grade: "B", type: "required" },
  { id: "8", semester: "110學年度第二學期", courseId: "000315011", courseName: "通識：歷史與多元社會", credits: 2, grade: "A", type: "general" },
  { id: "9", semester: "110學年度第二學期", courseId: "000102001", courseName: "大學中文 (Freshman Chinese)", credits: 3, grade: "B-", type: "required" },
  { id: "10", semester: "110學年度第二學期", courseId: "000202001", courseName: "體育 (桌球)", credits: 0, grade: "88", type: "pe" },

  // 111-1
  { id: "11", semester: "111學年度第一學期", courseId: "703005001", courseName: "資料結構 (Data Structures)", credits: 3, grade: "B+", type: "required" },
  { id: "12", semester: "111學年度第一學期", courseId: "703006001", courseName: "離散數學 (Discrete Mathematics)", credits: 3, grade: "C+", type: "required" },
  { id: "13", semester: "111學年度第一學期", courseId: "703007001", courseName: "數位系統設計 (Digital Systems)", credits: 3, grade: "82", type: "required" },
  { id: "14", semester: "111學年度第一學期", courseId: "703021001", courseName: "專業選修：虛擬實境導論", credits: 3, grade: "A", type: "elective" },
  { id: "15", semester: "111學年度第一學期", courseId: "000318041", courseName: "通識：藝術與媒體美學", credits: 3, grade: "Pass", type: "general" },

  // 111-2
  { id: "16", semester: "111學年度第二學期", courseId: "703008001", courseName: "演算法 (Algorithms)", credits: 3, grade: "A-", type: "required" },
  { id: "17", semester: "111學年度第二學期", courseId: "703009001", courseName: "作業系統 (Operating Systems)", credits: 3, grade: "C-", type: "required" },
  { id: "18", semester: "111學年度第二學期", courseId: "703022001", courseName: "專業選修：資料庫系統原理", credits: 3, grade: "B", type: "elective" },
  { id: "19", semester: "111學年度第二學期", courseId: "000312015", courseName: "通識：憲政法治與人權", credits: 3, grade: "Pass", type: "general" },
  { id: "20", semester: "111學年度第二學期", courseId: "000203001", courseName: "體育 (太極拳)", credits: 0, grade: "90", type: "pe" },

  // 112-1
  { id: "21", semester: "112學年度第一學期", courseId: "703010001", courseName: "計算機組織 (Computer Architecture)", credits: 3, grade: "B-", type: "required" },
  { id: "22", semester: "112學年度第一學期", courseId: "703023001", courseName: "專業選修：人工智慧導論", credits: 3, grade: "A+", type: "elective" },
  { id: "23", semester: "112學年度第一學期", courseId: "703024001", courseName: "專業選修：網頁前端開發技術", credits: 3, grade: "A", type: "elective" },
  { id: "24", semester: "112學年度第一學期", courseId: "000314052", courseName: "通識：哲學思辨與永續生活", credits: 3, grade: "Pass", type: "general" },
  { id: "25", semester: "112學年度第一學期", courseId: "000204001", courseName: "體育 (網球)", credits: 0, grade: "85", type: "pe" },

  // 112-2 (Current - enrolled and recently finished / preliminary grades or mock)
  { id: "26", semester: "112學年度第二學期", courseId: "703011001", courseName: "軟體工程 (Software Engineering)", credits: 3, grade: "A-", type: "required" },
  { id: "27", semester: "112學年度第二學期", courseId: "703025001", courseName: "專業選修：熱門機器學習實務", credits: 3, grade: "A", type: "elective" },
  { id: "28", semester: "112學年度第二學期", courseId: "703026001", courseName: "專業選修：雲端運算與系統架構", credits: 3, grade: "B+", type: "elective" },
  { id: "29", semester: "112學年度第二學期", courseId: "000320011", courseName: "通識：跨文化溝通專題", credits: 2, grade: "A", type: "general" },
  { id: "30", semester: "112學年度第二學期", courseId: "703027001", courseName: "專業選修：物聯網感知技術", credits: 3, grade: "A-", type: "elective" },
  { id: "31", semester: "112學年度第二學期", courseId: "703028001", courseName: "專業選修：巨量資料分析", credits: 3, grade: "B+", type: "elective" },

  // 110-2 追加必修/通識
  { id: "32", semester: "110學年度第二學期", courseId: "703012002", courseName: "微積分甲 (Calculus II)", credits: 4, grade: "A-", type: "required" },
  { id: "33", semester: "110學年度第二學期", courseId: "703013002", courseName: "物件導向程式設計 (Object-Oriented Programming)", credits: 3, grade: "A", type: "required" },
  { id: "34", semester: "110學年度第二學期", courseId: "000325001", courseName: "通識：現代生物學與生物技術", credits: 3, grade: "A", type: "general" },

  // 111-1 追加必修/通識
  { id: "35", semester: "111學年度第一學期", courseId: "703014002", courseName: "機率與統計 (Probability & Statistics)", credits: 3, grade: "B", type: "required" },
  { id: "36", semester: "111學年度第一學期", courseId: "703015002", courseName: "數位系統設計實驗 (Digital Systems Lab)", credits: 1, grade: "A", type: "required" },
  { id: "37", semester: "111學年度第一學期", courseId: "000326001", courseName: "通識：民主路上的法律思辨", credits: 3, grade: "B+", type: "general" },

  // 111-2 追加必修/通識
  { id: "38", semester: "111學年度第二學期", courseId: "703016002", courseName: "系統程式 (System Programming)", credits: 3, grade: "B-", type: "required" },
  { id: "39", semester: "111學年度第二學期", courseId: "000327001", courseName: "通識：臺灣歷史與文化", credits: 3, grade: "A-", type: "general" },

  // 112-1 追加必修/選修/通識
  { id: "40", semester: "112學年度第一學期", courseId: "703017002", courseName: "資訊科學專題(一) (CS Project I)", credits: 1, grade: "A-", type: "required" },
  { id: "41", semester: "112學年度第一學期", courseId: "703030002", courseName: "資訊科學專題(二) (CS Project II)", credits: 1, grade: "A", type: "elective" },
  { id: "42", semester: "112學年度第一學期", courseId: "000328001", courseName: "通識：基礎日語一", credits: 2, grade: "Pass", type: "general" },
];

export const initialGradRules: GradRule[] = [
  {
    id: "r1",
    name: "系必修課程全數通過",
    type: "Major Required",
    required: "58 學分 (全數修畢)",
    completed: "52 學分",
    progress: 89,
    status: "warning",
    details: "尚缺：【計算機網路】、【編譯器設計】未修（計6學分）"
  },
  {
    id: "r2",
    name: "專業選修學分門檻",
    type: "Major Elective",
    required: ">= 18 學分",
    completed: "24 學分",
    progress: 100,
    status: "completed",
    details: "已修 8 門專業選修，超出規定門檻 6 學分"
  },
  {
    id: "r3",
    name: "通識學分門檻",
    type: "General Education",
    required: ">= 28 學分",
    completed: "26 學分",
    progress: 92,
    status: "warning",
    details: "尚缺 2 學分通識。請注意四大領域：人文、社會、自然、文明是否各修滿一學科"
  },
  {
    id: "r4",
    name: "體育 4 學期",
    type: "Physical Education",
    required: "4 學期必修",
    completed: "4 學期",
    progress: 100,
    status: "completed",
    details: "健康體能、桌球、太極拳、網球完成修畢"
  },
  {
    id: "r5",
    name: "英文能力檢定門檻",
    type: "Language Proficiency",
    required: "TOEIC 785 分以上",
    completed: "TOEIC 710 分 (未通過)",
    progress: 0,
    status: "failed",
    details: "英文門檻未完成。需上傳符合之檢定證明，或於最後學年修讀並通過【進階英文學分班】"
  },
  {
    id: "r6",
    name: "最低畢業總學分",
    type: "Total Credits",
    required: ">= 128 學分",
    completed: "106 學分",
    progress: 82,
    status: "warning",
    details: "累計修得 106 學分，尚差 22 學分即可達到畢業標準"
  }
];

export const initialRecommendedCourses: RecommendedCourse[] = [
  {
    courseId: "703013001",
    courseName: "計算機網路 (Computer Networks)",
    category: "核心必修（補修）",
    credits: 3,
    passRate: 85,
    difficulty: "Medium",
    semester: "113學年度第一學期 (秋季)"
  },
  {
    courseId: "703014001",
    courseName: "編譯器設計 (Compiler Design)",
    category: "核心必修（補修）",
    credits: 3,
    passRate: 72,
    difficulty: "Hard",
    semester: "113學年度第一學期 (秋季)"
  },
  {
    courseId: "703056002",
    courseName: "巨量資料分析與應用 (Big Data Analytics)",
    category: "專業選修推薦",
    credits: 3,
    passRate: 94,
    difficulty: "Medium",
    semester: "113學年度第一學期 (秋季)"
  },
  {
    courseId: "000317024",
    courseName: "通識：全球科技革命與人類文明",
    category: "通識課程補修",
    credits: 2,
    passRate: 98,
    difficulty: "Easy",
    semester: "113學年度第一學期 (秋季)"
  },
  {
    courseId: "703058001",
    courseName: "區塊鏈與去中心化應用 (Blockchain & dApps)",
    category: "專業選修推薦",
    credits: 3,
    passRate: 91,
    difficulty: "Medium",
    semester: "113學年度第一學期 (秋季)"
  }
];

export const initialClassroomTransits: ClassroomTransit[] = [
  {
    id: "t1",
    period: "10:10 - 12:00 -> 12:10 - 14:00 (週二)",
    prevCourseName: "軟體工程 (Software Engineering)",
    prevClassroom: "大仁樓 201 教室 (山下資科系館)",
    nextCourseName: "跨文化溝通專題",
    nextClassroom: "綜合大樓 405 教室 (山下綜合館)",
    transitMinutes: 10,
    distanceMeter: 250,
    status: "safe",
    description: "步行距離約 250 公尺，皆在山下校區，時間充裕。"
  },
  {
    id: "t2",
    period: "12:10 - 14:00 -> 14:10 - 17:00 (週三)",
    prevCourseName: "熱門機器學習實務",
    prevClassroom: "逸仙樓 201 教室 (山下商學院)",
    nextCourseName: "體育 (網球)",
    nextClassroom: "山上網球場 (山上體育組區)",
    transitMinutes: 10,
    distanceMeter: 920,
    status: "late",
    description: "跨越山上與山下校區！步行上升坡度大且距離近 1 公里。若搭乘校內 1 號公車可能遇人潮，極度不建議，強烈建議提早離開或向體育老師報備步行延誤。"
  },
  {
    id: "t3",
    period: "12:10 - 14:00 -> 14:10 - 16:00 (週五)",
    prevCourseName: "專業選修：雲端運算",
    prevClassroom: "大仁樓 301 電腦教室",
    nextCourseName: "物聯網感知技術",
    nextClassroom: "商館 102 階梯教室 (山下商學院)",
    transitMinutes: 10,
    distanceMeter: 480,
    status: "risk",
    description: "步行距離約 480 公尺。從大仁樓至商館步行時間約 7-8 分鐘。無上坡，但前堂課若拖堂則有遲到風險，需小跑步或快步前行。"
  }
];

export const initialUploadHistory = [
  { id: "h1", filename: "110_to_112_academic_record.csv", uploadAt: "2026-05-20 16:30", fileSize: "12.4 KB", status: "解析成功", recordsCount: 31 },
  { id: "h2", filename: "my_grades_export_v1.csv", uploadAt: "2026-05-18 10:15", fileSize: "11.2 KB", status: "歷史備份已覆蓋", recordsCount: 28 }
];
