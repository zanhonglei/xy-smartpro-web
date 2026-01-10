
import React, { useState, useMemo } from 'react';
import { Product, ProductSKU, CategoryItem } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Package, 
  ChevronRight, 
  Image as ImageIcon,
  DollarSign,
  Tag,
  Briefcase,
  Layers,
  AlertCircle,
  LayoutGrid,
  List,
  ChevronLeft
} from 'lucide-react';
import { getIcon } from '../constants';

interface ProductManagerProps {
  products: Product[];
  categories: CategoryItem[];
  onUpdate: (products: Product[]) => void;
  isSelectionMode?: boolean;
  hideHeader?: boolean;
}

const ProductManager: React.FC<ProductManagerProps> = ({ products, categories, onUpdate, isSelectionMode = false, hideHeader = false }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.model.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'ALL' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (val: string) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      brand: '',
      model: '',
      categoryId: categories[0]?.id || '',
      category: categories[0]?.name || '',
      description: '',
      imageUrl: 'https://picsum.photos/seed/newproduct/200/200',
      skus: [],
      price: 0,
      stock: 0,
      isCompanyActive: !hideHeader // If in reference view, active is false. If in company view, active is true.
    };
    setEditingProduct(newProduct);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(JSON.parse(JSON.stringify(product))); 
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDeleteProduct'))) {
      onUpdate(products.filter(p => p.id !== id));
    }
  };

  const handleSave = () => {
    if (!editingProduct || !editingProduct.name) return;

    const basePrice = editingProduct.skus.length > 0 ? editingProduct.skus[0].price : 0;
    const totalStock = editingProduct.skus.reduce((sum, s) => sum + s.stock, 0);
    
    const finalProduct = {
      ...editingProduct,
      price: basePrice,
      stock: totalStock,
      category: categories.find(c => c.id === editingProduct.categoryId)?.name || editingProduct.category
    };

    const exists = products.some(p => p.id === finalProduct.id);
    if (exists) {
      onUpdate(products.map(p => p.id === finalProduct.id ? finalProduct : p));
    } else {
      onUpdate([...products, finalProduct]);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const addSku = () => {
    if (!editingProduct) return;
    const newSku: ProductSKU = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      price: 0,
      cost: 0,
      stock: 0,
      skuCode: ''
    };
    setEditingProduct({
      ...editingProduct,
      skus: [...editingProduct.skus, newSku]
    });
  };

  const updateSku = (skuId: string, updates: Partial<ProductSKU>) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      skus: editingProduct.skus.map(s => s.id === skuId ? { ...s, ...updates } : s)
    });
  };

  const removeSku = (skuId: string) => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      skus: editingProduct.skus.filter(s => s.id !== skuId)
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      {/* Header */}
      {!hideHeader && (
        <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('productLibrary')}</h1>
              <p className="text-slate-500 font-medium">{lang === 'zh' ? '管理及检索所有的智能家居产品（参考库）。' : 'Manage and search all smart home products (Reference Library).'}</p>
            </div>
            <div className="flex items-center space-x-3">
               <div className="flex bg-slate-100 p-1 rounded-xl border">
                 <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   <LayoutGrid size={20} />
                 </button>
                 <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                 >
                   <List size={20} />
                 </button>
               </div>
               <button 
                  onClick={handleCreate}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
                >
                  <Plus size={20} />
                  <span>{t('addProduct')}</span>
               </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t('searchProducts')}
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <div className="flex items-center space-x-2 bg-slate-100 rounded-2xl px-4 py-2 border">
              <Filter size={18} className="text-slate-400" />
              <select 
                value={categoryFilter}
                onChange={e => handleCategoryFilterChange(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-600 outline-none"
              >
                <option value="ALL">{t('allCategories')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid/List View Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {hideHeader && (
          <div className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={t('searchProducts')}
                value={searchTerm}
                onChange={e => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium shadow-sm"
              />
            </div>
            <div className="flex items-center space-x-2 bg-slate-100 rounded-2xl px-4 py-2 border">
              <Filter size={18} className="text-slate-400" />
              <select 
                value={categoryFilter}
                onChange={e => handleCategoryFilterChange(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-600 outline-none"
              >
                <option value="ALL">{t('allCategories')}</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        )}

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map(p => {
              const cat = categories.find(c => c.id === p.categoryId);
              return (
                <div key={p.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-2xl transition-all">
                  <div className="aspect-square relative overflow-hidden bg-slate-50">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-slate-600 shadow-sm flex items-center space-x-1 uppercase">
                      {cat && getIcon(cat.iconName)}
                      <span>{p.category}</span>
                    </div>
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2 backdrop-blur-sm">
                      <button onClick={() => handleEdit(p)} className="p-3 bg-white rounded-full text-blue-600 shadow-lg hover:scale-110 transition-transform">
                        <Edit2 size={20} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-3 bg-white rounded-full text-red-500 shadow-lg hover:scale-110 transition-transform">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-800 truncate">{p.name}</h3>
                      <p className="text-xs text-slate-400 font-medium">{p.brand} · {p.model}</p>
                    </div>
                    
                    <div className="flex justify-between items-end pt-2 border-t border-slate-50">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('price')}</p>
                        <p className="text-xl font-black text-blue-600">${p.price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stock')}</p>
                        <p className={`text-xs font-bold ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.stock}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-black text-slate-400 uppercase tracking-widest border-b">
                  <th className="px-6 py-4">{t('popularProducts')}</th>
                  <th className="px-6 py-4">{t('brand')}</th>
                  <th className="px-6 py-4">{t('categories')}</th>
                  <th className="px-6 py-4">{t('price')}</th>
                  <th className="px-6 py-4">{t('stock')}</th>
                  <th className="px-6 py-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-all cursor-pointer" onClick={() => handleEdit(p)}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border bg-slate-50">
                          <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <p className="font-bold text-slate-800">{p.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{p.brand}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-blue-600">${p.price}</td>
                    <td className="px-6 py-4">
                      <p className={`text-xs font-bold ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>{p.stock}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredProducts.length === 0 && (
          <div className="py-32 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Package size={48} />
            </div>
            <p className="text-slate-400 text-xl font-medium">{t('noResults')}</p>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="mt-12 flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <p className="text-sm font-bold text-slate-500">
              {t('pageInfo').replace('{current}', currentPage.toString()).replace('{total}', totalPages.toString())}
            </p>
            <div className="flex items-center space-x-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center space-x-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${currentPage === i + 1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[90vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingProduct.id ? t('editProduct') : t('newProduct')}</h3>
                  <p className="text-slate-500 text-sm font-medium">{t('productManagement')}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-1/2 border-r overflow-y-auto custom-scrollbar p-10 space-y-8 bg-white">
                <h4 className="text-xl font-black text-slate-800 flex items-center space-x-2">
                  <Tag size={20} className="text-blue-500" />
                  <span>{t('basicInfo')}</span>
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '产品名称' : 'Product Name'}</label>
                    <input 
                      type="text" 
                      value={editingProduct.name}
                      onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all"
                      placeholder="e.g. Smart Dimmer Switch"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('brand')}</label>
                    <input 
                      type="text" 
                      value={editingProduct.brand}
                      onChange={e => setEditingProduct({...editingProduct, brand: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('model')}</label>
                    <input 
                      type="text" 
                      value={editingProduct.model}
                      onChange={e => setEditingProduct({...editingProduct, model: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('categories')}</label>
                    <select 
                      value={editingProduct.categoryId}
                      onChange={e => setEditingProduct({...editingProduct, categoryId: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-700"
                    >
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('description')}</label>
                    <textarea 
                      value={editingProduct.description}
                      onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none h-24 resize-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image URL</label>
                    <div className="flex space-x-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border overflow-hidden shrink-0">
                        <img src={editingProduct.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <input 
                        type="text" 
                        value={editingProduct.imageUrl}
                        onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-blue-500 outline-none text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-1/2 bg-slate-50 overflow-y-auto custom-scrollbar p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black text-slate-800 flex items-center space-x-2">
                    <Layers size={20} className="text-indigo-500" />
                    <span>{t('skus')}</span>
                  </h4>
                  <button 
                    onClick={addSku}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 flex items-center space-x-2"
                  >
                    <Plus size={14} />
                    <span>{t('addSku')}</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {editingProduct.skus.map((sku, index) => (
                    <div key={sku.id} className="p-6 bg-white rounded-3xl shadow-sm border border-slate-100 relative group animate-in slide-in-from-right duration-300">
                      <button 
                        onClick={() => removeSku(sku.id)}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('variantName')}</label>
                          <input 
                            type="text" 
                            value={sku.name}
                            onChange={e => updateSku(sku.id, { name: e.target.value })}
                            className="w-full px-3 py-2 border-b-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-sm"
                            placeholder="e.g. Zigbee / White"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('skuCode')}</label>
                          <input 
                            type="text" 
                            value={sku.skuCode}
                            onChange={e => updateSku(sku.id, { skuCode: e.target.value })}
                            className="w-full px-3 py-2 border-b-2 border-slate-100 focus:border-indigo-500 outline-none text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('price')}</label>
                          <input 
                            type="number" 
                            value={sku.price}
                            onChange={e => updateSku(sku.id, { price: Number(e.target.value) })}
                            className="w-full px-3 py-2 border-b-2 border-slate-100 focus:border-indigo-500 outline-none font-bold text-indigo-600 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('cost')}</label>
                          <input 
                            type="number" 
                            value={sku.cost}
                            onChange={e => updateSku(sku.id, { cost: Number(e.target.value) })}
                            className="w-full px-3 py-2 border-b-2 border-slate-100 focus:border-indigo-500 outline-none text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('stock')}</label>
                          <input 
                            type="number" 
                            value={sku.stock}
                            onChange={e => updateSku(sku.id, { stock: Number(e.target.value) })}
                            className="w-full px-3 py-2 border-b-2 border-slate-100 focus:border-indigo-500 outline-none text-sm font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {editingProduct.skus.length === 0 && (
                    <div className="py-12 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center text-slate-400 space-y-2">
                       <AlertCircle size={24} />
                       <p className="text-xs font-bold uppercase tracking-widest">{lang === 'zh' ? '请至少添加一个规格' : 'Add at least one variant'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50 flex items-center justify-between px-12">
              <div className="flex items-center space-x-8">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('skus')}</p>
                    <p className="text-xl font-black text-slate-800">{editingProduct.skus.length}</p>
                 </div>
                 <div className="w-px h-8 bg-slate-200" />
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('totalCost')}</p>
                    <p className="text-2xl font-black text-blue-600">
                      ${editingProduct.skus.reduce((sum, s) => sum + s.price, 0).toLocaleString()}
                    </p>
                 </div>
              </div>
              <div className="flex space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500 hover:text-slate-800 transition-all">
                  {t('cancel')}
                </button>
                <button 
                  onClick={handleSave}
                  className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black hover:scale-105 transition-all flex items-center space-x-3"
                >
                  <Save size={20} />
                  <span>{t('save')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
