
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VectorFloorPlanData, DevicePoint, Product, DesignStyle } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { Maximize2, ZoomIn, ZoomOut, MousePointer2, Box, Zap, Lightbulb, Info, Palette } from 'lucide-react';

interface ThreeDFloorPlanProps {
  data: VectorFloorPlanData;
  devices: DevicePoint[];
  products: Product[];
  onUpdateDevice?: (id: string, updates: Partial<DevicePoint>) => void;
  style?: DesignStyle;
}

const ThreeDFloorPlan: React.FC<ThreeDFloorPlanProps> = ({ 
  data, devices, products, onUpdateDevice, style = DesignStyle.MINIMALIST 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  // Dynamic objects tracking
  const roomLights = useRef<Map<string, THREE.PointLight>>(new Map());
  const roomGlows = useRef<Map<string, THREE.Mesh>>(new Map());
  const curtains = useRef<Map<string, THREE.Group>>(new Map());
  const deviceMeshes = useRef<Map<string, THREE.Mesh>>(new Map());

  // --- Style Configs ---
  const styleConfigs: Record<DesignStyle, any> = {
    [DesignStyle.FRENCH]: {
      wallColor: 0xfefce8, // Cream
      floorColor: 0xf8fafc, // Marble look
      lightColor: 0xfef08a, // Warm Yellow
      furnitureColor: 0xe2e8f0,
      accentColor: 0xca8a04, // Gold
      roughness: 0.1,
    },
    [DesignStyle.MINIMALIST]: {
      wallColor: 0xffffff,
      floorColor: 0x64748b, // Concrete
      lightColor: 0xffffff, // Daylight
      furnitureColor: 0x1e293b,
      accentColor: 0x3b82f6,
      roughness: 0.7,
    },
    [DesignStyle.WOOD]: {
      wallColor: 0xfafaf9,
      floorColor: 0x78350f, // Wood
      lightColor: 0xffedd5, // Soft Warm
      furnitureColor: 0xd6d3d1,
      accentColor: 0x166534, // Green
      roughness: 0.5,
    },
    [DesignStyle.INDUSTRIAL]: {
      wallColor: 0x475569,
      floorColor: 0x0f172a,
      lightColor: 0xef4444, // Atmospheric Red/Orange
      furnitureColor: 0x000000,
      accentColor: 0x94a3b8,
      roughness: 0.8,
    }
  };

  useEffect(() => {
    if (!containerRef.current || !data || !data.raw_data) return;

    const config = styleConfigs[style];
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(style === DesignStyle.INDUSTRIAL ? 0x020617 : 0x0f172a); 
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 10000);
    camera.position.set(800, 1000, 800);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, logarithmicDepthBuffer: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.1;
    controlsRef.current = controls;

    // --- High End Lighting ---
    const ambientLight = new THREE.AmbientLight(config.lightColor, 0.4);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(500, 1000, 500);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    // --- Ground ---
    const floorGeo = new THREE.PlaneGeometry(5000, 5000);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: config.floorColor, 
      roughness: config.roughness, 
      metalness: style === DesignStyle.FRENCH ? 0.4 : 0.1 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // --- Blueprint Rendering ---
    renderFullScene(data, scene, config);

    const onClick = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.current.setFromCamera(mouse.current, cameraRef.current);
      const intersects = raycaster.current.intersectObjects(sceneRef.current.children, true);
      const deviceObj = intersects.find(i => i.object.userData.type === 'device');
      if (deviceObj && onUpdateDevice) {
        const { id, status } = deviceObj.object.userData;
        onUpdateDevice(id, { status: status === 'on' ? 'off' : 'on' });
      }
    };
    containerRef.current.addEventListener('click', onClick);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      containerRef.current?.removeEventListener('click', onClick);
      renderer.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, [data, style]);

  const renderFullScene = (blueprint: VectorFloorPlanData, scene: THREE.Scene, config: any) => {
    const wallHeight = 90;
    const wallMat = new THREE.MeshStandardMaterial({ color: config.wallColor, roughness: 0.9 });
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 });
    const doorMat = new THREE.MeshStandardMaterial({ color: config.furnitureColor, roughness: 0.5 });

    // Walls
    blueprint.raw_data.forEach(el => {
      const w = Math.abs(el.x2 - el.x1) || 5;
      const d = Math.abs(el.y2 - el.y1) || 5;
      const x = (el.x1 + el.x2) / 2 - blueprint.width / 2;
      const z = (el.y1 + el.y2) / 2 - blueprint.height / 2;

      let geo, mat, h = wallHeight, yPos = wallHeight / 2;
      if (el.class === 'wall') {
        geo = new THREE.BoxGeometry(w, h, d);
        mat = wallMat;
      } else if (el.class === 'window') {
        h = wallHeight * 0.7;
        yPos = wallHeight * 0.55;
        geo = new THREE.BoxGeometry(w, h, d);
        mat = windowMat;
      } else {
        h = wallHeight * 0.9;
        yPos = h / 2;
        geo = new THREE.BoxGeometry(w, h, d);
        mat = doorMat;
      }
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, yPos, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    // Auto-Furniture
    blueprint.rooms.forEach(room => {
       const coords = room.coordinates;
       const cx = coords.reduce((a, c) => a + c[0], 0) / coords.length - blueprint.width / 2;
       const cz = coords.reduce((a, c) => a + c[1], 0) / coords.length - blueprint.height / 2;
       const furnitureGroup = new THREE.Group();
       furnitureGroup.position.set(cx, 0, cz);

       if (room.room_type.includes('living')) {
          // Sofa
          const sofa = new THREE.Mesh(new THREE.BoxGeometry(80, 25, 40), new THREE.MeshStandardMaterial({ color: config.furnitureColor }));
          sofa.position.y = 12.5;
          // Coffee Table
          const table = new THREE.Mesh(new THREE.BoxGeometry(40, 15, 40), new THREE.MeshStandardMaterial({ color: config.accentColor, roughness: 0.2 }));
          table.position.set(0, 7.5, 50);
          furnitureGroup.add(sofa, table);
       } else if (room.room_type.includes('bedroom')) {
          // Bed
          const bed = new THREE.Mesh(new THREE.BoxGeometry(70, 20, 100), new THREE.MeshStandardMaterial({ color: config.furnitureColor }));
          bed.position.y = 10;
          furnitureGroup.add(bed);
       }
       scene.add(furnitureGroup);
    });
  };

  useEffect(() => {
    if (!sceneRef.current || !data) return;
    const config = styleConfigs[style];

    // Devices & Lights Reactive Sync
    devices.forEach(d => {
      let mesh = deviceMeshes.current.get(d.id);
      if (!mesh) {
        const geo = new THREE.CylinderGeometry(8, 8, 4, 32);
        const mat = new THREE.MeshStandardMaterial({ 
          color: d.status === 'on' ? config.accentColor : 0x475569,
          emissive: d.status === 'on' ? config.accentColor : 0x000000,
          emissiveIntensity: 1
        });
        mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(d.x - data.width / 2, 85, d.y - data.height / 2);
        mesh.userData = { type: 'device', id: d.id, status: d.status };
        sceneRef.current?.add(mesh);
        deviceMeshes.current.set(d.id, mesh);
      } else {
        (mesh.material as THREE.MeshStandardMaterial).color.set(d.status === 'on' ? config.accentColor : 0x475569);
        (mesh.material as THREE.MeshStandardMaterial).emissive.set(d.status === 'on' ? config.accentColor : 0x000000);
        mesh.userData.status = d.status;
      }
    });

    data.rooms.forEach(room => {
      const roomName = room.room_type;
      const isLit = devices.some(d => {
        const p = products.find(prod => prod.id === d.productId);
        return d.roomName === roomName && p?.category === '智能开关' && d.status === 'on';
      });

      let light = roomLights.current.get(roomName);
      if (!light) {
        const coords = room.coordinates;
        const cx = coords.reduce((a, c) => a + c[0], 0) / coords.length - data.width / 2;
        const cz = coords.reduce((a, c) => a + c[1], 0) / coords.length - data.height / 2;
        light = new THREE.PointLight(config.lightColor, 0, 450, 1);
        light.position.set(cx, 75, cz);
        light.castShadow = true;
        sceneRef.current?.add(light);
        roomLights.current.set(roomName, light);
      }
      light.intensity = isLit ? 3.5 : 0;
    });
  }, [devices, data, style]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden rounded-[2.5rem] border-4 border-white/5">
       <div ref={containerRef} className="w-full h-full" />
       
       <div className="absolute top-8 left-8 z-10 flex flex-col space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl text-white shadow-2xl">
             <div className="flex items-center space-x-3 mb-2">
                <Palette size={20} className="text-blue-400" />
                <h3 className="text-sm font-black tracking-tight uppercase">当前风格: {style}</h3>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center space-x-2">
                   <Box size={10} /> <span>自动填充简约家私</span>
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center space-x-2">
                   <Lightbulb size={10} /> <span>动态材质神经渲染</span>
                </p>
             </div>
          </div>
       </div>

       <div className="absolute bottom-8 right-8 z-10 flex items-center bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 space-x-1">
          <button className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><ZoomIn size={18} /></button>
          <button className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><ZoomOut size={18} /></button>
          <button className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><Maximize2 size={18} /></button>
       </div>
    </div>
  );
};

export default ThreeDFloorPlan;
