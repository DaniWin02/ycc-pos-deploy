import { create } from 'zustand';

const API_URL = 'http://localhost:3004/api/customers';

export type CustomerType = 'SOCIO' | 'CLIENTE' | 'INVITADO' | 'CORPORATIVO';

export interface Customer {
  id: string;
  memberNumber?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email?: string;
  phone?: string;
  address?: string;
  rfc?: string;
  type: CustomerType;
  balance: number;
  creditLimit: number;
  notes?: string;
  birthDate?: string;
  isActive: boolean;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
}

interface CustomerState {
  // Estado
  selectedCustomer: Customer | null;
  searchResults: Customer[];
  isSearching: boolean;
  searchQuery: string;

  // Acciones
  searchCustomers: (query: string) => Promise<void>;
  selectCustomer: (customer: Customer | null) => void;
  createQuickCustomer: (data: { firstName: string; lastName?: string; phone?: string; type?: CustomerType }) => Promise<Customer | null>;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  selectedCustomer: null,
  searchResults: [],
  isSearching: false,
  searchQuery: '',

  searchCustomers: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [], isSearching: false });
      return;
    }

    set({ isSearching: true, searchQuery: query });

    try {
      const res = await fetch(`${API_URL}?search=${encodeURIComponent(query)}&isActive=true`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) throw new Error('Error buscando clientes');

      const data: Customer[] = await res.json();
      set({ searchResults: data, isSearching: false });
    } catch (error) {
      console.error('Error buscando clientes:', error);
      set({ searchResults: [], isSearching: false });
    }
  },

  selectCustomer: (customer: Customer | null) => {
    set({ selectedCustomer: customer });
  },

  createQuickCustomer: async (data) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName || '',
          phone: data.phone || '',
          type: data.type || 'CLIENTE'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error creando cliente');
      }

      const result = await res.json();
      const customer = result.customer as Customer;
      
      // Seleccionar automáticamente el nuevo cliente
      set({ selectedCustomer: customer, searchResults: [], searchQuery: '' });
      
      return customer;
    } catch (error) {
      console.error('Error creando cliente:', error);
      return null;
    }
  },

  clearSelection: () => {
    set({ selectedCustomer: null, searchResults: [], searchQuery: '' });
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
  }
}));
