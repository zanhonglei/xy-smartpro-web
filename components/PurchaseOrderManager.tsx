
import React, { useState, useMemo, useEffect } from 'react';
import { PurchaseOrder, Supplier, Product, PurchaseOrderStatus, PurchaseOrderItem } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, FileText, ChevronRight, X, Save, 
  ShoppingCart, Truck, CheckCircle2, DollarSign, Clock,
  LayoutGrid, List, ChevronLeft
} from 'lucide-react';

interface PurchaseOrderManagerProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
  products: Product[];
  onUpdate: (orders: PurchaseOrder[]) => void;
}

const PurchaseOrderManager: React.FC<PurchaseOrderManagerProps> = ({ purchaseOrders, suppliers, products, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<Partial<PurchaseOrder> | null>(null);

  // Persistent view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem('view_mode_purchase_orders') as any) || 'grid'
  );

  useEffect(() => {
    localStorage.setItem('view_mode_purchase_orders', viewMode);
  }, [viewMode]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(o => 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [purchaseOrders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const getStatusColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.DRAFT: return 'bg-slate-100 text-slate-600';
      case PurchaseOrderStatus.PENDING: return 'bg-amber-100 text-amber-700';
      case PurchaseOrderStatus.ORDERED: return 'bg-blue-100 text-blue-700';
      case PurchaseOrderStatus.RECEIVED: return 'bg-green-100 text-green-700';
      case PurchaseOrderStatus.CANCELLED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const handleCreate = () => {
    setEditingPO({
      id: 'PO-' + new Date().getTime(),
      supplierId: '',
      supplierName: '',
      items: [],
      totalAmount: 0,
      status: PurchaseOrderStatus.DRAFT,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingPO || !editingPO.supplierId) return;
    const supplier = suppliers.find(s => s.id === editingPO.supplierId);
    const finalPO = { ...editingPO, supplierName: supplier?.name || '' } as PurchaseOrder;
    onUpdate([...purchaseOrders, finalPO]);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('purchaseOrder')}</h1>
            <p className="text-slate-500 font-medium">针对项目需求直接向供应商发起采购申请。</p>
          </div>
          <div className="flex items-center space-x-3">
             <div className="flex bg-slate-100 p-1 rounded-xl border">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List size={20} /></button>
             </div>
             <button onClick={handleCreate} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"><Plus size={20} /><span>新建采购单</span></button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="搜索采购单号、供应商..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedOrders.map(order => (
              <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group">
                <div className="flex items-center justify-between mb-6"><div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><ShoppingCart size={24} /></div><span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>{order.status}</span></div>
                <div className="flex-1 space-y-4"><div><h3 className="text-xl font-bold text-slate-800 truncate">{order.supplierName}</h3><p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{order.id}</p></div><div className="space-y-1"><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">采购金额</p><p className="text-xl font-black text-blue-600">${order.totalAmount.toLocaleString()}</p></div></div>
                <div className="mt-8 pt-6 border-t flex items-center justify-between"><div className="flex items-center space-x-2 text-slate-400 text-xs font-bold"><Clock size={14} /><span>{order.createdAt}</span></div></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-xs font-black text-slate-400 uppercase">
                   <tr><th className="px-6 py-4">单据编号</th><th className="px-6 py-4">供应商</th><th className="px-6 py-4">状态</th><th className="px-6 py-4 text-right">总金额</th><th className="px-6 py-4 text-right">创建日期</th></tr>
                </thead>
                <tbody className="divide-y">
                   {paginatedOrders.map(o => (
                      <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4 font-bold text-slate-800">{o.id}</td>
                         <td className="px-6 py-4 text-slate-600 font-medium">{o.supplierName}</td>
                         <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${getStatusColor(o.status)}`}>{o.status}</span></td>
                         <td className="px-6 py-4 text-right font-black text-blue-600">${o.totalAmount.toLocaleString()}</td>
                         <td className="px-6 py-4 text-right text-slate-400 text-xs font-bold">{o.createdAt}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border shadow-sm">
          <p className="text-sm font-bold text-slate-500">第 {currentPage} 页 / 共 {totalPages} 页</p>
          <div className="flex space-x-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-30"><ChevronLeft size={20} /></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-30"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {isModalOpen && editingPO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl h-[85vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between"><h3 className="text-2xl font-black text-slate-900 tracking-tight">新建采购单</h3><button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all"><X size={28} /></button></div>
            <div className="p-10 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">供应商</label><select value={editingPO.supplierId} onChange={e => setEditingPO({...editingPO, supplierId: e.target.value})} className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"><option value="">-- 请选择供应商 --</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div></div>
            </div>
            <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4"><button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button><button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all">保存并提交</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderManager;
