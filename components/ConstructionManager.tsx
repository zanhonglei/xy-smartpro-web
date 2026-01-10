
import React, { useState, useRef, useEffect } from 'react';
import { 
  ConstructionProject, 
  ConstructionPhase, 
  ConstructionPhaseStatus, 
  ConstructionLog,
  ConstructionStatus,
  InspectionRecord,
  Employee
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
  TrendingUp,
  FileText,
  X,
  Plus,
  Layout,
  Users,
  Search,
  MoreHorizontal,
  PenTool,
  ShieldCheck,
  Star,
  Camera,
  Signature
} from 'lucide-react';

interface ConstructionManagerProps {
  projects: ConstructionProject[];
  employees: Employee[];
  onUpdate: (projects: ConstructionProject[]) => void;
}

const ConstructionManager: React.FC<ConstructionManagerProps> = ({ projects, employees, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [viewMode, setViewMode] = useState<'kanban' | 'detail'>('kanban');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dispatch' | 'progress' | 'inspection' | 'acceptance'>('overview');
  
  // Signature State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const currentProject = projects.find(p => p.id === selectedProjectId);

  // 看板列定义
  const columns = [
    { key: ConstructionStatus.UNASSIGNED, label: lang === 'zh' ? '待派工' : 'Unassigned', color: 'text-slate-400' },
    { key: ConstructionStatus.ONGOING, label: lang === 'zh' ? '施工中' : 'Ongoing', color: 'text-blue-500' },
    { key: ConstructionStatus.INSPECTING, label: lang === 'zh' ? '巡检中' : 'Inspecting', color: 'text-amber-500' },
    { key: ConstructionStatus.ACCEPTANCE, label: lang === 'zh' ? '验收中' : 'Acceptance', color: 'text-purple-500' },
    { key: ConstructionStatus.COMPLETED, label: lang === 'zh' ? '已交付' : 'Completed', color: 'text-green-500' },
  ];

  const handleOpenProject = (id: string) => {
    setSelectedProjectId(id);
    setViewMode('detail');
    setActiveTab('overview');
  };

  const handleDispatch = (staffId: string) => {
    if (!selectedProjectId) return;
    const staff = employees.find(e => e.id === staffId);
    const updated = projects.map(p => 
      p.id === selectedProjectId ? { 
        ...p, 
        status: ConstructionStatus.ONGOING, 
        assignedStaffId: staffId, 
        assignedStaffName: staff?.name,
        startDate: new Date().toISOString().split('T')[0]
      } : p
    );
    onUpdate(updated);
    alert(lang === 'zh' ? '派工成功！' : 'Staff assigned!');
  };

  const handleAddInspection = (record: Partial<InspectionRecord>) => {
    if (!selectedProjectId || !currentProject) return;
    const newRecord: InspectionRecord = {
      id: 'INS-' + Math.random().toString(36).substr(2, 5),
      inspector: '质检专员',
      date: new Date().toISOString().split('T')[0],
      score: record.score || 100,
      content: record.content || '',
      status: record.status || 'Pass',
      images: []
    };
    const updated = projects.map(p => 
      p.id === selectedProjectId ? { ...p, inspections: [...p.inspections, newRecord] } : p
    );
    onUpdate(updated);
  };

  // 电子签名逻辑
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
    const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !selectedProjectId) return;
    const signature = canvas.toDataURL('image/png');
    const updated = projects.map(p => 
      p.id === selectedProjectId ? { 
        ...p, 
        customerSignature: signature, 
        status: ConstructionStatus.COMPLETED,
        acceptanceDate: new Date().toISOString().split('T')[0]
      } : p
    );
    onUpdate(updated);
    alert(lang === 'zh' ? '验收成功，签名已存档！' : 'Acceptance completed, signature archived!');
  };

  useEffect(() => {
    if (activeTab === 'acceptance' && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#000';
        }
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      {/* 头部导航 */}
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {viewMode === 'detail' && (
                <button onClick={() => setViewMode('kanban')} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                    <ChevronRight size={24} className="rotate-180" />
                </button>
            )}
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {viewMode === 'kanban' ? '施工全周期管理' : currentProject?.solutionName}
              </h1>
              <p className="text-slate-500 font-medium">
                {viewMode === 'kanban' ? '从派工到交付的全流程数字化监管' : `客户: ${currentProject?.customerName}`}
              </p>
            </div>
          </div>
          {viewMode === 'kanban' && (
              <div className="flex items-center bg-slate-100 p-1 rounded-2xl border">
                  <button className="flex items-center space-x-2 px-6 py-2 bg-white rounded-xl shadow-sm font-bold text-blue-600">
                      <Layout size={18} />
                      <span>看板模式</span>
                  </button>
                  <button className="flex items-center space-x-2 px-6 py-2 rounded-xl font-bold text-slate-500 hover:text-slate-700">
                      <Search size={18} />
                      <span>检索列表</span>
                  </button>
              </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'kanban' ? (
          <div className="flex space-x-6 h-full overflow-x-auto pb-4 custom-scrollbar">
            {columns.map(col => (
              <div key={col.key} className="w-80 shrink-0 flex flex-col space-y-4">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${col.color.replace('text', 'bg')}`} />
                    <span className="font-black text-slate-900 uppercase tracking-widest text-xs">{col.label}</span>
                    <span className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded-full text-[10px] font-black">
                      {projects.filter(p => p.status === col.key).length}
                    </span>
                  </div>
                  <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={18} /></button>
                </div>
                
                <div className="flex-1 space-y-4 overflow-y-auto custom-scrollbar pr-1">
                  {projects.filter(p => p.status === col.key).map(project => (
                    <div 
                      key={project.id}
                      onClick={() => handleOpenProject(project.id)}
                      className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group"
                    >
                      <h4 className="font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{project.solutionName}</h4>
                      <p className="text-xs text-slate-400 font-bold mt-1">{project.customerName}</p>
                      
                      <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                         <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                               {project.assignedStaffName ? project.assignedStaffName.charAt(0) : <Users size={12}/>}
                            </div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                               {project.assignedStaffName || '未指派'}
                            </span>
                         </div>
                         <div className="flex items-center space-x-1 text-[10px] font-black text-blue-600">
                             <Clock size={12} />
                             <span>{project.startDate || '等待开工'}</span>
                         </div>
                      </div>
                    </div>
                  ))}
                  {projects.filter(p => p.status === col.key).length === 0 && (
                      <div className="py-12 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-slate-300 space-y-2 opacity-50">
                          <Plus size={24} />
                          <span className="text-[10px] font-black uppercase">拖拽或等待加入</span>
                      </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto flex flex-col h-full space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             {/* 详情页 Tabs */}
             <div className="flex bg-white p-1.5 rounded-[2rem] border shadow-sm w-fit mx-auto">
                {[
                  { id: 'overview', label: '项目概览', icon: <Layout size={16} /> },
                  { id: 'dispatch', label: '工程派工', icon: <Users size={16} /> },
                  { id: 'progress', label: '施工进度', icon: <TrendingUp size={16} /> },
                  { id: 'inspection', label: '质检巡检', icon: <ShieldCheck size={16} /> },
                  { id: 'acceptance', label: '验收交付', icon: <PenTool size={16} /> },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center space-x-2 px-8 py-3 rounded-2xl font-bold transition-all ${
                            activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab.icon}
                        <span className="text-sm">{tab.label}</span>
                    </button>
                ))}
             </div>

             {/* Tab 内容区 */}
             <div className="flex-1 bg-white rounded-[3.5rem] border shadow-xl p-10 overflow-y-auto custom-scrollbar">
                {activeTab === 'overview' && (
                    <div className="space-y-10">
                        <div className="grid grid-cols-3 gap-8">
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">当前状态</p>
                                <h3 className="text-3xl font-black text-blue-600">{currentProject?.status}</h3>
                                <div className="pt-4 border-t flex justify-between text-xs font-bold text-slate-500">
                                    <span>开工日期:</span>
                                    <span>{currentProject?.startDate || '未开始'}</span>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">指派工程师</p>
                                <h3 className="text-3xl font-black text-slate-800">{currentProject?.assignedStaffName || '待指派'}</h3>
                                <div className="pt-4 border-t flex justify-between text-xs font-bold text-slate-500">
                                    <span>联系电话:</span>
                                    <span>138xxxx8888</span>
                                </div>
                            </div>
                            <div className="p-8 bg-slate-50 rounded-[2.5rem] border space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">已完成进度</p>
                                <h3 className="text-3xl font-black text-green-600">
                                    {Math.floor((currentProject?.phases.filter(ph => ph.status === ConstructionPhaseStatus.COMPLETED).length || 0) / (currentProject?.phases.length || 1) * 100)}%
                                </h3>
                                <div className="pt-4 border-t flex justify-between text-xs font-bold text-slate-500">
                                    <span>关键节点:</span>
                                    <span>{currentProject?.phases.length} 个</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="font-black text-xl text-slate-800 tracking-tight">施工全周期图谱</h4>
                            <div className="flex items-center justify-between px-4">
                                {currentProject?.phases.map((ph, idx) => (
                                    <React.Fragment key={ph.id}>
                                        <div className="flex flex-col items-center space-y-3 relative group">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                                                ph.status === ConstructionPhaseStatus.COMPLETED ? 'bg-green-500 text-white' : 
                                                ph.status === ConstructionPhaseStatus.IN_PROGRESS ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-400'
                                            }`}>
                                                {ph.status === ConstructionPhaseStatus.COMPLETED ? <CheckCircle2 size={24} /> : <span className="font-black">{idx + 1}</span>}
                                            </div>
                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-tighter text-center max-w-[80px]">{ph.name}</p>
                                        </div>
                                        {idx < (currentProject.phases.length - 1) && (
                                            <div className="flex-1 h-1 bg-slate-100 mx-4 rounded-full overflow-hidden">
                                                <div className={`h-full bg-blue-500 transition-all duration-1000 ${ph.status === ConstructionPhaseStatus.COMPLETED ? 'w-full' : 'w-0'}`} />
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'dispatch' && (
                    <div className="space-y-8 max-w-2xl mx-auto">
                        <div className="text-center space-y-2">
                            <Users size={48} className="mx-auto text-blue-500" />
                            <h3 className="text-2xl font-black text-slate-900">指派项目负责人</h3>
                            <p className="text-slate-500 font-medium">选定一名高级工程师负责该项目的现场实施与管理</p>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {employees.filter(e => e.departmentId === 'dept4').map(emp => (
                                <button 
                                    key={emp.id}
                                    onClick={() => handleDispatch(emp.id)}
                                    className={`p-6 rounded-[2rem] border-2 flex items-center justify-between transition-all ${
                                        currentProject?.assignedStaffId === emp.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-blue-200'
                                    }`}
                                >
                                    <div className="flex items-center space-x-4 text-left">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden border-4 border-white shadow-sm">
                                            <img src={emp.avatar} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-900">{emp.name}</p>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">高级实施工程师</p>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-xl ${currentProject?.assignedStaffId === emp.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                        {currentProject?.assignedStaffId === emp.id ? <ShieldCheck size={20} /> : <ChevronRight size={20} />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div className="space-y-6">
                        {currentProject?.phases.map(ph => (
                            <div key={ph.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group">
                                <div className="flex items-center space-x-6">
                                    <div className={`p-4 rounded-2xl shadow-sm ${ph.status === ConstructionPhaseStatus.COMPLETED ? 'bg-green-100 text-green-600' : 'bg-white text-slate-400'}`}>
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-800">{ph.name}</h4>
                                        <p className="text-xs text-slate-400 font-bold mt-1">负责人: {ph.supervisor || currentProject.assignedStaffName || '未指定'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-6">
                                    <div className="text-right">
                                        <p className="text-sm font-black text-slate-700">{ph.progress}%</p>
                                        <div className="w-32 h-1.5 bg-slate-200 rounded-full mt-1 overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: `${ph.progress}%` }} />
                                        </div>
                                    </div>
                                    <button className="p-3 bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-all">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'inspection' && (
                    <div className="space-y-10">
                        <div className="flex items-center justify-between">
                            <h4 className="font-black text-xl text-slate-800 tracking-tight">现场巡检报告 ({currentProject?.inspections.length})</h4>
                            <button 
                                onClick={() => handleAddInspection({ content: '现场施工规范，线路布置整齐。', score: 98 })}
                                className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all"
                            >
                                <Plus size={18} />
                                <span>新增巡检</span>
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                            {currentProject?.inspections.slice().reverse().map(ins => (
                                <div key={ins.id} className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-sm space-y-6 relative overflow-hidden group hover:border-blue-100 transition-all">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <ShieldCheck size={80} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                                                <Star size={20} fill="currentColor" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-slate-800">{ins.score} 分</p>
                                                <p className="text-[10px] font-black text-slate-400 uppercase">{ins.date}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${ins.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {ins.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{ins.content}"</p>
                                    <div className="pt-6 border-t flex items-center justify-between text-xs font-bold text-slate-400">
                                        <span>巡检员: {ins.inspector}</span>
                                        <button className="flex items-center space-x-1 text-blue-600 hover:underline">
                                            <Camera size={14} />
                                            <span>查看照片</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {currentProject?.inspections.length === 0 && (
                                <div className="col-span-2 py-24 text-center space-y-4">
                                    <ShieldCheck size={48} className="mx-auto text-slate-100" />
                                    <p className="text-slate-400 font-medium italic">暂无巡检记录，点击上方按钮发起第一次质检。</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'acceptance' && (
                    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-500">
                        <div className="bg-slate-900 text-white rounded-[3rem] p-12 text-center space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                                <FileText size={400} className="transform -translate-x-20 translate-y-20 rotate-12" />
                            </div>
                            <h3 className="text-4xl font-black tracking-tight">竣工验收单</h3>
                            <p className="text-slate-400 font-medium">项目已完成全部施工及系统调试，请客户进行现场核验确认。</p>
                            <div className="grid grid-cols-4 gap-4 text-xs font-black uppercase tracking-widest pt-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">智能灯光 OK</div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">安防系统 OK</div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">全屋智控 OK</div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">环境监测 OK</div>
                            </div>
                        </div>

                        {currentProject?.customerSignature ? (
                            <div className="p-10 bg-green-50 rounded-[3rem] border border-green-100 text-center space-y-8 animate-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h4 className="text-3xl font-black text-green-800">验收已完成</h4>
                                <div className="max-w-xs mx-auto p-4 bg-white rounded-2xl shadow-inner border-2 border-green-200/50">
                                    <img src={currentProject.customerSignature} className="w-full grayscale opacity-80" alt="Customer Signature" />
                                    <p className="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-tighter">Digital Signature Verified</p>
                                </div>
                                <div className="pt-6 text-sm font-bold text-green-700">
                                    验收日期: {currentProject.acceptanceDate}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex items-center justify-between px-2">
                                    <h4 className="font-black text-xl text-slate-800 flex items-center space-x-2">
                                        <PenTool size={20} className="text-blue-600" />
                                        <span>客户现场签字确认</span>
                                    </h4>
                                    <button 
                                        onClick={clearSignature}
                                        className="text-slate-400 hover:text-red-500 font-bold text-sm transition-colors"
                                    >
                                        重写 / Clear
                                    </button>
                                </div>

                                <div className="aspect-[2/1] bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200 relative group cursor-crosshair overflow-hidden bg-white shadow-inner">
                                    <canvas 
                                        ref={canvasRef}
                                        width={800}
                                        height={400}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={() => setIsDrawing(false)}
                                        onMouseLeave={() => setIsDrawing(false)}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={() => setIsDrawing(false)}
                                        className="w-full h-full"
                                    />
                                    {!isDrawing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-300 space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                            <Signature size={60} strokeWidth={1} />
                                            <p className="font-black uppercase tracking-widest text-sm">在此处手写签名</p>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={saveSignature}
                                    className="w-full py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-4"
                                >
                                    <CheckCircle2 size={24} />
                                    <span>确认并提交竣工单</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructionManager;
