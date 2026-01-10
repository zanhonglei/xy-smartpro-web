
import React, { useState } from 'react';
import { SupplierRMA, SupplierRMAStatus, Supplier, Product, AfterSalesTicket } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Undo2, ChevronRight, X, Save, 
  Truck, CheckCircle2, Factory, Package, ArrowRight,
  Clock, AlertCircle, RefreshCw
} from 'lucide-react';

interface SupplierRMAManagerProps {
  rmas: SupplierRMA[];
  suppliers: Supplier[];
  products: Product[];
  tickets: AfterSalesTicket[];
  onUpdate: (rmas: SupplierRMA[]) => void;
}

const SupplierRMAManager: React.FC<SupplierRMAManagerProps> = ({ rmas, suppliers, products, tickets, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRMA, setEditingRMA] = useState<Partial<SupplierRMA> | null>(null);

  const filteredRMAs = rmas.filter(r => 
    r.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: SupplierRMAStatus) => {
    switch (status) {
      case SupplierRMAStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case SupplierRMAStatus.SHIPPED: return 'bg-blue-100 text-blue-700';
      case SupplierRMAStatus.SUPPLIER_RECEIVED: return 'bg-purple-100 text-purple-700';
      case SupplierRMAStatus.REPAIRED: return 'bg-indigo-100 text-indigo-700';
      case SupplierRMAStatus.RETURNED: return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const handleCreate = () => {
    setEditingRMA({
      id: 'RMA-' + new Date().getTime(),
      status: SupplierRMAStatus.PENDING,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingRMA?.supplierId || !editingRMA?.productId) return;
    const supplier = suppliers.find(s => s.id === editingRMA.supplierId);
    const product = products.find(p => p.id === editingRMA.productId);
    
    const finalRMA = {
      ...editingRMA,
      supplierName: supplier?.name || 'Unknown',
      productName: product?.name || 'Unknown'
    } as SupplierRMA;

    const exists = rmas.find(r => r.id === finalRMA.id);
    if (exists) {
      onUpdate(rmas.map(r => r.id === finalRMA.id ? finalRMA : r));
    } else {
      onUpdate([...rmas, finalRMA]);
    }
    setIsModalOpen(false);
    setEditingRMA(null);
  };

  const handleUpdateStatus = (rma: SupplierRMA, status: SupplierRMAStatus) => {
     onUpdate(rmas.map(r => r.id === rma.id ? { ...r, status } : r));
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('supplierAfterSales')}</h1>
            <p className="text-slate-500 font-medium">处理故障硬件返厂维保，维护供应链服务质量。</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>发起返厂申请</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索供应商、产品、RMA编号..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRMAs.map(rma => (
            <div 
              key={rma.id} 
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Undo2 size={24} />
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(rma.status)}`}>
                   {rma.status}
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                   <h3 className="text-xl font-bold text-slate-800">{rma.productName}</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{rma.id}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">返修供应商</p>
                   <p className="text-sm font-black text-slate-700 flex items-center space-x-2">
                      <Factory size={14} className="text-slate-300" />
                      <span>{rma.supplierName}</span>
                   </p>
                </div>
                <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100/50">
                   <p className="text-[9px] font-black text-red-400 uppercase mb-1">故障描述</p>
                   <p className="text-xs text-red-600 font-medium">{rma.faultDescription}</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
                   <Clock size={14} />
                   <span>{rma.createdAt}</span>
                </div>
                <div className="flex space-x-2">
                   {rma.status === SupplierRMAStatus.PENDING && (
                      <button 
                        onClick={() => handleUpdateStatus(rma, SupplierRMAStatus.SHIPPED)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                      >
                         确认发出
                      </button>
                   )}
                   {rma.status === SupplierRMAStatus.REPAIRED && (
                      <button 
                        onClick={() => handleUpdateStatus(rma, SupplierRMAStatus.RETURNED)}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all"
                      >
                         确认收货
                      </button>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && editingRMA && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col border">
             <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">发起返厂申请</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                   <X size={28} />
                </button>
             </div>
             <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">关联售后单</label>
                      <select 
                        value={editingRMA.ticketId}
                        onChange={e => setEditingRMA({...editingRMA, ticketId: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                      >
                        <option value="">-- 请选择关联售后单 --</option>
                        {tickets.map(t => <option key={t.id} value={t.id}>{t.customerName}: {t.id}</option>)}
                      </select>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">目标供应商</label>
                        <select 
                          value={editingRMA.supplierId}
                          onChange={e => setEditingRMA({...editingRMA, supplierId: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                        >
                          <option value="">-- 选择供应商 --</option>
                          {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">返修产品</label>
                        <select 
                          value={editingRMA.productId}
                          onChange={e => setEditingRMA({...editingRMA, productId: e.target.value})}
                          className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                        >
                          <option value="">-- 选择产品 --</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">详细故障说明</label>
                      <textarea 
                        value={editingRMA.faultDescription}
                        onChange={e => setEditingRMA({...editingRMA, faultDescription: e.target.value})}
                        placeholder="提交给供应商的详细检测报告..."
                        className="w-full h-32 px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800 resize-none"
                      />
                   </div>
                </div>
             </div>
             <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
                <button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all flex items-center space-x-2">
                   <Package size={20} />
                   <span>提交返厂申请</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierRMAManager;
