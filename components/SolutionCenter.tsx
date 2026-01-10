
import React, { useState, useMemo } from 'react';
import { Solution, ProjectStatus, User, SolutionTemplate, TemplateRoom } from '../types';
import { useLanguage } from '../App';
import { 
  Search, 
  Filter, 
  FileText, 
  ChevronRight, 
  Download, 
  Share2, 
  History, 
  MoreHorizontal, 
  Home, 
  Layout,
  Tag,
  Clock,
  User as UserIcon,
  Trash2,
  CheckCircle2,
  X,
  FileCode,
  DollarSign,
  Maximize2,
  Save,
  Edit,
  LayoutGrid,
  List,
  ChevronLeft,
  Calculator,
  Loader2,
  Cpu,
  Eye,
  Smartphone,
  Copy,
  Check
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

const SolutionCenter: React.FC<SolutionCenterProps> = ({ solutions, products, currentUser, onUpdate, onSaveAsTemplate, onEditSolution, onGenerateQuote }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredSolutions = useMemo(() => {
    return solutions.filter(s => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = s.customerName.toLowerCase().includes(lowerSearch) || 
                          s.name.toLowerCase().includes(lowerSearch) ||
                          s.area?.toString().includes(lowerSearch) ||
                          s.type?.toLowerCase().includes(lowerSearch);
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [solutions, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSolutions.length / pageSize));
  const paginatedSolutions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSolutions.slice(start, start + pageSize);
  }, [filteredSolutions, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val as any);
    setCurrentPage(1);
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.DRAFT: return 'bg-slate-100 text-slate-600';
      case ProjectStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case ProjectStatus.CONFIRMED: return 'bg-blue-100 text-blue-700';
      case ProjectStatus.IN_PROGRESS: return 'bg-green-100 text-green-700';
      case ProjectStatus.COMPLETED: return 'bg-indigo-100 text-indigo-700';
      case ProjectStatus.VOIDED: case ProjectStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const handleStatusChange = (solutionId: string, newStatus: ProjectStatus) => {
    const updated = solutions.map(s => {
      if (s.id === solutionId) {
        const historyEntry = {
          status: newStatus,
          timestamp: new Date().toLocaleString(),
          userName: currentUser.name
        };
        return { 
          ...s, 
          status: newStatus, 
          updatedAt: new Date().toISOString().split('T')[0],
          statusHistory: [...s.statusHistory, historyEntry]
        };
      }
      return s;
    });
    onUpdate(updated);
    if (selectedSolution?.id === solutionId) {
      const updatedS = updated.find(u => u.id === solutionId);
      if (updatedS) setSelectedSolution(updatedS);
    }
  };

  const handleShare = (solution: Solution) => {
    setSelectedSolution(solution);
    setIsShareModalOpen(true);
  };

  const copyToClipboard = () => {
    const link = `https://smartpro.app/p/${selectedSolution?.id}`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('solutionCenter')}</h1>
            <p className="text-slate-500 font-medium">{lang === 'zh' ? '管理及检索您的所有智能设计方案。' : 'Manage and search all your smart home designs.'}</p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="flex bg-slate-100 p-1 rounded-xl border">
               <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <LayoutGrid size={20} />
               </button>
               <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 <List size={20} />
               </button>
             </div>
             <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all">
                <Maximize2 size={18} />
                <span>{t('viewAll')}</span>
             </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={lang === 'zh' ? '搜索客户、方案、面积或类型...' : 'Search customer, name, area or type...'}
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>
          <div className="flex items-center space-x-2 bg-slate-100 rounded-2xl px-4 py-2 border">
            <Filter size={18} className="text-slate-400" />
            <select 
              value={statusFilter}
              onChange={e => handleStatusFilterChange(e.target.value)}
              className="bg-transparent text-sm font-bold text-slate-600 outline-none"
            >
              <option value="ALL">{t('allStatus')}</option>
              <option value={ProjectStatus.DRAFT}>{t('draft')}</option>
              <option value={ProjectStatus.PENDING}>{t('pending')}</option>
              <option value={ProjectStatus.CONFIRMED}>{t('confirmed')}</option>
              <option value={ProjectStatus.IN_PROGRESS}>{t('inProgress')}</option>
              <option value={ProjectStatus.VOIDED}>{t('voided')}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {paginatedSolutions.map(solution => (
              <div 
                key={solution.id}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group cursor-pointer"
                onClick={() => { setSelectedSolution(solution); setIsDetailModalOpen(true); }}
              >
                <div className="aspect-video mb-6 rounded-3xl overflow-hidden bg-slate-50 border relative">
                  <img src={solution.floorPlanUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  <div className="absolute top-4 right-4 flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusColor(solution.status)}`}>
                      {t(solution.status.toLowerCase().replace(' ', '') as any)}
                    </span>
                    {solution.vectorData && (
                       <span className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-[8px] font-black uppercase flex items-center space-x-1 shadow-lg">
                          <Cpu size={10} />
                          <span>Structure Recognized</span>
                       </span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3 backdrop-blur-sm">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedSolution(solution); setIsPreviewMode(true); }}
                      className="p-4 bg-white rounded-2xl text-blue-600 shadow-xl hover:scale-110 transition-transform"
                      title="Preview for Client"
                    >
                      <Eye size={24} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEditSolution(solution); }}
                      className="p-4 bg-white rounded-2xl text-slate-800 shadow-xl hover:scale-110 transition-transform"
                      title="Edit Design"
                    >
                      <Edit size={24} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{solution.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{solution.customerName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Maximize2 size={14} />
                      <span className="text-xs font-bold">{solution.area || '--'} m²</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Tag size={14} />
                      <span className="text-xs font-bold">{solution.type === 'Full House' ? t('fullHouse') : t('roomOnly')}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('price')}</p>
                    <p className="text-2xl font-black text-blue-600">${solution.totalPrice.toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleShare(solution); }}
                    className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-black text-slate-400 uppercase tracking-widest border-b">
                  <th className="px-6 py-4">{t('solutionName')}</th>
                  <th className="px-6 py-4">{t('customer')}</th>
                  <th className="px-6 py-4">{t('status')}</th>
                  <th className="px-6 py-4">{t('price')}</th>
                  <th className="px-6 py-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedSolutions.map(solution => (
                  <tr 
                    key={solution.id} 
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                    onClick={() => { setSelectedSolution(solution); setIsDetailModalOpen(true); }}
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                       <div className="flex items-center space-x-2">
                          <span>{solution.name}</span>
                          {solution.vectorData && <Cpu size={12} className="text-indigo-500" />}
                       </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{solution.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(solution.status)}`}>
                        {t(solution.status.toLowerCase().replace(' ', '') as any)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-blue-600">${solution.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedSolution(solution); setIsPreviewMode(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                           <Eye size={18} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleShare(solution); }} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                           <Share2 size={18} />
                        </button>
                        <ChevronRight size={18} className="inline text-slate-300 group-hover:text-blue-500" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {isShareModalOpen && selectedSolution && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border border-white/20">
              <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                      <Share2 size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900">分享方案给客户</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Share to Customer</p>
                   </div>
                </div>
                <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                  <X size={28} />
                </button>
              </div>

              <div className="p-10 space-y-8 text-center">
                 <div className="w-48 h-48 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 flex items-center justify-center mx-auto p-4 group hover:border-blue-500 transition-all">
                    {/* Mock QR Code */}
                    <div className="w-full h-full border-4 border-slate-900 bg-white grid grid-cols-8 grid-rows-8 gap-1 p-2 opacity-80 group-hover:opacity-100 transition-opacity">
                       {[...Array(64)].map((_, i) => (
                         <div key={i} className={`rounded-sm ${Math.random() > 0.6 ? 'bg-slate-900' : 'bg-transparent'}`} />
                       ))}
                    </div>
                 </div>
                 <p className="text-sm font-bold text-slate-500 px-8">扫码或点击下方链接，客户即可进入沉浸式 3D 预览页面查看定制化方案</p>
                 
                 <div className="space-y-4">
                    <div className="flex items-center space-x-2 bg-slate-100 p-4 rounded-2xl border border-slate-200">
                       <Smartphone size={18} className="text-slate-400" />
                       <span className="flex-1 text-xs font-black text-slate-700 truncate">https://smartpro.app/p/{selectedSolution.id}</span>
                       <button 
                        onClick={copyToClipboard}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isCopied ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-slate-900 hover:bg-slate-50 border shadow-sm'}`}
                       >
                          {isCopied ? <Check size={12} /> : <Copy size={12} />}
                       </button>
                    </div>
                 </div>

                 <div className="pt-4 flex space-x-3">
                    <button className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">存为图片</button>
                    <button onClick={() => setIsShareModalOpen(false)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl">完成</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* High-Fidelity Client Preview */}
      {isPreviewMode && selectedSolution && (
        <ClientSolutionPreview 
          solution={selectedSolution} 
          products={products}
          onClose={() => setIsPreviewMode(false)}
        />
      )}

      {/* Detail Modal (Internal) */}
      {isDetailModalOpen && selectedSolution && !isPreviewMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedSolution.name}</h3>
                  <p className="text-slate-500 text-sm font-medium">{selectedSolution.customerName} · ID: {selectedSolution.id}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => { setSelectedSolution(selectedSolution); setIsPreviewMode(true); }}
                  className="flex items-center space-x-2 px-6 py-2 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition-all shadow-sm"
                >
                  <Eye size={18} />
                  <span>客户预览</span>
                </button>
                <button 
                  onClick={() => { onEditSolution(selectedSolution); setIsDetailModalOpen(false); }}
                  className="flex items-center space-x-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md"
                >
                  <Edit size={18} />
                  <span>编辑设计</span>
                </button>
                {selectedSolution.status === ProjectStatus.CONFIRMED && (
                   <button 
                    onClick={() => { onGenerateQuote(selectedSolution); setIsDetailModalOpen(false); }}
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
                   >
                     <Calculator size={18} />
                     <span>{t('generateQuote')}</span>
                   </button>
                )}
                <button onClick={() => setIsDetailModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                  <X size={28} />
                </button>
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-10">
                <div className="aspect-video rounded-[2rem] overflow-hidden border shadow-inner relative bg-slate-900 flex items-center justify-center p-8">
                  {selectedSolution.vectorData ? (
                     <div className="scale-125 transform pointer-events-none opacity-40">
                        <svg width="300" height="200" viewBox="0 0 500 375">
                           {selectedSolution.vectorData.raw_data.filter(x=>x.class==='wall').map((w,i)=>(
                              <rect key={i} x={w.x1} y={w.y1} width={Math.abs(w.x2-w.x1)||2} height={Math.abs(w.y2-w.y1)||2} fill="white" />
                           ))}
                           {selectedSolution.devices.map((d,i)=>(
                              <circle key={i} cx={d.x} cy={d.y} r="5" fill="#3b82f6" />
                           ))}
                        </svg>
                     </div>
                  ) : (
                    <img src={selectedSolution.floorPlanUrl} className="w-full h-full object-contain opacity-50" alt="" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                     <p className="bg-slate-900/80 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 text-white text-xs font-black uppercase tracking-widest">
                        Internal Preview · Use Client Preview for Customer Presentation
                     </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: t('price'), val: `$${selectedSolution.totalPrice.toLocaleString()}`, icon: <DollarSign className="text-blue-500" /> },
                    { label: 'Date', val: selectedSolution.createdAt, icon: <Clock className="text-blue-500" /> }
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-lg font-bold text-slate-800">{item.val}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-80 border-l bg-slate-50 p-8 flex flex-col space-y-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('changeStatus')}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {[ProjectStatus.DRAFT, ProjectStatus.PENDING, ProjectStatus.CONFIRMED].map(st => (
                      <button 
                        key={st} 
                        onClick={() => handleStatusChange(selectedSolution.id, st)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
                          selectedSolution.status === st 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {t(st.toLowerCase().replace(' ', '') as any)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolutionCenter;
