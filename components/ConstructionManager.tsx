
import React, { useState } from 'react';
import { 
  ConstructionProject, 
  ConstructionPhase, 
  ConstructionPhaseStatus, 
  ConstructionLog 
} from '../types';
import { useLanguage } from '../App';
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  Circle, 
  AlertCircle, 
  ChevronRight, 
  MessageSquare, 
  Image as ImageIcon,
  Send,
  ArrowRight,
  TrendingUp,
  FileText,
  X,
  // Added Plus to fix line 211 (original file line 214) error
  Plus
} from 'lucide-react';

interface ConstructionManagerProps {
  projects: ConstructionProject[];
  onUpdate: (projects: ConstructionProject[]) => void;
}

const ConstructionManager: React.FC<ConstructionManagerProps> = ({ projects, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState<boolean>(false);
  const [newLogContent, setNewLogContent] = useState('');

  const currentProject = projects.find(p => p.id === selectedProjectId);

  const handleUpdatePhaseStatus = (phaseId: string, status: ConstructionPhaseStatus) => {
    if (!currentProject) return;
    const updatedPhases = currentProject.phases.map(ph => {
      if (ph.id === phaseId) {
        return { 
          ...ph, 
          status, 
          progress: status === ConstructionPhaseStatus.COMPLETED ? 100 : ph.progress,
          actualEndDate: status === ConstructionPhaseStatus.COMPLETED ? new Date().toISOString().split('T')[0] : ph.actualEndDate
        };
      }
      return ph;
    });
    const updatedProjects = projects.map(p => p.id === selectedProjectId ? { ...p, phases: updatedPhases } : p);
    onUpdate(updatedProjects);
  };

  const handleAddLog = (phaseId: string) => {
    if (!newLogContent.trim() || !currentProject) return;
    const newLog: ConstructionLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleString(),
      content: newLogContent,
      author: 'Current User'
    };

    const updatedPhases = currentProject.phases.map(ph => {
      if (ph.id === phaseId) {
        return { ...ph, logs: [...ph.logs, newLog] };
      }
      return ph;
    });

    const updatedProjects = projects.map(p => p.id === selectedProjectId ? { ...p, phases: updatedPhases } : p);
    onUpdate(updatedProjects);
    setNewLogContent('');
    setShowLogModal(false);
  };

  const getStatusIcon = (status: ConstructionPhaseStatus) => {
    switch (status) {
      case ConstructionPhaseStatus.COMPLETED: return <CheckCircle2 className="text-green-500" size={24} />;
      case ConstructionPhaseStatus.IN_PROGRESS: return <TrendingUp className="text-blue-500 animate-pulse" size={24} />;
      case ConstructionPhaseStatus.OVERDUE: return <AlertCircle className="text-red-500" size={24} />;
      default: return <Circle className="text-slate-300" size={24} />;
    }
  };

  const activePhase = currentProject?.phases.find(ph => ph.id === activePhaseId);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('constructionPlan')}</h1>
          <p className="text-slate-500 text-sm">{currentProject?.solutionName} · {currentProject?.customerName}</p>
        </div>
        <div className="flex space-x-2">
          <select 
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2 bg-slate-100 border-none rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.solutionName}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Timeline List */}
        <div className="w-1/2 overflow-y-auto p-8 space-y-4 custom-scrollbar">
          {currentProject?.phases.map((phase, idx) => (
            <div 
              key={phase.id}
              onClick={() => setActivePhaseId(phase.id)}
              className={`relative p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                activePhaseId === phase.id 
                ? 'bg-white border-blue-600 shadow-xl scale-[1.02]' 
                : 'bg-white/60 border-transparent hover:bg-white hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(phase.status)}
                  <h3 className="text-lg font-bold text-slate-800 capitalize">{t(phase.name as any)}</h3>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    phase.status === ConstructionPhaseStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                    phase.status === ConstructionPhaseStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                    phase.status === ConstructionPhaseStatus.OVERDUE ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {t(phase.status.toLowerCase().replace(' ', '') as any)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-500 mb-4">
                <div className="flex items-center space-x-2">
                  <Calendar size={14} />
                  <span>{phase.plannedStartDate} → {phase.plannedEndDate}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <User size={14} />
                  <span>{t('supervisor')}: {phase.supervisor}</span>
                </div>
              </div>

              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    phase.status === ConstructionPhaseStatus.COMPLETED ? 'bg-green-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${phase.progress}%` }}
                />
              </div>

              {idx < currentProject.phases.length - 1 && (
                <div className="absolute top-full left-[1.75rem] h-4 w-0.5 bg-slate-200 -z-10" />
              )}
            </div>
          ))}
        </div>

        {/* Phase Details / Logs */}
        <div className="flex-1 bg-white border-l shadow-2xl overflow-y-auto custom-scrollbar flex flex-col">
          {activePhase ? (
            <div className="flex flex-col h-full">
              <div className="p-8 border-b space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-slate-900 capitalize">{t(activePhase.name as any)}</h2>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleUpdatePhaseStatus(activePhase.id, ConstructionPhaseStatus.IN_PROGRESS)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${activePhase.status === ConstructionPhaseStatus.IN_PROGRESS ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {t('working')}
                    </button>
                    <button 
                      onClick={() => handleUpdatePhaseStatus(activePhase.id, ConstructionPhaseStatus.COMPLETED)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold ${activePhase.status === ConstructionPhaseStatus.COMPLETED ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {t('finish')}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 grid grid-cols-2 gap-6 border">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('plannedPeriod')}</p>
                    <p className="font-bold text-slate-800">{activePhase.plannedStartDate} 至 {activePhase.plannedEndDate}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('actualPeriod')}</p>
                    <p className="font-bold text-slate-800">{activePhase.actualEndDate || '--'}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                    <MessageSquare size={18} className="text-blue-600" />
                    <span>{t('constructionHistory')}</span>
                  </h3>
                  <button 
                    onClick={() => setShowLogModal(true)}
                    className="flex items-center space-x-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus size={16} />
                    <span>{t('addLog')}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {activePhase.logs.length > 0 ? (
                    activePhase.logs.slice().reverse().map(log => (
                      <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-700 text-sm">{log.author}</span>
                          <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">{log.content}</p>
                        {log.images && log.images.length > 0 && (
                          <div className="flex gap-2 pt-2">
                            {log.images.map((img, i) => (
                              <div key={i} className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden">
                                <img src={img} className="w-full h-full object-cover" alt="" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-20 text-center space-y-4">
                       <FileText size={48} className="mx-auto text-slate-200" />
                       <p className="text-slate-400 text-sm">{t('noHistory')}</p>
                    </div>
                  )}
                </div>
              </div>

              {activePhase.name === 'acceptance' && (
                <div className="p-8 border-t bg-blue-50/50">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center space-x-2">
                    <CheckCircle2 size={18} className="text-green-600" />
                    <span>{t('acceptanceDocs')}</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                     <button className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-white">
                        <ImageIcon size={24} />
                        <span className="text-[10px] font-bold mt-2 uppercase">{t('uploadPhoto')}</span>
                     </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                <Clock size={48} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 tracking-tight">{lang === 'zh' ? '请选择一个施工阶段' : 'Select a construction phase'}</h3>
              <p className="text-slate-500 max-w-xs">{lang === 'zh' ? '点击左侧时间线查看具体进度详情及施工日志。' : 'Click a phase on the left to view progress details and history.'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && activePhaseId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{t('addLog')}</h3>
              <button onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <textarea 
                value={newLogContent}
                onChange={(e) => setNewLogContent(e.target.value)}
                placeholder={t('logPlaceholder')}
                className="w-full h-40 p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 resize-none font-medium text-slate-700"
              />
              <div className="flex items-center space-x-2">
                 <button className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200">
                    <ImageIcon size={20} />
                 </button>
                 <span className="text-xs text-slate-400 font-bold uppercase">{t('uploadPhoto')}</span>
              </div>
            </div>
            <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
              <button onClick={() => setShowLogModal(false)} className="px-6 py-2 font-bold text-slate-500">{t('cancel')}</button>
              <button 
                onClick={() => handleAddLog(activePhaseId)}
                className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Send size={16} />
                <span>{t('save')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionManager;
