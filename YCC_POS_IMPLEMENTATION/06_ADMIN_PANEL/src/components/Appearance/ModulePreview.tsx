/**
 * Componentes de Preview para cada módulo
 * Muestran exactamente cómo se verán los cambios de tema
 */

import React from 'react';
import { 
  Building2, 
  Smartphone, 
  Utensils, 
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Users,
  Settings,
  Check,
  AlertTriangle,
  Info,
  ChevronRight,
  Search,
  Bell,
  Menu,
  Plus,
  Minus,
  Trash2,
  Clock,
  ChefHat,
  Flame,
  Timer,
  CheckCircle2,
  Package
} from 'lucide-react';
import { ThemeModule } from '../../../shared/tokens/semanticTokens';

interface PreviewProps {
  tokens: Record<string, string>;
  isDark: boolean;
}

// ============================================================================
// PREVIEW DEL ADMIN PANEL
// ============================================================================

export function AdminPreview({ tokens, isDark }: PreviewProps) {
  return (
    <div 
      className="rounded-lg overflow-hidden border-2 transition-all duration-300"
      style={{ 
        backgroundColor: tokens.background,
        color: tokens.foreground,
        borderColor: tokens.border,
        fontFamily: tokens['font-family-sans'] || 'Inter, system-ui, sans-serif'
      }}
    >
      {/* Header */}
      <div 
        className="h-12 px-4 flex items-center justify-between border-b"
        style={{ 
          backgroundColor: tokens.card,
          borderColor: tokens.border
        }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: tokens.primary, color: tokens['primary-foreground'] }}
          >
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 opacity-50" />
          <Bell className="w-4 h-4 opacity-50" />
          <div 
            className="w-7 h-7 rounded-full"
            style={{ backgroundColor: tokens.primary }}
          />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div 
          className="w-16 py-3 flex flex-col items-center gap-3"
          style={{ backgroundColor: tokens['nav-background'] || tokens.muted }}
        >
          <LayoutDashboard className="w-5 h-5" style={{ color: tokens['nav-active-foreground'] || tokens.primary }} />
          <ShoppingCart className="w-5 h-5 opacity-50" />
          <Package className="w-5 h-5 opacity-50" />
          <Users className="w-5 h-5 opacity-50" />
          <Settings className="w-5 h-5 opacity-50" />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 space-y-3">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2">
            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: tokens.card,
                borderColor: tokens.border
              }}
            >
              <p className="text-xs opacity-70">Ventas Hoy</p>
              <p className="text-lg font-bold" style={{ color: tokens.foreground }}>$24,580</p>
            </div>
            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: tokens.card,
                borderColor: tokens.border
              }}
            >
              <p className="text-xs opacity-70">Órdenes</p>
              <p className="text-lg font-bold" style={{ color: tokens.foreground }}>142</p>
            </div>
            <div 
              className="p-3 rounded-lg border"
              style={{ 
                backgroundColor: tokens.card,
                borderColor: tokens.border
              }}
            >
              <p className="text-xs opacity-70">Productos</p>
              <p className="text-lg font-bold" style={{ color: tokens.foreground }}>856</p>
            </div>
          </div>

          {/* Buttons Showcase */}
          <div className="flex gap-2 flex-wrap">
            <button 
              className="px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{ 
                backgroundColor: tokens.primary, 
                color: tokens['primary-foreground']
              }}
            >
              Primario
            </button>
            <button 
              className="px-3 py-1.5 rounded text-xs font-medium border transition-all"
              style={{ 
                backgroundColor: tokens.secondary, 
                color: tokens['secondary-foreground'],
                borderColor: tokens.border
              }}
            >
              Secundario
            </button>
            <button 
              className="px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{ 
                backgroundColor: tokens.danger, 
                color: tokens['danger-foreground']
              }}
            >
              Peligro
            </button>
            <button 
              className="px-3 py-1.5 rounded text-xs font-medium opacity-50 cursor-not-allowed"
              style={{ 
                backgroundColor: tokens.disabled, 
                color: tokens['disabled-foreground']
              }}
            >
              Deshabilitado
            </button>
          </div>

          {/* Alerts */}
          <div 
            className="p-2 rounded-lg border-l-4 text-xs flex items-center gap-2"
            style={{ 
              backgroundColor: tokens['success-light'],
              borderColor: tokens.success,
              color: tokens.success
            }}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Operación completada exitosamente</span>
          </div>

          <div 
            className="p-2 rounded-lg border-l-4 text-xs flex items-center gap-2"
            style={{ 
              backgroundColor: tokens['warning-light'],
              borderColor: tokens.warning,
              color: tokens.warning
            }}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Stock bajo en algunos productos</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW DEL POS
// ============================================================================

export function PosPreview({ tokens, isDark }: PreviewProps) {
  return (
    <div 
      className="rounded-lg overflow-hidden border-2 transition-all duration-300 w-64 mx-auto"
      style={{ 
        backgroundColor: tokens.background,
        color: tokens.foreground,
        borderColor: tokens.border,
        fontFamily: tokens['font-family-sans'] || 'Inter, system-ui, sans-serif'
      }}
    >
      {/* POS Header */}
      <div 
        className="h-10 px-3 flex items-center justify-between border-b"
        style={{ 
          backgroundColor: tokens.card,
          borderColor: tokens.border
        }}
      >
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4" style={{ color: tokens.primary }} />
          <span className="font-bold text-xs">Terminal 01</span>
        </div>
        <Clock className="w-4 h-4 opacity-50" />
      </div>

      {/* Product Grid */}
      <div className="p-2 space-y-2">
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div 
              key={i}
              className="aspect-square rounded-lg border flex flex-col items-center justify-center p-1"
              style={{ 
                backgroundColor: tokens.card,
                borderColor: tokens.border
              }}
            >
              <Package className="w-5 h-5 opacity-30" />
              <span className="text-[8px] mt-1 opacity-70">Producto {i}</span>
            </div>
          ))}
        </div>

        {/* Cart Preview */}
        <div 
          className="rounded-lg border p-2 space-y-1.5"
          style={{ 
            backgroundColor: tokens.card,
            borderColor: tokens.border
          }}
        >
          <div className="flex justify-between text-xs">
            <span className="opacity-70">2x Hamburguesa</span>
            <span className="font-medium">$180.00</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="opacity-70">1x Refresco</span>
            <span className="font-medium">$35.00</span>
          </div>
          <div 
            className="border-t pt-1.5 mt-1.5 flex justify-between"
            style={{ borderColor: tokens.border }}
          >
            <span className="text-xs font-bold">Total</span>
            <span className="text-sm font-bold" style={{ color: tokens.primary }}>$215.00</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          <button 
            className="aspect-square rounded-lg flex items-center justify-center transition-all"
            style={{ 
              backgroundColor: tokens.secondary,
              color: tokens['secondary-foreground']
            }}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button 
            className="aspect-square rounded-lg flex items-center justify-center transition-all"
            style={{ 
              backgroundColor: tokens.secondary,
              color: tokens['secondary-foreground']
            }}
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            className="aspect-square rounded-lg flex items-center justify-center transition-all"
            style={{ 
              backgroundColor: tokens.danger,
              color: tokens['danger-foreground']
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button 
            className="aspect-square rounded-lg flex items-center justify-center transition-all"
            style={{ 
              backgroundColor: tokens.success,
              color: tokens['success-foreground']
            }}
          >
            <CreditCard className="w-4 h-4" />
          </button>
        </div>

        {/* Pay Button */}
        <button 
          className="w-full py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
          style={{ 
            backgroundColor: tokens.primary,
            color: tokens['primary-foreground']
          }}
        >
          <CreditCard className="w-4 h-4" />
          Cobrar
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW DEL KDS
// ============================================================================

export function KdsPreview({ tokens, isDark }: PreviewProps) {
  return (
    <div 
      className="rounded-lg overflow-hidden border-2 transition-all duration-300"
      style={{ 
        backgroundColor: tokens.background,
        color: tokens.foreground,
        borderColor: tokens.border,
        fontFamily: tokens['font-family-sans'] || 'Inter, system-ui, sans-serif'
      }}
    >
      {/* KDS Header */}
      <div 
        className="h-10 px-3 flex items-center justify-between border-b"
        style={{ 
          backgroundColor: tokens.card,
          borderColor: tokens.border
        }}
      >
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4" style={{ color: tokens.primary }} />
          <span className="font-bold text-xs">Cocina - KDS</span>
        </div>
        <div 
          className="px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ 
            backgroundColor: tokens['warning-light'],
            color: tokens.warning
          }}
        >
          5 Órdenes
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="p-2 grid grid-cols-3 gap-2">
        {/* Ticket 1 - Pendiente */}
        <div 
          className="rounded-lg border p-2 space-y-1.5"
          style={{ 
            backgroundColor: tokens.card,
            borderColor: tokens.warning,
            borderWidth: '2px'
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold" style={{ color: tokens.warning }}>#A-42</span>
            <Flame className="w-3 h-3" style={{ color: tokens.danger }} />
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] opacity-80">1x Pasta Alfredo</div>
            <div className="text-[10px] opacity-80">2x Ensalada César</div>
          </div>
          <div 
            className="text-[10px] font-bold pt-1 flex items-center gap-1"
            style={{ color: tokens.warning }}
          >
            <Timer className="w-3 h-3" />
            12:34
          </div>
        </div>

        {/* Ticket 2 - Preparando */}
        <div 
          className="rounded-lg border p-2 space-y-1.5"
          style={{ 
            backgroundColor: tokens['info-light'],
            borderColor: tokens.info,
            borderWidth: '2px'
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold" style={{ color: tokens.info }}>#A-43</span>
            <ChefHat className="w-3 h-3" style={{ color: tokens.info }} />
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] opacity-80">1x Filete Mignon</div>
            <div className="text-[10px] opacity-80">1x Puré de Papa</div>
          </div>
          <div 
            className="text-[10px] font-bold pt-1 flex items-center gap-1"
            style={{ color: tokens.info }}
          >
            <Clock className="w-3 h-3" />
            08:21
          </div>
        </div>

        {/* Ticket 3 - Listo */}
        <div 
          className="rounded-lg border p-2 space-y-1.5"
          style={{ 
            backgroundColor: tokens['success-light'],
            borderColor: tokens.success,
            borderWidth: '2px'
          }}
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold" style={{ color: tokens.success }}>#A-44</span>
            <CheckCircle2 className="w-3 h-3" style={{ color: tokens.success }} />
          </div>
          <div className="space-y-0.5">
            <div className="text-[10px] opacity-80 line-through">2x Sándwich Club</div>
            <div className="text-[10px] opacity-80 line-through">1x Jugo Naranja</div>
          </div>
          <button 
            className="w-full py-1 rounded text-[10px] font-bold mt-1"
            style={{ 
              backgroundColor: tokens.success,
              color: tokens['success-foreground']
            }}
          >
            ENTREGAR
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div 
        className="px-2 py-1.5 border-t flex items-center justify-between"
        style={{ 
          backgroundColor: tokens.muted,
          borderColor: tokens.border
        }}
      >
        <div className="flex items-center gap-1.5">
          <div 
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ backgroundColor: tokens.warning }}
          >
            <span className="text-[8px] font-bold text-white">3</span>
          </div>
          <div 
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ backgroundColor: tokens.info }}
          >
            <span className="text-[8px] font-bold text-white">2</span>
          </div>
          <div 
            className="w-5 h-5 rounded flex items-center justify-center"
            style={{ backgroundColor: tokens.success }}
          >
            <span className="text-[8px] font-bold text-white">1</span>
          </div>
        </div>
        <button 
          className="px-2 py-0.5 rounded text-[10px] font-bold"
          style={{ 
            backgroundColor: tokens.primary,
            color: tokens['primary-foreground']
          }}
        >
          Historial
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// PREVIEW GLOBAL (Todos los módulos)
// ============================================================================

export function GlobalPreview({ tokens, isDark }: PreviewProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-bold mb-2 opacity-70">Admin Panel</div>
      <AdminPreview tokens={tokens} isDark={isDark} />
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <div className="text-sm font-bold mb-2 opacity-70">POS Terminal</div>
          <PosPreview tokens={tokens} isDark={isDark} />
        </div>
        <div>
          <div className="text-sm font-bold mb-2 opacity-70">Kitchen Display</div>
          <KdsPreview tokens={tokens} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL DE PREVIEW
// ============================================================================

interface ModulePreviewProps {
  module: ThemeModule;
  tokens: Record<string, string>;
  isDark: boolean;
}

export function ModulePreview({ module, tokens, isDark }: ModulePreviewProps) {
  switch (module) {
    case 'admin':
      return <AdminPreview tokens={tokens} isDark={isDark} />;
    case 'pos':
      return <PosPreview tokens={tokens} isDark={isDark} />;
    case 'kds':
      return <KdsPreview tokens={tokens} isDark={isDark} />;
    case 'global':
      return <GlobalPreview tokens={tokens} isDark={isDark} />;
    default:
      return <AdminPreview tokens={tokens} isDark={isDark} />;
  }
}
