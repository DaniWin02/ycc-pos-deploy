import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { Comanda, ComandaTotals, CartItem, Product, ComandaType, SelectedModifier } from '../types';

interface ComandaAlert {
  id: string;
  message: string;
  type: 'warning' | 'info';
  comandaId: string;
}

interface ComandasState {
  comandas: Comanda[];
  activeComandaId: string | null;
  alerts: ComandaAlert[];
  lastAddedToComanda: string | null;
  
  // Acciones de comandas
  createComanda: (nombre: string, tipo: ComandaType) => string;
  deleteComanda: (comandaId: string) => void;
  duplicateComanda: (comandaId: string) => string | null;
  setActiveComanda: (comandaId: string) => void;
  setActiveComandaByIndex: (index: number) => void;
  getActiveComanda: () => Comanda | null;
  findComandasByName: (search: string) => Comanda[];
  
  // Acciones de items
  addItemToComanda: (comandaId: string, product: Product, quantity?: number, variantId?: string, variantName?: string, variantLabel?: string, variantPrice?: number, modifiers?: SelectedModifier[], notes?: string) => void;
  removeItemFromComanda: (comandaId: string, productId: string) => void;
  updateItemQuantity: (comandaId: string, productId: string, quantity: number) => void;
  
  // Acciones de configuración
  setComandaCustomerName: (comandaId: string, name: string) => void;
  setComandaCustomerId: (comandaId: string, customerId: string | undefined) => void;
  setComandaDiscount: (comandaId: string, discount: number, type: 'percentage' | 'amount') => void;
  setComandaNotes: (comandaId: string, notes: string) => void;
  setComandaPriority: (comandaId: string, priority: 'normal' | 'high' | 'urgent') => void;
  
  // Cálculos
  getComandaTotals: (comandaId: string) => ComandaTotals;
  getGlobalTotals: () => { totalComandas: number; totalItems: number; totalAmount: number };
  getComandaElapsedTime: (comandaId: string) => number;
  getComandaTimeDisplay: (comandaId: string) => string;
  
  // Alertas
  checkTimeAlerts: () => void;
  dismissAlert: (alertId: string) => void;
  clearLastAdded: () => void;
  
  // Cerrar comanda
  closeComanda: (comandaId: string) => void;
  
  // Reordenar
  reorderComandas: (comandaIds: string[]) => void;

  // Limpiar todas las comandas (al iniciar sesión)
  clearAllComandas: () => void;
  
  // Resetear estado de orden completamente
  resetOrderState: (comandaId: string) => void;

  // Validar y sincronizar estado (fuente única de verdad)
  validateAndSyncState: () => void;
}

export const useComandasStore = create<ComandasState>()(
  devtools(
    persist(
      (set, get) => ({
        comandas: [],
        activeComandaId: null,
        alerts: [],
        lastAddedToComanda: null,

        clearAllComandas: () => {
          set({ comandas: [], activeComandaId: null, alerts: [], lastAddedToComanda: null });
        },

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
            priority: 'normal',
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
              activeComandaId: newActiveId,
              alerts: state.alerts.filter(a => a.comandaId !== comandaId)
            };
          });
          console.log('🗑️ Comanda eliminada:', comandaId);
        },

        duplicateComanda: (comandaId: string) => {
          const original = get().comandas.find(c => c.id === comandaId);
          if (!original) return null;
          
          const duplicated: Comanda = {
            ...original,
            id: `comanda-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            nombre: `${original.nombre} (Copia)`,
            items: original.items.map(item => ({ ...item })),
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          set((state) => ({
            comandas: [...state.comandas, duplicated],
            activeComandaId: duplicated.id
          }));
          
          console.log('📋 Comanda duplicada:', duplicated.nombre);
          return duplicated.id;
        },

        setActiveComanda: (comandaId: string) => {
          const comanda = get().comandas.find(c => c.id === comandaId);
          if (comanda) {
            set({ activeComandaId: comandaId });
            console.log('📌 Comanda activa:', comanda.nombre);
          }
        },

        setActiveComandaByIndex: (index: number) => {
          const activeComandas = get().comandas.filter(c => c.status === 'ACTIVE');
          if (index >= 0 && index < activeComandas.length) {
            const comandaId = activeComandas[index].id;
            set({ activeComandaId: comandaId });
            console.log(`📌 Comanda activa (índice ${index}):`, activeComandas[index].nombre);
          }
        },

        getActiveComanda: () => {
          const { comandas, activeComandaId } = get();
          if (!activeComandaId) return null;
          const comanda = comandas.find(c => c.id === activeComandaId);
          // CRITICAL: Solo retornar si la comanda está ACTIVE
          // Una comanda CLOSED/CANCELLED no debe ser considerada activa
          if (!comanda || comanda.status !== 'ACTIVE') return null;
          return comanda;
        },

        findComandasByName: (search: string) => {
          const searchLower = search.toLowerCase();
          return get().comandas.filter(c => 
            c.status === 'ACTIVE' && 
            (c.nombre.toLowerCase().includes(searchLower) || 
             c.customerName?.toLowerCase().includes(searchLower))
          );
        },

        addItemToComanda: (comandaId: string, product: Product, quantity = 1, variantId?: string, variantName?: string, variantLabel?: string, variantPrice?: number, modifiers?: SelectedModifier[], notes?: string) => {
          // CRITICAL: No agregar items a comandas que no estén ACTIVE
          const comanda = get().comandas.find(c => c.id === comandaId);
          if (!comanda || comanda.status !== 'ACTIVE') {
            console.error('❌ No se puede agregar item a comanda inactiva/cerrada:', comandaId, comanda?.status);
            return;
          }
          
          const basePrice = variantPrice ?? product.price;
          const modifiersTotal = modifiers?.reduce((sum, m) => sum + m.priceAdd, 0) || 0;
          const unitPrice = basePrice + modifiersTotal;
          const displayName = variantName ? `${product.name} (${variantName})` : product.name;
          const effectiveSku = variantId ? `${product.sku}-${variantId}` : product.sku;
          
          set((state) => ({
            comandas: state.comandas.map(comanda => {
              if (comanda.id !== comandaId) return comanda;
              
              // Buscar item existente por productId + variantId + modifiers (mismo combo = incrementar qty)
              const modifiersKey = modifiers ? modifiers.map(m => m.modifierId).sort().join(',') : '';
              const existingIndex = comanda.items.findIndex(i => {
                const itemModifiersKey = i.modifiers ? i.modifiers.map(m => m.modifierId).sort().join(',') : '';
                return i.productId === product.id 
                  && (i.variantId || '') === (variantId || '')
                  && itemModifiersKey === modifiersKey;
              });
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
                  name: displayName,
                  sku: effectiveSku,
                  unitPrice,
                  quantity,
                  totalPrice: unitPrice * quantity,
                  categoryName: product.categoryName,
                  stationId: product.stationId || product.station?.id,
                  stationName: product.station?.displayName || product.station?.name,
                  variantId: variantId || undefined,
                  variantName: variantName || undefined,
                  variantLabel: variantLabel || undefined,
                  modifiers: modifiers && modifiers.length > 0 ? modifiers : undefined,
                  notes: notes || undefined
                });
              }
              
              return {
                ...comanda,
                items: newItems,
                updatedAt: new Date()
              };
            }),
            lastAddedToComanda: comandaId
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

        setComandaCustomerId: (comandaId: string, customerId: string | undefined) => {
          set((state) => ({
            comandas: state.comandas.map(comanda =>
              comanda.id === comandaId
                ? { ...comanda, customerId, updatedAt: new Date() }
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

        setComandaPriority: (comandaId: string, priority: 'normal' | 'high' | 'urgent') => {
          set((state) => ({
            comandas: state.comandas.map(comanda =>
              comanda.id === comandaId
                ? { ...comanda, priority, updatedAt: new Date() }
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

        getGlobalTotals: () => {
          const activeComandas = get().comandas.filter(c => c.status === 'ACTIVE');
          let totalItems = 0;
          let totalAmount = 0;
          
          activeComandas.forEach(comanda => {
            const totals = get().getComandaTotals(comanda.id);
            totalItems += totals.itemCount;
            totalAmount += totals.total;
          });
          
          return {
            totalComandas: activeComandas.length,
            totalItems,
            totalAmount
          };
        },

        getComandaElapsedTime: (comandaId: string) => {
          const comanda = get().comandas.find(c => c.id === comandaId);
          if (!comanda) return 0;
          return Date.now() - new Date(comanda.createdAt).getTime();
        },

        getComandaTimeDisplay: (comandaId: string) => {
          const elapsed = get().getComandaElapsedTime(comandaId);
          const minutes = Math.floor(elapsed / 60000);
          const hours = Math.floor(minutes / 60);
          
          if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
          }
          return `${minutes}m`;
        },

        checkTimeAlerts: () => {
          const { comandas } = get();
          const alerts: ComandaAlert[] = [];
          
          comandas.filter(c => c.status === 'ACTIVE').forEach(comanda => {
            const elapsed = get().getComandaElapsedTime(comanda.id);
            const minutes = Math.floor(elapsed / 60000);
            
            if (minutes > 60) {
              alerts.push({
                id: `alert-${comanda.id}-${Date.now()}`,
                message: `${comanda.nombre}: ${minutes} minutos`,
                type: 'warning',
                comandaId: comanda.id
              });
            } else if (minutes > 30 && comanda.priority === 'urgent') {
              alerts.push({
                id: `alert-${comanda.id}-${Date.now()}`,
                message: `${comanda.nombre}: Urgente - ${minutes} min`,
                type: 'warning',
                comandaId: comanda.id
              });
            }
          });
          
          set({ alerts });
        },

        dismissAlert: (alertId: string) => {
          set((state) => ({
            alerts: state.alerts.filter(a => a.id !== alertId)
          }));
        },

        clearLastAdded: () => {
          set({ lastAddedToComanda: null });
        },

        reorderComandas: (comandaIds: string[]) => {
          set((state) => ({
            comandas: comandaIds
              .map(id => state.comandas.find(c => c.id === id))
              .filter((c): c is Comanda => c !== undefined)
              .concat(state.comandas.filter(c => !comandaIds.includes(c.id)))
          }));
        },

        closeComanda: (comandaId: string) => {
          set((state) => {
            // Cerrar la comanda actual y limpiar completamente sus items y datos
            const updatedComandas = state.comandas.map(comanda =>
              comanda.id === comandaId
                ? { 
                    ...comanda, 
                    status: 'CLOSED' as const, 
                    items: [], 
                    customerId: undefined,
                    customerName: '',
                    notes: '',
                    discount: 0,
                    discountType: 'percentage' as const,
                    updatedAt: new Date() 
                  }
                : comanda
            );
            
            // Buscar otra comanda activa para hacerla la activa
            const activeComandas = updatedComandas.filter(c => c.status === 'ACTIVE');
            const newActiveComandaId = activeComandas.length > 0 
              ? activeComandas[0].id 
              : null;
            
            return {
              comandas: updatedComandas,
              activeComandaId: newActiveComandaId
            };
          });
        },

        resetOrderState: (comandaId: string) => {
          set((state) => ({
            comandas: state.comandas.map(comanda =>
              comanda.id === comandaId
                ? {
                    ...comanda,
                    items: [],
                    customerId: undefined,
                    customerName: '',
                    notes: '',
                    discount: 0,
                    discountType: 'percentage',
                    updatedAt: new Date()
                  }
                : comanda
            )
          }));
        },

        // CRITICAL: Validar y sincronizar estado al iniciar/rehidratar
        // Garantiza que nunca exista un carrito sin comanda activa válida
        validateAndSyncState: () => {
          const { comandas, activeComandaId } = get();
          let needsFix = false;
          let newActiveId = activeComandaId;

          // 1. Verificar que activeComandaId apunta a una comanda ACTIVE válida
          if (activeComandaId) {
            const activeComanda = comandas.find(c => c.id === activeComandaId);
            if (!activeComanda || activeComanda.status !== 'ACTIVE') {
              console.warn('⚠️ activeComandaId apunta a comanda inválida/cerrada, corrigiendo...');
              newActiveId = null;
              needsFix = true;
            }
          }

          // 2. Si no hay comanda activa, buscar la primera ACTIVE disponible
          if (!newActiveId) {
            const firstActive = comandas.find(c => c.status === 'ACTIVE');
            if (firstActive) {
              newActiveId = firstActive.id;
              needsFix = true;
            }
          }

          // 3. Limpiar items de comandas CLOSED/CANCELLED (seguridad extra)
          const cleanedComandas = comandas.map(c => {
            if (c.status !== 'ACTIVE' && c.items.length > 0) {
              console.warn(`⚠️ Comanda ${c.nombre} (${c.status}) tenía items, limpiando...`);
              needsFix = true;
              return { ...c, items: [] };
            }
            return c;
          });

          if (needsFix) {
            console.log('🔧 Estado corregido: activeComandaId=', newActiveId);
            set({ comandas: cleanedComandas, activeComandaId: newActiveId });
          }
        }
      }),
      { name: 'ycc-comandas-storage' }
    )
  )
);
