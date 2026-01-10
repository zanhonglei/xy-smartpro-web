
import React from 'react';
import { 
  Solution, Order, Customer, Quote, Contract,
  ProjectStatus, CustomerStatus, OrderStatus 
} from '../types';
import { useLanguage } from '../App';
import { 
  TrendingUp, ShoppingBag, Users, FileText, 
  CheckCircle2, Clock, ArrowUpRight, Plus, 
  Sparkles, ChevronRight, Activity, DollarSign
} from 'lucide-react';

interface DashboardProps {
  solutions: Solution[];
  orders: Order[];
  customers: Customer[];
  quotes: Quote[];
  contracts: Contract[];
  onTabChange: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  solutions, orders, customers, quotes, contracts, onTabChange 
}) => {
  const { t, lang } = useLanguage();

  // Stats calculation
  const totalRevenue = orders.reduce((sum, o) => sum + o.paidAmount, 0);
  const activeProjects = solutions.filter(s => s.status === ProjectStatus.IN_PROGRESS).length;
  const potentialLeads = customers.filter(c => c.status === CustomerStatus.POTENTIAL).length;
  const pendingContracts = contracts.filter(c => c.status === 'Waiting Sign').length;

  const stats = [
    { label: t('totalRevenue'), value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign />, color: 'bg-emerald-500', trend: '+12%' },
    { label: t('activeProjects'), value: activeProjects, icon: <Activity />, color: 'bg-blue-500', trend: '+3' },
    { label: t('potentialCustomer'), value: potentialLeads, icon: <Users />, color: 'bg-indigo-500', trend: '+8%' },
    { label: t('pendingQuotes'), value: quotes.filter(q => q.status === 'Reviewing').length, icon: <Clock />, color: 'bg-amber-500', trend: 'Needs Action' },
  ];

  const recentSolutions = solutions.slice(0, 4);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      {/* Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('welcome')}, Admin</h1>
          <p className="text-slate-500 font-medium mt-1">{lang === 'zh' ? '今日全屋智能业务运行良好，有 3 个新动态待处理。' : 'Business is running smooth today. 3 new updates to review.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onTabChange('designer')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
          >
            <Sparkles size={18} />
            <span>{t('startAiDesign')}</span>
          </button>
          <button 
            onClick={() => onTabChange('customer-pool')}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={18} />
            <span>{t('newCustomer')}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sales Chart Mockup */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-900">{lang === 'zh' ? '销售趋势' : 'Sales Trends'}</h3>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 outline-none">
              <option>{lang === 'zh' ? '最近 7 天' : 'Last 7 Days'}</option>
              <option>{lang === 'zh' ? '最近 30 天' : 'Last 30 Days'}</option>
            </select>
          </div>
          <div className="flex-1 min-h-[300px] relative flex items-end justify-between px-4 pb-4">
            {/* Simple CSS bar chart visualization */}
            {[40, 70, 45, 90, 65, 85, 55].map((h, i) => (
              <div key={i} className="w-12 group relative flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500/10 rounded-2xl hover:bg-blue-500 transition-all duration-700 cursor-pointer"
                  style={{ height: `${h}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    ${(h * 100).toLocaleString()}
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-tighter">Day {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="lg:col-span-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-8">
          <h3 className="text-xl font-black text-slate-900">{lang === 'zh' ? '方案状态占比' : 'Solution Breakdown'}</h3>
          <div className="relative aspect-square flex items-center justify-center">
             <svg className="w-48 h-48 -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" className="text-slate-50" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray="502" strokeDashoffset="150" className="text-blue-500" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray="502" strokeDashoffset="400" className="text-emerald-500" />
             </svg>
             <div className="absolute text-center">
                <p className="text-3xl font-black text-slate-900">{solutions.length}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'zh' ? '总方案数' : 'Solutions'}</p>
             </div>
          </div>
          <div className="space-y-4">
             {[
               { label: t('confirmed'), count: solutions.filter(s => s.status === ProjectStatus.CONFIRMED).length, color: 'bg-blue-500' },
               { label: t('completed'), count: solutions.filter(s => s.status === ProjectStatus.COMPLETED).length, color: 'bg-emerald-500' },
               { label: t('draft'), count: solutions.filter(s => s.status === ProjectStatus.DRAFT).length, color: 'bg-slate-300' },
             ].map((item, i) => (
               <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="text-sm font-bold text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">{item.count}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Activity & Hot Solutions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-[3rem] p-10 text-white space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black">{t('recentSolutions')}</h3>
            <button onClick={() => onTabChange('solutions')} className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300">
              {t('viewAll')} <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {recentSolutions.map(s => (
              <div key={s.id} className="group bg-white/5 hover:bg-white/10 p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FileText size={20} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-white/40">{s.customerName} · {s.updatedAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-blue-400">${s.totalPrice.toLocaleString()}</p>
                  <p className="text-[10px] font-bold uppercase text-white/30">{s.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">{lang === 'zh' ? '最新动态' : 'Live Activity'}</h3>
            <Activity size={20} className="text-blue-500 animate-pulse" />
          </div>
          <div className="space-y-6 relative ml-4 border-l-2 border-slate-50 pl-8">
            {[
              { time: '10 min ago', title: 'Payment Confirmed', desc: 'Zhang San completed the first payment.', icon: <CheckCircle2 className="text-emerald-500" /> },
              { time: '2 hours ago', title: 'New Quote Generated', desc: 'Quote for Li Si Villa design is ready for review.', icon: <Clock className="text-blue-500" /> },
              { time: 'Yesterday', title: 'Design Updated', desc: 'AI optimized the lighting plan for Wang Wu.', icon: <Sparkles className="text-amber-500" /> },
            ].map((act, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-[3.15rem] top-1 bg-white p-1 rounded-full border shadow-sm">
                  <div className="w-3 h-3 rounded-full bg-slate-200" />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{act.time}</p>
                <h4 className="font-bold text-slate-800 mt-1">{act.title}</h4>
                <p className="text-sm text-slate-500 font-medium">{act.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
