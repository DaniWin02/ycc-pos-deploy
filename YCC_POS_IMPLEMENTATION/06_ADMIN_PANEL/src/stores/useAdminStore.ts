import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface AdminState {
  currentStore: string
  currentStoreName: string
  setCurrentStore: (storeId: string, storeName: string) => void
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAdminStore = create<AdminState>()(
  devtools(
    (set, get) => ({
      currentStore: 'store-1',
      currentStoreName: 'Country Club Principal',
      sidebarCollapsed: false,

      setCurrentStore: (storeId, storeName) => {
        set({ currentStore: storeId, currentStoreName: storeName })
      },

      toggleSidebar: () => {
        set({ sidebarCollapsed: !get().sidebarCollapsed })
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      }
    }),
    {
      name: 'admin-store'
    }
  )
)
