
import React, { useState } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Package, 
  FileText, 
  Truck, 
  Settings, 
  LogOut,
  Layers,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Database,
  Briefcase,
  Award,
  ClipboardList,
  FileSignature,
  Shield,
  PenTool,
  Users,
  UserCheck,
  UserPlus,
  BadgeDollarSign,
  ShoppingCart,
  Truck as ProcurementIcon,
  Factory,
  Warehouse,
  ShieldAlert,
  Wrench,
  Undo2
} from 'lucide-react';
import { useLanguage } from '../App';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onLogout }) => {
  const { t } = useLanguage();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['solution-mgmt', 'product-mgmt', 'e-contract', 'customer-mgmt', 'sales-mgmt', 'procurement-mgmt', 'after-sales-mgmt']));

  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: t('dashboard') },
    { 
      id: 'customer-mgmt', 
      icon: <Users size={18} />, 
      label: t('customerMgmt'),
      children: [
        { id: 'customer-pool', icon: <UserPlus size={16} />, label: t('customerPool') },
        { id: 'my-customers', icon: <UserCheck size={16} />, label: t('myCustomers') },
      ]
    },
    { 
      id: 'solution-mgmt', 
      icon: <ClipboardList size={18} />, 
      label: t('solutionManagement'),
      children: [
        { id: 'designer', icon: <Home size={16} />, label: t('solutionDesign') },
        { id: 'solutions', icon: <FileText size={16} />, label: t('mySolutions') },
        { id: 'templates', icon: <BookOpen size={16} />, label: t('solutionTemplates') },
      ]
    },
    { 
      id: 'sales-mgmt', 
      icon: <BadgeDollarSign size={18} />, 
      label: t('salesMgmt'),
      children: [
        { id: 'quotes', icon: <FileText size={16} />, label: t('quotes') },
        { id: 'orders', icon: <ShoppingCart size={16} />, label: t('orders') },
      ]
    },
    { 
      id: 'procurement-mgmt', 
      icon: <ProcurementIcon size={18} />, 
      label: t('procurementMgmt'),
      children: [
        { id: 'purchase-orders', icon: <FileText size={16} />, label: t('purchaseOrder') },
        { id: 'stocking-orders', icon: <Warehouse size={16} />, label: t('stockingOrder') },
        { id: 'suppliers', icon: <Factory size={16} />, label: t('supplierMgmt') },
      ]
    },
    { 
      id: 'after-sales-mgmt', 
      icon: <ShieldAlert size={18} />, 
      label: t('afterSalesMgmt'),
      children: [
        { id: 'after-sales-tickets', icon: <Wrench size={16} />, label: t('afterSalesTicket') },
        { id: 'supplier-rma', icon: <Undo2 size={16} />, label: t('supplierAfterSales') },
      ]
    },
    { 
      id: 'product-mgmt', 
      icon: <Package size={18} />, 
      label: t('productManagement'),
      children: [
        { id: 'products-company', icon: <Briefcase size={16} />, label: t('companyProductLibrary') },
        { id: 'products-reference', icon: <Database size={16} />, label: t('referenceProductLibrary') },
        { id: 'brands', icon: <Award size={16} />, label: t('brandLibrary') },
        { id: 'categories', icon: <Layers size={16} />, label: t('categories') },
      ]
    },
    { 
      id: 'e-contract', 
      icon: <FileSignature size={18} />, 
      label: t('eContract'),
      children: [
        { id: 'contracts', icon: <FileText size={16} />, label: t('contractMgmt') },
        { id: 'contract-templates', icon: <BookOpen size={16} />, label: t('contractTemplates') },
        { id: 'seals', icon: <Shield size={16} />, label: t('sealMgmt') },
      ]
    },
    { id: 'projects', icon: <Truck size={18} />, label: t('construction') },
  ];

  const toggleExpand = (id: string) => {
    const next = new Set(expandedMenus);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedMenus(next);
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const isExpanded = expandedMenus.has(item.id);
    const isActive = currentTab === item.id || (item.children?.some(c => c.id === currentTab));

    return (
      <div key={item.id} className="w-full">
        {item.children ? (
          <div>
            <button
              onClick={() => toggleExpand(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-semibold">{item.label}</span>
              </div>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div className={`mt-1 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="ml-4 pl-4 border-l border-slate-800/50 space-y-1 py-1">
                {item.children.map(child => renderMenuItem(child, true))}
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
              currentTab === item.id 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
            } ${isChild ? 'text-sm' : ''}`}
          >
            {item.icon}
            <span className={isChild ? 'font-medium' : 'font-semibold'}>{item.label}</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800/50">
      <div className="p-8 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">S</div>
        <span className="text-2xl font-black tracking-tighter">SmartPro</span>
      </div>
      
      <nav className="flex-1 mt-8 px-4 space-y-2 overflow-y-auto custom-scrollbar dark-scrollbar">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2 mb-4">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
          <Settings size={18} />
          <span className="font-semibold">{t('settings')}</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <LogOut size={18} />
          <span className="font-semibold">{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
