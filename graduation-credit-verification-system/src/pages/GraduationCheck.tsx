import React, { useState, useEffect } from 'react';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Info,
  SlidersHorizontal,
  FileCheck
} from 'lucide-react';
import { graduationService } from '../services/api';
import { GradRule } from '../types';

export default function GraduationCheck() {
  const [rules, setRules] = useState<GradRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'warning' | 'failed'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchRules = async () => {
      try {
        setLoading(true);
        const data = await graduationService.getGraduationRules();
        if (active) {
          setRules(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchRules();
    return () => {
      active = false;
    };
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  // Filter rules
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          rule.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || rule.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: 'completed' | 'warning' | 'failed') => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-250">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            審定合格 (Completed)
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-805 rounded-full text-xs font-bold border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            警告/缺修 (Warning)
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-800 rounded-full text-xs font-bold border border-rose-220">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            未通過門檻 (Failed)
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title block */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">畢業檢核明細 (Graduation Rule Checklist)</h2>
        <p className="text-sm text-slate-500 mt-1">
          系統分析每一條修課限制，即時展現學位審查門檻。可點擊各條目展開，瀏覽完整的欠修學科與替代方案說明。
        </p>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </span>
          <input
            type="text"
            placeholder="搜尋畢業規則名稱或類型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#1E3A5F] focus:ring-1 focus:ring-[#1E3A5F]"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" /> 狀態過濾:
          </span>
          
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'all' ? 'bg-[#1E3A5F] text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            全部 ({rules.length})
          </button>
          
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            合格 ({rules.filter(r => r.status === 'completed').length})
          </button>
          
          <button
            onClick={() => setStatusFilter('warning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'warning' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            警告/欠學分 ({rules.filter(r => r.status === 'warning').length})
          </button>

          <button
            onClick={() => setStatusFilter('failed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${statusFilter === 'failed' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
          >
            未通過 ({rules.filter(r => r.status === 'failed').length})
          </button>
        </div>
      </div>

      {/* Rules view */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">正在極速運算歷年規章與修讀抵充學程中...</div>
      ) : filteredRules.length === 0 ? (
        <div className="bg-white p-12 text-center text-slate-400 rounded-2xl border border-slate-200">
          <FileCheck className="w-12 h-12 text-slate-200 mx-auto" />
          <p className="mt-2 text-sm font-semibold">查無符合此篩選條件之規則規章</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRules.map((rule) => {
            const isExpanded = expandedId === rule.id;
            return (
              <div 
                key={rule.id}
                className={`
                  bg-white rounded-2xl border transition shadow-sm overflow-hidden
                  ${isExpanded ? 'border-indigo-400 shadow-indigo-600/5' : 'border-slate-200 hover:border-slate-300'}
                `}
              >
                {/* Header view */}
                <div 
                  onClick={() => toggleExpand(rule.id)}
                  className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1 max-w-md">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                        {rule.type}
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-900 tracking-tight">{rule.name}</h3>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 self-end sm:self-auto">
                    {/* Completion status textual */}
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                        目前進度 (Required vs Finished)
                      </div>
                      <div className="text-sm font-black text-slate-800 font-mono mt-1">
                        {rule.completed} <span className="text-xs font-medium text-slate-400">/ {rule.required}</span>
                      </div>
                    </div>

                    <div>
                      {getStatusBadge(rule.status)}
                    </div>

                    <div className="text-slate-400 p-1 hover:bg-slate-50 rounded">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Progress bar line */}
                <div className="px-6 pb-2">
                  <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`
                        h-full rounded-full transition-all duration-500
                        ${rule.status === 'completed' ? 'bg-emerald-500' : ''}
                        ${rule.status === 'warning' ? 'bg-amber-500' : ''}
                        ${rule.status === 'failed' ? 'bg-rose-500' : ''}
                      `}
                      style={{ width: `${rule.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Expanded details shelf */}
                {isExpanded && (
                  <div className="px-6 py-5 bg-slate-50 border-t border-slate-150 text-xs text-slate-600 space-y-3.5">
                    <div className="flex items-start gap-2 text-slate-700 bg-white p-4 rounded-xl border border-slate-200">
                      <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <span className="font-extrabold text-slate-800 text-xs block">詳細畢業法規審核說明</span>
                        <p className="leading-relaxed font-semibold text-slate-600">
                          {rule.details || '目前該門檻已核准學分滿足。本系統會實時抓取您歷年成績單所對應之核定字號及大類學門，如有疑问可洽研課處。'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Sub card 1 */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-800 text-[11px] block text-slate-500 uppercase tracking-widest mb-1.5">
                          本項檢核機制
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-[11px]">
                          <li>比對修別欄位(註記: <code>{rule.type}</code>)學籍總累加。</li>
                          <li>剔除任何成績等第為 <code>F</code> <code>D</code> 或 <code>0</code> 的倒置項目。</li>
                          <li>英文檢定需要正式上報學籍處取得合格抵認。</li>
                        </ul>
                      </div>

                      {/* Sub card 2 */}
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-800 text-[11px] block text-slate-500 uppercase tracking-widest mb-1.5">
                          學系救濟與輔導方案
                        </span>
                        <p className="text-[11px] leading-relaxed">
                          若本項不幸無法完成：
                          <br />
                          <strong>系必修/選修：</strong>建議優先在 113-1 排修。若遇衝堂，可填寫「跨系/跨部選修科目承認畢業學分申請表」尋求第二方案。
                          <br />
                          <strong>英文檢定：</strong>可於大四第二學期修讀校方開設之「進階英文」抵充。
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Graduation eligibility board alert */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-black text-slate-800">畢業學位審查總結 (Overall Verification Result)</h4>
          <p className="text-xs text-slate-500">
            本學年由系辦主任與課務委員實行初審與複審，學生本人需全數亮起<strong>「審定合格」</strong>綠燈方可領取學士學位證書。
          </p>
        </div>

        <div className="shrink-0 text-center py-2 px-6 bg-rose-50 border border-rose-100 rounded-xl">
          <div className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest">目前學位判定</div>
          <div className="text-base font-black text-rose-700 mt-1">條件尚未滿足 (Pending)</div>
        </div>
      </div>

    </div>
  );
}
