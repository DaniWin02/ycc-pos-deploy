# Arquitectura de Personalización Visual - YCC POS

## Resumen Ejecutivo

Se ha implementado un **Sistema de Personalización Visual Unificado y Sincronizado** que permite:
- ✅ Tokens semánticos compartidos entre todos los módulos
- ✅ Sincronización en tiempo real vía WebSocket
- ✅ Previews fieles de cada módulo (Admin, POS, KDS)
- ✅ Herencia de configuraciones (Global → Módulos)
- ✅ Corrección automática de contraste
- ✅ Persistencia y caché local

---

## Estructura de Archivos

```
YCC_POS_IMPLEMENTATION/
├── shared/
│   ├── tokens/
│   │   └── semanticTokens.ts      # Tokens CSS semánticos
│   ├── theme/
│   │   └── UnifiedThemeProvider.tsx # Provider con WebSocket
│   ├── hooks/
│   │   └── useSyncedTheme.ts        # Hook de sincronización
│   ├── styles/
│   │   └── semantic-theme.css       # CSS base con variables
│   └── index.ts                     # Exportaciones principales
│
├── 03_API_GATEWAY/
│   └── src/
│       └── services/
│           └── themeSync.service.ts # Servicio WebSocket
│
├── 04_CORE_POS/
│   └── src/
│       └── hooks/
│           └── useTheme.ts          # Hook POS actualizado
│
├── 05_KDS_SYSTEM/
│   └── src/
│       └── hooks/
│           └── useTheme.ts          # Hook KDS actualizado
│
└── 06_ADMIN_PANEL/
    └── src/
        ├── pages/
        │   ├── AppearancePageV2.tsx         # Nueva página
        │   └── AppearancePage.tsx            # Legacy (deprecated)
        └── components/
            └── Appearance/
                └── ModulePreview.tsx         # Previews por módulo
```

---

## Tokens Semánticos Disponibles

### Superficies
| Token | Uso |
|-------|-----|
| `--background` | Fondo principal |
| `--foreground` | Texto principal |
| `--card` | Fondo de tarjetas |
| `--card-foreground` | Texto en tarjetas |
| `--popover` | Fondo de popovers |

### Acciones
| Token | Uso |
|-------|-----|
| `--primary` | Botones principales |
| `--primary-foreground` | Texto en botones primarios |
| `--primary-hover` | Hover de botones primarios |
| `--secondary` | Botones secundarios |
| `--secondary-foreground` | Texto en botones secundarios |

### Estados
| Token | Uso |
|-------|-----|
| `--success` | Éxito, confirmaciones |
| `--success-light` | Fondo de alertas de éxito |
| `--warning` | Advertencias |
| `--warning-light` | Fondo de alertas de advertencia |
| `--danger` | Errores, peligro |
| `--danger-light` | Fondo de alertas de error |
| `--info` | Información |
| `--info-light` | Fondo de alertas informativas |

### Bordes
| Token | Uso |
|-------|-----|
| `--border` | Bordes por defecto |
| `--border-hover` | Bordes en hover |
| `--input` | Bordes de inputs |
| `--ring` | Anillos de enfoque |

### Navegación
| Token | Uso |
|-------|-----|
| `--nav-background` | Fondo de navegación |
| `--nav-foreground` | Texto de navegación |
| `--nav-active` | Item activo |
| `--nav-active-foreground` | Texto de item activo |
| `--nav-hover` | Hover de items |

---

## Flujo de Sincronización

```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN PANEL                             │
│  Usuario cambia color primario a rojo                      │
│  → Actualiza localStorage                                   │
│  → Emite evento 'ycc-theme-change'                         │
│  → Emite vía WebSocket a API Gateway                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ WebSocket
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY (3004)                      │
│  Recibe tema actualizado                                   │
│  → Almacena en estado global                               │
│  → Propaga a todos los clientes conectados                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ Broadcast
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    POS      │ │     KDS     │ │   Admin     │
│  (3000)     │ │  (3002)     │ │  (3003)     │
├─────────────┤ ├─────────────┤ ├─────────────┤
│Recibe vía   │ │Recibe vía   │ │Recibe vía   │
│WebSocket    │ │WebSocket    │ │WebSocket    │
│             │ │             │ │             │
│Aplica CSS   │ │Aplica CSS   │ │Aplica CSS   │
│vars en      │ │vars en      │ │vars en      │
│tiempo real  │ │tiempo real  │ │tiempo real  │
│             │ │             │ │             │
│Guarda en    │ │Guarda en    │ │Guarda en    │
│localStorage │ │localStorage │ │localStorage │
└─────────────┘ └─────────────┘ └─────────────┘
```

---

## Cómo Usar el Sistema

### 1. En un Componente React (Admin)

```tsx
import { useUnifiedTheme } from '../../../shared/theme/UnifiedThemeProvider';

function MyComponent() {
  const { tokens, isDark, updateToken } = useUnifiedTheme();
  
  // Obtener color directamente
  const primaryColor = tokens.primary;
  
  // Actualizar un token
  const handleColorChange = (newColor: string) => {
    updateToken('primary', newColor); // Se sincroniza automáticamente
  };
  
  return (
    <div style={{ color: tokens.foreground, background: tokens.background }}>
      Contenido tematizado
    </div>
  );
}
```

### 2. En CSS/Tailwind

```css
/* Usando variables CSS automáticas */
.my-button {
  background-color: var(--primary);
  color: var(--primary-foreground);
  border: 1px solid var(--border);
}

.my-button:hover {
  background-color: var(--primary-hover);
}
```

### 3. En POS/KDS (Legacy Support)

```tsx
import { useTheme } from '../hooks/useTheme';

function PosComponent() {
  const { theme, isDark, cssVar } = useTheme();
  
  // Los cambios del Admin se sincronizan automáticamente
  // vía WebSocket + localStorage
  
  return (
    <div className={isDark ? 'dark' : 'light'}>
      <button style={{ 
        background: theme?.colors?.primary,
        color: theme?.colors?.primaryForeground 
      }}>
        Botón
      </button>
    </div>
  );
}
```

---

## API del Sistema

### UnifiedThemeProvider

```tsx
<UnifiedThemeProvider 
  module="pos"      // 'global' | 'admin' | 'pos' | 'kds'
  enableSync={true} // Habilitar WebSocket
>
  <App />
</UnifiedThemeProvider>
```

### useUnifiedTheme Hook

```typescript
const {
  currentModule,        // Módulo actual
  effectiveConfig,      // Configuración con herencia aplicada
  tokens,              // Tokens semánticos
  isDark,              // Modo oscuro activo
  
  // Actions
  updateToken,         // (key, value) => void
  updateMultipleTokens, // (updates) => void
  toggleDarkMode,      // () => void
  resetToDefaults,     // () => void
  
  // Sync status
  isConnected,         // WebSocket conectado
  lastSyncTime,        // Última sincronización
} = useUnifiedTheme();
```

---

## Eventos del Sistema

### Eventos Emitidos (window)

| Evento | Datos | Descripción |
|--------|-------|-------------|
| `ycc-theme-change` | `{ module, config, timestamp }` | Cambio de tema |
| `ycc-theme-applied` | `{ module, timestamp }` | Tema aplicado |
| `ycc-ui-config-change` | `{ config }` | Cambio de UI global |

### Eventos WebSocket

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `theme:update` | Server → Client | Nueva configuración de tema |
| `theme:sync-all` | Client → Server | Solicitar estado completo |
| `theme:current-state` | Server → Client | Estado actual de todos los temas |
| `join-module` | Client → Server | Unirse a sala de módulo |

---

## Almacenamiento Local

```
localStorage:
├── ycc-theme-global              # Config global
├── ycc-theme-admin              # Config admin
├── ycc-theme-pos                # Config POS
├── ycc-theme-kds                # Config KDS
├── ycc-theme-{module}-applied   # Timestamp de aplicación
└── ycc-unified-theme            # Estado completo unificado
```

---

## Componentes de Preview

Los previews muestran **exactamente** cómo se verán los cambios:

### AdminPreview
- Header con logo y navegación
- Cards de estadísticas
- Botones de acción (primario, secundario, peligro)
- Alertas de éxito, warning, error
- Tabla de datos

### PosPreview
- Grid de productos
- Carrito de compras
- Botones de acción (cantidad, eliminar, cobrar)
- Total y botón de pago

### KdsPreview
- Grid de tickets de cocina
- Estados: Pendiente (warning), Preparando (info), Listo (success)
- Timers de espera
- Acciones de entrega

---

## Mejoras en Contraste (Dark Mode)

Los tokens de modo oscuro están diseñados para:
- ✅ Alto contraste WCAG AA/AAA
- ✅ Colores más brillantes para mejor legibilidad
- ✅ Superficies oscuras diferenciadas
- ✅ Estados de éxito/warning/error adaptados

| Elemento | Claro | Oscuro | Ratio |
|----------|-------|--------|-------|
| Texto normal | `#0f172a` | `#f8fafc` | 15:1 |
| Texto secundario | `#64748b` | `#94a3b8` | 7:1 |
| Primary | `#3b82f6` | `#60a5fa` | - |
| Success | `#10b981` | `#34d399` | - |
| Warning | `#f59e0b` | `#fbbf24` | - |
| Danger | `#ef4444` | `#f87171` | - |

---

## Testing

### Verificar Sincronización

1. Abrir Admin Panel (localhost:3003)
2. Abrir POS (localhost:3000)
3. Abrir KDS (localhost:3002)
4. En Admin → Apariencia → POS: Cambiar color primario a rojo
5. Verificar que POS cambia **instantáneamente**
6. Cambiar color primario en KDS
7. Verificar que KDS cambia **instantáneamente**
8. Cambiar en GLOBAL
9. Verificar que **todos** los módulos cambian

### Verificar Persistencia

1. Cerrar y reabrir navegador
2. Verificar que el tema se mantiene
3. Verificar en modo incógnito (debería cargar por defecto)

---

## Solución de Problemas

### Los cambios no se reflejan
- Verificar que API Gateway está corriendo (puerto 3004)
- Verificar conexión WebSocket en consola del navegador
- Verificar que no hay bloqueadores de CORS

### Colores no aplican
- Verificar que las variables CSS se están seteando en `:root`
- Verificar que los componentes no tienen colores hardcodeados

### Contraste insuficiente
- Usar los tokens `-foreground` para texto sobre fondos coloreados
- Verificar que se está usando el modo oscuro correcto

---

## Próximas Mejoras

- [ ] Soporte para temas por terminal/estación
- [ ] Exportación/importación de temas completos
- [ ] Editor visual de gradientes
- [ ] Análisis automático de contraste
- [ ] Temas predefinidos (Material, iOS, Windows)
- [ ] Personalización de animaciones
- [ ] Modo de alto contraste para accesibilidad

---

## Contacto y Soporte

Para reportar problemas o solicitar mejoras:
- Crear issue en el repositorio
- Contactar al equipo de desarrollo
- Revisar logs en consola del navegador

---

## Changelog

### v2.0.0 - Sistema Unificado
- ✅ Implementación de tokens semánticos
- ✅ Sincronización WebSocket en tiempo real
- ✅ Previews fieles por módulo
- ✅ Herencia de configuraciones
- ✅ Soporte completo de modo oscuro
- ✅ Corrección automática de contraste
