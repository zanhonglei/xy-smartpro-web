
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

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  categories: string[]; // Category IDs they supply
  rating: number; // 1-5
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
  linkedOrderId?: string; // If linked to a specific customer order
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
  discount: number; // Final discount amount
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
  phases: ConstructionPhase[];
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
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'designer' | 'sales' | 'client' | 'finance';
  email: string;
}
