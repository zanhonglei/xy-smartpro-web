
import React, { useState, useMemo } from 'react';
import { 
  FinanceAccount, FinanceTransaction, TransactionType, TransactionCategory, 
  Order, PurchaseOrder, ProjectFinanceSummary 
} from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Wallet, ChevronRight, X, Save, 
  ArrowUpRight, ArrowDownRight, PieChart, Landmark, 
  Receipt, FileText, Filter, DollarSign, Calendar, 
  Briefcase, TrendingUp, AlertCircle, Trash2, Camera,
  CheckCircle2
} from 'lucide-react';

interface FinanceManagerProps {
  activeSubTab: 'projects' | 'daily' | 'history' | 'balance';
  accounts: FinanceAccount[];
  transactions: FinanceTransaction[];
  orders: Order[];
  purchaseOrders: PurchaseOrder[];
  onUpdateAccounts: (accounts: FinanceAccount[]) => void;
  onUpdateTransactions: (transactions: FinanceTransaction[]) => void;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ 
  activeSubTab, accounts, transactions, orders, purchaseOrders, 
  onUpdateAccounts, onUpdateTransactions 
}) => {
  const { t, lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTransaction, setNewTransaction] = useState<Partial<FinanceTransaction> | null>(null);

  // Derived: Project Finance Summaries
  const projectSummaries: ProjectFinanceSummary[] = useMemo(() => {
    const map = new Map<string, ProjectFinanceSummary>();
    
    orders.forEach(o => {
      const summary = map.get(o.customerId) || {
        projectId: o.customerId,
        projectName: o.customerName + '项目',
        customerName: o.customerName,
        totalIncome: 0,
        totalExpense: 0,
        grossProfit: 0,
        profitMargin: 0
      };
      summary.totalIncome += o.paidAmount;
      map.set(o.customerId, summary);
    });

    purchaseOrders.forEach(po => {
      if (po.linkedOrderId) {
         // This is a simplified link for the demo
         const order = orders.find(o => o.id === po.linkedOrderId);
         if (order) {
            const summary = map.get(order.customerId)!;
            summary.totalExpense += po.totalAmount;
         }
      }
    });

    return Array.from(map.values()).map(s => ({
      ...s,
      grossProfit: s.totalIncome - s.totalExpense,
      profitMargin: s.totalIncome > 0 ? ((s.totalIncome - s.totalExpense) / s.totalIncome) * 100 : 0
    }));
  }, [orders, purchaseOrders]);

  const handleCreateDaily = () => {
    setNewTransaction({
      id: 'TR-' + new Date().getTime(),
      type: TransactionType.EXPENSE,
      category: TransactionCategory.OTHER,
      accountId: accounts[0]?.id || '',
      accountName: accounts[0]?.name || '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      operator: '管理员'
    });
    setIsModalOpen(true);
  };

  const handleSaveTransaction = () => {
    if (!newTransaction || !newTransaction.amount) return;
    const account = accounts.find(a => a.id === newTransaction.accountId);
    const finalTx = { ...newTransaction, accountName: account?.name || '' } as FinanceTransaction;
    
    // Update transactions
    onUpdateTransactions([...transactions, finalTx]);
    
    // Update account balance
    const updatedAccounts = accounts.map(a => {
      if (a.id === finalTx.accountId) {
        const change = finalTx.type === TransactionType.INCOME ? finalTx.amount : -finalTx.amount;
        return { ...a, balance: a.balance + change };
      }
      return a;
    });
    onUpdateAccounts(updatedAccounts);
    
    setIsModalOpen(false);
    setNewTransaction(null);
  };

  const filteredTransactions = transactions.filter(tr => 
    tr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tr.accountName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {activeSubTab === 'projects' ? t('projectFinance') : 
               activeSubTab === 'daily' ? t('dailyFinance') :
               activeSubTab === 'history' ? t('cashFlow') : t('balanceMgmt')}
            </h1>
            <p className="text-slate-500 font-medium">
               {activeSubTab === 'projects' ? '核心业务盈利分析' : 
                activeSubTab === 'daily' ? '记录公司日常运营支出' :
                activeSubTab === 'history' ? '全渠道资金变动记录' : '管理公司银行及支付账户'}
            </p>
          </div>
          {activeSubTab === 'daily' && (
            <button 
              onClick={handleCreateDaily}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
            >
              <Plus size={20} />
              <span>新增收支</span>
            </button>
          )}
        </div>
        {(activeSubTab === 'history' || activeSubTab === 'daily') && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索描述、账户、单据号..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {activeSubTab === 'projects' && (
          <div className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projectSummaries.map(summary => (
                   <div key={summary.projectId} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col group hover:shadow-2xl transition-all">
                      <div className="flex items-center justify-between mb-6">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                           <Briefcase size={24} />
                        </div>
                        <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${summary.profitMargin > 30 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                           {summary.profitMargin.toFixed(1)}% Margin
                        </span>
                      </div>
                      <div className="flex-1 space-y-4">
                         <div>
                            <h3 className="text-xl font-bold text-slate-800">{summary.projectName}</h3>
                            <p className="text-sm text-slate-400 font-bold">{summary.customerName}</p>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">累计回款</p>
                               <p className="text-sm font-black text-slate-700">${summary.totalIncome.toLocaleString()}</p>
                            </div>
                            <div className="space-y-1 text-right">
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">累计支出</p>
                               <p className="text-sm font-black text-slate-700">${summary.totalExpense.toLocaleString()}</p>
                            </div>
                         </div>
                         <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-400 uppercase">毛利润</p>
                            <p className="text-xl font-black text-blue-600">${summary.grossProfit.toLocaleString()}</p>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

        {activeSubTab === 'daily' && (
          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b">
                   <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-6 py-4">日期</th>
                      <th className="px-6 py-4">类别</th>
                      <th className="px-6 py-4">描述</th>
                      <th className="px-6 py-4">账户</th>
                      <th className="px-6 py-4 text-right">金额</th>
                      <th className="px-6 py-4 text-center">状态</th>
                   </tr>
                </thead>
                <tbody className="divide-y">
                   {transactions.filter(t => t.category !== TransactionCategory.PROJECT_PAYMENT).map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4 text-sm font-bold text-slate-500">{tx.date}</td>
                         <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 uppercase">{tx.category}</span>
                         </td>
                         <td className="px-6 py-4 text-sm font-bold text-slate-700">{tx.description}</td>
                         <td className="px-6 py-4 text-xs font-bold text-slate-500">{tx.accountName}</td>
                         <td className={`px-6 py-4 text-right font-black ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-500'}`}>
                            {/* Fixed potential parser issue with dollar sign by wrapping it */}
                            {tx.type === TransactionType.INCOME ? '+' : '-'}{"$"}{tx.amount.toLocaleString()}
                         </td>
                         <td className="px-6 py-4 text-center">
                            {/* Fixed missing icon import error */}
                            <CheckCircle2 size={16} className="text-green-500 mx-auto" />
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeSubTab === 'history' && (
          <div className="space-y-4">
             <div className="bg-white rounded-3xl p-6 border shadow-sm flex items-center justify-between mb-8">
                <div className="flex items-center space-x-12">
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">累计入账</p>
                      {/* Fixed potential parser issue by wrapping dollar sign */}
                      <p className="text-2xl font-black text-green-600">{"$"}{transactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
                   </div>
                   <div className="w-px h-10 bg-slate-100" />
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">累计支出</p>
                      {/* Fixed potential parser issue by wrapping dollar sign */}
                      <p className="text-2xl font-black text-red-500">{"$"}{transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0).toLocaleString()}</p>
                   </div>
                </div>
                <div className="flex space-x-2">
                   <button className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-all"><Calendar size={20} /></button>
                   <button className="p-2 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition-all"><Filter size={20} /></button>
                </div>
             </div>
             
             <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b">
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <th className="px-6 py-4">流水编号</th>
                         <th className="px-6 py-4">类型</th>
                         <th className="px-6 py-4">账户</th>
                         <th className="px-6 py-4">说明</th>
                         <th className="px-6 py-4 text-right">变动金额</th>
                         <th className="px-6 py-4">时间</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y">
                      {filteredTransactions.slice().reverse().map(tx => (
                         <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-tighter">{tx.id}</td>
                            <td className="px-6 py-4">
                               <div className="flex items-center space-x-2">
                                  {tx.type === TransactionType.INCOME ? <ArrowUpRight size={14} className="text-green-500" /> : <ArrowDownRight size={14} className="text-red-500" />}
                                  <span className="text-xs font-bold text-slate-600">{tx.type}</span>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-slate-500">{tx.accountName}</td>
                            <td className="px-6 py-4 text-sm font-bold text-slate-700">{tx.description}</td>
                            <td className={`px-6 py-4 text-right font-black ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-500'}`}>
                               {/* Fixed potential parser issue by wrapping dollar sign */}
                               {tx.type === TransactionType.INCOME ? '+' : '-'}{"$"}{tx.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-400 font-medium">{tx.date}</td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}

        {activeSubTab === 'balance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
             {accounts.map(acc => (
                <div key={acc.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 group hover:shadow-2xl transition-all flex flex-col relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
                   <div className="relative">
                      <div className="flex items-center justify-between mb-8">
                         <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
                            <Landmark size={24} />
                         </div>
                         <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest">{acc.type}</span>
                      </div>
                      <div className="space-y-1 mb-8">
                         <h3 className="text-xl font-black text-slate-800">{acc.name}</h3>
                         <p className="text-xs text-slate-400 font-bold">{acc.accountNumber || 'E-Wallet Account'}</p>
                      </div>
                      <div className="pt-6 border-t border-slate-50">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">可用余额</p>
                         {/* Fixed potential parser issue by wrapping dollar sign */}
                         <p className="text-3xl font-black text-blue-600">{"$"}{acc.balance.toLocaleString()}</p>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        )}
      </div>

      {isModalOpen && newTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border">
              <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                 <h3 className="text-2xl font-black text-slate-900 tracking-tight">新增财务收支</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                    <X size={28} />
                 </button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">收支类型</label>
                       <select 
                        value={newTransaction.type}
                        onChange={e => setNewTransaction({...newTransaction, type: e.target.value as TransactionType})}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 font-bold outline-none"
                       >
                          <option value={TransactionType.EXPENSE}>支出</option>
                          <option value={TransactionType.INCOME}>收入</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">类别</label>
                       <select 
                        value={newTransaction.category}
                        onChange={e => setNewTransaction({...newTransaction, category: e.target.value as TransactionCategory})}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 font-bold outline-none"
                       >
                          <option value={TransactionCategory.MARKETING}>市场推广</option>
                          <option value={TransactionCategory.SALARY}>员工工资</option>
                          <option value={TransactionCategory.RENT}>办公室房租</option>
                          <option value={TransactionCategory.UTILITIES}>水电通讯</option>
                          <option value={TransactionCategory.OTHER}>其他支出</option>
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">结算账户</label>
                    <select 
                      value={newTransaction.accountId}
                      onChange={e => setNewTransaction({...newTransaction, accountId: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 font-bold outline-none"
                    >
                       {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">交易描述</label>
                    <input 
                      type="text" 
                      value={newTransaction.description}
                      onChange={e => setNewTransaction({...newTransaction, description: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                      placeholder="例如：10月份网络推广费用"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">交易金额</label>
                    <div className="relative">
                       <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                       <input 
                        type="number" 
                        value={newTransaction.amount || ''}
                        onChange={e => setNewTransaction({...newTransaction, amount: Number(e.target.value)})}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-black text-2xl text-blue-600"
                        placeholder="0.00"
                       />
                    </div>
                 </div>
                 <div className="pt-4 flex items-center space-x-2 text-slate-400">
                    <button className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"><Camera size={20} /></button>
                    <span className="text-[10px] font-black uppercase tracking-widest">上传费用凭证</span>
                 </div>
              </div>
              <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
                 <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500 hover:text-slate-800 transition-all">{t('cancel')}</button>
                 <button onClick={handleSaveTransaction} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all">确认记账</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FinanceManager;
