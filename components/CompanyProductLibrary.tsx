
import React, { useState, useMemo } from 'react';
import { Product, CategoryItem } from '../types';
import { useLanguage } from '../App';
import ProductManager from './ProductManager';
import { 
  Package, 
  Plus, 
  Search, 
  X, 
  CheckCircle2, 
  Layers, 
  Database,
  ArrowRight,
  Filter
} from 'lucide-react';

interface CompanyProductLibraryProps {
  products: Product[];
  categories: CategoryItem[];
  onUpdate: (products: Product[]) => void;
}

const CompanyProductLibrary: React.FC<CompanyProductLibraryProps> = ({ products, categories, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSearchTerm, setImportSearchTerm] = useState('');
  const [selectedForImport, setSelectedForImport] = useState<Set<string>>(new Set());

  // Show only products active for the company
  const companyPortfolio = useMemo(() => products.filter(p => p.isCompanyActive), [products]);
  // Master list of all available products not in company catalog
  const masterList = useMemo(() => products.filter(p => !p.isCompanyActive), [products]);

  const filteredMasterList = useMemo(() => {
    return masterList.filter(p => 
      p.name.toLowerCase().includes(importSearchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(importSearchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(importSearchTerm.toLowerCase())
    );
  }, [masterList, importSearchTerm]);

  const handleToggleSelection = (id: string) => {
    const next = new Set(selectedForImport);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedForImport(next);
  };

  const handleImport = () => {
    const updatedProducts = products.map(p => {
      if (selectedForImport.has(p.id)) {
        return { ...p, isCompanyActive: true };
      }
      return p;
    });
    onUpdate(updatedProducts);
    setIsImportModalOpen(false);
    setSelectedForImport(new Set());
    alert(t('importSuccess'));
  };

  const handleUpdatePortfolio = (updatedPortfolio: Product[]) => {
    // Merge updated portfolio back into full product list
    // This ensures that products NOT in updatedPortfolio but were companyActive remaincompanyActive (unless deleted)
    // Actually, ProductManager manages a list. If it's the company view, onUpdate should only replace matching IDs.
    
    const updatedMap = new Map(updatedPortfolio.map(p => [p.id, p]));
    const syncedProducts = products.map(p => {
      if (updatedMap.has(p.id)) {
        return updatedMap.get(p.id)!;
      }
      // If a product was deleted in the ProductManager list, remove it from master if it was active
      // But usually ProductManager handles its own list. 
      // If we are in company mode, if a product is missing from updatedPortfolio, we set its isCompanyActive to false.
      if (p.isCompanyActive && !updatedMap.has(p.id)) {
          return { ...p, isCompanyActive: false };
      }
      return p;
    });
    
    onUpdate(syncedProducts);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 overflow-hidden animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-4 flex items-center justify-between z-20">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t('companyProductLibrary')}</h1>
          <p className="text-slate-500 text-xs font-medium">{lang === 'zh' ? '您公司实际销售和安装的产品清单。' : 'Products currently offered by your company.'}</p>
        </div>
        <button 
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>{t('addFromReference')}</span>
        </button>
      </div>

      <div className="flex-1 overflow-hidden">
        <ProductManager 
          products={companyPortfolio} 
          categories={categories} 
          onUpdate={handleUpdatePortfolio}
          hideHeader={true}
        />
      </div>

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Database size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('addFromReference')}</h3>
                  <p className="text-slate-500 text-sm font-medium">{t('referenceProductLibrary')}</p>
                </div>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="p-8 border-b">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder={t('searchProducts')}
                  value={importSearchTerm}
                  onChange={e => setImportSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border-none bg-slate-100 outline-none focus:ring-4 focus:ring-indigo-100 font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMasterList.map(p => (
                <div 
                  key={p.id}
                  onClick={() => handleToggleSelection(p.id)}
                  className={`relative p-5 rounded-[2rem] border-2 cursor-pointer transition-all group ${
                    selectedForImport.has(p.id) 
                    ? 'bg-indigo-50 border-indigo-500 shadow-md' 
                    : 'bg-white border-slate-100 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border bg-slate-50 flex-shrink-0">
                      <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="font-bold text-slate-800 truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.brand} · {p.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <span className="font-black text-indigo-600">${p.price}</span>
                    <div className={`p-2 rounded-full transition-all ${
                      selectedForImport.has(p.id) 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-50 text-slate-300 group-hover:bg-indigo-100'
                    }`}>
                      {selectedForImport.has(p.id) ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                    </div>
                  </div>
                </div>
              ))}
              {filteredMasterList.length === 0 && (
                <div className="col-span-full py-24 text-center text-slate-400 font-medium">
                  {t('noResults')}
                </div>
              )}
            </div>

            <div className="p-8 border-t bg-slate-50 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">
                {selectedForImport.size} {lang === 'zh' ? '个产品已选中' : 'products selected'}
              </p>
              <div className="flex space-x-4">
                <button onClick={() => setIsImportModalOpen(false)} className="px-8 py-3 font-bold text-slate-500">
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleImport}
                  disabled={selectedForImport.size === 0}
                  className="flex items-center space-x-3 px-10 py-3 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all disabled:opacity-50"
                >
                  <span>{lang === 'zh' ? '确认导入' : 'Confirm Import'}</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyProductLibrary;
