import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AdminApp } from './App';
import { AdminLayout } from './components/Layout/AdminLayout';

// Import inventory pages
import { InventoryIngredientsPage } from './pages/InventoryIngredientsPage';
import { InventoryStockPage } from './pages/InventoryStockPage';
import { InventoryCountsPage } from './pages/InventoryCountsPage';
import { InventoryPurchasesPage } from './pages/InventoryPurchasesPage';
import { InventorySuppliersPage } from './pages/InventorySuppliersPage';
import { InventoryWastePage } from './pages/InventoryWastePage';
import { InventoryMovementsPage } from './pages/InventoryMovementsPage';

// Import recipes pages
import { RecipesPage } from './pages/RecipesPage';
import { RecipeEditorPage } from './pages/RecipeEditorPage';
import { RecipesFoodCostPage } from './pages/RecipesFoodCostPage';
import { RecipesAVTPage } from './pages/RecipesAVTPage';

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminApp />
      },
      {
        path: 'dashboard',
        element: <AdminApp />
      },
      // Inventory Routes
      {
        path: 'inventory',
        children: [
          {
            path: 'ingredients',
            element: <InventoryIngredientsPage />
          },
          {
            path: 'stock',
            element: <InventoryStockPage />
          },
          {
            path: 'counts',
            element: <InventoryCountsPage />
          },
          {
            path: 'purchases',
            element: <InventoryPurchasesPage />
          },
          {
            path: 'suppliers',
            element: <InventorySuppliersPage />
          },
          {
            path: 'waste',
            element: <InventoryWastePage />
          },
          {
            path: 'movements',
            element: <InventoryMovementsPage />
          }
        ]
      },
      // Other routes (placeholder for future implementation)
      {
        path: 'users',
        element: <div className="p-6"><h1 className="text-2xl font-bold">Usuarios</h1><p>En construcción...</p></div>
      },
      {
        path: 'products',
        element: <div className="p-6"><h1 className="text-2xl font-bold">Productos</h1><p>En construcción...</p></div>
      },
      {
        path: 'categories',
        element: <div className="p-6"><h1 className="text-2xl font-bold">Categorías</h1><p>En construcción...</p></div>
      },
      {
        path: 'orders',
        element: <div className="p-6"><h1 className="text-2xl font-bold">Órdenes</h1><p>En construcción...</p></div>
      },
      {
        path: 'reports',
        children: [
          {
            index: true,
            element: <div className="p-6"><h1 className="text-2xl font-bold">Reportes</h1><p>En construcción...</p></div>
          },
          {
            path: 'sales',
            element: <div className="p-6"><h1 className="text-2xl font-bold">Reportes de Ventas</h1><p>En construcción...</p></div>
          },
          {
            path: 'inventory',
            element: <div className="p-6"><h1 className="text-2xl font-bold">Reportes de Inventario</h1><p>En construcción...</p></div>
          },
          {
            path: 'financial',
            element: <div className="p-6"><h1 className="text-2xl font-bold">Reportes Financieros</h1><p>En construcción...</p></div>
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            index: true,
            element: <div className="p-6"><h1 className="text-2xl font-bold">Configuración</h1><p>En construcción...</p></div>
          },
          {
            path: 'system',
            element: <div className="p-6"><h1 className="text-2xl font-bold">Configuración del Sistema</h1><p>En construcción...</p></div>
          },
          {
            path: 'store',
            element: <div className="p-6"><h1 className="text-2xl font-bold">Configuración de Tienda</h1><p>En construcción...</p></div>
          },
          {
            path: 'security',
            element: <div className="p-6"><h1 className="text-2xl font-bold">Configuración de Seguridad</h1><p>En construcción...</p></div>
          }
        ]
      },
      // Recipes Routes
      {
        path: 'recipes',
        children: [
          {
            index: true,
            element: <RecipesPage />
          },
          {
            path: ':id',
            element: <RecipeEditorPage />
          },
          {
            path: 'food-cost',
            element: <RecipesFoodCostPage />
          },
          {
            path: 'avt',
            element: <RecipesAVTPage />
          }
        ]
      }
    ]
  },
  {
    path: '/',
    element: <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Country Club POS</h1>
        <p className="text-gray-600 mb-8">Sistema de Punto de Venta</p>
        <a 
          href="/admin/dashboard" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Ir al Panel de Administración
        </a>
      </div>
    </div>
  }
]);

// Main App Router Component
export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
