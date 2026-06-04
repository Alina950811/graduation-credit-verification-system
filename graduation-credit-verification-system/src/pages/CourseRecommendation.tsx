import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Percent, 
  BookOpen, 
  ChevronRight, 
  ThumbsUp, 
  Flame, 
  HelpCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { graduationService } from '../services/api';
import { RecommendedCourse } from '../types';

export default function CourseRecommendation() {
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const data = await graduationService.getRecommendedCourses();
        if (active) {
          // Sort by passRate descending to fulfill "peer pass rate sorting"
          const sorted = [...data].sort((a, b) => b.passRate - a.passRate);
          setCourses(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRecommendations();
    return () => {
      active = false;
    };
  }, []);

  const handleEnroll = async (course: RecommendedCourse) => {
    if (enrolledIds.includes(course.courseId)) return;

    try {
      // Map RecommendedCourse fields back to a CourseRecord
      await graduationService.addCourseRecord({
        semester: "113學年度第一學期",
        courseId: course.courseId,
        courseName: course.courseName,
        credits: course.credits,
        grade: "A", // simulated future passing grade
        type: course.category.includes('必修') ? 'required' : (course.category.includes('通識') ? 'general' : 'elective')
      });

      setEnrolledIds([...enrolledIds, course.courseId]);
      showToast(`成功預排入學分門檻！已新增【${course.courseName}】${course.credits}學分，請前往進度總覽面板確認合格狀態。`);
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4500);
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Toast Alert Banner */}
      {successToast && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 p-4 rounded-xl flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-indigo-650 shrink-0" />
            <span className="text-sm font-semibold">{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-xs font-bold text-indigo-750 hover:underline">
            關閉
          </button>
        </div>
      )}

      {/* Hero Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-850 rounded-full text-xs font-extrabold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />
            AI 精選推薦 (AI course assistant algorithms)
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">補修課程推薦</h2>
          <p className="text-sm text-slate-500 mt-1">
            系統會自動偵測您的<strong>欠缺學分類別</strong>，並依同儕通過率及評鑑甜度大數據，進行最佳補考補修排序。
          </p>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400">研析合意學科矩陣中...</div>
      ) : (
        <div className="space-y-5">
          {courses.map((course, index) => {
            const isEnrolled = enrolledIds.includes(course.courseId);
            return (
              <div 
                key={course.courseId}
                className={`
                  bg-white rounded-2xl border p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition shadow-sm
                  ${isEnrolled ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200 hover:border-slate-300'}
                `}
              >
                
                {/* Ranking Index + Metadata fields */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-slate-50 text-[#1E3A5F] font-bold text-lg flex items-center justify-center shrink-0 border border-slate-200">
                    {index + 1}
                  </div>
                  
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${course.category.includes('必修') ? 'bg-indigo-100 text-indigo-800 font-extrabold' : ''}
                        ${course.category.includes('通識') ? 'bg-amber-100 text-amber-805' : ''}
                        ${course.category.includes('選修') ? 'bg-emerald-100 text-emerald-800' : ''}
                      `}>
                        {course.category}
                      </span>
                      
                      <span className="text-xs text-slate-400 font-mono">
                        代號: {course.courseId}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight truncate">
                      {course.courseName}
                    </h3>

                    {/* Difficult Tag */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <span>{course.credits} 學分</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-350"></span>
                      <span>難度：</span>
                      <span className={`
                        font-bold
                        ${course.difficulty === 'Easy' ? 'text-emerald-600' : ''}
                        ${course.difficulty === 'Medium' ? 'text-amber-600' : ''}
                        ${course.difficulty === 'Hard' ? 'text-rose-600' : ''}
                      `}>
                        {course.difficulty === 'Easy' ? '輕鬆 (甜度高)' : ''}
                        {course.difficulty === 'Medium' ? '適中 (適量作業)' : ''}
                        {course.difficulty === 'Hard' ? '紮實 (偏重考核)' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stat indicators: Pass Rate & Semester */}
                <div className="flex flex-wrap items-center gap-6 md:gap-12 text-slate-700">
                  
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      同儕通過率 (Pass Rate)
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      <Percent className="w-4 h-4 text-emerald-600" />
                      <span className="text-xl font-mono font-black text-slate-800 leading-none">
                        {course.passRate}%
                      </span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right hidden sm:block">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      預計開課學期
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-600 font-bold text-xs mt-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {course.semester}
                    </span>
                  </div>

                  {/* Enroll Simulation Button */}
                  <button
                    onClick={() => handleEnroll(course)}
                    disabled={isEnrolled}
                    className={`
                      px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer shrink-0 w-full md:w-auto text-center
                      ${isEnrolled 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-[#1E3A5F] hover:bg-[#142843] text-white shadow-sm hover:shadow active:scale-[0.98]'}
                    `}
                  >
                    {isEnrolled ? (
                      <span className="flex items-center justify-center gap-1 font-extrabold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                        已模擬排課
                      </span>
                    ) : (
                      <span>一鍵模擬排入</span>
                    )}
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Sorting / logic disclaimer explanation */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-500 space-y-2">
        <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
          <ThumbsUp className="w-4 h-4 text-[#1E3A5F]" />
          大數據排序指標與推薦說明：
        </span>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>同儕通過率：</strong>分析自資科系近 5 年修課人數在 85 人以上、獲得等第大於等於 <code>C</code> 的畢業生比例。通過率高意味著重修風險極低。</li>
          <li><strong>一鍵模擬排入：</strong>若您暫沒開課規章，可以點擊此按鈕，系統會將此科目附加進 LocalStorage 學術成績單。此時可以前往「進度總覽」直接檢視您的畢業總學分是否隨之被點亮，極度便於大四學生提前規劃自辦修業抵扣。</li>
        </ul>
      </div>

    </div>
  );
}
