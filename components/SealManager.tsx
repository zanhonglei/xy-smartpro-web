
import React, { useState, useRef, useEffect } from 'react';
import { ElectronicSeal } from '../types';
import { useLanguage } from '../App';
import { Plus, Trash2, Shield, Download, RefreshCw, X, Check } from 'lucide-react';

interface SealManagerProps {
  seals: ElectronicSeal[];
  onUpdate: (seals: ElectronicSeal[]) => void;
}

const SealManager: React.FC<SealManagerProps> = ({ seals, onUpdate }) => {
  const { t, lang } = useLanguage();
  const [showGenerator, setShowGenerator] = useState(false);
  const [companyName, setCompanyName] = useState('某某智能科技有限公司');
  const [sealText, setSealText] = useState('业务专用章');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawSeal = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 300;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    // Draw outer circle
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 10, 0, Math.PI * 2);
    ctx.stroke();

    // Draw inner circle (thin)
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2 - 18, 0, Math.PI * 2);
    ctx.stroke();

    // Draw company name (Circular text)
    ctx.font = 'bold 28px "STSong", "SimSun", serif';
    ctx.fillStyle = '#ff0000';
    ctx.textAlign = 'center';
    
    const chars = companyName.split('');
    const angleRange = Math.PI * 1.5;
    const startAngle = Math.PI * 1.25;
    const step = angleRange / (chars.length - 1);

    chars.forEach((char, i) => {
      const angle = startAngle - (i * step);
      ctx.save();
      ctx.translate(size / 2 + Math.cos(angle) * (size / 2 - 45), size / 2 + Math.sin(angle) * (size / 2 - 45));
      ctx.rotate(angle + Math.PI / 2);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });

    // Draw center star
    ctx.font = '60px serif';
    ctx.fillText('★', size / 2, size / 2 + 20);

    // Draw seal type text (bottom straight)
    ctx.font = 'bold 24px "STSong", "SimSun", serif';
    ctx.fillText(sealText, size / 2, size / 2 + 80);
  };

  useEffect(() => {
    if (showGenerator) drawSeal();
  }, [showGenerator, companyName, sealText]);

  const handleSaveGenerated = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageUrl = canvas.toDataURL('image/png');
    const newSeal: ElectronicSeal = {
      id: Math.random().toString(36).substr(2, 9),
      name: companyName + '-' + sealText,
      imageUrl,
      createdAt: new Date().toISOString()
    };
    onUpdate([...seals, newSeal]);
    setShowGenerator(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      onUpdate(seals.filter(s => s.id !== id));
    }
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">{t('sealMgmt')}</h2>
          <p className="text-slate-500 font-medium">{lang === 'zh' ? '管理并在线生成具有法律效力的电子印章。' : 'Manage and generate legally valid electronic seals.'}</p>
        </div>
        <button 
          onClick={() => setShowGenerator(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all"
        >
          <Plus size={20} />
          <span>{t('generateSeal')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {seals.map(seal => (
          <div key={seal.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 group hover:shadow-xl transition-all flex flex-col items-center">
            <div className="w-40 h-40 flex items-center justify-center p-4 border rounded-2xl bg-slate-50 mb-4 overflow-hidden">
               <img src={seal.imageUrl} className="max-w-full max-h-full object-contain" alt={seal.name} />
            </div>
            <div className="text-center mb-6">
              <h3 className="font-bold text-slate-800">{seal.name}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{seal.createdAt.split('T')[0]}</p>
            </div>
            <div className="flex space-x-2 w-full">
               <button onClick={() => handleDelete(seal.id)} className="flex-1 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center space-x-2">
                 <Trash2 size={14} />
                 <span>{t('delete')}</span>
               </button>
            </div>
          </div>
        ))}
        {seals.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed rounded-[3rem] space-y-4">
             <Shield size={48} className="mx-auto text-slate-200" />
             <p className="text-slate-400 font-medium">{t('noSeals')}</p>
          </div>
        )}
      </div>

      {showGenerator && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col border">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Shield className="text-blue-600" size={24} />
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('generateSeal')}</h3>
              </div>
              <button onClick={() => setShowGenerator(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-200 transition-all">
                <X size={28} />
              </button>
            </div>
            <div className="flex-1 flex p-10 space-x-12">
              <div className="w-1/2 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border border-slate-100 p-8">
                <canvas ref={canvasRef} className="max-w-full" />
              </div>
              <div className="flex-1 space-y-8 py-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '单位名称 (需为全称)' : 'Company Full Name'}</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '印章用途' : 'Seal Purpose'}</label>
                  <input 
                    type="text" 
                    value={sealText}
                    onChange={e => setSealText(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all"
                  />
                </div>
                <div className="pt-8 border-t space-y-4">
                   <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                      <Shield className="text-amber-500 mt-1 shrink-0" size={16} />
                      <p className="text-xs text-amber-700 leading-relaxed font-medium">
                        {lang === 'zh' ? '注意：生成的印章仅供系统演示和内部流程使用，正式合同签署请确保符合当地电子签名法。' : 'Note: Generated seals are for system demo and internal workflows. Ensure compliance with local electronic signature laws for official signing.'}
                      </p>
                   </div>
                   <div className="flex space-x-3 pt-4">
                      <button onClick={() => setShowGenerator(false)} className="flex-1 py-4 font-bold text-slate-500 hover:bg-slate-100 rounded-2xl transition-all">{t('cancel')}</button>
                      <button onClick={handleSaveGenerated} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl flex items-center justify-center space-x-2">
                         <Check size={20} />
                         <span>{lang === 'zh' ? '确认并保存' : 'Confirm & Save'}</span>
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SealManager;
