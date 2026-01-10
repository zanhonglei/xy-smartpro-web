
import React, { useState } from 'react';
import { Brand } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Globe, 
  Image as ImageIcon,
  ExternalLink,
  Award,
  MoreVertical,
  LayoutGrid
} from 'lucide-react';

interface BrandLibraryProps {
  brands: Brand[];
  onUpdate: (brands: Brand[]) => void;
}

const BrandLibrary: React.FC<BrandLibraryProps> = ({ brands, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const filteredBrands = brands.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingBrand({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      logo: 'https://picsum.photos/seed/brand/100/100',
      description: '',
      website: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand({ ...brand });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      onUpdate(brands.filter(b => b.id !== id));
    }
  };

  const handleSave = () => {
    if (!editingBrand || !editingBrand.name) return;
    const exists = brands.find(b => b.id === editingBrand.id);
    if (exists) {
      onUpdate(brands.map(b => b.id === editingBrand.id ? editingBrand : b));
    } else {
      onUpdate([...brands, editingBrand]);
    }
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('brandLibrary')}</h1>
            <p className="text-slate-500 font-medium">{lang === 'zh' ? '管理及收录行业内的合作品牌及其信息。' : 'Manage your partner brands and manufacturer profiles.'}</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>{t('newBrand')}</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={lang === 'zh' ? '搜索品牌名称或简介...' : 'Search brand names or profiles...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {filteredBrands.length === 0 ? (
          <div className="py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Award size={48} />
            </div>
            <p className="text-slate-400 text-xl font-medium">{t('noBrands')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBrands.map(brand => (
              <div key={brand.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all flex flex-col p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl border bg-slate-50 overflow-hidden flex-shrink-0">
                    <img src={brand.logo} className="w-full h-full object-cover" alt={brand.name} />
                  </div>
                  <div className="flex items-center space-x-1">
                    <button onClick={() => handleEdit(brand)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(brand.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <h3 className="text-xl font-black text-slate-900">{brand.name}</h3>
                  <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed font-medium">{brand.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Globe size={14} />
                    <span className="text-xs font-bold truncate max-w-[120px]">{brand.website || 'No website'}</span>
                  </div>
                  {brand.website && (
                    <a href={brand.website} target="_blank" rel="noreferrer" className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && editingBrand && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Award size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingBrand.id ? t('editBrand') : t('newBrand')}</h3>
                  <p className="text-slate-500 text-sm font-medium">{t('brandLibrary')}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('brandName')}</label>
                <input 
                  type="text" 
                  value={editingBrand.name}
                  onChange={e => setEditingBrand({...editingBrand, name: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all"
                  placeholder="e.g. Aqara"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('brandLogo')}</label>
                <div className="flex space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border overflow-hidden shrink-0">
                    <img src={editingBrand.logo} className="w-full h-full object-cover" alt="" />
                  </div>
                  <input 
                    type="text" 
                    value={editingBrand.logo}
                    onChange={e => setEditingBrand({...editingBrand, logo: e.target.value})}
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none text-xs"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('brandWebsite')}</label>
                <input 
                  type="text" 
                  value={editingBrand.website}
                  onChange={e => setEditingBrand({...editingBrand, website: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none font-medium text-slate-700"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('brandDesc')}</label>
                <textarea 
                  value={editingBrand.description}
                  onChange={e => setEditingBrand({...editingBrand, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none h-32 resize-none font-medium text-slate-600"
                  placeholder="Manufacturer history, market position..."
                />
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
              <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500 hover:text-slate-800 transition-all">
                {t('cancel')}
              </button>
              <button 
                onClick={handleSave}
                className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black hover:scale-105 transition-all"
              >
                {t('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandLibrary;
