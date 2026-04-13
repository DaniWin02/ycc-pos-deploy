# Sistema Responsive Completo - YCC POS & KDS

## 📱 Sistema de Diseño Adaptativo

Este documento describe el sistema responsive implementado para garantizar que tanto el POS (Point of Sale) como el KDS (Kitchen Display System) se adapten perfectamente a cualquier dispositivo y resolución de pantalla.

---

## 🎯 Objetivos del Sistema

1. **Adaptación Automática**: Sin scroll innecesario en resoluciones comunes (1366x768, 1920x1080, tablets)
2. **Optimización Táctil**: Botones mínimo 44px, feedback visual inmediato
3. **Grid Dinámico**: Distribución inteligente según espacio disponible
4. **Tipografía Fluida**: Escalado proporcional con `clamp()`
5. **Orientación**: Soporte completo portrait/landscape

---

## 📐 Breakpoints Definidos

```css
/* Mobile First Approach */
xs: 0px      /* Móviles pequeños */
sm: 640px    /* Móviles grandes */
md: 768px    /* Tablets */
lg: 1024px   /* Desktop pequeño */
xl: 1280px   /* Desktop estándar */
2xl: 1536px  /* Pantallas grandes */
```

---

## 🧩 Unidades Utilizadas

### Viewport Units
- `vw`, `vh`, `dvh` (dynamic viewport height)
- `vmin`, `vmax`

### Unidades Relativas
- `rem` (root em)
- `%` (porcentajes)
- `clamp()` (valores fluidos)

### Ejemplo de clamp()
```css
font-size: clamp(mínimo, fluido, máximo);
/* Ejemplo: clamp(0.875rem, 2.5vw, 1rem) */
```

---

## 🎨 Sistema CSS

### 1. Archivos Creados

```
04_CORE_POS/src/styles/responsive.css    →  Estilos POS
05_KDS_SYSTEM/src/styles/responsive.css  →  Estilos KDS
shared/hooks/useResponsive.ts            →  Hook React
```

### 2. Variables CSS Principales

```css
:root {
  /* Touch targets (Apple HIG compliant) */
  --touch-target-min: 44px;
  --touch-target-comfortable: 48px;
  --touch-target-large: 56px;
  
  /* Tipografía fluida */
  --font-base: clamp(14px, 2vw, 16px);
  --font-lg: clamp(16px, 2.5vw, 18px);
  --font-xl: clamp(18px, 3vw, 20px);
  
  /* Espaciado fluido */
  --space-md: clamp(0.75rem, 2vw, 1rem);
  --space-lg: clamp(1rem, 3vw, 1.5rem);
  
  /* Safe areas (notch support) */
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
}
```

---

## 📦 Componentes Responsive

### Botones Táctiles

```tsx
// Tamaños disponibles
<button className="btn-responsive">Normal</button>
<button className="btn-responsive-sm">Pequeño</button>
<button className="btn-responsive-lg">Grande</button>

// Variantes
<button className="btn-responsive btn-primary">Primario</button>
<button className="btn-responsive btn-danger">Peligro</button>
```

**Características:**
- Mínimo 44px de alto
- Active state con scale(0.98)
- Focus ring para accesibilidad
- Padding adaptable

### Grid Responsive

```tsx
// Grid fluido auto-fit
<div className="grid-fluid">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Grid con breakpoints fijos
<div className="grid-responsive">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// Grid específico productos POS
<div className="grid-products">
  {products.map(p => <ProductCard key={p.id} {...p} />)}
</div>
```

**Comportamiento:**
- Móvil: 1-2 columnas
- Tablet: 2-3 columnas
- Desktop: 3-5 columnas
- Gap fluido entre elementos

### Cards

```tsx
<div className="card-responsive">
  <h3 className="text-fluid-lg">Título</h3>
  <p className="text-fluid-base">Descripción...</p>
</div>
```

---

## 🪝 Hook useResponsive

### Instalación

```bash
# El hook está en:
/shared/hooks/useResponsive.ts
```

### Uso Básico

```tsx
import { useResponsive } from './hooks/useResponsive';

function MiComponente() {
  const { 
    width, 
    height,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    isTouch 
  } = useResponsive();

  return (
    <div>
      <p>Viewport: {width}x{height}</p>
      <p>Breakpoint: {breakpoint}</p>
      <p>Dispositivo: {isMobile ? 'Móvil' : isTablet ? 'Tablet' : 'Desktop'}</p>
    </div>
  );
}
```

### Propiedades Retornadas

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `width` | `number` | Ancho viewport en px |
| `height` | `number` | Alto viewport en px |
| `breakpoint` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | Breakpoint actual |
| `isMobile` | `boolean` | < 768px |
| `isTablet` | `boolean` | 768px - 1024px |
| `isDesktop` | `boolean` | >= 1024px |
| `orientation` | `'portrait' \| 'landscape'` | Orientación |
| `isPortrait` | `boolean` | Portrait mode |
| `isLandscape` | `boolean` | Landscape mode |
| `isTouch` | `boolean` | Dispositivo táctil |
| `isRetina` | `boolean` | Pantalla alta densidad |
| `isFullscreen` | `boolean` | Modo pantalla completa |

### Hooks Adicionales

```tsx
// Grid dinámico
import { useResponsiveGrid } from './hooks/useResponsive';

function TicketGrid() {
  const { gridTemplateColumns, columnCount } = useResponsiveGrid(320, 6);
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns, gap: '1rem' }}>
      {tickets.map(t => <Ticket key={t.id} {...t} />)}
    </div>
  );
}
```

---

## 📱 Layout POS

### Estructura

```
┌─────────────────────────────────────────┐
│               HEADER                    │ ← h-[8vh] adaptable
├─────────────────────────────────────────┤
│                                         │
│           ÁREA PRODUCTOS                │ ← flex-1
│          (Grid adaptable)               │
│                                         │
├─────────────────────────────────────────┤
│              CARRITO                    │ ← h-[35vh] móvil
│                                         │   w-[30vw] desktop
└─────────────────────────────────────────┘
```

### Responsive Behavior

| Dispositivo | Layout | Características |
|-------------|--------|-----------------|
| **Móvil** | Vertical | Carrito abajo 35vh, productos arriba |
| **Tablet** | Vertical/Horizontal | Carrito lateral en landscape |
| **Desktop** | Horizontal | Carrito derecha 30vw, productos 70vw |

### CSS Classes

```tsx
<div className="pos-layout">
  <header className="h-[8vh] min-h-[56px]">
    {/* Header content */}
  </header>
  
  <div className="pos-products-area">
    <div className="grid-products">
      {/* Product cards */}
    </div>
  </div>
  
  <aside className="pos-cart-area">
    {/* Cart content */}
  </aside>
</div>
```

---

## 👨‍🍳 Layout KDS

### Estructura

```
┌─────────────────────────────────────────┐
│ HEADER │ CONTADORES │ BOTONES          │ ← h-[60px] compacto
├─────────────────────────────────────────┤
│  🔍 BUSCAR + FILTROS ESTADO/FECHA       │ ← h-[80px]
├─────────────────────────────────────────┤
│                                         │
│         GRID DE TICKETS                 │ ← Grid fluido
│    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│    │ #001│ │ #002│ │ #003│ │ #004│     │
│    │     │ │     │ │     │ │     │     │
│    └─────┘ └─────┘ └─────┘ └─────┘     │
│                                         │
└─────────────────────────────────────────┘
```

### Grid Dinámico KDS

```tsx
// Grid con auto-fill (se ajusta automáticamente)
<div className="kds-grid">
  {tickets.map(ticket => (
    <KdsTicket key={ticket.id} {...ticket} />
  ))}
</div>

// Grid con columnas fijas por breakpoint
<div className="kds-grid-cols">
  {tickets.map(ticket => (
    <KdsTicket key={ticket.id} {...ticket} />
  ))}
</div>
```

**Comportamiento Grid:**

| Ancho Pantalla | Columnas | Ancho Mínimo Card |
|----------------|----------|-------------------|
| < 640px | 1 | 100% |
| 640-1024px | 2 | 50% |
| 1024-1280px | 3 | 33% |
| 1280-1536px | 4 | 25% |
| 1536-1920px | 5 | 20% |
| > 1920px | 6 | 16.6% |

---

## 🖥️ Modo Fullscreen

### Implementación

```tsx
import { useResponsive } from './hooks/useResponsive';

function App() {
  const { isFullscreen, toggleFullscreen } = useResponsive();
  
  return (
    <div className={isFullscreen ? 'fullscreen-container' : ''}>
      <button 
        onClick={() => toggleFullscreen()}
        className="fullscreen-btn"
      >
        {isFullscreen ? '⛶ Salir' : '⛶ Pantalla Completa'}
      </button>
    </div>
  );
}
```

### CSS Fullscreen

```css
.fullscreen-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background: inherit;
}
```

---

## 🔄 Orientación Landscape/Portrait

### Detección CSS

```css
/* Portrait */
@media (orientation: portrait) {
  .landscape-hidden { display: none; }
}

/* Landscape */
@media (orientation: landscape) {
  .portrait-hidden { display: none; }
  
  /* KDS compacto en landscape bajo */
  @media (max-height: 768px) {
    .kds-landscape-compact {
      --kds-touch-min: 40px;
    }
  }
}
```

### Ejemplo Uso

```tsx
function MiComponente() {
  const { isPortrait, isLandscape } = useResponsive();
  
  return (
    <div>
      {isPortrait && <div className="mobile-menu">Menú Móvil</div>}
      {isLandscape && <div className="sidebar">Sidebar Desktop</div>}
    </div>
  );
}
```

---

## 🎨 Ejemplos Prácticos

### Ejemplo 1: Producto Card Responsive

```tsx
function ProductCard({ product }) {
  return (
    <div className="card-responsive touch-target">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full aspect-product object-cover rounded-lg"
      />
      <h3 className="text-fluid-lg font-bold mt-2">
        {product.name}
      </h3>
      <p className="text-fluid-base text-gray-600">
        {formatPrice(product.price)}
      </p>
      <button className="btn-responsive btn-primary w-full mt-2">
        Agregar
      </button>
    </div>
  );
}
```

### Ejemplo 2: Ticket KDS Responsive

```tsx
function KdsTicket({ ticket }) {
  return (
    <div className={`kds-ticket kds-border-${ticket.status}`}>
      <div className="kds-ticket-header">
        <span className="text-fluid-xl font-bold">
          {ticket.folio}
        </span>
        <span className="kds-timer kds-timer-normal">
          {ticket.elapsedTime}
        </span>
      </div>
      
      <div className="kds-ticket-content">
        {ticket.items.map(item => (
          <div key={item.id} className="flex justify-between text-fluid-base">
            <span>{item.quantity}x {item.name}</span>
          </div>
        ))}
      </div>
      
      <div className="kds-ticket-actions">
        <button className="kds-btn kds-btn-primary flex-1">
          Iniciar
        </button>
        <button className="kds-btn kds-btn-danger">
          ✕
        </button>
      </div>
    </div>
  );
}
```

### Ejemplo 3: Layout Adaptativo

```tsx
function PosLayout() {
  const { isMobile, isDesktop } = useResponsive();
  
  return (
    <div className="pos-layout">
      {/* Header compacto en móvil */}
      <header className={`${isMobile ? 'h-12' : 'h-16'} flex items-center`}>
        <h1 className="text-fluid-xl font-bold">POS</h1>
      </header>
      
      {/* Productos - Grid adaptable */}
      <main className="pos-products-area">
        <div className={isMobile ? 'grid-cols-2' : 'grid-products'}>
          {products.map(p => <ProductCard key={p.id} {...p} />)}
        </div>
      </main>
      
      {/* Carrito - Posición adaptable */}
      <aside className={`pos-cart-area ${isMobile ? 'h-[35vh]' : ''}`}>
        <Cart />
      </aside>
    </div>
  );
}
```

---

## ♿ Accesibilidad

### Consideraciones Implementadas

1. **Touch Targets**: Mínimo 44x44px (Apple HIG)
2. **Focus Rings**: Visibles en navegación por teclado
3. **Reduced Motion**: Respeto a prefers-reduced-motion
4. **Contrast**: Colores WCAG 2.1 AA compliant
5. **Safe Areas**: Soporte notch iPhone/Android

### CSS Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🧪 Testing Responsive

### Dispositivos a Probar

| Dispositivo | Resolución | Orientación |
|-------------|------------|-------------|
| iPhone SE | 375x667 | Portrait/Landscape |
| iPhone 14 | 390x844 | Portrait/Landscape |
| iPad Mini | 768x1024 | Portrait/Landscape |
| iPad Pro 12.9 | 1024x1366 | Portrait/Landscape |
| Desktop HD | 1366x768 | Landscape |
| Desktop FHD | 1920x1080 | Landscape |
| 4K Display | 3840x2160 | Landscape |

### Chrome DevTools

1. Abrir DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Seleccionar dispositivo o resolución custom
4. Probar rotación

---

## 📊 Performance

### Optimizaciones Implementadas

1. **Throttled Resize**: Evento resize con RAF (100ms delay)
2. **GPU Acceleration**: `transform: translateZ(0)` en animaciones
3. **Lazy Loading**: Imágenes con `loading="lazy"`
4. **Will-Change**: Solo en elementos animados

### Métricas Objetivo

- **First Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Cumulative Layout Shift**: < 0.1

---

## 🚀 Implementación

### Paso 1: Importar Estilos

```typescript
// POS: main.tsx o App.tsx
import './styles/responsive.css';

// KDS: main.tsx o App.tsx  
import './styles/responsive.css';
```

### Paso 2: Usar Componentes

```tsx
// En cualquier componente
<button className="btn-responsive btn-primary">
  Botón Táctil
</button>

<div className="grid-products">
  {products.map(p => <ProductCard key={p.id} {...p} />)}
</div>
```

### Paso 3: Usar Hook (opcional)

```tsx
import { useResponsive } from '../shared/hooks/useResponsive';

function MiComponente() {
  const { isMobile, breakpoint } = useResponsive();
  // ... lógica responsive
}
```

---

## 📝 Notas Adicionales

### Compatibilidad Navegadores

- **Chrome/Edge**: ✅ Full support
- **Firefox**: ✅ Full support
- **Safari**: ✅ Full support (iOS 14+)
- **Samsung Internet**: ✅ Full support

### Recomendaciones

1. Siempre usar `dvh` (dynamic viewport height) en lugar de `vh` en móviles
2. Probar en dispositivos reales, no solo emuladores
3. Mantener touch targets >= 44px
4. Usar `clamp()` para valores fluidos
5. Implementar safe areas para notch

---

## 🔗 Archivos del Sistema

```
YCC_POS_IMPLEMENTATION/
├── 04_CORE_POS/
│   └── src/
│       └── styles/
│           └── responsive.css      # Estilos POS
├── 05_KDS_SYSTEM/
│   └── src/
│       └── styles/
│           └── responsive.css      # Estilos KDS
└── shared/
    └── hooks/
        └── useResponsive.ts       # Hook React
```

---

**Versión**: 1.0.0  
**Fecha**: Abril 2026  
**Autor**: YCC Development Team
