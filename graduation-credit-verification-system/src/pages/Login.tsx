import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, User, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { graduationService } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('110306078');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await graduationService.login(studentId, password);
      if (response.success) {
        localStorage.setItem('isLoggedIn', 'true');
        navigate('/dashboard');
      } else {
        setError('登入失敗，請確認學號或密碼是否正確。');
      }
    } catch (err: any) {
      setError(err.message || '系統錯誤，請稍後再試。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-12 min-h-[550px] border border-slate-200">
        
        {/* Left Side: Editorial Banner Accent (SaaS Vibe) */}
        <div className="md:col-span-5 bg-[#1E3A5F] p-8 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle graphic background pattern */}
          <div className="absolute inset-0 bg-radial-at-t from-[#1E3A5F] via-[#102a43] to-[#0c1b2d] opacity-90 z-0"></div>
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-white/15 backdrop-blur-md rounded-xl text-white">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-widest text-blue-200">NCCU SYSTEM</h1>
                <p className="text-lg font-black tracking-tight">國立政治大學</p>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <h2 className="text-2xl font-bold tracking-tight leading-tight">畢業學分檢核系統</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                整合「修課名細規畫、通識與必選修檢定、補修課程推薦、跨棟走動預警」之新世代 SaaS 檢核系統。
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4 pt-10 border-t border-white/10">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-100">即時演算與 CSV 載入</h4>
                <p className="text-[11px] text-slate-400">一秒拖拽校務系統 CSV，自動化比對畢業標準學分，無須等待手動校核。</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-100">畢業門檻與英檢比對</h4>
                <p className="text-[11px] text-slate-400">一併分析英文畢業門檻與體育必修學期，提供最完整的學分合格圖章。</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-[10px] text-slate-500 font-mono mt-4">
            Graduation Credit Verification System Prototype v1.0
          </div>
        </div>

        {/* Right Side: Elegant Minimalist Form */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">學術登入首頁</h3>
              <p className="text-sm text-slate-500">
                請輸入學生資訊門戶（Inis-feeling）之教務帳密。
              </p>
            </div>

            {error && (
              <div id="login-error-alert" className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-sm font-semibold">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5" htmlFor="student-id">
                  學年學號 (Student ID)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <User className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="student-id"
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="請輸入學號，例如: 110306078"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15 transition font-mono text-sm"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  測試學號已輸入：110306078（資科系 聖結石）
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5" htmlFor="password">
                  系統密碼 (Password)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <Lock className="w-4.5 h-4.5" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="請輸入註冊密碼"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-[#1E3A5F] focus:ring-2 focus:ring-[#1E3A5F]/15 transition font-mono text-sm"
                  />
                </div>
              </div>

              {/* Convenience account hints for testing */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-1">
                <span className="text-[11px] font-extrabold text-slate-500 block uppercase tracking-wide">
                  原型體驗快速提示
                </span>
                <p className="text-xs text-slate-600 leading-snug">
                  系統已對接 Python FastAPI 後端（http://127.0.0.1:8000）。請輸入已註冊的學年學期帳密。測試學號為：110306078，密碼：password123。
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E3A5F] hover:bg-[#142843] text-white py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-900/10 active:scale-[0.98]"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>登入學位審查系統</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400 font-medium">
                國立政治大學教務處課務組委製 · 1122 專案小組
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
