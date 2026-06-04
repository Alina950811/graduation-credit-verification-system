import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  BookOpen, 
  ShieldAlert, 
  ChevronRight, 
  CheckCircle, 
  HelpCircle, 
  Info, 
  Sparkles, 
  AlertTriangle, 
  ArrowUpRight, 
  GraduationCap
} from 'lucide-react';
import { graduationService } from '../services/api';
import { StudentDashboard } from '../types';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      try {
        const data = await graduationService.getDashboardData();
        if (active) {
          setDashboard(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboard();
    return () => {
      active = false;
    };
  }, []);

  if (loading || !dashboard) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 rounded-2xl"></div>
          <div className="h-96 bg-slate-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  // Calculate percentages
  const totalTarget = dashboard.totalRequiredCredits;
  const totalCompleted = dashboard.totalCompletedCredits;
  const totalPercent = Math.min(100, Math.round((totalCompleted / totalTarget) * 100));

  // Category percentages
  const reqPercent = Math.min(100, Math.round((dashboard.categoryProgress.required.completed / dashboard.categoryProgress.required.target) * 100));
  const elecPercent = Math.min(100, Math.round((dashboard.categoryProgress.elective.completed / dashboard.categoryProgress.elective.target) * 100));
  const genPercent = Math.min(100, Math.round((dashboard.categoryProgress.general.completed / dashboard.categoryProgress.general.target) * 100));
  const pePercent = Math.min(100, Math.round((dashboard.categoryProgress.pe.completed / dashboard.categoryProgress.pe.target) * 100));

  // Dynamically calculate graduation risk alerts based on backend credit-check results
  const alertsList = [];

  // 1. Required courses missing
  if (dashboard.missingRequiredCount > 0) {
    alertsList.push({
      id: 'required-missing',
      type: 'danger',
      title: `系必修學科欠修 (${dashboard.missingRequiredCount} 門)`,
      description: `系統未偵測到以下必修學科的通過紀錄：${dashboard.missingRequiredCourses && dashboard.missingRequiredCourses.length > 0 ? dashboard.missingRequiredCourses.map(name => `【${name}】`).join('、') : "計算機網路、編譯器設計"}，極容易遭遇延畢。`,
      link: '/recommendations',
      linkText: '看推薦安排補修 →',
      icon: 'shield-alert'
    });
  }

  // 2. General credits missing
  const missingGeneral = dashboard.categoryProgress.general.target - dashboard.categoryProgress.general.completed;
  if (missingGeneral > 0) {
    alertsList.push({
      id: 'general-missing',
      type: 'warning',
      title: `通識學分不足 (缺 ${missingGeneral} 學分)`,
      description: `政大最低要求 ${dashboard.categoryProgress.general.target} 通識學分，目前已修 ${dashboard.categoryProgress.general.completed} 學分，尚缺 ${missingGeneral} 學分。`,
      link: '/courses',
      linkText: '查看已修通識科目 →',
      icon: 'alert-triangle'
    });
  }

  // 3. Elective credits missing
  const missingElective = dashboard.categoryProgress.elective.target - dashboard.categoryProgress.elective.completed;
  if (missingElective > 0) {
    alertsList.push({
      id: 'elective-missing',
      type: 'warning',
      title: `專業選修學分不足 (缺 ${missingElective} 學分)`,
      description: `畢業規範要求至少 ${dashboard.categoryProgress.elective.target} 專業選修學分，您目前已修得 ${dashboard.categoryProgress.elective.completed} 學分，尚缺 ${missingElective} 學分。`,
      link: '/courses',
      linkText: '查看專業選修紀錄 →',
      icon: 'alert-triangle'
    });
  }

  // 4. PE semesters missing
  const missingPe = dashboard.categoryProgress.pe.target - dashboard.categoryProgress.pe.completed;
  if (missingPe > 0) {
    alertsList.push({
      id: 'pe-missing',
      type: 'warning',
      title: `體育必修學期不足 (缺 ${missingPe} 學期)`,
      description: `體育需修滿 ${dashboard.categoryProgress.pe.target} 學期，目前僅修 ${dashboard.categoryProgress.pe.completed} 學期。`,
      link: '/check',
      linkText: '檢視體育畢業規則 →',
      icon: 'alert-triangle'
    });
  }

  // 5. English proficiency not passed
  if (!dashboard.categoryProgress.english.completed) {
    alertsList.push({
      id: 'english-pending',
      type: 'danger',
      title: '英文檢定門檻未通過',
      description: '外文英檢畢業門檻尚未通過。請盡速提交 TOEIC 785 分以上或同等英檢證明，或於大四修讀英文學分班。',
      link: '/check',
      linkText: '查看英檢檢定細則 →',
      icon: 'shield-alert'
    });
  }

  // 6. Minimum total credits missing
  const missingTotal = 128 - totalCompleted;
  if (missingTotal > 0) {
    alertsList.push({
      id: 'total-missing',
      type: 'danger',
      title: `畢業總學分不足 (缺 ${missingTotal} 學分)`,
      description: `畢業審查要求最低 128 總學分，您目前累計僅修得 ${totalCompleted} 學分，尚缺 ${missingTotal} 學分。您可以透過增修選修科目、通識或自由選修學分來補足。`,
      link: '/upload',
      linkText: '前往上傳修課紀錄 →',
      icon: 'shield-alert'
    });
  }

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner Banner */}
      <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2e5d95] rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
          {/* Decorative cap */}
          <GraduationCap className="h-full w-full object-cover" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-blue-100 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            112-2 畢業學籍即時分析中
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">哈囉，{dashboard.studentName} 同學！</h2>
          <p className="text-slate-200 text-sm md:text-base leading-relaxed">
            系統已根據你最新上傳的修課記錄完成檢核。你目前已累計修得 <span className="text-yellow-300 font-bold font-mono text-lg">{totalCompleted}</span> 學分，
            距離畢業學分門檻還差 <span className="font-extrabold text-white text-md underline decoration-yellow-400 font-mono">{dashboard.missingCredits}</span> 學分。
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link 
              to="/upload" 
              className="px-4 py-2 bg-white text-[#1E3A5F] hover:bg-slate-100 font-bold rounded-xl text-xs transition shadow-sm"
              id="upload-record-fast-btn"
            >
              更新修課紀錄 CSV
            </Link>
            <Link 
              to="/check" 
              className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl text-xs transition border border-white/20"
            >
              檢視畢業規則明細
            </Link>
          </div>
        </div>
      </div>

      {/* Grid STATS Overview Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Core Card 1: Completed Credits */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">已完成學分</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-mono flex items-baseline gap-1">
              {totalCompleted}
              <span className="text-sm font-semibold text-slate-500 font-sans">/ 128 學分</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className="text-xs text-slate-600 font-bold">學期總進度: {totalPercent}%</span>
            </div>
          </div>
          {/* Mini progress line */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${totalPercent}%` }}></div>
          </div>
        </div>

        {/* Core Card 2: Missing Credits */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">尚缺學分</span>
            <div className={`p-2 rounded-lg ${dashboard.missingCredits > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-mono">
              {dashboard.missingCredits}
              <span className="text-sm font-semibold text-slate-500 font-sans"> 學分</span>
            </div>
            <div className="mt-1 text-xs text-slate-500 font-semibold">
              {dashboard.missingCredits > 0 ? '包含通識或系選修缺修' : '學分分量已達標準'}
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-[#1E3A5F] h-full rounded-full transition-all duration-500" style={{ width: `${100 - totalPercent}%` }}></div>
          </div>
        </div>

        {/* Core Card 3: Compulsory missing courses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">缺修系必修</span>
            <div className={`p-2 rounded-lg ${dashboard.missingRequiredCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-900 font-mono">
              {dashboard.missingRequiredCount}
              <span className="text-sm font-semibold text-slate-500 font-sans"> 門課程</span>
            </div>
            <div className="mt-1 text-xs text-rose-600 font-extrabold flex items-center gap-1">
              {dashboard.missingRequiredCount > 0 ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" /> 系統急需您補修此項
                </>
              ) : (
                <span className="text-emerald-600">已全數修讀完成</span>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${dashboard.missingRequiredCount * 20}%` }}></div>
          </div>
        </div>

        {/* Core Card 4: Enrollment Records counted */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">目前學期學籍</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xl font-extrabold text-slate-900">
              {dashboard.currentSemester.split(' ')[0]}
            </div>
            <div className="mt-1 text-xs text-slate-500 font-semibold">
              第 8 學期 (四年級) · 理學院
            </div>
          </div>
          <div className="pt-2 text-xs text-slate-400 border-t border-slate-100 font-mono">
            學號: {dashboard.studentId}
          </div>
        </div>

      </div>

      {/* Main SaaS Layout Section: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Progress breakdown */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">各類別學分完成狀況 (Academic Progress)</h3>
              <p className="text-xs text-slate-500">依政大資訊科學研究所／學士班檢定規章比對</p>
            </div>
            <Link to="/courses" className="text-xs font-bold text-[#1E3A5F] hover:underline flex items-center gap-0.5">
              <span>修課細節查詢</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-5">
            
            {/* Category 1: 系必修 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                  專業必修 (Major Required)
                </span>
                <span className="font-mono">{dashboard.categoryProgress.required.completed} / {dashboard.categoryProgress.required.target} 學分 ({reqPercent}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${reqPercent}%` }}></div>
              </div>
              <p className="text-xs text-slate-400">
                指標 {dashboard.categoryProgress.required.target} 學分是資科系核心。{dashboard.categoryProgress.required.completed >= dashboard.categoryProgress.required.target ? "已全數修滿！" : `尚差 ${dashboard.categoryProgress.required.target - dashboard.categoryProgress.required.completed} 學分修滿。`}
              </p>
            </div>

            {/* Category 2: 系選修 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  專業選修 (Major Elective)
                </span>
                <span className="font-mono">{dashboard.categoryProgress.elective.completed} / {dashboard.categoryProgress.elective.target} 學分 ({elecPercent}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${elecPercent}%` }}></div>
              </div>
              <p className="text-xs text-slate-400">
                已獲 {dashboard.categoryProgress.elective.completed} 學分。{dashboard.categoryProgress.elective.completed >= dashboard.categoryProgress.elective.target ? "已安全達標！" : `尚需選修課程，累計不達指標 ${dashboard.categoryProgress.elective.target} 學分，尚缺 ${dashboard.categoryProgress.elective.target - dashboard.categoryProgress.elective.completed} 學分。`}
              </p>
            </div>

            {/* Category 3: 通識 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  一般通識 (General Education)
                </span>
                <span className="font-mono">{dashboard.categoryProgress.general.completed} / {dashboard.categoryProgress.general.target} 學分 ({genPercent}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${genPercent}%` }}></div>
              </div>
              <p className="text-xs text-slate-400">
                最低需求 {dashboard.categoryProgress.general.target} 通識學分，目前已修 {dashboard.categoryProgress.general.completed} 學分。{dashboard.categoryProgress.general.completed >= dashboard.categoryProgress.general.target ? "已全數修滿！" : `尚缺 ${dashboard.categoryProgress.general.target - dashboard.categoryProgress.general.completed} 學分通識課程。`}
              </p>
            </div>

            {/* Category 4: 體育 */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
                  體育必修 (PE Semesters)
                </span>
                <span className="font-mono">{dashboard.categoryProgress.pe.completed} / {dashboard.categoryProgress.pe.target} 學期 ({pePercent}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-cyan-600 h-full rounded-full transition-all duration-500" style={{ width: `${pePercent}%` }}></div>
              </div>
              <p className="text-xs text-slate-400">
                體育修滿 {dashboard.categoryProgress.pe.target} 個學期即可通過畢業體育門檻。目前已修 {dashboard.categoryProgress.pe.completed} / {dashboard.categoryProgress.pe.target} 學期。
              </p>
            </div>

            {/* Category 5: 英文檢定 */}
            <div className="p-3.5 bg-slate-55 rounded-xl border border-dotted border-slate-200 flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700 flex items-center gap-2">
                <span className="inline-block w-4 h-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold">!</span>
                外文英檢門檻 (Graduation English Requirement)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${dashboard.categoryProgress.english.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-150 text-rose-800'}`}>
                {dashboard.categoryProgress.english.completed ? '已通過 (Pass)' : '未核准 (Pending)'}
              </span>
            </div>

          </div>
        </div>

        {/* Right Column: Status Summary Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#1E3A5F]">系統重點風險預警</h3>
              <span className={`text-xs px-2.5 py-0.5 rounded font-bold ${
                alertsList.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {alertsList.length} 項待辦
              </span>
            </div>

            <div className="space-y-3">
              
              {alertsList.length > 0 ? (
                alertsList.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`p-3 rounded-xl border flex gap-2.5 animate-slide-in ${
                      alert.type === 'danger' 
                        ? 'bg-rose-50/50 border-rose-100' 
                        : 'bg-amber-50/50 border-amber-100'
                    }`}
                  >
                    {alert.icon === 'shield-alert' ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">{alert.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {alert.description}
                      </p>
                      <Link to={alert.link} className={`text-[11px] font-bold block mt-1 ${
                        alert.type === 'danger' ? 'text-rose-700 hover:text-rose-900' : 'text-amber-800 hover:text-amber-950'
                      }`}>
                        {alert.linkText}
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex gap-2.5 items-center justify-center text-emerald-800 animate-fade-in">
                  <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-center">恭喜！您已完成所有畢業與學分門檻要求，目前無任何待辦預警。</span>
                </div>
              )}

            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-2">如何增加學分進度？</h4>
            <ol className="text-[11px] text-slate-500 list-decimal pl-4 space-y-1">
              <li>下載政大校務資訊系統的<strong>歷年學籍成績單 CSV</strong>。</li>
              <li>點擊側欄「上傳修課紀錄 CSV」，拖曳將其匯入系統。</li>
              <li>系統將進行實時計算，即時點亮合格圖章，並修正缺漏建議。</li>
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}
