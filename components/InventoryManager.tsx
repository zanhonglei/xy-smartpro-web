
import React, { useState, useMemo } from 'react';
import { 
  Product, InventoryRecord, InventoryMovementType, InventoryReason, 
  StockTakeSession, StockTakeItem, DeliveryNote, Order, Quote 
} from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, ArrowDownToLine, ArrowUpFromLine, 
  ClipboardCheck, PackageCheck, X, Save, Box, 
  Truck, Layout, MoreHorizontal, CheckCircle2, 
  AlertCircle, History, Package, DollarSign,
  User, Calendar, FileText
} from 'lucide-react';

interface InventoryManagerProps {
  activeSubTab: 'in' | 'out' | 'take' | 'delivery';
  products: Product[];
  records: InventoryRecord[];
  sessions: StockTakeSession[];
  deliveryNotes: DeliveryNote[];
  orders: Order[];
  quotes: Quote[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateRecords: (records: InventoryRecord[]) => void;
  onUpdateSessions: (sessions: StockTakeSession[]) => void;
  onUpdateDeliveryNotes: (notes: DeliveryNote[]) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({
  activeSubTab, products, records, sessions, deliveryNotes, orders, quotes,
  onUpdateProducts, onUpdateRecords, onUpdateSessions, onUpdateDeliveryNotes
}) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<InventoryRecord> | null>(null);
  const [activeSession, setActiveSession] = useState<StockTakeSession | null>(null);
  const [newDeliveryNote, setNewDeliveryNote] = useState<Partial<DeliveryNote> | null>(null);

  // Helper to update stock quantities
  const adjustStock = (productId: string, skuId: string | undefined, delta: number) => {
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        const updatedSkus = p.skus.map(s => {
          if (s.id === skuId || (!skuId && p.skus.length === 1)) {
            return { ...s, stock: s.stock + delta };
          }
          return s;
        });
        const totalStock = updatedSkus.reduce((sum, s) => sum + s.stock, 0);
        return { ...p, skus: updatedSkus, stock: totalStock };
      }
      return p;
    });
    onUpdateProducts(updatedProducts);
  };

  const handleCreateRecord = () => {
    const isInput = activeSubTab === 'in';
    setNewRecord({
      id: 'INV-' + new Date().getTime(),
      type: isInput ? InventoryMovementType.IN : InventoryMovementType.OUT,
      reason: isInput ? InventoryReason.PROCUREMENT : InventoryReason.SALE,
      productId: products[0]?.id || '',
      skuId: products[0]?.skus[0]?.id || '',
      quantity: 1,
      operator: '管理员',
      timestamp: new Date().toLocaleString()
    });
    setIsModalOpen(true);
  };

  const saveRecord = () => {
    if (!newRecord || !newRecord.productId || !newRecord.quantity) return;
    const prod = products.find(p => p.id === newRecord.productId);
    const sku = prod?.skus.find(s => s.id === newRecord.skuId);
    
    const finalRecord = {
      ...newRecord,
      productName: prod?.name || '',
      skuName: sku?.name || ''
    } as InventoryRecord;

    onUpdateRecords([...records, finalRecord]);
    const delta = finalRecord.type === InventoryMovementType.IN ? finalRecord.quantity : -finalRecord.quantity;
    adjustStock(finalRecord.productId, finalRecord.skuId, delta);
    setIsModalOpen(false);
    setNewRecord(null);
  };

  const startStockTake = () => {
    const sessionItems: StockTakeItem[] = [];
    products.forEach(p => {
      p.skus.forEach(s => {
        sessionItems.push({
          productId: p.id,
          skuId: s.id,
          productName: p.name,
          skuName: s.name,
          systemQty: s.stock,
          actualQty: s.stock,
          diff: 0
        });
      });
    });

    const session: StockTakeSession = {
      id: 'ST-' + new Date().getTime(),
      title: `${new Date().toLocaleDateString()} 常规库存盘点`,
      items: sessionItems,
      status: 'Draft',
      operator: '管理员',
      createdAt: new Date().toLocaleString()
    };
    setActiveSession(session);
  };

  const completeStockTake = () => {
    if (!activeSession) return;
    
    // Generate adjustment records
    const adjustments: InventoryRecord[] = activeSession.items
      .filter(item => item.diff !== 0)
      .map(item => ({
        id: 'INV-ADJ-' + Math.random().toString(36).substr(2, 5),
        type: item.diff > 0 ? InventoryMovementType.IN : InventoryMovementType.OUT,
        reason: InventoryReason.ADJUSTMENT,
        productId: item.productId,
        productName: item.productName,
        skuId: item.skuId,
        skuName: item.skuName,
        quantity: Math.abs(item.diff),
        operator: activeSession.operator,
        timestamp: new Date().toLocaleString(),
        notes: `盘点调整 (Session: ${activeSession.id})`
      }));

    onUpdateRecords([...records, ...adjustments]);
    
    // Update product stock
    let updatedProducts = [...products];
    activeSession.items.forEach(item => {
      if (item.diff !== 0) {
        updatedProducts = updatedProducts.map(p => {
          if (p.id === item.productId) {
            const updatedSkus = p.skus.map(s => s.id === item.skuId ? { ...s, stock: item.actualQty } : s);
            return { ...p, skus: updatedSkus, stock: updatedSkus.reduce((sum, s) => sum + s.stock, 0) };
          }
          return p;
        });
      }
    });
    
    onUpdateProducts(updatedProducts);
    onUpdateSessions([...sessions, { ...activeSession, status: 'Completed', completedAt: new Date().toLocaleString() }]);
    setActiveSession(null);
    alert('盘点已完成，系统库存已同步。');
  };

  const createDeliveryNote = () => {
    setNewDeliveryNote({
      id: 'DN-' + new Date().getTime(),
      orderId: '',
      items: [],
      status: 'Pending',
      operator: '仓管员',
      createdAt: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSelectOrderForDelivery = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    const quote = quotes.find(q => q.id === order?.quoteId);
    if (!order || !quote) return;

    const deliveryItems = quote.items.map(item => ({
      productId: item.productId,
      skuId: '', // Ideally link to first SKU if multiple
      name: item.name,
      quantity: item.quantity
    }));

    setNewDeliveryNote({
      ...newDeliveryNote,
      orderId,
      customerName: order.customerName,
      address: '客户档案默认地址',
      items: deliveryItems
    });
  };

  const saveDeliveryNote = () => {
    if (!newDeliveryNote || !newDeliveryNote.orderId) return;
    onUpdateDeliveryNotes([...deliveryNotes, newDeliveryNote as DeliveryNote]);
    setIsModalOpen(false);
    setNewDeliveryNote(null);
  };

  const handleShipDelivery = (note: DeliveryNote) => {
    // Inventory Out for all items
    const newRecords: InventoryRecord[] = note.items.map(item => ({
      id: 'INV-DEL-' + Math.random().toString(36).substr(2, 5),
      type: InventoryMovementType.OUT,
      reason: InventoryReason.PROJECT_DELIVERY,
      productId: item.productId,
      productName: item.name,
      skuId: item.skuId,
      skuName: 'Default',
      quantity: item.quantity,
      operator: '管理员',
      timestamp: new Date().toLocaleString(),
      linkedId: note.orderId
    }));

    onUpdateRecords([...records, ...newRecords]);
    
    // Deduct stock
    note.items.forEach(item => adjustStock(item.productId, item.skuId, -item.quantity));

    onUpdateDeliveryNotes(deliveryNotes.map(dn => dn.id === note.id ? { ...dn, status: 'Shipped', shippedAt: new Date().toLocaleString() } : dn));
    alert('出货单已发出，相关库存已扣除。');
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeSubTab === 'in' ? t('stockIn') : 
               activeSubTab === 'out' ? t('stockOut') :
               activeSubTab === 'take' ? t('stockTake') : t('deliveryNote')}
            </h1>
            <p className="text-slate-500 font-medium">
              {activeSubTab === 'in' ? '记录产品入库，增加现有库存。' : 
               activeSubTab === 'out' ? '手动记录产品出库或报损。' :
               activeSubTab === 'take' ? '校准仓库实物与系统数据。' : '根据项目订单安排发货清单。'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
             {activeSubTab === 'take' && !activeSession && (
               <button 
                onClick={startStockTake}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all"
               >
                 <ClipboardCheck size={20} />
                 <span>发起盘点</span>
               </button>
             )}
             {activeSubTab === 'delivery' && (
               <button 
                onClick={createDeliveryNote}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all"
               >
                 <Plus size={20} />
                 <span>创建出货单</span>
               </button>
             )}
             {(activeSubTab === 'in' || activeSubTab === 'out') && (
               <button 
                onClick={handleCreateRecord}
                className={`flex items-center space-x-2 px-6 py-3 text-white rounded-2xl font-bold shadow-xl transition-all ${activeSubTab === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-500 hover:bg-red-600'}`}
               >
                 {activeSubTab === 'in' ? <ArrowDownToLine size={20} /> : <ArrowUpFromLine size={20} />}
                 <span>{activeSubTab === 'in' ? '新增入库' : '新增出库'}</span>
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Stock Take UI */}
        {activeSubTab === 'take' && activeSession && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <div className="bg-slate-900 text-white rounded-[2.5rem] p-10 shadow-2xl flex items-center justify-between">
                <div>
                   <h2 className="text-2xl font-black mb-2">{activeSession.title}</h2>
                   <p className="opacity-60 text-sm font-bold uppercase tracking-widest">Operator: {activeSession.operator} · Status: In Progress</p>
                </div>
                <div className="flex space-x-3">
                   <button onClick={() => setActiveSession(null)} className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all text-sm">取消盘点</button>
                   <button onClick={completeStockTake} className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold transition-all text-sm">完成并同步</button>
                </div>
             </div>

             <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <th className="px-8 py-5">产品/规格</th>
                         <th className="px-8 py-5 text-center">系统库存</th>
                         <th className="px-8 py-5 text-center">实盘库存</th>
                         <th className="px-8 py-5 text-right">盈亏详情</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y">
                      {activeSession.items.map((item, idx) => (
                         <tr key={`${item.productId}-${item.skuId}`} className="hover:bg-slate-50 transition-colors">
                            <td className="px-8 py-5">
                               <p className="font-bold text-slate-800">{item.productName}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{item.skuName}</p>
                            </td>
                            <td className="px-8 py-5 text-center font-black text-slate-400">{item.systemQty}</td>
                            <td className="px-8 py-5 text-center">
                               <input 
                                 type="number" 
                                 value={item.actualQty}
                                 onChange={e => {
                                    const nextItems = [...activeSession.items];
                                    const val = Number(e.target.value);
                                    nextItems[idx].actualQty = val;
                                    nextItems[idx].diff = val - item.systemQty;
                                    setActiveSession({...activeSession, items: nextItems});
                                 }}
                                 className="w-24 px-4 py-2 bg-slate-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500 font-black text-center"
                               />
                            </td>
                            <td className="px-8 py-5 text-right">
                               <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${item.diff === 0 ? 'bg-slate-50 text-slate-400' : item.diff > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                  {item.diff === 0 ? 'Match' : item.diff > 0 ? `+${item.diff} Gain` : `${item.diff} Loss`}
                               </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {/* Regular Records List (In/Out) */}
        {(activeSubTab === 'in' || activeSubTab === 'out') && (
           <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b">
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       <th className="px-8 py-5">时间</th>
                       <th className="px-8 py-5">类型/事由</th>
                       <th className="px-8 py-5">产品物料</th>
                       <th className="px-8 py-5 text-right">变动数量</th>
                       <th className="px-8 py-5">经办人</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y">
                    {records.filter(r => r.type === (activeSubTab === 'in' ? InventoryMovementType.IN : InventoryMovementType.OUT)).slice().reverse().map(record => (
                       <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-8 py-5 text-xs text-slate-400 font-bold">{record.timestamp}</td>
                          <td className="px-8 py-5">
                             <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${record.type === InventoryMovementType.IN ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <span className="font-bold text-slate-700">{record.reason}</span>
                             </div>
                          </td>
                          <td className="px-8 py-5">
                             <p className="text-sm font-bold text-slate-800">{record.productName}</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">{record.skuName}</p>
                          </td>
                          <td className={`px-8 py-5 text-right font-black ${record.type === InventoryMovementType.IN ? 'text-emerald-600' : 'text-red-500'}`}>
                             {record.type === InventoryMovementType.IN ? '+' : '-'}{record.quantity}
                          </td>
                          <td className="px-8 py-5 text-sm font-bold text-slate-500">{record.operator}</td>
                       </tr>
                    ))}
                    {records.filter(r => r.type === (activeSubTab === 'in' ? InventoryMovementType.IN : InventoryMovementType.OUT)).length === 0 && (
                       <tr>
                          <td colSpan={5} className="py-32 text-center">
                             <Package size={48} className="mx-auto text-slate-100 mb-4" />
                             <p className="text-slate-400 font-medium">暂无出入库流水记录</p>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        )}

        {/* Delivery Notes List */}
        {activeSubTab === 'delivery' && (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {deliveryNotes.map(note => (
                 <div key={note.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col group relative">
                    <div className="flex items-center justify-between mb-8">
                       <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                          <Truck size={28} />
                       </div>
                       <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${note.status === 'Shipped' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {note.status}
                       </span>
                    </div>

                    <div className="space-y-4 mb-8">
                       <div>
                          <h3 className="text-2xl font-black text-slate-900">{note.customerName}</h3>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{note.id}</p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">发货清单简报</p>
                          <div className="space-y-1">
                             {note.items.slice(0, 2).map((it, i) => (
                                <p key={i} className="text-sm font-bold text-slate-600 flex justify-between">
                                   <span>{it.name}</span>
                                   <span className="text-slate-400">x{it.quantity}</span>
                                </p>
                             ))}
                             {note.items.length > 2 && <p className="text-xs text-blue-500 font-black italic">...+{note.items.length - 2} Items More</p>}
                          </div>
                       </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                       <div className="flex items-center space-x-2 text-slate-400">
                          <Calendar size={14} />
                          <span className="text-xs font-bold">{note.createdAt}</span>
                       </div>
                       {note.status === 'Pending' && (
                         <button 
                           onClick={() => handleShipDelivery(note)}
                           className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all"
                         >
                            确认发货
                         </button>
                       )}
                    </div>
                 </div>
              ))}
              {deliveryNotes.length === 0 && (
                <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] space-y-4">
                   <PackageCheck size={48} className="mx-auto text-slate-200" />
                   <p className="text-slate-400 font-medium">暂无待处理的项目出货单</p>
                </div>
              )}
           </div>
        )}
      </div>

      {/* Modal for Records & Delivery Notes */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border">
              {newRecord && (
                <>
                  <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">{activeSubTab === 'in' ? '产品入库单' : '产品出库单'}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                       <X size={28} />
                    </button>
                  </div>
                  <div className="p-10 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">选择事由</label>
                        <select 
                          value={newRecord.reason}
                          onChange={e => setNewRecord({...newRecord, reason: e.target.value as InventoryReason})}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 font-bold"
                        >
                           {activeSubTab === 'in' ? (
                             <>
                                <option value={InventoryReason.PROCUREMENT}>采购入库</option>
                                <option value={InventoryReason.RETURN}>客户退货</option>
                                <option value={InventoryReason.ADJUSTMENT}>盘盈入库</option>
                             </>
                           ) : (
                             <>
                                <option value={InventoryReason.SALE}>零售出库</option>
                                <option value={InventoryReason.SCRAP}>报损出库</option>
                                <option value={InventoryReason.ADJUSTMENT}>盘亏核减</option>
                             </>
                           )}
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">选择产品</label>
                        <select 
                          value={newRecord.productId}
                          onChange={e => {
                             const p = products.find(prod => prod.id === e.target.value);
                             setNewRecord({...newRecord, productId: e.target.value, skuId: p?.skus[0]?.id || ''});
                          }}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 font-bold"
                        >
                           {products.map(p => <option key={p.id} value={p.id}>{p.brand} - {p.name}</option>)}
                        </select>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">规格</label>
                           <select 
                             value={newRecord.skuId}
                             onChange={e => setNewRecord({...newRecord, skuId: e.target.value})}
                             className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold"
                           >
                              {products.find(p => p.id === newRecord.productId)?.skus.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">变动数量</label>
                           <input 
                             type="number" 
                             value={newRecord.quantity}
                             onChange={e => setNewRecord({...newRecord, quantity: Number(e.target.value)})}
                             className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold text-center outline-none focus:ring-2 focus:ring-blue-500"
                           />
                        </div>
                     </div>
                  </div>
                  <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
                     <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
                     <button onClick={saveRecord} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all">保存流水</button>
                  </div>
                </>
              )}

              {newDeliveryNote && (
                <>
                  <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">拟定出货单</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                       <X size={28} />
                    </button>
                  </div>
                  <div className="p-10 space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">关联生效订单</label>
                        <select 
                          value={newDeliveryNote.orderId}
                          onChange={e => handleSelectOrderForDelivery(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 font-bold outline-none"
                        >
                           <option value="">-- 请选择关联订单 --</option>
                           {orders.map(o => <option key={o.id} value={o.id}>{o.customerName} ({o.id})</option>)}
                        </select>
                     </div>
                     
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">项目配货清单</label>
                        <div className="border rounded-2xl max-h-48 overflow-y-auto custom-scrollbar">
                           <table className="w-full text-left text-sm">
                              <tbody className="divide-y">
                                 {newDeliveryNote.items?.map((it, i) => (
                                    <tr key={i}>
                                       <td className="px-4 py-2 font-bold text-slate-700">{it.name}</td>
                                       <td className="px-4 py-2 text-right font-black text-blue-600">x{it.quantity}</td>
                                    </tr>
                                 ))}
                                 {(!newDeliveryNote.items || newDeliveryNote.items.length === 0) && (
                                    <tr><td className="px-4 py-8 text-center text-slate-400 italic">请选择订单以加载物料清单</td></tr>
                                 )}
                              </tbody>
                           </table>
                        </div>
                     </div>
                  </div>
                  <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
                     <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
                     <button onClick={saveDeliveryNote} disabled={!newDeliveryNote.orderId} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all disabled:opacity-50">创建单据</button>
                  </div>
                </>
              )}
           </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
