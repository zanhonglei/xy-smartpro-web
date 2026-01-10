
import React, { useState } from 'react';
import { PurchaseOrder, Supplier, Product, PurchaseOrderStatus, PurchaseOrderItem } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, FileText, ChevronRight, X, Save, 
  ShoppingCart, Truck, CheckCircle2, DollarSign, Clock 
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

  const filteredOrders = purchaseOrders.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const addItem = () => {
    if (!editingPO) return;
    const newItem: PurchaseOrderItem = {
      productId: products[0].id,
      name: products[0].name,
      quantity: 1,
      cost: products[0].skus[0]?.cost || 0,
      total: products[0].skus[0]?.cost || 0
    };
    setEditingPO({ ...editingPO, items: [...(editingPO.items || []), newItem] });
  };

  const updateItem = (index: number, updates: Partial<PurchaseOrderItem>) => {
    if (!editingPO) return;
    const newItems = [...(editingPO.items || [])];
    const item = { ...newItems[index], ...updates };
    if (updates.productId) {
      const p = products.find(prod => prod.id === updates.productId);
      item.name = p?.name || '';
      item.cost = p?.skus[0]?.cost || 0;
    }
    item.total = item.quantity * item.cost;
    newItems[index] = item;
    const total = newItems.reduce((sum, i) => sum + i.total, 0);
    setEditingPO({ ...editingPO, items: newItems, totalAmount: total });
  };

  const removeItem = (index: number) => {
    if (!editingPO) return;
    const newItems = editingPO.items?.filter((_, i) => i !== index);
    const total = newItems?.reduce((sum, i) => sum + i.total, 0) || 0;
    setEditingPO({ ...editingPO, items: newItems, totalAmount: total });
  };

  const handleSave = () => {
    if (!editingPO || !editingPO.supplierId) return;
    const supplier = suppliers.find(s => s.id === editingPO.supplierId);
    const finalPO = { ...editingPO, supplierName: supplier?.name || '' } as PurchaseOrder;
    const exists = purchaseOrders.find(o => o.id === finalPO.id);
    if (exists) {
      onUpdate(purchaseOrders.map(o => o.id === finalPO.id ? finalPO : o));
    } else {
      onUpdate([...purchaseOrders, finalPO]);
    }
    setIsModalOpen(true);
    setIsModalOpen(false);
  };

  const handleReceive = (order: PurchaseOrder) => {
    onUpdate(purchaseOrders.map(o => o.id === order.id ? { ...o, status: PurchaseOrderStatus.RECEIVED, receivedAt: new Date().toISOString().split('T')[0] } : o));
    alert('采购单已入库，库存已自动更新。');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('purchaseOrder')}</h1>
            <p className="text-slate-500 font-medium">针对项目需求直接向供应商发起采购申请。</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>新建采购单</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索采购单号、供应商..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group">
              <div className="flex items-center justify-between mb-6">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <ShoppingCart size={24} />
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                   {order.status}
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <div>
                   <h3 className="text-xl font-bold text-slate-800 truncate">{order.supplierName}</h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{order.id}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">采购金额</p>
                   <p className="text-xl font-black text-blue-600">${order.totalAmount.toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
                   <Clock size={14} />
                   <span>{order.createdAt}</span>
                </div>
                {order.status === PurchaseOrderStatus.PENDING && (
                  <button 
                    onClick={() => handleReceive(order)}
                    className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                  >
                    确认收货
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && editingPO && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-4xl h-[85vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">采购申请单</h3>
               <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                  <X size={28} />
               </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">供应商</label>
                    <select 
                      value={editingPO.supplierId}
                      onChange={e => setEditingPO({ ...editingPO, supplierId: e.target.value })}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                    >
                      <option value="">-- 请选择供应商 --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">单据编号</label>
                    <input type="text" value={editingPO.id} readOnly className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 text-slate-400 font-bold" />
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <h4 className="font-bold text-slate-800 uppercase tracking-widest text-xs">物料清单</h4>
                     <button onClick={addItem} className="text-blue-600 text-xs font-bold flex items-center space-x-1 hover:underline">
                        <Plus size={14} /> <span>添加物料</span>
                     </button>
                  </div>
                  <div className="border rounded-2xl overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                           <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="px-4 py-3">物料名称</th>
                              <th className="px-4 py-3">采购单价</th>
                              <th className="px-4 py-3">数量</th>
                              <th className="px-4 py-3 text-right">小计</th>
                              <th className="px-4 py-3"></th>
                           </tr>
                        </thead>
                        <tbody className="divide-y">
                           {editingPO.items?.map((item, idx) => (
                              <tr key={idx}>
                                 <td className="px-4 py-3">
                                    <select 
                                       value={item.productId}
                                       onChange={e => updateItem(idx, { productId: e.target.value })}
                                       className="w-full bg-transparent font-bold outline-none"
                                    >
                                       {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                 </td>
                                 <td className="px-4 py-3">
                                    <input type="number" value={item.cost} onChange={e => updateItem(idx, { cost: Number(e.target.value) })} className="w-20 bg-transparent outline-none font-bold" />
                                 </td>
                                 <td className="px-4 py-3">
                                    <input type="number" value={item.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="w-16 bg-transparent outline-none font-bold" />
                                 </td>
                                 <td className="px-4 py-3 text-right font-black text-blue-600">${item.total.toLocaleString()}</td>
                                 <td className="px-4 py-3 text-right">
                                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>
            <div className="p-8 border-t bg-slate-50 flex items-center justify-between px-12">
               <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">合计金额</p>
                  <p className="text-3xl font-black text-blue-600">${editingPO.totalAmount?.toLocaleString()}</p>
               </div>
               <div className="flex space-x-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
                  <button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all">提交申请</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrderManager;
