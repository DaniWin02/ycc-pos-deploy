// API Response types for Admin Panel

export interface SaleListItem {
  id: string;
  folio: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  paymentMethod: string;
  customerName?: string;
  status: string;
  createdAt: string;
  items?: SaleItem[];
}

export interface SaleItem {
  id: string;
  productName: string;
  name?: string;
  quantity: number;
  unitPrice: number;
  price?: number;
  totalPrice: number;
}

export interface ProductListItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  currentStock: number;
  isActive: boolean;
}

export interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

export interface DashboardStats {
  totalSales: number;
  salesCount: number;
  avgTicket: number;
  productsCount: number;
}

export interface RecentSale {
  folio: string;
  customer: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
}
