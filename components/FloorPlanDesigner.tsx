
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Product, DevicePoint, Room, Solution, VectorFloorPlanData, SmartBrand, DesignMode, SolutionTemplate, DesignStyle, Customer } from '../types';
import { CATEGORY_ICONS, SMART_BRANDS, MOCK_TEMPLATES } from '../constants';
import { 
  Plus, Save, Sparkles, Loader2, X, ChevronRight, ChevronLeft, 
  Trash2, Layers, Search, Cpu, Box, Layout, 
  List, Share2, Eye, Info, CheckCircle2, ShoppingCart, 
  DollarSign, Zap, HardDrive, MousePointer2, Grid, Filter, Check, Palette, User, Phone, MapPin, ArrowRight, ClipboardList, Power, Sliders
} from 'lucide-react';
import { generateSpatialSolution } from '../geminiService';
import { useLanguage } from '../App';
import VectorFloorPlan from './VectorFloorPlan';
import ThreeDFloorPlan from './ThreeDFloorPlan';

interface DesignerProps {
  products: Product[];
  customers: Customer[];
  initialSolution?: Solution | null;
  onSave: (devices: DevicePoint[], rooms: Room[], originalId: string | undefined, vectorData: VectorFloorPlanData, style: DesignStyle, customer: {id: string, name: string}) => void;
  onGenerateQuote: (devices: DevicePoint[], rooms: Room[], customer: {id: string, name: string}, style: DesignStyle) => void;
}

type Step = 'brand' | 'style' | 'mode' | 'customer' | 'template-select' | 'upload' | 'design';

const MOCK_ALGO_DATA: VectorFloorPlanData = {"height":375,"raw_data":[{"class":"wall","x1":120,"x2":126,"y1":221,"y2":307},{"class":"window","x1":224,"x2":260,"y1":39,"y2":45},{"class":"wall","x1":120,"x2":171,"y1":221,"y2":227},{"class":"wall","x1":351,"x2":357,"y1":52,"y2":144},{"class":"wall","x1":152,"x2":200,"y1":43,"y2":49},{"class":"wall","x1":152,"x2":158,"y1":43,"y2":144},{"class":"wall","x1":373,"x2":379,"y1":140,"y2":319},{"class":"wall","x1":280,"x2":357,"y1":52,"y2":58},{"class":"wall","x1":198,"x2":284,"y1":38,"y2":44},{"class":"window","x1":151,"x2":190,"y1":314,"y2":320},{"class":"window","x1":175,"x2":193,"y1":43,"y2":49},{"class":"window","x1":302,"x2":338,"y1":53,"y2":59},{"class":"wall","x1":291,"x2":297,"y1":175,"y2":304},{"class":"window","x1":219,"x2":275,"y1":331,"y2":336},{"class":"wall","x1":198,"x2":296,"y1":331,"y2":336},{"class":"window","x1":325,"x2":364,"y1":314,"y2":320},{"class":"wall","x1":139,"x2":202,"y1":314,"y2":319},{"class":"wall","x1":120,"x2":145,"y1":301,"y2":307},{"class":"wall","x1":319,"x2":379,"y1":313,"y2":319},{"class":"wall","x1":198,"x2":203,"y1":184,"y2":303},{"class":"wall","x1":323,"x2":378,"y1":208,"y2":212},{"class":"door","x1":301,"x2":321,"y1":141,"y2":145},{"class":"wall","x1":319,"x2":325,"y1":301,"y2":319},{"class":"wall","x1":153,"x2":201,"y1":92,"y2":96},{"class":"wall","x1":199,"x2":284,"y1":85,"y2":88},{"class":"wall","x1":139,"x2":146,"y1":301,"y2":319},{"class":"door","x1":166,"x2":171,"y1":148,"y2":172},{"class":"wall","x1":197,"x2":203,"y1":314,"y2":335},{"class":"wall","x1":166,"x2":202,"y1":184,"y2":188},{"class":"wall","x1":293,"x2":325,"y1":301,"y2":307},{"class":"wall","x1":279,"x2":285,"y1":38,"y2":57},{"class":"wall","x1":152,"x2":173,"y1":140,"y2":145},{"class":"wall","x1":291,"x2":297,"y1":303,"y2":335},{"class":"door","x1":176,"x2":195,"y1":93,"y2":96},{"class":"wall","x1":292,"x2":326,"y1":174,"y2":178},{"class":"wall","x1":166,"x2":171,"y1":141,"y2":227},{"class":"door","x1":198,"x2":202,"y1":191,"y2":211},{"class":"door","x1":222,"x2":260,"y1":85,"y2":89},{"class":"window","x1":359,"x2":372,"y1":140,"y2":146},{"class":"wall","x1":171,"x2":203,"y1":140,"y2":144},{"class":"wall","x1":198,"x2":203,"y1":40,"y2":144},{"class":"wall","x1":280,"x2":378,"y1":140,"y2":145},{"class":"door","x1":300,"x2":320,"y1":175,"y2":178},{"class":"door","x1":323,"x2":326,"y1":186,"y2":205},{"class":"wall","x1":280,"x2":285,"y1":54,"y2":144},{"class":"wall","x1":323,"x2":326,"y1":141,"y2":211},{"class":"door","x1":176,"x2":195,"y1":140,"y2":145},{"class":"wall","x1":199,"x2":294,"y1":301,"y2":304},{"class":"door","x1":221,"x2":274,"y1":301,"y2":305},{"class":"wall","x1":197,"x2":203,"y1":38,"y2":48},{"class":"wall","x1":197,"x2":202,"y1":302,"y2":318},{"class":"wall","x1":166,"x2":171,"y1":186,"y2":227},{"class":"wall","x1":279,"x2":285,"y1":86,"y2":144},{"class":"wall","x1":323,"x2":326,"y1":176,"y2":211},{"class":"wall","x1":322,"x2":326,"y1":140,"y2":176},{"class":"wall","x1":197,"x2":203,"y1":40,"y2":89},{"class":"wall","x1":198,"x2":202,"y1":90,"y2":144},{"class":"wall","x1":286,"x2":296,"y1":326,"y2":335},{"class":"wall","x1":280,"x2":323,"y1":140,"y2":145},{"class":"wall","x1":356,"x2":380,"y1":140,"y2":145}],"rooms":[{"coordinates":[[203.12,314.06],[202.77,314.06],[202.77,304.91],[221.08,304.91],[221.08,305.6],[274.34,305.6],[274.34,304.91],[291.74,304.91],[291.74,326.31],[286.61,326.31],[286.61,331.32],[203.12,331.32]],"room_type":"unknown"}],"unit":4.5,"width":500};

const FloorPlanDesigner: React.FC<DesignerProps> = ({ products, customers, onSave, onGenerateQuote, initialSolution }) => {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState<Step>(initialSolution ? 'design' : 'brand');
  const [activeView, setActiveView] = useState<'2d' | '3d'>('3d');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Design Context
  const [selectedBrand, setSelectedBrand] = useState<SmartBrand | null>(initialSolution?.smartBrand || null);
  const [designStyle, setDesignStyle] = useState<DesignStyle>(initialSolution?.designStyle || DesignStyle.MINIMALIST);
  const [designMode, setDesignMode] = useState<DesignMode | null>(initialSolution?.designMode || null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    initialSolution ? (customers.find(c => c.id === initialSolution.customerId) || null) : null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<SolutionTemplate | null>(null);
  
  // Sidebar State
  const [sidebarTab, setSidebarTab] = useState<'library' | 'bom'>('library');
  const [selectedLibraryCategory, setSelectedLibraryCategory] = useState<string>('ALL');
  const [productSearch, setProductSearch] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [activePlacementProduct, setActivePlacementProduct] = useState<string | null>(null);

  // Design State
  const [floorPlan, setFloorPlan] = useState<string | null>(initialSolution?.floorPlanUrl || null);
  const [vectorData, setVectorData] = useState<VectorFloorPlanData | null>(initialSolution?.vectorData || null);
  const [devices, setDevices] = useState<DevicePoint[]>(initialSolution?.devices || []);
  const [rooms, setRooms] = useState<Room[]>(initialSolution?.rooms || []);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedDevice = useMemo(() => 
    devices.find(d => d.id === selectedDeviceId), 
    [devices, selectedDeviceId]
  );

  const selectedDeviceProduct = useMemo(() => 
    products.find(p => p.id === selectedDevice?.productId), 
    [products, selectedDevice]
  );

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

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
    );
  }, [customers, customerSearch]);

  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    products.forEach(p => {
      if (p.brand.toLowerCase().includes(selectedBrand?.toLowerCase() || '')) {
        cats.add(p.category);
      }
    });
    return Array.from(cats);
  }, [products, selectedBrand]);

  const filteredLibrary = useMemo(() => {
    return products.filter(p => {
      const matchesBrand = p.brand.toLowerCase().includes(selectedBrand?.toLowerCase() || '');
      const matchesCategory = selectedLibraryCategory === 'ALL' || p.category === selectedLibraryCategory;
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          p.model.toLowerCase().includes(productSearch.toLowerCase());
      return matchesBrand && matchesCategory && matchesSearch;
    });
  }, [products, selectedBrand, selectedLibraryCategory, productSearch]);

  const rasterizeImage = (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Canvas context failed"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error("Failed to load image for rasterization"));
      img.src = dataUrl;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        let dataUrl = event.target?.result as string;
        try {
          setIsLoading(true);
          // Rasterize to PNG to avoid "Unsupported MIME type: image/svg+xml" in Gemini API
          dataUrl = await rasterizeImage(dataUrl);
          setFloorPlan(dataUrl);
          processAlgorithm(dataUrl);
        } catch (err) {
          console.error("Image processing failed:", err);
          alert(lang === 'zh' ? '图像处理失败，请尝试其他格式（如 PNG/JPG）。' : 'Image processing failed. Please try a different format like PNG/JPG.');
          setIsLoading(false);
        }
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
            status: 'off'
          }));
          setDevices(finalDevices);
        } catch (err) { 
          console.error("AI Generation failed:", err); 
          alert(lang === 'zh' ? 'AI 方案生成失败，您可以先进行手动设计。' : 'AI Solution generation failed. You can start with manual design.');
        }
      } 
      else if (designMode === DesignMode.TEMPLATE && selectedTemplate) {
        const templateDevices: DevicePoint[] = [];
        selectedTemplate.rooms.forEach((tRoom, tIdx) => {
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
                    status: 'off'
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
      status: 'off' 
    }]);
  };

  const handleDeviceMove = (id: string, x: number, y: number) => {
     setDevices(devices.map(d => d.id === id ? { ...d, x, y } : d));
  };

  const handleUpdateDevice = (id: string, updates: Partial<DevicePoint>) => {
    setDevices(devices.map(d => d.id === id ? {...d, ...updates} : d));
  };

  const handleFinalSave = () => {
    onSave(devices, rooms, initialSolution?.id, vectorData!, designStyle, {id: selectedCustomer?.id || '', name: selectedCustomer?.name || ''});
    setShowSuccessModal(true);
  };

  const renderBrandStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 overflow-y-auto animate-in fade-in zoom-in duration-500">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
           <h1 className="text-5xl font-black text-slate-900 tracking-tight">选择智能生态系统</h1>
           <p className="text-slate-500 text-xl font-medium">不同的品牌对应不同的通讯协议与设备库</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
           {SMART_BRANDS.map(brand => (
             <button 
              key={brand.id}
              onClick={() => { setSelectedBrand(brand.id as SmartBrand); setStep('style'); }}
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

  const renderStyleStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-white animate-in fade-in slide-in-from-right duration-500">
      <div className="max-w-5xl w-full space-y-12">
        <div className="text-center space-y-4">
           <h1 className="text-5xl font-black text-slate-900 tracking-tight">选择装修设计风格</h1>
           <p className="text-slate-500 text-xl font-medium">我们将根据风格渲染 3D 户型并预置基础家具</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
           {[
             { id: DesignStyle.FRENCH, name: '法式浪漫', desc: '奶油色系，精致浮雕感', color: 'bg-yellow-50' },
             { id: DesignStyle.MINIMALIST, name: '现代简约', desc: '极简线条，黑白灰质感', color: 'bg-slate-100' },
             { id: DesignStyle.WOOD, name: '日式原木', desc: '温馨木质，自然呼吸感', color: 'bg-orange-50' },
             { id: DesignStyle.INDUSTRIAL, name: '工业深邃', desc: '粗犷美学，冷峻深色调', color: 'bg-slate-900 text-white' }
           ].map(item => (
             <button 
               key={item.id}
               onClick={() => { setDesignStyle(item.id); setStep('mode'); }}
               className={`group p-8 rounded-[3rem] border-2 border-slate-100 hover:border-blue-500 transition-all text-left space-y-6 ${item.color}`}
             >
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                   <Palette size={32} />
                </div>
                <div>
                   <h3 className="text-2xl font-black">{item.name}</h3>
                   <p className="opacity-60 text-xs font-bold uppercase mt-2">{item.desc}</p>
                </div>
             </button>
           ))}
        </div>
      </div>
    </div>
  );

  const renderModeStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-950 text-white animate-in fade-in slide-in-from-right duration-500 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none" />
      <button onClick={() => setStep('style')} className="absolute top-12 left-12 p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all"><ChevronLeft size={24}/></button>
      <div className="max-w-5xl w-full space-y-12 z-10">
         <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-4 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
               <span className="flex items-center space-x-1"><Cpu size={14} /> <span>{selectedBrand}</span></span>
               <span className="w-1 h-1 rounded-full bg-blue-500" />
               <span className="flex items-center space-x-1"><Palette size={14} /> <span>{designStyle}</span></span>
            </div>
            <h1 className="text-5xl font-black tracking-tight">选择方案设计路径</h1>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { id: DesignMode.AI, title: 'AI 自动生成', desc: '基于空间布局与生活习惯智能排布', icon: <Sparkles className="text-blue-400" /> },
              { id: DesignMode.TEMPLATE, title: '方案模板生成', desc: '应用行业标准的高端智能方案模板', icon: <Layout className="text-purple-400" /> },
              { id: DesignMode.CUSTOM, title: '设计师自定义', icon: <MousePointer2 className="text-emerald-400" />, desc: '从零开始，手动布置点位' }
            ].map(mode => (
              <button key={mode.id} onClick={() => { setDesignMode(mode.id as DesignMode); setStep('customer'); }} className="group relative bg-white/5 border border-white/10 p-10 rounded-[3.5rem] hover:bg-white/10 transition-all text-left overflow-hidden h-[320px] flex flex-col justify-between">
                 <div className="space-y-6">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">{mode.icon}</div>
                    <div><h3 className="text-2xl font-black mb-2">{mode.title}</h3><p className="text-slate-400 text-sm font-medium leading-relaxed">{mode.desc}</p></div>
                 </div>
                 <ChevronRight size={32} className="text-slate-700 group-hover:text-white transition-all self-end" />
              </button>
            ))}
         </div>
      </div>
    </div>
  );

  const renderCustomerStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 animate-in fade-in slide-in-from-right duration-500 overflow-y-auto">
      <div className="max-w-4xl w-full space-y-10">
        <div className="text-center space-y-4">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight">为谁进行设计？</h1>
           <p className="text-slate-500 font-medium">请从您的客户库中选择一位，或先前往客户管理新增客户</p>
        </div>
        
        <div className="relative max-w-lg mx-auto">
           <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
           <input 
            type="text" 
            placeholder="搜索客户姓名或手机号..."
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            className="w-full pl-14 pr-8 py-5 rounded-3xl border-2 border-slate-100 bg-white shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none font-bold text-slate-800 transition-all"
           />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {filteredCustomers.map(c => (
             <button 
              key={c.id} 
              onClick={() => { setSelectedCustomer(c); if(designMode === DesignMode.TEMPLATE) setStep('template-select'); else setStep('upload'); }}
              className="flex items-center justify-between p-6 bg-white rounded-3xl border-2 border-slate-100 hover:border-blue-500 hover:shadow-xl transition-all text-left group"
             >
                <div className="flex items-center space-x-4">
                   <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl">{c.name.charAt(0)}</div>
                   <div>
                      <p className="font-black text-slate-800">{c.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{c.phone}</p>
                   </div>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={20} /></div>
             </button>
           ))}
           {filteredCustomers.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 italic font-medium">未找到符合条件的客户</div>
           )}
        </div>
        <div className="flex justify-center"><button onClick={() => setStep('mode')} className="font-bold text-slate-400 hover:text-slate-600 px-8 py-4 transition-all">返回修改设计路径</button></div>
      </div>
    </div>
  );

  const renderTemplateSelectStep = () => (
    <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-50 overflow-y-auto animate-in fade-in duration-500">
      <div className="max-w-6xl w-full space-y-12">
        <div className="flex items-center justify-between">
           <button onClick={() => setStep('customer')} className="p-4 bg-white border rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center space-x-2"><ChevronLeft size={20} /><span className="font-bold">返回</span></button>
           <div className="text-center flex-1 pr-12"><h1 className="text-4xl font-black text-slate-900 tracking-tight">选择方案模板</h1><p className="text-slate-500 font-medium">选择一个预设的高端配置，AI 将其适配至您的户型中</p></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {MOCK_TEMPLATES.map(template => (
             <div key={template.id} onClick={() => { setSelectedTemplate(template); setStep('upload'); }} className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm hover:border-blue-500 hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between h-[360px]">
                <div className="space-y-4">
                   <div className="flex items-center justify-between"><div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Layout size={24} /></div><span className="text-[10px] font-black uppercase text-slate-400">ID: {template.id}</span></div>
                   <h3 className="text-2xl font-black text-slate-800">{template.name}</h3>
                   <p className="text-slate-500 text-sm font-medium line-clamp-3">{template.description}</p>
                   <div className="flex flex-wrap gap-2 pt-2">{template.rooms.map((r, i) => (<span key={i} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase">{t(r.roomType as any)}</span>))}</div>
                </div>
                <div className="pt-6 border-t flex items-center justify-between"><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">预估总值</p><p className="text-xl font-black text-blue-600">${template.totalPrice.toLocaleString()}</p></div><div className="p-3 bg-slate-50 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all"><ChevronRight size={20} /></div></div>
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
           <h1 className="text-5xl font-black text-slate-900 tracking-tight">上传空间平面图</h1>
           <p className="text-slate-500 text-xl font-medium">正在为 <span className="text-blue-600">@{selectedCustomer?.name}</span> 创建方案</p>
        </div>
        <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-[2/1] border-4 border-dashed border-slate-200 rounded-[4rem] bg-white flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:shadow-2xl transition-all group overflow-hidden relative">
          {isLoading ? (<div className="flex flex-col items-center space-y-6"><Loader2 size={64} className="animate-spin text-blue-500" /><p className="text-xl font-black text-slate-800 animate-pulse">正在进行结构化神经网络识别...</p></div>) : (<div className="text-center space-y-6"><div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto group-hover:scale-110 transition-transform"><Cpu size={48} /></div><div><p className="text-2xl font-black text-slate-800">拖拽或点击上传</p><p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">智能识别将随上传自动开启</p></div></div>)}
          <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
        </div>
        <div className="flex justify-center space-x-4"><button onClick={() => setStep('customer')} className="px-10 py-4 font-bold text-slate-500 hover:bg-white rounded-2xl transition-all">返回修改关联客户</button></div>
      </div>
    </div>
  );

  const renderDesignStep = () => (
    <div className="flex h-full animate-in fade-in duration-700 bg-white overflow-hidden">
      <div className="flex-1 flex flex-col relative bg-slate-900">
         <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 flex bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 shadow-2xl">
            <button onClick={() => { setActiveView('2d'); setSelectedDeviceId(null); }} className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeView === '2d' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Layout size={16} /><span>2D 平面图</span></button>
            <button onClick={() => { setActiveView('3d'); setSelectedDeviceId(null); }} className={`flex items-center space-x-2 px-6 py-2 rounded-xl text-xs font-black transition-all ${activeView === '3d' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}><Box size={16} /><span>3D 神经渲染</span></button>
         </div>
         <div className="flex-1">
            {activeView === '3d' && vectorData ? (
               <ThreeDFloorPlan data={vectorData} devices={devices} products={products} onUpdateDevice={handleUpdateDevice} onSelectDevice={setSelectedDeviceId} style={designStyle} />
            ) : vectorData && (
               <VectorFloorPlan data={vectorData} devices={devices} products={products} onAddDeviceAt={handleManualAddAt} onUpdateDevice={handleUpdateDevice} onMoveDevice={handleDeviceMove} onRemoveDevice={(id) => setDevices(devices.filter(d => d.id !== id))} />
            )}
         </div>

         {/* 3D 快速交互控制面板 */}
         {activeView === '3d' && selectedDevice && (
           <div className="absolute top-24 right-8 w-80 bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 text-white shadow-2xl animate-in fade-in slide-in-from-right duration-300 z-[100]">
              <div className="space-y-8">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                          {selectedDeviceProduct ? (CATEGORY_ICONS as any)[selectedDeviceProduct.category] : <Cpu size={20} />}
                       </div>
                       <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">远程控制中心</h4>
                    </div>
                    <button onClick={() => setSelectedDeviceId(null)} className="text-slate-500 hover:text-white transition-colors"><X size={20} /></button>
                 </div>
                 
                 <div className="space-y-1">
                    <p className="font-black text-xl leading-tight truncate">{selectedDeviceProduct?.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedDeviceProduct?.brand} · {selectedDevice.roomName}</p>
                 </div>

                 {selectedDeviceProduct?.category === '窗帘电机' ? (
                    <div className="space-y-6">
                       <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400">
                             <span>开合比例</span>
                             <span className="text-yellow-400">{selectedDevice.value ?? 0}%</span>
                          </div>
                          <input 
                             type="range" min="0" max="100" 
                             value={selectedDevice.value ?? 0}
                             onChange={(e) => handleUpdateDevice(selectedDevice.id, { value: Number(e.target.value), status: Number(e.target.value) > 0 ? 'on' : 'off' })}
                             className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                          />
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => handleUpdateDevice(selectedDevice.id, { value: 0, status: 'off' })} className="py-3 bg-white/5 border border-white/5 rounded-2xl font-black text-[10px] uppercase hover:bg-white/10 transition-all">全开 (0%)</button>
                          <button onClick={() => handleUpdateDevice(selectedDevice.id, { value: 100, status: 'on' })} className="py-3 bg-yellow-400 text-slate-900 rounded-2xl font-black text-[10px] uppercase hover:bg-yellow-300 transition-all">全闭 (100%)</button>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleUpdateDevice(selectedDevice.id, { status: selectedDevice.status === 'on' ? 'off' : 'on' })} 
                          className={`flex items-center justify-center space-x-2 py-5 rounded-3xl font-black text-xs transition-all ${selectedDevice.status === 'on' ? 'bg-yellow-400 text-slate-900 shadow-[0_0_20px_rgba(250,204,21,0.3)]' : 'bg-white/5 border border-white/5 text-slate-400'}`}
                        >
                          <Power size={16} /> <span>{selectedDevice.status === 'on' ? '关闭电源' : '开启电源'}</span>
                        </button>
                        <button className="flex items-center justify-center space-x-2 py-5 bg-white/5 border border-white/5 rounded-3xl font-black text-xs text-slate-400 hover:text-white transition-all">
                           <Sliders size={16} /> <span>调节细节</span>
                        </button>
                      </div>
                      <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Device ID: {selectedDevice.id}</p>
                    </div>
                 )}

                 <div className="pt-6 border-t border-white/5 flex justify-center">
                    <button onClick={() => { setDevices(devices.filter(d => d.id !== selectedDeviceId)); setSelectedDeviceId(null); }} className="text-red-400/40 hover:text-red-400 font-bold text-[10px] uppercase tracking-widest flex items-center space-x-2 transition-all">
                      <Trash2 size={12} /> <span>从方案中移除</span>
                    </button>
                 </div>
              </div>
           </div>
         )}

         <div className="absolute bottom-8 left-8 z-20 flex items-center space-x-4">
            <div className="bg-slate-950/90 backdrop-blur-xl border border-white/10 px-8 py-4 rounded-[2rem] flex items-center space-x-12 shadow-2xl text-white">
               <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Customer</p><p className="font-bold text-blue-400">{selectedCustomer?.name}</p></div>
               <div className="w-px h-8 bg-white/10" />
               <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ecosystem</p><p className="font-bold">{selectedBrand}</p></div>
               <div className="w-px h-8 bg-white/10" />
               <div><p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Decor Style</p><p className="font-bold">{designStyle}</p></div>
            </div>
         </div>
      </div>
      <div className="w-[480px] border-l flex flex-col bg-slate-50 z-30">
         <div className="px-8 pt-8 pb-4 bg-white border-b flex items-center justify-between"><div className="flex bg-slate-100 p-1 rounded-2xl w-full"><button onClick={() => setSidebarTab('library')} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black transition-all ${sidebarTab === 'library' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><Grid size={16} /><span>设备库</span></button><button onClick={() => setSidebarTab('bom')} className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-black transition-all ${sidebarTab === 'bom' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><ShoppingCart size={16} /><span>清单 ({devices.length})</span></button></div></div>
         <div className="flex-1 overflow-hidden flex flex-col">
            {sidebarTab === 'library' ? (
               <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-6 bg-white space-y-4 border-b"><div className="relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" placeholder="搜索型号、名称..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-2xl border-none bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium" /></div><div className="flex items-center space-x-2 overflow-x-auto pb-2 custom-scrollbar"><button onClick={() => setSelectedLibraryCategory('ALL')} className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedLibraryCategory === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>全部</button>{availableCategories.map(cat => (<button key={cat} onClick={() => setSelectedLibraryCategory(cat)} className={`shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedLibraryCategory === cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{cat}</button>))}</div></div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                     {filteredLibrary.map(p => (<div key={p.id} onClick={() => setActivePlacementProduct(p.id === activePlacementProduct ? null : p.id)} className={`bg-white p-4 rounded-3xl border-2 transition-all cursor-pointer group flex items-center justify-between ${activePlacementProduct === p.id ? 'border-blue-500 shadow-xl scale-[1.02] ring-4 ring-blue-50' : 'border-slate-100 shadow-sm hover:border-blue-400'}`}><div className="flex items-center space-x-4"><div className="w-14 h-14 rounded-2xl overflow-hidden border bg-slate-50 flex items-center justify-center shrink-0"><img src={p.imageUrl} className="max-w-full max-h-full object-cover" alt="" /></div><div className="overflow-hidden"><h4 className="font-black text-slate-800 text-sm truncate">{p.name}</h4><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter truncate">{p.model} · {p.brand}</p><div className="flex items-center space-x-1 mt-1 text-blue-500">{(CATEGORY_ICONS as any)[p.category]}<span className="text-[9px] font-black">{p.category}</span></div></div></div><div className="text-right flex flex-col items-end space-y-2"><p className="text-sm font-black text-slate-900">${p.price}</p><div className={`p-2 rounded-xl transition-all ${activePlacementProduct === p.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-600 group-hover:text-white'}`}>{activePlacementProduct === p.id ? <Check size={16} /> : <Plus size={16} />}</div></div></div>))}
                  </div>
               </div>
            ) : (
               <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"><div className="space-y-4"><h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">实时物料汇总</h4><div className="space-y-2">{bom.map(item => (<div key={item.product.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group"><div className="flex items-center space-x-4"><div className="w-12 h-12 rounded-xl overflow-hidden border"><img src={item.product.imageUrl} className="w-full h-full object-cover" alt="" /></div><div><p className="text-sm font-bold text-slate-800">{item.product.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">单价: ${item.product.price}</p></div></div><div className="flex items-center space-x-4"><span className="w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl font-black text-slate-900">x{item.quantity}</span><p className="text-sm font-black text-blue-600">${(item.product.price * item.quantity).toLocaleString()}</p></div></div>))}</div></div></div>
            )}
         </div>
         <div className="p-8 bg-white border-t space-y-6"><div className="flex items-center justify-between"><p className="text-xs font-black text-slate-400 uppercase tracking-widest">方案预估总额</p><p className="text-4xl font-black text-blue-600">${bom.reduce((acc, i) => acc + (i.product.price * i.quantity), 0).toLocaleString()}</p></div><div className="grid grid-cols-2 gap-4"><button onClick={handleFinalSave} className="flex items-center justify-center space-x-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl"><Save size={18} /><span>完成设计</span></button><button className="flex items-center justify-center space-x-2 py-4 bg-slate-100 text-slate-900 rounded-2xl font-bold hover:bg-slate-200 transition-all"><Share2 size={18} /><span>分享预览</span></button></div></div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl p-12 text-center space-y-10 border border-white/20 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
              <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center text-green-500 mx-auto shadow-inner animate-bounce">
                 <CheckCircle2 size={56} />
              </div>
              <div className="space-y-4">
                 <h2 className="text-4xl font-black text-slate-900 tracking-tight">方案已成功保存！</h2>
                 <p className="text-slate-500 text-lg font-medium">您已经为 <span className="text-blue-600 font-black">@{selectedCustomer?.name}</span> 完成了空间智能化设计</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button 
                  onClick={() => onGenerateQuote(devices, rooms, {id: selectedCustomer?.id || '', name: selectedCustomer?.name || ''}, designStyle)}
                  className="flex flex-col items-center p-8 bg-blue-600 text-white rounded-[3rem] shadow-2xl shadow-blue-500/30 hover:bg-blue-700 transition-all group"
                 >
                    <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                       <DollarSign size={28} />
                    </div>
                    <span className="text-xl font-black mb-1">生成报价单</span>
                    <span className="text-xs opacity-60 font-bold uppercase tracking-widest">立即核算项目成本</span>
                    <ArrowRight size={24} className="mt-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                 </button>

                 <button 
                  onClick={() => setShowSuccessModal(false)}
                  className="flex flex-col items-center p-8 bg-slate-100 text-slate-800 rounded-[3rem] hover:bg-slate-200 transition-all group"
                 >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-slate-200 shadow-sm">
                       <ClipboardList size={28} className="text-slate-400" />
                    </div>
                    <span className="text-xl font-black mb-1">查看方案中心</span>
                    <span className="text-xs opacity-60 font-bold uppercase tracking-widest">稍后进行报价处理</span>
                 </button>
              </div>

              <button 
                onClick={() => setShowSuccessModal(false)}
                className="text-slate-400 font-bold hover:text-slate-600 transition-all"
              >
                继续编辑此方案
              </button>
           </div>
        </div>
      )}
    </div>
  );

  switch (step) {
    case 'brand': return renderBrandStep();
    case 'style': return renderStyleStep();
    case 'mode': return renderModeStep();
    case 'customer': return renderCustomerStep();
    case 'template-select': return renderTemplateSelectStep();
    case 'upload': return renderUploadStep();
    case 'design': return renderDesignStep();
    default: return renderBrandStep();
  }
};

export default FloorPlanDesigner;
