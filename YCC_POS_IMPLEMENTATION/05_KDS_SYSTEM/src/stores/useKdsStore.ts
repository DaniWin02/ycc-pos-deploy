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
}

export interface KdsTicket {
  id: string
  folio: string
  items: KdsTicketItem[]
  status: KdsTicketStatus
  createdAt: Date
  table?: string
  waiter?: string
  priority: 'normal' | 'rush'
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
}

export const useKdsStore = create<KdsState>()(
  devtools(
    (set, get) => ({
      tickets: [],
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

      bumpTicket: (ticketId) => set((s) => ({
        tickets: s.tickets.map(t => {
          if (t.id !== ticketId) return t
          if (t.status === 'NEW') return { ...t, status: 'PREPARING' as KdsTicketStatus, items: t.items.map(i => ({ ...i, status: 'PREPARING' as KdsItemStatus })) }
          if (t.status === 'PREPARING') return { ...t, status: 'READY' as KdsTicketStatus, items: t.items.map(i => ({ ...i, status: 'READY' as KdsItemStatus })) }
          if (t.status === 'READY') return { ...t, status: 'SERVED' as KdsTicketStatus }
          return t
        })
      })),

      recallTicket: (ticketId) => set((s) => ({
        tickets: s.tickets.map(t =>
          t.id === ticketId && t.status === 'SERVED'
            ? { ...t, status: 'READY' as KdsTicketStatus }
            : t
        )
      })),
    }),
    { name: 'kds-store' }
  )
)
