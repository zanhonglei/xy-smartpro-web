
import React, { useState } from 'react';
import { Department, Employee } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Edit2, Trash2, X, Save, 
  Building2, Users, ChevronRight, MoreHorizontal, 
  UserCircle
} from 'lucide-react';

interface DepartmentManagerProps {
  departments: Department[];
  employees: Employee[];
  onUpdate: (departments: Department[]) => void;
}

const DepartmentManager: React.FC<DepartmentManagerProps> = ({ departments, employees, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Partial<Department> | null>(null);

  const handleCreate = () => {
    setEditingDept({
      id: 'dept' + new Date().getTime(),
      name: '',
      description: '',
      managerId: employees[0]?.id || ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (dept: Department) => {
    setEditingDept({ ...dept });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingDept?.name) return;
    const exists = departments.find(d => d.id === editingDept.id);
    if (exists) {
      onUpdate(departments.map(d => d.id === editingDept.id ? editingDept as Department : d));
    } else {
      onUpdate([...departments, editingDept as Department]);
    }
    setIsModalOpen(false);
    setEditingDept(null);
  };

  const getManagerName = (id?: string) => employees.find(e => e.id === id)?.name || '未委派';
  const getDeptHeadCount = (id: string) => employees.filter(e => e.departmentId === id).length;

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('deptMgmt')}</h1>
            <p className="text-slate-500 font-medium">定义公司的组织架构，明晰部门权责。</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>新增部门</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {departments.map(dept => (
            <div key={dept.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-12 -mt-12 group-hover:bg-blue-50 transition-colors" />
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-lg">
                    <Building2 size={24} />
                  </div>
                  <div className="flex items-center space-x-2">
                     <span className="text-xs font-black text-slate-400 uppercase tracking-widest">ID: {dept.id}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">{dept.name}</h3>
                   <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">{dept.description || '暂无部门描述'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">部门负责人</p>
                      <div className="flex items-center space-x-2">
                         <UserCircle size={14} className="text-blue-500" />
                         <span className="text-sm font-bold text-slate-700">{getManagerName(dept.managerId)}</span>
                      </div>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">在职人员</p>
                      <div className="flex items-center space-x-2">
                         <Users size={14} className="text-indigo-500" />
                         <span className="text-sm font-bold text-slate-700">{getDeptHeadCount(dept.id)} 人</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex items-center justify-end space-x-2">
                <button 
                  onClick={() => handleEdit(dept)}
                  className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && editingDept && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border">
             <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingDept.id ? '编辑部门' : '新增部门'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                   <X size={28} />
                </button>
             </div>
             <div className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">部门名称</label>
                   <input 
                    type="text" 
                    value={editingDept.name || ''}
                    onChange={e => setEditingDept({...editingDept, name: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                    placeholder="例如：主案设计组"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">负责人</label>
                   <select 
                    value={editingDept.managerId}
                    onChange={e => setEditingDept({...editingDept, managerId: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold"
                   >
                      <option value="">-- 请委派负责人 --</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">职能描述</label>
                   <textarea 
                    value={editingDept.description}
                    onChange={e => setEditingDept({...editingDept, description: e.target.value})}
                    placeholder="简述部门的主要业务与职责..."
                    className="w-full h-32 px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800 resize-none"
                   />
                </div>
             </div>
             <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
                <button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all">保存部门</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManager;
