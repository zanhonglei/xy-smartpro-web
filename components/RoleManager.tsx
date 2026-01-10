
import React, { useState } from 'react';
import { Role } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Edit2, Trash2, X, Save, 
  Lock, Shield, CheckCircle2, UserCog, MoreVertical
} from 'lucide-react';

interface RoleManagerProps {
  roles: Role[];
  onUpdate: (roles: Role[]) => void;
}

const RoleManager: React.FC<RoleManagerProps> = ({ roles, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Partial<Role> | null>(null);

  const handleCreate = () => {
    setEditingRole({
      id: 'role' + new Date().getTime(),
      name: '',
      description: '',
      permissions: []
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingRole?.name) return;
    const exists = roles.find(r => r.id === editingRole.id);
    if (exists) {
      onUpdate(roles.map(r => r.id === editingRole.id ? editingRole as Role : r));
    } else {
      onUpdate([...roles, editingRole as Role]);
    }
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const availablePermissions = [
    { id: 'design_view', label: '方案查看' },
    { id: 'design_edit', label: '方案编辑' },
    { id: 'product_edit', label: '产品管理' },
    { id: 'customer_all', label: '客户全权限' },
    { id: 'contract_sign', label: '合同签署' },
    { id: 'finance_view', label: '财务查看' },
    { id: 'finance_edit', label: '收支记账' },
    { id: 'system_admin', label: '系统设置' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('roleMgmt')}</h1>
            <p className="text-slate-500 font-medium">配置不同的职能角色与系统访问权限。</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>新增角色</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roles.map(role => (
            <div key={role.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group">
              <div className="flex items-center justify-between mb-8">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Shield size={24} />
                </div>
                <div className="flex items-center space-x-1">
                   <button onClick={() => setEditingRole(role)} className="p-2 text-slate-400 hover:text-blue-600 rounded-xl transition-all">
                      <Edit2 size={18} />
                   </button>
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{role.name}</h3>
                <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{role.description}</p>
                
                <div className="pt-6 border-t border-slate-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">权限集简报</p>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions.map(p => (
                      <span key={p} className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase tracking-wider">
                         {p === 'all' ? '所有权限' : availablePermissions.find(ap => ap.id === p)?.label || p}
                      </span>
                    ))}
                    {role.permissions.length === 0 && <span className="text-xs text-slate-300 italic">暂未配置权限</span>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && editingRole && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl h-[80vh] shadow-2xl overflow-hidden flex flex-col border">
             <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingRole.id ? '编辑角色' : '新增角色'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                   <X size={28} />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">角色名称</label>
                   <input 
                    type="text" 
                    value={editingRole.name || ''}
                    onChange={e => setEditingRole({...editingRole, name: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                    placeholder="例如：高级设计师"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">权限配置</label>
                   <div className="grid grid-cols-2 gap-3">
                      {availablePermissions.map(p => (
                        <button
                          key={p.id}
                          onClick={() => {
                            const next = editingRole.permissions || [];
                            if (next.includes(p.id)) {
                              setEditingRole({...editingRole, permissions: next.filter(i => i !== p.id)});
                            } else {
                              setEditingRole({...editingRole, permissions: [...next, p.id]});
                            }
                          }}
                          className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                            editingRole.permissions?.includes(p.id) ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-100 text-slate-500'
                          }`}
                        >
                          <span className="text-sm font-bold">{p.label}</span>
                          {editingRole.permissions?.includes(p.id) && <CheckCircle2 size={16} className="text-blue-500" />}
                        </button>
                      ))}
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">说明</label>
                   <textarea 
                    value={editingRole.description}
                    onChange={e => setEditingRole({...editingRole, description: e.target.value})}
                    className="w-full h-24 px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800 resize-none"
                   />
                </div>
             </div>
             <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
                <button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all">保存角色</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleManager;
