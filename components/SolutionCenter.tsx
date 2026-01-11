
import React, { useState, useMemo, useEffect } from 'react';
import { Solution, ProjectStatus, User, SolutionTemplate } from '../types';
import { useLanguage } from '../App';
import { 
  Search, Filter, FileText, ChevronRight, Share2, 
  Tag, Clock, Trash2, Edit, LayoutGrid, List, 
  ChevronLeft, Eye, Smartphone, Copy, Check, Cpu, Maximize2, X
} from 'lucide-react';
import ClientSolutionPreview from './ClientSolutionPreview';

interface SolutionCenterProps {
  solutions: Solution[];
  products: any[];
  currentUser: User;
  onUpdate: (solutions: Solution[]) => void;
  onSaveAsTemplate: (template: SolutionTemplate) => void;
  onEditSolution: (solution: Solution) => void;
  onGenerateQuote: (solution: Solution) => void;
}

const SolutionCenter: React.FC<SolutionCenterProps> = ({ solutions, products, currentUser, onUpdate, onEditSolution, onGenerateQuote }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Persistent view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem('view_mode_solutions') as any) || 'grid'
  );

  useEffect(() => {
    localStorage.setItem('view_mode_solutions', viewMode);
  }, [viewMode]);

  // Pagination logic
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredSolutions = useMemo(() => {
    return solutions.filter(s => {
      const matchSearch = s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [solutions, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredSolutions.length / pageSize) || 1;
  const paginatedSolutions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSolutions.slice(start, start + pageSize);
  }, [filteredSolutions, currentPage]);

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.DRAFT: return 'bg-slate-100 text-slate-600';
      case ProjectStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case ProjectStatus.CONFIRMED: return 'bg-blue-100 text-blue-700';
      case ProjectStatus.IN_PROGRESS: return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('solutionCenter')}</h1>
            <p className="text-slate-500 font-medium">查看并管理您的全屋智能设计方案</p>
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List size={20} /></button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input type="text" placeholder="搜索方案或客户..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full pl-12 pr-6 py-3 rounded-2xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 rounded-2xl px-4 py-2 border">
            <Filter size={18} className="text-slate-400" />
            <select value={statusFilter} onChange={e => {setStatusFilter(e.target.value as any); setCurrentPage(1);}} className="bg-transparent text-sm font-bold text-slate-600 outline-none">
              <option value="ALL">全部状态</option>
              <option value={ProjectStatus.DRAFT}>草稿</option>
              <option value={ProjectStatus.PENDING}>待确认</option>
              <option value={ProjectStatus.CONFIRMED}>已确认</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {paginatedSolutions.map(solution => (
              <div key={solution.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group">
                <div className="aspect-video mb-6 rounded-3xl overflow-hidden bg-slate-50 border relative group">
                  <img src={solution.floorPlanUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute top-4 right-4"><span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg ${getStatusColor(solution.status)}`}>{solution.status}</span></div>
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                    <button onClick={() => { setSelectedSolution(solution); setIsPreviewMode(true); }} className="p-4 bg-white rounded-2xl text-blue-600 hover:scale-110 transition-all"><Eye size={24} /></button>
                    <button onClick={() => onEditSolution(solution)} className="p-4 bg-white rounded-2xl text-slate-800 hover:scale-110 transition-all"><Edit size={24} /></button>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-slate-800">{solution.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{solution.customerName}</p>
                </div>
                <div className="mt-8 pt-6 border-t flex items-center justify-between">
                  <p className="text-2xl font-black text-blue-600">${solution.totalPrice.toLocaleString()}</p>
                  <button onClick={() => { setSelectedSolution(solution); setIsShareModalOpen(true); }} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all"><Share2 size={20} /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b text-xs font-black text-slate-400 uppercase">
                <tr>
                  <th className="px-6 py-4">方案名称</th>
                  <th className="px-6 py-4">客户姓名</th>
                  <th className="px-6 py-4">状态</th>
                  <th className="px-6 py-4">总额</th>
                  <th className="px-6 py-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedSolutions.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">{s.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{s.customerName}</td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${getStatusColor(s.status)}`}>{s.status}</span></td>
                    <td className="px-6 py-4 font-black text-blue-600">${s.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => { setSelectedSolution(s); setIsPreviewMode(true); }} className="p-2 text-slate-400 hover:text-blue-600"><Eye size={18} /></button>
                      <button onClick={() => onEditSolution(s)} className="p-2 text-slate-400 hover:text-slate-800"><Edit size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border shadow-sm">
          <p className="text-sm font-bold text-slate-500">第 {currentPage} 页，共 {totalPages} 页</p>
          <div className="flex items-center space-x-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-30"><ChevronLeft size={20} /></button>
            <div className="flex space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i+1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{i+1}</button>
              ))}
            </div>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-30"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {isPreviewMode && selectedSolution && <ClientSolutionPreview solution={selectedSolution} products={products} onClose={() => setIsPreviewMode(false)} />}
      {isShareModalOpen && selectedSolution && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl p-10 text-center space-y-8">
            <div className="flex justify-between items-center"><h3 className="text-2xl font-black">分享方案</h3><button onClick={() => setIsShareModalOpen(false)}><X size={24} /></button></div>
            <div className="w-48 h-48 bg-slate-100 rounded-[2rem] mx-auto flex items-center justify-center border-4 border-white shadow-inner"><Cpu size={64} className="text-blue-500" /></div>
            <p className="text-slate-500 font-bold">客户扫码即可进入 3D 沉浸式预览页面</p>
            <div className="flex items-center bg-slate-100 p-4 rounded-2xl"><span className="flex-1 truncate text-xs font-bold text-slate-600">https://smartpro.app/p/{selectedSolution.id}</span><button onClick={() => {navigator.clipboard.writeText(`https://smartpro.app/p/${selectedSolution.id}`); setIsCopied(true); setTimeout(() => setIsCopied(false), 2000);}} className="p-2 bg-white rounded-xl shadow-sm text-blue-600">{isCopied ? <Check size={18} /> : <Copy size={18} />}</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionCenter;
