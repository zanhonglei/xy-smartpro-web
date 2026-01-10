
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { VectorFloorPlanData, DevicePoint, Product } from '../types';
import { CATEGORY_ICONS } from '../constants';
import { Maximize2, ZoomIn, ZoomOut, MousePointer2, Box } from 'lucide-react';

interface ThreeDFloorPlanProps {
  data: VectorFloorPlanData;
  devices: DevicePoint[];
  products: Product[];
  onAddDevice?: (productId: string, x: number, y: number, roomName: string) => void;
}

const ThreeDFloorPlan: React.FC<ThreeDFloorPlanProps> = ({ data, devices, products, onAddDevice }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  useEffect(() => {
    if (!containerRef.current || !data || !data.raw_data) return;

    // Initialize Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    // Initialize Camera
    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 2000);
    camera.position.set(250, 400, 500);
    cameraRef.current = camera;

    // Initialize Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(300, 500, 200);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(2000, 2000);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid Helper
    const grid = new THREE.GridHelper(2000, 50, 0x334155, 0x334155);
    scene.add(grid);

    // Render Data
    renderBlueprint(data, scene);

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, [data]);

  useEffect(() => {
    if (!sceneRef.current || !data) return;
    // Clear old devices
    const deviceGroup = sceneRef.current.getObjectByName('deviceGroup');
    if (deviceGroup) sceneRef.current.remove(deviceGroup);

    const newGroup = new THREE.Group();
    newGroup.name = 'deviceGroup';

    devices.forEach(d => {
      const p = products.find(prod => prod.id === d.productId);
      const geo = new THREE.SphereGeometry(10);
      const mat = new THREE.MeshStandardMaterial({ 
        color: d.status === 'on' ? 0x3b82f6 : 0x64748b,
        emissive: d.status === 'on' ? 0x3b82f6 : 0x000000,
        emissiveIntensity: 0.5
      });
      const mesh = new THREE.Mesh(geo, mat);
      // Map SVG coordinates to Three.js space
      mesh.position.set(d.x - data.width / 2, 20, d.y - data.height / 2);
      newGroup.add(mesh);
    });

    sceneRef.current.add(newGroup);
  }, [devices, products, data]);

  const renderBlueprint = (blueprint: VectorFloorPlanData, scene: THREE.Scene) => {
    const wallHeight = 80;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8 });
    const windowMat = new THREE.MeshStandardMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.4 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24 });

    blueprint.raw_data.forEach(el => {
      const width = Math.abs(el.x2 - el.x1) || 5;
      const depth = Math.abs(el.y2 - el.y1) || 5;
      const x = (el.x1 + el.x2) / 2 - blueprint.width / 2;
      const z = (el.y1 + el.y2) / 2 - blueprint.height / 2;

      let geo, mat;
      if (el.class === 'wall') {
        geo = new THREE.BoxGeometry(width, wallHeight, depth);
        mat = wallMat;
      } else if (el.class === 'window') {
        geo = new THREE.BoxGeometry(width, wallHeight * 0.6, depth);
        mat = windowMat;
      } else {
        geo = new THREE.BoxGeometry(width, wallHeight * 0.9, depth);
        mat = doorMat;
      }

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, el.class === 'wall' ? wallHeight / 2 : (el.class === 'window' ? wallHeight * 0.5 : wallHeight * 0.45), z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });
  };

  if (!data || !data.raw_data) {
     return (
        <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-950">
           <p className="font-black uppercase tracking-widest text-xs animate-pulse">Initializing 3D Pipeline...</p>
        </div>
     );
  }

  return (
    <div className="relative w-full h-full group bg-slate-900 overflow-hidden rounded-[2.5rem] border-4 border-white/5">
       <div ref={containerRef} className="w-full h-full" />
       
       <div className="absolute top-8 left-8 z-10 flex flex-col space-y-4">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-3xl text-white shadow-2xl">
             <div className="flex items-center space-x-3 mb-1">
                <Box size={20} className="text-blue-500" />
                <h3 className="text-sm font-black tracking-tight uppercase">3D Neural View</h3>
             </div>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Real-time Extrusion Engine</p>
          </div>
       </div>

       <div className="absolute bottom-8 right-8 z-10 flex items-center bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl p-2 space-x-1">
          <button className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><MousePointer2 size={18} /></button>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <button className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><ZoomIn size={18} /></button>
          <button className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><ZoomOut size={18} /></button>
          <button className="p-3 text-white hover:bg-white/10 rounded-xl transition-all"><Maximize2 size={18} /></button>
       </div>
    </div>
  );
};

export default ThreeDFloorPlan;
