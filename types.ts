
export type SmartBrand = 'MiHome' | 'Aqara' | 'Tuya' | 'Control4' | 'Savand';

export enum DesignStyle {
  FRENCH = 'French Romantic',
  MINIMALIST = 'Modern Minimalist',
  WOOD = 'Japanese Wood',
  INDUSTRIAL = 'Industrial Loft'
}

export enum DesignMode {
  AI = 'AI',
  TEMPLATE = 'Template',
  CUSTOM = 'Custom'
}
// ... rest of the types.ts remain unchanged
export enum ProjectStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  VOIDED = 'Voided'
}

export enum ContractStatus {
  DRAFT = 'Draft',
  WAITING_SIGN = 'Waiting Sign',
  SIGNED = 'Signed',
  ARCHIVED = 'Archived'
}

export enum CustomerStatus {
  POTENTIAL = 'Potential',
  INTENTIONAL = 'Intentional',
  CONTRACTED = 'Contracted',
  VOIDED = 'Voided'
}

export enum QuoteStatus {
  DRAFT = 'Draft',
  REVIEWING = 'Reviewing',
  APPROVED = 'Approved',
  REJECTED = 'Rejected'
}

export enum OrderStatus {
  WAITING_PAY = 'Waiting Payment',
  PREPARING = 'Preparing',
  EXECUTING = 'Executing',
  COMPLETED = 'Completed'
}

export enum PurchaseOrderStatus {
  DRAFT = 'Draft',
  PENDING = 'Pending',
  ORDERED = 'Ordered',
  RECEIVED = 'Received',
  CANCELLED = 'Cancelled'
}

// Architectural Structure Recognition Types
export interface RawStructureElement {
  class: 'wall' | 'window' | 'door';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface RecognizedRoom {
  coordinates: number[][];
  room_type: string;
}

export interface VectorFloorPlanData {
  width: number;
  height: number;
  unit: number;
  raw_data: RawStructureElement[];
  rooms: RecognizedRoom[];
}

export enum ConstructionStatus {
  UNASSIGNED = 'Unassigned',
  ONGOING = 'Ongoing',
  INSPECTING = 'Inspecting',
  ACCEPTANCE = 'Acceptance',
  COMPLETED = 'Completed'
}

export enum ConstructionPhaseStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue'
}

export interface ConstructionLog {
  id: string;
  timestamp: string;
  content: string;
  author: string;
  images?: string[];
}

export interface InspectionRecord {
  id: string;
  inspector: string;
  date: string;
  score: number;
  content: string;
  images?: string[];
  status: 'Pass' | 'Fail';
}

export interface ConstructionPhase {
  id: string;
  name: string;
  status: ConstructionPhaseStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  actualEndDate?: string;
  supervisor: string;
  progress: number;
  logs: ConstructionLog[];
  acceptanceMaterials?: string[];
}

export interface ConstructionProject {
  id: string;
  solutionId: string;
  orderId?: string;
  solutionName: string;
  customerName: string;
  status: ConstructionStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  startDate?: string;
  endDate?: string;
  phases: ConstructionPhase[];
  inspections: InspectionRecord[];
  customerSignature?: string;
  acceptanceDate?: string;
}

export interface Department {
  id: string;
  name: string;
  parentId?: string;
  managerId?: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  departmentId: string;
  roleId: string;
  status: 'Active' | 'Disabled';
  hireDate: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  targetType: 'all' | 'department' | 'role';
  targetId?: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface InventoryRecord {
  id: string;
  type: InventoryMovementType;
  reason: InventoryReason;
  productId: string;
  productName: string;
  skuId?: string;
  skuName?: string;
  quantity: number;
  operator: string;
  timestamp: string;
  notes?: string;
  linkedId?: string;
}

export enum InventoryMovementType {
  IN = 'Stock In',
  OUT = 'Stock Out'
}

export enum InventoryReason {
  PROCUREMENT = 'Procurement In',
  RETURN = 'Customer Return',
  PROJECT_DELIVERY = 'Project Out',
  SCRAP = 'Scrap/Damage',
  ADJUSTMENT = 'Inventory Adjustment',
  SALE = 'Retail Sale'
}

export interface StockTakeItem {
  productId: string;
  skuId: string;
  productName: string;
  skuName: string;
  systemQty: number;
  actualQty: number;
  diff: number;
}

export interface StockTakeSession {
  id: string;
  title: string;
  items: StockTakeItem[];
  status: 'Draft' | 'Completed';
  operator: string;
  createdAt: string;
  completedAt?: string;
}

export interface DeliveryNote {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  items: {
    productId: string;
    skuId: string;
    name: string;
    quantity: number;
  }[];
  status: 'Pending' | 'Shipped' | 'Delivered';
  operator: string;
  createdAt: string;
  shippedAt?: string;
}

export interface FinanceAccount {
  id: string;
  name: string;
  type: 'Bank' | 'Alipay' | 'WeChat' | 'Cash';
  balance: number;
  accountNumber?: string;
}

export interface FinanceTransaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  accountId: string;
  accountName: string;
  projectId?: string;
  projectName?: string;
  description: string;
  voucherUrl?: string;
  date: string;
  operator: string;
}

export enum TransactionType {
  INCOME = 'Income',
  EXPENSE = 'Expense'
}

export enum TransactionCategory {
  PROJECT_PAYMENT = 'Project Payment',
  PROCUREMENT = 'Procurement',
  RENT = 'Rent',
  SALARY = 'Salary',
  MARKETING = 'Marketing',
  UTILITIES = 'Utilities',
  OTHER = 'Other'
}

export interface ProjectFinanceSummary {
  projectId: string;
  projectName: string;
  customerName: string;
  totalIncome: number;
  totalExpense: number;
  grossProfit: number;
  profitMargin: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string[];
  rating: number;
  createdAt: string;
}

export interface PurchaseOrderItem {
  productId: string;
  skuId?: string;
  name: string;
  quantity: number;
  cost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  linkedOrderId?: string;
  createdAt: string;
  receivedAt?: string;
}

export interface StockingOrder {
  id: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  reason: string;
  createdAt: string;
}

export interface QuoteItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Quote {
  id: string;
  solutionId: string;
  solutionName: string;
  customerId: string;
  customerName: string;
  items: QuoteItem[];
  installationFee: number;
  debugFee: number;
  shippingFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: QuoteStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  quoteId: string;
  customerId: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  status: OrderStatus;
  vouchers: string[];
  createdAt: string;
}

export interface CustomerFile {
  id: string;
  name: string;
  url: string;
  type: 'Floor Plan' | 'Progress Photo' | 'Other';
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  houseType: string;
  status: CustomerStatus;
  needs: string[];
  files: CustomerFile[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ElectronicSeal {
  id: string;
  name: string;
  imageUrl: string;
  createdAt: string;
}

export interface ContractTemplate {
  id: string;
  name: string;
  content: string;
  placeholders: string[];
}

export interface Contract {
  id: string;
  templateId: string;
  solutionId: string;
  quoteId?: string;
  solutionName: string;
  customerName: string;
  totalPrice: number;
  status: ContractStatus;
  content: string;
  sealId?: string;
  signatureUrl?: string;
  signedAt?: string;
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  parentId?: string;
  iconName: string;
  description?: string;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
  website?: string;
}

export interface ProductSKU {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  skuCode?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  categoryId: string;
  category: string;
  description: string;
  imageUrl: string;
  skus: ProductSKU[];
  price: number; 
  stock: number;
  isCompanyActive?: boolean;
}

export interface DevicePoint {
  id: string;
  productId: string;
  skuId?: string;
  x: number;
  y: number;
  roomName: string;
  status: 'on' | 'off';
}

export interface Room {
  id: string;
  name: string;
  area: number;
  type: string;
}

export interface TemplateProduct {
  productId: string;
  skuId?: string;
  quantity: number;
}

export interface TemplateRoom {
  id: string;
  roomType: string;
  products: TemplateProduct[];
}

export interface SolutionTemplate {
  id: string;
  name: string;
  description: string;
  rooms: TemplateRoom[];
  totalPrice: number;
}

export interface StatusEntry {
  status: ProjectStatus;
  timestamp: string;
  userName: string;
}

export interface Solution {
  id: string;
  name: string;
  customerId: string;
  customerName: string;
  status: ProjectStatus;
  floorPlanUrl: string;
  rooms: Room[];
  devices: DevicePoint[];
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  area?: number;
  type?: 'Full House' | 'Room Only';
  statusHistory: StatusEntry[];
  vectorData?: VectorFloorPlanData;
  smartBrand?: SmartBrand;
  designMode?: DesignMode;
  designStyle?: DesignStyle;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'designer' | 'sales' | 'client' | 'finance';
  email: string;
}

export interface AfterSalesLog {
  id: string;
  timestamp: string;
  content: string;
  operator: string;
  images?: string[];
}

export interface AfterSalesTicket {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  phone: string;
  issueType: 'Hardware' | 'Software' | 'Maintenance';
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: AfterSalesStatus;
  technician?: string;
  logs: AfterSalesLog[];
  createdAt: string;
  updatedAt: string;
}

export enum AfterSalesStatus {
  PENDING = 'Pending',
  ASSIGNED = 'Assigned',
  PROCESSING = 'Processing',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export interface SupplierRMA {
  id: string;
  ticketId: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  skuName?: string;
  faultDescription: string;
  trackingNumber?: string;
  status: SupplierRMAStatus;
  createdAt: string;
}

export enum SupplierRMAStatus {
  PENDING = 'Pending',
  SHIPPED = 'Shipped',
  SUPPLIER_RECEIVED = 'Received by Supplier',
  REPAIRED = 'Repaired/Replaced',
  RETURNED = 'Returned'
}
