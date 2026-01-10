
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, DevicePoint, Room, Solution, VectorFloorPlanData, SmartBrand, DesignMode, SolutionTemplate } from '../types';
import { CATEGORY_ICONS, SMART_BRANDS, MOCK_TEMPLATES } from '../constants';
import { 
  Plus, Save, Sparkles, Loader2, X, ChevronRight, ChevronLeft, 
  Trash2, Layers, Search, Cpu, Box, Layout, 
  List, Share2, Eye, Info, CheckCircle2, ShoppingCart, 
  DollarSign, Zap, HardDrive, MousePointer2, Grid, Filter, Check
} from 'lucide-react';
import { generateSpatialSolution } from '../geminiService';
import { useLanguage } from '../App';
import VectorFloorPlan from './VectorFloorPlan';
import ThreeDFloorPlan from './ThreeDFloorPlan';

interface DesignerProps {
  products: Product[];
  initialSolution?: Solution | null;
  onSave: (devices: DevicePoint[], rooms: Room[], originalId?: string, vectorData?: VectorFloorPlanData) => void;
}

type Step = 'brand' | 'mode' | 'template-select' | 'upload' | 'design';

const MOCK_ALGO_DATA: VectorFloorPlanData = {"height":375,"raw_data":[{"class":"wall","x1":120,"x2":126,"y1":221,"y2":307},{"class":"window","x1":224,"x2":260,"y1":39,"y2":45},{"class":"wall","x1":120,"x2":171,"y1":221,"y2":227},{"class":"wall","x1":351,"x2":357,"y1":52,"y2":144},{"class":"wall","x1":152,"x2":200,"y1":43,"y2":49},{"class":"wall","x1":152,"x2":158,"y1":43,"y2":144},{"class":"wall","x1":373,"x2":379,"y1":140,"y2":319},{"class":"wall","x1":280,"x2":357,"y1":52,"y2":58},{"class":"wall","x1":198,"x2":284,"y1":38,"y2":44},{"class":"window","x1":151,"x2":190,"y1":314,"y2":320},{"class":"window","x1":175,"x2":193,"y1":43,"y2":49},{"class":"window","x1":302,"x2":338,"y1":53,"y2":59},{"class":"wall","x1":291,"x2":297,"y1":175,"y2":304},{"class":"window","x1":219,"x2":275,"y1":331,"y2":336},{"class":"wall","x1":198,"x2":296,"y1":331,"y2":336},{"class":"window","x1":325,"x2":364,"y1":314,"y2":320},{"class":"wall","x1":139,"x2":202,"y1":314,"y2":319},{"class":"wall","x1":120,"x2":145,"y1":301,"y2":307},{"class":"wall","x1":319,"x2":379,"y1":313,"y2":319},{"class":"wall","x1":198,"x2":203,"y1":184,"y2":303},{"class":"wall","x1":323,"x2":378,"y1":208,"y2":212},{"class":"door","x1":301,"x2":321,"y1":141,"y2":145},{"class":"wall","x1":319,"x2":325,"y1":301,"y2":319},{"class":"wall","x1":153,"x2":201,"y1":92,"y2":96},{"class":"wall","x1":199,"x2":284,"y1":85,"y2":88},{"class":"wall","x1":139,"x2":146,"y1":301,"y2":319},{"class":"door","x1":166,"x2":171,"y1":148,"y2":172},{"class":"wall","x1":197,"x2":203,"y1":314,"y2":335},{"class":"wall","x1":166,"x2":202,"y1":184,"y2":188},{"class":"wall","x1":293,"x2":325,"y1":301,"y2":307},{"class":"wall","x1":279,"x2":285,"y1":38,"y2":57},{"class":"wall","x1":152,"x2":173,"y1":140,"y2":145},{"class":"wall","x1":291,"x2":297,"y1":303,"y2":335},{"class":"door","x1":176,"x2":195,"y1":93,"y2":96},{"class":"wall","x1":292,"x2":326,"y1":174,"y2":178},{"class":"wall","x1":166,"x2":171,"y1":141,"y2":227},{"class":"door","x1":198,"x2":202,"y1":191,"y2":211},{"class":"door","x1":222,"x2":260,"y1":85,"y2":89},{"class":"window","x1":359,"x2":372,"y1":140,"y2":146},{"class":"wall","x1":171,"x2":203,"y1":140,"y2":144},{"class":"wall","x1":198,"x2":203,"y1":40,"y2":144},{"class":"wall","x1":280,"x2":378,"y1":140,"y2":145},{"class":"door","x1":300,"x2":320,"y1":175,"y2":178},{"class":"door","x1":323,"x2":326,"y1":186,"y2":205},{"class":"wall","x1":280,"x2":285,"y1":54,"y2":144},{"class":"wall","x1":323,"x2":326,"y1":141,"y2":211},{"class":"door","x1":176,"x2":195,"y1":140,"y2":145},{"class":"wall","x1":199,"x2":294,"y1":301,"y2":304},{"class":"door","x1":221,"x2":274,"y1":301,"y2":305},{"class":"wall","x1":197,"x2":203,"y1":38,"y2":48},{"class":"wall","x1":197,"x2":202,"y1":302,"y2":318},{"class":"wall","x1":166,"x2":171,"y1":186,"y2":227},{"class":"wall","x1":279,"x2":285,"y1":86,"y2":144},{"class":"wall","x1":323,"x2":326,"y1":176,"y2":211},{"class":"wall","x1":322,"x2":326,"y1":140,"y2":176},{"class":"wall","x1":197,"x2":203,"y1":40,"y2":89},{"class":"wall","x1":198,"x2":202,"y1":90,"y2":144},{"class":"wall","x1":286,"x2":296,"y1":326,"y2":335},{"class":"wall","x1":280,"x2":323,"y1":140,"y2":145},{"class":"wall","x1":356,"x2":380,"y1":140,"y2":145}],"rooms":[{"coordinates":[[203.12204957008362,314.06646966934204],[202.77294516563416,314.06646966934204],[202.77294516563416,304.9187734723091],[221.08539938926697,304.9187734723091],[221.08539938926697,305.6059554219246],[274.347186088562,305.6059554219246],[274.347186088562,304.9187734723091],[291.7448580265045,304.9187734723091],[291.7448580265045,326.3181522488594],[286.6155803203583,326.3181522488594],[286.6155803203583,331.32851868867874],[203.12204957008362,331.32851868867874],[203.12204957008362,314.06646966934204]],"room_type":"unknown"},{"coordinates":[[197.98079133033752,302.4643510580063],[197.98079133033752,314.0307068824768],[146.185502409935,314.0307068824768],[146.185502409935,301.991231739521],[145.2363282442093,301.991231739521],[145.2363282442093,301.69375240802765],[126.02700293064117,301.69375240802765],[126.02700293064117,227.89815813302994],[171.43341898918152,227.89815813302994],[171.43341898918152,227.69667953252792],[171.95779085159302,227.69667953252792],[171.95779085159302,188.18116933107376],[198.13188910484314,188.18116933107376],[198.13188910484314,302.4643510580063],[197.98079133033752,302.4643510580063]],"room_type":"bathroom"},{"coordinates":[[202.4936079978943,184.5427080988884],[171.7366725206375,184.5427080988884],[171.7366725206375,145.29375359416008],[173.2337325811386,145.29375359416008],[173.2337325811386,144.93708685040474],[176.71668529510498,144.93708685040474],[176.71668529510498,145.46233043074608],[195.2841281890869,145.46233043074608],[195.2841281890869,144.93708685040474],[203.2800167798996,144.93708685040474],[203.2800167798996,140.3622217476368],[203.05697619915009,140.3622217476368],[203.05697619915009,88.75740878283978],[222.97723591327667,88.75740878283978],[222.97723591327667,89.38700705766678],[260.5161666870117,89.38700705766678],[260.5161666870117,88.75740878283978],[279.9920439720154,88.75740878283978],[279.9920439720154,144.96711641550064],[280.06526827812195,144.96711641550064],[280.06526827812195,144.97869461774826],[280.25537729263306,144.97869461774826],[280.25537729263306,145.27864381670952],[280.35759925842285,145.27864381670952],[280.35759925842285,145.4024389386177],[301.08073353767395,145.4024389386177],[301.08073353767395,145.97131311893463],[321.1647570133209,145.97131311893463],[321.1647570133209,145.4024389386177],[322.9120969772339,145.4024389386177],[322.9120969772339,174.98844489455223],[292.42146015167236,174.98844489455223],[292.42146015167236,175.21190643310547],[291.9705808162689,175.21190643310547],[291.9705808162689,301.434762775898],[203.0048370361328,301.434762775898],[203.0048370361328,184.99374389648438],[202.4936079978943,184.99374389648438],[202.4936079978943,184.5427080988884]],"room_type":"livingroom"},{"coordinates":[[285.1898968219757,58.58597718179226],[302.22997069358826,58.58597718179226],[302.22997069358826,59.194715693593025],[338.35068345069885,59.194715693593025],[338.35068345069885,58.58597718179226],[351.7859876155853,58.58597718179226],[351.7859876155853,140.43182507157326],[285.1898968219757,140.43182507157326],[285.1898968219757,58.58597718179226]],"room_type":"bedroom"},{"coordinates":[[173.2337325811386,140.1991881430149],[158.67620706558228,140.1991881430149],[158.67620706558228,96.18626162409782],[176.4385551214218,96.18626162409782],[176.4385551214218,96.90185263752937],[195.20045816898346,96.90185263752937],[195.20045816898346,96.18626162409782],[198.12588393688202,96.18626162409782],[198.12588393688202,140.3622217476368],[173.2337325811386,140.3622217476368],[173.2337325811386,140.1991881430149]],"room_type":"kitchen"},{"coordinates":[[158.67620706558228,49.09615404903889],[175.99010467529297,49.09615404903889],[175.99010467529297,49.60888624191284],[193.60235333442688,49.60888624191284],[193.60235333442688,49.09615404903889],[197.91953265666962,49.09615404903889],[197.91953265666962,89.4317552447319],[198.12588393688202,89.4317552447319],[198.12588393688202,92.68450364470482],[158.67620706558228,92.68450364470482],[158.67620706558228,49.09615404903889]],"room_type":"bathroom"},{"coordinates":[[260.3864073753357,45.089179649949074],[260.3864073753357,44.519112445414066],[279.8866927623749,44.519112445414066],[279.8866927623749,57.747574523091316],[280.06526827812195,57.747574523091316],[280.06526827812195,85.38799546658993],[203.05697619915009,85.38799546658993],[203.05697619915009,48.21077920496464],[203.2465934753418,48.21077920496464],[203.2465934753418,44.519112445414066],[224.98659789562225,44.519112445414066],[224.98659789562225,45.089179649949074],[260.3864073753357,45.089179649949074]],"room_type":"kitchen"},{"coordinates":[[300.31707882881165,178.21073904633522],[300.31707882881165,178.77233773469925],[320.46034932136536,178.77233773469925],[320.46034932136536,178.21073904633522],[323.05583357810974,178.21073904633522],[323.05583357810974,211.72647178173065],[323.22609424591064,211.72647178173065],[323.22609424591064,211.8617668747902],[323.347806930542,211.8617668747902],[323.347806930542,212.16606348752975],[373.71447682380676,212.16606348752975],[373.71447682380676,313.84601444005966],[325.6606161594391,313.84601444005966],[325.6606161594391,301.74531787633896],[325.0075578689575,301.74531787633896],[325.0075578689575,301.6457185149193],[297.004371881485,301.6457185149193],[297.004371881485,178.21073904633522],[300.31707882881165,178.21073904633522]],"room_type":"bedroom"},{"coordinates":[[356.3075065612793,145.39451524615288],[359.8985970020294,145.39451524615288],[359.8985970020294,146.0210233926773],[372.2458779811859,146.0210233926773],[372.2458779811859,145.39451524615288],[373.71447682380676,145.39451524615288],[373.71447682380676,208.62434059381485],[326.63583755493164,208.62434059381485],[326.63583755493164,205.16272634267807],[326.66099071502686,205.16272634267807],[326.66099071502686,186.74718216061592],[326.63583755493164,186.74718216061592],[326.63583755493164,176.8455058336258],[326.6850709915161,176.8455058336258],[326.6850709915161,145.27864381670952],[356.3075065612793,145.27864381670952],[356.3075065612793,145.39451524615288]],"room_type":"bathroom"}],"unit":4.5,"width":500};

const FloorPlanDesigner: React.FC<DesignerProps> = ({ products, onSave, initialSolution }) => {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState<Step>(initialSolution ? 'design' : 'brand');
  const [activeView, setActiveView] = useState<'2d' | '3d'>('3d');
  
  // Design Context
  const [selectedBrand, setSelectedBrand] = useState<SmartBrand | null>(initialSolution?.smartBrand || null);
  const [designMode, setDesignMode] = useState<DesignMode | null>(initialSolution?.designMode || null);
  const [selectedTemplate, setSelectedTemplate] = useState<SolutionTemplate | null>(null);
  
  // Sidebar State
  const [sidebarTab, setSidebarTab] = useState<'library' | 'bom'>('library');
  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [activePlacementProduct, setActivePlacementProduct] = useState<string | null>(null);

  // Design State
  const [floorPlan, setFloorPlan] = useState<string | null>(initialSolution?.floorPlanUrl || null);
  const [vectorData, setVectorData] = useState<VectorFloorPlanData | null>(initialSolution?.vectorData || null);
  const [devices, setDevices] = useState<DevicePoint[]>(initialSolution?.devices || []);
  const [rooms, setRooms] = useState<Room[]>(initialSolution?.rooms || []);
  const [isLoading, setIsLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived Categories from Products
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => cats.add(p.category));
    return Array.from(cats);
  }, [products]);

  // BOM Calculation
  const bom = useMemo(() => {
    const map = new Map<string, { product: Product, quantity: number }>();
    devices.forEach(d => {
      const p = products.find(prod => prod.id === d.productId);
      if (p) {
        const existing = map.get(p.id) || { product: p, quantity: 0 };
        map.set(p.id, { ...existing, quantity: existing.quantity + 1 });
      }
    });
    return Array.from(map.values());
  }, [devices, products]);

  const filteredLibrary = useMemo(() => {
    return products.filter(p => {
      const matchesBrand = p.brand.toLowerCase().includes(selectedBrand?.toLowerCase() || '');
      const matchesCategory = selectedLibraryCategory === 'ALL' || p.category === selectedLibraryCategory;
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.model.toLowerCase().includes(productSearch.toLowerCase());
      return matchesBrand && matchesCategory && matchesSearch;
    });
  }, [products, selectedBrand, selectedLibraryCategory, productSearch]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setFloorPlan(dataUrl);
        processAlgorithm(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processAlgorithm = (img: string) => {
    setIsLoading(true);
    setTimeout(async () => {
      const result: VectorFloorPlanData = MOCK_ALGO_DATA;
      setVectorData(result);
      
      const detectedRooms: Room[] = result.rooms.map((r, i) => ({
        id: 'room-' + i,
        name: r.room_type,
        area: 15,
        type: r.room_type.toLowerCase()
      }));
      setRooms(detectedRooms);

      // If AI mode, call GenAI
      if (designMode === DesignMode.AI) {
        try {
          const aiResult: any = await generateSpatialSolution({
            image: img,
            needs: ['Security', 'Convenience'],
            budget: 50000,
            lang
          }, products.filter(p => p.brand.toLowerCase().includes(selectedBrand?.toLowerCase() || '')));
          
          const finalDevices: DevicePoint[] = aiResult.devices.map((d: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            productId: d.productId,
            x: (d.x / 100) * result.width,
            y: (d.y / 100) * result.height,
            roomName: d.roomName,
            status: 'on'
          }));
          setDevices(finalDevices);
        } catch (err) {
          console.error("AI Generation failed, falling back to empty.");
        }
      } 
      // If Template mode, distribute template items among rooms
      else if (designMode === DesignMode.TEMPLATE && selectedTemplate) {
        const templateDevices: DevicePoint[] = [];
        selectedTemplate.rooms.forEach((tRoom, tIdx) => {
          // Find matching rooms in the plan
          const matchedRooms = detectedRooms.filter(r => r.type.includes(tRoom.roomType.toLowerCase()));
          matchedRooms.forEach(planRoom => {
            const roomBounds = result.rooms.find(r => r.room_type.toLowerCase().includes(planRoom.type))?.coordinates || [];
            if (roomBounds.length > 0) {
              const centerX = roomBounds.reduce((acc, p) => acc + p[0], 0) / roomBounds.length;
              const centerY = roomBounds.reduce((acc, p) => acc + p[1], 0) / roomBounds.length;
              
              tRoom.products.forEach((tProd, pIdx) => {
                for(let k=0; k<tProd.quantity; k++) {
                  templateDevices.push({
                    id: Math.random().toString(36).substr(2, 9),
                    productId: tProd.productId,
                    x: centerX + (pIdx * 15) + (k * 5),
                    y: centerY + (pIdx * 5),
                    roomName: planRoom.name,
                    status: 'on'
                  });
                }
              });
            }
          });
        });
        setDevices(templateDevices);
      }

      setStep('design');
      setIsLoading(false);
    }, 1500);
  };

  const handleManualAddAt = (x: number, y: number, roomName: string) => {
    if (!activePlacementProduct) return;
    setDevices([...devices, { 
      id: Math.random().toString(36).substr(2, 9), 
      productId: activePlacementProduct, 
      x, y, 
      roomName, 
      status: 'on' 
    }]);
  };

  const handleDeviceMove = (id: string, x: number, y: number) => {
     setDevices(devices.map(d => d.id === id ? { ...d, x, y } : d));
  };

  const renderBrandStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 overflow-y-auto animate-in fade-in zoom-in duration-500">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
           <h1 className="text-5xl font-black text-slate-900 tracking-tight">{lang === 'zh' ? '选择智能生态系统' : 'Select Smart Ecosystem'}</h1>
           <p className="text-slate-500 text-xl font-medium">{lang === 'zh' ? '不同的品牌对应不同的通讯协议与设备库' : 'Select a brand to load the specific device library.'}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {SMART_BRANDS.map(brand => (
             <button 
              key={brand.id}
              onClick={() => { setSelectedBrand(brand.id as SmartBrand); setStep('mode'); }}
              className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-2xl transition-all group flex flex-col items-center space-y-4"
             >
                <div className="w-20 h-20 flex items-center justify-center">
                   <img src={brand.logo} className="max-w-full max-h-full object-contain grayscale group-hover:grayscale-0 transition-all" alt={brand.name} />
                </div>
                <span className="font-black text-slate-800 tracking-tight group-hover:text-blue-600">{brand.name}</span>
             </button>
           ))}
        </div>
      </div>
    </div>
  );

  const renderModeStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-950 text-white animate-in fade-in slide-in-from-right duration-500 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <button onClick={() => setStep('brand')} className="absolute top-12 left-12 p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><ChevronLeft size={24}/></button>
      
      <div className="max-w-5xl w-full space-y-12 z-10">
         <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
               <Cpu size={14} />
               <span>已选品牌: {selectedBrand}</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight">{lang === 'zh' ? '选择方案设计路径' : 'Select Design Path'}</h1>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: DesignMode.AI, title: lang === 'zh' ? 'AI 自动生成' : 'AI Generation', desc: '基于空间布局与生活习惯智能排布', icon: <Sparkles className="text-blue-400" /> },
              { id: DesignMode.TEMPLATE, title: lang === 'zh' ? '方案模板生成' : 'Expert Template', desc: '应用行业标准的高端智能方案模板', icon: <Layout className="text-purple-400" /> },
              { id: DesignMode.CUSTOM, title: lang === 'zh' ? '设计师自定义' : 'Manual Custom', icon: <MousePointer2 className="text-emerald-400" />, desc: '从零开始，根据 2D 户型图手动布置点位' }
            ].map(mode => (
              <button 
                key={mode.id}
                onClick={() => { 
                  setDesignMode(mode.id as DesignMode); 
                  if (mode.id === DesignMode.TEMPLATE) setStep('template-select');
                  else setStep('upload'); 
                }}
                className="group relative bg-white/5 border border-white/10 p-10 rounded-[3.5rem] hover:bg-white/10 transition-all text-left overflow-hidden h-[320px] flex flex-col justify-between"
              >
                 <div className="space-y-6">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                       {mode.icon}
                    </div>
                    <div>
                       <h3 className="text-2xl font-black mb-2">{mode.title}</h3>
                       <p className="text-slate-400 text-sm font-medium leading-relaxed">{mode.desc}</p>
                    </div>
                 </div>
                 <ChevronRight size={32} className="text-slate-700 group-hover:text-white transition-all self-end" />
              </button>
            ))}
         </div>
      </div>
    </div>
  );

  const renderTemplateSelectStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-6xl w-full space-y-12">
        <div className="flex items-center justify-between">
           <button onClick={() => setStep('mode')} className="p-4 bg-white border rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center space-x-2">
              <ChevronLeft size={20} />
              <span className="font-bold">返回</span>
           </button>
           <div className="text-center flex-1 pr-12">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">{lang === 'zh' ? '选择方案模板' : 'Select Solution Template'}</h1>
              <p className="text-slate-500 font-medium">选择一个预设的高端配置，AI 将其适配至您的户型中</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {MOCK_TEMPLATES.map(template => (
             <div 
               key={template.id}
               onClick={() => { setSelectedTemplate(template); setStep('upload'); }}
               className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-[360px]"
             >
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                         <Layout size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-slate-400">ID: {template.id}</span>
                   </div>
                   <h3 className="text-2xl font-black text-slate-800">{template.name}</h3>
                   <p className="text-slate-500 text-sm font-medium line-clamp-3">{template.description}</p>
                   
                   <div className="flex flex-wrap gap-2 pt-2">
                      {template.rooms.map((r, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase">
                           {t(r.roomType as any)}
                        </span>
                      ))}
                   </div>
                </div>

                <div className="pt-6 border-t flex items-center justify-between">
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">预估总值</p>
                      <p className="text-xl font-black text-blue-600">${template.totalPrice.toLocaleString()}</p>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ChevronRight size={20} />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );

  const renderUploadStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 animate-in fade-in duration-500">
      <div className="max-w-4xl w-full text-center space-y-8">
        <div className="space-y-4">
           <h1 className="text-5xl font-black text-slate-900 tracking-tight">{lang === 'zh' ? '上传空间平面图' : 'Upload Floor Plan'}</h1>
           <p className="text-slate-500 text-xl font-medium">我们将通过视觉算法自动识别墙体、门窗及房间类型</p>
        </div>
        
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="w-full aspect-[2/1] border-4 border-dashed border-slate-200 rounded-[4rem] bg-white flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-2xl transition-all group overflow-hidden relative"
        >
          {isLoading ? (
             <div className="flex flex-col items-center space-y-6">
                <Loader2 size={64} className="animate-spin text-blue-500" />
                <p className="text-xl font-black text-slate-800 animate-pulse">正在进行结构化神经网络识别...</p>
             </div>
          ) : (
            <div className="text-center space-y-6">
               <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto group-hover:scale-110 transition-transform">
                  <Cpu size={48} />
               </div>
               <div>
                  <p className="text-2xl font-black text-slate-800">拖拽或点击上传</p>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">智能识别将随上传自动开启</p>
               </div>
            </div>
          )}
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
        </div>
        
        <div className="flex justify-center space-x-4">
           <button onClick={() => setStep(designMode === DesignMode.TEMPLATE ? 'template-select' : 'mode')} className="px-10 py-4 font-bold text-slate-500 hover:bg-white rounded-2xl transition-all">返回修改设计路径</button>
        </div>
      </div>
    </div>
  );

  const renderDesignStep = () => (
    <div className="flex h-full animate-in fade-in duration-700 bg-white overflow-hidden">
      {/* Main Design Surface */}
      <div className="flex-1 flex flex-col relative bg-slate-900">
         {/* View Toggle */}
         <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl">
            <button 
              onClick={() => setActiveView('2d')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeView === '2d' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
               <Layout size={16} />
               <span>2D 平面图</span>
            </button>
            <button 
              onClick={() => setActiveView('3d')}
              className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeView === '3d' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
               <Box size={16} />
               <span>3D 神经渲染</span>
            </button>
         </div>

         {/* Selection Tip */}
         {activePlacementProduct && activeView === '2d' && (
            <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 animate-bounce">
               <div className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3 border-2 border-white/20">
                  <MousePointer2 size={16} />
                  <span className="text-xs font-black uppercase tracking-widest">点击地图放置点位</span>
               </div>
            </div>
         )}

         {/* Canvas Area */}
         <div className="flex-1">
            {activeView === '3d' && vectorData ? (
               <ThreeDFloorPlan 
                  data={vectorData} 
                  devices={devices} 
                  products={products} 
               />
            ) : vectorData && (
               <VectorFloorPlan 
                  data={vectorData}
                  devices={devices}
                  products={products}
                  onAddDeviceAt={handleManualAddAt}
                  onUpdateDevice={(id, upd) => setDevices(devices.map(d => d.id === id ? {...d, ...upd} : d))}
                  onMoveDevice={handleDeviceMove}
                  onRemoveDevice={(id) => setDevices(devices.filter(d => d.id !== id))}
               />
            )}
         </div>

         {/* Footer Context */}
         <div className="absolute bottom-8 left-8 z-20 flex items-center space-x-4">
            <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-[2rem] flex items-center space-x-12 shadow-2xl text-white">
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Brand</p>
                  <p className="font-bold">{selectedBrand}</p>
               </div>
               <div className="w-px h-8 bg-white/10" />
               <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Design Path</p>
                  <p className="font-bold">{designMode}</p>
               </div>
               {selectedTemplate && (
                 <>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Template</p>
                        <p className="font-bold text-purple-400">{selectedTemplate.name}</p>
                    </div>
                 </>
               )}
            </div>
         </div>
      </div>

      {/* Professional Design Sidebar */}
      <div className="w-[480px] border-l flex flex-col bg-slate-50 z-30">
         {/* Sidebar Header Tabs */}
         <div className="px-8 pt-8 pb-4 bg-white border-b flex items-center justify-between">
            <div className="flex bg-slate-100 p-1 rounded-2xl w-full">
               <button 
                  onClick={() => setSidebarTab('library')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black transition-all ${sidebarTab === 'library' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <Grid size={16} />
                  <span>设备库</span>
               </button>
               <button 
                  onClick={() => setSidebarTab('bom')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black transition-all ${sidebarTab === 'bom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                  <ShoppingCart size={16} />
                  <span>清单 ({devices.length})</span>
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarTab === 'library' ? (
               <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Library Search & Filters */}
                  <div className="p-6 bg-white space-y-4 border-b">
                     <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                           type="text" 
                           placeholder="搜索型号、名称..."
                           value={productSearch}
                           onChange={e => setProductSearch(e.target.value)}
                           className="w-full pl-12 pr-4 py-3 rounded-2xl border-none bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                        />
                     </div>
                     <div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar">
                        <button 
                           onClick={() => setSelectedLibraryCategory('ALL')}
                           className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedLibraryCategory === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                        >
                           全部
                        </button>
                        {availableCategories.map(cat => (
                           <button 
                              key={cat}
                              onClick={() => setSelectedLibraryCategory(cat)}
                              className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedLibraryCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                           >
                              {cat}
                           </button>
                        ))}
                     </div>
                  </div>

                  {/* Library Items */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                     {filteredLibrary.map(p => (
                        <div 
                           key={p.id}
                           onClick={() => setActivePlacementProduct(p.id === activePlacementProduct ? null : p.id)}
                           className={`bg-white p-4 rounded-3xl border-2 transition-all cursor-pointer group flex items-center justify-between ${
                             activePlacementProduct === p.id ? 'border-blue-500 shadow-xl scale-[1.02] ring-4 ring-blue-50' : 'border-slate-100 shadow-sm hover:border-blue-400'
                           }`}
                        >
                           <div className="flex items-center space-x-4">
                              <div className="w-14 h-14 rounded-2xl overflow-hidden border bg-slate-50 flex items-center justify-center shrink-0">
                                 <img src={p.imageUrl} className="max-w-full max-h-full object-cover" alt="" />
                              </div>
                              <div className="overflow-hidden">
                                 <h4 className="font-black text-slate-800 text-sm truncate">{p.name}</h4>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate">{p.model} · {p.brand}</p>
                                 <div className="flex items-center space-x-1 mt-1 text-blue-500">
                                    {(CATEGORY_ICONS as any)[p.category]}
                                    <span className="text-[9px] font-black">{p.category}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="text-right flex flex-col items-end space-y-2">
                              <p className="text-sm font-black text-slate-900">${p.price}</p>
                              <div className={`p-2 rounded-xl transition-all ${
                                activePlacementProduct === p.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white'
                              }`}>
                                 {activePlacementProduct === p.id ? <Check size={16} /> : <Plus size={16} />}
                              </div>
                           </div>
                        </div>
                     ))}
                     {filteredLibrary.length === 0 && (
                        <div className="py-24 text-center space-y-4">
                           <Box size={48} className="mx-auto text-slate-200" />
                           <p className="text-slate-400 text-sm font-bold uppercase">未找到匹配设备</p>
                        </div>
                     )}
                  </div>
               </div>
            ) : (
               <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                  {/* BOM Summary */}
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">实时物料汇总</h4>
                     <div className="space-y-2">
                        {bom.map(item => (
                           <div key={item.product.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group">
                              <div className="flex items-center space-x-4">
                                 <div className="w-12 h-12 rounded-xl overflow-hidden border">
                                    <img src={item.product.imageUrl} className="w-full h-full object-cover" alt="" />
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold text-slate-800">{item.product.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">单价: ${item.product.price}</p>
                                 </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                 <span className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl font-black text-slate-900">x{item.quantity}</span>
                                 <p className="text-sm font-black text-blue-600">${(item.product.price * item.quantity).toLocaleString()}</p>
                              </div>
                           </div>
                        ))}
                        {bom.length === 0 && (
                           <div className="py-12 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                              <ShoppingCart className="mx-auto text-slate-200 mb-2" size={32} />
                              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">清单为空</p>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Design Sidebar Footer */}
         <div className="p-8 bg-white border-t space-y-6">
            <div className="flex items-center justify-between">
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">方案预估总额</p>
               <p className="text-4xl font-black text-blue-600">${bom.reduce((acc, i) => acc + (i.product.price * i.quantity), 0).toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <button 
                  onClick={() => onSave(devices, rooms, initialSolution?.id, vectorData!)}
                  className="flex items-center justify-center space-x-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl"
               >
                  <Save size={18} />
                  <span>完成设计</span>
               </button>
               <button className="flex items-center justify-center space-x-2 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                  <Share2 size={18} />
                  <span>分享预览</span>
               </button>
            </div>
         </div>
      </div>
    </div>
  );

  switch (step) {
    case 'brand': return renderBrandStep();
    case 'mode': return renderModeStep();
    case 'template-select': return renderTemplateSelectStep();
    case 'upload': return renderUploadStep();
    case 'design': return renderDesignStep();
    default: return renderBrandStep();
  }
};

export default FloorPlanDesigner;
