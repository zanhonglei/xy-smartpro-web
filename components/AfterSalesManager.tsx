
import React, { useState } from 'react';
import { AfterSalesTicket, AfterSalesStatus, Order, AfterSalesLog } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Wrench, ChevronRight, X, Save, 
  Clock, CheckCircle2, User, Phone, MessageSquare, 
  AlertTriangle, Filter, ClipboardList, Send, Camera
} from 'lucide-react';

interface AfterSalesManagerProps {
  tickets: AfterSalesTicket[];
  orders: Order[];
  onUpdate: (tickets: AfterSalesTicket[]) => void;
}

const AfterSalesManager: React.FC<AfterSalesManagerProps> = ({ tickets, orders, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<AfterSalesTicket | null>(null);
  const [newTicket, setNewTicket] = useState<Partial<AfterSalesTicket> | null>(null);
  const [logContent, setLogContent] = useState('');

  const filteredTickets = tickets.filter(t => 
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: AfterSalesStatus) => {
    switch (status) {
      case AfterSalesStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case AfterSalesStatus.ASSIGNED: return 'bg-blue-100 text-blue-700';
      case AfterSalesStatus.PROCESSING: return 'bg-purple-100 text-purple-700';
      case AfterSalesStatus.RESOLVED: return 'bg-green-100 text-green-700';
      case AfterSalesStatus.CLOSED: return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const handleCreateTicket = () => {
    setNewTicket({
      id: 'AST-' + new Date().getTime(),
      status: AfterSalesStatus.PENDING,
      priority: 'Medium',
      logs: [],
      createdAt: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSaveTicket = () => {
    if (!newTicket?.customerId || !newTicket?.description) return;
    const customerOrder = orders.find(o => o.customerId === newTicket.customerId);
    const finalTicket = {
      ...newTicket,
      customerName: customerOrder?.customerName || 'Unknown',
      phone: '138xxxxxxxx', // Mock
      updatedAt: new Date().toISOString().split('T')[0]
    } as AfterSalesTicket;
    onUpdate([...tickets, finalTicket]);
    setIsModalOpen(false);
    setNewTicket(null);
  };

  const handleAddLog = () => {
    if (!activeTicket || !logContent.trim()) return;
    const newLog: AfterSalesLog = {
      id: 'log-' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toLocaleString(),
      content: logContent,
      operator: '管理员'
    };
    const updated = { 
      ...activeTicket, 
      logs: [...activeTicket.logs, newLog],
      status: activeTicket.status === AfterSalesStatus.PENDING ? AfterSalesStatus.PROCESSING : activeTicket.status
    };
    onUpdate(tickets.map(t => t.id === activeTicket.id ? updated : t));
    setActiveTicket(updated);
    setLogContent('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('afterSalesTicket')}</h1>
            <p className="text-slate-500 font-medium">响应客户维保需求，提升品牌服务口碑。</p>
          </div>
          <button 
            onClick={handleCreateTicket}
            className="flex items-center space-x-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-bold shadow-xl hover:bg-amber-600 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>创建售后单</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索客户姓名、工单号..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-amber-500 font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => setActiveTicket(ticket)}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
                  <Wrench size={24} />
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(ticket.status)}`}>
                   {ticket.status}
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                   <h3 className="text-xl font-bold text-slate-800">{ticket.customerName}</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{ticket.id}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-600 font-medium leading-relaxed">
                   {ticket.description}
                </div>
                <div className="flex items-center space-x-2">
                   <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                     ticket.priority === 'High' ? 'border-red-200 text-red-500 bg-red-50' : 
                     ticket.priority === 'Medium' ? 'border-amber-200 text-amber-500 bg-amber-50' : 
                     'border-slate-200 text-slate-500 bg-slate-50'
                   }`}>
                      Priority: {ticket.priority}
                   </span>
                   <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[9px] font-black uppercase">
                      {ticket.issueType}
                   </span>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
                   <Clock size={14} />
                   <span>{ticket.createdAt}</span>
                </div>
                <div className="text-amber-600 group-hover:translate-x-1 transition-transform">
                   <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}
          {filteredTickets.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] space-y-4 bg-white/50">
               <ClipboardList size={48} className="mx-auto text-slate-200" />
               <p className="text-slate-400 font-medium">暂无售后任务</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && newTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border">
             <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">登记售后需求</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                   <X size={28} />
                </button>
             </div>
             <div className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">关联客户/订单</label>
                   <select 
                    value={newTicket.customerId}
                    onChange={e => setNewTicket({...newTicket, customerId: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                   >
                     <option value="">-- 请选择关联客户 --</option>
                     {orders.map(o => <option key={o.id} value={o.customerId}>{o.customerName} ({o.id})</option>)}
                   </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">问题分类</label>
                    <select 
                      value={newTicket.issueType}
                      onChange={e => setNewTicket({...newTicket, issueType: e.target.value as any})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                    >
                      <option value="Hardware">硬件故障</option>
                      <option value="Software">软件调试</option>
                      <option value="Maintenance">定期保养</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">紧急程度</label>
                    <select 
                      value={newTicket.priority}
                      onChange={e => setNewTicket({...newTicket, priority: e.target.value as any})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                    >
                      <option value="Low">普通</option>
                      <option value="Medium">中等</option>
                      <option value="High">紧急</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">故障详述</label>
                   <textarea 
                    value={newTicket.description}
                    onChange={e => setNewTicket({...newTicket, description: e.target.value})}
                    placeholder="客户反馈的具体异常现象..."
                    className="w-full h-32 px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800 resize-none"
                   />
                </div>
             </div>
             <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
                <button onClick={handleSaveTicket} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all">创建工单</button>
             </div>
          </div>
        </div>
      )}

      {activeTicket && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-4xl h-[85vh] shadow-2xl overflow-hidden flex flex-col border">
              <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Wrench size={20} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900">{activeTicket.customerName} - 工单详情</h3>
                      <p className="text-xs text-slate-500 font-bold">{activeTicket.id} · {activeTicket.status}</p>
                   </div>
                </div>
                <button onClick={() => setActiveTicket(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                   <X size={28} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scrollbar grid grid-cols-12 gap-10">
                 <div className="col-span-5 space-y-8">
                    <div className="bg-slate-50 rounded-3xl p-8 border space-y-6">
                       <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">工单信息</h4>
                       <div className="space-y-4">
                          <div className="flex items-center justify-between">
                             <span className="text-xs text-slate-400 font-bold uppercase">关联订单</span>
                             <span className="text-sm font-black text-slate-700">{activeTicket.orderId}</span>
                          </div>
                          <div className="flex items-center justify-between">
                             <span className="text-xs text-slate-400 font-bold uppercase">问题分类</span>
                             <span className="text-sm font-black text-slate-700">{activeTicket.issueType}</span>
                          </div>
                          <div className="pt-4 border-t border-slate-200">
                             <p className="text-xs text-slate-400 font-bold uppercase mb-2">故障描述</p>
                             <p className="text-sm text-slate-600 leading-relaxed font-medium">{activeTicket.description}</p>
                          </div>
                       </div>
                    </div>
                    <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex items-start space-x-4">
                       <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                       <p className="text-xs text-amber-700 leading-relaxed font-medium">
                          该工单已被标记为 <b>{activeTicket.priority}</b> 优先级，请尽快联系客户确定上门时间。
                       </p>
                    </div>
                 </div>

                 <div className="col-span-7 flex flex-col">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
                       <ClipboardList size={14} />
                       <span>处理日志与进度</span>
                    </h4>
                    
                    <div className="flex-1 space-y-6 relative ml-4 border-l-2 border-slate-100 pl-8 pb-8">
                       {activeTicket.logs.map((log, idx) => (
                          <div key={log.id} className="relative group">
                             <div className="absolute -left-[3.15rem] top-1 w-4 h-4 bg-white border-4 border-amber-500 rounded-full shadow-sm" />
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.timestamp}</p>
                             <h5 className="font-bold text-slate-800 mt-1">{log.operator}</h5>
                             <p className="text-sm text-slate-500 mt-1">{log.content}</p>
                          </div>
                       ))}
                       {activeTicket.logs.length === 0 && <p className="text-slate-400 text-sm italic">暂无记录</p>}
                    </div>

                    <div className="mt-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 space-y-4">
                       <textarea 
                        value={logContent}
                        onChange={e => setLogContent(e.target.value)}
                        placeholder="记录处理进展，例如：已预约周六下午2点上门..."
                        className="w-full h-24 bg-transparent outline-none font-medium text-slate-700 resize-none"
                       />
                       <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                          <button className="p-2 bg-white rounded-xl text-slate-400 hover:text-blue-500 border transition-all">
                             <Camera size={18} />
                          </button>
                          <button 
                            onClick={handleAddLog}
                            className="px-8 py-2 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all flex items-center space-x-2"
                          >
                             <span>发送日志</span>
                             <Send size={14} />
                          </button>
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

export default AfterSalesManager;
