
import React, { useState, useMemo, useEffect } from 'react';
import { Quote, Solution, Product, QuoteStatus, User, QuoteItem } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Filter, FileText, ChevronRight, CheckCircle2, 
  Clock, X, Download, Share2, DollarSign, Calculator, 
  AlertCircle, ShieldCheck, ShoppingCart, User as UserIcon,
  LayoutGrid, List, ChevronLeft, Save, Edit3, Trash2, RefreshCcw, Send,
  Zap, Truck, Wrench, Percent, Tag, Receipt
} from 'lucide-react';

interface QuoteManagerProps {
  quotes: Quote[];
  solutions: Solution[];
  products: Product[];
  currentUser: User;
  onUpdate: (quotes: Quote[]) => void;
  onCreateOrder: (quote: Quote) => void;
  initialActiveQuoteId?: string | null;
}

const QuoteManager: React.FC<QuoteManagerProps> = ({ 
  quotes, solutions, products, currentUser, onUpdate, onCreateOrder, initialActiveQuoteId 
}) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // 视图模式记忆
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem('view_mode_quotes') as any) || 'grid'
  );

  useEffect(() => {
    localStorage.setItem('view_mode_quotes', viewMode);
  }, [viewMode]);

  // 处理从其他页面跳转过来的报价单详情
  useEffect(() => {
    if (initialActiveQuoteId) {
      const target = quotes.find(q => q.id === initialActiveQuoteId);
      if (target) {
        setActiveQuote(target);
        setIsEditing(target.status === QuoteStatus.DRAFT);
      }
    }
  }, [initialActiveQuoteId, quotes]);

  // 分页
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => 
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.solutionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [quotes, searchTerm]);

  const totalPages = Math.ceil(filteredQuotes.length / pageSize) || 1;
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuotes.slice(start, start + pageSize);
  }, [filteredQuotes, currentPage]);

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.DRAFT: return 'bg-slate-100 text-slate-600';
      case QuoteStatus.REVIEWING: return 'bg-amber-100 text-amber-700';
      case QuoteStatus.APPROVED: return 'bg-green-100 text-green-700';
      case QuoteStatus.REJECTED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  // 计算逻辑：硬件总额 + 各种服务费 + 税费 - 折扣
  const calculateTotal = (quote: Quote) => {
    const itemTotal = quote.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const serviceFees = (quote.installationFee || 0) + (quote.debugFee || 0) + (quote.shippingFee || 0);
    const tax = quote.tax || 0;
    const discount = quote.discount || 0;
    return Math.max(0, itemTotal + serviceFees + tax - discount);
  };

  const handleUpdateQuoteField = (field: keyof Quote, value: any) => {
    if (!activeQuote) return;
    const updated = { ...activeQuote, [field]: value };
    updated.totalAmount = calculateTotal(updated);
    setActiveQuote(updated);
  };

  const handleUpdateItem = (index: number, updates: Partial<QuoteItem>) => {
    if (!activeQuote) return;
    const newItems = [...activeQuote.items];
    newItems[index] = { ...newItems[index], ...updates };
    newItems[index].total = newItems[index].price * newItems[index].quantity;
    
    const updated = { ...activeQuote, items: newItems };
    updated.totalAmount = calculateTotal(updated);
    setActiveQuote(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (!activeQuote) return;
    const newItems = activeQuote.items.filter((_, i) => i !== index);
    const updated = { ...activeQuote, items: newItems };
    updated.totalAmount = calculateTotal(updated);
    setActiveQuote(updated);
  };

  const handleSaveChanges = () => {
    if (!activeQuote) return;
    onUpdate(quotes.map(q => q.id === activeQuote.id ? activeQuote : q));
    setIsEditing(false);
  };

  const handleSubmitReview = () => {
    if (!activeQuote) return;
    const updated = { ...activeQuote, status: QuoteStatus.REVIEWING };
    onUpdate(quotes.map(q => q.id === activeQuote.id ? updated : q));
    setActiveQuote(updated);
    setIsEditing(false);
  };

  const hardwareTotal = useMemo(() => {
    if (!activeQuote) return 0;
    return activeQuote.items.reduce((sum, item) => sum + item.total, 0);
  }, [activeQuote]);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('quoteList')}</h1>
            <p className="text-slate-500 font-medium">配置各项服务费用与商务折扣，生成最终项目报价。</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex bg-slate-100 p-1 rounded-xl border">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List size={20} /></button>
            </div>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索方案名称、客户姓名或报价单号..." 
            value={searchTerm} 
            onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
            className="w-full pl-12 pr-6 py-3 rounded-2xl bg-slate-100 border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedQuotes.map(quote => (
              <div key={quote.id} onClick={() => { setActiveQuote(quote); setIsEditing(false); }} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group cursor-pointer relative overflow-hidden">
                {quote.status === QuoteStatus.DRAFT && <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />}
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                    <FileText size={24} />
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(quote.status)}`}>
                    {quote.status}
                  </span>
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-bold text-slate-800 line-clamp-1">{quote.solutionName}</h3>
                  <p className="text-sm text-slate-500 font-medium flex items-center space-x-2">
                    <UserIcon size={14} className="text-slate-300" />
                    <span>{quote.customerName}</span>
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">最终报价</p>
                    <p className="text-xl font-black text-blue-600">${quote.totalAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
                    <Clock size={14} />
                    <span>{quote.createdAt.split('T')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-xs font-black text-slate-400 uppercase tracking-widest">
                   <tr>
                     <th className="px-8 py-5">报价单号</th>
                     <th className="px-8 py-5">客户 / 方案</th>
                     <th className="px-8 py-5">当前状态</th>
                     <th className="px-8 py-5">硬件总额</th>
                     <th className="px-8 py-5">最终报价</th>
                     <th className="px-8 py-5 text-right">创建日期</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {paginatedQuotes.map(q => {
                      const hardwareSum = q.items.reduce((s, i) => s + i.total, 0);
                      return (
                        <tr key={q.id} className="hover:bg-slate-50 transition-colors cursor-pointer group" onClick={() => { setActiveQuote(q); setIsEditing(false); }}>
                           <td className="px-8 py-5 font-black text-slate-400 text-xs tracking-tighter uppercase">{q.id}</td>
                           <td className="px-8 py-5">
                              <p className="font-bold text-slate-800">{q.customerName}</p>
                              <p className="text-xs text-slate-400 font-medium truncate max-w-xs">{q.solutionName}</p>
                           </td>
                           <td className="px-8 py-5">
                              <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${getStatusColor(q.status)}`}>
                                 {q.status}
                              </span>
                           </td>
                           <td className="px-8 py-5 text-slate-500 font-medium">${hardwareSum.toLocaleString()}</td>
                           <td className="px-8 py-5 font-black text-blue-600">${q.totalAmount.toLocaleString()}</td>
                           <td className="px-8 py-5 text-right text-slate-400 text-xs font-bold">{q.createdAt.split('T')[0]}</td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
          </div>
        )}

        {filteredQuotes.length === 0 && (
          <div className="py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Calculator size={48} />
            </div>
            <p className="text-slate-400 text-xl font-medium">未找到相关报价单记录</p>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border shadow-sm">
          <p className="text-sm font-bold text-slate-500">第 {currentPage} 页 / 共 {totalPages} 页</p>
          <div className="flex space-x-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="p-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="p-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-30 transition-all hover:bg-slate-200"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 报价单详情/编辑器 弹窗 */}
      {activeQuote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-7xl h-[92vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Calculator size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{isEditing ? '报价核算与调价' : '报价详情预览'}</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{activeQuote.id} · {activeQuote.status}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                 {!isEditing && activeQuote.status === QuoteStatus.DRAFT && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg">
                      <Edit3 size={18} />
                      <span>进入编辑/调价模式</span>
                    </button>
                 )}
                 {activeQuote.status === QuoteStatus.APPROVED && (
                    <button onClick={() => { onCreateOrder(activeQuote); setActiveQuote(null); }} className="flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg">
                      <ShoppingCart size={18} />
                      <span>转为正式订单</span>
                    </button>
                 )}
                 <button onClick={() => { setActiveQuote(null); setIsEditing(false); }} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                    <X size={28} />
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex">
               {/* 左侧：物料清单 */}
               <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-8 bg-white">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-black text-slate-800 flex items-center space-x-2">
                       <ShoppingCart size={20} className="text-blue-500" />
                       <span>核心硬件设备清单</span>
                    </h4>
                    <div className="flex items-center space-x-4">
                       <span className="text-xs font-bold text-slate-400">硬件小计: <span className="text-slate-800">${hardwareTotal.toLocaleString()}</span></span>
                       {isEditing && (
                          <button className="text-blue-600 text-xs font-bold hover:underline flex items-center space-x-1 bg-blue-50 px-3 py-1.5 rounded-lg transition-all">
                            <Plus size={14} /> <span>追加补货/物料</span>
                          </button>
                       )}
                    </div>
                  </div>

                  <div className="rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b">
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="px-8 py-5">产品物料</th>
                          <th className="px-8 py-5 text-right">调后单价</th>
                          <th className="px-8 py-5 text-center">数量</th>
                          <th className="px-8 py-5 text-right">小计金额</th>
                          {isEditing && <th className="px-8 py-5"></th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeQuote.items.map((item, idx) => (
                          <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5">
                              <p className="font-bold text-slate-800">{item.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.productId}</p>
                            </td>
                            <td className="px-8 py-5 text-right">
                               {isEditing ? (
                                  <div className="flex items-center justify-end space-x-1">
                                    <span className="text-slate-400 text-xs">$</span>
                                    <input 
                                      type="number" 
                                      value={item.price} 
                                      onChange={e => handleUpdateItem(idx, { price: Number(e.target.value) })}
                                      className="w-24 bg-slate-50 border-b-2 border-transparent focus:border-blue-500 outline-none text-right font-black text-slate-700 py-1 rounded px-2" 
                                    />
                                  </div>
                               ) : (
                                  <span className="font-bold text-slate-600">${item.price.toLocaleString()}</span>
                               )}
                            </td>
                            <td className="px-8 py-5 text-center">
                               {isEditing ? (
                                  <div className="flex items-center justify-center space-x-2 bg-slate-100 rounded-lg p-1 w-24 mx-auto">
                                     <button onClick={() => handleUpdateItem(idx, { quantity: Math.max(1, item.quantity - 1) })} className="p-1 hover:bg-white rounded shadow-sm text-slate-500 transition-all"><ChevronLeft size={14}/></button>
                                     <span className="flex-1 font-black text-xs text-slate-800">{item.quantity}</span>
                                     <button onClick={() => handleUpdateItem(idx, { quantity: item.quantity + 1 })} className="p-1 hover:bg-white rounded shadow-sm text-slate-500 transition-all"><Plus size={14}/></button>
                                  </div>
                               ) : (
                                  <span className="font-black text-slate-400">x{item.quantity}</span>
                               )}
                            </td>
                            <td className="px-8 py-5 text-right font-black text-slate-800">
                              ${item.total.toLocaleString()}
                            </td>
                            {isEditing && (
                              <td className="px-8 py-5 text-right">
                                <button onClick={() => handleRemoveItem(idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>

               {/* 右侧：费用汇总与调价工具 */}
               <div className="w-[440px] bg-slate-50 border-l p-10 flex flex-col space-y-8 overflow-y-auto custom-scrollbar">
                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center justify-between">
                       <span>服务费及额外支出</span>
                       <Receipt size={14} />
                    </h4>
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6">
                       {[
                         { label: '安装人工费', field: 'installationFee', icon: <Wrench size={14}/> },
                         { label: '系统调试费', field: 'debugFee', icon: <Zap size={14}/> },
                         { label: '物流运输费', field: 'shippingFee', icon: <Truck size={14}/> },
                         { label: '综合税费', field: 'tax', icon: <Receipt size={14}/> },
                       ].map(item => (
                         <div key={item.field} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-3">
                               <span className="p-2.5 bg-slate-50 text-slate-400 rounded-xl group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">{item.icon}</span>
                               <span className="text-sm font-bold text-slate-600">{item.label}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                               <span className="text-xs font-black text-slate-300">$</span>
                               {isEditing ? (
                                  <input 
                                    type="number" 
                                    value={(activeQuote as any)[item.field]} 
                                    onChange={e => handleUpdateQuoteField(item.field as any, Number(e.target.value))}
                                    className="w-24 bg-slate-50 border-b-2 border-transparent focus:border-blue-500 outline-none text-right font-black text-slate-800 py-1.5 rounded px-2" 
                                  />
                               ) : (
                                  <span className="font-black text-slate-800">{(activeQuote as any)[item.field].toLocaleString()}</span>
                               )}
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 flex items-center justify-between">
                       <span>商务折扣方案</span>
                       <Tag size={14} />
                    </h4>
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm space-y-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none rotate-12">
                          <Percent size={80} />
                       </div>
                       <div className="flex items-center justify-between group">
                          <div className="flex items-center space-x-3">
                             <span className="p-2.5 bg-red-50 text-red-400 rounded-xl transition-all"><DollarSign size={14}/></span>
                             <span className="text-sm font-bold text-slate-600">协议直接减免</span>
                          </div>
                          <div className="flex items-center space-x-1">
                             <span className="text-xs font-black text-red-400">-$</span>
                             {isEditing ? (
                                <input 
                                  type="number" 
                                  value={activeQuote.discount} 
                                  onChange={e => handleUpdateQuoteField('discount', Number(e.target.value))}
                                  className="w-24 bg-red-50/50 border-b-2 border-transparent focus:border-red-500 outline-none text-right font-black text-red-600 py-1.5 rounded px-2" 
                                  placeholder="0"
                                />
                             ) : (
                                <span className="font-black text-red-600">{activeQuote.discount.toLocaleString()}</span>
                             )}
                          </div>
                       </div>
                       {activeQuote.discount > 0 && (
                          <div className="pt-4 border-t border-dashed flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <span>折扣率分析</span>
                             <span className="text-red-500">{((activeQuote.discount / (hardwareTotal + (activeQuote.installationFee||0) + (activeQuote.debugFee||0))) * 100).toFixed(1)}% OFF</span>
                          </div>
                       )}
                    </div>
                  </div>

                  <div className="mt-auto pt-4 space-y-8">
                     <div className="p-8 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform duration-700" />
                        <div className="relative">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">应付总额 / Grand Total</p>
                           <div className="flex items-baseline space-x-2">
                              <span className="text-5xl font-black text-blue-400">${activeQuote.totalAmount.toLocaleString()}</span>
                           </div>
                           <p className="text-[10px] text-slate-500 font-medium mt-4">含：硬件、安装、调试、税费及折扣</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        {isEditing ? (
                           <>
                              <button 
                                onClick={handleSaveChanges}
                                className="flex items-center justify-center space-x-2 py-4 bg-blue-600 text-white rounded-[2rem] font-bold hover:bg-blue-700 transition-all shadow-xl"
                              >
                                <Save size={18} />
                                <span>锁定报价</span>
                              </button>
                              <button 
                                onClick={handleSubmitReview}
                                className="flex items-center justify-center space-x-2 py-4 bg-slate-100 text-slate-600 rounded-[2rem] font-bold hover:bg-slate-200 transition-all"
                              >
                                <Send size={18} />
                                <span>提交审核</span>
                              </button>
                           </>
                        ) : (
                           <>
                              <button className="flex items-center justify-center space-x-2 py-4 bg-slate-100 text-slate-800 rounded-[2rem] font-bold hover:bg-slate-200 transition-all">
                                <Download size={18} />
                                <span>导出 PDF</span>
                              </button>
                              <button className="flex items-center justify-center space-x-2 py-4 bg-blue-50 text-blue-600 rounded-[2rem] font-bold hover:bg-blue-100 transition-all">
                                <Share2 size={18} />
                                <span>客户预览</span>
                              </button>
                           </>
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

export default QuoteManager;
