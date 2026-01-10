
import React, { useState } from 'react';
import { User } from '../types';
import { useLanguage } from '../App';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Smartphone,
  Eye,
  EyeOff,
  User as UserIcon,
  CheckCircle2,
  // Added missing Loader2 icon import
  Loader2
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { lang, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSumbit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError(lang === 'zh' ? '请输入邮箱和密码' : 'Please enter email and password');
      return;
    }

    setIsSubmitting(true);
    // Mock authentication delay
    setTimeout(() => {
      const mockUser: User = {
        id: 'u1',
        name: '高级设计师 小陈',
        role: 'admin',
        email: email
      };
      onLogin(mockUser);
      setIsSubmitting(false);
    }, 1500);
  };

  const quickLogin = (role: 'admin' | 'designer' | 'sales') => {
    const roles: Record<string, string> = {
        admin: lang === 'zh' ? '系统管理员' : 'Administrator',
        designer: lang === 'zh' ? '资深设计师' : 'Lead Designer',
        sales: lang === 'zh' ? '销售经理' : 'Sales Manager'
    };
    onLogin({
      id: 'mock-' + role,
      name: roles[role],
      role: role as any,
      email: `${role}@smarthome.com`
    });
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden font-sans relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 p-8 z-10">
        {/* Branding Section */}
        <div className="hidden lg:flex flex-col justify-center space-y-10">
           <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-[1.5rem] flex items-center justify-center font-black text-white text-3xl shadow-2xl shadow-blue-500/20">S</div>
              <span className="text-4xl font-black text-white tracking-tighter">SmartPro</span>
           </div>
           <div className="space-y-6">
              <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
                {lang === 'zh' ? '重新定义' : 'Redefining'} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                  {lang === 'zh' ? '全屋智能设计' : 'Smart Home Design'}
                </span>
              </h1>
              <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">
                {lang === 'zh' ? '集成 AI 空间规划、供应链管理与工程交付，为智能家居服务商打造的一站式业务操作系统。' : 'Integrating AI spatial planning, supply chain management, and project delivery in one powerful OS.'}
              </p>
           </div>
           <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <ShieldCheck className="text-emerald-400" />, label: 'Secure Access' },
                { icon: <Sparkles className="text-amber-400" />, label: 'AI Powered' },
                { icon: <Smartphone className="text-blue-400" />, label: 'Cloud Sync' },
                { icon: <CheckCircle2 className="text-indigo-400" />, label: 'Professional' },
              ].map((f, i) => (
                <div key={i} className="flex items-center space-x-3 text-slate-400 font-bold text-sm">
                   {f.icon}
                   <span>{f.label}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Login Form */}
        <div className="flex flex-col items-center lg:items-end">
           {/* Fixed typo: changed max-md to max-w-md */}
           <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-10 lg:p-12 shadow-2xl relative">
              <div className="space-y-2 mb-10">
                 <h2 className="text-3xl font-black text-white tracking-tight">{lang === 'zh' ? '欢迎回来' : 'Welcome Back'}</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{lang === 'zh' ? '请登录您的 SmartPro 账号' : 'Enter your professional credentials'}</p>
              </div>

              <form onSubmit={handleSumbit} className="space-y-6">
                 <div className="space-y-2">
                    <div className="relative group">
                       <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                       <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white/5 border-2 border-white/5 focus:border-blue-500/50 rounded-2xl pl-14 pr-6 py-4 text-white font-bold outline-none transition-all placeholder:text-slate-600"
                        placeholder={lang === 'zh' ? '邮箱地址' : 'Email Address'}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <div className="relative group">
                       <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                       <input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/5 border-2 border-white/5 focus:border-blue-500/50 rounded-2xl pl-14 pr-14 py-4 text-white font-bold outline-none transition-all placeholder:text-slate-600"
                        placeholder={lang === 'zh' ? '访问密码' : 'Password'}
                       />
                       <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                       >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                       </button>
                    </div>
                 </div>

                 {error && <p className="text-red-400 text-xs font-bold text-center animate-bounce">{error}</p>}

                 <div className="flex items-center justify-between px-2">
                    <label className="flex items-center space-x-2 cursor-pointer group">
                       <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-white/5 checked:bg-blue-600 transition-all cursor-pointer" />
                       <span className="text-slate-500 text-xs font-bold group-hover:text-slate-300 transition-colors">{lang === 'zh' ? '记住我' : 'Remember me'}</span>
                    </label>
                    <button type="button" className="text-blue-400 text-xs font-bold hover:text-blue-300 transition-colors">{lang === 'zh' ? '忘记密码？' : 'Forgot Password?'}</button>
                 </div>

                 <button 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/30 hover:bg-blue-500 active:scale-95 transition-all flex items-center justify-center space-x-3"
                 >
                    {isSubmitting ? (
                      // Fixed: Loader2 is now correctly imported
                      <Loader2 className="animate-spin" size={24} />
                    ) : (
                      <>
                        <span>{lang === 'zh' ? '立即登入系统' : 'Sign In Now'}</span>
                        <ArrowRight size={22} />
                      </>
                    )}
                 </button>
              </form>

              <div className="mt-12 space-y-6">
                 <div className="flex items-center space-x-4">
                    <div className="flex-1 h-px bg-white/5" />
                    <span className="text-slate-600 text-[10px] font-black uppercase tracking-widest">{lang === 'zh' ? '快速测试通道' : 'Quick Access Channels'}</span>
                    <div className="flex-1 h-px bg-white/5" />
                 </div>
                 <div className="grid grid-cols-3 gap-3">
                    {['admin', 'designer', 'sales'].map(role => (
                       <button 
                        key={role}
                        onClick={() => quickLogin(role as any)}
                        className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl py-3 text-[10px] font-black text-slate-400 uppercase tracking-tighter hover:text-white transition-all flex flex-col items-center space-y-1"
                       >
                          <UserIcon size={14} className="mb-1" />
                          <span>{role}</span>
                       </button>
                    ))}
                 </div>
              </div>

              {/* Version Info */}
              <div className="mt-12 text-center">
                 <p className="text-slate-700 text-[9px] font-bold uppercase tracking-widest">SmartPro Designer v3.2.0-Alpha · Enterprise Suite</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
