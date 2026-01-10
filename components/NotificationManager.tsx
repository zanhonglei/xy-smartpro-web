
import React, { useState } from 'react';
import { SystemNotification, Department, Role, Employee } from '../types';
import { useLanguage } from '../App';
import { 
  Plus, Search, Bell, X, Send, 
  Trash2, Info, AlertTriangle, CheckCircle2, 
  Users, Building2, Shield, User, Clock
} from 'lucide-react';

interface NotificationManagerProps {
  notifications: SystemNotification[];
  departments: Department[];
  roles: Role[];
  currentUser: Employee;
  onUpdate: (notifications: SystemNotification[]) => void;
}

const NotificationManager: React.FC<NotificationManagerProps> = ({ notifications, departments, roles, currentUser, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState<Partial<SystemNotification> | null>(null);

  const handleCreate = () => {
    setNewNotice({
      id: 'n' + new Date().getTime(),
      title: '',
      content: '',
      type: 'info',
      targetType: 'all',
      createdAt: new Date().toLocaleString(),
      authorId: currentUser.id,
      authorName: currentUser.name
    });
    setIsModalOpen(true);
  };

  const handleSend = () => {
    if (!newNotice?.title || !newNotice?.content) return;
    onUpdate([...notifications, newNotice as SystemNotification]);
    setIsModalOpen(false);
    setNewNotice(null);
  };

  const handleDelete = (id: string) => {
    onUpdate(notifications.filter(n => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'info': return <Info className="text-blue-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
      case 'success': return <CheckCircle2 className="text-green-500" size={18} />;
      default: return <Bell size={18} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      <div className="bg-white border-b px-8 py-6 sticky top-0 z-20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('notificationMgmt')}</h1>
            <p className="text-slate-500 font-medium">发布全员或指定范围的内部公告与动态。</p>
          </div>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>发布公告</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {notifications.slice().reverse().map(notice => (
            <div key={notice.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 group hover:shadow-xl transition-all animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    {getTypeIcon(notice.type)}
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{notice.title}</h3>
                </div>
                <button onClick={() => handleDelete(notice.id)} className="p-2 text-slate-300 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                   <Trash2 size={16} />
                </button>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl text-slate-600 font-medium leading-relaxed mb-6">
                 {notice.content}
              </div>

              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                       <User size={12} className="text-slate-300" />
                       <span>{notice.authorName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                       <Clock size={12} className="text-slate-300" />
                       <span>{notice.createdAt}</span>
                    </div>
                 </div>
                 <div className="flex items-center space-x-2">
                    <Users size={12} className="text-blue-400" />
                    <span className="text-blue-500">{notice.targetType === 'all' ? '全体员工' : notice.targetType}</span>
                 </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
             <div className="py-32 text-center space-y-4">
                <Bell size={48} className="mx-auto text-slate-200" />
                <p className="text-slate-400 font-medium">暂无已发布的公告</p>
             </div>
          )}
        </div>
      </div>

      {isModalOpen && newNotice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3.5rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col border">
             <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">拟定公告内容</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                   <X size={28} />
                </button>
             </div>
             <div className="p-10 space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">公告标题</label>
                   <input 
                    type="text" 
                    value={newNotice.title || ''}
                    onChange={e => setNewNotice({...newNotice, title: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800"
                    placeholder="请输入简洁清晰的标题"
                   />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">通知类型</label>
                      <select 
                        value={newNotice.type}
                        onChange={e => setNewNotice({...newNotice, type: e.target.value as any})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold"
                      >
                         <option value="info">常规通知</option>
                         <option value="warning">预警提醒</option>
                         <option value="success">喜报公告</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">接收范围</label>
                      <select 
                        value={newNotice.targetType}
                        onChange={e => setNewNotice({...newNotice, targetType: e.target.value as any})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold"
                      >
                         <option value="all">全体员工</option>
                         <option value="department">指定部门</option>
                         <option value="role">指定角色</option>
                      </select>
                   </div>
                </div>

                {newNotice.targetType !== 'all' && (
                  <div className="space-y-2 animate-in fade-in duration-300">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">选择目标</label>
                     <select 
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-100 font-bold"
                      onChange={e => setNewNotice({...newNotice, targetId: e.target.value})}
                     >
                        {newNotice.targetType === 'department' ? (
                          departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)
                        ) : (
                          roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                        )}
                     </select>
                  </div>
                )}

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">公告正文</label>
                   <textarea 
                    value={newNotice.content}
                    onChange={e => setNewNotice({...newNotice, content: e.target.value})}
                    placeholder="输入需要告知大家的详细信息..."
                    className="w-full h-40 px-6 py-4 rounded-2xl border-2 border-slate-100 outline-none font-bold text-slate-800 resize-none"
                   />
                </div>
             </div>
             <div className="p-8 border-t bg-slate-50 flex justify-end space-x-4">
                <button onClick={() => setIsModalOpen(false)} className="px-10 py-4 font-bold text-slate-500">{t('cancel')}</button>
                <button onClick={handleSend} className="px-12 py-4 bg-blue-600 text-white rounded-[2rem] font-bold shadow-2xl hover:bg-blue-700 transition-all flex items-center space-x-2">
                   <Send size={18} />
                   <span>立即发布</span>
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;
