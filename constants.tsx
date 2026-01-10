
import React from 'react';
import { Product, CategoryItem, ProjectStatus, Solution, User, ConstructionProject, ConstructionPhaseStatus, SolutionTemplate, Brand, Customer, CustomerStatus } from './types';
import * as LucideIcons from 'lucide-react';
import { 
  Lightbulb, 
  ShieldCheck, 
  Wind, 
  Smartphone, 
  Radio, 
  Camera, 
  Cpu,
  Monitor
} from 'lucide-react';

// 动态图标映射
export const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <Icon size={18} />;
};

// CATEGORY_ICONS mapping for display in the designer, using keys matching p.category in MOCK_PRODUCTS
export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '智能照明': <LucideIcons.Lightbulb size={18} />,
  '智能开关': <LucideIcons.ToggleRight size={18} />,
  '智能灯具': <LucideIcons.Lamp size={18} />,
  '安防监控': <LucideIcons.ShieldCheck size={18} />,
  '摄像头': <LucideIcons.Camera size={18} />,
  '智能门锁': <LucideIcons.Lock size={18} />,
  '环境气候': <LucideIcons.Wind size={18} />,
};

export const MOCK_CATEGORIES: CategoryItem[] = [
  { id: 'cat_root_1', name: '智能照明', iconName: 'Lightbulb', description: '全屋灯光控制系统' },
  { id: 'cat_sub_1_1', name: '智能开关', parentId: 'cat_root_1', iconName: 'ToggleRight', description: '墙面开关、调光开关' },
  { id: 'cat_sub_1_2', name: '智能灯具', parentId: 'cat_root_1', iconName: 'Lamp', description: '吸顶灯、灯带、射灯' },
  { id: 'cat_root_2', name: '安防监控', iconName: 'ShieldCheck', description: '家庭安全守护系统' },
  { id: 'cat_sub_2_1', name: '摄像头', parentId: 'cat_root_2', iconName: 'Camera', description: '户内外监控' },
  { id: 'cat_sub_2_2', name: '智能门锁', parentId: 'cat_root_2', iconName: 'Lock', description: '入户门锁、室内锁' },
  { id: 'cat_root_3', name: '环境气候', iconName: 'Wind', description: '空调、新风、地暖' },
];

export const MOCK_BRANDS: Brand[] = [
  { id: 'b1', name: 'Aqara', logo: 'https://picsum.photos/seed/aqara/100/100', description: '专注全屋智能领域的领军品牌，提供全方位智能家居解决方案。' },
  { id: 'b2', name: '海康威视', logo: 'https://picsum.photos/seed/hik/100/100', description: '全球领先的智能物联网解决方案和大数据服务提供商。' },
  { id: 'b3', name: '小米', logo: 'https://picsum.photos/seed/mi/100/100', description: '以智能手机、智能硬件和 IoT 平台为核心的消费电子及智能制造公司。' },
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: '张三',
    phone: '13800138000',
    email: 'zhangsan@example.com',
    address: '上海市浦东新区张江路888号',
    houseType: '三室二厅',
    status: CustomerStatus.INTENTIONAL,
    needs: ['全屋语音控制', '安防联动', '智能灯光'],
    files: [
      { id: 'f1', name: '原始户型图.jpg', url: 'https://picsum.photos/seed/plan1/800/600', type: 'Floor Plan', createdAt: '2023-10-01' }
    ],
    assignedTo: 'u1',
    createdAt: '2023-10-01',
    updatedAt: '2023-10-01'
  },
  {
    id: 'c2',
    name: '李四',
    phone: '13912345678',
    address: '北京市朝阳区大屯路10号',
    houseType: '别墅',
    status: CustomerStatus.POTENTIAL,
    needs: ['影音场景', '全宅WiFi覆盖'],
    files: [],
    createdAt: '2023-11-05',
    updatedAt: '2023-11-05'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: '智能调光开关',
    brand: 'Aqara',
    model: 'D1 Single',
    categoryId: 'cat_sub_1_1',
    category: '智能开关',
    price: 199,
    stock: 50,
    description: '支持 Zigbee 3.0 的高品质调光开关。',
    imageUrl: 'https://picsum.photos/seed/light/200/200',
    skus: [
      { id: 'sku1_1', name: '单路 Zigbee / 白色', price: 199, cost: 120, stock: 30, skuCode: 'AQ-D1-S1-W' },
      { id: 'sku1_2', name: '单路 Zigbee / 灰色', price: 219, cost: 130, stock: 20, skuCode: 'AQ-D1-S1-G' }
    ],
    isCompanyActive: true
  },
  {
    id: 'p2',
    name: '4K 室外摄像头',
    brand: '海康威视',
    model: 'DS-2CD',
    categoryId: 'cat_sub_2_1',
    category: '摄像头',
    price: 899,
    stock: 20,
    description: '超高清监控，支持 AI 人形检测。',
    imageUrl: 'https://picsum.photos/seed/camera/200/200',
    skus: [
      { id: 'sku2_1', name: '4K 有线 POE 版', price: 899, cost: 550, stock: 15, skuCode: 'HK-4K-POE' },
      { id: 'sku2_2', name: '4K Wi-Fi 电池版', price: 1099, cost: 700, stock: 5, skuCode: 'HK-4K-WIFI' }
    ],
    isCompanyActive: true
  },
  {
    id: 'p3',
    name: '智能网关 V3',
    brand: '小米',
    model: 'Multi-mode v3',
    categoryId: 'cat_root_1',
    category: '智能照明',
    price: 399,
    stock: 100,
    description: '全屋智能的核心枢纽。',
    imageUrl: 'https://picsum.photos/seed/hub/200/200',
    skus: [
      { id: 'sku3_1', name: '标准版', price: 399, cost: 200, stock: 100, skuCode: 'MI-GW-V3' }
    ],
    isCompanyActive: false
  }
];

export const MOCK_TEMPLATES: SolutionTemplate[] = [
  {
    id: 't1',
    name: '豪华智能住宅模板',
    description: '包含全屋灯光、安防、环境控制。适用于大户型别墅。',
    totalPrice: 12500,
    rooms: [
      {
        id: 'tr1',
        roomType: 'living',
        products: [
          { productId: 'p1', quantity: 2 },
          { productId: 'p3', quantity: 1 }
        ]
      },
      {
        id: 'tr2',
        roomType: 'entrance',
        products: [
          { productId: 'p2', quantity: 1 }
        ]
      }
    ]
  },
  {
    id: 't2',
    name: '极简公寓模板',
    description: '仅包含基础智能灯控，高性价比之选。',
    totalPrice: 2400,
    rooms: [
      {
        id: 'tr3',
        roomType: 'bedroom',
        products: [
          { productId: 'p1', quantity: 1 }
        ]
      }
    ]
  },
  {
    id: 't3',
    name: '全能安防加强模板',
    description: '针对安全系数要求高的客户设计的全方位监控方案。',
    totalPrice: 8900,
    rooms: [
      {
        id: 'tr4',
        roomType: 'balcony',
        products: [
          { productId: 'p2', quantity: 2 }
        ]
      }
    ]
  }
];

export const MOCK_SOLUTIONS: Solution[] = [
  {
    id: 's1',
    name: '别墅全屋智能改造',
    customerId: 'c1',
    customerName: '张三',
    status: ProjectStatus.IN_PROGRESS,
    floorPlanUrl: 'https://picsum.photos/seed/plan1/800/600',
    rooms: [
      { id: 'r1', name: '客厅', area: 45, type: 'living' },
      { id: 'r2', name: '主卧', area: 30, type: 'bedroom' }
    ],
    devices: [
      { id: 'd1', productId: 'p1', x: 25, y: 30, roomName: '客厅', status: 'off' },
      { id: 'd2', productId: 'p3', x: 50, y: 50, roomName: '走廊', status: 'on' }
    ],
    totalPrice: 15800,
    createdAt: '2023-10-01',
    updatedAt: '2023-11-15',
    area: 120,
    type: 'Full House',
    statusHistory: [
      { status: ProjectStatus.DRAFT, timestamp: '2023-10-01 10:00', userName: '小陈' },
      { status: ProjectStatus.IN_PROGRESS, timestamp: '2023-11-15 14:30', userName: '小陈' }
    ]
  },
  {
    id: 's2',
    name: '三室一厅精装方案',
    customerId: 'c2',
    customerName: '李四',
    status: ProjectStatus.CONFIRMED,
    floorPlanUrl: 'https://picsum.photos/seed/plan2/800/600',
    rooms: [
      { id: 'r3', name: '客厅', area: 35, type: 'living' }
    ],
    devices: [
      { id: 'd3', productId: 'p1', x: 40, y: 40, roomName: '客厅', status: 'off' }
    ],
    totalPrice: 8500,
    createdAt: '2023-11-05',
    updatedAt: '2023-11-10',
    area: 95,
    type: 'Full House',
    statusHistory: [
      { status: ProjectStatus.DRAFT, timestamp: '2023-11-05 09:00', userName: '小陈' },
      { status: ProjectStatus.CONFIRMED, timestamp: '2023-11-10 11:00', userName: '管理员' }
    ]
  }
];

export const MOCK_CONSTRUCTION: ConstructionProject[] = [
  {
    id: 'cp1',
    solutionId: 's1',
    solutionName: '别墅全屋智能改造',
    customerName: '张三',
    phases: [
      {
        id: 'ph1',
        name: 'survey',
        status: ConstructionPhaseStatus.COMPLETED,
        plannedStartDate: '2023-11-20',
        plannedEndDate: '2023-11-21',
        actualEndDate: '2023-11-21',
        supervisor: '李工',
        progress: 100,
        logs: [
          { id: 'l1', timestamp: '2023-11-20 10:00', content: '现场勘测完成，确认布线方案。', author: '李工' }
        ]
      },
      {
        id: 'ph2',
        name: 'wiring',
        status: ConstructionPhaseStatus.IN_PROGRESS,
        plannedStartDate: '2023-11-22',
        plannedEndDate: '2023-11-25',
        supervisor: '王工',
        progress: 60,
        logs: [
          { id: 'l2', timestamp: '2023-11-22 09:00', content: '开始预埋管线，进展顺利。', author: '王工' },
          { id: 'l3', timestamp: '2023-11-23 16:30', content: '客厅区域管线已铺设完毕。', author: '王工' }
        ]
      },
      {
        id: 'ph3',
        name: 'installation',
        status: ConstructionPhaseStatus.PENDING,
        plannedStartDate: '2023-11-26',
        plannedEndDate: '2023-11-28',
        supervisor: '陈工',
        progress: 0,
        logs: []
      },
      {
        id: 'ph4',
        name: 'debugging',
        status: ConstructionPhaseStatus.PENDING,
        plannedStartDate: '2023-11-29',
        plannedEndDate: '2023-11-30',
        supervisor: '张工',
        progress: 0,
        logs: []
      },
      {
        id: 'ph5',
        name: 'acceptance',
        status: ConstructionPhaseStatus.PENDING,
        plannedStartDate: '2023-12-01',
        plannedEndDate: '2023-12-01',
        supervisor: '李工',
        progress: 0,
        logs: []
      }
    ]
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  name: '高级设计师 小陈',
  role: 'designer',
  email: 'ken@smarthome.com'
};
