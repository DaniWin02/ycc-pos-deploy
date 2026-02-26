import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  FileText,
  Settings,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Warehouse,
  TrendingUp,
  AlertTriangle,
  Building2,
  Clock,
  ChefHat,
  DollarSign
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  path: string;
  children?: SidebarItem[];
  permission?: string;
}

interface SidebarProps {
  onClose: () => void;
  className?: string;
}

// Componente de navegación lateral del Admin Panel
export const Sidebar: React.FC<SidebarProps> = ({ onClose, className = '' }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);
  const location = useLocation();

  const menuItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard'
    },
    {
      id: 'users',
      label: 'Usuarios',
      icon: Users,
      path: '/admin/users',
      permission: 'USERS_READ'
    },
    {
      id: 'products',
      label: 'Productos',
      icon: Package,
      path: '/admin/products',
      children: [
        {
          id: 'products-list',
          label: 'Catálogo',
          icon: Package,
          path: '/admin/products'
        },
        {
          id: 'categories',
          label: 'Categorías',
          icon: Package,
          path: '/admin/categories'
        }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventario',
      icon: Warehouse,
      children: [
        {
          id: 'inventory-ingredients',
          label: 'Ingredientes',
          icon: Package,
          path: '/admin/inventory/ingredients'
        },
        {
          id: 'inventory-stock',
          label: 'Stock',
          icon: TrendingUp,
          path: '/admin/inventory/stock'
        },
        {
          id: 'inventory-counts',
          label: 'Conteo Físico',
          icon: Clock,
          path: '/admin/inventory/counts'
        },
        {
          id: 'inventory-purchases',
          label: 'Órdenes de Compra',
          icon: ShoppingCart,
          path: '/admin/inventory/purchases'
        },
        {
          id: 'inventory-suppliers',
          label: 'Proveedores',
          icon: Building2,
          path: '/admin/inventory/suppliers'
        },
        {
          id: 'inventory-waste',
          label: 'Desperdicios',
          icon: AlertTriangle,
          path: '/admin/inventory/waste'
        },
        {
          id: 'inventory-movements',
          label: 'Movimientos',
          icon: Clock,
          path: '/admin/inventory/movements'
        }
      ]
    },
    {
      id: 'recipes',
      label: 'Recetas',
      icon: ChefHat,
      path: '/admin/recipes',
      children: [
        {
          id: 'recipes-list',
          label: 'Lista de Recetas',
          icon: ChefHat,
          path: '/admin/recipes'
        },
        {
          id: 'recipes-food-cost',
          label: 'Food Cost',
          icon: DollarSign,
          path: '/admin/recipes/food-cost'
        },
        {
          id: 'recipes-avt',
          label: 'AVT',
          icon: TrendingUp,
          path: '/admin/recipes/avt'
        }
      ]
    },
    {
      id: 'orders',
      label: 'Órdenes',
      icon: ShoppingCart,
      path: '/admin/orders'
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      path: '/admin/reports',
      children: [
        {
          id: 'sales-reports',
          label: 'Ventas',
          icon: FileText,
          path: '/admin/reports/sales'
        },
        {
          id: 'inventory-reports',
          label: 'Inventario',
          icon: FileText,
          path: '/admin/reports/inventory'
        },
        {
          id: 'financial-reports',
          label: 'Financieros',
          icon: FileText,
          path: '/admin/reports/financial'
        }
      ]
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      path: '/admin/settings',
      children: [
        {
          id: 'system-settings',
          label: 'Sistema',
          icon: Settings,
          path: '/admin/settings/system'
        },
        {
          id: 'store-settings',
          label: 'Tienda',
          icon: Settings,
          path: '/admin/settings/store'
        },
        {
          id: 'security-settings',
          label: 'Seguridad',
          icon: Settings,
          path: '/admin/settings/security'
        }
      ]
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemActive = (item: SidebarItem): boolean => {
    if (item.children) {
      return item.children.some(child => location.pathname.startsWith(child.path));
    }
    return location.pathname === item.path;
  };

  const isChildActive = (path: string): boolean => {
    return location.pathname.startsWith(path);
  };

  const renderMenuItem = (item: SidebarItem, level: number = 0) => {
    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <div key={item.id}>
        <motion.div
          className={`
            flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer
            transition-all duration-200 mb-1
            ${isActive 
              ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              // Navigate to item.path
              window.location.href = item.path;
            }
          }}
        >
          <div className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </div>
          
          {hasChildren && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          )}
        </motion.div>

        {/* Submenu */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-4 mt-1 space-y-1">
                {item.children.map(child => (
                  <Link
                    key={child.id}
                    to={child.path}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer
                      transition-all duration-200
                      ${isChildActive(child.path)
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <child.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{child.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">YCC</span>
            </div>
            <div>
              <div className="font-bold text-gray-900">Admin Panel</div>
              <div className="text-xs text-gray-500">Country Club POS</div>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <motion.button
          className="flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer
                     text-red-600 hover:bg-red-50 transition-all duration-200 w-full"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // Handle logout
            console.log('Logout clicked');
          }}
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </motion.button>
      </div>
    </div>
  );
};
