
import React, { useState, useMemo } from 'react';
import { SolutionTemplate, Product, TemplateRoom, TemplateProduct } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Package, 
  Home, 
  Save, 
  X, 
  Layout, 
  Search,
  BookOpen,
  Edit2,
  Copy,
  LayoutGrid,
  List,
  ChevronLeft
} from 'lucide-react';

interface TemplateManagerProps {
  templates: SolutionTemplate[];
  products: Product[];
  onUpdate: (templates: SolutionTemplate[]) => void;
}

const TemplateManager: React.FC<TemplateManagerProps> = ({ templates = [], products, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [editingTemplate, setEditingTemplate] = useState<SolutionTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Defensive check to ensure templates is an array
  const safeTemplates = Array.isArray(templates) ? templates : [];

  const totalPages = Math.max(1, Math.ceil(safeTemplates.length / pageSize));
  const paginatedTemplates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return safeTemplates.slice(start, start + pageSize);
  }, [safeTemplates, currentPage]);

  const handleCreate = () => {
    const newTemplate: SolutionTemplate = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      description: '',
      rooms: [],
      totalPrice: 0
    };
    setEditingTemplate(newTemplate);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingTemplate || !editingTemplate.name) return;
    
    const total = calculateTotal(editingTemplate);
    const finalTemplate = { ...editingTemplate, totalPrice: total };

    const exists = safeTemplates.find(t => t.id === editingTemplate.id);
    if (exists) {
      onUpdate(safeTemplates.map(t => t.id === editingTemplate.id ? finalTemplate : t));
    } else {
      onUpdate([...safeTemplates, finalTemplate]);
    }
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  const handleClone = (template: SolutionTemplate) => {
    const cloned: SolutionTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      name: `${template.name} (${lang === 'zh' ? '副本' : 'Copy'})`,
      rooms: template.rooms.map(r => ({
        ...r,
        id: Math.random().toString(36).substr(2, 9)
      }))
    };
    onUpdate([...safeTemplates, cloned]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('confirmDelete'))) {
      onUpdate(safeTemplates.filter(t => t.id !== id));
    }
  };

  const addRoom = () => {
    if (!editingTemplate) return;
    const newRoom: TemplateRoom = {
      id: Math.random().toString(36).substr(2, 9),
      roomType: 'living',
      products: []
    };
    setEditingTemplate({
      ...editingTemplate,
      rooms: [...editingTemplate.rooms, newRoom]
    });
  };

  const updateRoom = (roomId: string, updates: Partial<TemplateRoom>) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      rooms: editingTemplate.rooms.map(r => r.id === roomId ? { ...r, ...updates } : r)
    });
  };

  const deleteRoom = (roomId: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      rooms: editingTemplate.rooms.filter(r => r.id !== roomId)
    });
  };

  const addProductToRoom = (roomId: string, productId: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      rooms: editingTemplate.rooms.map(r => {
        if (r.id === roomId) {
          const exists = r.products.find(p => p.productId === productId);
          if (exists) {
            return {
              ...r,
              products: r.products.map(p => p.productId === productId ? { ...p, quantity: p.quantity + 1 } : p)
            };
          }
          return {
            ...r,
            products: [...r.products, { productId, quantity: 1 }]
          };
        }
        return r;
      })
    });
  };

  const updateProductQty = (roomId: string, productId: string, qty: number) => {
    if (!editingTemplate || qty < 1) return;
    setEditingTemplate({
      ...editingTemplate,
      rooms: editingTemplate.rooms.map(r => r.id === roomId ? {
        ...r,
        products: r.products.map(p => p.productId === productId ? { ...p, quantity: qty } : p)
      } : r)
    });
  };

  const removeProductFromRoom = (roomId: string, productId: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      rooms: editingTemplate.rooms.map(r => r.id === roomId ? {
        ...r,
        products: r.products.filter(p => p.productId !== productId)
      } : r)
    });
  };

  const calculateTotal = (template: SolutionTemplate) => {
    return template.rooms.reduce((acc, room) => {
      return acc + room.products.reduce((roomAcc, tp) => {
        const prod = products.find(p => p.id === tp.productId);
        return roomAcc + (prod?.price || 0) * tp.quantity;
      }, 0);
    }, 0);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
      p.brand.toLowerCase().includes(productSearch.toLowerCase())
    );
  }, [products, productSearch]);

  return (
    <div className="max-w-6xl mx-auto p-12 space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">{t('solutionTemplates')}</h1>
          <p className="text-slate-500 font-medium text-lg">{lang === 'zh' ? '创建并管理各房间维度的智能产品搭配方案。' : 'Create and manage standardized room configurations.'}</p>
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
            className="flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-blue-700 transition-all"
          >
            <Plus size={24} />
            <span>{t('createTemplate')}</span>
          </button>
        </div>
      </div>

      {safeTemplates.length === 0 ? (
        <div className="py-32 text-center space-y-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <BookOpen size={48} />
          </div>
          <p className="text-slate-500 text-xl font-medium">{t('noTemplates')}</p>
          <button 
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold"
          >
            {t('createTemplate')}
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedTemplates.map(template => (
                <div key={template.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col h-full">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-slate-800">{template.name}</h3>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleClone(template); }} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full" title="Clone">
                          <Copy size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingTemplate(template); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2">{template.description}</p>
                    <div className="pt-4 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {template.rooms.map((r, i) => (
                          <span key={i} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {t(r.roomType as any)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalCost')}</p>
                      <p className="text-2xl font-black text-blue-600">${template.totalPrice.toLocaleString()}</p>
                    </div>
                    <div 
                      onClick={() => { setEditingTemplate(template); setIsModalOpen(true); }}
                      className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <ChevronRight size={24} className="text-slate-300 group-hover:text-blue-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs font-black text-slate-400 uppercase tracking-widest border-b">
                    <th className="px-6 py-4">{t('templateName')}</th>
                    <th className="px-6 py-4">{t('roomsTab')}</th>
                    <th className="px-6 py-4">{t('price')}</th>
                    <th className="px-6 py-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paginatedTemplates.map(template => (
                    <tr key={template.id} className="group hover:bg-slate-50 transition-all cursor-pointer" onClick={() => { setEditingTemplate(template); setIsModalOpen(true); }}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">{template.name}</p>
                        <p className="text-xs text-slate-400 truncate max-w-xs">{template.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {template.rooms.map((r, i) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase">
                              {t(r.roomType as any)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-black text-blue-600">${template.totalPrice.toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-1">
                          <button onClick={(e) => { e.stopPropagation(); handleClone(template); }} className="p-2 text-slate-400 hover:text-indigo-600">
                            <Copy size={16} />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(template.id); }} className="p-2 text-slate-400 hover:text-red-500">
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
        </>
      )}

      {isModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-6xl h-[90vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <Layout size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingTemplate.id ? t('edit') : t('createTemplate')}</h3>
                  <p className="text-slate-500 text-sm font-medium">{t('solutionTemplates')}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className="w-2/3 border-r overflow-y-auto custom-scrollbar p-10 space-y-10 bg-white">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('templateName')}</label>
                    <input 
                      type="text" 
                      value={editingTemplate.name}
                      onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-bold text-slate-800 transition-all"
                      placeholder="e.g. Smart Condo Elite"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('templateDesc')}</label>
                    <input 
                      type="text" 
                      value={editingTemplate.description}
                      onChange={e => setEditingTemplate({...editingTemplate, description: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-medium text-slate-600 transition-all"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-slate-800 tracking-tight">{t('roomsTab')}</h4>
                    <button 
                      onClick={addRoom}
                      className="flex items-center space-x-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all"
                    >
                      <Plus size={18} />
                      <span>{t('addTemplateRoom')}</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {editingTemplate.rooms.map(room => (
                      <div key={room.id} className="p-8 bg-slate-50 rounded-[2rem] border-2 border-slate-100 space-y-6 relative group/room">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
                              <Home size={20} />
                            </div>
                            <select 
                              value={room.roomType}
                              onChange={e => updateRoom(room.id, { roomType: e.target.value })}
                              className="bg-transparent text-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2"
                            >
                              <option value="living">{t('livingRoom')}</option>
                              <option value="bedroom">{t('bedroom')}</option>
                              <option value="kitchen">{t('kitchen')}</option>
                              <option value="bathroom">{t('bathroom')}</option>
                              <option value="balcony">{t('balcony')}</option>
                              <option value="entrance">{t('entrance')}</option>
                              <option value="study">{t('study')}</option>
                            </select>
                          </div>
                          <button onClick={() => deleteRoom(room.id)} className="text-red-400 hover:text-red-600 opacity-0 group-hover/room:opacity-100 transition-opacity">
                            <Trash2 size={20} />
                          </button>
                        </div>

                        <div className="space-y-3">
                          {room.products.map(tp => {
                            const p = products.find(prod => prod.id === tp.productId);
                            return (
                              <div key={tp.productId} className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 group/prod">
                                <div className="flex items-center space-x-4">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden border">
                                    <img src={p?.imageUrl} className="w-full h-full object-cover" alt="" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800 text-sm">{p?.name}</p>
                                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{p?.brand}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                  <div className="flex items-center bg-slate-100 rounded-xl px-2 py-1">
                                    <button onClick={() => updateProductQty(room.id, tp.productId, tp.quantity - 1)} className="p-1 hover:text-blue-600">
                                      <X size={14} />
                                    </button>
                                    <span className="w-8 text-center font-black text-sm">{tp.quantity}</span>
                                    <button onClick={() => updateProductQty(room.id, tp.productId, tp.quantity + 1)} className="p-1 hover:text-blue-600">
                                      <Plus size={14} />
                                    </button>
                                  </div>
                                  <button onClick={() => removeProductFromRoom(room.id, tp.productId)} className="text-slate-300 hover:text-red-500">
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-1/3 bg-slate-50 overflow-y-auto custom-scrollbar p-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">{t('productLibrary')}</h4>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder={t('searchProducts')}
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    className="w-full pl-12 pr-6 py-4 rounded-[2rem] border-none shadow-sm outline-none focus:ring-4 focus:ring-blue-100 font-medium transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 group/p transition-all hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden border shrink-0">
                          <img src={p.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 ml-4 overflow-hidden">
                          <p className="font-bold text-slate-800 truncate text-sm">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.brand}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-black text-blue-600 text-sm">${p.price}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editingTemplate.rooms.map(room => (
                          <button 
                            key={room.id}
                            onClick={() => addProductToRoom(room.id, p.id)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all uppercase tracking-wider"
                          >
                            <Plus size={10} />
                            <span>{t(room.roomType as any)}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 border-t bg-slate-50 flex items-center justify-between px-12">
              <div className="flex items-center space-x-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('roomsTab')}</p>
                  <p className="text-xl font-black text-slate-800">{editingTemplate.rooms.length}</p>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('totalCost')}</p>
                  <p className="text-2xl font-black text-blue-600">${calculateTotal(editingTemplate).toLocaleString()}</p>
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

export default TemplateManager;
