
import React, { useState, useMemo, useEffect } from 'react';
import { Employee, Department, Role } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Edit2, Trash2, X, Save, 
  Mail, Phone, Briefcase, Calendar, ShieldCheck, 
  UserPlus, LayoutGrid, List, ChevronLeft, ChevronRight, BadgeCheck, Ban
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

  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => 
    (localStorage.getItem('view_mode_employees') as any) || 'grid'
  );

  useEffect(() => {
    localStorage.setItem('view_mode_employees', viewMode);
  }, [viewMode]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(6);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) || e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const totalPages = Math.ceil(filteredEmployees.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, currentPage, pageSize]);

  const handleSave = () => {
    if (!editingEmployee?.name || !editingEmployee?.email) return;
    if (employees.find(e => e.id === editingEmployee.id)) {
      onUpdate(employees.map(e => e.id === editingEmployee.id ? editingEmployee as Employee : e));
    } else {
      onUpdate([...employees, {...editingEmployee, id: 'e' + Date.now()} as Employee]);
    }
    setIsModalOpen(false);
  };

  const getDeptName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';
  const getRoleName = (id: string) => roles.find(r => r.id === id)?.name || 'Unknown';

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500 overflow-hidden">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div><h1 className="text-3xl font-black text-slate-900 tracking-tight">员工管理</h1><p className="text-slate-500 font-medium">配置公司内部职能人员与账号权限</p></div>
          <div className="flex items-center space-x-3">
             <div className="flex bg-slate-100 p-1 rounded-xl border">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}><List size={20} /></button>
             </div>
             <button onClick={() => {setEditingEmployee({status: 'Active'}); setIsModalOpen(true);}} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all"><UserPlus size={20} /><span>新增员工</span></button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="搜索姓名或邮箱..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full pl-12 pr-6 py-3 rounded-2xl bg-slate-100 border-none outline-none font-medium" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedData.map(e => (
              <div key={e.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 flex flex-col hover:shadow-xl transition-all group">
                <div className="flex items-center space-x-6 mb-8">
                  <img src={e.avatar} className="w-20 h-20 rounded-[1.5rem] border-4 border-slate-50 object-cover" />
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{e.name}</h3>
                    <div className="flex space-x-2 mt-1">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-black uppercase">{getRoleName(e.roleId)}</span>
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-black uppercase">{getDeptName(e.departmentId)}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 flex-1">
                  <div className="flex items-center space-x-3 text-slate-400"><Mail size={16} /><span className="text-sm font-bold truncate">{e.email}</span></div>
                  <div className="flex items-center space-x-3 text-slate-400"><Phone size={16} /><span className="text-sm font-bold">{e.phone}</span></div>
                </div>
                <div className="mt-8 pt-6 border-t flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                   <button onClick={() => {setEditingEmployee(e); setIsModalOpen(true);}} className="text-blue-600 text-sm font-bold hover:underline">编辑资料</button>
                   <span className={e.status === 'Active' ? 'text-green-500' : 'text-red-500'}><BadgeCheck size={18}/></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] border overflow-hidden shadow-sm">
             <table className="w-full text-left">
                <thead className="bg-slate-50 border-b text-xs font-black text-slate-400 uppercase">
                   <tr><th className="px-6 py-4">姓名</th><th className="px-6 py-4">部门</th><th className="px-6 py-4">角色</th><th className="px-6 py-4">邮箱</th><th className="px-6 py-4 text-right">状态</th></tr>
                </thead>
                <tbody className="divide-y">
                   {paginatedData.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4 font-bold text-slate-800">{e.name}</td>
                         <td className="px-6 py-4 text-slate-600 font-medium">{getDeptName(e.departmentId)}</td>
                         <td className="px-6 py-4 text-slate-400 font-bold uppercase text-[10px]">{getRoleName(e.roleId)}</td>
                         <td className="px-6 py-4 text-slate-500">{e.email}</td>
                         <td className="px-6 py-4 text-right"><span className={`px-2 py-1 rounded-lg text-[9px] font-black ${e.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{e.status}</span></td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        <div className="mt-12 flex items-center justify-between bg-white px-8 py-5 rounded-[2rem] border shadow-sm">
           <p className="text-sm font-bold text-slate-500">第 {currentPage} 页 / 共 {totalPages} 页</p>
           <div className="flex space-x-2">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-30"><ChevronLeft size={20} /></button>
              {[...Array(totalPages)].map((_, i) => (
                 <button key={i} onClick={() => setCurrentPage(i+1)} className={`w-10 h-10 rounded-xl font-black text-xs ${currentPage === i+1 ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>{i+1}</button>
              ))}
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 rounded-xl bg-slate-100 text-slate-600 disabled:opacity-30"><ChevronRight size={20} /></button>
           </div>
        </div>
      </div>

      {isModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
           <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl p-10 space-y-6">
              <div className="flex justify-between items-center"><h3 className="text-2xl font-black">员工资料管理</h3><button onClick={() => setIsModalOpen(false)}><X size={24}/></button></div>
              <div className="space-y-4">
                 <input type="text" placeholder="姓名" value={editingEmployee.name || ''} onChange={e => setEditingEmployee({...editingEmployee, name: e.target.value})} className="w-full px-6 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none" />
                 <input type="email" placeholder="邮箱" value={editingEmployee.email || ''} onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value})} className="w-full px-6 py-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none" />
                 <div className="grid grid-cols-2 gap-4">
                    <select value={editingEmployee.departmentId} onChange={e => setEditingEmployee({...editingEmployee, departmentId: e.target.value})} className="px-4 py-3 rounded-xl border">{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
                    <select value={editingEmployee.roleId} onChange={e => setEditingEmployee({...editingEmployee, roleId: e.target.value})} className="px-4 py-3 rounded-xl border">{roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
                 </div>
              </div>
              <div className="pt-6 flex space-x-3">
                 <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">取消</button>
                 <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20">保存账号</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManager;
