
import React, { useState, useRef, useEffect } from 'react';
import { Product, DevicePoint, Room, SolutionTemplate, Solution } from '../types';
import { CATEGORY_ICONS, MOCK_TEMPLATES } from '../constants';
import { 
  Plus, 
  Save, 
  Info, 
  Sparkles, 
  Loader2, 
  X,
  CheckCircle2,
  AlertCircle,
  Upload,
  Layout,
  List,
  Eye,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Settings,
  Trash2,
  Edit2,
  Power,
  Layers,
  Check,
  DollarSign
} from 'lucide-react';
import { generateSpatialSolution, generateRoomVisual } from '../geminiService';
import { useLanguage } from '../App';

interface DesignerProps {
  products: Product[];
  initialSolution?: Solution | null;
  onSave: (devices: DevicePoint[], rooms: Room[], originalId?: string) => void;
}

type Step = 'upload' | 'design' | 'preview';

const FloorPlanDesigner: React.FC<DesignerProps> = ({ products, onSave, initialSolution }) => {
  const { lang, t } = useLanguage();
  const [step, setStep] = useState<Step>(initialSolution ? 'design' : 'upload');
  const [activeTab, setActiveTab] = useState<'2d' | 'list' | '3d' | 'rooms'>('2d');
  
  // Design State
  const [floorPlan, setFloorPlan] = useState<string | null>(initialSolution?.floorPlanUrl || null);
  const [devices, setDevices] = useState<DevicePoint[]>(initialSolution?.devices || []);
  const [rooms, setRooms] = useState<Room[]>(initialSolution?.rooms || []);
  const [reasoning, setReasoning] = useState<string>("");
  const [previews, setPreviews] = useState<{room: string, url: string}[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<DevicePoint | null>(null);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  
  // UI State for Setup
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [reqNeeds, setReqNeeds] = useState<string[]>(['Security', 'Convenience']);
  const [reqBudget, setReqBudget] = useState<number>(30000); // Changed to numeric budget
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Re-load if initialSolution changes
  useEffect(() => {
    if (initialSolution) {
      setFloorPlan(initialSolution.floorPlanUrl);
      setDevices(initialSolution.devices);
      setRooms(initialSolution.rooms);
      setStep('design');
    }
  }, [initialSolution]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setFloorPlan(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiDesign = async () => {
    if (!floorPlan) return;
    setIsLoading(true);
    try {
      // 1. Get room layout and initial AI points
      const result: any = await generateSpatialSolution({
        image: floorPlan,
        needs: reqNeeds,
        budget: reqBudget,
        lang
      }, products);
      
      const roomNames = Array.from(new Set<string>(result.devices.map((d: any) => d.roomName)));
      const detectedRooms: Room[] = roomNames.map(name => ({
        id: Math.random().toString(36).substr(2, 9),
        name,
        area: 15,
        type: name.toLowerCase().includes('living') ? 'living' : 
              name.toLowerCase().includes('bed') ? 'bedroom' : 
              name.toLowerCase().includes('kitchen') ? 'kitchen' : 'room'
      }));

      let finalDevices: DevicePoint[] = [];

      // 2. If a template is selected, populate rooms using template logic
      if (selectedTemplateId) {
        const template = MOCK_TEMPLATES.find(t => t.id === selectedTemplateId);
        if (template) {
          detectedRooms.forEach(room => {
            const templateRoom = template.rooms.find(tr => tr.roomType === room.type);
            if (templateRoom) {
              templateRoom.products.forEach(tp => {
                for (let i = 0; i < tp.quantity; i++) {
                  // Place products near detected room centers
                  const roomPoint = result.devices.find((d: any) => d.roomName === room.name);
                  finalDevices.push({
                    id: Math.random().toString(36).substr(2, 9),
                    productId: tp.productId,
                    x: (roomPoint?.x || 50) + (Math.random() * 10 - 5),
                    y: (roomPoint?.y || 50) + (Math.random() * 10 - 5),
                    roomName: room.name,
                    status: 'on'
                  });
                }
              });
            }
          });
        }
      } else {
        // Fallback: Use pure AI points
        finalDevices = result.devices.map((d: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          ...d,
          status: 'on'
        }));
      }

      setDevices(finalDevices);
      setRooms(detectedRooms);
      setReasoning(selectedTemplateId ? 
        (lang === 'zh' ? `已基于选定的模板「${MOCK_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}」自动填充设备。` : `Automatically populated devices based on selected template "${MOCK_TEMPLATES.find(t => t.id === selectedTemplateId)?.name}".`)
        : result.reasoning);
      setStep('design');
    } catch (err) {
      alert("AI analysis failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (template: SolutionTemplate) => {
    const newDevices: DevicePoint[] = [];
    
    rooms.forEach(room => {
      const templateRoom = template.rooms.find(tr => tr.roomType === room.type);
      if (templateRoom) {
        templateRoom.products.forEach(tp => {
          for (let i = 0; i < tp.quantity; i++) {
            newDevices.push({
              id: Math.random().toString(36).substr(2, 9),
              productId: tp.productId,
              x: 50 + (Math.random() * 10 - 5),
              y: 50 + (Math.random() * 10 - 5),
              roomName: room.name,
              status: 'on'
            });
          }
        });
      }
    });

    setDevices([...devices, ...newDevices]);
    setShowTemplatePicker(false);
    alert(t('templateApplied'));
  };

  const handleGenerate3D = async () => {
    setIsGenerating3D(true);
    setActiveTab('3d');
    const roomsToPreview: string[] = Array.from(new Set<string>(devices.map(d => d.roomName))).slice(0, 3);
    const newPreviews: {room: string, url: string}[] = [];
    
    try {
      for (const room of roomsToPreview) {
        const roomDevices: string[] = devices.filter(d => d.roomName === room).map(d => {
            const p = products.find(prod => prod.id === d.productId);
            return p?.name || 'Smart device';
        });
        const url: string | null = await generateRoomVisual(room, roomDevices, lang);
        if (url) newPreviews.push({ room, url });
      }
      setPreviews(newPreviews);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating3D(false);
    }
  };

  const addRoom = () => {
    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      name: t('livingRoom'),
      area: 20,
      type: 'living'
    };
    setRooms([...rooms, newRoom]);
    setEditingRoomId(newRoom.id);
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    setRooms(rooms.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRoom = (id: string) => {
    setRooms(rooms.filter(r => r.id !== id));
  };

  const toggleDeviceStatus = (id: string) => {
    const updatedDevices = devices.map(d => 
      d.id === id ? { ...d, status: d.status === 'on' ? 'off' : 'on' } as DevicePoint : d
    );
    setDevices(updatedDevices);
    if (selectedDevice && selectedDevice.id === id) {
      setSelectedDevice({ ...selectedDevice, status: selectedDevice.status === 'on' ? 'off' : 'on' });
    }
  };

  const getProductById = (id: string) => products.find(p => p.id === id);

  const renderUploadStep = () => {
    return (
      <div className="flex flex-col h-full bg-slate-50 overflow-y-auto custom-scrollbar animate-in fade-in duration-500">
        <div className="max-w-6xl mx-auto w-full p-12 space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">{t('uploadPlan')}</h1>
            <p className="text-slate-500 text-xl font-medium">{t('aiDescription')}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Upload Area */}
            <div className="lg:col-span-7 space-y-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`w-full aspect-video border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center cursor-pointer transition-all bg-white relative group overflow-hidden ${
                  floorPlan ? 'border-blue-500' : 'border-slate-200 hover:border-blue-400 hover:shadow-2xl'
                }`}
              >
                <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileUpload} />
                {floorPlan ? (
                  <div className="relative w-full h-full p-10 flex items-center justify-center">
                    <img src={floorPlan} className="max-h-full rounded-2xl shadow-2xl transition-transform group-hover:scale-105 duration-500" alt="Upload Preview" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFloorPlan(null); }}
                      className="absolute top-8 right-8 bg-white/90 backdrop-blur text-red-500 p-3 rounded-2xl shadow-xl hover:bg-red-500 hover:text-white transition-all z-10"
                    >
                      <X size={24} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mx-auto group-hover:scale-110 transition-transform shadow-sm">
                      <Upload size={48} />
                    </div>
                    <div>
                      <p className="font-black text-2xl text-slate-800">{t('dropzoneText')}</p>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Supports JPG, PNG (Max 10MB)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Needs Tags */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <Sparkles size={16} className="text-blue-500" />
                  <span>{t('priorityNeeds')}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {['Security', 'Automation', 'Energy Saving', 'Entertainment', 'Elderly Care'].map(need => (
                    <button
                      key={need}
                      onClick={() => setReqNeeds(prev => prev.includes(need) ? prev.filter(n => n !== need) : [...prev, need])}
                      className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border-2 ${
                        reqNeeds.includes(need) ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {t(need.toLowerCase().replace(' ', '') as any)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Settings & Templates */}
            <div className="lg:col-span-5 space-y-8">
              {/* Budget Slider */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-black text-slate-400 uppercase tracking-widest">{t('budgetLevel')}</label>
                  <div className="flex items-center space-x-1 text-blue-600 font-black">
                    <span className="text-sm">$</span>
                    <span className="text-xl">{reqBudget.toLocaleString()}</span>
                  </div>
                </div>
                <div className="relative pt-4 pb-2 px-2">
                  <input 
                    type="range" 
                    min="1000" 
                    max="100000" 
                    step="1000"
                    value={reqBudget}
                    onChange={(e) => setReqBudget(Number(e.target.value))}
                    className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    <span>1,000</span>
                    <span>100,000 (10W)</span>
                  </div>
                </div>
              </div>

              {/* Template Picker */}
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6 flex flex-col flex-1">
                <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                  <Layers size={16} className="text-blue-500" />
                  <span>{lang === 'zh' ? '关联方案模板' : 'Link Solution Template'}</span>
                </label>
                <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                  {MOCK_TEMPLATES.map(temp => (
                    <div 
                      key={temp.id}
                      onClick={() => setSelectedTemplateId(selectedTemplateId === temp.id ? null : temp.id)}
                      className={`p-5 rounded-[1.5rem] border-2 cursor-pointer transition-all group relative ${
                        selectedTemplateId === temp.id 
                        ? 'bg-blue-50 border-blue-600 shadow-sm' 
                        : 'bg-slate-50 border-transparent hover:bg-white hover:border-slate-200'
                      }`}
                    >
                      {selectedTemplateId === temp.id && (
                        <div className="absolute top-4 right-4 text-blue-600">
                          <CheckCircle2 size={20} />
                        </div>
                      )}
                      <h4 className={`font-bold text-lg ${selectedTemplateId === temp.id ? 'text-blue-900' : 'text-slate-800'}`}>
                        {temp.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">{temp.description}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50">
                        <div className="flex -space-x-2">
                          {temp.rooms.map((r, i) => (
                            <div key={i} className="w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[8px] font-bold text-slate-400 uppercase">
                              {r.roomType[0]}
                            </div>
                          ))}
                        </div>
                        <span className="text-blue-600 font-black text-sm">${temp.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-8">
            <button
              disabled={!floorPlan || isLoading}
              onClick={handleRunAiDesign}
              className="w-full py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-xl shadow-2xl hover:bg-black hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-4 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 size={32} className="animate-spin text-blue-400" />
                  <span>{t('analyzing')}</span>
                </>
              ) : (
                <>
                  <Sparkles size={28} className="text-blue-400" />
                  <span>{selectedTemplateId ? (lang === 'zh' ? '一键应用模板并生成' : 'One-Click Apply & Generate') : t('generateProposal')}</span>
                  <ChevronRight size={24} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRoomsTab = () => (
    <div className="max-w-5xl mx-auto p-12 space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">{t('roomsTab')}</h2>
          <p className="text-slate-500">{lang === 'zh' ? '管理户型中的各个房间及其属性。' : 'Manage individual rooms and their attributes.'}</p>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setShowTemplatePicker(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-200 transition-all border"
          >
            <Layers size={20} className="text-blue-500" />
            <span>{t('applyTemplate')}</span>
          </button>
          <button 
            onClick={addRoom}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 transition-all"
          >
            <Plus size={20} />
            <span>{t('addRoom')}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
              <th className="px-6 py-4">{t('roomName')}</th>
              <th className="px-6 py-4">{t('area')}</th>
              <th className="px-6 py-4">{t('roomType')}</th>
              <th className="px-6 py-4 text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rooms.map(room => (
              <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  {editingRoomId === room.id ? (
                    <input 
                      type="text" 
                      value={room.name} 
                      onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <span className="font-semibold text-slate-700">{room.name}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingRoomId === room.id ? (
                    <input 
                      type="number" 
                      value={room.area} 
                      onChange={(e) => updateRoom(room.id, { area: Number(e.target.value) })}
                      className="w-32 px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  ) : (
                    <span className="text-slate-600">{room.area} m²</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingRoomId === room.id ? (
                    <select 
                      value={room.type} 
                      onChange={(e) => updateRoom(room.id, { type: e.target.value })}
                      className="px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="living">{t('livingRoom')}</option>
                      <option value="bedroom">{t('bedroom')}</option>
                      <option value="kitchen">{t('kitchen')}</option>
                      <option value="bathroom">{t('bathroom')}</option>
                      <option value="balcony">{t('balcony')}</option>
                      <option value="study">{t('study')}</option>
                      <option value="entrance">{t('entrance')}</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {room.type}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {editingRoomId === room.id ? (
                    <button 
                      onClick={() => setEditingRoomId(null)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <CheckCircle2 size={18} />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setEditingRoomId(room.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteRoom(room.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rooms.length === 0 && (
          <div className="py-24 text-center text-slate-400 font-medium">
            No rooms added yet.
          </div>
        )}
      </div>
    </div>
  );

  const renderDesignStep = () => (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center space-x-4">
          <button onClick={() => setStep('upload')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button 
              onClick={() => setActiveTab('2d')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === '2d' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <Layout size={18} />
              <span>{t('planView')}</span>
            </button>
            <button 
              onClick={() => setActiveTab('rooms')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rooms' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <Settings size={18} />
              <span>{t('roomsTab')}</span>
            </button>
            <button 
              onClick={() => setActiveTab('list')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <List size={18} />
              <span>{t('listView')}</span>
            </button>
            <button 
              onClick={() => setActiveTab('3d')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === '3d' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
            >
              <Eye size={18} />
              <span>{t('threeDView')}</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button onClick={handleRunAiDesign} className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg border">
            <RefreshCw size={18} />
            <span className="text-sm font-bold">{t('backToSetup')}</span>
          </button>
          <button 
            onClick={() => onSave(devices, rooms, initialSolution?.id)} 
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 font-bold"
          >
            <CheckCircle2 size={18} />
            <span>{initialSolution ? t('save') : t('confirmDesign')}</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === '2d' && (
          <div className="flex-1 relative bg-slate-900 flex items-center justify-center p-8 overflow-hidden">
            <div className="relative max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden border-4 border-white/10">
              <img src={floorPlan!} className="max-h-full block" alt="Plan" />
              {devices.map(d => {
                const p = getProductById(d.productId);
                return (
                  <div 
                    key={d.id} 
                    className="absolute group"
                    style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <div 
                      onClick={() => setSelectedDevice(d)}
                      className={`w-10 h-10 rounded-2xl shadow-xl flex items-center justify-center border-2 hover:scale-125 transition-all cursor-pointer ${
                        d.status === 'on' ? 'bg-white text-blue-600 border-blue-500' : 'bg-slate-800 text-slate-400 border-slate-600 opacity-80'
                      }`}
                    >
                      {p ? (CATEGORY_ICONS as any)[p.category] : <Info size={16} />}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                        {p?.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="absolute top-8 right-8 w-80 max-h-[80%] overflow-y-auto bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 text-white space-y-4 custom-scrollbar">
              <h3 className="font-bold flex items-center space-x-2">
                <Sparkles size={18} className="text-blue-400" />
                <span>{t('aiReasoning')}</span>
              </h3>
              <p className="text-xs leading-relaxed opacity-80">{reasoning || (initialSolution ? 'Editing existing solution...' : 'Upload plan for AI reasoning.')}</p>
              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="opacity-60">{t('price')}</span>
                  <span className="font-bold text-blue-400">${devices.reduce((acc, d) => acc + (getProductById(d.productId)?.price || 0), 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && renderRoomsTab()}

        {activeTab === 'list' && (
          <div className="flex-1 bg-white p-12 overflow-y-auto custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="flex items-center justify-between border-b pb-6">
                <h2 className="text-3xl font-extrabold text-slate-900">{t('listView')}</h2>
                <div className="text-right">
                  <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">{t('totalCost')}</p>
                  <p className="text-4xl font-black text-blue-600">
                    ${devices.reduce((acc, d) => acc + (getProductById(d.productId)?.price || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {devices.map((d, i) => {
                  const p = getProductById(d.productId);
                  if (!p) return null;
                  return (
                    <div key={d.id} className="p-4 rounded-2xl border hover:shadow-lg transition-all flex items-center space-x-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 shrink-0">
                        {(CATEGORY_ICONS as any)[p.category]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">{p.name}</p>
                        <p className="text-xs text-slate-400">{d.roomName}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <p className="font-bold text-blue-600">${p.price}</p>
                        <button 
                          onClick={() => toggleDeviceStatus(d.id)}
                          className={`mt-1 p-1 rounded-md text-[10px] font-bold ${d.status === 'on' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {d.status === 'on' ? t('on') : t('off')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === '3d' && (
          <div className="flex-1 bg-slate-50 p-12 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto space-y-12">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900">{t('threeDView')}</h2>
                  <p className="text-slate-500">AI-generated architectural previews based on your plan.</p>
                </div>
                {!isGenerating3D && previews.length === 0 && (
                  <button onClick={handleGenerate3D} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-xl hover:bg-blue-700 flex items-center space-x-2">
                    <Sparkles size={20} />
                    <span>{t('generate3D')}</span>
                  </button>
                )}
              </div>

              {isGenerating3D ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-8 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Sparkles className="absolute inset-0 m-auto text-blue-600 animate-pulse" size={32} />
                  </div>
                  <p className="text-xl font-bold text-slate-700 animate-pulse">{t('generating3D')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {previews.map((item, i) => (
                    <div key={i} className="group space-y-4">
                      <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                        <img src={item.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={item.room} />
                      </div>
                      <div className="flex items-center justify-between px-4">
                        <h4 className="text-xl font-bold text-slate-800">{item.room}</h4>
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest italic">AI Enhanced Preview</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showTemplatePicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col border shadow-2xl">
            <div className="p-8 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('templateLibrary')}</h3>
                <p className="text-slate-500 font-medium">{lang === 'zh' ? '选择一个模板以快速填充当前方案。' : 'Select a template to quickly fill your solution.'}</p>
              </div>
              <button onClick={() => setShowTemplatePicker(false)} className="p-2 hover:bg-slate-200 rounded-full transition-all">
                <X size={28} />
              </button>
            </div>
            <div className="flex-1 p-8 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-6">
              {MOCK_TEMPLATES.map(template => (
                <div 
                  key={template.id} 
                  onClick={() => applyTemplate(template)}
                  className="p-8 border-2 border-slate-100 rounded-[2rem] hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group bg-white"
                >
                  <h4 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600">{template.name}</h4>
                  <p className="text-slate-500 text-sm mb-6">{template.description}</p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {template.rooms.map((tr, i) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                        {t(tr.roomType as any)}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('totalCost')}</span>
                    <span className="text-xl font-black text-blue-600">${template.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedDevice && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-xl ${selectedDevice.status === 'on' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {getProductById(selectedDevice.productId) ? (CATEGORY_ICONS as any)[getProductById(selectedDevice.productId)!.category] : <Info size={20} />}
                </div>
                <h3 className="text-xl font-bold text-slate-800">{t('deviceDetails')}</h3>
              </div>
              <button onClick={() => setSelectedDevice(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="flex items-start space-x-6">
                <div className="w-32 h-32 bg-slate-100 rounded-2xl overflow-hidden border shrink-0">
                  <img src={getProductById(selectedDevice.productId)?.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="text-2xl font-black text-slate-900 leading-tight">
                    {getProductById(selectedDevice.productId)?.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold uppercase">
                      {t('brand')}: {getProductById(selectedDevice.productId)?.brand}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">
                      {t('model')}: {getProductById(selectedDevice.productId)?.model}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2">
                    {getProductById(selectedDevice.productId)?.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('location')}</p>
                  <p className="font-bold text-slate-800">{selectedDevice.roomName}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('price')}</p>
                  <p className="font-bold text-blue-600">${getProductById(selectedDevice.productId)?.price}</p>
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-slate-800">{t('deviceStatus')}</p>
                    <p className="text-xs text-slate-400">
                      {selectedDevice.status === 'on' ? 'Device is currently active' : 'Device is currently dormant'}
                    </p>
                  </div>
                  <button 
                    onClick={() => toggleDeviceStatus(selectedDevice.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg ${
                      selectedDevice.status === 'on' 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    <Power size={18} />
                    <span>{selectedDevice.status === 'on' ? t('on') : t('off')}</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50 border-t flex justify-end">
              <button 
                onClick={() => setSelectedDevice(null)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all shadow-md"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return step === 'upload' ? renderUploadStep() : renderDesignStep();
};

export default FloorPlanDesigner;
