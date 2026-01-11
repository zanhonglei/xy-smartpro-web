
import React, { useState, createContext, useContext, ReactNode } from 'react';
import { 
  User, Solution, Product, CategoryItem, Brand, SolutionTemplate, 
  Customer, Quote, Order, Contract, ContractTemplate, ElectronicSeal,
  ConstructionProject, PurchaseOrder, StockingOrder, Supplier,
  AfterSalesTicket, SupplierRMA, FinanceAccount, FinanceTransaction,
  Employee, Department, Role, SystemNotification, ProjectStatus, QuoteStatus, OrderStatus,
  InventoryRecord, StockTakeSession, DeliveryNote, InventoryMovementType, InventoryReason, DesignStyle
} from './types';
import { 
  MOCK_SOLUTIONS, MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_BRANDS, MOCK_TEMPLATES,
  MOCK_CUSTOMERS, MOCK_QUOTES, MOCK_ORDERS, MOCK_CONSTRUCTION,
  MOCK_PURCHASE_ORDERS, MOCK_SUPPLIERS, MOCK_AFTER_SALES, MOCK_RMAS,
  MOCK_FINANCE_ACCOUNTS, MOCK_FINANCE_TRANSACTIONS, MOCK_EMPLOYEES,
  MOCK_DEPARTMENTS, MOCK_ROLES, MOCK_NOTIFICATIONS
} from './constants';
import { translations, Language } from './i18n';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import FloorPlanDesigner from './components/FloorPlanDesigner';
import SolutionCenter from './components/SolutionCenter';
import TemplateManager from './components/TemplateManager';
import ProductManager from './components/ProductManager';
import BrandLibrary from './components/BrandLibrary';
import CategoryManager from './components/CategoryManager';
import CustomerManager from './components/CustomerManager';
import QuoteManager from './components/QuoteManager';
import OrderManager from './components/OrderManager';
import ConstructionManager from './components/ConstructionManager';
import ContractManager from './components/ContractManager';
import ContractTemplateManager from './components/ContractTemplateManager';
import SealManager from './components/SealManager';
import LoginPage from './components/LoginPage';
import CompanyProductLibrary from './components/CompanyProductLibrary';
import PurchaseOrderManager from './components/PurchaseOrderManager';
import StockingOrderManager from './components/StockingOrderManager';
import SupplierManager from './components/SupplierManager';
import InventoryManager from './components/InventoryManager';
import FinanceManager from './components/FinanceManager';
import AfterSalesManager from './components/AfterSalesManager';
import SupplierRMAManager from './components/SupplierRMAManager';
import EmployeeManager from './components/EmployeeManager';
import DepartmentManager from './components/DepartmentManager';
import RoleManager from './components/RoleManager';
import NotificationManager from './components/NotificationManager';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>('zh');
  const [currentTab, setCurrentTab] = useState('dashboard');

  const [solutions, setSolutions] = useState<Solution[]>(MOCK_SOLUTIONS);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories] = useState<CategoryItem[]>(MOCK_CATEGORIES);
  const [brands, setBrands] = useState<Brand[]>(MOCK_BRANDS);
  const [templates, setTemplates] = useState<SolutionTemplate[]>(MOCK_TEMPLATES);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([]);
  const [seals, setSeals] = useState<ElectronicSeal[]>([]);
  const [construction, setConstruction] = useState<ConstructionProject[]>(MOCK_CONSTRUCTION);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [stockingOrders, setStockingOrders] = useState<StockingOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(MOCK_SUPPLIERS);
  const [inventoryRecords, setInventoryRecords] = useState<InventoryRecord[]>([]);
  const [stockTakeSessions, setStockTakeSessions] = useState<StockTakeSession[]>([]);
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [financeAccounts, setFinanceAccounts] = useState<FinanceAccount[]>(MOCK_FINANCE_ACCOUNTS);
  const [financeTransactions, setFinanceTransactions] = useState<FinanceTransaction[]>(MOCK_FINANCE_TRANSACTIONS);
  const [afterSalesTickets, setAfterSalesTickets] = useState<AfterSalesTicket[]>(MOCK_AFTER_SALES);
  const [rmas, setRmas] = useState<SupplierRMA[]>(MOCK_RMAS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [departments, setDepartments] = useState<Department[]>(MOCK_DEPARTMENTS);
  const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
  const [notifications, setNotifications] = useState<SystemNotification[]>(MOCK_NOTIFICATIONS);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);

  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || key;
  };

  const handleGenerateQuote = (solution: Solution) => {
    const itemMap = new Map<string, any>();
    solution.devices.forEach(d => {
        const p = products.find(prod => prod.id === d.productId);
        if(!p) return;
        if(itemMap.has(d.productId)) {
            const existing = itemMap.get(d.productId);
            existing.quantity += 1;
            existing.total += p.price;
        } else {
            itemMap.set(d.productId, { productId: d.productId, name: p.name, price: p.price, quantity: 1, total: p.price });
        }
    });

    const newQuote: Quote = {
        id: 'Q-' + new Date().getTime(),
        solutionId: solution.id,
        solutionName: solution.name,
        customerId: solution.customerId,
        customerName: solution.customerName,
        items: Array.from(itemMap.values()),
        installationFee: 500,
        debugFee: 200,
        shippingFee: 50,
        tax: 0,
        discount: 0,
        totalAmount: Array.from(itemMap.values()).reduce((s, i) => s + i.total, 0) + 750,
        status: QuoteStatus.DRAFT,
        createdAt: new Date().toISOString()
    };
    setQuotes([...quotes, newQuote]);
    setCurrentTab('quotes');
  };

  const handleCreateOrder = (quote: Quote) => {
    const newOrder: Order = { id: 'ORD-' + new Date().getTime(), quoteId: quote.id, customerId: quote.customerId, customerName: quote.customerName, totalAmount: quote.totalAmount, paidAmount: 0, paymentStatus: 'Unpaid', status: OrderStatus.WAITING_PAY, vouchers: [], createdAt: new Date().toISOString() };
    setOrders([...orders, newOrder]);
    setCurrentTab('orders');
  };

  if (!user) { return (<LanguageContext.Provider value={{ lang, setLang, t }}><LoginPage onLogin={setUser} /></LanguageContext.Provider>); }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard': return <Dashboard solutions={solutions} orders={orders} customers={customers} quotes={quotes} contracts={contracts} onTabChange={setCurrentTab} />;
      
      // Customer Management
      case 'customer-pool': return <CustomerManager type="pool" customers={customers} currentUser={user} onUpdate={setCustomers} />;
      case 'my-customers': return <CustomerManager type="mine" customers={customers} currentUser={user} onUpdate={setCustomers} />;

      case 'designer':
        return (
          <FloorPlanDesigner 
            products={products} 
            initialSolution={editingSolution}
            onSave={(devices, rooms, originalId, vectorData, style) => {
              const newSolution: Solution = {
                id: originalId || 's' + Math.random().toString(36).substr(2, 9),
                name: (originalId ? solutions.find(s => s.id === originalId)?.name : 'New Design') || 'Design',
                customerId: 'c1',
                customerName: '张三',
                status: ProjectStatus.DRAFT,
                floorPlanUrl: 'https://picsum.photos/seed/plan/800/600',
                rooms,
                devices,
                totalPrice: devices.reduce((sum, d) => sum + (products.find(p => p.id === d.productId)?.price || 0), 0),
                createdAt: new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0],
                statusHistory: [{ status: ProjectStatus.DRAFT, timestamp: new Date().toLocaleString(), userName: user.name }],
                vectorData,
                designStyle: style
              };
              if (originalId) { setSolutions(solutions.map(s => s.id === originalId ? newSolution : s)); }
              else { setSolutions([newSolution, ...solutions]); }
              setEditingSolution(null);
              setCurrentTab('solutions');
            }} 
          />
        );
      case 'solutions': return <SolutionCenter solutions={solutions} products={products} currentUser={user} onUpdate={setSolutions} onSaveAsTemplate={(newT) => setTemplates([...templates, newT])} onEditSolution={(s) => { setEditingSolution(s); setCurrentTab('designer'); }} onGenerateQuote={handleGenerateQuote} />;
      case 'templates': return <TemplateManager templates={templates} products={products} onUpdate={setTemplates} />;
      case 'quotes': return <QuoteManager quotes={quotes} solutions={solutions} products={products} currentUser={user} onUpdate={setQuotes} onCreateOrder={handleCreateOrder} />;
      case 'orders': return <OrderManager orders={orders} currentUser={user} onUpdate={setOrders} onConfirmPayment={(o) => setOrders(orders.map(x => x.id === o.id ? { ...x, paymentStatus: 'Paid', paidAmount: x.totalAmount, status: OrderStatus.PREPARING } : x))} />;
      case 'purchase-orders': return <PurchaseOrderManager purchaseOrders={purchaseOrders} suppliers={suppliers} products={products} onUpdate={setPurchaseOrders} />;
      case 'stocking-orders': return <StockingOrderManager stockingOrders={stockingOrders} products={products} onUpdate={setStockingOrders} />;
      case 'suppliers': return <SupplierManager suppliers={suppliers} categories={categories} onUpdate={setSuppliers} />;
      
      // Inventory Sub-tabs
      case 'inventory-in': return <InventoryManager activeSubTab="in" products={products} records={inventoryRecords} sessions={stockTakeSessions} deliveryNotes={deliveryNotes} orders={orders} quotes={quotes} onUpdateProducts={setProducts} onUpdateRecords={setInventoryRecords} onUpdateSessions={setStockTakeSessions} onUpdateDeliveryNotes={setDeliveryNotes} />;
      case 'inventory-out': return <InventoryManager activeSubTab="out" products={products} records={inventoryRecords} sessions={stockTakeSessions} deliveryNotes={deliveryNotes} orders={orders} quotes={quotes} onUpdateProducts={setProducts} onUpdateRecords={setInventoryRecords} onUpdateSessions={setStockTakeSessions} onUpdateDeliveryNotes={setDeliveryNotes} />;
      case 'inventory-take': return <InventoryManager activeSubTab="take" products={products} records={inventoryRecords} sessions={stockTakeSessions} deliveryNotes={deliveryNotes} orders={orders} quotes={quotes} onUpdateProducts={setProducts} onUpdateRecords={setInventoryRecords} onUpdateSessions={setStockTakeSessions} onUpdateDeliveryNotes={setDeliveryNotes} />;
      case 'inventory-delivery': return <InventoryManager activeSubTab="delivery" products={products} records={inventoryRecords} sessions={stockTakeSessions} deliveryNotes={deliveryNotes} orders={orders} quotes={quotes} onUpdateProducts={setProducts} onUpdateRecords={setInventoryRecords} onUpdateSessions={setStockTakeSessions} onUpdateDeliveryNotes={setDeliveryNotes} />;
      
      // Finance Sub-tabs
      case 'finance-projects': return <FinanceManager activeSubTab="projects" accounts={financeAccounts} transactions={financeTransactions} orders={orders} purchaseOrders={purchaseOrders} onUpdateAccounts={setFinanceAccounts} onUpdateTransactions={setFinanceTransactions} />;
      case 'finance-daily': return <FinanceManager activeSubTab="daily" accounts={financeAccounts} transactions={financeTransactions} orders={orders} purchaseOrders={purchaseOrders} onUpdateAccounts={setFinanceAccounts} onUpdateTransactions={setFinanceTransactions} />;
      case 'finance-history': return <FinanceManager activeSubTab="history" accounts={financeAccounts} transactions={financeTransactions} orders={orders} purchaseOrders={purchaseOrders} onUpdateAccounts={setFinanceAccounts} onUpdateTransactions={setFinanceTransactions} />;
      case 'finance-balance': return <FinanceManager activeSubTab="balance" accounts={financeAccounts} transactions={financeTransactions} orders={orders} purchaseOrders={purchaseOrders} onUpdateAccounts={setFinanceAccounts} onUpdateTransactions={setFinanceTransactions} />;
      
      // After-sales
      case 'after-sales-tickets': return <AfterSalesManager tickets={afterSalesTickets} orders={orders} onUpdate={setAfterSalesTickets} />;
      case 'supplier-rma': return <SupplierRMAManager rmas={rmas} suppliers={suppliers} products={products} tickets={afterSalesTickets} onUpdate={setRmas} />;

      // Product Management
      case 'products-company': return <CompanyProductLibrary products={products} categories={categories} onUpdate={setProducts} />;
      case 'products-reference': return <ProductManager products={products} categories={categories} onUpdate={setProducts} />;
      case 'brands': return <BrandLibrary brands={brands} onUpdate={setBrands} />;
      case 'categories': return <CategoryManager categories={categories} onUpdate={setCategories} />;
      
      // E-Contract
      case 'contracts': return <ContractManager contracts={contracts} solutions={solutions} templates={contractTemplates} seals={seals} onUpdate={setContracts} />;
      case 'contract-templates': return <ContractTemplateManager templates={contractTemplates} onUpdate={setContractTemplates} />;
      case 'seals': return <SealManager seals={seals} onUpdate={setSeals} />;

      case 'projects': return <ConstructionManager projects={construction} employees={employees} onUpdate={setConstruction} />;
      
      // System Management
      case 'sys-employees': return <EmployeeManager employees={employees} departments={departments} roles={roles} onUpdate={setEmployees} />;
      case 'sys-departments': return <DepartmentManager departments={departments} employees={employees} onUpdate={setDepartments} />;
      case 'sys-roles': return <RoleManager roles={roles} onUpdate={setRoles} />;
      case 'sys-notifications': return <NotificationManager notifications={notifications} departments={departments} roles={roles} currentUser={employees[0]} onUpdate={setNotifications} />;

      default: return <Dashboard solutions={solutions} orders={orders} customers={customers} quotes={quotes} contracts={contracts} onTabChange={setCurrentTab} />;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="flex h-screen bg-slate-900 overflow-hidden font-sans">
        <Sidebar currentTab={currentTab} onTabChange={setCurrentTab} onLogout={() => setUser(null)} />
        <main className="flex-1 ml-64 bg-slate-50 relative overflow-hidden">
          <div className="h-full w-full overflow-y-auto custom-scrollbar">{renderContent()}</div>
        </main>
      </div>
    </LanguageContext.Provider>
  );
};

export default App;
