
import React, { useState, useMemo, useEffect } from 'react';
import { Customer, CustomerStatus, User } from '../types';
import { useLanguage } from '../App';
import { 
  Search, Plus, UserPlus, Phone, MapPin, Home, 
  Tag as TagIcon, FileText, Upload, X, Check, 
  Filter, LayoutGrid, List, ChevronLeft, ChevronRight, Clock, UserCheck,
  // Added missing Edit icon import
  Edit
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
  
  // Persistent view mode memory for specific customer view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem(`view_mode_customers_${type}`) as any) || 'grid'
  );

  useEffect(() => {
    localStorage.setItem(`view_mode_customers_${type}`, viewMode);
  }, [viewMode, type]);

  // Pagination implementation
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchType = type === 'mine' ? c.assignedTo === currentUser.id : !c.assignedTo;
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.phone.includes(searchTerm);
      return matchType && matchSearch;
    });
  }, [customers, searchTerm, type, currentUser.id]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

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
        assignedTo: type === 'mine' ? currentUser.id : undefined,
        status: editingCustomer.status || CustomerStatus.POTENTIAL,
        files: [],
        needs: []
      };
      onUpdate([newCustomer, ...customers]);
    }
    setIsModalOpen(false);
  };

  const getStatusColor = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.POTENTIAL: return 'bg-slate-100 text-slate-600';
      case CustomerStatus.INTENTIONAL: return 'bg-blue-50 text-blue-600';
      case CustomerStatus.CONTRACTED: return 'bg-green-50 text-green-700';
      case CustomerStatus.VOIDED: return 'bg-red-50 text-red-600';
      default: return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      {/* Dynamic Header */}
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {type === 'pool' ? '客户公海池' : '我的私域客户'}
            </h1>
            <p className="text-slate-500 font-medium">维护潜在线索与深度意向客户，驱动销售增长。</p>
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
             <button 
                onClick={() => {setEditingCustomer({status: CustomerStatus.POTENTIAL}); setIsModalOpen(true);}} 
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
             >
                <Plus size={20} />
                <span>新增客户</span>
             </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="搜索姓名、电话或地址..." 
                value={searchTerm} 
                onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
                className="w-full pl-12 pr-6 py-3 rounded-2xl bg-slate-100 border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm transition-all" 
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedData.map(c => (
              <div key={c.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all group h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl shadow-inner">
                    {c.name.charAt(0)}
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(c.status)}`}>
                    {c.status}
                  </span>
                </div>
                <div className="space-y-4 mb-8 flex-1">
                  <h3 className="text-2xl font-black text-slate-900">{c.name}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 text-slate-600">
                        <Phone size={16} className="text-slate-300" />
                        <span className="text-sm font-semibold">{c.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-600">
                        <MapPin size={16} className="text-slate-300" />
                        <span className="text-sm font-medium truncate">{c.address}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-slate-600">
                        <Home size={16} className="text-slate-300" />
                        <span className="text-xs font-bold uppercase text-slate-400">{c.houseType || '未填写房型'}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-6 border-t flex items-center justify-between">
                   <button 
                    onClick={() => {setEditingCustomer(c); setIsModalOpen(true);}} 
                    className="text-blue-600 text-sm font-bold hover:underline flex items-center space-x-1"
                   >
                     <span>编辑资料</span>
                     <ChevronRight size={14} />
                   </button>
                   <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center space-x-1">
                      <Clock size={12} />
                      <span>{c.createdAt} 创建</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] border overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-xs font-black text-slate-400 uppercase tracking-widest">
                   <tr>
                      <th className="px-8 py-5">客户姓名</th>
                      <th className="px-8 py-5">联系电话</th>
                      <th className="px-8 py-5">跟进状态</th>
                      <th className="px-8 py-5">房屋地址</th>
                      <th className="px-8 py-5">房型信息</th>
                      <th className="px-8 py-5 text-right">操作</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {paginatedData.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => {setEditingCustomer(c); setIsModalOpen(true);}}>
                         <td className="px-8 py-5">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 font-black text-xs uppercase">{c.name.charAt(0)}</div>
                                <span className="font-bold text-slate-800">{c.name}</span>
                            </div>
                         </td>
                         <td className="px-8 py-5 font-semibold text-slate-600">{c.phone}</td>
                         <td className="px-8 py-5">
                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${getStatusColor(c.status)}`}>
                                {c.status}
                            </span>
                         </td>
                         <td className="px-8 py-5 text-sm text-slate-500 truncate max-w-xs">{c.address}</td>
                         <td className="px-8 py-5 text-slate-400 font-bold uppercase text-[10px] tracking-tight">{c.houseType}</td>
                         <td className="px-8 py-5 text-right">
                            {/* Fixed missing Edit icon usage */}
                            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={16} /></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="py-32 text-center space-y-6 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <UserCheck size={48} />
            </div>
            <p className="text-slate-400 text-xl font-medium">{t('noResults')}</p>
          </div>
        )}

        {/* Unified Pagination */}
        {filteredCustomers.length > 0 && (
          <div className="mt-12 flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border shadow-sm">
             <p className="text-sm font-bold text-slate-500">
                第 {currentPage} 页 / 共 {totalPages} 页 (总计 {filteredCustomers.length} 条)
             </p>
             <div className="flex space-x-2">
                <button 
                    disabled={currentPage === 1} 
                    onClick={() => setCurrentPage(p => p - 1)} 
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-all"
                >
                    <ChevronLeft size={20} />
                </button>
                <div className="flex space-x-1">
                    {[...Array(totalPages)].map((_, i) => (
                    <button 
                        key={i} 
                        onClick={() => setCurrentPage(i+1)} 
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i+1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                    >
                        {i+1}
                    </button>
                    ))}
                </div>
                <button 
                    disabled={currentPage === totalPages} 
                    onClick={() => setCurrentPage(p => p + 1)} 
                    className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-all"
                >
                    <ChevronRight size={20} />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isModalOpen && editingCustomer && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl p-10 space-y-8 animate-in zoom-in duration-300 border">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">客户信息管理</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"><X size={24}/></button>
              </div>
              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">客户全名</label>
                    <input type="text" placeholder="请输入客户姓名" value={editingCustomer.name || ''} onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all bg-slate-50 focus:bg-white" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">联系电话</label>
                    <input type="text" placeholder="客户手机号码" value={editingCustomer.phone || ''} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all bg-slate-50 focus:bg-white" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">详细收货地址</label>
                    <input type="text" placeholder="客户房屋所在地" value={editingCustomer.address || ''} onChange={e => setEditingCustomer({...editingCustomer, address: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all bg-slate-50 focus:bg-white" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">房屋类型</label>
                        <select value={editingCustomer.houseType} onChange={e => setEditingCustomer({...editingCustomer, houseType: e.target.value})} className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 font-bold bg-slate-50">
                            <option value="">-- 选择房型 --</option>
                            <option value="三室二厅">三室二厅</option>
                            <option value="别墅">豪华别墅</option>
                            <option value="公寓">精装公寓</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">跟进状态</label>
                        <select value={editingCustomer.status} onChange={e => setEditingCustomer({...editingCustomer, status: e.target.value as CustomerStatus})} className="w-full px-4 py-4 rounded-2xl border-2 border-slate-100 font-bold bg-slate-50">
                            <option value={CustomerStatus.POTENTIAL}>潜在客户</option>
                            <option value={CustomerStatus.INTENTIONAL}>意向深聊</option>
                            <option value={CustomerStatus.CONTRACTED}>已签约</option>
                        </select>
                    </div>
                 </div>
              </div>
              <div className="pt-6 flex space-x-4">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">取消</button>
                 <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all">确认并保存</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManager;
