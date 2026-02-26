# YCC POINT OF SALE — PROMPTS POR FASE PARTE 2 (V2)
## Fases 3-7 + Auditoría Final — Con Validación Integrada
### CEO Developer Vision | Febrero 2026 | Versión 2.0

---

# ═══════════════════════════════════════════════════════════
# FASE 3 — KITCHEN DISPLAY SYSTEM (KDS)
# ═══════════════════════════════════════════════════════════

## PROMPT 3.1 — App KDS: Setup + Pantalla Principal

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 3.1)
═══════════════════════════════════════

LEER OBLIGATORIAMENTE antes de escribir código:

  □ docs/PROGRESS.md → Fases 0, 1 y 2 completas (0.1-0.4, 1.1-1.5, 2.1-2.3 ✅)
  □ packages/types/src/kds.types.ts → LEER COMPLETO
    → Usar EXACTAMENTE estos tipos: KdsTicket, KdsTicketItem, KdsStation, 
      KdsTicketStatus, KdsItemStatus
  □ packages/types/src/websocket.types.ts → LEER COMPLETO
    → Usar EXACTAMENTE estos eventos: 'order:new', 'order:modified', 
      'order:cancelled', 'kds:item-started', 'kds:item-ready', 'kds:ticket-ready'
  □ packages/types/src/order.types.ts → LEER COMPLETO
  □ packages/animations/src/variants/kds.ts → LEER COMPLETO
    → Usar variantes de KDS existentes (entrada, bump, pulse urgencia)
  □ packages/animations/src/components/ → LEER
    → Usar PulseIndicator, SlideIn, AnimatedPresence existentes
  □ apps/api/src/modules/websocket/ → LEER gateway completo
    → Verificar rooms disponibles: store:{storeId}:kds:{stationId}
    → Verificar eventos que el backend ya emite
  □ apps/pos/src/ → REVISAR cómo se configuró Vite, Tailwind, Router en 2.1
    → Seguir EXACTAMENTE el mismo patrón para apps/kds/
  □ docs/API_ENDPOINTS.md → sección WebSocket Events

  Ejecutar:
    pnpm typecheck → 0 errores
    cd apps/api && pnpm start:dev → API + WebSocket corriendo

DEPENDENCIAS:
  - WebSocket Gateway de Prompt 1.4 (eventos y rooms)
  - Tipos KDS de @ycc/types (Prompt 0.3)
  - Animaciones KDS de @ycc/animations (Prompt 0.4)
  - Patrón de setup de apps/pos/ (Prompt 2.1)

REGLAS:
  - IMPORTAR tipos de @ycc/types (NO crear tipos nuevos para KDS)
  - IMPORTAR animaciones de @ycc/animations (NO crear variantes inline)
  - Seguir MISMO patrón de Vite/Tailwind/Router que apps/pos/
  - Conectar al MISMO WebSocket Gateway que ya existe en el backend

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior React developer especializado en sistemas de tiempo real.
Crea la aplicación KDS (Kitchen Display System) del proyecto YCC POS.

UBICACIÓN: apps/kds/

TEMA OSCURO KDS (optimizado para cocina):
  Fondo pantalla:    #0F0F0F
  Fondo ticket:      #1E1E1E
  Borde ticket:      #333333
  Texto principal:   #F5F5F5
  Texto secundario:  #A0A0A0
  Header café:       #3C2415
  Timer verde:       #22C55E (< 5 min)
  Timer amarillo:    #EAB308 (5-10 min)
  Timer rojo:        #EF4444 (> 10 min)
  Timer parpadeante: #EF4444 con PulseIndicator de @ycc/animations (> 15 min)

COMPONENTES (10):
1. KdsApp              ← Root con WebSocket connection
2. KdsHeader           ← Estación, contador pendientes, reloj
3. KdsTicketGrid       ← CSS Grid responsive de tickets
4. KdsTicket           ← Card de pedido individual
5. KdsTicketHeader     ← #pedido, mesa/tipo, timer con color
6. KdsTicketItem       ← Item con modificadores y estado
7. KdsTicketActions    ← Botones Iniciar/Listo
8. KdsTimer            ← Timer en tiempo real con cambio de color
9. KdsPagination       ← Navegación entre páginas
10. KdsStationSelector ← Modal para seleccionar estación al inicio

FLUJO WEBSOCKET:
1. KDS conecta con JWT al namespace /ws del backend (Prompt 1.4)
2. Se une al room: store:{storeId}:kds:{stationId}
3. Escucha: 'order:new', 'order:modified', 'order:cancelled'
4. Emite: 'kds:item-started', 'kds:item-ready', 'kds:ticket-ready'

ESTADO (Zustand):
  tickets: KdsTicket[]  (tipo de @ycc/types)
  stationId: string
  storeId: string
  connectionStatus: 'connected' | 'reconnecting' | 'disconnected'

ANIMACIONES (IMPORTAR de @ycc/animations):
  - Nuevo ticket: SlideIn desde derecha
  - Bump: variante kds.bump de @ycc/animations
  - Timer > 15 min: PulseIndicator de @ycc/animations
  - Reconexión: banner SlideIn desde arriba

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/kds && pnpm build → 0 errores
  pnpm typecheck → 0 errores en TODO el monorepo

PROBAR FLUJO COMPLETO (requiere API + POS corriendo):
  □ KDS carga y muestra selector de estación
  □ Seleccionar estación → conecta WebSocket → status "connected"
  □ Crear venta desde POS → ticket aparece en KDS con SlideIn
  □ Click "Iniciar" → emite 'kds:item-started' → item cambia estado
  □ Click "Listo" → emite 'kds:item-ready'
  □ Timer funciona en tiempo real con colores correctos
  □ Timer > 15 min → PulseIndicator rojo
  □ Desconectar API → banner "Reconectando..." → reconecta automático
  □ 0 errores en consola del browser
  □ TODOS los imports de @ycc/* resuelven correctamente

VERIFICAR INTEGRIDAD CON PROMPTS ANTERIORES:
  □ WebSocket usa MISMOS eventos que docs/API_ENDPOINTS.md
  □ Tipos KDS coinciden con @ycc/types/kds.types.ts
  □ Animaciones vienen de @ycc/animations (no inline)
  □ apps/pos/ sigue funcionando sin cambios

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar sección "KDS App" con diagrama de flujo WS
  docs/CHANGELOG.md    → Entrada Prompt 3.1
  docs/PROGRESS.md     → Marcar [x] Prompt 3.1
```

---

## PROMPT 3.2 — KDS Expediter (Vista del Coordinador)

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 3.2)
═══════════════════════════════════════

  □ docs/PROGRESS.md → hasta 3.1 todo ✅
  □ apps/kds/src/ → LEER TODOS los componentes creados en 3.1
    → Reutilizar: KdsTicket, KdsTimer, KdsTicketItem como base
    → NO duplicar componentes, EXTENDER o crear variantes
  □ packages/types/src/kds.types.ts → LEER
    → Verificar si existe tipo para Expediter o si hay que usar KdsTicket
  □ apps/kds/src/stores/ → LEER store de Zustand
    → Extender el store existente, NO crear otro

  Ejecutar: cd apps/kds && pnpm build → 0 errores

REGLA: El Expediter es una VARIANTE del KDS, no una app separada.
       Reutilizar componentes de 3.1, agregar vista Expediter.

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior React developer. Crea la vista EXPEDITER del KDS de YCC.

El Expediter ve TODOS los items de un pedido (de todas las estaciones).
Solo puede hacer "Bump" cuando TODOS los items están listos.

COMPONENTES NUEVOS (reutilizar base de 3.1):
1. KdsExpediterTicket    ← Extiende KdsTicket con vista multi-estación
2. KdsProgressBar        ← Barra de progreso items listos/total
3. KdsBumpButton         ← Botón Bump (activo solo cuando 100%)
4. KdsStationBadge       ← Badge con nombre de estación + color

LÓGICA:
- Cuando prep station marca item listo → expediter recibe update vía WS
- Barra de progreso se anima con AnimatedCounter de @ycc/animations
- Todos listos → borde verde + Bump activo + sonido "ding"
- Bump → emitir 'kds:ticket-ready' → ticket desaparece con animación

ROUTING EN LA APP:
  /kds/station/:id  → Vista prep station (Prompt 3.1)
  /kds/expediter    → Vista expediter (este prompt)

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/kds && pnpm build → 0 errores
  pnpm typecheck → 0 errores

  □ /kds/expediter muestra tickets con items de TODAS las estaciones
  □ Items muestran badge de estación de origen
  □ Barra de progreso se actualiza cuando prep station marca listo
  □ Bump solo se activa cuando todos los items están listos
  □ Bump → ticket desaparece → notificación al POS
  □ Vista prep station (3.1) sigue funcionando sin cambios
  □ 0 errores en consola

  VERIFICACIÓN DE FASE 3 COMPLETA:
    ✅ 3.1 KDS Prep Station
    ✅ 3.2 KDS Expediter
    ✅ Flujo: POS venta → KDS ticket → prep marca listo → expediter bump
    ✅ WebSocket bidireccional funcionando
    ✅ pnpm typecheck → 0 errores

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Actualizar diagrama KDS con vista Expediter
  docs/CHANGELOG.md    → Entrada Prompt 3.2
  docs/PROGRESS.md     → Marcar [x] Prompt 3.2
```

---

# ═══════════════════════════════════════════════════════════
# FASE 4 — ADMIN PANEL (BACK OFFICE)
# ═══════════════════════════════════════════════════════════

## PROMPT 4.1 — Admin Panel: Setup + Dashboard

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 4.1)
═══════════════════════════════════════

  □ docs/PROGRESS.md → Fases 0-3 completas (todos ✅)
  □ docs/API_ENDPOINTS.md → LEER COMPLETO
    → Dashboard consume: /reports/daily-sales, /reports/food-cost,
      /reports/sales-by-item, /reports/inventory/low-stock
    → Verificar que TODOS estos endpoints existen (Prompt 1.5)
  □ packages/types/src/costing.types.ts → LEER (tipos de reportes)
  □ packages/types/src/sale.types.ts → LEER
  □ packages/types/src/websocket.types.ts → LEER (alertas en tiempo real)
  □ apps/pos/src/ → REVISAR patrón de setup (Vite, Tailwind, Router, stores)
    → Seguir EXACTAMENTE el mismo patrón para apps/admin/
  □ packages/animations/src/ → verificar componentes disponibles

  Ejecutar:
    pnpm typecheck → 0 errores
    cd apps/api && pnpm start:dev → API corriendo

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior React developer. Crea el panel de ADMINISTRACIÓN de YCC POS.

UBICACIÓN: apps/admin/

LAYOUT: Sidebar oscura (café #2D1810) + content area (#F9FAFB)

SIDEBAR NAVIGATION:
  📊 Dashboard | 🍽️ Menú | 📦 Inventario | 🧾 Recetas & Costeo
  💰 Ventas | 👥 Usuarios | 🏪 Sucursales | 📈 Reportes | ⚙️ Config

DASHBOARD (página principal):
  - 4 StatCards: Ventas Hoy, Pedidos, Food Cost %, Ticket Promedio
  - Gráfica ventas por hora (Recharts)
  - Top 5 platillos vendidos
  - Gráfica Food Cost AvT (teórico vs real)
  - Panel de alertas en tiempo real (WebSocket)
  - Selector de sucursal (filtra todo)

COMPONENTES:
1. AdminLayout (sidebar colapsable + header + content)
2. Sidebar (con iconos, labels, active state)
3. DashboardPage
4. StatCard (número + tendencia + sparkline)
5. SalesChart (Recharts, ventas por hora)
6. TopItemsList
7. FoodCostChart (líneas teórico vs real)
8. AlertsPanel (WebSocket real-time)
9. StoreSelector (dropdown)

DATOS: Consumir endpoints de /reports/ (Prompt 1.5) via TanStack Query.
TIPOS: Importar de @ycc/types (NO crear tipos nuevos).
ANIMACIONES: Importar de @ycc/animations.
TABLAS: TanStack Table v8.
FORMULARIOS: React Hook Form + Zod.
GRÁFICAS: Recharts.

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/admin && pnpm build → 0 errores
  pnpm typecheck → 0 errores

  □ Dashboard carga con datos reales del API
  □ StatCards muestran números del endpoint /reports/daily-sales
  □ Gráfica de ventas renderiza correctamente
  □ Selector de sucursal filtra datos
  □ Alertas aparecen vía WebSocket
  □ Sidebar navega entre secciones (aunque estén vacías aún)
  □ 0 errores en consola
  □ apps/pos/ y apps/kds/ siguen funcionando sin cambios

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar sección "Admin Panel"
  docs/CHANGELOG.md    → Entrada Prompt 4.1
  docs/PROGRESS.md     → Marcar [x] Prompt 4.1
```

---

## PROMPT 4.2 — Admin: Gestión de Menú (CRUD)

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 4.2)
═══════════════════════════════════════

  □ docs/PROGRESS.md → hasta 4.1 todo ✅
  □ apps/admin/src/ → LEER layout, sidebar, router creados en 4.1
    → Las páginas de menú se montan DENTRO del AdminLayout existente
  □ docs/API_ENDPOINTS.md → sección Menu Module
    → Verificar endpoints: GET/POST/PATCH /menu/categories, /menu/items,
      /menu/modifier-groups, GET /menu/items/:id/recipe-cost
  □ packages/types/src/menu.types.ts → LEER COMPLETO
  □ packages/types/src/recipe.types.ts → LEER (para preview de food cost)
  □ apps/admin/src/services/ → LEER api client (si existe, reutilizar)

  Ejecutar: cd apps/admin && pnpm build → 0 errores

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior React developer. Crea el módulo de GESTIÓN DE MENÚ.

PÁGINAS (dentro del AdminLayout existente):
  /admin/menu/categories  → Árbol jerárquico drag-and-drop
  /admin/menu/items       → Tabla con filtros + CRUD
  /admin/menu/modifiers   → Grupos y opciones

FEATURE CLAVE en editor de platillo:
  Al cambiar precio o receta, mostrar EN TIEMPO REAL:
  - Costo receta: $34.53 (de GET /menu/items/:id/recipe-cost)
  - Food cost %: 38.8%
  - Margen: $54.47 (61.2%)
  - Semáforo: 🟢 < 30% | 🟡 30-35% | 🔴 > 35%

COMPONENTES: MenuCategoriesPage, MenuItemsPage, MenuItemForm,
MenuItemRecipePreview, ModifierGroupsPage, ModifierOptionForm

USAR: TanStack Table, React Hook Form + Zod, TanStack Query, @ycc/animations

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/admin && pnpm build → 0 errores
  pnpm typecheck → 0 errores

  □ /admin/menu/categories muestra árbol de categorías del API
  □ Crear categoría → aparece en árbol
  □ /admin/menu/items muestra tabla con datos reales
  □ Crear platillo → formulario completo funciona
  □ Food cost preview se actualiza en tiempo real
  □ /admin/menu/modifiers → CRUD funciona
  □ Dashboard (4.1) sigue funcionando
  □ apps/pos/ y apps/kds/ sin cambios

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/CHANGELOG.md → Entrada Prompt 4.2
  docs/PROGRESS.md  → Marcar [x] Prompt 4.2
```

---

## PROMPT 4.3 — Admin: Gestión de Inventario + Compras

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 4.3)
═══════════════════════════════════════

  □ docs/PROGRESS.md → hasta 4.2 todo ✅
  □ apps/admin/src/ → LEER router, layout, patrón de páginas de 4.1-4.2
    → Seguir EXACTAMENTE el mismo patrón para páginas de inventario
  □ docs/API_ENDPOINTS.md → sección Inventory Module y Suppliers Module
    → Verificar TODOS los endpoints disponibles
  □ packages/types/src/inventory.types.ts → LEER COMPLETO
  □ packages/types/src/store.types.ts → LEER (StoreInventory)
  □ apps/admin/src/services/ → LEER api client existente

  Ejecutar: cd apps/admin && pnpm build → 0 errores

REGLA: Seguir MISMO patrón de componentes que 4.2 (tablas, formularios, etc.)

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior React developer. Crea el módulo de INVENTARIO en admin.

PÁGINAS:
  /admin/inventory/ingredients  → CRUD ingredientes
  /admin/inventory/stock        → Stock por sucursal con semáforos
  /admin/inventory/counts       → Wizard de conteo físico
  /admin/inventory/purchases    → Órdenes de compra + recepción
  /admin/inventory/suppliers    → CRUD proveedores
  /admin/inventory/waste        → Registro de desperdicios
  /admin/inventory/movements    → Timeline de movimientos

LÓGICA CRÍTICA — Recepción de compra:
  Al confirmar recepción → POST /purchase-orders/:id/receive
  → Backend actualiza stock + recalcula costo promedio (ya implementado en 1.2)
  → Frontend refresca datos de inventario

COMPONENTES CLAVE:
  StockDashboard (tabla con indicadores 🟢🟡🔴)
  PhysicalCountWizard (wizard paso a paso)
  PurchaseOrderForm (con autocomplete de ingredientes)
  ReceiveOrderForm (verificación de cantidades)
  MovementTimeline (timeline visual)
  InventoryValuationCard (total $ del inventario)

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/admin && pnpm build → 0 errores
  pnpm typecheck → 0 errores

  □ /admin/inventory/ingredients → tabla con datos reales
  □ /admin/inventory/stock → semáforos correctos por nivel de stock
  □ Crear OC → recibir OC → stock se actualiza en pantalla
  □ Conteo físico: wizard completo funciona
  □ Registro de desperdicio funciona
  □ Timeline de movimientos muestra datos reales
  □ Páginas de menú (4.2) siguen funcionando
  □ Dashboard (4.1) sigue funcionando

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/CHANGELOG.md → Entrada Prompt 4.3
  docs/PROGRESS.md  → Marcar [x] Prompt 4.3
```

---

## PROMPT 4.4 — Admin: Recetas y Costeo (El Corazón del Sistema)

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 4.4)
═══════════════════════════════════════

  □ docs/PROGRESS.md → hasta 4.3 todo ✅
  □ docs/API_ENDPOINTS.md → secciones Recipes Module y Reports Module
    → Verificar: GET/POST/PATCH /recipes, POST /recipes/:id/calculate-cost,
      GET /recipes/:id/bom-explosion, GET /reports/food-cost/avt
  □ packages/types/src/recipe.types.ts → LEER COMPLETO
  □ packages/types/src/costing.types.ts → LEER COMPLETO
    → Tipos: RecipeCost, AvTReport, FoodCostReport, BOMExplosionResult
  □ apps/admin/src/ → LEER patrón de páginas de 4.2-4.3
  □ packages/animations/src/components/AnimatedCounter.tsx → LEER
    → Usar para costo en tiempo real en el editor de recetas

  Ejecutar: cd apps/admin && pnpm build → 0 errores

ESTE ES EL PROMPT MÁS IMPORTANTE DEL ADMIN.
El editor de recetas es el componente más complejo del sistema.

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior React developer + analista financiero. Crea el módulo de 
RECETAS Y COSTEO en el admin panel de YCC POS.

PÁGINAS:
  /admin/recipes           → Lista de recetas
  /admin/recipes/:id       → EDITOR DE RECETA (componente más complejo)
  /admin/recipes/food-cost → Dashboard de food cost por platillo
  /admin/recipes/avt       → Reporte Actual vs. Teórico

EDITOR DE RECETA — Layout de 2 columnas:
  Izquierda: Líneas de ingredientes (editables inline)
  Derecha: Panel de costeo en TIEMPO REAL

FUNCIONALIDADES DEL EDITOR:
1. Agregar ingrediente con autocomplete
2. Agregar sub-receta (seleccionar de existentes)
3. Cambiar cantidad → recalcula costo con AnimatedCounter (< 100ms)
4. Cambiar unidad → conversión automática
5. Costo por sucursal (cada una tiene costos diferentes)
6. Gráfica de dona: % de cada ingrediente en el costo total
7. Expandir sub-receta inline (accordion)
8. Semáforo food cost: 🟢 < 30% | 🟡 30-35% | 🔴 > 35%

REPORTE AvT:
  Parámetros: sucursal, fecha inicio, fecha fin
  Consume: GET /reports/food-cost/avt (Prompt 1.5)
  Muestra: ventas, teórico%, real%, varianza%, top ingredientes varianza
  Gráfica: tendencia AvT últimas 12 semanas (Recharts)
  Comparación entre sucursales

COMPONENTES:
  RecipeEditor, RecipeLineRow, RecipeCostSummary, RecipeCostByStore,
  RecipeCostBreakdown (dona), SubRecipeExpander, IngredientSearchAutocomplete,
  FoodCostDashboard, AvTReportPage, AvTChart, VarianceTable

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/admin && pnpm build → 0 errores
  pnpm typecheck → 0 errores

  □ /admin/recipes → lista recetas del API
  □ Editor de receta: agregar ingrediente → costo se recalcula en < 100ms
  □ Editor: cambiar cantidad → AnimatedCounter actualiza
  □ Editor: agregar sub-receta → se resuelve recursivamente
  □ Editor: costo por sucursal muestra valores diferentes
  □ Editor: gráfica de dona renderiza correctamente
  □ /admin/recipes/food-cost → tabla con semáforos
  □ /admin/recipes/avt → reporte AvT con gráfica
  □ TODAS las páginas anteriores (4.1-4.3) siguen funcionando
  □ apps/pos/ y apps/kds/ sin cambios

  VERIFICACIÓN DE FASE 4 COMPLETA:
    ✅ 4.1 Dashboard
    ✅ 4.2 Gestión de Menú
    ✅ 4.3 Inventario + Compras
    ✅ 4.4 Recetas + Costeo + AvT
    ✅ pnpm typecheck → 0 errores
    ✅ TODAS las apps (pos, kds, admin) funcionan simultáneamente
    ✅ Flujo completo: Crear receta → Vender en POS → Ver food cost en Admin

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar diagrama del módulo de costeo
  docs/CHANGELOG.md    → Entrada Prompt 4.4
  docs/PROGRESS.md     → Marcar [x] Prompt 4.4
```

---

# ═══════════════════════════════════════════════════════════
# FASE 5 — MANEJO DE ERRORES + UX POLISH
# ═══════════════════════════════════════════════════════════

## PROMPT 5.1 — Sistema de Errores y Notificaciones

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 5.1)
═══════════════════════════════════════

  □ docs/PROGRESS.md → Fases 0-4 completas (todos ✅)
  □ packages/ui/src/ → LEER TODO lo que existe
    → Si ya hay componentes de UI, NO duplicar
  □ apps/pos/src/components/ → LEER TODOS
    → Identificar dónde faltan loading states, error handling
  □ apps/kds/src/components/ → LEER TODOS
    → Identificar dónde faltan estados de error/reconexión
  □ apps/admin/src/components/ → LEER TODOS
    → Identificar formularios sin validación visual
  □ apps/api/src/common/filters/ → LEER HttpExceptionFilter
    → Verificar que TODOS los errores ya retornan ErrorResponse
  □ packages/types/src/api.types.ts → LEER ErrorResponse
  □ packages/animations/src/ → verificar componentes disponibles

  Ejecutar:
    pnpm typecheck → 0 errores
    Abrir CADA app en browser → anotar errores de consola existentes

PROPÓSITO: Este prompt MEJORA lo existente, no crea desde cero.
Agrega error handling y UX polish a TODO lo construido en Fases 0-4.

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior UX engineer. Crea el sistema de errores y notificaciones 
para TODAS las apps de YCC POS y corrige UX issues existentes.

CREAR EN packages/ui/ (compartido entre TODAS las apps):

1. ToastProvider + useToast hook
2. ToastContainer (posición fija, stack animado)
3. Toast (éxito verde, info azul, warning amarillo, error rojo)
4. ConfirmModal (acciones destructivas)
5. ErrorOverlay (pantalla completa para errores críticos)
6. OfflineBanner (banner persistente modo offline)
7. InlineError (para formularios)
8. ErrorBoundary (React Error Boundary con fallback YCC)

CATÁLOGO DE MENSAJES (en packages/utils/src/error-messages.ts):
  AUTH_001-007, SALE_001-007, INV_001-003, CONN_001-003, KDS_001-002
  Cada mensaje: { code, title, message, action }

DESPUÉS DE CREAR LOS COMPONENTES, INTEGRAR EN APPS EXISTENTES:

apps/pos/:
  □ Agregar ToastProvider en App.tsx
  □ Agregar ErrorBoundary en App.tsx
  □ Agregar OfflineBanner cuando no hay conexión
  □ Checkout: mostrar toast de éxito/error después de pago
  □ Cart: mostrar toast al agregar item
  □ Login: mostrar error inline en campos

apps/kds/:
  □ Agregar ToastProvider y ErrorBoundary
  □ Mostrar banner de reconexión WebSocket
  □ Mostrar toast cuando ticket se completa

apps/admin/:
  □ Agregar ToastProvider y ErrorBoundary
  □ Todos los formularios: agregar InlineError en campos
  □ Todas las acciones destructivas: agregar ConfirmModal
  □ Todas las operaciones async: agregar loading + error toast

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  pnpm typecheck → 0 errores en TODO el monorepo
  cd apps/pos && pnpm build → 0 errores
  cd apps/kds && pnpm build → 0 errores
  cd apps/admin && pnpm build → 0 errores

PROBAR EN CADA APP:
  □ POS: desconectar API → OfflineBanner aparece
  □ POS: reconectar API → banner desaparece + toast "Conexión restaurada"
  □ POS: venta exitosa → toast verde "Venta #X completada"
  □ POS: error de pago → toast rojo con mensaje accionable
  □ KDS: desconectar WS → banner "Reconectando..."
  □ Admin: eliminar item → ConfirmModal aparece
  □ Admin: formulario con campos vacíos → InlineError en cada campo
  □ 0 errores en consola de TODAS las apps

VERIFICAR QUE NO SE ROMPIÓ NADA:
  □ Flujo POS completo: login → abrir caja → vender → cobrar → éxito
  □ Flujo KDS: recibir ticket → iniciar → listo → bump
  □ Flujo Admin: dashboard → menú → inventario → recetas

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar sección "Error Handling System"
  docs/CHANGELOG.md    → Entrada Prompt 5.1
  docs/PROGRESS.md     → Marcar [x] Prompt 5.1
```

---

# ═══════════════════════════════════════════════════════════
# FASE 6 — TESTING AUTOMATIZADO
# ═══════════════════════════════════════════════════════════

## PROMPT 6.1 — Tests Backend (Vitest + Supertest)

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 6.1)
═══════════════════════════════════════

  □ docs/PROGRESS.md → Fases 0-5 completas (todos ✅)
  □ apps/api/src/modules/ → LEER TODOS los servicios
    → Los tests deben cubrir CADA servicio existente
  □ packages/db/prisma/schema.prisma → LEER (para factories de test)
  □ packages/db/prisma/seed.ts → LEER (reutilizar datos de seed)
  □ apps/api/src/modules/sales/sales.service.ts → LEER COMPLETO
    → Este es el servicio MÁS CRÍTICO para testing
  □ apps/api/src/modules/recipes/recipes.service.ts → LEER COMPLETO
    → bomExplosion() y calculateCost() son funciones críticas

  Ejecutar:
    pnpm typecheck → 0 errores
    cd apps/api && pnpm build → 0 errores

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior QA engineer. Crea la suite de tests backend completa.

ESTRUCTURA:
apps/api/test/
├── setup.ts              ← Test DB setup, seed, cleanup
├── helpers/
│   ├── auth.helper.ts    ← Login helper
│   ├── factory.ts        ← Factories (usar datos del seed como base)
│   └── assertions.ts
├── unit/
│   ├── bom-resolver.spec.ts      ← BOM recursivo (6 tests)
│   ├── sales.service.spec.ts     ← Ventas + deducción (6 tests)
│   ├── recipe-cost.spec.ts       ← Costeo (3 tests)
│   ├── inventory.service.spec.ts ← Costo promedio (2 tests)
│   └── auth.service.spec.ts      ← Auth (5 tests)
├── integration/
│   ├── auth.e2e.spec.ts
│   ├── menu.e2e.spec.ts
│   ├── sales.e2e.spec.ts
│   ├── inventory.e2e.spec.ts
│   └── reports.e2e.spec.ts
└── fixtures/

24 TESTS CRÍTICOS: [misma lista que versión anterior]

REGLA: Cada test es INDEPENDIENTE (setup/teardown propio).
       Usar transacciones de Prisma para rollback.
       Factories crean datos basados en el schema REAL.

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/api && pnpm test → TODOS los tests pasan (0 failures)
  cd apps/api && pnpm test:cov → Coverage > 80% en servicios críticos

  □ 24 tests críticos: TODOS pasan
  □ BOM resolver: 6/6 pasan
  □ Sales + deducción: 6/6 pasan
  □ Recipe cost: 3/3 pasan
  □ Inventory: 2/2 pasan
  □ Auth: 5/5 pasan
  □ Integration tests: todos pasan
  □ 0 tests flaky (correr 3 veces, mismo resultado)

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar sección "Testing Strategy"
  docs/CHANGELOG.md    → Entrada Prompt 6.1
  docs/PROGRESS.md     → Marcar [x] Prompt 6.1
```

---

## PROMPT 6.2 — Tests Frontend (Vitest + Testing Library + Playwright)

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 6.2)
═══════════════════════════════════════

  □ docs/PROGRESS.md → hasta 6.1 todo ✅
  □ apps/pos/src/stores/cart.store.ts → LEER COMPLETO (para unit tests)
  □ apps/pos/src/components/ → LEER TODOS (para component tests)
  □ apps/pos/src/routes/ → LEER (para E2E flow)
  □ apps/api/test/ → LEER setup.ts (reutilizar patrón para frontend)

  Ejecutar: cd apps/pos && pnpm build → 0 errores

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior QA engineer. Crea tests frontend para YCC POS.

UNIT TESTS (Vitest + Testing Library):
  - CartPanel, CartTotals, MenuItemCard, NumericKeypad
  - cart.store (9 tests: add, remove, quantity, modifiers, tax, discount, persist)
  - auth.store (login, logout, refresh)

E2E TESTS (Playwright):
  - sale-cash.spec.ts: Login → Abrir caja → Agregar items → Cobrar efectivo → Éxito
  - sale-card.spec.ts: Venta con tarjeta
  - cash-session.spec.ts: Abrir → vender → cerrar caja
  - search.spec.ts: Buscar producto → agregar
  - modifiers.spec.ts: Seleccionar modificadores

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/pos && pnpm test → TODOS pasan
  cd apps/pos && pnpm test:e2e → TODOS pasan

  □ Cart store: 9/9 tests pasan
  □ Component tests: todos pasan
  □ E2E sale-cash: flujo completo funciona
  □ E2E cash-session: abrir/cerrar funciona
  □ 0 tests flaky

  VERIFICACIÓN DE FASE 6 COMPLETA:
    ✅ 6.1 Backend tests (24+ tests, >80% coverage)
    ✅ 6.2 Frontend tests (unit + E2E)
    ✅ pnpm test (root) → TODOS los tests del monorepo pasan

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Actualizar sección Testing con cobertura
  docs/CHANGELOG.md    → Entrada Prompt 6.2
  docs/PROGRESS.md     → Marcar [x] Prompt 6.2
```

---

# ═══════════════════════════════════════════════════════════
# FASE 7 — DEPLOY A PRODUCCIÓN
# ═══════════════════════════════════════════════════════════

## PROMPT 7.1 — Deploy a VPS (Producción)

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 7.1)
═══════════════════════════════════════

  □ docs/PROGRESS.md → Fases 0-6 completas (todos ✅)
  □ apps/api/package.json → LEER scripts de build
  □ apps/pos/vite.config.ts → LEER (para build de producción)
  □ apps/kds/vite.config.ts → LEER
  □ apps/admin/vite.config.ts → LEER
  □ Verificar que TODAS las apps compilan:
    pnpm build → 0 errores en TODO el monorepo
  □ Tener acceso a VPS (Ubuntu 22.04 LTS recomendado)

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior DevOps engineer. Crea la configuración de deploy a VPS.

ARCHIVOS A CREAR:
  scripts/deploy.sh              ← Script de deploy automatizado
  scripts/setup-vps.sh           ← Setup inicial del VPS
  nginx/ycc-pos.conf             ← Config Nginx para todas las apps
  ecosystem.config.js            ← PM2 config para API
  .env.production.example        ← Variables de entorno producción

SERVICIOS EN VPS:
  - PostgreSQL 16 (instalado en VPS)
  - Redis 7 (instalado en VPS)
  - Nginx (reverse proxy)
  - PM2 (process manager para API)
  - Apps frontend (build estático servido por Nginx)

REQUISITOS:
  - Setup script instala: Node.js 20, pnpm, PostgreSQL, Redis, Nginx, PM2
  - Deploy script: build → transfer → restart
  - Nginx sirve apps frontend + proxy a API
  - PM2 mantiene API corriendo con auto-restart
  - SSL con Certbot (Let's Encrypt)
  - Backups automáticos de PostgreSQL

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  bash scripts/setup-vps.sh (en VPS) → instala todo sin errores
  bash scripts/deploy.sh → deploy completo exitoso
  curl https://pos.ycc.com/health → API responde
  curl https://pos.ycc.com → POS app carga
  curl https://kds.ycc.com → KDS app carga
  curl https://admin.ycc.com → Admin app carga

  □ PostgreSQL corriendo en VPS
  □ Redis corriendo en VPS
  □ PM2 muestra API corriendo (pm2 status)
  □ Nginx sirve todas las apps
  □ WebSocket funciona a través de nginx
  □ SSL configurado correctamente

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar sección "Deployment" con diagrama VPS
  docs/CHANGELOG.md    → Entrada Prompt 7.1
  docs/PROGRESS.md     → Marcar [x] Prompt 7.1
```

---

## PROMPT 7.2 — CI/CD Pipeline (GitHub Actions)

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 7.2)
═══════════════════════════════════════

  □ docs/PROGRESS.md → hasta 7.1 todo ✅
  □ scripts/deploy.sh → LEER script de deploy de 7.1
  □ apps/api/test/ → verificar que tests existen (6.1)
  □ apps/pos/test/ → verificar que tests existen (6.2)
  □ package.json (root) → LEER scripts disponibles

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior DevOps engineer. Crea CI/CD con GitHub Actions.

WORKFLOWS:
  .github/workflows/ci.yml           ← Lint + Typecheck + Test en cada PR
  .github/workflows/deploy-staging.yml  ← Deploy a staging en merge a develop
  .github/workflows/deploy-prod.yml     ← Deploy a prod en merge a main

CI: lint → typecheck → test-api → test-pos → test-e2e → build
STAGING: build images → push registry → SSH deploy → migrate → health check
PROD: build → push → backup DB → SSH deploy → migrate → health check → rollback si falla

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  □ ci.yml: sintaxis válida (act --list o GitHub syntax check)
  □ Todos los scripts referenciados existen en package.json
  □ Secrets documentados en .env.production.example
  □ Rollback procedure documentado

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar sección "CI/CD Pipeline"
  docs/CHANGELOG.md    → Entrada Prompt 7.2
  docs/PROGRESS.md     → Marcar [x] Prompt 7.2
```

---

## PROMPT 7.3 — Monitoreo + Observabilidad

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 7.3)
═══════════════════════════════════════

  □ docs/PROGRESS.md → hasta 7.2 todo ✅
  □ scripts/setup-vps.sh → LEER (agregar instalación de monitoreo)
  □ apps/api/src/main.ts → LEER (para agregar métricas endpoint)

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior SRE engineer. Configura monitoreo para YCC POS.

STACK: Prometheus + Grafana + Loki + Uptime Kuma
MÉTRICAS: API (req/s, latency, errors), Negocio (ventas, food cost, KDS times),
          Infra (CPU, RAM, Disk, DB connections)
ALERTAS: API >2s, errors >5%, DB >80%, disk >85%, no ventas 30min
DASHBOARDS: Overview, API Performance, Business Metrics, Infrastructure

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  □ Prometheus scraping métricas del API
  □ Grafana dashboards cargan con datos
  □ Loki recibiendo logs de todos los containers
  □ Alertas configuradas y funcionales

  VERIFICACIÓN DE FASE 7 COMPLETA:
    ✅ 7.1 Deploy a VPS
    ✅ 7.2 CI/CD GitHub Actions
    ✅ 7.3 Monitoreo
    ✅ Sistema completo deployable

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar sección "Monitoring & Observability"
  docs/CHANGELOG.md    → Entrada Prompt 7.3
  docs/PROGRESS.md     → Marcar [x] Prompt 7.3
```

---

# ═══════════════════════════════════════════════════════════
# PROMPT FINAL — AUDITORÍA PRE-PRODUCCIÓN
# ═══════════════════════════════════════════════════════════

```
[CONTEXTO YCC POS — ver bloque global en Parte 1]

═══════════════════════════════════════
🔍 PRECHECK (Prompt Final)
═══════════════════════════════════════

ESTE ES EL PRECHECK MÁS EXHAUSTIVO DE TODOS.

  □ docs/PROGRESS.md → TODOS los prompts (0.1 a 7.3) deben estar ✅
    Si alguno NO está ✅ → PARAR. No se puede auditar un sistema incompleto.

  □ LEER COMPLETO cada archivo de docs/:
    - ARCHITECTURE.md (debe tener diagrama actualizado de TODO)
    - ERD.md (debe tener TODOS los 36 modelos)
    - DATA_DICTIONARY.md (debe documentar TODAS las tablas)
    - API_ENDPOINTS.md (debe listar TODOS los endpoints)
    - CHANGELOG.md (debe tener entrada por CADA prompt)

  □ Ejecutar TODAS las verificaciones:
    pnpm typecheck           → 0 errores
    pnpm lint                → 0 errores
    pnpm build               → 0 errores en TODAS las apps
    pnpm test                → TODOS los tests pasan
    bash scripts/deploy.sh   → deploy exitoso

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un CTO haciendo la auditoría final de YCC POS antes del lanzamiento.

REVISAR TODO EL CÓDIGO y generar reporte con checklist:

1. SEGURIDAD (10 items):
   □ Passwords bcrypt salt 12+ | □ JWT 15min/7d | □ CORS restringido
   □ Rate limiting | □ SQL injection (Prisma) | □ XSS (React + CSP)
   □ HTTPS | □ Secrets en env | □ Helmet | □ Zod validation

2. PERFORMANCE (9 items):
   □ Índices DB | □ Cursor pagination | □ Redis cache | □ Lazy loading
   □ Image optimization | □ Bundle < 500KB | □ API < 200ms p95
   □ WS heartbeat | □ DB connection pool

3. RESILIENCIA (6 items):
   □ Modo offline | □ WS reconnect | □ Retry backoff | □ Circuit breaker
   □ Graceful shutdown | □ DB backups

4. UX (6 items):
   □ Loading states | □ Error messages | □ Keyboard shortcuts
   □ Touch targets 48px | □ Reduced motion | □ Feedback visual

5. DATOS (5 items):
   □ Seed data | □ Migrations up/down | □ Backup/restore | □ No test data en prod
   □ docs/ completos y actualizados

6. DOCUMENTACIÓN (6 items):
   □ README | □ Swagger /api/docs | □ Guía cajero | □ Guía admin
   □ Runbook ops | □ docs/ sincronizados con código

Para cada item: marcar ✅ o ❌ con nota de qué corregir.
Si hay ❌ → corregir ANTES de aprobar para producción.

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  TODOS los items del checklist deben ser ✅
  Si alguno es ❌ → corregir → re-auditar ese item

  PRUEBA FINAL END-TO-END:
  □ Login como cajero → abrir caja → buscar producto → agregar al carrito
    → seleccionar modificadores → cobrar efectivo → venta exitosa
    → ticket aparece en KDS → cocinero marca listo → expediter bump
    → admin ve venta en dashboard → food cost actualizado
    → cerrar caja → corte Z correcto

  Si CUALQUIER paso falla → corregir → re-probar flujo completo.

═══════════════════════════════════════
📄 DOC UPDATE (FINAL)
═══════════════════════════════════════

  docs/CHANGELOG.md → Entrada "Prompt Final — Auditoría Pre-Producción"
  docs/PROGRESS.md  → Marcar [x] Prompt Final
                    → Agregar al final: "🚀 SISTEMA APROBADO PARA PRODUCCIÓN"
  
  TODOS los docs/ deben estar sincronizados con el estado FINAL del código.
  Si algún doc está desactualizado → actualizarlo AHORA.
```

---

# RESUMEN COMPLETO V2

| Fase | Prompts | Enfoque | Validación |
|------|---------|---------|------------|
| **0** | 0.1-0.4 | Monorepo, DB, Types, Animaciones | PRECHECK: prereqs → POSTCHECK: typecheck+lint |
| **1** | 1.1-1.5 | Auth, CRUD, Ventas, WS, Reportes | PRECHECK: lee schema+types → POSTCHECK: endpoints+build |
| **2** | 2.1-2.3 | Design System, POS, Checkout | PRECHECK: lee API+types → POSTCHECK: flujo completo browser |
| **3** | 3.1-3.2 | KDS Prep, KDS Expediter | PRECHECK: lee WS events → POSTCHECK: flujo POS→KDS |
| **4** | 4.1-4.4 | Dashboard, Menú, Inventario, Costeo | PRECHECK: lee endpoints → POSTCHECK: CRUD+reportes |
| **5** | 5.1 | Errores, Toasts, UX Polish | PRECHECK: lee TODAS las apps → POSTCHECK: 0 errores consola |
| **6** | 6.1-6.2 | Backend Tests, Frontend Tests | PRECHECK: lee servicios → POSTCHECK: 100% tests pasan |
| **7** | 7.1-7.3 | Deploy VPS, CI/CD, Monitoreo | PRECHECK: lee builds → POSTCHECK: deploy funcional |
| **Final** | 1 | Auditoría 42 items | PRECHECK: TODO ✅ → POSTCHECK: E2E completo |

**TOTAL: 18 prompts, cada uno con PRECHECK + POSTCHECK + DOC UPDATE integrado.**

**Documentación viva actualizada en CADA prompt:**
- `docs/ARCHITECTURE.md` — Diagrama de arquitectura (crece con cada prompt)
- `docs/ERD.md` — Diagrama entidad-relación (36 modelos)
- `docs/DATA_DICTIONARY.md` — Diccionario de datos completo
- `docs/API_ENDPOINTS.md` — Todos los endpoints implementados
- `docs/CHANGELOG.md` — Log de cambios por prompt
- `docs/PROGRESS.md` — Checklist de prompts (el "source of truth" del avance)
