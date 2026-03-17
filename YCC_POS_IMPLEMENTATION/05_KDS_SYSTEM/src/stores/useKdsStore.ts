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

export const useKdsStore = create<KdsState>()(
  devtools(
    (set, get) => ({
      tickets: loadInitialTickets(),
      stationId: null,
      connectionStatus: 'connected',

      setStationId: (stationId) => set({ stationId }),

      addTicket: (ticket) => set((s) => ({ tickets: [ticket, ...s.tickets] })),

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

      bumpTicket: (ticketId) => {
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
          // Cargar comandas desde el API
          const comandasResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3004'}/comandas`)
          const comandas = await comandasResponse.json()
          
          // Obtener tickets actuales del store
          const currentTickets = get().tickets
          
          // Transformar comandas del API a tickets KDS
          const newTicketsFromAPI: KdsTicket[] = comandas.map((comanda: any) => ({
            id: comanda.id,
            folio: comanda.folio,
            items: comanda.items.map((item: any) => ({
              id: item.id,
              name: item.nombre,
              quantity: item.cantidad,
              notes: item.notas || '',
              status: item.estado === 'LISTO' ? 'READY' : item.estado === 'PREPARANDO' ? 'PREPARING' : 'PENDING' as KdsItemStatus
            })),
            status: comanda.estado === 'ENTREGADO' ? 'SERVED' : comanda.estado === 'CANCELADO' ? 'CANCELLED' : comanda.estado === 'LISTO' ? 'READY' : comanda.estado === 'PREPARANDO' ? 'PREPARING' : 'NEW' as KdsTicketStatus,
            createdAt: new Date(comanda.createdAt),
            completedAt: comanda.completedAt ? new Date(comanda.completedAt) : undefined,
            table: comanda.mesa || undefined,
            waiter: comanda.mesero || undefined,
            priority: comanda.prioridad === 'ALTA' || comanda.prioridad === 'URGENTE' ? 'rush' : 'normal' as const,
            tipo: comanda.tipo,
            cliente: comanda.cliente,
            telefono: comanda.telefono,
            domicilio: comanda.domicilio
          }))
          
          // Merge: mantener estado de tickets existentes, agregar solo nuevos
          const mergedTickets = newTicketsFromAPI.map(newTicket => {
            const existing = currentTickets.find(t => t.id === newTicket.id)
            if (existing) {
              // Mantener el estado actual del ticket existente (incluyendo SERVED, deletedAt, etc.)
              return existing
            }
            // Es un ticket nuevo, agregarlo con estado NEW
            return newTicket
          })
          
          // Mantener tickets que no vienen del API pero están en localStorage (ej: tickets borrados)
          const localOnlyTickets = currentTickets.filter(localTicket => 
            !newTicketsFromAPI.find(apiTicket => apiTicket.id === localTicket.id)
          )
          
          // Combinar tickets del API con tickets locales
          const allTickets = [...mergedTickets, ...localOnlyTickets]
          
          set({ tickets: allTickets, connectionStatus: 'connected' })
          get().saveToStorage() // Guardar en localStorage
          console.log('✅ Comandas cargadas:', allTickets.length, '| Servidos:', allTickets.filter(t => t.status === 'SERVED').length, '| Papelera:', allTickets.filter(t => t.deletedAt).length)
        } catch (error) {
          console.error('❌ Error cargando tickets:', error)
          set({ connectionStatus: 'disconnected' })
        }
      },

      deleteTicket: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId ? { ...t, deletedAt: new Date() } : t
          )
        }))
        get().saveToStorage()
      },

      restoreTicket: (ticketId) => {
        set((s) => ({
          tickets: s.tickets.map(t =>
            t.id === ticketId ? { ...t, deletedAt: undefined } : t
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

      saveToStorage: () => {
        const { tickets } = get()
        const ticketsToSave = tickets.map(t => ({
          ...t,
          createdAt: t.createdAt.toISOString(),
          completedAt: t.completedAt?.toISOString(),
          deletedAt: t.deletedAt?.toISOString()
        }))
        localStorage.setItem('kds-tickets', JSON.stringify(ticketsToSave))
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
      onRehydrateStorage: () => (state) => {
        state?.loadFromStorage()
      }
    }
  )
)
