
import React, { useState, createContext, useContext } from 'react';
import Sidebar from './components/Sidebar';
import FloorPlanDesigner from './components/FloorPlanDesigner';
import CategoryManager from './components/CategoryManager';
import ConstructionManager from './components/ConstructionManager';
import TemplateManager from './components/TemplateManager';
import SolutionCenter from './components/SolutionCenter';
import ProductManager from './components/ProductManager';
import CompanyProductLibrary from './components/CompanyProductLibrary';
import BrandLibrary from './components/BrandLibrary';
import SealManager from './components/SealManager';
import ContractManager from './components/ContractManager';
import ContractTemplateManager from './components/ContractTemplateManager';
import CustomerManager from './components/CustomerManager';
import QuoteManager from './components/QuoteManager';
import OrderManager from './components/OrderManager';
import Dashboard from './components/Dashboard';
import { 
  MOCK_PRODUCTS, 
  MOCK_SOLUTIONS, 
  MOCK_USER, 
  MOCK_CATEGORIES,
  MOCK_CONSTRUCTION,
  MOCK_TEMPLATES,
  MOCK_BRANDS,
  MOCK_CUSTOMERS,
  MOCK_QUOTES,
  MOCK_ORDERS
} from './constants';
import { 
  Solution, 
  Product, 
  ProjectStatus, 
  User, 
  CategoryItem,
  DevicePoint,
  ConstructionProject,
  ConstructionPhaseStatus,
  SolutionTemplate,
  Room,
  Brand,
  ElectronicSeal,
  ContractTemplate,
  Contract,
  Customer,
  Quote,
  Order,
  QuoteStatus,
  OrderStatus,
  CustomerStatus
} from './types';
import { 
  ChevronRight, 
  Languages,
} from 'lucide-react';
import { translations, Language } from './i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

const App: React.FC = () => {
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
  const [user] = useState<User>(MOCK_USER);
  const [editingSolution, setEditingSolution] = useState<Solution | null>(null);

  // States for Electronic Contract
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

  const t = (key: keyof typeof translations['en']) => translations[lang][key] || key;

  const handleSaveSolution = (newDevices: DevicePoint[], finalRooms: Room[], originalId?: string) => {
    if (originalId) {
      const updated = solutions.map(s => {
        if (s.id === originalId) {
          return {
            ...s,
            devices: newDevices,
            rooms: finalRooms,
            totalPrice: newDevices.reduce((sum, d) => sum + (products.find(p => p.id === d.productId)?.price || 0), 0),
            updatedAt: new Date().toISOString().split('T')[0]
          };
        }
        return s;
      });
      setSolutions(updated);
      alert(lang === 'zh' ? '方案已更新！' : 'Solution updated!');
    } else {
      const newSolution: Solution = {
        id: 's' + (solutions.length + 1),
        name: `New Solution ${solutions.length + 1}`,
        customerId: 'cx',
        customerName: 'Guest User',
        status: ProjectStatus.DRAFT,
        floorPlanUrl: 'https://picsum.photos/seed/new/800/600',
        rooms: finalRooms,
        devices: newDevices,
        totalPrice: newDevices.reduce((sum, d) => sum + (products.find(p => p.id === d.productId)?.price || 0), 0),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        statusHistory: [{
          status: ProjectStatus.DRAFT,
          timestamp: new Date().toLocaleString(),
          userName: user.name
        }],
        area: finalRooms.reduce((acc, r) => acc + r.area, 0),
        type: 'Full House'
      };
      setSolutions([...solutions, newSolution]);
      alert(lang === 'zh' ? `方案已保存至方案中心！` : `Solution saved to Solution Center!`);
    }
    setEditingSolution(null);
    setCurrentTab('solutions');
  };

  const handleGenerateQuote = (solution: Solution) => {
    const quoteItems = solution.devices.map(d => {
       const p = products.find(prod => prod.id === d.productId);
       return {
          productId: d.productId,
          name: p?.name || 'Unknown Device',
          price: p?.price || 0,
          quantity: 1,
          total: p?.price || 0
       };
    });

    const mergedItemsMap: Record<string, any> = {};
    quoteItems.forEach(item => {
       if (mergedItemsMap[item.productId]) {
          mergedItemsMap[item.productId].quantity += 1;
          mergedItemsMap[item.productId].total += item.price;
       } else {
          mergedItemsMap[item.productId] = { ...item };
       }
    });

    const newQuote: Quote = {
       id: 'Q-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
       solutionId: solution.id,
       solutionName: solution.name,
       customerId: solution.customerId,
       customerName: solution.customerName,
       items: Object.values(mergedItemsMap),
       installationFee: 500,
       debugFee: 200,
       shippingFee: 50,
       tax: 0,
       discount: 0,
       totalAmount: solution.totalPrice + 750,
       status: QuoteStatus.DRAFT,
       createdAt: new Date().toISOString()
    };
    setQuotes([...quotes, newQuote]);
    setCurrentTab('quotes');
    alert(lang === 'zh' ? '报价单已生成！' : 'Quote generated!');
  };

  const handleCreateOrder = (quote: Quote) => {
     const newOrder: Order = {
        id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
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
     alert(lang === 'zh' ? '订单已创建，请确认款项。' : 'Order created, awaiting payment.');
  };

  const handleConfirmPayment = (order: Order) => {
     const updatedOrders = orders.map(o => {
        if (o.id === order.id) {
           return { 
              ...o, 
              paidAmount: o.totalAmount, 
              paymentStatus: 'Paid' as const, 
              status: OrderStatus.PREPARING 
           };
        }
        return o;
     });
     setOrders(updatedOrders);

     setCustomers(customers.map(c => c.id === order.customerId ? { ...c, status: CustomerStatus.CONTRACTED } : c));

     const solution = solutions.find(s => s.customerId === order.customerId);
     if (solution) {
        const newConstruction: ConstructionProject = {
           id: 'CP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
           solutionId: solution.id,
           orderId: order.id,
           solutionName: solution.name,
           customerName: solution.customerName,
           phases: MOCK_CONSTRUCTION[0].phases.map(ph => ({ ...ph, id: Math.random().toString(36).substr(2, 5), status: ConstructionPhaseStatus.PENDING, progress: 0, logs: [] }))
        };
        setConstructionProjects([...constructionProjects, newConstruction]);
     }

     alert(lang === 'zh' ? '款项确认成功，已自动同步至施工模块。' : 'Payment confirmed, synced to construction.');
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
      default: return tab;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      <div className="flex h-screen bg-slate-50 overflow-hidden">
        <Sidebar currentTab={currentTab} onTabChange={handleTabChange} onLogout={() => alert('Logged out')} />
        
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

            {currentTab === 'customer-pool' && <CustomerManager customers={customers} onUpdate={setCustomers} currentUser={user} type="pool" />}
            {currentTab === 'my-customers' && <CustomerManager customers={customers} onUpdate={setCustomers} currentUser={user} type="mine" />}

            {currentTab === 'designer' && <div className="h-full"><FloorPlanDesigner products={products.filter(p => p.isCompanyActive)} initialSolution={editingSolution} onSave={handleSaveSolution} /></div>}
            {currentTab === 'solutions' && <SolutionCenter solutions={solutions} currentUser={user} onUpdate={setSolutions} onSaveAsTemplate={(newT) => setTemplates([...templates, newT])} onEditSolution={setEditingSolution} onGenerateQuote={handleGenerateQuote} />}
            {currentTab === 'projects' && <ConstructionManager projects={constructionProjects} onUpdate={setConstructionProjects} />}
            
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
