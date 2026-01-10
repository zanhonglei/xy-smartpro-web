
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
  Calculator
} from 'lucide-react';

interface SolutionCenterProps {
  solutions: Solution[];
  currentUser: User;
  onUpdate: (solutions: Solution[]) => void;
  onSaveAsTemplate: (template: SolutionTemplate) => void;
  onEditSolution: (solution: Solution) => void;
  onGenerateQuote: (solution: Solution) => void;
}

const SolutionCenter: React.FC<SolutionCenterProps> = ({ solutions, currentUser, onUpdate, onSaveAsTemplate, onEditSolution, onGenerateQuote }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'ALL'>('ALL');
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
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

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(t('exporting') + " Done!");
    }, 2000);
  };

  const handleShare = () => {
    const dummyLink = `https://smartpro.app/share/${selectedSolution?.id}`;
    navigator.clipboard.writeText(dummyLink);
    alert(t('copyLinkSuccess'));
  };

  const handleSaveAsTemplate = () => {
    if (!selectedSolution) return;
    
    const roomGroups: Record<string, any[]> = {};
    selectedSolution.devices.forEach(d => {
      if (!roomGroups[d.roomName]) roomGroups[d.roomName] = [];
      roomGroups[d.roomName].push(d.productId);
    });

    const templateRooms: TemplateRoom[] = Object.entries(roomGroups).map(([name, productIds]) => {
      const counts: Record<string, number> = {};
      productIds.forEach(id => counts[id] = (counts[id] || 0) + 1);
      
      const roomObj = selectedSolution.rooms.find(r => r.name === name);
      return {
        id: Math.random().toString(36).substr(2, 9),
        roomType: roomObj?.type || 'living',
        products: Object.entries(counts).map(([productId, quantity]) => ({ productId, quantity }))
      };
    });

    const template: SolutionTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${selectedSolution.name} Template`,
      description: `Template generated from solution ${selectedSolution.id}`,
      rooms: templateRooms,
      totalPrice: selectedSolution.totalPrice
    };

    onSaveAsTemplate(template);
    alert(lang === 'zh' ? "方案已另存为模板！" : "Solution saved as template!");
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
                onClick={() => { setSelectedSolution(solution); setIsDetailModalOpen(true); }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group cursor-pointer"
              >
                <div className="aspect-video mb-6 rounded-3xl overflow-hidden bg-slate-50 border relative">
                  <img src={solution.floorPlanUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusColor(solution.status)}`}>
                      {t(solution.status.toLowerCase().replace(' ', '') as any)}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{solution.name}</h3>
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
                  <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <ChevronRight size={20} />
                  </div>
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
                    onClick={() => { setSelectedSolution(solution); setIsDetailModalOpen(true); }}
                    className="hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">{solution.name}</td>
                    <td className="px-6 py-4 text-slate-600">{solution.customerName}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(solution.status)}`}>
                        {t(solution.status.toLowerCase().replace(' ', '') as any)}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-blue-600">${solution.totalPrice.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight size={18} className="inline text-slate-300 group-hover:text-blue-500" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isDetailModalOpen && selectedSolution && (
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
                <div className="aspect-video rounded-[2rem] overflow-hidden border shadow-inner relative bg-slate-900">
                  <img src={selectedSolution.floorPlanUrl} className="w-full h-full object-contain opacity-50" alt="" />
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

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    className={className} 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
