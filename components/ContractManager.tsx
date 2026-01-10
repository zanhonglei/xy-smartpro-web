
import React, { useState, useMemo } from 'react';
import { Contract, Solution, ContractTemplate, ElectronicSeal, ContractStatus } from '../types';
import { useLanguage } from '../App';
import { 
  FileText, Search, Filter, Plus, ChevronRight, CheckCircle2, 
  Clock, X, Download, Share2, Printer, Shield, PenTool, Layout, Loader2 
} from 'lucide-react';

interface ContractManagerProps {
  contracts: Contract[];
  solutions: Solution[];
  templates: ContractTemplate[];
  seals: ElectronicSeal[];
  onUpdate: (contracts: Contract[]) => void;
}

const ContractManager: React.FC<ContractManagerProps> = ({ contracts, solutions, templates, seals, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [activeContract, setActiveContract] = useState<Contract | null>(null);

  const filteredContracts = contracts.filter(c => 
    c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.solutionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.DRAFT: return 'bg-slate-100 text-slate-600';
      case ContractStatus.WAITING_SIGN: return 'bg-amber-100 text-amber-700';
      case ContractStatus.SIGNED: return 'bg-green-100 text-green-700';
      case ContractStatus.ARCHIVED: return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const handleCreateContract = () => {
    const solution = solutions.find(s => s.id === selectedSolutionId);
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!solution || !template) return;

    // Simple template rendering
    let content = template.content;
    content = content.replace('{{customerName}}', solution.customerName);
    content = content.replace('{{solutionName}}', solution.name);
    content = content.replace('{{totalPrice}}', solution.totalPrice.toString());
    content = content.replace('{{date}}', new Date().toLocaleDateString());

    const deviceListStr = solution.devices.map(d => `- ${d.roomName}: ${d.productId}`).join('\n');
    content = content.replace('{{deviceList}}', deviceListStr);

    const newContract: Contract = {
      id: 'CT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      templateId: selectedTemplateId,
      solutionId: selectedSolutionId,
      solutionName: solution.name,
      customerName: solution.customerName,
      totalPrice: solution.totalPrice,
      status: ContractStatus.WAITING_SIGN,
      content,
      createdAt: new Date().toISOString()
    };

    onUpdate([...contracts, newContract]);
    setIsCreateModalOpen(false);
  };

  const handleSignContract = (sealId: string) => {
    if (!activeContract) return;
    const updated = contracts.map(c => {
      if (c.id === activeContract.id) {
        return {
          ...c,
          status: ContractStatus.SIGNED,
          sealId,
          signedAt: new Date().toISOString()
        };
      }
      return c;
    });
    onUpdate(updated);
    setActiveContract(updated.find(c => c.id === activeContract.id) || null);
    alert(lang === 'zh' ? '签署成功！' : 'Signed successfully!');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('contractMgmt')}</h1>
            <p className="text-slate-500 font-medium">{lang === 'zh' ? '管理客户合同及法律文书签署状态。' : 'Manage customer contracts and legal document signing status.'}</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all"
          >
            <Plus size={20} />
            <span>{t('createContract')}</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t('searchSolution')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredContracts.map(contract => (
            <div 
              key={contract.id}
              onClick={() => setActiveContract(contract)}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl ${contract.status === ContractStatus.SIGNED ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  <FileText size={24} />
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(contract.status)}`}>
                   {t(contract.status.toLowerCase().replace(' ', '') as any)}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-slate-800">{contract.solutionName}</h3>
                <p className="text-sm text-slate-500 font-medium">{contract.customerName} · {contract.id}</p>
              </div>
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('price')}</p>
                   <p className="text-xl font-black text-blue-600">${contract.totalPrice.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
                   <Clock size={14} />
                   <span>{contract.createdAt.split('T')[0]}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredContracts.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] space-y-4 bg-white/50">
               <FileText size={48} className="mx-auto text-slate-200" />
               <p className="text-slate-400 font-medium">{lang === 'zh' ? '暂无合同记录，点击上方按钮开始创建。' : 'No contracts yet. Click above to create one.'}</p>
            </div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('createContract')}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                <X size={28} />
              </button>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('selectSolution')}</label>
                <select 
                  value={selectedSolutionId}
                  onChange={e => setSelectedSolutionId(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                >
                  <option value="">{lang === 'zh' ? '-- 请选择关联方案 --' : '-- Select Solution --'}</option>
                  {solutions.map(s => <option key={s.id} value={s.id}>{s.name} ({s.customerName})</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('selectTemplate')}</label>
                <select 
                  value={selectedTemplateId}
                  onChange={e => setSelectedTemplateId(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                >
                  <option value="">{lang === 'zh' ? '-- 请选择合同模板 --' : '-- Select Template --'}</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="pt-8 flex space-x-3">
                 <button onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500">{t('cancel')}</button>
                 <button 
                  onClick={handleCreateContract}
                  disabled={!selectedSolutionId || !selectedTemplateId}
                  className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl disabled:opacity-50"
                 >
                   {t('save')}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeContract && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
               <div className="flex items-center space-x-4">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <FileText size={20} />
                 </div>
                 <div>
                    <h3 className="text-xl font-black text-slate-900">{activeContract.solutionName}</h3>
                    <p className="text-xs text-slate-500 font-bold">{activeContract.id} · {activeContract.status}</p>
                 </div>
               </div>
               <div className="flex items-center space-x-2">
                 {activeContract.status === ContractStatus.WAITING_SIGN && (
                   <div className="relative group">
                     <button className="flex items-center space-x-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md">
                       <PenTool size={18} />
                       <span>{t('signContract')}</span>
                     </button>
                     <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl border p-4 w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                        <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-2 tracking-widest">{lang === 'zh' ? '选择签章' : 'Select Seal'}</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                           {seals.map(seal => (
                             <button 
                              key={seal.id}
                              onClick={() => handleSignContract(seal.id)}
                              className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-50 transition-all text-left group/seal"
                             >
                               <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden border">
                                 <img src={seal.imageUrl} className="w-full h-full object-contain" alt="" />
                               </div>
                               <span className="text-sm font-bold text-slate-700 truncate group-hover/seal:text-blue-600">{seal.name}</span>
                             </button>
                           ))}
                        </div>
                     </div>
                   </div>
                 )}
                 <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                    <Download size={24} />
                 </button>
                 <button onClick={() => setActiveContract(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                    <X size={28} />
                 </button>
               </div>
            </div>
            <div className="flex-1 bg-slate-100 p-12 overflow-y-auto custom-scrollbar flex justify-center">
               <div className="bg-white w-full max-w-[800px] shadow-2xl p-16 rounded-sm min-h-full relative font-serif text-slate-800">
                  {activeContract.status === ContractStatus.SIGNED && activeContract.sealId && (
                    <div className="absolute bottom-40 right-40 opacity-80 pointer-events-none transform rotate-[-15deg]">
                       <img 
                        src={seals.find(s => s.id === activeContract.sealId)?.imageUrl} 
                        className="w-48 h-48 object-contain" 
                        alt="Seal" 
                       />
                       <p className="text-[10px] text-red-500 font-bold text-center mt-2">{lang === 'zh' ? '数字签章已生效' : 'Digital Seal Verified'}</p>
                    </div>
                  )}
                  <h1 className="text-3xl font-black text-center mb-12 uppercase tracking-widest">{lang === 'zh' ? '全屋智能系统服务协议' : 'Smart Home Service Agreement'}</h1>
                  <div className="whitespace-pre-wrap leading-loose text-lg space-y-8">
                     {activeContract.content}
                  </div>
                  <div className="mt-24 grid grid-cols-2 gap-12 border-t pt-12 text-sm font-bold text-slate-500">
                     <div className="space-y-4">
                        <p>{lang === 'zh' ? '甲方 (客户):' : 'Party A (Customer):'} {activeContract.customerName}</p>
                        <p>{lang === 'zh' ? '签署日期:' : 'Date:'} {activeContract.signedAt?.split('T')[0] || '--'}</p>
                        <div className="h-16 border-b-2 border-slate-200 flex items-end pb-2 opacity-30 italic">
                          {lang === 'zh' ? '在此处电子签名' : 'Customer Digital Signature Here'}
                        </div>
                     </div>
                     <div className="space-y-4">
                        <p>{lang === 'zh' ? '乙方 (服务商):' : 'Party B (Provider):'} SmartPro Solutions</p>
                        <p>{lang === 'zh' ? '签署日期:' : 'Date:'} {activeContract.signedAt?.split('T')[0] || '--'}</p>
                        <div className="h-16 border-b-2 border-slate-200" />
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

export default ContractManager;
