
import React, { useState, useMemo, useEffect } from 'react';
import { Quote, Solution, Product, QuoteStatus, User, QuoteItem } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Filter, FileText, ChevronRight, CheckCircle2, 
  Clock, X, Download, Share2, DollarSign, Calculator, 
  AlertCircle, ShieldCheck, ShoppingCart, User as UserIcon,
  LayoutGrid, List, ChevronLeft
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
  
  // Persistent view mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem('view_mode_quotes') as any) || 'grid'
  );

  useEffect(() => {
    localStorage.setItem('view_mode_quotes', viewMode);
  }, [viewMode]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => 
      q.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.solutionName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleUpdateQuoteField = (field: keyof Quote, value: any) => {
    if (!activeQuote) return;
    const updated = { ...activeQuote, [field]: value };
    const itemTotal = updated.items.reduce((sum, item) => sum + item.total, 0);
    updated.totalAmount = itemTotal + updated.installationFee + updated.debugFee + updated.shippingFee + updated.tax - updated.discount;
    setActiveQuote(updated);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('quoteList')}</h1>
            <p className="text-slate-500 font-medium">核算项目成本，生成正式报价。</p>
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border">
            <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List size={20} /></button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder={t('searchSolution')} value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full pl-12 pr-6 py-3 rounded-2xl bg-slate-100 border-none outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedQuotes.map(quote => (
              <div key={quote.id} onClick={() => setActiveQuote(quote)} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group cursor-pointer">
                <div className="flex items-center justify-between mb-6"><div className="p-3 rounded-2xl bg-blue-50 text-blue-600"><FileText size={24} /></div><span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${getStatusColor(quote.status)}`}>{t(quote.status.toLowerCase() as any)}</span></div>
                <div className="flex-1 space-y-2"><h3 className="text-xl font-bold text-slate-800">{quote.solutionName}</h3><p className="text-sm text-slate-500 font-medium">{quote.customerName} · {quote.id}</p></div>
                <div className="mt-8 pt-6 border-t flex items-center justify-between"><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">总计金额</p><p className="text-xl font-black text-blue-600">${quote.totalAmount.toLocaleString()}</p></div><div className="flex items-center space-x-2 text-slate-400 text-xs font-bold"><Clock size={14} /><span>{quote.createdAt.split('T')[0]}</span></div></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-xs font-black text-slate-400 uppercase">
                   <tr><th className="px-6 py-4">客户姓名</th><th className="px-6 py-4">方案名称</th><th className="px-6 py-4">状态</th><th className="px-6 py-4">总额</th><th className="px-6 py-4 text-right">创建日期</th></tr>
                </thead>
                <tbody className="divide-y">
                   {paginatedQuotes.map(q => (
                      <tr key={q.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setActiveQuote(q)}>
                         <td className="px-6 py-4 font-bold text-slate-800">{q.customerName}</td>
                         <td className="px-6 py-4 text-slate-600 font-medium">{q.solutionName}</td>
                         <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase ${getStatusColor(q.status)}`}>{q.status}</span></td>
                         <td className="px-6 py-4 font-black text-blue-600">${q.totalAmount.toLocaleString()}</td>
                         <td className="px-6 py-4 text-right text-slate-400 text-xs font-bold">{q.createdAt.split('T')[0]}</td>
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

      {activeQuote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4"><div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Calculator size={20} /></div><div><h3 className="text-xl font-black text-slate-900">{activeQuote.solutionName} - 报价明细</h3><p className="text-xs text-slate-500 font-bold">{activeQuote.id} · {activeQuote.status}</p></div></div>
              <div className="flex items-center space-x-3">
                 {activeQuote.status === QuoteStatus.APPROVED && <button onClick={() => { onCreateOrder(activeQuote); setActiveQuote(null); }} className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 shadow-md"><ShoppingCart size={18} /><span>{t('createOrder')}</span></button>}
                 <button onClick={() => setActiveQuote(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all"><X size={28} /></button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar grid grid-cols-12 gap-10">
               <div className="col-span-8 space-y-8">
                  <div className="bg-white rounded-3xl border overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-6 py-4">产品名称</th><th className="px-6 py-4">单价</th><th className="px-6 py-4 text-center">{t('quantity')}</th><th className="px-6 py-4 text-right">小计</th></tr></thead><tbody className="divide-y">{activeQuote.items.map((item, idx) => (<tr key={idx} className="text-sm"><td className="px-6 py-4 font-bold text-slate-700">{item.name}</td><td className="px-6 py-4 text-slate-500">${item.price}</td><td className="px-6 py-4 text-center font-medium">{item.quantity}</td><td className="px-6 py-4 text-right font-black text-slate-800">${item.total.toLocaleString()}</td></tr>))}</tbody></table></div>
               </div>
               <div className="col-span-4 bg-slate-50 rounded-[3rem] p-10 border space-y-8">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">费用核算</h4>
                  <div className="space-y-6">{[{ label: t('installationFee'), field: 'installationFee' }, { label: t('debugFee'), field: 'debugFee' }, { label: t('tax'), field: 'tax' }].map(item => (<div key={item.field} className="flex items-center justify-between group"><span className="text-sm font-bold text-slate-500">{item.label}</span><div className="relative"><DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="number" value={(activeQuote as any)[item.field]} readOnly className="w-32 pl-8 pr-4 py-2 rounded-xl bg-transparent border-transparent font-bold text-right outline-none text-slate-800" /></div></div>))}</div>
                  <div className="pt-8 border-t space-y-4"><div className="flex items-center justify-between"><span className="text-sm font-black text-slate-400 uppercase tracking-widest">应付总额</span><span className="text-3xl font-black text-blue-600">${activeQuote.totalAmount.toLocaleString()}</span></div></div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteManager;
