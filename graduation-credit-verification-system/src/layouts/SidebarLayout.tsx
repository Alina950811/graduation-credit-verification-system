import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UploadCloud, 
  BookOpen, 
  Award, 
  Sparkles, 
  LogOut, 
  Menu, 
  X, 
  User, 
  GraduationCap,
  RefreshCw,
  Bell,
  HelpCircle,
  Database
} from 'lucide-react';
import { graduationService } from '../services/api';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studentName, setStudentName] = useState('聖結石');
  const [studentId, setStudentId] = useState('110306078');
  const [dept, setDept] = useState('資訊科學系');
  const [resetting, setResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    // Authenticate check
    const authed = localStorage.getItem('isLoggedIn');
    if (!authed) {
      navigate('/login');
    }

    try {
      const studentData = JSON.parse(localStorage.getItem('student_dashboard') || '{}');
      if (studentData.studentName) {
        setStudentName(studentData.studentName);
        setStudentId(studentData.studentId);
        setDept(studentData.department?.split(' ')[0] || '資訊科學系');
      }
    } catch (e) {
      console.error(e);
    }
  }, [navigate, location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const triggerResetData = () => {
    setShowResetConfirm(true);
  };

  const handleResetData = async () => {
    setShowResetConfirm(false);
    setResetting(true);
    await graduationService.resetData();
    setResetting(false);
    showToast('資料已成功還原為初始 106 學分狀態！');
    // Reload current page to refresh active state
    window.location.reload();
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const navItems = [
    { name: '進度總覽', path: '/dashboard', icon: LayoutDashboard },
    { name: '上傳修課 CSV', path: '/upload', icon: UploadCloud },
    { name: '修課紀錄查詢', path: '/courses', icon: BookOpen },
    { name: '畢業規則檢核', path: '/check', icon: Award },
    { name: '補修課程推薦', path: '/recommendations', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row font-sans relative antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 border border-slate-700 animate-slide-in">
          <Database className="w-5 h-5 text-emerald-400 animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Mobile Header Bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#1E3A5F] text-white rounded-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xs font-bold leading-none tracking-wider text-slate-500">MOCK SaaS</h1>
            <span className="text-sm font-extrabold text-[#1E3A5F]">畢業學分檢核系統</span>
          </div>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:w-64 md:h-screen shrink-0
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div>
          {/* Logo Brand Title */}
          <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200 bg-slate-50/50">
            <div className="p-1.5 bg-[#1E3A5F] text-white rounded-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">GRADUATION SAAS</h1>
              <span className="text-base font-extrabold text-[#1E3A5F] tracking-tight">畢業學分檢核</span>
            </div>
            {mobileMenuOpen && (
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="ml-auto p-1 text-slate-400 hover:text-slate-600 md:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Student Status Profile Badge */}
          <div className="p-4 mx-3 my-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center">
                <User className="text-slate-500 w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                  {studentName}
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="已登入"></span>
                </div>
                <div className="text-xs text-slate-500 tracking-wider font-mono">{studentId}</div>
              </div>
            </div>
            <div className="text-xs font-semibold text-[#1E3A5F] px-1 bg-[#1E3A5F]/10 py-1 rounded text-center truncate">
              {dept}
            </div>
          </div>

          {/* Nav list */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition
                    ${isActive 
                      ? 'bg-[#1E3A5F] text-white shadow-sm shadow-blue-900/10' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Utility controls */}
        <div className="p-3 border-t border-slate-200 space-y-1 bg-slate-50/50">
          <button
            onClick={triggerResetData}
            disabled={resetting}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-200 hover:text-amber-800 transition text-left"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-400 shrink-0 ${resetting ? 'animate-spin' : ''}`} />
            <span>{resetting ? '還原中...' : '還原 Mock 測試資料'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 hover:text-red-800 transition text-left"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>登出學術學籍</span>
          </button>

          <div className="pt-2 text-center text-[10px] text-slate-400 border-t border-slate-200 font-mono">
            v1.0.0-PROTOTYPE
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 md:h-screen md:overflow-y-auto">
        {/* Top Navbar Header */}
        <header className="hidden md:flex h-16 items-center justify-between px-8 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-500 font-mono">
              學年學期：112 學年度第二學期
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span className="text-xs bg-cyan-100 text-cyan-800 px-2.5 py-0.5 rounded-full font-bold">
              國立政治大學 (模擬環境)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition relative">
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              <Bell className="w-4 h-4" />
            </button>
            <button 
              onClick={() => showToast('提示：系統會自學生的 CSV 提取必選修並即時檢核！')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="h-6 w-px bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">{studentName} 同學</span>
              <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono">資科四</span>
            </div>
          </div>
        </header>

        {/* Content View Container */}
        <div className="flex-1 p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Custom Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-up">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500 animate-spin" />
              確定要還原測試資料嗎？
            </h3>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              重設後會將修課紀錄還原為初始的 <strong className="text-slate-800">106 畢業學分 (聖結石學生範例)</strong>，這會清除你手動新增或上傳的所有外部 CSV 資料。
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
              >
                取消
              </button>
              <button
                onClick={handleResetData}
                className="px-4 py-2 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg shadow-sm hover:shadow-amber-600/20 shadow-amber-600/10 transition animate-pulse"
              >
                確定重設資料
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
