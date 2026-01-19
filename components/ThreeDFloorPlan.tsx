
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VectorFloorPlanData, DevicePoint, Product, DesignStyle } from '../types.ts';
import { CATEGORY_ICONS } from '../constants.tsx';
// Added ChevronRight to fix 'Cannot find name' error
import { Maximize2, ZoomIn, ZoomOut, Palette, Box, Lightbulb, Columns, ChevronRight } from 'lucide-react';

interface ThreeDFloorPlanProps {
  data: VectorFloorPlanData;
  devices: DevicePoint[];
  products: Product[];
  onUpdateDevice?: (id: string, updates: Partial<DevicePoint>) => void;
  onSelectDevice?: (id: string | null) => void;
  style?: DesignStyle;
}

const ThreeDFloorPlan: React.FC<ThreeDFloorPlanProps> = ({ 
  data, devices, products, onUpdateDevice, onSelectDevice, style = DesignStyle.MINIMALIST 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  const [labels, setLabels] = useState<{ id: string; x: number; y: number; text: string; value: string; color: string; type: string }[]>([]);
  const curtainMeshes = useRef<Map<string, { left: THREE.Mesh, right: THREE.Mesh }>>(new Map());

  // 精准材质配置：区分墙、门、窗
  const getMaterialConfig = () => {
    return {
      wall: {
        color: 0x334155,      // 深灰蓝
        roughness: 0.8,
        metalness: 0.1,
        transparent: false,
      },
      window: {
        color: 0x7dd3fc,      // 明亮天空蓝
        transparent: true,
        opacity: 0.5,
        transmission: 0.9,
        thickness: 0.5,
      },
      door: {
        color: 0x94a3b8,      // 浅冷灰色，区分于墙体
        roughness: 0.6,
        metalness: 0.2,
      },
      floor: {
        color: 0x0f172a,      // 极深色地板
        roughness: 0.5,
        metalness: 0.2,
      },
      edge: {
        color: 0xffffff,      // 白色轮廓线
        opacity: 0.3
      },
      curtain: {
        color: 0xfde047,
        emissive: 0x854d0e,
        emissiveIntensity: 0.2,
        side: THREE.DoubleSide
      }
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !data) return;

    let isMounted = true;
    let animationId: number;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0b); // 纯净深色背景
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(35, width / height, 1, 10000);
    camera.position.set(1600, 1400, 1600);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      logarithmicDepthBuffer: true
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.2;
    controlsRef.current = controls;

    // 优化光照：移除导致光斑的强光源，改用均匀的补光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
    scene.add(hemiLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 0.6);
    topLight.position.set(500, 2000, 500);
    topLight.castShadow = true;
    scene.add(topLight);

    const config = getMaterialConfig();

    // 绘制地面
    const floorGeo = new THREE.PlaneGeometry(8000, 8000);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: config.floor.color, 
      roughness: config.floor.roughness,
      metalness: config.floor.metalness
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);

    // 绘制建筑结构
    const wallMat = new THREE.MeshStandardMaterial(config.wall);
    const windowMat = new THREE.MeshPhysicalMaterial(config.window as any);
    const doorMat = new THREE.MeshStandardMaterial(config.door);
    const edgeMat = new THREE.LineBasicMaterial({ 
      color: config.edge.color, 
      transparent: true, 
      opacity: config.edge.opacity 
    });

    data.raw_data.forEach((el) => {
      const w = Math.abs(el.x2 - el.x1) || 5;
      const d = Math.abs(el.y2 - el.y1) || 5;
      const x = (el.x1 + el.x2) / 2 - data.width / 2;
      const z = (el.y1 + el.y2) / 2 - data.height / 2;
      
      let h = 160;
      let mat: THREE.Material = wallMat;
      let yOffset = h / 2;
      
      if (el.class === 'window') {
        h = 100;
        mat = windowMat;
        yOffset = 130; // 窗口悬浮在墙中段
      } else if (el.class === 'door') {
        h = 140;
        mat = doorMat;
        yOffset = h / 2;
      }

      const geo = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, yOffset, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);

      // 边缘描边
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, edgeMat);
      line.position.copy(mesh.position);
      scene.add(line);
    });

    // 窗帘动画引用
    const curtainMat = new THREE.MeshStandardMaterial(config.curtain);
    devices.forEach(device => {
      const p = products.find(prod => prod.id === device.productId);
      if (p?.category === '窗帘电机') {
        const cx = device.x - data.width / 2;
        const cz = device.y - data.height / 2;
        const h = 150;
        const totalW = 100;
        const leafGeo = new THREE.BoxGeometry(totalW / 2, h, 4);
        const leftLeaf = new THREE.Mesh(leafGeo, curtainMat);
        const rightLeaf = new THREE.Mesh(leafGeo, curtainMat);
        leftLeaf.position.set(cx - totalW / 4, h / 2 + 5, cz);
        rightLeaf.position.set(cx + totalW / 4, h / 2 + 5, cz);
        curtainMeshes.current.set(device.id, { left: leftLeaf, right: rightLeaf });
        scene.add(leftLeaf);
        scene.add(rightLeaf);
      }
    });

    const animate = () => {
      if (!isMounted) return;
      animationId = requestAnimationFrame(animate);
      
      if (controlsRef.current) controlsRef.current.update();
      
      if (cameraRef.current && rendererRef.current && sceneRef.current) {
        const newLabels = devices.map(d => {
          const p3d = new THREE.Vector3(d.x - data.width / 2, 220, d.y - data.height / 2);
          p3d.project(cameraRef.current!);
          
          const x = (p3d.x * 0.5 + 0.5) * container.clientWidth;
          const y = (-(p3d.y * 0.5) + 0.5) * container.clientHeight;
          
          const p = products.find(prod => prod.id === d.productId);
          const isCurtain = p?.category === '窗帘电机';
          
          if (isCurtain) {
             const meshes = curtainMeshes.current.get(d.id);
             if (meshes) {
                const targetOpenness = d.value !== undefined ? (100 - d.value) / 100 : (d.status === 'on' ? 0.1 : 1.0);
                meshes.left.scale.x += (targetOpenness - meshes.left.scale.x) * 0.1;
                meshes.right.scale.x += (targetOpenness - meshes.right.scale.x) * 0.1;
                const currentWidth = (100 / 2) * meshes.left.scale.x;
                meshes.left.position.x = (d.x - data.width / 2) - 50 + currentWidth / 2;
                meshes.right.position.x = (d.x - data.width / 2) + 50 - currentWidth / 2;
             }
          }

          return {
            id: d.id,
            x, y,
            text: isCurtain ? '智能窗帘' : (p?.name || '智能设备'),
            value: isCurtain ? `${d.value ?? (d.status === 'on' ? '100' : '0')}%` : (d.status === 'on' ? '已开启' : '已关闭'),
            color: (d.status === 'on' || (d.value && d.value > 0)) ? 'text-yellow-400' : 'text-slate-400',
            type: p?.category || 'default'
          };
        });
        setLabels(newLabels);
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    const handleResize = () => {
      if (!isMounted || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      window.removeEventListener('resize', handleResize);
      if (animationId) cancelAnimationFrame(animationId);
      if (rendererRef.current) rendererRef.current.dispose();
      if (container) container.innerHTML = '';
    };
  }, [data, devices, products, style]);

  return (
    <div className="relative w-full h-full bg-[#0a0a0b] overflow-hidden rounded-[2.5rem] border-4 border-[#1c1c1e] shadow-2xl">
      <div ref={containerRef} className="w-full h-full" />
      
      {/* 设备数字化标签 - 允许交互 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {labels.map(label => (
          <div 
            key={label.id}
            style={{ left: label.x, top: label.y, transform: 'translate(-50%, -100%)' }}
            className="absolute transition-all duration-75 pointer-events-auto cursor-pointer"
            onClick={() => onSelectDevice?.(label.id)}
          >
            <div className="flex items-center animate-in zoom-in fade-in duration-300 hover:scale-110 transition-transform group">
                <div className={`w-1 h-10 ${label.color.includes('yellow') ? 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' : 'bg-slate-600'} rounded-full transition-all group-hover:h-12`} />
                <div className="bg-black/60 backdrop-blur-lg px-5 py-3 min-w-[100px] rounded-r-2xl border border-white/10 shadow-2xl group-hover:bg-slate-900/80 transition-all">
                   <div className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-0.5">{label.text}</div>
                   <div className={`text-xs font-black ${label.color} flex items-center justify-between`}>
                      <span>{label.value}</span>
                      <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity ml-2" />
                   </div>
                </div>
            </div>
            <div className={`w-px h-16 bg-gradient-to-b ${label.color.includes('yellow') ? 'from-yellow-400/40' : 'from-slate-600/20'} to-transparent mx-auto mt-0.5`} />
          </div>
        ))}
      </div>

      <div className="absolute top-8 left-8 flex flex-col space-y-3">
         <div className="bg-black/40 backdrop-blur-2xl border border-white/5 px-6 py-4 rounded-3xl text-white shadow-2xl">
            <div className="flex items-center space-x-3 mb-1">
               <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]" />
               <h3 className="text-xs font-black tracking-tight uppercase">Smart Home Digital Twin</h3>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-80">Soft Ambient Occlusion · Real-time 3D</p>
         </div>
      </div>

      {/* 侧边功能按钮 */}
      <div className="absolute bottom-8 right-8 z-10 flex flex-col space-y-3">
          <div className="flex flex-col bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] p-1.5 shadow-2xl">
              <button className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"><ZoomIn size={18} /></button>
              <button className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"><ZoomOut size={18} /></button>
          </div>
          <button className="p-4 bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-600/30 hover:bg-blue-500 transition-all active:scale-95"><Maximize2 size={20} /></button>
      </div>

      {/* 底部导航 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center bg-black/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-2 shadow-2xl">
         {[
           { id: 'lighting', icon: <Lightbulb size={18} />, label: '智能灯光' },
           { id: 'curtain', icon: <Columns size={18} />, label: '遮阳系统' },
           { id: 'security', icon: <Box size={18} />, label: '安防设备' },
           { id: 'env', icon: <Palette size={18} />, label: '环境渲染' }
         ].map((tab, idx) => (
           <button key={tab.id} className={`flex flex-col items-center space-y-1.5 px-7 py-3 rounded-[2rem] transition-all group ${idx === 0 ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              <span className="group-hover:scale-110 transition-transform">{tab.icon}</span>
              <span className="text-[9px] font-black uppercase tracking-tighter">{tab.label}</span>
           </button>
         ))}
      </div>
    </div>
  );
};

export default ThreeDFloorPlan;
