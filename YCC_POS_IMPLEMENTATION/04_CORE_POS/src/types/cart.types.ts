import { Product } from './product.types';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  modifiers: CartModifier[];
  notes?: string;
  addedAt: Date;
}

export interface CartModifier {
  id: string;
  modifierId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  tipAmount: number;
  totalAmount: number;
  customerInfo?: {
    id: string;
    name: string;
    memberNumber?: string;
  email?: string;
    phone?: string;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartAddItemRequest {
  productId: string;
  quantity: number;
  modifiers?: Array<{
    modifierId: string;
    quantity: number;
  }>;
}

export interface CartUpdateItemRequest {
  quantity?: number;
  modifiers?: Array<{
    modifierId: string;
    quantity: number;
  }>;
  notes?: string;
}

export interface CartUpdateRequest {
  items: Array<{
    id: string;
    quantity?: number;
    modifiers?: CartUpdateItemRequest;
    notes?: string;
  }>;
  customerInfo?: {
    id: string;
    name: string;
    memberNumber?: string;
    email?: string;
    phone?: string;
  };
  discountAmount?: number;
  tipAmount?: number;
  notes?: string;
}
