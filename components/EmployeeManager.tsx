
import React, { useState } from 'react';
import { Employee, Department, Role } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Edit2, Trash2, X, Save, 
  Mail, Phone, Briefcase, Calendar, ShieldCheck, 
  UserPlus, MoreVertical, BadgeCheck, Ban
} from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  departments: Department[];
  roles: Role[];
  onUpdate: (employees: Employee[]) => void;
}

const EmployeeManager: React.FC<EmployeeManagerProps> = ({ employees, departments, roles, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Employee> | null>(null);

  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = () => {
    setEditingEmployee({
      id: 'e' + new Date().getTime(),
      name: '',
      email: '',
      phone: '',
      avatar: `https://picsum.photos/seed/${Math.random()}/100/100`,
      departmentId: departments[0]?.id || '',
      roleId: roles[0]?.id || '',
      status: 'Active',
      hireDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee({ ...employee });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!editingEmployee?.name || !editingEmployee?.email) return;
    const exists = employees.find(e => e.id === editingEmployee.id);
    if (exists) {
      onUpdate(employees.map(e => e.id === editingEmployee.id ? editingEmployee as Employee : e));
    } else {
      onUpdate([...employees, editingEmployee as Employee]);
    }
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const toggleStatus = (id: string) => {
    onUpdate(employees.map(e => {
      if (e.id === id) {
        return { ...e, status: e.status === 'Active' ? 'Disabled' : 'Active' };
      }
      return e;
    }));
  };

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';
  const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || 'Unknown';

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('employeeMgmt')}</h1>
            <p className="text-slate-500 font-medium">管理公司内部员工账号及职能分配。</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all active:scale-95"
          >
            <UserPlus size={20} />
            <span>新增员工</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索姓名、邮箱、部门..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3 rounded-2xl border-none bg-slate-100 outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredEmployees.map(employee => (
            <div key={employee.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all p-8 flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4">
                <button 
                  onClick={() => toggleStatus(employee.id)}
                  className={`p-2 rounded-xl transition-all ${employee.status === 'Active' ? 'text-green-500 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                  title={employee.status === 'Active' ? '禁用账号' : '启用账号'}
                >
                  {employee.status === 'Active' ? <BadgeCheck size={20} /> : <Ban size={20} />}
                </button>
              </div>

              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden border-4 border-slate-50 shadow-sm group-hover:scale-105 transition-transform duration-500">
                  <img src={employee.avatar} className="w-full h-full object-cover" alt={employee.name} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{employee.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase tracking-widest">{getRoleName(employee.roleId)}</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-400 rounded text-[10px] font-black uppercase tracking-widest">{getDeptName(employee.departmentId)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex-1">
                <div className="flex items-center space-x-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                  <Mail size={16} />
                  <span className="text-sm font-bold truncate">{employee.email}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                  <Phone size={16} />
                  <span className="text-sm font-bold">{employee.phone}</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-400 group-hover:text-slate-600 transition-colors">
                  <Calendar size={16} />
                  <span className="text-sm font-bold">入职于 {employee.hireDate}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => handleEdit(employee)}
                  className="text-blue-600 text-sm font-bold flex items-center hover:underline"
                >
                  <Edit2 size={14} className="mr-1" /> 编辑资料
                </button>
                <div className="flex space-x-2">
                   <button className="p-2 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><ShieldCheck size={16} /></button>
                   <button className="p-2 bg-slate-50 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><MoreVertical size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border">
             <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{editingEmployee.id ? '编辑员工' : '新增员工'}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                   <X size={28} />
                </button>
             </div>
             <div className="p-10 space-y-6">
                <div className="flex justify-center mb-4">
                  <div className="relative group">
                    <img src={editingEmployee.avatar} className="w-24 h-24 rounded-3xl object-cover border-4 border-slate-100 shadow-sm" alt="" />
                    <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                       <Plus size={24} className="text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">姓名</label>
                   <input 
                    type="text" 
                    value={editingEmployee.name || ''}
                    onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                    placeholder="请输入真实姓名"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">所属部门</label>
                      <select 
                        value={editingEmployee.departmentId}
                        onChange={e => setEditingEmployee({...editingEmployee, departmentId: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold"
                      >
                         {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">系统角色</label>
                      <select 
                        value={editingEmployee.roleId}
                        onChange={e => setEditingEmployee({...editingEmployee, roleId: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold"
                      >
                         {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">电子邮箱</label>
                   <input 
                    type="email" 
                    value={editingEmployee.email || ''}
                    onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">联系电话</label>
                   <input 
                    type="text" 
                    value={editingEmployee.phone || ''}
                    onChange={e => setEditingEmployee({...editingEmployee, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-100"
                   />
                </div>
             </div>
             <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
                <button onClick={handleSave} className="px-12 py-4 bg-slate-900 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-black transition-all flex items-center space-x-2">
                   <Save size={18} />
                   <span>保存员工资料</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
