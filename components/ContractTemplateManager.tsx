
import React, { useState } from 'react';
import { ContractTemplate } from '../types';
import { useLanguage } from '../App';
import { Plus, Edit2, Trash2, X, Save, BookOpen, Search, Info } from 'lucide-react';

interface ContractTemplateManagerProps {
  templates: ContractTemplate[];
  onUpdate: (templates: ContractTemplate[]) => void;
}

const ContractTemplateManager: React.FC<ContractTemplateManagerProps> = ({ templates, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreate = () => {
    setEditingTemplate({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      content: lang === 'zh' ? `兹有甲方 {{customerName}} 就 {{solutionName}} 项目与乙方达成如下协议：\n\n一、项目概况\n总金额：{{totalPrice}} 元\n签署日期：{{date}}\n\n二、产品清单\n{{deviceList}}\n\n三、服务说明...` : `Agreement between Party A {{customerName}} and Party B regarding project {{solutionName}}.\n\n1. Overview\nTotal Price: {{totalPrice}}\nDate: {{date}}\n\n2. Device List\n{{deviceList}}\n\n3. Terms...`,
      placeholders: ['customerName', 'totalPrice', 'solutionName', 'deviceList', 'date']
    });
    setIsModalOpen(true);
  };

  const handleEdit = (temp: ContractTemplate) => {
    setEditingTemplate({ ...temp });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      onUpdate(templates.filter(t => t.id !== id));
    }
  };

  const handleSave = () => {
    if (!editingTemplate || !editingTemplate.name) return;
    const exists = templates.find(t => t.id === editingTemplate.id);
    if (exists) {
      onUpdate(templates.map(t => t.id === editingTemplate.id ? editingTemplate : t));
    } else {
      onUpdate([...templates, editingTemplate]);
    }
    setIsModalOpen(false);
    setEditingTemplate(null);
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('contractTemplates')}</h2>
          <p className="text-slate-500 font-medium">{lang === 'zh' ? '预设标准化合同样本，提高法务处理效率。' : 'Pre-set standardized contract samples to improve legal efficiency.'}</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all"
        >
          <Plus size={20} />
          <span>{lang === 'zh' ? '新建模板' : 'New Template'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {templates.map(template => (
          <div key={template.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 group hover:shadow-xl transition-all flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <BookOpen size={24} />
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(template)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                <button onClick={() => handleDelete(template.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-4">{template.name}</h3>
            <div className="flex flex-wrap gap-2 mb-8">
               {template.placeholders.map(p => (
                 <span key={p} className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-widest">
                   {"{{" + p + "}}"}
                 </span>
               ))}
            </div>
            <div className="mt-auto pt-6 border-t flex items-center justify-between text-slate-400 font-bold text-xs">
              <span>{template.content.length} characters</span>
              <button onClick={() => handleEdit(template)} className="text-blue-600 hover:underline">{t('edit')}</button>
            </div>
          </div>
        ))}
        {templates.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[3rem] space-y-4">
             <BookOpen size={48} className="mx-auto text-slate-200" />
             <p className="text-slate-400 font-medium">No templates found.</p>
          </div>
        )}
      </div>

      {isModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl h-[85vh] shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingTemplate.id ? t('edit') : t('createTemplate')}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                <X size={28} />
              </button>
            </div>
            <div className="flex-1 flex overflow-hidden">
               <div className="w-2/3 p-10 border-r flex flex-col space-y-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('templateName')}</label>
                    <input 
                      type="text" 
                      value={editingTemplate.name}
                      onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all"
                      placeholder="e.g. Standard Service Contract"
                    />
                 </div>
                 <div className="flex-1 flex flex-col space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '文本内容' : 'Contract Text'}</label>
                    <textarea 
                      value={editingTemplate.content}
                      onChange={e => setEditingTemplate({...editingTemplate, content: e.target.value})}
                      className="flex-1 w-full p-8 rounded-3xl border-2 border-slate-100 focus:border-blue-500 outline-none font-serif text-lg leading-loose resize-none custom-scrollbar"
                      placeholder="Write your contract content here..."
                    />
                 </div>
               </div>
               <div className="flex-1 bg-slate-50 p-10 space-y-8">
                  <div>
                    <h4 className="text-lg font-black text-slate-800 mb-4">{lang === 'zh' ? '可用占位符' : 'Available Placeholders'}</h4>
                    <div className="grid grid-cols-1 gap-3">
                       {[
                         { id: 'customerName', label: 'Customer Name' },
                         { id: 'totalPrice', label: 'Total Price' },
                         { id: 'solutionName', label: 'Solution Name' },
                         { id: 'deviceList', label: 'Device List' },
                         { id: 'date', label: 'Current Date' }
                       ].map(p => (
                         <div key={p.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between group">
                            <div>
                               <p className="text-sm font-bold text-slate-700">{"{{" + p.id + "}}"}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase">{p.label}</p>
                            </div>
                            <button 
                              onClick={() => setEditingTemplate({...editingTemplate, content: editingTemplate.content + ` {{${p.id}}}`})}
                              className="text-blue-600 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Plus size={16} />
                            </button>
                         </div>
                       ))}
                    </div>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 space-y-4">
                     <div className="flex items-center space-x-2 text-blue-600">
                        <Info size={18} />
                        <span className="font-bold text-sm uppercase">{lang === 'zh' ? '填写提示' : 'Usage Guide'}</span>
                     </div>
                     <p className="text-xs text-blue-700 leading-relaxed font-medium">
                        {lang === 'zh' ? '在合同正文中插入对应的双花括号标签，生成合同时系统会自动将其替换为真实的业务数据。' : 'Insert double-curly brackets into the text. They will be replaced by real business data when the contract is generated.'}
                      </p>
                  </div>
               </div>
            </div>
            <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
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
      )}
    </div>
  );
};

export default ContractTemplateManager;
