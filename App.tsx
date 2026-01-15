
import React, { useState, createContext, useContext, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { 
  User, Solution, Product, CategoryItem, Brand, SolutionTemplate, 
  Customer, Quote, Order, Contract, ContractTemplate, ElectronicSeal,
  ConstructionProject, PurchaseOrder, Supplier,
  AfterSalesTicket, SupplierRMA, FinanceAccount, FinanceTransaction,
  Employee, Department, Role, SystemNotification, ProjectStatus, QuoteStatus, OrderStatus,
  InventoryRecord, StockTakeSession, DeliveryNote, DesignStyle
} from './types.ts';
import { 
  MOCK_SOLUTIONS, MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_TEMPLATES,
  MOCK_CUSTOMERS, MOCK_QUOTES, MOCK_ORDERS, MOCK_CONSTRUCTION,
  MOCK_PURCHASE_ORDERS, MOCK_SUPPLIERS, MOCK_AFTER_SALES, MOCK_RMAS,
  MOCK_FINANCE_ACCOUNTS, MOCK_FINANCE_TRANSACTIONS, MOCK_EMPLOYEES,
  MOCK_DEPARTMENTS, MOCK_ROLES, MOCK_NOTIFICATIONS
} from './constants.tsx';
import { translations, Language } from './i18n.ts';

// Components
import Sidebar from './components/Sidebar.tsx';
import Dashboard from './components/Dashboard.tsx';
import FloorPlanDesigner from './components/FloorPlanDesigner.tsx';
import SolutionCenter from './components/SolutionCenter.tsx';
import TemplateManager from './components/TemplateManager.tsx';
import ProductManager from './components/ProductManager.tsx';
import CustomerManager from './components/CustomerManager.tsx';
import QuoteManager from './components/QuoteManager.tsx';
import OrderManager from './components/OrderManager.tsx';
import ConstructionManager from './components/ConstructionManager.tsx';
import ContractManager from './components/ContractManager.tsx';
import LoginPage from './components/LoginPage.tsx';
import InventoryManager from './components/InventoryManager.tsx';
import FinanceManager from './components/FinanceManager.tsx';
import AfterSalesManager from './components/AfterSalesManager.tsx';

// --- Contexts ---
interface AppContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
  user: User | null;
  setUser: (u: User | null) => void;
  data: any; // 全局数据仓库
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Exporting useApp to provide full context access
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

// Fix: Export useLanguage as an alias for useApp to satisfy components importing useLanguage
export const useLanguage = useApp;

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('zh');
  const location = useLocation();

  // 全局业务状态
  const [solutions, setSolutions] = useState(MOCK_SOLUTIONS);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const [quotes, setQuotes] = useState(MOCK_QUOTES);
  const [orders, setOrders] = useState(MOCK_ORDERS);
  const [products, setProducts] = useState(MOCK_PRODUCTS);

  const t = (key: keyof typeof translations['en']) => translations[lang][key] || key;

  const appContextValue = useMemo(() => ({
    lang, setLang, t, user, setUser,
    data: { 
      solutions, setSolutions, 
      customers, setCustomers, 
      quotes, setQuotes, 
      orders, setOrders,
      products, setProducts
    }
  }), [lang, user, solutions, customers, quotes, orders, products]);

  if (!user) return <AppContext.Provider value={appContextValue}><LoginPage onLogin={setUser} /></AppContext.Provider>;

  return (
    <AppContext.Provider value={appContextValue}>
      <div className="flex h-screen bg-slate-900 overflow-hidden font-sans">
        <Sidebar />
        <main className="flex-1 ml-64 bg-slate-50 relative overflow-hidden">
          <div key={location.pathname} className="h-full w-full overflow-y-auto custom-scrollbar page-enter-active">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard solutions={solutions} orders={orders} customers={customers} quotes={quotes} contracts={[]} onTabChange={() => {}} />} />
              
              {/* 客户管理 */}
              <Route path="/customers/pool" element={<CustomerManager type="pool" customers={customers} currentUser={user} onUpdate={setCustomers} />} />
              <Route path="/customers/mine" element={<CustomerManager type="mine" customers={customers} currentUser={user} onUpdate={setCustomers} />} />

              {/* 方案设计 */}
              <Route path="/design/new" element={<FloorPlanDesigner products={products} customers={customers} onSave={(d, r, id, v, s, c) => {}} onGenerateQuote={(d, r, c, s) => {}} />} />
              <Route path="/design/solutions" element={<SolutionCenter solutions={solutions} products={products} currentUser={user} onUpdate={setSolutions} onSaveAsTemplate={()=>{}} onEditSolution={()=>{}} onGenerateQuote={()=>{}} />} />
              <Route path="/design/templates" element={<TemplateManager templates={MOCK_TEMPLATES} products={products} onUpdate={()=>{}} />} />

              {/* 销售与财务 */}
              <Route path="/sales/quotes" element={<QuoteManager quotes={quotes} solutions={solutions} products={products} currentUser={user} onUpdate={setQuotes} onCreateOrder={()=>{}} />} />
              <Route path="/sales/orders" element={<OrderManager orders={orders} currentUser={user} onUpdate={setOrders} onConfirmPayment={()=>{}} />} />
              
              {/* 更多模块可以继续定义... */}
              <Route path="/construction" element={<ConstructionManager projects={MOCK_CONSTRUCTION} employees={MOCK_EMPLOYEES} onUpdate={()=>{}} />} />
              
              <Route path="*" element={<div className="p-20 text-center text-slate-400 font-bold">Module under construction...</div>} />
            </Routes>
          </div>
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
