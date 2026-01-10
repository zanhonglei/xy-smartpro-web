
import React, { useState, useMemo } from 'react';
import { Customer, CustomerStatus, CustomerFile, User } from '../types';
import { useLanguage } from '../App';
import { 
  Search, 
  Plus, 
  UserPlus, 
  Phone, 
  MapPin, 
  Home, 
  Tag as TagIcon, 
  FileText, 
  Upload, 
  X, 
  Check, 
  MoreVertical,
  Filter,
  Users,
  Briefcase,
  ExternalLink,
  ChevronRight,
  Clock,
  ShieldAlert
} from 'lucide-react';

interface CustomerManagerProps {
  customers: Customer[];
  onUpdate: (customers: Customer[]) => void;
  currentUser: User;
  type: 'pool' | 'mine';
}

const CustomerManager: React.FC<CustomerManagerProps> = ({ customers, onUpdate, currentUser, type }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'needs' | 'files'>('info');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const isTypeMatch = type === 'mine' ? c.assignedTo === currentUser.id : !c.assignedTo;
      const isSearchMatch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.phone.includes(searchTerm) || 
                          c.address.toLowerCase().includes(searchTerm.toLowerCase());
      return isTypeMatch && isSearchMatch;
    });
  }, [customers, searchTerm, type, currentUser.id]);

  const handleCreateCustomer = () => {
    setEditingCustomer({
      status: CustomerStatus.POTENTIAL,
      needs: [],
      files: []
    });
    setActiveTab('info');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingCustomer?.name || !editingCustomer?.phone) return;

    if (editingCustomer.id) {
      onUpdate(customers.map(c => c.id === editingCustomer.id ? { ...c, ...editingCustomer } as Customer : c));
    } else {
      const newCustomer: Customer = {
        ...(editingCustomer as Customer),
        id: 'c' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        assignedTo: type === 'mine' ? currentUser.id : undefined
      };
      onUpdate([...customers, newCustomer]);
    }
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleClaim = (id: string) => {
    onUpdate(customers.map(c => c.id === id ? { ...c, assignedTo: currentUser.id } : c));
  };

  const toggleNeed = (need: string) => {
    if (!editingCustomer) return;
    const currentNeeds = editingCustomer.needs || [];
    if (currentNeeds.includes(need)) {
      setEditingCustomer({ ...editingCustomer, needs: currentNeeds.filter(n => n !== need) });
    } else {
      setEditingCustomer({ ...editingCustomer, needs: [...currentNeeds, need] });
    }
  };

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.POTENTIAL: return 'bg-slate-100 text-slate-600';
      case CustomerStatus.INTENTIONAL: return 'bg-blue-100 text-blue-700';
      case CustomerStatus.CONTRACTED: return 'bg-green-100 text-green-700';
      case CustomerStatus.VOIDED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      {/* Top Header */}
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {type === 'pool' ? t('customerPool') : t('myCustomers')}
            </h1>
            <p className="text-slate-500 font-medium">
              {type === 'pool' ? '未分配的潜在客户资源池' : '由您负责跟进的深度意向客户'}
            </p>
          </div>
          <button 
            onClick={handleCreateCustomer}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>{t('newCustomer')}</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索姓名、电话或地址..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCustomers.map(customer => (
            <div 
              key={customer.id} 
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-inner">
                    {customer.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{customer.name}</h3>
                    <div className="flex items-center space-x-2 text-slate-400 text-xs mt-1">
                      <Clock size={12} />
                      <span>{customer.createdAt}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(customer.status)}`}>
                  {t(customer.status.toLowerCase() as any)}
                </span>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span className="text-sm font-semibold">{customer.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <MapPin size={16} className="text-slate-400" />
                  <span className="text-sm font-medium truncate">{customer.address}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-600">
                  <Home size={16} className="text-slate-400" />
                  <span className="text-sm font-medium">{customer.houseType}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {customer.needs.slice(0, 3).map(need => (
                  <span key={need} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {need}
                  </span>
                ))}
                {customer.needs.length > 3 && (
                  <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-full text-[10px] font-bold">
                    +{customer.needs.length - 3}
                  </span>
                )}
              </div>

              <div className="mt-auto pt-6 border-t flex items-center justify-between">
                {type === 'pool' ? (
                  <button 
                    onClick={() => handleClaim(customer.id)}
                    className="w-full flex items-center justify-center space-x-2 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg"
                  >
                    <UserPlus size={18} />
                    <span>领用至我的客户</span>
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => { setEditingCustomer(customer); setIsModalOpen(true); }}
                      className="text-blue-600 text-sm font-bold flex items-center hover:underline"
                    >
                      查看详情 <ChevronRight size={16} />
                    </button>
                    <div className="flex items-center space-x-1 text-slate-400 text-xs font-bold">
                      <FileText size={14} />
                      <span>{customer.files.length} 份资料</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] space-y-4 bg-white/50">
               <Users size={48} className="mx-auto text-slate-200" />
               <p className="text-slate-400 font-medium">暂无匹配的客户记录</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl h-[85vh] shadow-2xl overflow-hidden flex flex-col border border-white/20">
            {/* Modal Header */}
            <div className="p-10 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-6">
                 <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                    <UserPlus size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {editingCustomer.id ? editingCustomer.name : t('newCustomer')}
                    </h3>
                    <p className="text-slate-500 font-medium">完善客户画像，助力精准转化</p>
                 </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                <X size={28} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-10 py-4 bg-white border-b flex space-x-8">
              {[
                { id: 'info', label: '基础信息' },
                { id: 'needs', label: '核心需求' },
                { id: 'files', label: '相关资料' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2 text-sm font-black uppercase tracking-widest transition-all relative ${
                    activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full" />}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {activeTab === 'info' && (
                <div className="grid grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">客户姓名</label>
                    <input 
                      type="text" 
                      value={editingCustomer.name || ''}
                      onChange={e => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all"
                      placeholder="请输入客户姓名"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">联系电话</label>
                    <input 
                      type="text" 
                      value={editingCustomer.phone || ''}
                      onChange={e => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all"
                      placeholder="138xxxx8888"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">房屋地址</label>
                    <input 
                      type="text" 
                      value={editingCustomer.address || ''}
                      onChange={e => setEditingCustomer({ ...editingCustomer, address: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all"
                      placeholder="省市区/街道/小区门牌号"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">房屋类型</label>
                    <select 
                      value={editingCustomer.houseType || ''}
                      onChange={e => setEditingCustomer({ ...editingCustomer, houseType: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all bg-white"
                    >
                      <option value="">请选择类型</option>
                      <option value="Villa">独栋别墅</option>
                      <option value="Townhouse">联排别墅</option>
                      <option value="Apartment">大平层/公寓</option>
                      <option value="Commercial">商业空间</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">跟进状态</label>
                    <select 
                      value={editingCustomer.status || CustomerStatus.POTENTIAL}
                      onChange={e => setEditingCustomer({ ...editingCustomer, status: e.target.value as CustomerStatus })}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all bg-white"
                    >
                      <option value={CustomerStatus.POTENTIAL}>潜在客户</option>
                      <option value={CustomerStatus.INTENTIONAL}>意向客户</option>
                      <option value={CustomerStatus.CONTRACTED}>已签约</option>
                      <option value={CustomerStatus.VOIDED}>作废</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'needs' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">热门需求库</label>
                     <div className="flex flex-wrap gap-3">
                        {['全屋语音控制', '全屋灯光智控', '安防联动', '影音场景', '全宅WiFi覆盖', '智能遮阳', '环境监测', '老人看护', '全宅净水'].map(need => (
                          <button
                            key={need}
                            onClick={() => toggleNeed(need)}
                            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                              editingCustomer.needs?.includes(need) 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg' 
                              : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'
                            }`}
                          >
                            {need}
                          </button>
                        ))}
                     </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">补充描述</label>
                    <textarea 
                      className="w-full h-32 px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-medium text-slate-700 resize-none"
                      placeholder="记录客户的其他个性化需求细节..."
                    />
                  </div>
                </div>
              )}

              {activeTab === 'files' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 hover:border-blue-200 transition-colors bg-slate-50/50 cursor-pointer group">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors shadow-sm">
                        <Upload size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-700">点击或拖拽上传户型图</p>
                        <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">PNG, JPG, PDF (MAX 10MB)</p>
                      </div>
                    </div>
                    <div className="p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center space-y-4 hover:border-blue-200 transition-colors bg-slate-50/50 cursor-pointer group">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 group-hover:text-blue-500 transition-colors shadow-sm">
                        <Plus size={32} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-slate-700">添加施工进度照片/资料</p>
                        <p className="text-xs text-slate-400 mt-1 font-bold uppercase tracking-widest">多选上传</p>
                      </div>
                    </div>
                  </div>

                  {editingCustomer.files && editingCustomer.files.length > 0 ? (
                    <div className="grid grid-cols-4 gap-4">
                       {editingCustomer.files.map(file => (
                         <div key={file.id} className="group relative aspect-square rounded-2xl border overflow-hidden">
                           <img src={file.url} className="w-full h-full object-cover" alt="" />
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button className="p-2 bg-white rounded-lg text-red-500 shadow-xl"><X size={16} /></button>
                           </div>
                         </div>
                       ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                       <ShieldAlert className="mx-auto text-slate-200 mb-4" size={48} />
                       <p className="text-slate-400 font-medium italic">暂未上传房屋资料，AI 辅助设计功能将无法使用</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-10 border-t bg-slate-50 flex justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500 hover:text-slate-800 transition-all">
                {t('cancel')}
              </button>
              <button 
                onClick={handleSave}
                className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black hover:scale-105 transition-all flex items-center space-x-3"
              >
                <Check size={20} />
                <span>{editingCustomer.id ? t('save') : '确认入库'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
