
import React, { useState, useRef, useEffect } from 'react';
import { VectorFloorPlanData, DevicePoint, Product } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { Trash2, Info, Power, ZoomIn, ZoomOut, Maximize, MousePointer2, X, Columns, Sliders } from 'lucide-react';

interface VectorFloorPlanProps {
  data: VectorFloorPlanData;
  devices: DevicePoint[];
  products: Product[];
  onAddDeviceAt: (x: number, y: number, roomName: string) => void;
  onUpdateDevice: (id: string, updates: Partial<DevicePoint>) => void;
  onMoveDevice: (id: string, x: number, y: number) => void;
  onRemoveDevice: (id: string) => void;
}

const VectorFloorPlan: React.FC<VectorFloorPlanProps> = ({ 
  data, devices, products, onAddDeviceAt, onUpdateDevice, onMoveDevice, onRemoveDevice 
}) => {
  const [zoom, setZoom] = useState(1);
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Defensive check for data
  if (!data || !data.raw_data) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900">
         <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto animate-pulse">
               <Info size={24} />
            </div>
            <p className="font-bold uppercase tracking-widest text-[10px]">Waiting for Vector Data...</p>
         </div>
      </div>
    );
  }

  const getProductById = (id: string) => products.find(p => p.id === id);

  const getSvgCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const transformed = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const target = e.target as HTMLElement;
    if (target.closest('.device-point')) return;
    const { x, y } = getSvgCoords(e.clientX, e.clientY);
    const room = data.rooms.find(r => isPointInPoly([x, y], r.coordinates));
    const roomName = room ? room.room_type : 'Unknown';
    onAddDeviceAt(x, y, roomName);
    setSelectedPointId(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;
    const { x, y } = getSvgCoords(e.clientX, e.clientY);
    onMoveDevice(draggingId, x, y);
  };

  const isPointInPoly = (point: number[], vs: number[][]) => {
    const x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        const xi = vs[i][0], yi = vs[i][1];
        const xj = vs[j][0], yj = vs[j][1];
        const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
  };

  return (
    <div 
      className="relative w-full h-full bg-slate-900 overflow-hidden flex items-center justify-center p-8 select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={() => setDraggingId(null)}
      onMouseLeave={() => setDraggingId(null)}
    >
      <div className="absolute bottom-8 left-8 z-20 flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 space-x-2">
         <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><ZoomOut size={20}/></button>
         <button onClick={() => setZoom(1)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all font-black text-xs">{(zoom * 100).toFixed(0)}%</button>
         <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><ZoomIn size={20}/></button>
         <div className="w-px bg-white/10 mx-1" />
         <button onClick={() => setZoom(1)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><Maximize size={20}/></button>
      </div>

      <div className="transition-transform duration-300 origin-center" style={{ transform: `scale(${zoom})` }}>
        <svg 
          ref={svgRef}
          width={data.width} 
          height={data.height} 
          viewBox={`0 0 ${data.width} ${data.height}`}
          onClick={handleSvgClick}
          className="bg-slate-800 shadow-2xl border-4 border-white/5 rounded-sm cursor-crosshair overflow-visible"
        >
          {data.rooms.map((room, i) => (
            <g key={i}>
              <polygon points={room.coordinates.map(p => p.join(',')).join(' ')} className="fill-blue-500/5 stroke-blue-500/20" strokeWidth="1" />
              <text x={room.coordinates[0][0] + 10} y={room.coordinates[0][1] + 25} className="fill-white/20 text-[10px] font-black uppercase tracking-widest pointer-events-none">{room.room_type}</text>
            </g>
          ))}
          {data.raw_data.map((el, i) => {
            const width = Math.abs(el.x2 - el.x1) || 2;
            const height = Math.abs(el.y2 - el.y1) || 2;
            const x = Math.min(el.x1, el.x2);
            const y = Math.min(el.y1, el.y2);
            let className = el.class === 'wall' ? "fill-slate-600" : el.class === 'window' ? "fill-cyan-400 opacity-60" : "fill-amber-400/80";
            return <rect key={i} x={x} y={y} width={width} height={height} className={className} />;
          })}
          {devices.map(d => {
            const p = getProductById(d.productId);
            const isSelected = selectedPointId === d.id;
            const isCurtain = p?.category === '窗帘电机';
            return (
              <g key={d.id} className="device-point cursor-move" onMouseDown={(e) => { e.stopPropagation(); setSelectedPointId(d.id); setDraggingId(d.id); }}>
                <circle cx={d.x} cy={d.y} r={isSelected ? 14 : 10} className={`transition-all ${ (d.status === 'on' || (d.value && d.value > 0)) ? 'fill-yellow-400' : 'fill-slate-50'}`} stroke="white" strokeWidth="2" />
                <g transform={`translate(${d.x - 6}, ${d.y - 6}) scale(0.6)`} className="fill-slate-900 pointer-events-none">{(CATEGORY_ICONS as any)[p?.category || '']} </g>
              </g>
            );
          })}
        </svg>
      </div>

      {selectedPointId && (
        <div className="absolute top-8 right-8 w-80 bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 text-white shadow-2xl animate-in fade-in slide-in-from-right duration-300">
           {(() => {
              const d = devices.find(x => x.id === selectedPointId);
              const p = d ? getProductById(d.productId) : null;
              if (!d || !p) return null;
              const isCurtain = p.category === '窗帘电机';

              return (
                <div className="space-y-8">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">{(CATEGORY_ICONS as any)[p.category]}</div>
                         <h4 className="font-black text-sm uppercase tracking-widest text-white">设备调试</h4>
                      </div>
                      <button onClick={() => setSelectedPointId(null)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                   </div>
                   
                   <div className="space-y-1">
                      <p className="font-black text-lg leading-tight truncate">{p.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{p.brand} · {d.roomName}</p>
                   </div>

                   {isCurtain ? (
                      <div className="space-y-6">
                         <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400">
                               <span>开合比例</span>
                               <span className="text-yellow-400">{d.value ?? 0}%</span>
                            </div>
                            <input 
                               type="range" min="0" max="100" 
                               value={d.value ?? 0}
                               onChange={(e) => onUpdateDevice(d.id, { value: Number(e.target.value), status: Number(e.target.value) > 0 ? 'on' : 'off' })}
                               className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => onUpdateDevice(d.id, { value: 0, status: 'off' })} className="py-3 bg-white/5 border border-white/5 rounded-2xl font-black text-[10px] uppercase hover:bg-white/10 transition-all">全开 (0%)</button>
                            <button onClick={() => onUpdateDevice(d.id, { value: 100, status: 'on' })} className="py-3 bg-yellow-400 text-slate-900 rounded-2xl font-black text-[10px] uppercase hover:bg-yellow-300 transition-all">全闭 (100%)</button>
                         </div>
                      </div>
                   ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => onUpdateDevice(d.id, { status: d.status === 'on' ? 'off' : 'on' })} className={`flex items-center justify-center space-x-2 py-4 rounded-2xl font-black text-xs transition-all ${d.status === 'on' ? 'bg-green-500 shadow-lg shadow-green-500/20' : 'bg-white/5 border border-white/5 text-slate-400'}`}>
                          <Power size={14} /> <span>{d.status === 'on' ? '开启' : '关闭'}</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 py-4 bg-white/5 border border-white/5 rounded-2xl font-black text-xs text-slate-400 hover:text-white transition-all">
                           <Sliders size={14} /> <span>详情</span>
                        </button>
                      </div>
                   )}

                   <div className="pt-6 border-t border-white/5 flex justify-center">
                      <button onClick={() => { onRemoveDevice(d.id); setSelectedPointId(null); }} className="text-red-400/60 hover:text-red-400 font-bold text-[10px] uppercase tracking-widest flex items-center space-x-2 transition-all">
                        <Trash2 size={12} /> <span>从方案中移除</span>
                      </button>
                   </div>
                </div>
              );
           })()}
        </div>
      )}
    </div>
  );
};

export default VectorFloorPlan;
