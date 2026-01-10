
import React from 'react';
import { 
  Product, CategoryItem, ProjectStatus, Solution, User, 
  ConstructionProject, ConstructionPhaseStatus, SolutionTemplate, 
  Brand, Customer, CustomerStatus, Quote, Order, QuoteStatus, OrderStatus,
  Supplier, PurchaseOrder, PurchaseOrderStatus, AfterSalesTicket, AfterSalesStatus, SupplierRMAStatus, SupplierRMA,
  FinanceAccount, FinanceTransaction, TransactionType, TransactionCategory,
  Employee, Department, Role, SystemNotification, ConstructionStatus
} from './types';
import * as LucideIcons from 'lucide-react';

// ... 保持图标和基础常量不变
export const getIcon = (name: string) => {
  const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <Icon size={18} />;
};

export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '智能照明': <LucideIcons.Lightbulb size={18} />,
  '智能开关': <LucideIcons.ToggleRight size={18} />,
  '智能灯具': <LucideIcons.Lamp size={18} />,
  '安防监控': <LucideIcons.ShieldCheck size={18} />,
  '摄像头': <LucideIcons.Camera size={18} />,
  '智能门锁': <LucideIcons.Lock size={18} />,
  '环境气候': <LucideIcons.Wind size={18} />,
};

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept1', name: '总经办', description: '公司核心决策层' },
  { id: 'dept2', name: '设计部', parentId: 'dept1', description: '负责智能方案全案设计' },
  { id: 'dept3', name: '销售部', parentId: 'dept1', description: '客户拓展与维护' },
  { id: 'dept4', name: '工程部', parentId: 'dept1', description: '负责施工现场交付' },
  { id: 'dept5', name: '财务部', description: '资金管理与成本核算' }
];

export const MOCK_ROLES: Role[] = [
  { id: 'role1', name: '超级管理员', description: '拥有系统所有权限', permissions: ['all'] },
  { id: 'role2', name: '主案设计师', description: '负责设计方案与预算', permissions: ['design_view', 'design_edit', 'product_view'] },
  { id: 'role3', name: '销售总监', description: '管理客户池与合同', permissions: ['customer_all', 'contract_view'] },
  { id: 'role4', name: '财务经理', description: '负责收支审核与报表', permissions: ['finance_all'] }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: '小陈',
    email: 'ken@smarthome.com',
    phone: '13811112222',
    avatar: 'https://picsum.photos/seed/e1/100/100',
    departmentId: 'dept2',
    roleId: 'role2',
    status: 'Active',
    hireDate: '2023-01-15'
  },
  {
    id: 'e2',
    name: '王经理',
    email: 'wang@smarthome.com',
    phone: '13933334444',
    avatar: 'https://picsum.photos/seed/e2/100/100',
    departmentId: 'dept3',
    roleId: 'role3',
    status: 'Active',
    hireDate: '2022-06-10'
  },
  {
    id: 'e3',
    name: '李工',
    email: 'lee@smarthome.com',
    phone: '13955556666',
    avatar: 'https://picsum.photos/seed/e3/100/100',
    departmentId: 'dept4',
    roleId: 'role2',
    status: 'Active',
    hireDate: '2021-03-20'
  }
];

export const MOCK_CONSTRUCTION: ConstructionProject[] = [
  {
    id: 'cp1',
    solutionId: 's1',
    orderId: 'ORD-1001',
    solutionName: '别墅全屋智能改造',
    customerName: '张三',
    status: ConstructionStatus.ONGOING,
    assignedStaffId: 'e3',
    assignedStaffName: '李工',
    startDate: '2023-11-20',
    phases: [
      {
        id: 'ph1',
        name: 'site_survey',
        status: ConstructionPhaseStatus.COMPLETED,
        plannedStartDate: '2023-11-20',
        plannedEndDate: '2023-11-21',
        supervisor: '李工',
        progress: 100,
        logs: []
      },
      {
        id: 'ph2',
        name: 'wiring',
        status: ConstructionPhaseStatus.IN_PROGRESS,
        plannedStartDate: '2023-11-22',
        plannedEndDate: '2023-11-25',
        supervisor: '李工',
        progress: 45,
        logs: []
      }
    ],
    inspections: [
      { id: 'ins1', inspector: '王经理', date: '2023-11-23', score: 95, content: '布线符合强弱电分离标准。', status: 'Pass' }
    ]
  },
  {
    id: 'cp2',
    solutionId: 's2',
    solutionName: '智能平层公寓全案',
    customerName: '李四',
    status: ConstructionStatus.UNASSIGNED,
    phases: [],
    inspections: []
  }
];

// ... 其他 MOCK 常量保持不变 (MOCK_PRODUCTS, MOCK_CATEGORIES 等)
export const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'n1',
    title: '系统版本升级公告 (v2.1)',
    content: '本次升级优化了 AI 户型识别算法，提升了 3D 渲染速度。',
    type: 'info',
    targetType: 'all',
    authorId: 'e2',
    authorName: '系统管理员',
    createdAt: '2023-11-20 10:00'
  }
];

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
  { id: 'b1', name: 'Aqara', logo: 'https://picsum.photos/seed/aqara/100/100', description: '专注全屋智能领域的领军品牌。' },
  { id: 'b2', name: '海康威视', logo: 'https://picsum.photos/seed/hik/100/100', description: '全球领先的智能物联网解决方案提供商。' },
  { id: 'b3', name: '小米', logo: 'https://picsum.photos/seed/mi/100/100', description: '以 IoT 平台为核心的消费电子公司。' },
];

export const MOCK_FINANCE_ACCOUNTS: FinanceAccount[] = [
  { id: 'acc1', name: '招商银行基本户', type: 'Bank', balance: 1250000.50, accountNumber: '**** 8888' },
  { id: 'acc2', name: '公司支付宝', type: 'Alipay', balance: 45000.00 },
  { id: 'acc3', name: '财务处备用金', type: 'Cash', balance: 5000.00 },
];

export const MOCK_FINANCE_TRANSACTIONS: FinanceTransaction[] = [
  {
    id: 'TR-20231122-001',
    type: TransactionType.INCOME,
    category: TransactionCategory.PROJECT_PAYMENT,
    amount: 15800,
    accountId: 'acc1',
    accountName: '招商银行基本户',
    projectId: 's1',
    projectName: '别墅全屋智能改造',
    description: '张三项目首笔款项',
    date: '2023-11-22',
    operator: '财务小李'
  },
  {
    id: 'TR-20231121-002',
    type: TransactionType.EXPENSE,
    category: TransactionCategory.PROCUREMENT,
    amount: 5500,
    accountId: 'acc1',
    accountName: '招商银行基本户',
    description: 'Aqara 调光开关补货采购',
    date: '2023-11-21',
    operator: '采购小王'
  },
  {
    id: 'TR-20231101-003',
    type: TransactionType.EXPENSE,
    category: TransactionCategory.RENT,
    amount: 12000,
    accountId: 'acc1',
    accountName: '招商银行基本户',
    description: '11月份办公室房租',
    date: '2023-11-01',
    operator: '系统自动'
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'sup1',
    name: '深圳智能配件批发中心',
    contactPerson: '王经理',
    phone: '13566668888',
    email: 'wang@smartwholesale.com',
    address: '深圳市龙华区智能产业园',
    categories: ['cat_sub_1_1', 'cat_sub_1_2'],
    rating: 4.8,
    createdAt: '2023-01-10'
  }
];

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-20231101-001',
    supplierId: 'sup1',
    supplierName: '深圳智能配件批发中心',
    items: [
      { productId: 'p1', name: '智能调光开关', quantity: 100, cost: 120, total: 12000 }
    ],
    totalAmount: 12000,
    status: PurchaseOrderStatus.RECEIVED,
    createdAt: '2023-11-01',
    receivedAt: '2023-11-05'
  }
];

export const MOCK_AFTER_SALES: AfterSalesTicket[] = [
  {
    id: 'AST-20231122-001',
    orderId: 'ORD-1001',
    customerId: 'c1',
    customerName: '张三',
    phone: '13800138000',
    issueType: 'Hardware',
    description: '客厅调光开关无法正常开启，App显示离线。',
    priority: 'High',
    status: AfterSalesStatus.PENDING,
    logs: [
      { id: 'l1', timestamp: '2023-11-22 10:00', content: '客户致电报修，反馈开关离线。', operator: '客服小王' }
    ],
    createdAt: '2023-11-22',
    updatedAt: '2023-11-22'
  }
];

export const MOCK_RMAS: SupplierRMA[] = [
  {
    id: 'RMA-20231122-100',
    ticketId: 'AST-20231122-001',
    supplierId: 'sup1',
    supplierName: '深圳智能配件批发中心',
    productId: 'p1',
    productName: '智能调光开关',
    faultDescription: '控制电路烧毁',
    status: SupplierRMAStatus.PENDING,
    createdAt: '2023-11-22'
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
    isCompanyActive: true
  },
  {
    id: 'p4',
    name: '全自动智能门锁',
    brand: 'Aqara',
    model: 'A100',
    categoryId: 'cat_sub_2_2',
    category: '智能门锁',
    price: 1599,
    stock: 15,
    description: '支持指纹、密码、HomeKit。',
    imageUrl: 'https://picsum.photos/seed/lock/200/200',
    skus: [{ id: 'sku4_1', name: '标准版 / 黑色', price: 1599, cost: 900, stock: 15, skuCode: 'AQ-A100-B' }],
    isCompanyActive: false
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    name: '张三',
    phone: '13800138000',
    address: '上海市浦东新区张江路888号',
    houseType: '三室二厅',
    status: CustomerStatus.CONTRACTED,
    needs: ['全屋语音控制', '安防联动'],
    files: [],
    assignedTo: 'u1',
    createdAt: '2023-10-01',
    updatedAt: '2023-11-20'
  },
  {
    id: 'c2',
    name: '李四',
    phone: '13912345678',
    address: '北京市朝阳区大屯路10号',
    houseType: '别墅',
    status: CustomerStatus.INTENTIONAL,
    needs: ['影音场景'],
    files: [],
    createdAt: '2023-11-05',
    updatedAt: '2023-11-05'
  }
];

export const MOCK_QUOTES: Quote[] = [
  {
    id: 'Q-20231120-001',
    solutionId: 's1',
    solutionName: '别墅全屋智能改造',
    customerId: 'c1',
    customerName: '张三',
    items: [
      { productId: 'p1', name: '智能调调光开关', price: 199, quantity: 5, total: 995 },
      { productId: 'p3', name: '智能网关 V3', price: 399, quantity: 2, total: 798 }
    ],
    installationFee: 500,
    debugFee: 200,
    shippingFee: 50,
    tax: 150,
    discount: 100,
    totalAmount: 2593,
    status: QuoteStatus.APPROVED,
    createdAt: '2023-11-20T10:00:00Z'
  }
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    quoteId: 'Q-20231120-001',
    customerId: 'c1',
    customerName: '张三',
    totalAmount: 2593,
    paidAmount: 2593,
    paymentStatus: 'Paid',
    status: OrderStatus.EXECUTING,
    vouchers: ['https://picsum.photos/seed/pay1/400/300'],
    createdAt: '2023-11-20T11:00:00Z'
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
      { id: 'r1', name: '客厅', area: 45, type: 'living' }
    ],
    devices: [
      { id: 'd1', productId: 'p1', x: 25, y: 30, roomName: '客厅', status: 'off' }
    ],
    totalPrice: 15800,
    createdAt: '2023-10-01',
    updatedAt: '2023-11-15',
    area: 120,
    type: 'Full House',
    statusHistory: [
      { status: ProjectStatus.DRAFT, timestamp: '2023-10-01 10:00', userName: '小陈' }
    ]
  }
];

export const MOCK_USER: User = {
  id: 'u1',
  name: '高级设计师 小陈',
  role: 'admin',
  email: 'ken@smarthome.com'
};
