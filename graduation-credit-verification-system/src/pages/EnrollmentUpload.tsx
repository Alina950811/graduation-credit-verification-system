import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Trash2, 
  FileSpreadsheet, 
  History, 
  Plus, 
  Info, 
  AlertCircle,
  Database,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { graduationService } from '../services/api';
import { CourseRecord } from '../types';

export default function EnrollmentUpload() {
  const [records, setRecords] = useState<CourseRecord[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [newSemester, setNewSemester] = useState('113學年度第一學期');
  const [newCourseId, setNewCourseId] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCredits, setNewCredits] = useState(3);
  const [newGrade, setNewGrade] = useState('A');
  const [newType, setNewType] = useState<'required' | 'elective' | 'general' | 'pe' | 'english'>('elective');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'warning' | 'error' } | null>(null);

  // CSV Template text to copy
  const csvTemplate = `學期,課程代號,課程名稱,學分,成績,修別
113學年度第一學期,703013001,計算機網路,3,A+,required
113學年度第一學期,703014001,編譯器設計,3,A,required
113學年度第一學期,000317024,通識：全球科技革命與人類文明,2,Pass,general
113學年度第一學期,000103001,進階英文學分班,3,A-,english`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await graduationService.getCourseRecords();
      setRecords(data);
      const hist = await graduationService.getUploadHistory();
      setHistory(hist);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Drag handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      showToast('請務必上傳 .csv 副檔名檔案！', 'warning');
      return;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        try {
          const res = await graduationService.parseAndImportCSV(text, file.name);
          showToast(`成功匯入 ${res.importedCount} 筆修課學期記錄！學分進度已即時更新。`);
          fetchData();
        } catch (err: any) {
          showToast(err.message || 'CSV 讀取失敗，請確認編碼與格式。', 'error');
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (e) {
      console.error(e);
      setUploading(false);
    }
  };

  // Pre-configured custom quick injection
  const injectMockCSV = async () => {
    setUploading(true);
    try {
      const res = await graduationService.parseAndImportCSV(csvTemplate, "113_graduation_compulsory_completed.csv");
      showToast(`一鍵補齊成功！匯入 ${res.importedCount} 筆修課（包含計網與編譯器），系必修及英檢已完全點亮綠燈！`);
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Add individual manual course record
  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseId || !newCourseName) {
      showToast('請填寫課程代號與名稱！', 'warning');
      return;
    }

    try {
      await graduationService.addCourseRecord({
        semester: newSemester,
        courseId: newCourseId,
        courseName: newCourseName,
        credits: Number(newCredits),
        grade: newGrade,
        type: newType
      });

      setNewCourseId('');
      setNewCourseName('');
      showToast(`已手動登載【${newCourseName}】 ${newCredits} 學分`);
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Delete record
  const handleDeleteRecord = async (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  const confirmDeleteRecord = async () => {
    if (!deleteTarget) return;
    const { id, name } = deleteTarget;
    setDeleteTarget(null);
    await graduationService.deleteCourseRecord(id);
    showToast(`已移除【${name}】課業資料`);
    fetchData();
  };

  return (
    <div className="space-y-8">
      
      {/* Toast Alert Banner */}
      {toast && (
        <div className={`
          p-4 rounded-xl flex items-center justify-between shadow-sm border animate-fade-in
          ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ''}
          ${toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' : ''}
          ${toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : ''}
        `}>
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />}
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
          <button 
            onClick={() => setToast(null)} 
            className={`
              text-xs font-bold hover:underline shrink-0 ml-3
              ${toast.type === 'success' ? 'text-emerald-700' : ''}
              ${toast.type === 'warning' ? 'text-amber-700' : ''}
              ${toast.type === 'error' ? 'text-rose-700' : ''}
            `}
          >
            關閉
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">上傳修課紀錄 CSV</h2>
          <p className="text-sm text-slate-500 mt-1">
            上傳國立政治大學學籍成績網產出之 CSV 成績單，系統會實時解析、對齊修業法規。
          </p>
        </div>
        
        {/* Quick helper mock trigger */}
        <button
          onClick={injectMockCSV}
          disabled={uploading}
          className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-155 border border-indigo-200 hover:border-indigo-300 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-2 hover:shadow"
        >
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>體驗一鍵補齊：注入畢業 CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Drag Drop File Area + Paste Box */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#1E3A5F] px-1 uppercase tracking-wider">CSV 電腦上傳區</h3>
            
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`
                border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition min-h-[220px] relative
                ${dragActive ? 'border-[#1E3A5F] bg-blue-50/50' : 'border-slate-200 hover:border-slate-350'}
              `}
            >
              <input 
                type="file" 
                id="csv-file-picker"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              {uploading ? (
                <div className="space-y-3">
                  <div className="w-10 h-10 border-4 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm font-semibold text-slate-600">正在極速解析課程網 CSV 並計算大一到大四學分...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 text-slate-500 rounded-full inline-block mx-auto border border-slate-100">
                    <UploadCloud className="w-8 h-8 text-[#1E3A5F]" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-[#1E3A5F]">拖曳 CSV 檔案至此處，或點擊選取檔案</p>
                    <p className="text-xs text-slate-400 mt-1">僅支援副檔名為 .csv 的標準歷年成績單導出格式</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-500 space-y-0.5">
                <span className="font-bold text-slate-700 block">政務系統 CSV 格式參考：</span>
                <p>首行需包含：<code>學期,課程代號,課程名稱,學分,成績,修別</code></p>
                <p>修別格式應為：<code>required(系必修)</code>, <code>elective(選修)</code>, <code>general(通識)</code>, <code>pe(體育)</code>, <code>english(英文/英檢)</code></p>
              </div>
            </div>
          </div>

          {/* Quick Copy Paste Sandbox Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#1E3A5F] px-1 uppercase tracking-wider">
              複製貼上班級實體 (Sandbox Import)
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              若無現成成績單，可直接複製下方預設文字，黏貼於匯入框中以模擬上傳：
            </p>
            <div className="relative">
              <textarea
                className="w-full h-32 p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F] outline-none"
                readOnly
                value={csvTemplate}
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(csvTemplate);
                  showToast('CSV 範本已複製至剪貼簿！可貼上並自訂修改測試。', 'success');
                }}
                className="absolute top-2 right-2 text-[10px] uppercase font-bold tracking-wider bg-white border border-slate-200 hover:bg-slate-55 px-2 py-1 rounded text-[#1E3A5F] shadow-sm cursor-pointer"
              >
                複製代碼
              </button>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                黏貼 CSV 格式純文字（可自由更動下列成绩、學分，點擊一鍵運行）：
              </label>
              <textarea
                id="csv-text-paste"
                className="w-full h-24 p-3 font-mono text-xs border border-slate-200 rounded-xl hover:border-slate-350 outline-none"
                placeholder="在此貼上或填入 CSV 自訂資料..."
              />
              <button
                onClick={async () => {
                  const area = document.getElementById('csv-text-paste') as HTMLTextAreaElement;
                  if (!area || !area.value.trim()) {
                    showToast('請先填入 CSV 純文字內容！', 'warning');
                    return;
                  }
                  setUploading(true);
                  try {
                    const res = await graduationService.parseAndImportCSV(area.value, "pasted_text_grades.csv");
                    showToast(`成功解析貼上內容，順利匯入 ${res.importedCount} 門學科！`);
                    area.value = '';
                    fetchData();
                  } catch (err: any) {
                    showToast(err.message || '解析失敗', 'error');
                  } finally {
                    setUploading(false);
                  }
                }}
                className="mt-2.5 px-4 py-2 bg-[#1E3A5F] hover:bg-[#142843] text-white text-xs font-bold rounded-lg transition shrink-0 cursor-pointer"
              >
                運行文字解析匯入
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Hand-Add manual row + Upload History */}
        <div className="space-y-6">
          
          {/* Manual Entry Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#1E3A5F] uppercase tracking-wider">手動單筆登載</h3>
            
            <form onSubmit={handleAddManual} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">學期</label>
                <select 
                  value={newSemester}
                  onChange={(e) => setNewSemester(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none bg-white"
                >
                  <option value="113學年度第一學期">113 學期第一學期 (秋)</option>
                  <option value="112學年度第二學期">112 學期第二學期 (春)</option>
                  <option value="112學年度第一學期">112 學期第一學期 (秋)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">代號</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="703001"
                    value={newCourseId}
                    onChange={(e) => setNewCourseId(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">修別</label>
                  <select 
                    value={newType}
                    onChange={(e: any) => setNewType(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium bg-white outline-none"
                  >
                    <option value="required">系必修</option>
                    <option value="elective">專業選修</option>
                    <option value="general">一般通識</option>
                    <option value="pe">體育必修</option>
                    <option value="english">英文檢定</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">課程名稱</label>
                <input 
                  type="text" 
                  required 
                  placeholder="例如：計算機網路"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">學分</label>
                  <input 
                    type="number" 
                    required 
                    min="0"
                    max="10"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">等第成績</label>
                  <select 
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-medium bg-white outline-none"
                  >
                    <option value="A+">A+ (非常優秀)</option>
                    <option value="A">A (優秀)</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B">B</option>
                    <option value="B-">B-</option>
                    <option value="C">C (及格)</option>
                    <option value="Pass">Pass (通過)</option>
                    <option value="F">F (不及格)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1E3A5F] hover:bg-[#142843] text-white py-2 px-4 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                登載這筆歷年成绩
              </button>
            </form>
          </div>

          {/* Recent History Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-[#1E3A5F] uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              歷次 CSV 上傳紀錄
            </h3>
            
            <div className="space-y-2.5">
              {history.map((h) => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-start">
                  <div>
                    <p className="font-extrabold text-slate-800 break-all">{h.filename}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{h.uploadAt} · {h.fileSize}</p>
                    <span className="inline-block mt-1 bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-extrabold">
                      {h.status}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-slate-700">{h.recordsCount} 門課</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Database Course Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-md font-bold text-slate-900">學籍歷年修課明細資料庫</h3>
            <p className="text-xs text-slate-500 mt-0.5">累計收錄之成績資料科目。點擊刪除圖標，即時觀察畢業預警變化。</p>
          </div>
          <span className="bg-slate-200 text-slate-800 font-mono font-bold text-xs px-2.5 py-1 rounded-full">
            共 {records.length} 項科目
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-slate-400">載入中...</div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-slate-400 space-y-2">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold">資料庫暫無成績單資料。請在上方上傳 CSV 解鎖完整功能！</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-widest border-b border-slate-150">
                  <th className="px-6 py-3.5">學年學期</th>
                  <th className="px-6 py-3.5">課程代碼</th>
                  <th className="px-6 py-3.5">課程名稱</th>
                  <th className="px-6 py-3.5">類別</th>
                  <th className="px-6 py-3.5 text-center">學分</th>
                  <th className="px-6 py-3.5 text-center">等第成績</th>
                  <th className="px-6 py-3.5 text-center">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-sm text-slate-700">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-3.5 text-slate-500">{r.semester}</td>
                    <td className="px-6 py-3.5 font-mono text-xs">{r.courseId}</td>
                    <td className="px-6 py-3.5 font-extrabold text-[#1E3A5F]">{r.courseName}</td>
                    <td className="px-6 py-3.5">
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-bold
                        ${r.type === 'required' ? 'bg-indigo-100 text-indigo-800' : ''}
                        ${r.type === 'elective' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${r.type === 'general' ? 'bg-amber-100 text-amber-805' : ''}
                        ${r.type === 'pe' ? 'bg-cyan-100 text-cyan-800' : ''}
                        ${r.type === 'english' ? 'bg-rose-100 text-rose-800' : ''}
                      `}>
                        {r.type === 'required' ? '系必修' : ''}
                        {r.type === 'elective' ? '專業選修' : ''}
                        {r.type === 'general' ? '通識課' : ''}
                        {r.type === 'pe' ? '體育課' : ''}
                        {r.type === 'english' ? '英檢/英文' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-center font-mono font-bold">{r.credits}</td>
                    <td className="px-6 py-3.5 text-center font-mono font-extrabold text-blue-900">{r.grade}</td>
                    <td className="px-6 py-3.5 text-center">
                      <button
                        onClick={() => handleDeleteRecord(r.id, r.courseName)}
                        className="text-slate-400 hover:text-red-650 p-1 rounded hover:bg-slate-100 transition inline-block cursor-pointer"
                        title="自學籍表中刪除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        {/* Database Table layout end */}
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-4">
              <Trash2 className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              確認從修課紀錄中刪除嗎？
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              您即將從學籍成績庫中永久刪除 <strong className="text-slate-900">【{deleteTarget.name}】</strong>科目的修課與成績資料。這會重新動態修正與連帶更新您的所有畢業學分及檢核結果！
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteRecord}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg shadow-sm hover:shadow-red-600/20 shadow-red-600/10 transition"
              >
                確認清除
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
