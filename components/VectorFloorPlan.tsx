
import React, { useState, useRef, useEffect } from 'react';
import { VectorFloorPlanData, DevicePoint, Product } from '../types';
import { CATEGORY_ICONS } from '../constants';
// Fix: Added missing 'X' icon import from lucide-react
import { Trash2, Info, Power, ZoomIn, ZoomOut, Maximize, MousePointer2, X } from 'lucide-react';

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
         <p className="font-bold uppercase tracking-widest text-xs">Waiting for Vector Data...</p>
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
    
    // Check if clicking a device point instead of the map
    const target = e.target as HTMLElement;
    if (target.closest('.device-point')) return;

    const { x, y } = getSvgCoords(e.clientX, e.clientY);

    // Basic logic: determine room by coordinates
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

  const handleMouseUp = () => {
    setDraggingId(null);
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
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Controls Overlay */}
      <div className="absolute bottom-8 left-8 z-20 flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 space-x-2">
         <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><ZoomOut size={20}/></button>
         <button onClick={() => setZoom(1)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all font-black text-xs">{(zoom * 100).toFixed(0)}%</button>
         <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><ZoomIn size={20}/></button>
         <div className="w-px bg-white/10 mx-1" />
         <button onClick={() => setZoom(1)} className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><Maximize size={20}/></button>
      </div>

      <div 
        className="transition-transform duration-300 origin-center"
        style={{ transform: `scale(${zoom})` }}
      >
        <svg 
          ref={svgRef}
          width={data.width} 
          height={data.height} 
          viewBox={`0 0 ${data.width} ${data.height}`}
          onClick={handleSvgClick}
          className="bg-slate-800 shadow-2xl border-4 border-white/5 rounded-sm overflow-visible cursor-crosshair"
        >
          {/* Rooms */}
          {data.rooms.map((room, i) => (
            <g key={i}>
              <polygon 
                points={room.coordinates.map(p => p.join(',')).join(' ')} 
                className="fill-blue-500/5 stroke-blue-500/20 hover:fill-blue-500/10 transition-colors"
                strokeWidth="1"
              />
              <text 
                x={room.coordinates[0][0] + 10} 
                y={room.coordinates[0][1] + 25} 
                className="fill-white/20 text-[10px] font-black uppercase tracking-widest pointer-events-none select-none"
              >
                {room.room_type}
              </text>
            </g>
          ))}

          {/* Infrastructure */}
          {data.raw_data.map((el, i) => {
            const width = Math.abs(el.x2 - el.x1) || 2;
            const height = Math.abs(el.y2 - el.y1) || 2;
            const x = Math.min(el.x1, el.x2);
            const y = Math.min(el.y1, el.y2);
            
            let className = "";
            if (el.class === 'wall') className = "fill-slate-600";
            if (el.class === 'window') className = "fill-cyan-400 opacity-60";
            if (el.class === 'door') className = "fill-amber-400/80";

            return (
              <rect 
                key={i}
                x={x} y={y} width={width} height={height}
                className={className}
              />
            );
          })}

          {/* Device Points */}
          {devices.map(d => {
            const p = getProductById(d.productId);
            const isSelected = selectedPointId === d.id;
            const isDragging = draggingId === d.id;
            return (
              <g 
                key={d.id} 
                className={`device-point cursor-move ${isDragging ? 'pointer-events-none' : ''}`}
                onMouseDown={(e) => { 
                   e.stopPropagation(); 
                   setSelectedPointId(d.id); 
                   setDraggingId(d.id);
                }}
              >
                <circle 
                  cx={d.x} cy={d.y} r={isSelected ? 14 : 10}
                  className={`transition-all ${d.status === 'on' ? 'fill-blue-500 shadow-blue-500' : 'fill-slate-500'}`}
                  stroke="white"
                  strokeWidth="2"
                />
                <g transform={`translate(${d.x - 6}, ${d.y - 6}) scale(0.6)`} className="fill-white pointer-events-none">
                  {p ? (CATEGORY_ICONS as any)[p.category] : null}
                </g>
                
                {/* Tooltip on Hover */}
                {!isDragging && (
                   <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                     <rect x={d.x + 15} y={d.y - 25} width="120" height="40" rx="8" className="fill-slate-900/90" />
                     <text x={d.x + 25} y={d.y - 12} className="fill-white text-[10px] font-bold">{p?.name}</text>
                     <text x={d.x + 25} y={d.y + 2} className="fill-slate-400 text-[8px] uppercase">{d.roomName}</text>
                   </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Point Editor Overlay */}
      {selectedPointId && !draggingId && (
        <div className="absolute top-8 right-8 w-72 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] p-6 text-white shadow-2xl animate-in fade-in slide-in-from-right duration-300">
           {(() => {
              const d = devices.find(x => x.id === selectedPointId);
              const p = d ? getProductById(d.productId) : null;
              if (!d || !p) return null;
              return (
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm uppercase tracking-widest text-blue-400">点位编辑</h4>
                      <button onClick={() => setSelectedPointId(null)} className="text-white hover:text-slate-300 transition-colors">
                         <X size={18} />
                      </button>
                   </div>
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-blue-400 shadow-inner">
                        {(CATEGORY_ICONS as any)[p.category]}
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-sm leading-tight truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.brand}</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => onUpdateDevice(d.id, { status: d.status === 'on' ? 'off' : 'on' })}
                        className={`flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs transition-all ${d.status === 'on' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-white/5 text-slate-400 border border-white/5'}`}
                      >
                        <Power size={14} />
                        <span>{d.status === 'on' ? '开启' : '关闭'}</span>
                      </button>
                      <button 
                        onClick={() => { onRemoveDevice(d.id); setSelectedPointId(null); }}
                        className="flex items-center justify-center space-x-2 py-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-bold text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      >
                        <Trash2 size={14} />
                        <span>移除点位</span>
                      </button>
                   </div>
                   <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                      <span>X: {d.x.toFixed(0)}</span>
                      <span>Y: {d.y.toFixed(0)}</span>
                      <span className="text-blue-500 max-w-[100px] truncate">{d.roomName}</span>
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
