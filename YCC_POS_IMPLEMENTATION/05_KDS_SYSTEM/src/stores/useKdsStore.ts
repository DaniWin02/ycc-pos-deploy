import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type KdsTicketStatus = 'NEW' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
export type KdsItemStatus = 'PENDING' | 'PREPARING' | 'READY'

export interface KdsTicketItem {
  id: string
  name: string
  quantity: number
  notes?: string
  status: KdsItemStatus
  image?: string
  stationId?: string  // ID de la estación a la que pertenece este item
}

export interface KdsTicket {
  id: string
  folio: string
  items: KdsTicketItem[]
  status: KdsTicketStatus
  createdAt: Date
  completedAt?: Date
  deletedAt?: Date
  table?: string
  waiter?: string
  priority: 'normal' | 'rush'
  tipo?: 'MESA' | 'DOMICILIO' | 'LLEVAR'
  cliente?: string
  telefono?: string
  domicilio?: string
}

interface KdsState {
  tickets: KdsTicket[]
  stationId: string | null
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected'
  setStationId: (stationId: string) => void
  addTicket: (ticket: KdsTicket) => void
  updateTicket: (ticketId: string, updates: Partial<KdsTicket>) => void
  removeTicket: (ticketId: string) => void
  updateItemStatus: (ticketId: string, itemId: string, status: KdsItemStatus) => void
  bumpTicket: (ticketId: string) => void
  recallTicket: (ticketId: string) => void
  deleteTicket: (ticketId: string) => void
  restoreTicket: (ticketId: string) => void
  permanentDeleteTicket: (ticketId: string) => void
  moveToHistory: (ticketId: string) => void  // Mover a historial (subrayar/en preparación)
  markAsReady: (ticketId: string) => void    // Marcar como listo desde historial
  returnToActive: (ticketId: string) => void // Regresar a preparación desde historial
  loadTickets: () => Promise<void>
  saveToStorage: () => void
  loadFromStorage: () => void
}

// Cargar tickets desde localStorage al iniciar
const loadInitialTickets = (): KdsTicket[] => {
  try {
    const stored = localStorage.getItem('kds-tickets')
    if (stored) {
      const tickets = JSON.parse(stored).map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
        deletedAt: t.deletedAt ? new Date(t.deletedAt) : undefined
      }))
      console.log('✅ Tickets cargados desde localStorage al iniciar:', tickets.length)
      return tickets
    }
  } catch (error) {
    console.error('❌ Error cargando desde localStorage:', error)
  }
  return []
}

// Socket.io instance (singleton)
let socket: any = null;

export const useKdsStore = create<KdsState>()(
  devtools(
    (set, get) => ({
      tickets: loadInitialTickets(),
      stationId: null,
      connectionStatus: 'connected',

      setStationId: (stationId) => {
        set({ stationId });
        
        // Conectar a Socket.io cuando se selecciona estación
        if (typeof window !== 'undefined') {
          import('socket.io-client').then(({ io }) => {
            // Desconectar socket anterior si existe
            if (socket) {
              socket.disconnect();
            }
            
            // Crear nueva conexión
            socket = io('http://localhost:3004', {
              transports: ['websocket', 'polling']
            });
            
            socket.on('connect', () => {
              console.log('🔌 Conectado a Socket.io');
              set({ connectionStatus: 'connected' });
              
              // Unirse a la sala de la estación
              socket.emit('join-station', stationId);
              console.log(`📍 Unido a estación: ${stationId}`);
            });
            
            socket.on('disconnect', () => {
              console.log('🔌 Desconectado de Socket.io');
              set({ connectionStatus: 'disconnected' });
            });
            
            socket.on('reconnecting', () => {
              console.log('🔄 Reconectando...');
              set({ connectionStatus: 'reconnecting' });
            });
            
            // Escuchar nuevas órdenes para esta estación
            socket.on('order:new', (data: any) => {
              console.log('📥 Nueva orden recibida:', data);
              
              // Crear ticket desde la orden
              const newTicket: KdsTicket = {
                id: data.orderId,
                folio: data.folio,
                items: data.items.map((item: any, index: number) => ({
                  id: `${data.orderId}-item-${index}`,
                  name: item.name,
                  quantity: item.quantity,
                  status: 'PENDING' as KdsItemStatus,
                  notes: ''
                })),
                status: 'NEW' as KdsTicketStatus,
                createdAt: new Date(data.createdAt),
                table: data.customerName || 'Mostrador',
                priority: 'normal',
                tipo: 'MESA'
              };
              
              // Agregar ticket a la lista
              get().addTicket(newTicket);
              get().saveToStorage();
              
              console.log(`✅ Ticket agregado: ${newTicket.folio}`);
            });
            
            // Escuchar actualizaciones de órdenes
            socket.on('order:updated', (data: any) => {
              console.log('🔄 Orden actualizada:', data);
              // Actualizar ticket si existe
              if (data.orderId) {
                get().updateTicket(data.orderId, {
                  status: data.status
                });
                get().saveToStorage();
              }
            });
          });
        }
      },

      addTicket: (ticket) => set((s) => {
        // Verificar si el ticket ya existe
        const exists = s.tickets.find(t => t.id === ticket.id);
        if (exists) {
          console.log(`⚠️ Ticket ${ticket.folio} ya existe, no se agrega duplicado`);
          return { tickets: s.tickets };
        }
        return { tickets: [ticket, ...s.tickets] };
      }),

      updateTicket: (ticketId, updates) => set((s) => ({
        tickets: s.tickets.map(t => t.id === ticketId ? { ...t, ...updates } : t)
      })),

      removeTicket: (ticketId) => set((s) => ({
        tickets: s.tickets.filter(t => t.id !== ticketId)
      })),

      updateItemStatus: (ticketId, itemId, status) => set((s) => ({
        tickets: s.tickets.map(t => {
          if (t.id !== ticketId) return t
          const items = t.items.map(i => i.id === itemId ? { ...i, status } : i)
          const allReady = items.every(i => i.status === 'READY')
          const anyPrep = items.some(i => i.status === 'PREPARING')
          const newStatus: KdsTicketStatus = allReady ? 'READY' : anyPrep ? 'PREPARING' : t.status
          return { ...t, items, status: newStatus }
        })
      })),

      bumpTicket: async (ticketId) => {
        const ticket = get().tickets.find(t => t.id === ticketId)
        if (!ticket) return
        
        let newItemStatus: string = 'PENDING'
        let newTicketStatus: KdsTicketStatus = ticket.status
        
        // Determinar nuevo estado para los items de ESTA estación
        if (ticket.status === 'NEW') {
          newItemStatus = 'PREPARING'
          newTicketStatus = 'PREPARING'
        } else if (ticket.status === 'PREPARING') {
          newItemStatus = 'READY'
          newTicketStatus = 'READY'
        } else if (ticket.status === 'READY') {
          newItemStatus = 'DELIVERED'
          newTicketStatus = 'SERVED'
        }
        
        // Actualizar estado localmente primero
        set((s) => ({
          tickets: s.tickets.map(t => {
            if (t.id !== ticketId) return t
            if (t.status === 'NEW') return { ...t, status: 'PREPARING' as KdsTicketStatus, items: t.items.map(i => ({ ...i, status: 'PREPARING' as KdsItemStatus })) }
            if (t.status === 'PREPARING') return { ...t, status: 'READY' as KdsTicketStatus, items: t.items.map(i => ({ ...i, status: 'READY' as KdsItemStatus })) }
            if (t.status === 'READY') return { ...t, status: 'SERVED' as KdsTicketStatus, completedAt: new Date() }
            return t
          })
        }))
        get().saveToStorage()
        
        // Sincronizar con el backend - ACTUALIZAR ITEMS, NO LA ORDEN COMPLETA
        try {
          const API_BASE_URL = 'http://localhost:3004/api'
          
          // Actualizar el estado de cada item de esta estación
          const updatePromises = ticket.items.map(item => 
            fetch(`${API_BASE_URL}/order-items/${item.id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newItemStatus })
            })
          )
          
          await Promise.all(updatePromises)
          console.log(`✅ Items de estación actualizados: ${ticket.items.length} items → ${newItemStatus}`)
          
        } catch (error) {
          console.error('❌ Error actualizando items en backend:', error)
        }
      },

      recallTicket: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId && t.status === 'SERVED'
              ? { ...t, status: 'READY' as KdsTicketStatus, completedAt: undefined }
              : t
          )
        }))
        get().saveToStorage()
      },

      loadTickets: async () => {
        try {
          set({ connectionStatus: 'reconnecting' })
          
          // IMPORTANTE: Cargar primero desde localStorage para no perder estados locales
          get().loadFromStorage()
          const currentTickets = get().tickets
          
          // Cargar ventas desde el API
          const API_BASE_URL = 'http://localhost:3004/api'
          const url = `${API_BASE_URL}/sales`
          console.log(`📡 Cargando TODOS los pedidos desde: ${url}`)
          
          const response = await fetch(url)
          if (!response.ok) throw new Error('Error cargando pedidos')
          
          const sales = await response.json()
          console.log(`📡 Pedidos recibidos del API:`, sales.length)
          
          // FILTRAR: Solo ventas activas (no completadas ni canceladas)
          const activeSales = sales.filter((sale: any) => {
            if (!sale.items || sale.items.length === 0) return false
            // Mostrar si no está completado ni cancelado
            return sale.status !== 'DELIVERED' && sale.status !== 'CANCELLED'
          })
          
          console.log(`🎯 Ventas activas:`, activeSales.length, 'de', sales.length)
          
          // Transformar ventas del API a tickets KDS
          const newTicketsFromAPI: KdsTicket[] = activeSales
            .map((sale: any) => {
            console.log(`\n📦 Procesando venta ${sale.folio} con ${sale.items?.length || 0} items`)

            // Mapear estados del nuevo enum OrderStatus a estados KDS
            let kdsStatus: KdsTicketStatus = 'NEW'
            if (sale.status === 'DELIVERED') kdsStatus = 'SERVED'
            else if (sale.status === 'CANCELLED') kdsStatus = 'CANCELLED'
            else if (sale.status === 'READY') kdsStatus = 'READY'
            else if (sale.status === 'PREPARING') kdsStatus = 'PREPARING'
            else if (sale.status === 'PENDING') kdsStatus = 'NEW'
            
            // MAPEAR TODOS LOS ITEMS (sin filtrar por estación - el filtro se hace en el frontend)
            const allItems = sale.items
              .filter((item: any) => item.status !== 'DELIVERED')
              .map((item: any) => {
                // Mapear estado del item desde el backend
                let itemStatus: KdsItemStatus = 'PENDING'
                if (item.status === 'PREPARING') itemStatus = 'PREPARING'
                else if (item.status === 'READY') itemStatus = 'READY'
                
                return {
                  id: item.id,
                  name: item.productName,
                  quantity: item.quantity,
                  notes: item.modifiers ? JSON.stringify(item.modifiers) : '',
                  status: itemStatus,
                  stationId: item.stationId || item.product?.stationId  // Guardar el stationId del item
                }
              })
            
            return {
              id: sale.id,
              folio: sale.folio,
              items: allItems,
              status: kdsStatus,
              createdAt: new Date(sale.createdAt),
              completedAt: sale.status === 'DELIVERED' ? new Date(sale.updatedAt) : undefined,
              table: sale.customerName || undefined,
              waiter: sale.createdBy ? `${sale.createdBy.firstName} ${sale.createdBy.lastName}` : undefined,
              priority: 'normal' as const,
              tipo: 'MESA',
              cliente: sale.customerName || undefined
            }
          })
          .filter((ticket: any) => ticket.items.length > 0); // Eliminar tickets sin items
          
          // Merge: mantener estado de tickets existentes, agregar solo nuevos
          const mergedTickets = newTicketsFromAPI.map(newTicket => {
            const existing = currentTickets.find(t => t.id === newTicket.id)
            if (existing) {
              // PRIORIDAD ABSOLUTA: Si el ticket local está SERVED, CANCELLED o eliminado, mantenerlo así
              if (existing.status === 'SERVED' || existing.status === 'CANCELLED' || existing.deletedAt) {
                console.log(`🔒 Manteniendo estado local de ticket ${existing.folio}: ${existing.status}`)
                return existing
              }
              
              // Para otros estados, mantener el estado local (puede estar más avanzado)
              return existing
            }
            // Es un ticket nuevo, agregarlo
            return newTicket
          })
          
          // Mantener tickets que no vienen del API pero están en localStorage (ej: tickets borrados)
          const localOnlyTickets = currentTickets.filter(localTicket => 
            !newTicketsFromAPI.find(apiTicket => apiTicket.id === localTicket.id)
          )
          
          // Combinar tickets del API con tickets locales
          const allTickets = [...mergedTickets, ...localOnlyTickets]
          
          set({ tickets: allTickets as KdsTicket[], connectionStatus: 'connected' })
          get().saveToStorage() // Guardar en localStorage
          console.log('✅ Pedidos cargados:', allTickets.length, '| Servidos:', allTickets.filter(t => t.status === 'SERVED').length, '| Papelera:', allTickets.filter(t => t.deletedAt).length)
        } catch (error) {
          console.error('❌ Error cargando tickets:', error)
          set({ connectionStatus: 'disconnected' })
        }
      },

      deleteTicket: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId ? { ...t, deletedAt: new Date(), status: 'CANCELLED' as KdsTicketStatus } : t
          )
        }))
        get().saveToStorage()
      },

      restoreTicket: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId ? { ...t, deletedAt: undefined, status: 'NEW' as KdsTicketStatus } : t
          )
        }))
        get().saveToStorage()
      },

      permanentDeleteTicket: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.filter(t => t.id !== ticketId)
        }))
        get().saveToStorage()
      },

      // Mover ticket a historial (marcar como "en preparación")
      moveToHistory: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId
              ? { ...t, status: 'PREPARING' as KdsTicketStatus }
              : t
          )
        }))
        get().saveToStorage()
        console.log(`📋 Ticket ${ticketId} movido a historial (PREPARING)`)
      },

      // Marcar como listo desde historial
      markAsReady: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId && t.status === 'PREPARING'
              ? { ...t, status: 'READY' as KdsTicketStatus }
              : t
          )
        }))
        get().saveToStorage()
        console.log(`✅ Ticket ${ticketId} marcado como READY`)
      },

      // Regresar a preparación (desde historial a comandas activas)
      returnToActive: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId && (t.status === 'PREPARING' || t.status === 'READY')
              ? { ...t, status: 'NEW' as KdsTicketStatus }
              : t
          )
        }))
        get().saveToStorage()
        console.log(`🔄 Ticket ${ticketId} regresado a comandas activas (NEW)`)
      },

      saveToStorage: () => {
        const { tickets, stationId } = get()
        
        // Limpiar tickets antiguos: eliminar SERVED y eliminados de hace más de 1 hora
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const ticketsToSave = tickets
          .filter(t => {
            // Eliminar tickets SERVED de hace más de 1 hora
            if (t.status === 'SERVED' && t.completedAt && t.completedAt < oneHourAgo) {
              console.log(`🗑️ Limpiando ticket SERVED antiguo: ${t.folio}`);
              return false;
            }
            // Eliminar tickets eliminados definitivamente de hace más de 1 hora
            if (t.deletedAt && t.deletedAt < oneHourAgo) {
              console.log(`🗑️ Limpiando ticket eliminado antiguo: ${t.folio}`);
              return false;
            }
            return true;
          })
          .map(t => ({
            ...t,
            createdAt: t.createdAt.toISOString(),
            completedAt: t.completedAt?.toISOString(),
            deletedAt: t.deletedAt?.toISOString(),
            stationId // Guardar la estación para filtrar al cargar
          }));
        
        localStorage.setItem('kds-tickets', JSON.stringify(ticketsToSave))
        console.log(`💾 Guardados ${ticketsToSave.length} tickets en localStorage (estación: ${stationId})`);
      },

      loadFromStorage: () => {
        try {
          const stored = localStorage.getItem('kds-tickets')
          if (stored) {
            const tickets = JSON.parse(stored).map((t: any) => ({
              ...t,
              createdAt: new Date(t.createdAt),
              completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
              deletedAt: t.deletedAt ? new Date(t.deletedAt) : undefined
            }))
            set({ tickets })
            console.log('✅ Tickets cargados desde localStorage:', tickets.length)
          }
        } catch (error) {
          console.error('❌ Error cargando desde localStorage:', error)
        }
      },
    }),
    { 
      name: 'kds-store',
      onRehydrateStorage: () => (state: KdsState | undefined) => {
        state?.loadFromStorage()
      }
    }
  )
)
