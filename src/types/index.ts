export type UserRole = 'Administrador' | 'Gerente' | 'Cajero' | 'Bodeguero' | 'Vendedor';

export interface Permission {
  id: string;
  code: string;
  name: string;
  module: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Permission IDs or codes
  userCount: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  branchId: string;
  isActive: boolean;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  documentId: string;
  email: string;
  phone: string;
  position: string;
  branchId: string;
  hireDate: string;
  salary: number;
  isActive: boolean;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  managerName: string;
  isMain: boolean;
  isActive: boolean;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  branchId: string;
  type: 'Principal' | 'Secundaria' | 'Merma' | 'Tránsito';
  capacityNotes?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  color?: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  categoryId: string;
  code: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  code: string;
  barcode: string;
  name: string;
  description?: string;
  categoryId: string;
  subcategoryId?: string;
  brand?: string;
  unit: string; // 'Unidad', 'Caja', 'Kg', 'Metro', etc.
  costPrice: number; // Precio de compra / costo
  sellingPrice: number; // Precio de venta regular
  wholesalePrice?: number; // Precio mayorista
  taxRate: number; // Ej. 13% o 16% IVA
  minStock: number; // Stock mínimo para alerta de bajo stock
  maxStock?: number;
  isActive: boolean;
  imageUrl?: string;
  // Warehouse breakdown: warehouseId -> quantity
  warehouseStock: Record<string, number>;
}

export type MovementType = 
  | 'VENTA' 
  | 'COMPRA' 
  | 'AJUSTE_ENTRADA' 
  | 'AJUSTE_SALIDA' 
  | 'TRANSFERENCIA_ENTRADA' 
  | 'TRANSFERENCIA_SALIDA' 
  | 'DEVOLUCION_CLIENTE' 
  | 'DEVOLUCION_PROVEEDOR';

export interface StockMovement {
  id: string;
  code: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  type: MovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalCost: number;
  referenceDocument?: string; // e.g. "FAC-0012", "AJU-0004"
  reason?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface KardexEntry {
  id: string;
  productId: string;
  date: string;
  documentType: string;
  documentNumber: string;
  movementType: 'Entrada' | 'Salida';
  // Input
  inQuantity: number;
  inUnitCost: number;
  inTotalCost: number;
  // Output
  outQuantity: number;
  outUnitCost: number;
  outTotalCost: number;
  // Balance
  balanceQuantity: number;
  balanceUnitCost: number;
  balanceTotalCost: number;
}

export interface StockAdjustment {
  id: string;
  code: string;
  warehouseId: string;
  productId: string;
  type: 'Entrada' | 'Salida';
  quantity: number;
  reason: 'Conteo físico' | 'Merma / Daño' | 'Vencimiento' | 'Error de registro' | 'Otro';
  notes?: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface StockTransfer {
  id: string;
  code: string;
  originWarehouseId: string;
  destinationWarehouseId: string;
  status: 'Completado' | 'En Tránsito' | 'Cancelado';
  notes?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
  transferredBy: string;
  createdAt: string;
}

export interface Client {
  id: string;
  code: string;
  name: string;
  taxId: string; // RFC, NIT, DNI, RUC
  email: string;
  phone: string;
  address: string;
  category: 'Minorista' | 'Mayorista' | 'Corporativo';
  creditLimit: number;
  currentDebt: number;
  discountPercentage: number; // Descuento asignado
  isActive: boolean;
  totalPurchases: number;
  lastPurchaseDate?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  creditDays: number;
  currentDebt: number; // Saldo que le debemos
  isActive: boolean;
  category: string;
  createdAt: string;
}

export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Crédito' | 'Mixto';

export interface SaleItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  discountPercentage: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface Sale {
  id: string;
  ticketNumber: string;
  invoiceNumber?: string;
  branchId: string;
  warehouseId: string;
  clientId: string;
  clientName: string;
  sellerId: string;
  sellerName: string;
  items: SaleItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  costTotal: number;
  profitTotal: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  changeGiven: number;
  paymentStatus: 'PAGADO' | 'PENDIENTE' | 'ANULADO';
  dueDate?: string; // Para ventas al crédito
  status: 'Completada' | 'Anulada' | 'Devuelta';
  voidReason?: string;
  cashSessionId?: string;
  createdAt: string;
}

export interface QuoteItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercentage: number;
  total: number;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  clientId: string;
  clientName: string;
  sellerName: string;
  items: QuoteItem[];
  subtotal: number;
  tax: number;
  total: number;
  validUntil: string;
  notes?: string;
  status: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Convertida a Venta';
  convertedSaleId?: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  invoiceNumber: string; // Factura del proveedor
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  warehouseName: string;
  items: PurchaseItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: 'Contado' | 'Crédito';
  paymentStatus: 'PAGADO' | 'PENDIENTE' | 'ANULADO';
  dueDate?: string;
  amountPaid: number;
  status: 'Completada' | 'Anulada';
  voidReason?: string;
  createdAt: string;
}

export interface AccountReceivable {
  id: string;
  saleId: string;
  ticketNumber: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  payments: {
    id: string;
    date: string;
    amount: number;
    paymentMethod: string;
    reference: string;
    cashSessionId?: string;
  }[];
}

export interface AccountPayable {
  id: string;
  purchaseId: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'PENDIENTE' | 'PAGADO' | 'VENCIDO';
  payments: {
    id: string;
    date: string;
    amount: number;
    paymentMethod: string;
    reference: string;
  }[];
}

export interface CashSession {
  id: string;
  code: string;
  branchId: string;
  userId: string;
  userName: string;
  openedAt: string;
  closedAt?: string;
  initialCash: number;
  expectedCash: number;
  actualCash?: number;
  cashDifference?: number;
  totalSalesCash: number;
  totalSalesCard: number;
  totalSalesTransfer: number;
  totalSalesCredit: number;
  totalExpenses: number;
  totalClientPaymentsCash: number;
  status: 'Abierta' | 'Cerrada';
  notes?: string;
}

export interface Expense {
  id: string;
  code: string;
  branchId: string;
  category: 'Servicios' | 'Alquiler' | 'Transporte' | 'Suministros' | 'Mantenimiento' | 'Planilla' | 'Otros';
  amount: number;
  concept: string;
  paidTo: string;
  receiptNumber?: string;
  userId: string;
  userName: string;
  cashSessionId?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  module: 
    | 'Seguridad' 
    | 'Administración' 
    | 'Productos' 
    | 'Inventario' 
    | 'Ventas' 
    | 'Cotizaciones' 
    | 'Compras' 
    | 'Clientes' 
    | 'Proveedores' 
    | 'Caja' 
    | 'Cuentas' 
    | 'Configuración';
  action: 'CREAR' | 'EDITAR' | 'ELIMINAR' | 'DESACTIVAR' | 'ANULAR' | 'COBRAR' | 'APERTURA' | 'CIERRE' | 'LOGIN' | 'AJUSTE';
  description: string;
  requirementCode: string; // e.g. "RF-048", "RF-035"
  ipAddress?: string;
}

export interface CompanySettings {
  name: string;
  tradeName: string;
  taxId: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  currencySymbol: string;
  currencyCode: string;
  defaultTaxRate: number; // e.g. 13% or 16%
  taxName: string; // e.g. "IVA"
  ticketHeader: string;
  ticketFooter: string;
  printLogo: boolean;
  lowStockAlertThreshold: number;
  enableCreditSales: boolean;
}
