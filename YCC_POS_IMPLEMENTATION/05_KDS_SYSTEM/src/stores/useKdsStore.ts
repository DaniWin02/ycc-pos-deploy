import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { io, Socket } from 'socket.io-client'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3004').replace(/\/api\/?$/, '');

export type KdsTicketStatus = 'NEW' | 'PREPARING' | 'READY' | 'SERVED' | 'CANCELLED'
export type KdsItemStatus = 'PENDING' | 'PREPARING' | 'READY'

export interface KdsTicketItem {
  id: string
  name: string
  quantity: number
  notes?: string
  status: KdsItemStatus
  image?: string
  modifiers?: Array<{ name: string; quantity: number }>
  estimatedTime?: number
  stationId?: string  // ID de la estación a la que pertenece este item
  marked?: boolean     // Marca visual del item (subrayado)
}

export interface KdsTicket {
  id: string
  folio: string
  items: KdsTicketItem[]
  status: KdsTicketStatus
  createdAt: Date
  completedAt?: Date
  deletedAt?: Date
  stationId?: string
  table?: string
  tableNumber?: string
  waiter?: string
  priority: 'normal' | 'rush' | 'HIGH' | 'NORMAL' | 'LOW'
  tipo?: 'MESA' | 'DOMICILIO' | 'LLEVAR'
  customerName?: string
  cliente?: string
  telefono?: string
  domicilio?: string
}

interface KdsState {
  tickets: KdsTicket[]
  completedTicketIds: string[] // Lista de IDs de tickets ya completados/cancelados (lista negra)
  stationId: string | null
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected'
  socket: any
  connect: () => void
  setStationId: (stationId: string) => void
  addTicket: (ticket: KdsTicket) => void
  updateTicket: (ticketId: string, updates: Partial<KdsTicket>) => void
  removeTicket: (ticketId: string) => void
  updateItemStatus: (ticketId: string, itemId: string, status: KdsItemStatus) => void
  toggleItemMarked: (ticketId: string, itemId: string) => void
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
  addToCompletedList: (ticketId: string) => void // Agregar ID a lista de completados
  isTicketCompleted: (ticketId: string) => boolean // Verificar si ticket fue completado
  clearHistory: () => void // Limpiar historial (tickets PREPARING y READY)
  clearHistoryByStation: (stationId: string) => void // Limpiar historial de una estación específica
  checkAndClearForNewDay: () => boolean // Verificar y limpiar si es nuevo día
  forceClearAll: () => void // Forzar limpieza completa
  cleanOldTickets: (hoursThreshold?: number) => void // Limpiar tickets antiguos (por defecto 24 horas)
}

// Cargar tickets desde localStorage al iniciar
const loadInitialTickets = (): KdsTicket[] => {
  try {
    const stored = localStorage.getItem('kds-tickets')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        console.warn('⚠️ Datos de tickets inválidos en localStorage, limpiando...')
        localStorage.removeItem('kds-tickets')
        return []
      }
      const tickets = parsed.map((t: any) => ({
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
    // Si hay un error de parsing, limpiar los datos corruptos
    localStorage.removeItem('kds-tickets')
  }
  return []
}

// Cargar lista de IDs de tickets completados desde localStorage
const loadCompletedTicketIds = (): string[] => {
  try {
    const stored = localStorage.getItem('kds-completed-ticket-ids')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) {
        console.warn('⚠️ Lista de completados inválida en localStorage, limpiando...')
        localStorage.removeItem('kds-completed-ticket-ids')
        return []
      }
      console.log('✅ Lista de tickets completados cargada:', parsed.length, 'IDs')
      return parsed
    }
  } catch (error) {
    console.error('❌ Error cargando lista de completados:', error)
    localStorage.removeItem('kds-completed-ticket-ids')
  }
  return []
}

// Verificar si es un nuevo día y limpiar TODO (comandas e historial)
const checkAndClearForNewDay = (): { isNewDay: boolean; clearedTickets: KdsTicket[]; clearedIds: string[] } => {
  try {
    const lastSessionDate = localStorage.getItem('kds-last-session-date')
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    if (lastSessionDate && lastSessionDate !== today) {
      console.log(`📅 NUEVO DÍA DETECTADO: ${today} (última sesión: ${lastSessionDate})`)
      console.log('🧹 Limpiando TODAS las comandas e historial del día anterior...')
      
      // Limpiar TODO el localStorage del KDS
      localStorage.removeItem('kds-tickets')
      localStorage.removeItem('kds-completed-ticket-ids')
      
      console.log('✅ Limpieza completada - Sistema listo para nuevo día')
      
      // Guardar fecha de hoy
      localStorage.setItem('kds-last-session-date', today)
      return { isNewDay: true, clearedTickets: [], clearedIds: [] }
    }
    
    // Guardar fecha de hoy si no existe
    if (!lastSessionDate) {
      localStorage.setItem('kds-last-session-date', today)
    }
    
    return { isNewDay: false, clearedTickets: loadInitialTickets(), clearedIds: loadCompletedTicketIds() }
  } catch (error) {
    console.error('❌ Error verificando fecha:', error)
    return { isNewDay: false, clearedTickets: [], clearedIds: [] }
  }
}

let socket: any = null;

// Verificar y limpiar al iniciar
const { isNewDay, clearedTickets, clearedIds } = checkAndClearForNewDay()

export const useKdsStore = create<KdsState>()(
  devtools(
    (set, get) => ({
      // Si es nuevo día, empezar limpio. Si no, cargar datos guardados
      tickets: isNewDay ? [] : clearedTickets,
      completedTicketIds: isNewDay ? [] : clearedIds,
      stationId: null,
      connectionStatus: 'connected',
      socket: null,
      connect: () => {
        const currentStationId = get().stationId
        if (currentStationId) {
          get().setStationId(currentStationId)
        } else {
          set({ connectionStatus: 'reconnecting' })
        }
      },

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
            socket = io(API_URL, {
              transports: ['polling', 'websocket'], // Polling primero para evitar warnings
              reconnectionDelay: 1000,
              reconnectionAttempts: 5
            });
            set({ socket })
            
            socket.on('connect', () => {
              console.log('🔌 Conectado a Socket.io');
              set({ connectionStatus: 'connected' });
              
              // Unirse a la sala de la estación
              socket.emit('join-station', stationId);
              console.log(`📍 Unido a estación: ${stationId}`);
            });
            
            socket.on('disconnect', () => {
              console.log('🔌 Desconectado de Socket.io');
              set({ connectionStatus: 'disconnected', socket: null });
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
                  notes: item.notes || '',
                  stationId: item.stationId,
                  stationName: item.stationName
                })),
                status: 'NEW' as KdsTicketStatus,
                createdAt: new Date(data.createdAt),
                table: data.table || data.customerName || 'Mostrador',
                priority: 'normal',
                tipo: data.orderType || 'MESA',
                waiter: data.waiterName || data.createdBy?.name
              };
              
              // Agregar ticket a la lista
              get().addTicket(newTicket);
              get().saveToStorage();
              
              console.log(`✅ Ticket agregado: ${newTicket.folio} con ${newTicket.items.length} items`);
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
        // SOLUCIÓN CLAVE: Verificar si el ticket está en la lista de completados (lista negra)
        if (s.completedTicketIds.includes(ticket.id)) {
          console.log(`🚫 Ticket ${ticket.folio} está en lista de completados, ignorando`);
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

      updateItemStatus: (ticketId, itemId, status) => {
        set((s) => ({
          tickets: s.tickets.map(t => {
            if (t.id !== ticketId) return t
            const items = t.items.map(i => i.id === itemId ? { ...i, status } : i)
            return { ...t, items }
          })
        }))
        get().saveToStorage()
      },

      toggleItemMarked: (ticketId, itemId) => {
        set((s) => ({
          tickets: s.tickets.map(t => {
            if (t.id !== ticketId) return t
            const items = t.items.map(i => i.id === itemId ? { ...i, marked: !i.marked } : i)
            return { ...t, items }
          })
        }))
        // Guardar en localStorage para persistir el estado marcado
        get().saveToStorage()
      },


      bumpTicket: async (ticketId) => {
        const ticket = get().tickets.find(t => t.id === ticketId)
        if (!ticket) return

        // Marcar ticket como SERVED directamente (todos los items ya están marcados)
        set((s) => ({
          tickets: s.tickets.map(t => {
            if (t.id !== ticketId) return t
            return { ...t, status: 'SERVED' as KdsTicketStatus, completedAt: new Date(), items: t.items.map(i => ({ ...i, status: 'READY' as KdsItemStatus })) }
          })
        }))

        // Agregar a lista de completados para que no reaparezca
        get().addToCompletedList(ticketId)
        console.log(`✅ Ticket ${ticket.folio} despachado y agregado a lista de completados`)

        get().saveToStorage()

        // Sincronizar con el backend - marcar items como DELIVERED
        try {
          const API_BASE_URL = `${API_URL}/api`

          const updatePromises = ticket.items.map(item =>
            fetch(`${API_BASE_URL}/order-items/${item.id}/status`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'DELIVERED' })
            })
          )

          await Promise.all(updatePromises)
          console.log(`✅ Items actualizados en backend: ${ticket.items.length} items → DELIVERED`)

        } catch (error) {
          console.error('❌ Error actualizando items en backend:', error)
        }
      },

      recallTicket: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId && t.status === 'SERVED'
              ? { ...t, status: 'NEW' as KdsTicketStatus, completedAt: undefined, items: t.items.map(i => ({ ...i, marked: false })) }
              : t
          )
        }))
        get().saveToStorage()
      },

      loadTickets: async () => {
        try {
          set({ connectionStatus: 'reconnecting' })
          
          // IMPORTANTE: Limpiar tickets antiguos antes de cargar nuevos
          get().cleanOldTickets(24)
          
          // IMPORTANTE: Cargar primero desde localStorage para no perder estados locales
          get().loadFromStorage()
          const currentTickets = get().tickets
          const completedIds = get().completedTicketIds
          
          console.log(`📋 Lista de tickets completados cargada:`, completedIds.length, 'IDs')
          
          // Cargar ventas desde el API
          const API_BASE_URL = `${API_URL}/api`
          const url = `${API_BASE_URL}/sales`
          console.log(`📡 Cargando TODOS los pedidos desde: ${url}`)
          
          const response = await fetch(url)
          if (!response.ok) throw new Error('Error cargando pedidos')
          
          const sales = await response.json()
          console.log(`📡 Pedidos recibidos del API:`, sales.length)
          
          // SOLUCIÓN CLAVE: Filtrar tickets que están en la lista de completados (lista negra)
          // Esto evita que tickets despachados/cancelados reaparezcan
          const filteredSales = sales.filter((sale: any) => {
            // Si el ticket está en la lista de completados, NO cargarlo
            if (completedIds.includes(sale.id)) {
              console.log(`🚫 Ignorando ticket ${sale.folio} - está en lista de completados`)
              return false
            }
            
            // FILTRAR: No cargar tickets antiguos (más de 24 horas)
            const createdAt = new Date(sale.createdAt)
            const ageMs = Date.now() - createdAt.getTime()
            const hoursOld = ageMs / (60 * 60 * 1000)
            if (hoursOld > 24) {
              console.log(`🚫 Ignorando ticket antiguo ${sale.folio} - ${Math.floor(hoursOld)} horas de antigüedad`)
              get().addToCompletedList(sale.id)
              return false
            }
            
            return true
          })
          
          console.log(`🎯 Pedidos después de filtrar completados y antiguos:`, filteredSales.length)
          
          // FILTRAR: Solo ventas activas (no completadas ni canceladas)
          const activeSales = filteredSales.filter((sale: any) => {
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
                
                const resolvedStationId = item.stationId || item.product?.stationId
                console.log(`🔍 Item "${item.productName}" - stationId directo: ${item.stationId}, product.stationId: ${item.product?.stationId}, resuelto: ${resolvedStationId}`)
                
                return {
                  id: item.id,
                  name: item.productName,
                  quantity: item.quantity,
                  notes: item.modifiers ? JSON.stringify(item.modifiers) : '',
                  status: itemStatus,
                  stationId: resolvedStationId
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
              
              // Para otros estados, mantener el estado local pero actualizar stationId desde el API
              const mergedItems = existing.items.map(existingItem => {
                const apiItem = newTicket.items.find(i => i.id === existingItem.id)
                if (apiItem) {
                  // Preservar estado local (marked, status) pero actualizar stationId desde API
                  return { ...existingItem, stationId: apiItem.stationId || existingItem.stationId }
                }
                return existingItem
              })
              // Agregar items nuevos del API que no existan localmente
              const newApiItems = newTicket.items.filter(apiItem => 
                !existing.items.find(ei => ei.id === apiItem.id)
              )
              return { ...existing, items: [...mergedItems, ...newApiItems] }
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
        const ticket = get().tickets.find(t => t.id === ticketId)
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId ? { ...t, deletedAt: new Date(), status: 'CANCELLED' as KdsTicketStatus } : t
          )
        }))
        // SOLUCIÓN CLAVE: Agregar a lista de completados para que no reaparezca
        get().addToCompletedList(ticketId)
        if (ticket) {
          console.log(`🚫 Ticket ${ticket.folio} cancelado y agregado a lista negra`)
        }
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

      // Agregar ticket ID a la lista de completados (lista negra)
      addToCompletedList: (ticketId: string) => {
        const { completedTicketIds } = get()
        if (!completedTicketIds.includes(ticketId)) {
          const newList = [...completedTicketIds, ticketId]
          set({ completedTicketIds: newList })
          localStorage.setItem('kds-completed-ticket-ids', JSON.stringify(newList))
          console.log(`🚫 Ticket ${ticketId} agregado a lista de completados`)
        }
      },

      // Verificar si un ticket está en la lista de completados
      isTicketCompleted: (ticketId: string) => {
        return get().completedTicketIds.includes(ticketId)
      },

      // Limpiar historial: mover todos los tickets PREPARING y READY a SERVED (completados)
      clearHistory: () => {
        const { tickets } = get()
        const historyTickets = tickets.filter(t => t.status === 'PREPARING' || t.status === 'READY')
        
        if (historyTickets.length === 0) {
          console.log('📋 No hay tickets en historial para limpiar')
          return
        }
        
        // Marcar cada ticket del historial como SERVED y agregar a lista de completados
        historyTickets.forEach(ticket => {
          get().addToCompletedList(ticket.id)
        })
        
        // Actualizar estado: eliminar tickets del historial (marcarlos como SERVED)
        set((s) => ({
          tickets: s.tickets.map(t =>
            (t.status === 'PREPARING' || t.status === 'READY')
              ? { ...t, status: 'SERVED' as KdsTicketStatus, completedAt: new Date() }
              : t
          )
        }))
        
        get().saveToStorage()
        console.log(`🧹 Historial limpiado: ${historyTickets.length} tickets marcados como SERVED`)
      },

      // Limpiar historial de una estación específica
      clearHistoryByStation: (stationId: string) => {
        const { tickets } = get()
        
        // Filtrar tickets en historial que tienen items de esta estación
        const stationHistoryTickets = tickets.filter(t => {
          const isInHistory = t.status === 'PREPARING' || t.status === 'READY'
          const hasStationItems = t.items.some(item => item.stationId === stationId)
          return isInHistory && hasStationItems
        })
        
        if (stationHistoryTickets.length === 0) {
          console.log(`📋 No hay tickets en historial para la estación ${stationId}`)
          return
        }
        
        // Marcar cada ticket como SERVED y agregar a lista de completados
        stationHistoryTickets.forEach(ticket => {
          get().addToCompletedList(ticket.id)
        })
        
        // Actualizar estado: marcar estos tickets como SERVED
        set((s) => ({
          tickets: s.tickets.map(t => {
            // Solo modificar tickets del historial de esta estación
            if ((t.status === 'PREPARING' || t.status === 'READY') && 
                t.items.some(item => item.stationId === stationId)) {
              return { ...t, status: 'SERVED' as KdsTicketStatus, completedAt: new Date() }
            }
            return t
          })
        }))
        
        get().saveToStorage()
        console.log(`🧹 Historial limpiado para estación ${stationId}: ${stationHistoryTickets.length} tickets marcados como SERVED`)
      },

      // Verificar si es un nuevo día y limpiar automáticamente
      checkAndClearForNewDay: () => {
        const lastSessionDate = localStorage.getItem('kds-last-session-date')
        const today = new Date().toISOString().split('T')[0]
        
        if (lastSessionDate && lastSessionDate !== today) {
          console.log(`📅 NUEVO DÍA DETECTADO en check: ${today} (última: ${lastSessionDate})`)
          get().forceClearAll()
          localStorage.setItem('kds-last-session-date', today)
          return true
        }
        
        if (!lastSessionDate) {
          localStorage.setItem('kds-last-session-date', today)
        }
        
        // Siempre limpiar tickets antiguos (más de 24 horas)
        get().cleanOldTickets(24)
        
        return false
      },

      // Forzar limpieza completa de todas las comandas e historial
      forceClearAll: () => {
        console.log('🧹 FORZANDO LIMPIEZA COMPLETA del KDS...')
        
        // Limpiar estado
        set({ tickets: [], completedTicketIds: [] })
        
        // Limpiar localStorage
        localStorage.removeItem('kds-tickets')
        localStorage.removeItem('kds-completed-ticket-ids')
        
        console.log('✅ Limpieza completa realizada')
      },

      // Limpiar tickets antiguos automáticamente (por defecto 24 horas)
      cleanOldTickets: (hoursThreshold: number = 24) => {
        const { tickets } = get()
        const now = new Date()
        const thresholdMs = hoursThreshold * 60 * 60 * 1000
        
        console.log(`🧹 Verificando tickets antiguos (más de ${hoursThreshold} horas)...`)
        
        // Encontrar tickets antiguos
        const oldTickets = tickets.filter(ticket => {
          const createdAt = new Date(ticket.createdAt)
          const ageMs = now.getTime() - createdAt.getTime()
          return ageMs > thresholdMs
        })
        
        if (oldTickets.length === 0) {
          console.log('✅ No hay tickets antiguos para limpiar')
          return
        }
        
        console.log(`🗑️ Encontrados ${oldTickets.length} tickets antiguos:`)
        oldTickets.forEach(ticket => {
          const ageHours = Math.floor((now.getTime() - new Date(ticket.createdAt).getTime()) / (60 * 60 * 1000))
          console.log(`  - ${ticket.folio} (${ticket.status}): ${ageHours} horas de antigüedad`)
        })
        
        // Agregar tickets antiguos a lista de completados
        oldTickets.forEach(ticket => {
          get().addToCompletedList(ticket.id)
        })
        
        // Eliminar tickets antiguos del estado
        set((s) => ({
          tickets: s.tickets.filter(t => {
            const createdAt = new Date(t.createdAt)
            const ageMs = now.getTime() - createdAt.getTime()
            return ageMs <= thresholdMs
          })
        }))
        
        get().saveToStorage()
        console.log(`✅ ${oldTickets.length} tickets antiguos eliminados`)
      },

      saveToStorage: () => {
        const { tickets, stationId, completedTicketIds } = get()
        
        // SOLUCIÓN: NO guardar tickets SERVED, CANCELLED o eliminados
        // Esto evita que reaparezcan al reiniciar el servidor
        const ticketsToSave = tickets
          .filter(t => {
            // NO guardar tickets despachados
            if (t.status === 'SERVED') {
              console.log(`🗑️ No guardando ticket SERVED: ${t.folio}`);
              return false;
            }
            // NO guardar tickets cancelados
            if (t.status === 'CANCELLED') {
              console.log(`🗑️ No guardando ticket CANCELLED: ${t.folio}`);
              return false;
            }
            // NO guardar tickets eliminados
            if (t.deletedAt) {
              console.log(`🗑️ No guardando ticket eliminado: ${t.folio}`);
              return false;
            }
            // Solo guardar tickets activos (NEW, PREPARING, READY)
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
        // También guardar la lista de completados
        localStorage.setItem('kds-completed-ticket-ids', JSON.stringify(completedTicketIds))
        console.log(`💾 Guardados ${ticketsToSave.length} tickets ACTIVOS y ${completedTicketIds.length} IDs de completados`);
      },

      loadFromStorage: () => {
        try {
          // Cargar tickets activos
          const stored = localStorage.getItem('kds-tickets')
          if (stored) {
            const rawTickets = JSON.parse(stored)
            
            // MIGRACIÓN: Si los items no tienen stationId, limpiar localStorage
            // para forzar recarga desde API con stationId actualizado
            const needsMigration = rawTickets.some((t: any) => 
              t.items && t.items.some((i: any) => !i.stationId)
            )
            if (needsMigration) {
              console.log('🔄 Migración: limpiando tickets sin stationId para recarga desde API')
              localStorage.removeItem('kds-tickets')
              set({ tickets: [] })
              return
            }
            
            const tickets = rawTickets.map((t: any) => ({
              ...t,
              createdAt: new Date(t.createdAt),
              completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
              deletedAt: t.deletedAt ? new Date(t.deletedAt) : undefined
            }))
            set({ tickets })
            console.log('✅ Tickets cargados desde localStorage:', tickets.length)
          }
          
          // Cargar lista de IDs completados (lista negra)
          const completedStored = localStorage.getItem('kds-completed-ticket-ids')
          if (completedStored) {
            const completedIds = JSON.parse(completedStored)
            set({ completedTicketIds: completedIds })
            console.log('✅ Lista de completados cargada desde localStorage:', completedIds.length)
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
