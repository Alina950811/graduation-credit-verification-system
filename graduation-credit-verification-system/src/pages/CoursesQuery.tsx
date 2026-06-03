import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, BookOpen, Trash2, FileSpreadsheet, PlusCircle } from 'lucide-react';
import { graduationService } from '../services/api';
import { CourseRecord } from '../types';
import { Link } from 'react-router-dom';

export default function CoursesQuery() {
  const [records, setRecords] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const data = await graduationService.getCourseRecords();
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const triggerDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleteTarget(null);
    await graduationService.deleteCourseRecord(id);
    showToast(`已成功移除【${name}】科目`);
    fetchRecords();
  };

  // Extract unique semesters for dropdown filter
  const semesters = Array.from(new Set(records.map(r => r.semester)));

  // Filter records
  const filteredRecords = records.filter(r => {
    const matchesSearch = r.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.courseId.includes(searchQuery);
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    const matchesSem = semesterFilter === 'all' || r.semester === semesterFilter;
    return matchesSearch && matchesType && matchesSem;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#1E3A5F] text-white px-5 py-3 rounded-lg shadow-xl text-sm font-semibold border border-blue-900 animate-slide-in">
          {toast}
        </div>
      )}

      {/* Header text */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">修課紀錄與學分查詢 (Course Enrollment Query)</h2>
          <p className="text-sm text-slate-500 mt-1">
            在這裡您可以查詢已錄入之歷年修課數據、篩選特定通識領域、或手動更動成績等第。
          </p>
        </div>
        <Link 
          to="/upload" 
          className="px-4 py-2.5 bg-[#1E3A5F] hover:bg-[#142843] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-900/10"
        >
          <PlusCircle className="w-4 h-4" />
          <span>上傳與手動新增</span>
        </Link>
      </div>

      {/* Filters block */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-505" />
          篩選工具箱 (Query Filters)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Keyword Search */}
          <div>
            <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1.5">
              搜尋關鍵字 (代號/科名)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                placeholder="例如：計算機、演算法、703..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#1E3A5F]"
              />
            </div>
          </div>

          {/* Classification type filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1.5">
              依修課別過濾 (Category)
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none bg-white"
            >
              <option value="all">顯示全部類別</option>
              <option value="required">核心系必修</option>
              <option value="elective">專業選修</option>
              <option value="general">通識學分</option>
              <option value="pe">體育課程</option>
              <option value="english">外文檢定/大學英文</option>
            </select>
          </div>

          {/* Semester filter */}
          <div>
            <label className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1.5">
              依修讀學期過濾 (Semester)
            </label>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none bg-white"
            >
              <option value="all">顯示全部學期</option>
              {semesters.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Main Table card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">搜尋運算中...</div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileSpreadsheet className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-sm font-semibold">查無符合您指定學術篩選條件的課業紀錄</p>
              <p className="text-xs text-slate-400">請嘗試更改關鍵字或重設過濾條件</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest border-b border-slate-150">
                  <th className="px-6 py-3.5">學年度第一/二學期</th>
                  <th className="px-6 py-3.5">課程代碼</th>
                  <th className="px-6 py-3.5">課程名稱 (Course Title)</th>
                  <th className="px-6 py-3.5">修業分類</th>
                  <th className="px-6 py-3.5 text-center">學分數</th>
                  <th className="px-6 py-3.5 text-center">最終等第</th>
                  <th className="px-6 py-3.5 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-xs text-slate-700">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-3.5 text-slate-400">{r.semester}</td>
                    <td className="px-6 py-3.5 font-mono text-slate-500">{r.courseId}</td>
                    <td className="px-6 py-3.5 font-bold text-slate-900">{r.courseName}</td>
                    <td className="px-6 py-3.5">
                      <span className={`
                        px-2 py-0.5 rounded-full text-[10px] font-black
                        ${r.type === 'required' ? 'bg-indigo-50 text-indigo-805' : ''}
                        ${r.type === 'elective' ? 'bg-emerald-50 text-emerald-805' : ''}
                        ${r.type === 'general' ? 'bg-amber-50 text-amber-805' : ''}
                        ${r.type === 'pe' ? 'bg-cyan-50 text-cyan-850' : ''}
                        ${r.type === 'english' ? 'bg-rose-50 text-rose-805' : ''}
                      `}>
                        {r.type === 'required' ? '系必修' : ''}
                        {r.type === 'elective' ? '專業選修' : ''}
                        {r.type === 'general' ? '通識課' : ''}
                        {r.type === 'pe' ? '體育課' : ''}
                        {r.type === 'english' ? '英檢/英文' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center font-mono font-extrabold text-slate-800">{r.credits}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-black text-[#1E3A5F]">{r.grade}</td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => triggerDelete(r.id, r.courseName)}
                        className="text-slate-400 hover:text-red-650 p-1 rounded hover:bg-slate-50 transition cursor-pointer"
                        title="自學籍成績刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              確定要刪除修課科目嗎？
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              您即將自歷年學習軌跡中清除 <strong className="text-slate-900">【{deleteTarget.name}】</strong>的紀錄。此動作將即時變更您的學分總度量與畢業完成度！
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                取消
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm hover:shadow-red-600/20 shadow-red-600/10 transition"
              >
                確定永久刪除
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
