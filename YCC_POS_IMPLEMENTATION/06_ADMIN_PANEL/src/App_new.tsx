import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AdminLayout } from './components/Layout/AdminLayout'
import { DashboardPage } from './pages/DashboardPage'
import { MenuCategoriesPage } from './pages/MenuCategoriesPage'
import { MenuItemsPage } from './pages/MenuItemsPage'
import { MenuModifiersPage } from './pages/MenuModifiersPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
    },
  },
})

function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdminLayout>
          <Routes>
            <Route path="/admin" element={<DashboardPage />} />
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/menu/categories" element={<MenuCategoriesPage />} />
            <Route path="/admin/menu/items" element={<MenuItemsPage />} />
            <Route path="/admin/menu/modifiers" element={<MenuModifiersPage />} />
            {/* Placeholder routes for future implementation */}
            <Route path="/admin/inventory" element={<div className="p-8"><h1 className="text-2xl font-bold">Inventario - Próximamente</h1></div>} />
            <Route path="/admin/sales" element={<div className="p-8"><h1 className="text-2xl font-bold">Ventas - Próximamente</h1></div>} />
            <Route path="/admin/users" element={<div className="p-8"><h1 className="text-2xl font-bold">Usuarios - Próximamente</h1></div>} />
            <Route path="/admin/stores" element={<div className="p-8"><h1 className="text-2xl font-bold">Tiendas - Próximamente</h1></div>} />
            <Route path="/admin/reports" element={<div className="p-8"><h1 className="text-2xl font-bold">Reportes - Próximamente</h1></div>} />
            <Route path="/admin/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Configuración - Próximamente</h1></div>} />
          </Routes>
        </AdminLayout>
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default AdminApp
