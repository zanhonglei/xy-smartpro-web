
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Home, Users, ClipboardList, BadgeDollarSign, 
  Package, Archive, Wallet, ShieldAlert, FileSignature, 
  Truck, Settings, LogOut, ChevronDown, ChevronRight,
  UserPlus, UserCheck, FileText, BookOpen, ShoppingCart
} from 'lucide-react';
import { useApp } from '../App.tsx';

interface MenuItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  children?: MenuItem[];
}

const Sidebar: React.FC = () => {
  const { t, setUser } = useApp();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set(['customer-mgmt', 'solution-mgmt']));

  const menuItems: MenuItem[] = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: t('dashboard'), path: '/dashboard' },
    { 
      id: 'customer-mgmt', 
      icon: <Users size={18} />, 
      label: t('customerMgmt'),
      children: [
        { id: 'customer-pool', icon: <UserPlus size={16} />, label: t('customerPool'), path: '/customers/pool' },
        { id: 'my-customers', icon: <UserCheck size={16} />, label: t('myCustomers'), path: '/customers/mine' },
      ]
    },
    { 
      id: 'solution-mgmt', 
      icon: <ClipboardList size={18} />, 
      label: t('solutionManagement'),
      children: [
        { id: 'designer', icon: <Home size={16} />, label: t('solutionDesign'), path: '/design/new' },
        { id: 'solutions', icon: <FileText size={16} />, label: t('mySolutions'), path: '/design/solutions' },
        { id: 'templates', icon: <BookOpen size={16} />, label: t('solutionTemplates'), path: '/design/templates' },
      ]
    },
    { 
      id: 'sales-mgmt', 
      icon: <BadgeDollarSign size={18} />, 
      label: t('salesMgmt'),
      children: [
        { id: 'quotes', icon: <FileText size={16} />, label: t('quotes'), path: '/sales/quotes' },
        { id: 'orders', icon: <ShoppingCart size={16} />, label: t('orders'), path: '/sales/orders' },
      ]
    },
    { id: 'projects', icon: <Truck size={18} />, label: t('construction'), path: '/construction' },
  ];

  const toggleExpand = (id: string) => {
    const next = new Set(expandedMenus);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedMenus(next);
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    if (item.children) {
      const isExpanded = expandedMenus.has(item.id);
      return (
        <div key={item.id} className="w-full">
          <button
            onClick={() => toggleExpand(item.id)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-slate-400 hover:text-white hover:bg-slate-800"
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
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.path!}
        className={({ isActive }) => `
          w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all
          ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
          ${isChild ? 'text-sm font-medium' : 'font-semibold'}
        `}
      >
        {item.icon}
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50 border-r border-slate-800/50">
      <div className="p-8 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center font-black shadow-lg">S</div>
        <span className="text-2xl font-black tracking-tighter">SmartPro</span>
      </div>
      
      <nav className="flex-1 mt-8 px-4 space-y-2 overflow-y-auto custom-scrollbar dark-scrollbar">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2 mb-4">
        <button onClick={() => setUser(null)} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
          <LogOut size={18} />
          <span className="font-semibold">{t('logout')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
