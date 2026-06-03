export interface CourseRecord {
  id: string;
  semester: string;
  courseId: string;
  courseName: string;
  credits: number;
  grade: string;
  type: 'required' | 'elective' | 'general' | 'pe' | 'english';
}

export interface GradRule {
  id: string;
  name: string;
  type: string;
  required: string | number;
  completed: string | number;
  progress: number; // percentage, e.g. 80
  status: 'completed' | 'warning' | 'failed';
  details?: string;
}

export interface RecommendedCourse {
  courseId: string;
  courseName: string;
  category: string;
  credits: number;
  passRate: number; // e.g., 94 for 94%
  difficulty: 'Easy' | 'Medium' | 'Hard';
  semester: string;
}

export interface ClassroomTransit {
  id: string;
  period: string; // e.g. "12:00 - 12:10"
  prevCourseName: string;
  prevClassroom: string;
  nextCourseName: string;
  nextClassroom: string;
  transitMinutes: number;
  distanceMeter: number;
  status: 'safe' | 'risk' | 'late'; // green, yellow, red
  description: string;
}

export interface StudentDashboard {
  studentName: string;
  studentId: string;
  department: string;
  currentSemester: string;
  totalRequiredCredits: number;
  totalCompletedCredits: number;
  missingCredits: number;
  missingRequiredCount: number;
  categoryProgress: {
    required: { completed: number; target: number };
    elective: { completed: number; target: number };
    general: { completed: number; target: number };
    pe: { completed: number; target: number }; // standard pe is measured in semesters / units
    english: { completed: boolean; target: string };
  };
}
