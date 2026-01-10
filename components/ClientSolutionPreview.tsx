
import React, { useState, useMemo } from 'react';
import { Solution, Product, DevicePoint, VectorFloorPlanData, Room } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { 
  Box, Layout, ChevronLeft, MapPin, 
  Info, ShoppingCart, Share2, MessageCircle, 
  CheckCircle, ArrowRight, Maximize2, Zap, 
  Smartphone, ShieldCheck, User, AlertCircle
} from 'lucide-react';
import VectorFloorPlan from './VectorFloorPlan';
import ThreeDFloorPlan from './ThreeDFloorPlan';
import { useLanguage } from '../App';

interface ClientSolutionPreviewProps {
  solution: Solution;
  products: Product[];
  onClose: () => void;
}

const ClientSolutionPreview: React.FC<ClientSolutionPreviewProps> = ({ solution, products, onClose }) => {
  const { lang, t } = useLanguage();
  const [activeView, setActiveView] = useState<'2d' | '3d'>('3d');
  const [selectedRoom, setSelectedRoom] = useState<string | 'ALL'>('ALL');

  const roomDevices = useMemo(() => {
    if (selectedRoom === 'ALL') return solution.devices;
    return solution.devices.filter(d => d.roomName === selectedRoom);
  }, [solution.devices, selectedRoom]);

  const bom = useMemo(() => {
    const map = new Map<string, { product: Product, quantity: number }>();
    roomDevices.forEach(d => {
      const p = products.find(prod => prod.id === d.productId);
      if (p) {
        const existing = map.get(p.id) || { product: p, quantity: 0 };
        map.set(p.id, { ...existing, quantity: existing.quantity + 1 });
      }
    });
    return Array.from(map.values());
  }, [roomDevices, products]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col animate-in fade-in duration-500 overflow-hidden">
      {/* Premium Navigation Header */}
      <header className="h-20 bg-white border-b px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-6">
          <button 
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"
          >
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-tight">{solution.customerName} 的全屋智能方案</h1>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{solution.name} · {solution.area} m²</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border">
          <button 
            onClick={() => setActiveView('3d')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeView === '3d' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            <Box size={14} />
            <span>3D 沉浸预览</span>
          </button>
          <button 
            onClick={() => setActiveView('2d')}
            className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeView === '2d' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}
          >
            <Layout size={14} />
            <span>2D 布局点位</span>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all text-sm">
            <Smartphone size={16} />
            <span>保存至手机</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Visualization Area */}
        <div className="flex-1 relative bg-slate-900">
          <div className="absolute inset-0">
            {solution.vectorData ? (
              activeView === '3d' ? (
                <ThreeDFloorPlan 
                  data={solution.vectorData} 
                  devices={solution.devices} 
                  products={products} 
                />
              ) : (
                <VectorFloorPlan 
                  data={solution.vectorData}
                  devices={solution.devices}
                  products={products}
                  onAddDeviceAt={() => {}} // Read-only
                  onUpdateDevice={() => {}}
                  onMoveDevice={() => {}}
                  onRemoveDevice={() => {}}
                />
              )
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <img src={solution.floorPlanUrl} className="max-w-[80%] max-h-[80%] rounded-[2rem] shadow-2xl opacity-40 border-4 border-white/5" alt="Floor plan image fallback" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-4">
                    <AlertCircle size={48} className="text-blue-500" />
                    <p className="font-black uppercase tracking-widest text-sm">Legacy Plan View</p>
                    <p className="text-xs text-slate-400 max-w-xs text-center font-medium">该方案使用旧版户型图上传，暂不支持 3D 沉浸式预览。请联系设计师重新进行结构化识别。</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats Overlay */}
          <div className="absolute bottom-8 left-8 flex space-x-4">
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl text-white flex items-center space-x-4 shadow-2xl">
                <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center">
                   <ShieldCheck size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Security Level</p>
                   <p className="font-bold text-sm">High Reliability</p>
                </div>
             </div>
             <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-3xl text-white flex items-center space-x-4 shadow-2xl">
                <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center">
                   <Zap size={20} />
                </div>
                <div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Energy Saving</p>
                   <p className="font-bold text-sm">A++ Efficient</p>
                </div>
             </div>
          </div>
        </div>

        {/* Client Proposal Sidebar */}
        <div className="w-[420px] bg-white border-l flex flex-col z-10 shadow-2xl">
          <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
            {/* Header info */}
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                 <CheckCircle size={12} />
                 <span>方案已由 AI 与设计师双重审核</span>
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">智能生活蓝图</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                为您精心打造的专属智能空间，集成安防报警、全屋照明联动与环境智能调节，为您的家庭保驾护航。
              </p>
            </div>

            {/* Room Filter Tags */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">分区域方案</h4>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setSelectedRoom('ALL')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRoom === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  全屋
                </button>
                {solution.rooms.map(room => (
                  <button 
                    key={room.id}
                    onClick={() => setSelectedRoom(room.name)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedRoom === room.name ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                  >
                    {room.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Highlights */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex justify-between">
                <span>包含设备清单 ({roomDevices.length})</span>
                <span className="text-blue-500">查看完整配置</span>
              </h4>
              <div className="space-y-3">
                {bom.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:border-blue-200 transition-all">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border bg-white">
                        <img src={item.product.imageUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{item.product.brand} · x{item.quantity}</p>
                      </div>
                    </div>
                    <div className="p-2 text-slate-300 group-hover:text-blue-500 transition-colors">
                      <Info size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing & Call to Action */}
          <div className="p-8 bg-white border-t space-y-6">
             <div className="flex items-end justify-between">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">预计项目总值</p>
                   <div className="flex items-baseline space-x-1">
                      <span className="text-4xl font-black text-slate-900">${solution.totalPrice.toLocaleString()}</span>
                      <span className="text-xs font-bold text-slate-400">/ 包含施工</span>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-black text-green-500 uppercase tracking-widest mb-1">优惠活动已减免</p>
                   <p className="font-bold text-slate-800">-$2,400</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center space-x-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl">
                   <MessageCircle size={18} />
                   <span>预约到店咨询</span>
                </button>
                <button className="flex items-center justify-center space-x-2 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg">
                   <CheckCircle size={18} />
                   <span>接受设计方案</span>
                </button>
             </div>
             <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">方案有效期至: 2024-12-31</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSolutionPreview;
