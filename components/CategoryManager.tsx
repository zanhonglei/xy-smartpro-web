
import React, { useState } from 'react';
import { CategoryItem } from '../types';
import { getIcon } from '../constants';
import { useLanguage } from '../App';
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  MoreVertical, 
  Trash2, 
  Edit, 
  X,
  Search,
  FolderOpen
} from 'lucide-react';

interface CategoryManagerProps {
  categories: CategoryItem[];
  onUpdate: (categories: CategoryItem[]) => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState<CategoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<string | null>(null); // parentId

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpanded(next);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      onUpdate(categories.filter(c => c.id !== id && c.parentId !== id));
    }
  };

  const handleSave = (item: Partial<CategoryItem>) => {
    if (isEditing) {
      onUpdate(categories.map(c => c.id === isEditing.id ? { ...c, ...item } as CategoryItem : c));
      setIsEditing(null);
    } else if (showAddModal !== null) {
      const newItem: CategoryItem = {
        id: 'cat_' + Math.random().toString(36).substr(2, 9),
        name: item.name || 'New Category',
        parentId: showAddModal || undefined,
        iconName: item.iconName || 'Folder',
        description: item.description || ''
      };
      onUpdate([...categories, newItem]);
      setShowAddModal(null);
    }
  };

  const renderTree = (parentId: string | undefined = undefined, depth = 0) => {
    const items = categories.filter(c => c.parentId === parentId);
    
    return items.map(item => {
      const hasChildren = categories.some(c => c.parentId === item.id);
      const isExpanded = expanded.has(item.id);

      return (
        <div key={item.id} className="animate-in fade-in slide-in-from-left duration-300">
          <div 
            className={`flex items-center group py-3 px-4 rounded-xl hover:bg-slate-50 transition-all border-b border-slate-50/50 ${depth > 0 ? 'ml-6 border-l' : ''}`}
          >
            <div className="flex items-center flex-1 space-x-3">
              <button 
                onClick={() => toggleExpand(item.id)}
                className={`p-1 rounded hover:bg-slate-200 text-slate-400 ${!hasChildren && 'invisible'}`}
              >
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              
              <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-lg flex items-center justify-center text-blue-600">
                {getIcon(item.iconName)}
              </div>

              <div>
                <p className="font-bold text-slate-800">{item.name}</p>
                {item.description && <p className="text-xs text-slate-400 truncate max-w-xs">{item.description}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => setShowAddModal(item.id)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                title={t('addSubCategory')}
              >
                <Plus size={18} />
              </button>
              <button 
                onClick={() => setIsEditing(item)}
                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
              >
                <Edit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          {isExpanded && renderTree(item.id, depth + 1)}
        </div>
      );
    });
  };

  const Modal = ({ item, title, onClose }: { item?: CategoryItem, title: string, onClose: () => void }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      iconName: item?.iconName || 'Folder',
      description: item?.description || ''
    });

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in duration-200">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t('categoryName')}</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Smart Locks"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t('categoryIcon')}</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-xl custom-scrollbar">
                {['Lightbulb', 'ShieldCheck', 'Wind', 'Lock', 'Camera', 'ToggleRight', 'Lamp', 'Smartphone', 'Cpu', 'Activity', 'Wifi', 'Battery'].map(icon => (
                  <button 
                    key={icon}
                    onClick={() => setFormData({...formData, iconName: icon})}
                    className={`p-3 rounded-lg border transition-all ${formData.iconName === icon ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'}`}
                  >
                    {getIcon(icon)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">{t('categoryDesc')}</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                placeholder="Briefly describe this category..."
              />
            </div>
          </div>
          <div className="p-6 bg-slate-50 border-t flex justify-end space-x-3">
            <button onClick={onClose} className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all">{t('cancel')}</button>
            <button onClick={() => handleSave(formData)} className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">{t('save')}</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('categories')}</h2>
          <p className="text-slate-500 font-medium">{lang === 'zh' ? '构建多级产品分类体系。' : 'Build a multi-level product categorization system.'}</p>
        </div>
        <button 
          onClick={() => setShowAddModal("")} 
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>{t('addCategory')}</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-widest px-2">
            <FolderOpen size={14} />
            <span>{t('catalog')}</span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('searchProducts')} 
              className="bg-white border rounded-full pl-9 pr-4 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500 w-48 transition-all"
            />
          </div>
        </div>
        
        <div className="p-4 custom-scrollbar overflow-y-auto max-h-[calc(100vh-320px)]">
          {categories.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <FolderOpen size={40} />
              </div>
              <p className="text-slate-500 font-medium">{t('categoryEmpty')}</p>
            </div>
          ) : (
            renderTree()
          )}
        </div>
      </div>

      {showAddModal !== null && (
        <Modal 
          title={showAddModal === "" ? t('addCategory') : t('addSubCategory')} 
          onClose={() => setShowAddModal(null)} 
        />
      )}
      {isEditing && (
        <Modal 
          item={isEditing} 
          title={t('editCategory')} 
          onClose={() => setIsEditing(null)} 
        />
      )}
    </div>
  );
};

export default CategoryManager;
