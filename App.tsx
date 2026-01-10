
import React, { useState, createContext, useContext, useEffect } from 'react';
import { 
  Solution, Product, CategoryItem, Brand, SolutionTemplate, ConstructionProject, 
  Customer, Quote, Order, Supplier, PurchaseOrder, StockingOrder, AfterSalesTicket, 
  SupplierRMA, FinanceAccount, FinanceTransaction, Employee, Department, Role, 
  SystemNotification, InventoryRecord, StockTakeSession, DeliveryNote, User, 
  ElectronicSeal, ContractTemplate, Contract, ProjectStatus, OrderStatus, QuoteStatus,
  DevicePoint, Room
} from './types';
import { 
  MOCK_SOLUTIONS, MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_TEMPLATES, 
  MOCK_CONSTRUCTION, MOCK_CUSTOMERS, MOCK_QUOTES, MOCK_ORDERS, MOCK_SUPPLIERS, 
  MOCK_PURCHASE_ORDERS, MOCK_AFTER_SALES, MOCK_RMAS, MOCK_FINANCE_ACCOUNTS, 
  MOCK_FINANCE_TRANSACTIONS, MOCK_EMPLOYEES, MOCK_DEPARTMENTS, MOCK_ROLES, 
  MOCK_NOTIFICATIONS, MOCK_USER 
} from './constants';
import { Language, translations } from './i18n';
import { ChevronRight, Languages, Loader2 } from 'lucide-react';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FloorPlanDesigner from './components/FloorPlanDesigner';
import SolutionCenter from './components/SolutionCenter';
import TemplateManager from './components/TemplateManager';
import QuoteManager from './components/QuoteManager';
import OrderManager from './components/OrderManager';
import PurchaseOrderManager from './components/PurchaseOrderManager';
import StockingOrderManager from './components/StockingOrderManager';
import SupplierManager from './components/SupplierManager';
import AfterSalesManager from './components/AfterSalesManager';
import SupplierRMAManager from './components/SupplierRMAManager';
import InventoryManager from './components/InventoryManager';
import FinanceManager from './components/FinanceManager';
import EmployeeManager from './components/EmployeeManager';
import DepartmentManager from './components/DepartmentManager';
import RoleManager from './components/RoleManager';
import NotificationManager from './components/NotificationManager';
import CustomerManager from './components/CustomerManager';
import CategoryManager from './components/CategoryManager';
import ConstructionManager from './components/ConstructionManager';
import ContractManager from './components/ContractManager';
import ContractTemplateManager from './components/ContractTemplateManager';
import SealManager from './components/SealManager';
import CompanyProductLibrary from './components/CompanyProductLibrary';
import ProductManager from './components/ProductManager';
import BrandLibrary from './components/BrandLibrary';
import LoginPage from './components/LoginPage';

// Context definition
export const LanguageContext = createContext<{
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
} | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // App State
  const [lang, setLang] = useState<Language>('zh');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [solutions, setSolutions] = useState<Solution[]>(MOCK_SOLUTIONS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [templates, setTemplates] = useState<SolutionTemplate[]>(MOCK_TEMPLATES);
  const [constructionProjects, setConstructionProjects] = useState<ConstructionProject[]>(MOCK_CONSTRUCTION);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [stockingOrders, setStockingOrders] = useState<StockingOrder[]>([]);
  const [afterSalesTickets, setAfterSalesTickets] = useState<AfterSalesTicket[]>(MOCK_AFTER_SALES);
  const [supplierRMAs, setSupplierRMAs] = useState<SupplierRMA[]>(MOCK_RMAS);
  
  const [financeAccounts, setFinanceAccounts] = useState<FinanceAccount[]>(MOCK_FINANCE_ACCOUNTS);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>(MOCK_FINANCE_TRANSACTIONS);

  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [notifications, setNotifications] = useState<SystemNotification[]>(MOCK_NOTIFICATIONS);

  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);
  const [stockTakeSessions, setStockTakeSessions] = useState<StockTakeSession[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);

  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);
  const [seals, setSeals] = useState<ElectronicSeal[]>([]);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([
    {
      id: 'ct1',
      name: lang === 'zh' ? '全屋智能年度标准服务协议' : 'Smart Home Standard Service Agreement',
      content: lang === 'zh' ? `兹有甲方 {{customerName}} 就 {{solutionName}} 项目与乙方达成如下协议：\n\n一、项目概况\n总金额：{{totalPrice}} 元\n签署日期：{{date}}\n\n二、产品清单\n{{deviceList}}\n\n三、服务说明：乙方应保证所提供的智能系统符合国家安全标准。` : `Agreement between Party A {{customerName}} and Party B regarding project {{solutionName}}.\n\n1. Overview\nTotal Price: {{totalPrice}}\nDate: {{date}}\n\n2. Device List\n{{deviceList}}\n\n3. Terms: Provider shall ensure the smart system meets safety standards.`,
      placeholders: ['customerName', 'totalPrice', 'solutionName', 'deviceList', 'date']
    }
  ]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  // Simulation of persistent login
  useEffect(() => {
    const savedUser = localStorage.getItem('smartpro_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    setIsAuthenticated(true);
    localStorage.setItem('smartpro_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('smartpro_user');
  };

  const t = (key: keyof typeof translations['en']) => (translations[lang] as any)[key] || key;

  const handleSaveSolution = (devices: DevicePoint[], rooms: Room[], originalId?: string) => {
    if (!user) return;
    if (originalId) {
      setSolutions(solutions.map(s => s.id === originalId ? { ...s, devices, rooms, updatedAt: new Date().toISOString() } : s));
    } else {
      const newSolution: Solution = {
        id: 's' + Math.random().toString(36).substr(2, 9),
        name: `新方案 - ${new Date().toLocaleDateString()}`,
        customerId: 'c1',
        customerName: '张三',
        status: ProjectStatus.DRAFT,
        floorPlanUrl: 'https://picsum.photos/seed/new/800/600',
        rooms,
        devices,
        totalPrice: devices.reduce((acc, d) => acc + (products.find(p => p.id === d.productId)?.price || 0), 0),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        statusHistory: [{ status: ProjectStatus.DRAFT, timestamp: new Date().toLocaleString(), userName: user.name }]
      };
      setSolutions([...solutions, newSolution]);
    }
    setCurrentTab('solutions');
  };

  const handleGenerateQuote = (solution: Solution) => {
    const newQuote: Quote = {
      id: 'Q-' + new Date().getTime(),
      solutionId: solution.id,
      solutionName: solution.name,
      customerId: solution.customerId,
      customerName: solution.customerName,
      items: solution.devices.map(d => {
        const p = products.find(prod => prod.id === d.productId);
        return { productId: d.productId, name: p?.name || 'Unknown', price: p?.price || 0, quantity: 1, total: p?.price || 0 };
      }),
      installationFee: 1000,
      debugFee: 500,
      shippingFee: 200,
      tax: 0,
      discount: 0,
      totalAmount: solution.totalPrice + 1700,
      status: QuoteStatus.DRAFT,
      createdAt: new Date().toISOString()
    };
    setQuotes([...quotes, newQuote]);
    setCurrentTab('quotes');
  };

  const handleCreateOrder = (quote: Quote) => {
    const newOrder: Order = {
      id: 'ORD-' + new Date().getTime(),
      quoteId: quote.id,
      customerId: quote.customerId,
      customerName: quote.customerName,
      totalAmount: quote.totalAmount,
      paidAmount: 0,
      paymentStatus: 'Unpaid',
      status: OrderStatus.WAITING_PAY,
      vouchers: [],
      createdAt: new Date().toISOString()
    };
    setOrders([...orders, newOrder]);
    setCurrentTab('orders');
  };

  const handleConfirmPayment = (order: Order) => {
    setOrders(orders.map(o => o.id === order.id ? { ...o, paidAmount: o.totalAmount, paymentStatus: 'Paid', status: OrderStatus.PREPARING } : o));
  };

  const handleTabChange = (tab: string) => {
    if (tab !== 'designer') setEditingSolution(null);
    setCurrentTab(tab);
  };

  const getBreadcrumbLabel = (tab: string) => {
    switch (tab) {
      case 'designer': return t('solutionDesign');
      case 'solutions': return t('mySolutions');
      case 'templates': return t('solutionTemplates');
      case 'quotes': return t('quotes');
      case 'orders': return t('orders');
      case 'purchase-orders': return t('purchaseOrder');
      case 'stocking-orders': return t('stockingOrder');
      case 'suppliers': return t('supplierMgmt');
      case 'after-sales-tickets': return t('afterSalesTicket');
      case 'supplier-rma': return t('supplierAfterSales');
      case 'finance-projects': return t('projectFinance');
      case 'finance-daily': return t('dailyFinance');
      case 'finance-history': return t('cashFlow');
      case 'finance-balance': return t('balanceMgmt');
      case 'sys-employees': return t('employeeMgmt');
      case 'sys-departments': return t('deptMgmt');
      case 'sys-roles': return t('roleMgmt');
      case 'sys-notifications': return t('notificationMgmt');
      case 'customer-pool': return t('customerPool');
      case 'my-customers': return t('myCustomers');
      case 'dashboard': return t('dashboard');
      case 'projects': return t('construction');
      case 'seals': return t('sealMgmt');
      case 'contracts': return t('contractMgmt');
      case 'contract-templates': return t('contractTemplates');
      case 'products-company': return t('companyProductLibrary');
      case 'products-reference': return t('referenceProductLibrary');
      case 'categories': return t('categories');
      case 'brands': return t('brandLibrary');
      case 'inventory-in': return t('stockIn');
      case 'inventory-out': return t('stockOut');
      case 'inventory-take': return t('stockTake');
      case 'inventory-delivery': return t('deliveryNote');
      default: return tab;
    }
  };

  if (isInitializing) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
        <p className="font-black tracking-widest uppercase text-xs opacity-50">SmartPro Initializing</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <LanguageContext.Provider value={{ lang, setLang, t }}>
        <LoginPage onLogin={handleLogin} />
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar currentTab={currentTab} onTabChange={handleTabChange} onLogout={handleLogout} />
        
        <main className="flex-1 ml-64 flex flex-col overflow-hidden">
          <header className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0">
            <div className="flex items-center text-slate-400 text-sm">
               <span className="hover:text-slate-600 cursor-pointer">{lang === 'zh' ? '管理员' : 'Admin'}</span>
               <ChevronRight size={14} className="mx-2" />
               <span className="text-slate-800 font-medium">{getBreadcrumbLabel(currentTab)}</span>
            </div>
            <div className="flex items-center space-x-6">
              <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="flex items-center space-x-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors">
                <Languages size={16} />
                <span>{lang === 'zh' ? 'EN' : '中文'}</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800 leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-1 tracking-widest">{user.role}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-500">
                  {user.name.charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {currentTab === 'projects' && (
                <ConstructionManager 
                    projects={constructionProjects} 
                    employees={employees}
                    onUpdate={setConstructionProjects} 
                />
            )}
            {currentTab === 'dashboard' && (
              <Dashboard 
                solutions={solutions}
                orders={orders}
                customers={customers}
                quotes={quotes}
                contracts={contracts}
                onTabChange={handleTabChange}
              />
            )}
            
            {currentTab === 'quotes' && <QuoteManager quotes={quotes} solutions={solutions} products={products} currentUser={user} onUpdate={setQuotes} onCreateOrder={handleCreateOrder} />}
            {currentTab === 'orders' && <OrderManager orders={orders} currentUser={user} onUpdate={setOrders} onConfirmPayment={handleConfirmPayment} />}

            {currentTab === 'purchase-orders' && <PurchaseOrderManager purchaseOrders={purchaseOrders} suppliers={suppliers} products={products} onUpdate={setPurchaseOrders} />}
            {currentTab === 'stocking-orders' && <StockingOrderManager stockingOrders={stockingOrders} products={products} onUpdate={setStockingOrders} />}
            {currentTab === 'suppliers' && <SupplierManager suppliers={suppliers} categories={categories} onUpdate={setSuppliers} />}

            {currentTab === 'after-sales-tickets' && <AfterSalesManager tickets={afterSalesTickets} orders={orders} onUpdate={setAfterSalesTickets} />}
            {currentTab === 'supplier-rma' && <SupplierRMAManager rmas={supplierRMAs} suppliers={suppliers} products={products} tickets={afterSalesTickets} onUpdate={setSupplierRMAs} />}

            {currentTab.startsWith('inventory-') && (
              <InventoryManager 
                activeSubTab={currentTab.replace('inventory-', '') as any}
                products={products}
                records={inventoryRecords}
                sessions={stockTakeSessions}
                deliveryNotes={deliveryNotes}
                orders={orders}
                quotes={quotes}
                onUpdateProducts={setProducts}
                onUpdateRecords={setInventoryRecords}
                onUpdateSessions={setStockTakeSessions}
                onUpdateDeliveryNotes={setDeliveryNotes}
              />
            )}

            {currentTab.startsWith('finance-') && (
              <FinanceManager 
                activeSubTab={currentTab.replace('finance-', '') as any} 
                accounts={financeAccounts}
                transactions={financeTransactions}
                orders={orders}
                purchaseOrders={purchaseOrders}
                onUpdateAccounts={setFinanceAccounts}
                onUpdateTransactions={setFinanceTransactions}
              />
            )}

            {currentTab === 'sys-employees' && <EmployeeManager employees={employees} departments={departments} roles={roles} onUpdate={setEmployees} />}
            {currentTab === 'sys-departments' && <DepartmentManager departments={departments} employees={employees} onUpdate={setDepartments} />}
            {currentTab === 'sys-roles' && <RoleManager roles={roles} onUpdate={setRoles} />}
            {currentTab === 'sys-notifications' && <NotificationManager notifications={notifications} departments={departments} roles={roles} onUpdate={setNotifications} currentUser={employees[0]} />}

            {currentTab === 'customer-pool' && <CustomerManager customers={customers} onUpdate={setCustomers} currentUser={user} type="pool" />}
            {currentTab === 'my-customers' && <CustomerManager customers={customers} onUpdate={setCustomers} currentUser={user} type="mine" />}

            {currentTab === 'designer' && <div className="h-full"><FloorPlanDesigner products={products.filter(p => p.isCompanyActive)} initialSolution={editingSolution} onSave={handleSaveSolution} /></div>}
            {currentTab === 'solutions' && <SolutionCenter solutions={solutions} currentUser={user} onUpdate={setSolutions} onSaveAsTemplate={(newT) => setTemplates([...templates, newT])} onEditSolution={setEditingSolution} onGenerateQuote={handleGenerateQuote} />}
            
            {currentTab === 'templates' && <TemplateManager templates={templates} products={products} onUpdate={setTemplates} />}
            
            {currentTab === 'contracts' && <ContractManager contracts={contracts} solutions={solutions} templates={contractTemplates} seals={seals} onUpdate={setContracts} />}
            {currentTab === 'contract-templates' && <ContractTemplateManager templates={contractTemplates} onUpdate={setContractTemplates} />}
            {currentTab === 'seals' && <SealManager seals={seals} onUpdate={setSeals} />}

            {currentTab === 'products-company' && <CompanyProductLibrary products={products} categories={categories} onUpdate={setProducts} />}
            {currentTab === 'products-reference' && <ProductManager products={products} categories={categories} onUpdate={setProducts} />}
            {currentTab === 'categories' && <CategoryManager categories={categories} onUpdate={setCategories} />}
            {currentTab === 'brands' && <BrandLibrary brands={brands} onUpdate={setBrands} />}
          </div>
        </main>
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
