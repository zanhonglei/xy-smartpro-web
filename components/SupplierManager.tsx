
import React, { useState } from 'react';
import { Supplier, CategoryItem } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Edit2, Trash2, X, Save, Factory, 
  Phone, Mail, MapPin, Star, MoreVertical 
} from 'lucide-react';

interface SupplierManagerProps {
  suppliers: Supplier[];
  categories: CategoryItem[];
  onUpdate: (suppliers: Supplier[]) => void;
}

const SupplierManager: React.FC<SupplierManagerProps> = ({ suppliers, categories, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier> | null>(null);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier({ ...supplier });
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSupplier({
      id: 'sup' + Math.random().toString(36).substr(2, 9),
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      categories: [],
      rating: 5,
      createdAt: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingSupplier?.name) return;
    const exists = suppliers.find(s => s.id === editingSupplier.id);
    if (exists) {
      onUpdate(suppliers.map(s => s.id === editingSupplier.id ? editingSupplier as Supplier : s));
    } else {
      onUpdate([...suppliers, editingSupplier as Supplier]);
    }
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      onUpdate(suppliers.filter(s => s.id !== id));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('supplierMgmt')}</h1>
            <p className="text-slate-500 font-medium">维护核心供应链资源，优化采购成本。</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>新增供应商</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索供应商名称、联系人..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shadow-inner">
                  <Factory size={28} />
                </div>
                <div className="flex items-center space-x-1 text-amber-500">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm font-black">{supplier.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">{supplier.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{supplier.contactPerson}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-slate-400">
                    <Phone size={14} />
                    <span className="text-xs font-bold text-slate-600">{supplier.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400">
                    <Mail size={14} />
                    <span className="text-xs font-bold text-slate-600 truncate">{supplier.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-400">
                    <MapPin size={14} />
                    <span className="text-xs font-bold text-slate-600 truncate">{supplier.address}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-4">
                  {supplier.categories.map(catId => {
                    const cat = categories.find(c => c.id === catId);
                    return cat ? (
                      <span key={catId} className="px-2 py-1 bg-slate-50 text-slate-400 rounded text-[9px] font-bold uppercase tracking-widest border border-slate-100">
                        {cat.name}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(supplier)}
                  className="text-blue-600 text-sm font-bold flex items-center hover:underline"
                >
                  <Edit2 size={14} className="mr-1" /> 编辑信息
                </button>
                <button 
                  onClick={() => handleDelete(supplier.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && editingSupplier && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingSupplier.id ? '编辑供应商' : '新增供应商'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                <X size={28} />
              </button>
            </div>
            <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">供应商全称</label>
                <input 
                  type="text" 
                  value={editingSupplier.name || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, name: e.target.value })}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">联系人</label>
                  <input 
                    type="text" 
                    value={editingSupplier.contactPerson || ''}
                    onChange={e => setEditingSupplier({ ...editingSupplier, contactPerson: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">联系电话</label>
                  <input 
                    type="text" 
                    value={editingSupplier.phone || ''}
                    onChange={e => setEditingSupplier({ ...editingSupplier, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">联系邮箱</label>
                <input 
                  type="email" 
                  value={editingSupplier.email || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">详细地址</label>
                <input 
                  type="text" 
                  value={editingSupplier.address || ''}
                  onChange={e => setEditingSupplier({ ...editingSupplier, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">供应品类</label>
                <div className="flex flex-wrap gap-2">
                  {categories.filter(c => !c.parentId).map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        const next = editingSupplier.categories || [];
                        if (next.includes(cat.id)) {
                          setEditingSupplier({ ...editingSupplier, categories: next.filter(i => i !== cat.id) });
                        } else {
                          setEditingSupplier({ ...editingSupplier, categories: [...next, cat.id] });
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                        editingSupplier.categories?.includes(cat.id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-slate-50 border-transparent text-slate-400'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
              <button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManager;
