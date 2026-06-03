import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  Shuffle, 
  Compass, 
  HelpCircle,
  Footprints,
  Info
} from 'lucide-react';
import { graduationService } from '../services/api';
import { ClassroomTransit } from '../types';

export default function ClassroomWarning() {
  const [transits, setTransits] = useState<ClassroomTransit[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<'all' | 'tuesday' | 'wednesday' | 'friday'>('all');

  useEffect(() => {
    let active = true;
    const fetchTransits = async () => {
      try {
        setLoading(true);
        const data = await graduationService.getClassroomTransits();
        if (active) {
          setTransits(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchTransits();
    return () => {
      active = false;
    };
  }, []);

  const getStatusConfig = (status: 'safe' | 'risk' | 'late') => {
    switch (status) {
      case 'safe':
        return {
          title: "安全 (Safe)",
          cardBorder: "border-emerald-200 hover:border-emerald-300",
          itemBg: "bg-emerald-50",
          textClass: "text-emerald-800",
          iconColor: "text-emerald-600",
          badgeBg: "bg-emerald-100 text-emerald-800"
        };
      case 'risk':
        return {
          title: "有遲到風險 (At Risk)",
          cardBorder: "border-amber-200 hover:border-amber-300 shadow-sm",
          itemBg: "bg-amber-50/50",
          textClass: "text-amber-805",
          iconColor: "text-amber-600",
          badgeBg: "bg-amber-100 text-amber-800"
        };
      case 'late':
        return {
          title: "高機率趕不上 (Severe Delay)",
          cardBorder: "border-rose-300 hover:border-rose-450 shadow-sm animate-pulse",
          itemBg: "bg-rose-50/30",
          textClass: "text-rose-800",
          iconColor: "text-rose-600",
          badgeBg: "bg-rose-100 text-rose-800"
        };
    }
  };

  const filteredTransits = transits.filter(t => {
    if (selectedDay === 'all') return true;
    if (selectedDay === 'tuesday' && t.period.includes('週二')) return true;
    if (selectedDay === 'wednesday' && t.period.includes('週三')) return true;
    if (selectedDay === 'friday' && t.period.includes('週五')) return true;
    return false;
  });

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">教室走動與連堂預警 (Classroom Transit Alert)</h2>
        <p className="text-sm text-slate-500 mt-1">
          分析當學期連續堂課（連堂）的下課教室與上課教室。防患於「政大山下爬山上」之長征走動遲到，避免體育課或跨系連堂不及格。
        </p>
      </div>

      {/* Filter and overview metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Status card summaries */}
        <div className="lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">當前連堂監測</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>安全路段
                </span>
                <span className="font-mono text-slate-700">1 處</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-505"></span>中風險
                </span>
                <span className="font-mono text-slate-700">1 處</span>
              </div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-rose-600 flex items-center gap-1.5 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>高度趕不上
                </span>
                <span className="font-mono text-rose-700">1 處</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">上課日篩選</span>
            <div className="flex flex-col gap-1.5">
              <button 
                onClick={() => setSelectedDay('all')}
                className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedDay === 'all' ? 'bg-[#1E3A5F] text-white' : 'hover:bg-slate-55 text-slate-650'}`}
              >
                <span>顯示全部連堂</span>
                <span className="font-mono text-[10px]">3</span>
              </button>
              <button 
                onClick={() => setSelectedDay('tuesday')}
                className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedDay === 'tuesday' ? 'bg-[#1E3A5F] text-white' : 'hover:bg-slate-55 text-slate-650'}`}
              >
                <span>週二課表</span>
                <span className="font-mono text-[10px]">1</span>
              </button>
              <button 
                onClick={() => setSelectedDay('wednesday')}
                className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedDay === 'wednesday' ? 'bg-[#1E3A5F] text-white' : 'hover:bg-slate-55 text-slate-650'}`}
              >
                <span>週三課表</span>
                <span className="font-mono text-[10px]">1</span>
              </button>
              <button 
                onClick={() => setSelectedDay('friday')}
                className={`text-left px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-between cursor-pointer ${selectedDay === 'friday' ? 'bg-[#1E3A5F] text-white' : 'hover:bg-slate-55 text-slate-650'}`}
              >
                <span>週五課表</span>
                <span className="font-mono text-[10px]">1</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Transition timeline listing */}
        <div className="lg:col-span-3 space-y-5">
          {loading ? (
            <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">計算校內圖資與道路坡度中...</div>
          ) : filteredTransits.length === 0 ? (
            <div className="p-12 text-center font-bold text-slate-400 bg-white border border-slate-200 rounded-2xl">此上課日查無對接連堂。</div>
          ) : (
            filteredTransits.map((transit) => {
              const cfg = getStatusConfig(transit.status);
              return (
                <div 
                  key={transit.id}
                  className={`bg-white border rounded-2xl p-6 transition flex flex-col space-y-4 shadow-sm ${cfg.cardBorder}`}
                >
                  
                  {/* Transit Top segment */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-100 pb-3">
                    <div className="space-y-0.5">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${cfg.badgeBg}`}>
                        {cfg.title}
                      </span>
                      <div className="text-sm font-semibold text-slate-500 font-mono flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {transit.period}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">步行評估</span>
                      <span className="text-sm font-black font-mono text-slate-800">
                        {transit.distanceMeter} 公尺 · {transit.status === 'late' ? '上坡山路' : '平地'}
                      </span>
                    </div>
                  </div>

                  {/* Flow Map Visual path illustration */}
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-150">
                    
                    {/* Course A origin */}
                    <div className="md:col-span-3 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider block">前堂下課 (Depart Course)</span>
                      <p className="text-sm font-extrabold text-slate-800 truncate">{transit.prevCourseName}</p>
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{transit.prevClassroom}</span>
                      </div>
                    </div>

                    {/* Middle arrow indicator transit */}
                    <div className="md:col-span-1 flex flex-col items-center justify-center text-center p-2">
                      <Footprints className={`w-5 h-5 ${cfg.iconColor}`} />
                      <span className="text-[10px] font-extrabold font-mono text-slate-500 shrink-0 mt-1">
                        {transit.transitMinutes} mins
                      </span>
                      <div className="w-full border-t border-slate-350 border-dotted my-1 relative hidden md:block">
                        <Navigation className={`w-3 h-3 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-90 ${cfg.iconColor}`} />
                      </div>
                    </div>

                    {/* Course B destination */}
                    <div className="md:col-span-3 space-y-1 md:text-right">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wider block">後堂上課 (Arrival Course)</span>
                      <p className="text-sm font-extrabold text-slate-800 truncate">{transit.nextCourseName}</p>
                      <div className="text-xs text-slate-500 flex items-center md:justify-end gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{transit.nextClassroom}</span>
                      </div>
                    </div>

                  </div>

                  {/* Warning advice explanation text block */}
                  <div className="text-xs space-y-1.5">
                    <span className="font-extrabold text-slate-700 flex items-center gap-1">
                      <Info className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                      教務走動課表輔助建議：
                    </span>
                    <p className="text-slate-600 leading-relaxed font-semibold">
                      {transit.description}
                    </p>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Static walk guidance details */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Shuffle className="w-4.5 h-4.5 text-[#1E3A5F]" />
          政治大學校內走動「極限 10 分鐘」作息指引
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-500 leading-relaxed font-semibold">
          <div className="p-4 bg-slate-55 rounded-xl border border-slate-150 space-y-1.5">
            <span className="font-extrabold text-[#1E3A5F] block">山上校區與山下校區定義</span>
            <p>
              大仁樓、大義樓、商學院、綜合館位於山下校區。藝文中心、山上體育館、山上網球場位於山上校區。高度落差大，步行路程通常需要 15 分鐘。
            </p>
          </div>

          <div className="p-4 bg-slate-55 rounded-xl border border-slate-150 space-y-1.5">
            <span className="font-extrabold text-[#1E3A5F] block">校車搭乘時程陷阱</span>
            <p>
              課堂間 10 分鐘下課，校巴（1號或2號車）大機率遭遇極端排隊人龍。通常下課排隊加上等車，跨校區 transit 有 80%機率會遲到 5 - 10 分鐘。
            </p>
          </div>

          <div className="p-4 bg-slate-55 rounded-xl border border-slate-150 space-y-1.5">
            <span className="font-extrabold text-[#1E3A5F] block">如果連堂如何解決？</span>
            <p>
              中高預警路段，建議在大四開學前調整，或直接於第一堂課徵詢授課教授提早 5 分鐘離開。本預警旨在輔助學期排課，保障出勤分數之合宜安全。
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
