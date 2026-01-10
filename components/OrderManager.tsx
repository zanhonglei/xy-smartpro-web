
import React, { useState } from 'react';
import { Order, OrderStatus, User } from '../types';
import { useLanguage } from '../App';
import { 
  Search, ShoppingCart, Filter, ChevronRight, Clock, X, 
  Download, Upload, CheckCircle2, DollarSign, Wallet, 
  FileText, History, User as UserIcon, Loader2
} from 'lucide-react';

interface OrderManagerProps {
  orders: Order[];
  currentUser: User;
  onUpdate: (orders: Order[]) => void;
  onConfirmPayment: (order: Order) => void;
}

const OrderManager: React.FC<OrderManagerProps> = ({ orders, currentUser, onUpdate, onConfirmPayment }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.WAITING_PAY: return 'bg-amber-100 text-amber-700';
      case OrderStatus.PREPARING: return 'bg-blue-100 text-blue-700';
      case OrderStatus.EXECUTING: return 'bg-purple-100 text-purple-700';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const handleUpdateOrder = (updated: Order) => {
    onUpdate(orders.map(o => o.id === updated.id ? updated : o));
    setActiveOrder(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('orderList')}</h1>
            <p className="text-slate-500 font-medium">{lang === 'zh' ? '管理已成交订单的收付款及履约进度。' : 'Manage payments and execution for closed orders.'}</p>
          </div>
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
          {filteredOrders.map(order => (
            <div 
              key={order.id}
              onClick={() => setActiveOrder(order)}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-indigo-50 text-indigo-600`}>
                  <ShoppingCart size={24} />
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                   {t(order.status.toLowerCase().replace(' ', '') as any)}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-slate-800">{order.customerName}</h3>
                <p className="text-sm text-slate-500 font-medium">{order.id} · {order.quoteId}</p>
              </div>
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '支付金额' : 'Paid'}</p>
                   <p className="text-lg font-black text-slate-800">${order.paidAmount.toLocaleString()} <span className="text-slate-300 text-sm font-medium">/ ${order.totalAmount.toLocaleString()}</span></p>
                </div>
                <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                   {t(order.paymentStatus.toLowerCase() as any)}
                </span>
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] space-y-4 bg-white/50">
               <ShoppingCart size={48} className="mx-auto text-slate-200" />
               <p className="text-slate-400 font-medium">{lang === 'zh' ? '暂无正式订单。' : 'No formal orders yet.'}</p>
            </div>
          )}
        </div>
      </div>

      {activeOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl h-[80vh] shadow-2xl overflow-hidden flex flex-col border">
             <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                   <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Wallet size={20} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-slate-900">{activeOrder.customerName} - {lang === 'zh' ? '订单中心' : 'Order Center'}</h3>
                      <p className="text-xs text-slate-500 font-bold">{activeOrder.id} · {activeOrder.status}</p>
                   </div>
                </div>
                <button onClick={() => setActiveOrder(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                   <X size={28} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto p-10 custom-scrollbar grid grid-cols-2 gap-10">
                <div className="space-y-8">
                   <div className="bg-slate-50 rounded-3xl p-8 border space-y-6">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '款项进度' : 'Payment Status'}</h4>
                      <div className="flex items-end space-x-4">
                         <div className="flex-1 space-y-2">
                            <div className="flex justify-between text-sm font-bold">
                               <span className="text-slate-500">{lang === 'zh' ? '已收金额' : 'Paid'}</span>
                               <span className="text-slate-800">${activeOrder.paidAmount.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                               <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${(activeOrder.paidAmount / activeOrder.totalAmount) * 100}%` }} />
                            </div>
                         </div>
                         <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">{lang === 'zh' ? '总计' : 'Total'}</p>
                            <p className="text-xl font-black text-slate-900">${activeOrder.totalAmount.toLocaleString()}</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                         <FileText size={14} />
                         <span>{t('paymentVoucher')}</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                         {activeOrder.vouchers.map((v, i) => (
                            <div key={i} className="aspect-video bg-slate-100 rounded-2xl border overflow-hidden relative group">
                               <img src={v} className="w-full h-full object-cover" alt="" />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button className="p-2 bg-white rounded-lg text-blue-600"><Search size={16} /></button>
                               </div>
                            </div>
                         ))}
                         <button className="aspect-video rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-white">
                            <Upload size={24} />
                            <span className="text-[10px] font-bold mt-2 uppercase">{lang === 'zh' ? '上传凭证' : 'Upload'}</span>
                         </button>
                      </div>
                   </div>
                </div>

                <div className="space-y-8">
                   <div className="bg-white rounded-3xl border p-8 space-y-6 shadow-sm">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t('actions')}</h4>
                      {activeOrder.paymentStatus !== 'Paid' && (currentUser.role === 'admin' || currentUser.role === 'finance') && (
                         <button 
                            onClick={() => onConfirmPayment(activeOrder)}
                            className="w-full py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl hover:bg-green-700 transition-all flex items-center justify-center space-x-2"
                         >
                            <CheckCircle2 size={20} />
                            <span>{t('confirmPayment')}</span>
                         </button>
                      )}
                      <button className="w-full py-4 bg-white text-slate-700 border-2 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center space-x-2">
                         <Download size={20} />
                         <span>{lang === 'zh' ? '下载入库单' : 'Download Order'}</span>
                      </button>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                         <History size={14} />
                         <span>{lang === 'zh' ? '订单日志' : 'Order History'}</span>
                      </h4>
                      <div className="space-y-4 relative ml-3 border-l-2 border-slate-100 pl-6 py-2">
                         <div className="relative">
                            <div className="absolute -left-[1.85rem] top-1 w-3 h-3 bg-green-500 rounded-full" />
                            <p className="text-xs font-bold text-slate-800">{lang === 'zh' ? '订单生成' : 'Order Created'}</p>
                            <p className="text-[10px] text-slate-400">{activeOrder.createdAt}</p>
                         </div>
                         {activeOrder.paymentStatus === 'Paid' && (
                            <div className="relative">
                               <div className="absolute -left-[1.85rem] top-1 w-3 h-3 bg-blue-500 rounded-full" />
                               <p className="text-xs font-bold text-slate-800">{lang === 'zh' ? '款项已结清' : 'Fully Paid'}</p>
                               <p className="text-[10px] text-slate-400">{new Date().toLocaleString()}</p>
                            </div>
                         )}
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

export default OrderManager;
