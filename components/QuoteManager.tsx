
import React, { useState, useMemo } from 'react';
import { Quote, Solution, Product, QuoteStatus, User, QuoteItem } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Filter, FileText, ChevronRight, CheckCircle2, 
  Clock, X, Download, Share2, DollarSign, Calculator, 
  AlertCircle, ShieldCheck, ShoppingCart, User as UserIcon
} from 'lucide-react';

interface QuoteManagerProps {
  quotes: Quote[];
  solutions: Solution[];
  products: Product[];
  currentUser: User;
  onUpdate: (quotes: Quote[]) => void;
  onCreateOrder: (quote: Quote) => void;
}

const QuoteManager: React.FC<QuoteManagerProps> = ({ quotes, solutions, products, currentUser, onUpdate, onCreateOrder }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeQuote, setActiveQuote] = useState<Quote | null>(null);

  const filteredQuotes = quotes.filter(q => 
    q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    q.solutionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.DRAFT: return 'bg-slate-100 text-slate-600';
      case QuoteStatus.REVIEWING: return 'bg-amber-100 text-amber-700';
      case QuoteStatus.APPROVED: return 'bg-green-100 text-green-700';
      case QuoteStatus.REJECTED: return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const calculateQuoteTotal = (quote: Quote) => {
    const itemTotal = quote.items.reduce((sum, item) => sum + item.total, 0);
    return itemTotal + quote.installationFee + quote.debugFee + quote.shippingFee + quote.tax - quote.discount;
  };

  const handleUpdateQuoteField = (field: keyof Quote, value: any) => {
    if (!activeQuote) return;
    const updated = { ...activeQuote, [field]: value };
    updated.totalAmount = calculateQuoteTotal(updated);
    setActiveQuote(updated);
  };

  const handleSaveQuote = () => {
    if (!activeQuote) return;
    const updatedQuotes = quotes.map(q => q.id === activeQuote.id ? activeQuote : q);
    onUpdate(updatedQuotes);
    alert(lang === 'zh' ? '报价单已更新' : 'Quote updated');
  };

  const handleSubmitForReview = () => {
    if (!activeQuote) return;
    handleUpdateQuoteField('status', QuoteStatus.REVIEWING);
    setTimeout(() => handleSaveQuote(), 100);
  };

  const handleApprove = () => {
    if (!activeQuote) return;
    handleUpdateQuoteField('status', QuoteStatus.APPROVED);
    setTimeout(() => handleSaveQuote(), 100);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('quoteList')}</h1>
            <p className="text-slate-500 font-medium">{lang === 'zh' ? '核算项目成本，生成正式报价。' : 'Calculate project costs and generate formal quotes.'}</p>
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
          {filteredQuotes.map(quote => (
            <div 
              key={quote.id}
              onClick={() => setActiveQuote(quote)}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-6">
                <div className={`p-3 rounded-2xl bg-blue-50 text-blue-600`}>
                  <FileText size={24} />
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(quote.status)}`}>
                   {t(quote.status.toLowerCase() as any)}
                </span>
              </div>
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-slate-800">{quote.solutionName}</h3>
                <p className="text-sm text-slate-500 font-medium">{quote.customerName} · {quote.id}</p>
              </div>
              <div className="mt-8 pt-6 border-t flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '总计金额' : 'Total Amount'}</p>
                   <p className="text-xl font-black text-blue-600">${quote.totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold">
                   <Clock size={14} />
                   <span>{quote.createdAt.split('T')[0]}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredQuotes.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed rounded-[3rem] space-y-4 bg-white/50">
               <Calculator size={48} className="mx-auto text-slate-200" />
               <p className="text-slate-400 font-medium">{lang === 'zh' ? '暂无报价记录，请从方案中心生成。' : 'No quotes yet. Generate one from Solution Center.'}</p>
            </div>
          )}
        </div>
      </div>

      {activeQuote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Calculator size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{activeQuote.solutionName} - {lang === 'zh' ? '报价明细' : 'Quote Details'}</h3>
                  <p className="text-xs text-slate-500 font-bold">{activeQuote.id} · {activeQuote.status}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                 {activeQuote.status === QuoteStatus.APPROVED && (
                    <button 
                      onClick={() => { onCreateOrder(activeQuote); setActiveQuote(null); }}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-md"
                    >
                      <ShoppingCart size={18} />
                      <span>{t('createOrder')}</span>
                    </button>
                 )}
                 {activeQuote.status === QuoteStatus.DRAFT && (
                    <button 
                      onClick={handleSubmitForReview}
                      className="flex items-center space-x-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-md"
                    >
                      <ShieldCheck size={18} />
                      <span>{lang === 'zh' ? '提交审核' : 'Submit Review'}</span>
                    </button>
                 )}
                 {(currentUser.role === 'admin' || currentUser.role === 'finance') && activeQuote.status === QuoteStatus.REVIEWING && (
                    <div className="flex space-x-2">
                       <button onClick={handleApprove} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700">{t('approved')}</button>
                       <button onClick={() => handleUpdateQuoteField('status', QuoteStatus.REJECTED)} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">{t('rejected')}</button>
                    </div>
                 )}
                 <button onClick={handleSaveQuote} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Download size={24} />
                 </button>
                 <button onClick={() => setActiveQuote(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                    <X size={28} />
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar grid grid-cols-12 gap-10">
               {/* Left: Item List */}
               <div className="col-span-8 space-y-8">
                  <div className="bg-white rounded-3xl border overflow-hidden">
                     <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b">
                           <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="px-6 py-4">{lang === 'zh' ? '产品名称' : 'Product'}</th>
                              <th className="px-6 py-4">{lang === 'zh' ? '单价' : 'Unit Price'}</th>
                              <th className="px-6 py-4 text-center">{t('quantity')}</th>
                              <th className="px-6 py-4 text-right">{lang === 'zh' ? '小计' : 'Subtotal'}</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y">
                           {activeQuote.items.map((item, idx) => (
                              <tr key={idx} className="text-sm">
                                 <td className="px-6 py-4 font-bold text-slate-700">{item.name}</td>
                                 <td className="px-6 py-4 text-slate-500">${item.price}</td>
                                 <td className="px-6 py-4 text-center font-medium">{item.quantity}</td>
                                 <td className="px-6 py-4 text-right font-black text-slate-800">${item.total.toLocaleString()}</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100 flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                           <UserIcon size={24} />
                        </div>
                        <div>
                           <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{t('customer')}</p>
                           <p className="text-lg font-black text-blue-900">{activeQuote.customerName}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{lang === 'zh' ? '关联方案' : 'Linked Solution'}</p>
                        <p className="text-lg font-black text-blue-900">{activeQuote.solutionName}</p>
                     </div>
                  </div>
               </div>

               {/* Right: Price Calculation */}
               <div className="col-span-4 bg-slate-50 rounded-[3rem] p-10 border space-y-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '费用核算' : 'Pricing Logic'}</h4>
                  
                  <div className="space-y-6">
                     {[
                        { label: t('installationFee'), field: 'installationFee' },
                        { label: t('debugFee'), field: 'debugFee' },
                        { label: t('shippingFee'), field: 'shippingFee' },
                        { label: t('tax'), field: 'tax' },
                        { label: t('discount'), field: 'discount', isDiscount: true },
                     ].map(item => (
                        <div key={item.field} className="flex items-center justify-between group">
                           <span className="text-sm font-bold text-slate-500">{item.label}</span>
                           <div className="relative">
                              <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input 
                                 type="number" 
                                 value={(activeQuote as any)[item.field]}
                                 onChange={e => handleUpdateQuoteField(item.field as any, Number(e.target.value))}
                                 disabled={activeQuote.status !== QuoteStatus.DRAFT}
                                 className={`w-32 pl-8 pr-4 py-2 rounded-xl border-2 transition-all font-bold text-right outline-none ${
                                    activeQuote.status === QuoteStatus.DRAFT ? 'bg-white border-slate-100 focus:border-blue-500' : 'bg-transparent border-transparent'
                                 } ${item.isDiscount ? 'text-red-500' : 'text-slate-800'}`}
                              />
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="pt-8 border-t space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '应付总额' : 'Grand Total'}</span>
                        <span className="text-3xl font-black text-blue-600">${activeQuote.totalAmount.toLocaleString()}</span>
                     </div>
                     <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3">
                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                        <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                           {lang === 'zh' ? '注意：报价单一旦通过财务审核将无法修改，请仔细核对各项物料清单及服务费用。' : 'Note: Approved quotes cannot be modified. Please double check items and fees.'}
                        </p>
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
