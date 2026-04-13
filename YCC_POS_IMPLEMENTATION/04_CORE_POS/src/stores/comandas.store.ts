import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Comanda, ComandaTotals, CartItem, Product, ComandaType } from '../types';

interface ComandasState {
  comandas: Comanda[];
  activeComandaId: string | null;
  
  // Acciones de comandas
  createComanda: (nombre: string, tipo: ComandaType) => string;
  deleteComanda: (comandaId: string) => void;
  setActiveComanda: (comandaId: string) => void;
  getActiveComanda: () => Comanda | null;
  
  // Acciones de items
  addItemToComanda: (comandaId: string, product: Product, quantity?: number) => void;
  removeItemFromComanda: (comandaId: string, productId: string) => void;
  updateItemQuantity: (comandaId: string, productId: string, quantity: number) => void;
  
  // Acciones de configuración
  setComandaCustomerName: (comandaId: string, name: string) => void;
  setComandaDiscount: (comandaId: string, discount: number, type: 'percentage' | 'amount') => void;
  setComandaNotes: (comandaId: string, notes: string) => void;
  
  // Cálculos
  getComandaTotals: (comandaId: string) => ComandaTotals;
  
  // Cerrar comanda
  closeComanda: (comandaId: string) => void;
}

export const useComandasStore = create<ComandasState>()(
  devtools(
    persist(
      (set, get) => ({
        comandas: [],
        activeComandaId: null,

        createComanda: (nombre: string, tipo: ComandaType) => {
          const newComanda: Comanda = {
            id: `comanda-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nombre,
            tipo,
            items: [],
            status: 'ACTIVE',
            discount: 0,
            discountType: 'percentage',
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          set((state) => ({
            comandas: [...state.comandas, newComanda],
            activeComandaId: newComanda.id
          }));
          
          console.log('✅ Comanda creada:', newComanda.nombre, newComanda.id);
          return newComanda.id;
        },

        deleteComanda: (comandaId: string) => {
          set((state) => {
            const newComandas = state.comandas.filter(c => c.id !== comandaId);
            const newActiveId = state.activeComandaId === comandaId 
              ? (newComandas.length > 0 ? newComandas[0].id : null)
              : state.activeComandaId;
            
            return {
              comandas: newComandas,
              activeComandaId: newActiveId
            };
          });
          console.log('🗑️ Comanda eliminada:', comandaId);
        },

        setActiveComanda: (comandaId: string) => {
          const comanda = get().comandas.find(c => c.id === comandaId);
          if (comanda) {
            set({ activeComandaId: comandaId });
            console.log('📌 Comanda activa:', comanda.nombre);
          }
        },

        getActiveComanda: () => {
          const { comandas, activeComandaId } = get();
          return comandas.find(c => c.id === activeComandaId) || null;
        },

        addItemToComanda: (comandaId: string, product: Product, quantity = 1) => {
          set((state) => ({
            comandas: state.comandas.map(comanda => {
              if (comanda.id !== comandaId) return comanda;
              
              const existingIndex = comanda.items.findIndex(i => i.productId === product.id);
              const newItems = [...comanda.items];
              
              if (existingIndex >= 0) {
                const item = newItems[existingIndex];
                const newQty = item.quantity + quantity;
                newItems[existingIndex] = {
                  ...item,
                  quantity: newQty,
                  totalPrice: item.unitPrice * newQty
                };
              } else {
                newItems.push({
                  productId: product.id,
                  name: product.name,
                  sku: product.sku,
                  unitPrice: product.price,
                  quantity,
                  totalPrice: product.price * quantity,
                  categoryName: product.categoryName,
                  stationId: product.stationId || product.station?.id,
                  stationName: product.station?.displayName || product.station?.name
                });
              }
              
              return {
                ...comanda,
                items: newItems,
                updatedAt: new Date()
              };
            })
          }));
        },

        removeItemFromComanda: (comandaId: string, productId: string) => {
          set((state) => ({
            comandas: state.comandas.map(comanda => {
              if (comanda.id !== comandaId) return comanda;
              
              return {
                ...comanda,
                items: comanda.items.filter(i => i.productId !== productId),
                updatedAt: new Date()
              };
            })
          }));
        },

        updateItemQuantity: (comandaId: string, productId: string, quantity: number) => {
          set((state) => ({
            comandas: state.comandas.map(comanda => {
              if (comanda.id !== comandaId) return comanda;
              
              if (quantity <= 0) {
                return {
                  ...comanda,
                  items: comanda.items.filter(i => i.productId !== productId),
                  updatedAt: new Date()
                };
              }
              
              return {
                ...comanda,
                items: comanda.items.map(i =>
                  i.productId === productId
                    ? { ...i, quantity, totalPrice: i.unitPrice * quantity }
                    : i
                ),
                updatedAt: new Date()
              };
            })
          }));
        },

        setComandaCustomerName: (comandaId: string, name: string) => {
          set((state) => ({
            comandas: state.comandas.map(comanda =>
              comanda.id === comandaId
                ? { ...comanda, customerName: name, updatedAt: new Date() }
                : comanda
            )
          }));
        },

        setComandaDiscount: (comandaId: string, discount: number, type: 'percentage' | 'amount') => {
          set((state) => ({
            comandas: state.comandas.map(comanda =>
              comanda.id === comandaId
                ? { ...comanda, discount, discountType: type, updatedAt: new Date() }
                : comanda
            )
          }));
        },

        setComandaNotes: (comandaId: string, notes: string) => {
          set((state) => ({
            comandas: state.comandas.map(comanda =>
              comanda.id === comandaId
                ? { ...comanda, notes, updatedAt: new Date() }
                : comanda
            )
          }));
        },

        getComandaTotals: (comandaId: string): ComandaTotals => {
          const comanda = get().comandas.find(c => c.id === comandaId);
          if (!comanda) {
            return { subtotal: 0, discountAmount: 0, taxAmount: 0, total: 0, itemCount: 0 };
          }
          
          // En México, los precios ya incluyen IVA
          const total = comanda.items.reduce((sum, item) => sum + item.totalPrice, 0);
          const discountAmount = comanda.discountType === 'percentage' 
            ? total * (comanda.discount / 100) 
            : comanda.discount;
          const totalAfterDiscount = Math.max(0, total - discountAmount);
          
          // Desglosar IVA del total (16% incluido)
          const subtotal = totalAfterDiscount / 1.16;
          const taxAmount = totalAfterDiscount - subtotal;
          
          return {
            subtotal,
            discountAmount,
            taxAmount,
            total: totalAfterDiscount,
            itemCount: comanda.items.reduce((s, i) => s + i.quantity, 0)
          };
        },

        closeComanda: (comandaId: string) => {
          set((state) => ({
            comandas: state.comandas.map(comanda =>
              comanda.id === comandaId
                ? { ...comanda, status: 'CLOSED', updatedAt: new Date() }
                : comanda
            )
          }));
        }
      }),
      { name: 'ycc-comandas-storage' }
    )
  )
);
