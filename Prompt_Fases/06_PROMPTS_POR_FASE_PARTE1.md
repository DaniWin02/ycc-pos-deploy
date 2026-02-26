# YCC POINT OF SALE — PLAN MAESTRO DE PROMPTS POR FASE (V2)
## Con Sistema de Validación Integrado: PRECHECK → EXECUTE → POSTCHECK → DOC
### CEO Developer Vision | Febrero 2026 | Versión 2.0

---

## SISTEMA DE VALIDACIÓN — CÓMO FUNCIONA

Cada prompt tiene 4 bloques obligatorios:

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 PRECHECK (Antes de escribir código)                      │
│  - Lee y verifica TODO lo construido en prompts anteriores   │
│  - Confirma que archivos, tipos, imports existen             │
│  - Lista dependencias de este prompt                         │
│  - Si algo falta o tiene error → PARA y reporta             │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  🔨 EXECUTE (El prompt principal — genera código)            │
│  - Usa EXACTAMENTE los tipos, nombres y paths anteriores     │
│  - NO renombra, NO duplica, NO contradice lo existente       │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  ✅ POSTCHECK (Después de generar código)                    │
│  - Ejecuta comandos de verificación                          │
│  - Lista TODOS los archivos creados/modificados              │
│  - Confirma 0 errores de TypeScript, lint, tests             │
│  - Si hay error → corrige ANTES de continuar                 │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  📄 DOC UPDATE (Actualizar documentación viva)               │
│  - Actualizar docs/ARCHITECTURE.md                           │
│  - Actualizar docs/ERD.md (diagrama entidad-relación)        │
│  - Actualizar docs/DATA_DICTIONARY.md                        │
│  - Actualizar docs/API_ENDPOINTS.md                          │
│  - Actualizar docs/CHANGELOG.md con lo hecho en este prompt  │
│  - Actualizar docs/PROGRESS.md (checklist de prompts)        │
└─────────────────────────────────────────────────────────────┘
```

---

## CONTEXTO GLOBAL (Se inyecta en TODOS los prompts automáticamente)

```
═══════════════════════════════════════════════════════════════
CONTEXTO DEL PROYECTO YCC POS — INYECTAR EN CADA PROMPT
═══════════════════════════════════════════════════════════════

Empresa: YCC
Producto: Sistema POS multi-sucursal para restaurantes
Base de datos: PostgreSQL 16 (propia, independiente)
Futuro: Integración con SAP Business One (Service Layer REST API)

Stack:
  Frontend: React 19 + TypeScript 5.4 + Vite 6 + Tailwind CSS 4 + shadcn/ui
  Backend:  NestJS 10 + Prisma 5 + TypeScript 5.4
  DB:       PostgreSQL 16 + Redis 7
  Realtime: Socket.IO 4
  Motion:   Framer Motion 11

Paleta:
  Principal:  café oscuro #3C2415
  Fondo:      blanco #FFFFFF
  Acento:     ámbar #D4A574
  Error:      rojo #DC2626
  Éxito:      verde #16A34A

Tipografía: Inter (UI) + JetBrains Mono (montos/códigos)

Filosofía:
  - Animaciones 60fps, todas < 300ms, solo transform+opacity
  - 0 bloqueo de UI en ninguna operación
  - Offline-first: ventas se guardan localmente si no hay red
  - Type-safe end-to-end: tipos compartidos frontend↔backend
  - SAP-ready: campos sap_* en DB desde día 1

Monorepo (Turborepo):
  apps/pos     → Terminal POS (cajero)
  apps/kds     → Kitchen Display System (cocina)
  apps/admin   → Panel administración (back office)
  apps/api     → Backend API (NestJS)
  packages/ui  → Componentes compartidos
  packages/types → TypeScript types compartidos
  packages/utils → Utilidades compartidas
  packages/db    → Prisma schema + client
  packages/config → ESLint, Prettier, TSConfig
  packages/animations → Framer Motion presets

Documentación viva (se actualiza en CADA prompt):
  docs/ARCHITECTURE.md     → Diagrama de arquitectura actual
  docs/ERD.md              → Diagrama entidad-relación actual
  docs/DATA_DICTIONARY.md  → Diccionario de datos (todas las tablas)
  docs/API_ENDPOINTS.md    → Lista de endpoints implementados
  docs/CHANGELOG.md        → Log de cambios por prompt
  docs/PROGRESS.md         → Checklist de prompts completados
═══════════════════════════════════════════════════════════════
```

---

# ═══════════════════════════════════════════════════════════
# FASE 0 — FUNDACIÓN: MONOREPO + ARQUITECTURA BASE
# ═══════════════════════════════════════════════════════════

## PROMPT 0.1 — Scaffolding del Monorepo + Documentación Base

```
[CONTEXTO YCC POS — ver bloque global arriba]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 0.1 — Es el primero)
═══════════════════════════════════════

Este es el PRIMER prompt. No hay código previo.
Verificar únicamente:
  □ Directorio de trabajo está vacío o no existe aún
  □ Node.js >= 20 instalado
  □ pnpm instalado
  □ Git instalado
  □ PostgreSQL 16 instalado y corriendo
  □ Redis 7 instalado y corriendo

Si algo falta, indicar EXACTAMENTE qué instalar antes de continuar.

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior fullstack architect. Crea el scaffolding completo de un 
monorepo con Turborepo para el proyecto YCC POS.

ESTRUCTURA EXACTA:

ycc-pos/
├── apps/
│   ├── pos/              ← Frontend POS (React + Vite + TS)
│   ├── kds/              ← Kitchen Display System (React + Vite + TS)
│   ├── admin/            ← Panel Admin/Back Office (React + Vite + TS)
│   └── api/              ← Backend API (NestJS + Prisma + TS)
│
├── packages/
│   ├── ui/               ← Componentes compartidos (shadcn/ui custom)
│   ├── types/            ← TypeScript types/interfaces compartidos
│   ├── utils/            ← Utilidades compartidas
│   ├── db/               ← Prisma schema + client + migrations
│   ├── config/           ← ESLint, Prettier, TSConfig compartidos
│   └── animations/       ← Framer Motion presets y variantes
│
├── docs/                 ← DOCUMENTACIÓN VIVA (se actualiza cada prompt)
│   ├── ARCHITECTURE.md
│   ├── ERD.md
│   ├── DATA_DICTIONARY.md
│   ├── API_ENDPOINTS.md
│   ├── CHANGELOG.md
│   └── PROGRESS.md
│
├── turbo.json
├── package.json
├── pnpm-workspace.yaml
├── .env.example
├── .gitignore
└── README.md

REQUISITOS:
1. Turborepo con pipelines: build, dev, lint, test, typecheck
2. TypeScript strict mode en TODOS los packages
3. Path aliases: @ycc/ui, @ycc/types, @ycc/utils, @ycc/db, @ycc/animations
4. ESLint + Prettier compartidos desde packages/config
5. Husky + lint-staged para pre-commit hooks
6. .env.example con TODAS las variables necesarias (DB_URL, REDIS_URL, etc.)
7. README.md con instrucciones de setup completas

DOCUMENTACIÓN INICIAL — Crear estos archivos:

docs/ARCHITECTURE.md:
  - Diagrama ASCII de la arquitectura (monorepo, apps, packages)
  - Stack tecnológico con versiones exactas
  - Principios arquitectónicos

docs/ERD.md:
  - Placeholder: "Se generará en Prompt 0.2"

docs/DATA_DICTIONARY.md:
  - Placeholder: "Se generará en Prompt 0.2"

docs/API_ENDPOINTS.md:
  - Placeholder: "Se generará en Prompt 1.1"

docs/CHANGELOG.md:
  - Entrada: "## Prompt 0.1 — Scaffolding del Monorepo"
  - Lista de archivos creados

docs/PROGRESS.md:
  - Checklist de TODOS los prompts (0.1 a 7.3 + Final)
  - Marcar 0.1 como ✅ al completar

NO generes código de negocio aún, solo estructura, configs y scripts.

═══════════════════════════════════════
✅ POSTCHECK (Ejecutar OBLIGATORIAMENTE)
═══════════════════════════════════════

Después de generar todo, ejecutar estos comandos y verificar 0 errores:

  pnpm install                    → debe completar sin errores
  pnpm typecheck                  → 0 errores de TypeScript
  pnpm lint                       → 0 errores de ESLint
  psql -U postgres -c "SELECT version();" → PostgreSQL responde
  redis-cli ping                  → Redis responde PONG

LISTA DE ARCHIVOS CREADOS (confirmar que TODOS existen):
  □ turbo.json
  □ package.json (root)
  □ pnpm-workspace.yaml
  □ .env.example
  □ .gitignore
  □ README.md
  □ apps/pos/package.json + vite.config.ts + tsconfig.json
  □ apps/kds/package.json + vite.config.ts + tsconfig.json
  □ apps/admin/package.json + vite.config.ts + tsconfig.json
  □ apps/api/package.json + tsconfig.json + nest-cli.json
  □ packages/ui/package.json + tsconfig.json
  □ packages/types/package.json + tsconfig.json + src/index.ts
  □ packages/utils/package.json + tsconfig.json + src/index.ts
  □ packages/db/package.json + tsconfig.json
  □ packages/config/ (eslint, prettier, tsconfig base)
  □ packages/animations/package.json + tsconfig.json
  □ docs/ARCHITECTURE.md (con contenido real)
  □ docs/ERD.md (placeholder)
  □ docs/DATA_DICTIONARY.md (placeholder)
  □ docs/API_ENDPOINTS.md (placeholder)
  □ docs/CHANGELOG.md (con entrada de este prompt)
  □ docs/PROGRESS.md (con checklist, 0.1 marcado ✅)

Si CUALQUIER verificación falla → corregir ANTES de reportar completado.

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

Actualizar:
  docs/ARCHITECTURE.md  → Diagrama completo del monorepo
  docs/CHANGELOG.md     → Agregar entrada Prompt 0.1
  docs/PROGRESS.md      → Marcar [x] Prompt 0.1
```

---

## PROMPT 0.2 — Prisma Schema Completo (Base de Datos)

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 0.2)
═══════════════════════════════════════

ANTES de escribir código, verificar que TODO lo del Prompt 0.1 existe:

  □ Leer docs/PROGRESS.md → Prompt 0.1 debe estar marcado ✅
  □ Verificar que existe: packages/db/package.json
  □ Verificar que existe: packages/types/src/index.ts
  □ Verificar PostgreSQL corriendo: psql -U postgres -c "SELECT 1;"
  □ Ejecutar: pnpm typecheck → debe dar 0 errores

DEPENDENCIAS DE ESTE PROMPT:
  - packages/db/ (creado en 0.1) → aquí va el schema.prisma
  - packages/types/ (creado en 0.1) → los tipos deben coincidir con el schema
  - PostgreSQL corriendo localmente

Si algo falta o falla → PARAR y reportar qué falta del Prompt 0.1.

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior database architect. Diseña el schema completo de Prisma 
para el sistema YCC POS en packages/db/prisma/schema.prisma.

MODELOS REQUERIDOS (36 modelos, en orden de dependencia):

=== CONFIGURACIÓN (5) ===
1.  Organization        → Datos de la empresa YCC
2.  Store               → Sucursales (campos sap_warehouse, jonas_branch)
3.  Terminal            → Terminales POS por sucursal
4.  User                → Usuarios con roles
5.  Permission          → Permisos granulares (RBAC)

=== CATÁLOGO (5) ===
6.  MenuCategory        → Categorías jerárquicas (parent_id self-ref)
7.  MenuItem            → Platillos (precio, impuesto, imagen, kds_station)
8.  ModifierGroup       → Grupos de modificadores
9.  ModifierOption      → Opciones (+precio, ajuste de receta)
10. MenuItemModifier    → Relación MenuItem ↔ ModifierGroup

=== INVENTARIO + COSTEO (9) ===
11. IngredientCategory  → Categorías de ingredientes (jerárquicas)
12. UnitOfMeasure       → Unidades con conversiones (kg↔g, lt↔ml)
13. Ingredient          → Materia prima (costo promedio, merma%, unidad)
14. Recipe              → Recetas (finished, sub_recipe, prep)
15. RecipeLine          → Líneas (ingrediente O sub-receta, cantidad, unidad)
16. StoreInventory      → Inventario por sucursal (teórico, real, par level)
17. InventoryMovement   → Movimientos (compra, venta, merma, transfer, ajuste)
18. InventoryCount      → Conteos físicos (header)
19. InventoryCountLine  → Líneas de conteo (teórico vs real)

=== PROVEEDORES + COMPRAS (5) ===
20. Supplier            → Proveedores
21. SupplierIngredient  → Relación proveedor-ingrediente (precio, lead time)
22. PurchaseOrder       → Órdenes de compra
23. PurchaseOrderLine   → Líneas de OC
24. WasteLog            → Registro de desperdicios

=== VENTAS (6) ===
25. CashSession         → Sesiones de caja (apertura/cierre)
26. Order               → Pedidos (mesa, tipo, estado para KDS)
27. OrderItem           → Items del pedido (con modificadores JSON)
28. Sale                → Venta cerrada (totales)
29. SaleItem            → Items de la venta
30. Payment             → Pagos (efectivo, tarjeta, mixto)

=== KDS (4) ===
31. KdsStation          → Estaciones de cocina
32. KdsStationCategory  → Routing: categoría → estación
33. KdsTicket           → Tickets en KDS (estado, tiempos)
34. KdsTicketItem       → Items del ticket

=== SYNC (2) ===
35. SyncLog             → Log de sincronización
36. SyncQueue           → Cola de transacciones pendientes

REGLAS OBLIGATORIAS:
- IDs: String @id @default(cuid())
- Todas las tablas: createdAt DateTime @default(now()), updatedAt DateTime @updatedAt
- Soft delete: deletedAt DateTime? donde aplique
- Campos SAP: sapItemCode String?, sapDocEntry Int?, sapBpCode String?
- Campos Jonas: jonasItemId String?, jonasCustomerId String?
- Índices en: foreign keys, campos de búsqueda, fechas, códigos únicos
- Enums de Prisma para estados y tipos
- Relaciones con onDelete apropiado
- Decimal(18,6) para cantidades, Decimal(18,2) para montos
- Json para datos flexibles (modificadores, config impresora)

TAMBIÉN GENERAR:
- packages/db/prisma/seed.ts → Datos de ejemplo realistas para desarrollo
  (1 organización, 2 sucursales, 5 usuarios, 10 categorías, 30 platillos,
   20 ingredientes, 10 recetas con sub-recetas, 3 proveedores)
- packages/db/src/index.ts → Export del PrismaClient configurado

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

Ejecutar OBLIGATORIAMENTE:

  cd packages/db
  npx prisma validate          → "The schema is valid" 
  npx prisma generate          → Client generado sin errores
  npx prisma migrate dev --name init  → Migración aplicada
  npx prisma db seed           → Seed ejecutado sin errores
  cd ../..
  pnpm typecheck               → 0 errores en TODO el monorepo

VERIFICAR:
  □ schema.prisma tiene exactamente 36 modelos
  □ Todos los enums están definidos
  □ Todas las relaciones tienen onDelete explícito
  □ Campos sap_* y jonas_* existen en modelos relevantes
  □ Seed crea datos coherentes (recetas con ingredientes que existen, etc.)
  □ PrismaClient se exporta correctamente desde packages/db

Si CUALQUIER verificación falla → corregir ANTES de continuar.

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

Actualizar OBLIGATORIAMENTE:

docs/ERD.md:
  - Diagrama entidad-relación completo (formato Mermaid o ASCII)
  - Mostrar TODAS las relaciones entre los 36 modelos
  - Agrupar por dominio (Config, Catálogo, Inventario, Ventas, KDS, Sync)

docs/DATA_DICTIONARY.md:
  - Para CADA modelo: nombre, descripción, campos con tipo y descripción
  - Marcar campos nullable, campos con default, campos calculados
  - Documentar CADA enum con sus valores y significado

docs/CHANGELOG.md:
  - Agregar: "## Prompt 0.2 — Prisma Schema (36 modelos, seed data)"

docs/PROGRESS.md:
  - Marcar [x] Prompt 0.2
```

---

## PROMPT 0.3 — Types Compartidos (@ycc/types)

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 0.3)
═══════════════════════════════════════

ANTES de escribir código, verificar:

  □ Leer docs/PROGRESS.md → Prompts 0.1 y 0.2 deben estar ✅
  □ Leer packages/db/prisma/schema.prisma COMPLETO
    → Memorizar TODOS los nombres de modelos, campos y enums
    → Los tipos que crees DEBEN coincidir con este schema
  □ Leer packages/types/src/index.ts → verificar que existe
  □ Ejecutar: pnpm typecheck → 0 errores

DEPENDENCIAS:
  - schema.prisma (Prompt 0.2) → los tipos DERIVAN de aquí
  - packages/types/ (Prompt 0.1) → aquí van los tipos

REGLA CRÍTICA: Los nombres de campos en los types DEBEN coincidir 
EXACTAMENTE con los del schema.prisma (camelCase).
No inventar campos que no existan en el schema.

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior TypeScript architect. Basándote en el Prisma schema EXISTENTE 
del proyecto YCC POS, crea el package @ycc/types.

LEER PRIMERO: packages/db/prisma/schema.prisma (TODO el archivo)

ESTRUCTURA:
packages/types/src/
├── index.ts              ← Re-exports todo
├── auth.types.ts         ← LoginDTO, JwtPayload, TokenResponse
├── menu.types.ts         ← MenuItem, Category, Modifier (derivados del schema)
├── order.types.ts        ← Order, OrderItem, OrderStatus
├── sale.types.ts         ← Sale, Payment, CashSession
├── inventory.types.ts    ← Ingredient, StoreInventory, Movement
├── recipe.types.ts       ← Recipe, RecipeLine, BOMExplosionResult
├── costing.types.ts      ← RecipeCost, AvTReport, FoodCostReport
├── kds.types.ts          ← KdsTicket, KdsStation, KdsEvent
├── store.types.ts        ← Store, Terminal, User (sin password)
├── api.types.ts          ← ApiResponse<T>, PaginatedResponse<T>, ErrorResponse
├── websocket.types.ts    ← WsEvent<T>, todos los eventos tipados
├── cart.types.ts         ← CartItem, Cart, CartTotals (solo frontend)
└── enums.ts              ← Re-export de enums de Prisma + enums adicionales

REGLAS:
1. Los tipos DEBEN coincidir con el schema.prisma en nombres y tipos
2. NO exponer campos sensibles (password_hash) en tipos de respuesta
3. Crear DTOs separados para request (Create/Update) y response
4. Zod schemas en packages/utils/src/validation/ para validación compartida
5. Cada tipo con JSDoc describiendo su propósito
6. Exportar TODO desde index.ts con named exports

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  pnpm typecheck                  → 0 errores en TODO el monorepo
  pnpm lint                       → 0 errores

VERIFICAR:
  □ Cada modelo del schema.prisma tiene su tipo correspondiente
  □ Los nombres de campos coinciden EXACTAMENTE con el schema
  □ No hay campos de password/hash en tipos de respuesta
  □ Enums coinciden con los de Prisma
  □ index.ts exporta TODOS los tipos
  □ Zod schemas validan correctamente (crear test básico)

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/DATA_DICTIONARY.md → Agregar sección "TypeScript Types" con mapping
                            modelo Prisma ↔ tipo TypeScript
  docs/CHANGELOG.md       → Agregar entrada Prompt 0.3
  docs/PROGRESS.md        → Marcar [x] Prompt 0.3
```

---

## PROMPT 0.4 — Animaciones Compartidas (@ycc/animations)

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 0.4)
═══════════════════════════════════════

  □ Leer docs/PROGRESS.md → Prompts 0.1, 0.2, 0.3 deben estar ✅
  □ Verificar que packages/animations/package.json existe
  □ Verificar que framer-motion está en dependencies
  □ Ejecutar: pnpm typecheck → 0 errores

DEPENDENCIAS:
  - packages/animations/ (estructura de 0.1)
  - Framer Motion debe estar instalado

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior motion designer + React developer. Crea el package 
@ycc/animations con presets de Framer Motion para YCC POS.

FILOSOFÍA:
- VELOCIDAD: Toda animación < 300ms
- FLUIDEZ: 60fps. Solo transform y opacity
- NO BLOQUEO: Ninguna animación bloquea interacción
- REDUCCIÓN: Respetar prefers-reduced-motion

ESTRUCTURA:
packages/animations/src/
├── index.ts
├── presets.ts            ← Duraciones, easings, springs
├── variants/
│   ├── page.ts           ← Transiciones entre páginas
│   ├── modal.ts          ← Modales (scale + fade)
│   ├── list.ts           ← Stagger de listas
│   ├── cart.ts           ← Agregar/quitar carrito (pop + slide)
│   ├── notification.ts   ← Toasts (slide-in)
│   ├── kds.ts            ← Tickets KDS (entrada, bump, pulse urgencia)
│   ├── button.ts         ← Tap feedback (scale sutil)
│   └── number.ts         ← Contadores animados
│
├── hooks/
│   ├── useReducedMotion.ts
│   ├── useAnimatedNumber.ts
│   ├── useStaggerChildren.ts
│   └── usePageTransition.ts
│
├── components/
│   ├── AnimatedPresence.tsx
│   ├── FadeIn.tsx
│   ├── SlideIn.tsx
│   ├── PopIn.tsx
│   ├── AnimatedCounter.tsx   ← Para montos/totales
│   ├── PulseIndicator.tsx    ← KDS urgencia, alertas
│   └── SkeletonLoader.tsx    ← Shimmer loading
│
└── presets.ts

PRESETS:
  instant:  { duration: 0.1 }
  fast:     { duration: 0.15, ease: "easeOut" }
  normal:   { duration: 0.25, ease: "easeInOut" }
  spring:   { type: "spring", stiffness: 500, damping: 30 }
  stagger:  { staggerChildren: 0.03 }

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  pnpm typecheck                  → 0 errores
  pnpm lint                       → 0 errores

VERIFICAR:
  □ Todos los componentes exportan correctamente desde index.ts
  □ Todos los hooks funcionan (no errores de import)
  □ useReducedMotion respeta prefers-reduced-motion
  □ AnimatedCounter acepta number y anima el cambio
  □ Ninguna animación usa propiedades que causen layout shift (no width/height)
  □ Todos los variants tienen versión "reduced" para accesibilidad

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar sección "Animation System" con presets
  docs/CHANGELOG.md    → Agregar entrada Prompt 0.4
  docs/PROGRESS.md     → Marcar [x] Prompt 0.4

  VERIFICACIÓN DE FASE 0 COMPLETA:
  Antes de pasar a Fase 1, confirmar:
    ✅ 0.1 Monorepo scaffolding
    ✅ 0.2 Prisma schema (36 modelos)
    ✅ 0.3 Types compartidos
    ✅ 0.4 Animaciones compartidas
    ✅ pnpm typecheck → 0 errores en TODO el monorepo
    ✅ pnpm lint → 0 errores
    ✅ PostgreSQL + Redis corriendo localmente
    ✅ Seed data cargado
    ✅ docs/ actualizados (ARCHITECTURE, ERD, DATA_DICTIONARY, CHANGELOG, PROGRESS)
```

---

# ═══════════════════════════════════════════════════════════
# FASE 1 — BACKEND API: NESTJS + AUTH + CORE
# ═══════════════════════════════════════════════════════════

## PROMPT 1.1 — NestJS Setup + Auth Module

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 1.1)
═══════════════════════════════════════

LEER OBLIGATORIAMENTE antes de escribir código:

  □ docs/PROGRESS.md → Fase 0 completa (0.1-0.4 todos ✅)
  □ packages/db/prisma/schema.prisma → LEER COMPLETO
    → Memorizar modelo User (campos, relaciones, enums de Role)
    → Memorizar modelo Store, Terminal, Permission
  □ packages/types/src/auth.types.ts → LEER COMPLETO
    → Usar EXACTAMENTE estos tipos para DTOs y responses
  □ packages/types/src/store.types.ts → LEER COMPLETO
  □ packages/types/src/api.types.ts → LEER COMPLETO
    → Usar ApiResponse<T> y ErrorResponse para TODAS las respuestas
  □ packages/db/src/index.ts → verificar export de PrismaClient

  Ejecutar: pnpm typecheck → 0 errores (confirmar que Fase 0 está limpia)

DEPENDENCIAS DE ESTE PROMPT:
  - PrismaClient de @ycc/db
  - Tipos de @ycc/types (auth, api, store)
  - Enums de @ycc/types/enums
  - Zod schemas de @ycc/utils/validation (si existen)

REGLA: NO crear tipos nuevos si ya existen en @ycc/types.
       IMPORTAR de @ycc/types SIEMPRE.

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior backend architect. Configura el backend NestJS para YCC POS 
con autenticación JWT completa.

UBICACIÓN: apps/api/

ESTRUCTURA:
apps/api/src/
├── main.ts                    ← Bootstrap con Swagger, CORS, pipes
├── app.module.ts
├── common/
│   ├── decorators/            ← @CurrentUser, @Roles, @Public
│   ├── guards/                ← JwtAuthGuard, RolesGuard
│   ├── interceptors/          ← LoggingInterceptor, TransformInterceptor
│   ├── filters/               ← HttpExceptionFilter
│   ├── pipes/                 ← ZodValidationPipe
│   └── middleware/            ← RequestLoggerMiddleware
│
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/ (jwt.strategy.ts, jwt-refresh.strategy.ts)
│   │   └── dto/ (login.dto.ts, token.dto.ts)
│   │
│   └── users/
│       ├── users.module.ts
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── dto/
│
├── config/ (app, database, jwt, redis)
└── prisma/prisma.service.ts

REQUISITOS:
1. JWT: access token 15min + refresh token 7 días (httpOnly cookie)
2. Bcrypt salt rounds: 12
3. Rate limiting: 5 intentos / 15 min por IP en login
4. Swagger en /api/docs (solo dev)
5. TODAS las respuestas usan ApiResponse<T> de @ycc/types
6. TODOS los errores usan ErrorResponse de @ycc/types
7. Correlation ID (UUID) en cada request
8. Health check: GET /health
9. Validación con Zod (NO class-validator)
10. CORS para apps POS, KDS, Admin
11. Helmet + Compression

ENDPOINTS:
  POST /auth/login       → { accessToken, refreshToken, user }
  POST /auth/refresh     → { accessToken }
  POST /auth/logout      → { success: true }
  GET  /auth/me          → { user (sin password) }
  GET  /users            → PaginatedResponse<User[]> (admin only)
  POST /users            → User (admin only)
  PATCH /users/:id       → User (admin only)

ERRORES (usar códigos de @ycc/types si existen):
  AUTH_001 - AUTH_007 (credenciales, token, permisos, rate limit)

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/api
  pnpm build                     → 0 errores de compilación
  pnpm start:dev                 → servidor arranca en puerto 3000
  curl http://localhost:3000/health → { "status": "ok" }
  curl http://localhost:3000/api/docs → Swagger UI carga
  cd ../..
  pnpm typecheck                 → 0 errores en TODO el monorepo

VERIFICAR:
  □ POST /auth/login con credenciales del seed → retorna tokens
  □ GET /auth/me con token válido → retorna usuario sin password
  □ GET /auth/me sin token → 401 con ErrorResponse
  □ GET /users sin rol admin → 403
  □ POST /auth/login con credenciales malas → AUTH_001
  □ Todos los imports de @ycc/types y @ycc/db funcionan
  □ TransformInterceptor envuelve TODAS las respuestas en ApiResponse<T>
  □ HttpExceptionFilter envuelve TODOS los errores en ErrorResponse

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/API_ENDPOINTS.md → Agregar TODOS los endpoints de auth y users
                          con método, path, body, response, permisos
  docs/ARCHITECTURE.md  → Agregar sección "Backend API" con estructura
  docs/CHANGELOG.md     → Entrada Prompt 1.1
  docs/PROGRESS.md      → Marcar [x] Prompt 1.1
```

---

## PROMPT 1.2 — Módulos Core (Stores, Menu, Inventory, Recipes, Suppliers)

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 1.2)
═══════════════════════════════════════

LEER OBLIGATORIAMENTE:

  □ docs/PROGRESS.md → 0.1-0.4 y 1.1 todos ✅
  □ docs/API_ENDPOINTS.md → ver endpoints ya implementados (no duplicar)
  □ packages/db/prisma/schema.prisma → LEER COMPLETO
    → Memorizar TODOS los modelos que se van a usar:
      Store, Terminal, MenuCategory, MenuItem, ModifierGroup, ModifierOption,
      MenuItemModifier, Ingredient, IngredientCategory, UnitOfMeasure,
      Recipe, RecipeLine, StoreInventory, InventoryMovement,
      Supplier, SupplierIngredient, PurchaseOrder, PurchaseOrderLine
  □ packages/types/src/ → LEER TODOS los archivos de tipos
    → Usar EXACTAMENTE estos tipos para DTOs y responses
  □ apps/api/src/common/ → LEER interceptors, filters, guards, decorators
    → Reutilizar TODO lo creado en 1.1 (no recrear)
  □ apps/api/src/prisma/prisma.service.ts → verificar que existe

  Ejecutar:
    pnpm typecheck → 0 errores
    cd apps/api && pnpm build → 0 errores

REGLAS:
  - IMPORTAR tipos de @ycc/types (NO crear tipos nuevos)
  - IMPORTAR PrismaService del módulo existente (NO crear otro)
  - REUTILIZAR guards, decorators, interceptors de common/ (NO duplicar)
  - Seguir EXACTAMENTE el patrón de auth.module/controller/service de 1.1

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior backend developer. Crea los 5 módulos core del backend.

MÓDULOS (seguir EXACTAMENTE el patrón de auth module de Prompt 1.1):

1. STORES:   GET/POST/PATCH /stores, GET /stores/:id/terminals
2. MENU:     CRUD /menu/categories, /menu/items, /menu/modifier-groups
             GET /menu/items/:id/recipe-cost (cálculo en tiempo real)
3. INVENTORY: CRUD /inventory/ingredients, GET /inventory/store/:storeId,
              POST count, waste, transfer
4. RECIPES:  CRUD /recipes, POST /recipes/:id/calculate-cost,
             GET /recipes/:id/bom-explosion
5. SUPPLIERS: CRUD /suppliers, POST purchase-orders, POST receive

LÓGICA CRÍTICA — Recipe Cost Calculation:
  - Resolver BOM recursivamente (sub-recetas)
  - Aplicar factor de merma por ingrediente
  - Usar costo promedio de la sucursal solicitada
  - Convertir unidades (g→kg, ml→lt) usando UnitOfMeasure.conversionFactor
  - Retornar: totalCost, costPerLine[], margin vs precio venta

LÓGICA CRÍTICA — Purchase Order Receive:
  - Actualizar stock en StoreInventory
  - Recalcular costo promedio ponderado
  - Crear InventoryMovement tipo PURCHASE
  - Recalcular costo de recetas afectadas (async)

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  pnpm typecheck → 0 errores
  cd apps/api && pnpm build → 0 errores
  pnpm start:dev → arranca sin errores

PROBAR CADA ENDPOINT (con datos del seed):
  □ GET /stores → retorna sucursales del seed
  □ GET /menu/categories → retorna árbol de categorías
  □ GET /menu/items → retorna platillos con paginación
  □ GET /menu/items/:id/recipe-cost → retorna costo calculado
  □ GET /recipes/:id/bom-explosion → retorna ingredientes flat
  □ GET /inventory/store/:storeId → retorna inventario
  □ POST /inventory/store/:storeId/waste → registra desperdicio
  □ Todos los endpoints protegidos requieren JWT
  □ Todos los endpoints retornan ApiResponse<T>
  □ Todos los errores retornan ErrorResponse

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/API_ENDPOINTS.md → Agregar TODOS los endpoints nuevos (5 módulos)
  docs/ARCHITECTURE.md  → Actualizar diagrama con módulos del backend
  docs/CHANGELOG.md     → Entrada Prompt 1.2
  docs/PROGRESS.md      → Marcar [x] Prompt 1.2
```

---

## PROMPT 1.3 — Módulo de Ventas + Deducción Automática de Inventario

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 1.3)
═══════════════════════════════════════

LEER OBLIGATORIAMENTE:

  □ docs/PROGRESS.md → 0.1-0.4, 1.1, 1.2 todos ✅
  □ docs/API_ENDPOINTS.md → LEER COMPLETO (no duplicar endpoints)
  □ packages/db/prisma/schema.prisma → Memorizar modelos:
    Sale, SaleItem, Payment, CashSession, Order, OrderItem,
    StoreInventory, InventoryMovement, Recipe, RecipeLine, SyncQueue
  □ packages/types/src/sale.types.ts → LEER COMPLETO
  □ packages/types/src/order.types.ts → LEER COMPLETO
  □ packages/types/src/cart.types.ts → LEER COMPLETO
  □ apps/api/src/modules/recipes/recipes.service.ts → LEER COMPLETO
    → Reutilizar la función de BOM explosion / recipe cost de Prompt 1.2
    → NO reimplementar, IMPORTAR del servicio existente

  Ejecutar: pnpm typecheck → 0 errores

DEPENDENCIAS CRÍTICAS:
  - RecipesService.calculateCost() de Prompt 1.2
  - RecipesService.bomExplosion() de Prompt 1.2
  - InventoryService de Prompt 1.2
  - Todos los guards/interceptors de Prompt 1.1

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior backend developer especializado en sistemas transaccionales.
Crea el módulo de VENTAS con deducción automática de inventario.

ENDPOINTS:
  POST   /sales                      ← Crear venta (ATÓMICA)
  GET    /sales                      ← Lista ventas (filtros)
  GET    /sales/:id                  ← Detalle
  POST   /sales/:id/void             ← Anular (supervisor)
  POST   /sales/:id/return           ← Devolución
  POST   /cash-sessions/open         ← Abrir caja
  POST   /cash-sessions/:id/close    ← Cerrar caja (corte Z)
  GET    /cash-sessions/:id/summary  ← Resumen

FLUJO POST /sales (TRANSACCIÓN ATÓMICA):
1. Validar sesión de caja activa
2. Validar items existen y están activos
3. Calcular subtotal, impuestos, descuentos, total
4. Crear Sale + SaleItems + Payments (Prisma transaction)
5. Para CADA SaleItem:
   a. IMPORTAR bomExplosion() del RecipesService existente
   b. Deducir ingredientes del StoreInventory
   c. Crear InventoryMovement por cada deducción
   d. Si stock < par_level → alerta async (NO bloquea venta)
6. Crear entrada en SyncQueue (para futuro SAP)
7. Emitir evento 'sale:created' (para KDS, se implementa en 1.4)
8. Retornar venta completa

IMPORTANTE:
- Deducción de inventario es BEST-EFFORT: si falla, loguear pero NO revertir venta
- Usar Prisma.$transaction con isolation READ COMMITTED
- Respuesta < 200ms

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  pnpm typecheck → 0 errores
  cd apps/api && pnpm build → 0 errores

PROBAR:
  □ POST /cash-sessions/open → caja abierta
  □ POST /sales (venta simple efectivo) → venta creada + inventario deducido
  □ POST /sales (venta con modificadores) → deducción incluye extras
  □ POST /sales (venta 5 unidades) → inventario deducido ×5
  □ GET /sales/:id → detalle con items y pagos
  □ POST /sales/:id/void (como supervisor) → venta anulada
  □ POST /sales/:id/void (como cajero) → 403 sin permisos
  □ POST /cash-sessions/:id/close → resumen correcto
  □ InventoryMovements creados correctamente para cada deducción
  □ SyncQueue tiene entrada para la venta

VERIFICAR INTEGRIDAD:
  □ RecipesService.bomExplosion() se IMPORTA, no se reimplementa
  □ Todos los tipos vienen de @ycc/types
  □ Guards y decorators vienen de common/ (Prompt 1.1)

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/API_ENDPOINTS.md → Agregar endpoints de sales y cash-sessions
  docs/ARCHITECTURE.md  → Agregar diagrama de flujo de venta
  docs/CHANGELOG.md     → Entrada Prompt 1.3
  docs/PROGRESS.md      → Marcar [x] Prompt 1.3
```

---

## PROMPT 1.4 — WebSocket Gateway (Tiempo Real)

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 1.4)
═══════════════════════════════════════

  □ docs/PROGRESS.md → 0.1-0.4, 1.1-1.3 todos ✅
  □ packages/types/src/websocket.types.ts → LEER COMPLETO
    → Usar EXACTAMENTE estos tipos para eventos WS
  □ packages/types/src/kds.types.ts → LEER COMPLETO
  □ apps/api/src/modules/auth/ → LEER jwt.strategy.ts
    → Reutilizar validación JWT para handshake WS
  □ apps/api/src/modules/sales/sales.service.ts → LEER
    → Verificar dónde emitir evento 'sale:created'

  Ejecutar: pnpm typecheck → 0 errores

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior backend developer. Crea el WebSocket Gateway con Socket.IO.

EVENTOS, ROOMS, AUTH: [misma spec que versión anterior]

INTEGRACIÓN CON MÓDULOS EXISTENTES:
- SalesService (1.3): después de crear venta, emitir 'sale:created'
- Modificar SalesService para inyectar el Gateway y emitir eventos
- NO romper los tests/funcionalidad existente de SalesService

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  pnpm typecheck → 0 errores
  cd apps/api && pnpm build → 0 errores

  □ WebSocket acepta conexión con JWT válido
  □ WebSocket rechaza conexión sin JWT
  □ Crear venta → evento 'sale:created' emitido en room correcto
  □ SalesService sigue funcionando igual que en 1.3 (no se rompió)
  □ TODOS los endpoints HTTP de 1.1-1.3 siguen funcionando

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/API_ENDPOINTS.md → Agregar sección "WebSocket Events"
  docs/ARCHITECTURE.md  → Agregar diagrama de comunicación WS
  docs/CHANGELOG.md     → Entrada Prompt 1.4
  docs/PROGRESS.md      → Marcar [x] Prompt 1.4
```

---

## PROMPT 1.5 — Módulo de Reportes + Costeo AvT

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 1.5)
═══════════════════════════════════════

  □ docs/PROGRESS.md → 0.1-0.4, 1.1-1.4 todos ✅
  □ packages/types/src/costing.types.ts → LEER COMPLETO
  □ packages/db/prisma/schema.prisma → Memorizar:
    Sale, SaleItem, StoreInventory, InventoryMovement,
    InventoryCount, InventoryCountLine, PurchaseOrder, Recipe, RecipeLine
  □ apps/api/src/modules/recipes/recipes.service.ts → LEER
    → Reutilizar bomExplosion() y calculateCost()
  □ apps/api/src/modules/sales/sales.service.ts → LEER
  □ apps/api/src/modules/inventory/inventory.service.ts → LEER

  Ejecutar: pnpm typecheck → 0 errores
  Ejecutar: cd apps/api && pnpm build → 0 errores

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior backend developer especializado en analytics.
Crea el módulo de REPORTES con énfasis en Actual vs. Teórico (AvT).

ENDPOINTS:
  GET /reports/daily-sales
  GET /reports/sales-by-period
  GET /reports/sales-by-item
  GET /reports/sales-by-category
  GET /reports/cash-session/:id
  GET /reports/food-cost
  GET /reports/food-cost/avt          ← EL MÁS IMPORTANTE
  GET /reports/food-cost/avt/detail
  GET /reports/food-cost/variance
  GET /reports/inventory/valuation
  GET /reports/inventory/low-stock
  GET /reports/kds/performance

LÓGICA AvT:
  Teórico = Σ(items vendidos × costo receta) usando bomExplosion() existente
  Real = (Inventario inicio + Compras - Inventario fin) del período
  Varianza = Real% - Teórico%

REUTILIZAR: RecipesService.bomExplosion() y calculateCost() de Prompt 1.2

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  pnpm typecheck → 0 errores
  cd apps/api && pnpm build → 0 errores

  □ GET /reports/food-cost/avt → retorna reporte AvT correcto
  □ GET /reports/daily-sales → retorna ventas del día
  □ TODOS los endpoints de 1.1-1.4 siguen funcionando
  □ Tipos de respuesta coinciden con @ycc/types/costing.types.ts

  VERIFICACIÓN DE FASE 1 COMPLETA:
    ✅ 1.1 Auth + Users
    ✅ 1.2 Stores + Menu + Inventory + Recipes + Suppliers
    ✅ 1.3 Sales + Deducción de inventario
    ✅ 1.4 WebSocket Gateway
    ✅ 1.5 Reportes + AvT
    ✅ pnpm typecheck → 0 errores
    ✅ cd apps/api && pnpm build → 0 errores
    ✅ TODOS los endpoints documentados en docs/API_ENDPOINTS.md
    ✅ docs/ actualizados

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/API_ENDPOINTS.md → Agregar TODOS los endpoints de reportes
  docs/ARCHITECTURE.md  → Actualizar con módulo de reportes
  docs/CHANGELOG.md     → Entrada Prompt 1.5
  docs/PROGRESS.md      → Marcar [x] Prompt 1.5
```

---

# ═══════════════════════════════════════════════════════════
# FASE 2 — FRONTEND POS: LA EXPERIENCIA DEL CAJERO
# ═══════════════════════════════════════════════════════════

## PROMPT 2.1 — Setup Frontend POS + Design System

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 2.1)
═══════════════════════════════════════

  □ docs/PROGRESS.md → Fase 0 y Fase 1 completas (0.1-0.4, 1.1-1.5 ✅)
  □ packages/types/src/ → LEER TODOS los archivos
    → El frontend DEBE usar estos tipos para todo
  □ packages/animations/src/ → LEER index.ts
    → Verificar qué componentes y hooks están disponibles
  □ packages/ui/ → verificar qué existe (puede estar vacío aún)
  □ docs/API_ENDPOINTS.md → LEER COMPLETO
    → El frontend debe consumir EXACTAMENTE estos endpoints
  □ apps/api/ → verificar que el backend arranca y responde

  Ejecutar:
    pnpm typecheck → 0 errores
    psql -U postgres -c "SELECT 1;" → PostgreSQL corriendo
    redis-cli ping → Redis corriendo
    cd apps/api && pnpm start:dev → API corriendo en :3000

DEPENDENCIAS:
  - @ycc/types (todos los tipos para API calls y estado)
  - @ycc/animations (componentes y hooks de animación)
  - @ycc/ui (si tiene componentes, usarlos)
  - API corriendo en localhost:3000

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior frontend architect + UI designer. Configura el frontend POS.

UBICACIÓN: apps/pos/

DESIGN SYSTEM YCC — COLORES:
  --ycc-brown-900: #1A0F0A   (texto principal)
  --ycc-brown-700: #3C2415   (COLOR PRINCIPAL)
  --ycc-brown-100: #F5EDE8   (fondos sutiles)
  --ycc-amber-500: #D4A574   (acento)
  --ycc-white:     #FFFFFF   (fondo principal)
  --ycc-red-500:   #DC2626   (error)
  --ycc-green-500: #16A34A   (éxito)

TIPOGRAFÍA POS (touch, más grande que web):
  text-pos-sm: 16px | text-pos-base: 18px | text-pos-lg: 22px
  text-pos-xl: 28px | text-pos-2xl: 36px (total de venta)

GENERAR:
  - tailwind.config.ts con colores YCC
  - vite.config.ts con aliases
  - globals.css con custom properties
  - App.tsx con router (React Router v7, lazy loading)
  - Zustand stores: auth.store.ts, cart.store.ts, menu.store.ts
  - API client: services/api.client.ts (Axios + interceptor JWT refresh)
  - TanStack Query provider con defaults

IMPORTAR de @ycc/types para TODOS los tipos de estado y API.
IMPORTAR de @ycc/animations para TODOS los componentes de animación.

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/pos && pnpm build → 0 errores
  pnpm typecheck → 0 errores en TODO el monorepo
  pnpm dev → app carga en browser sin errores de consola

  □ Tailwind genera clases con colores YCC
  □ Zustand stores importan tipos de @ycc/types
  □ API client apunta a localhost:3000 en dev
  □ Router tiene rutas lazy-loaded
  □ Imports de @ycc/animations funcionan

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar sección "Frontend POS" con estructura
  docs/CHANGELOG.md    → Entrada Prompt 2.1
  docs/PROGRESS.md     → Marcar [x] Prompt 2.1
```

---

## PROMPT 2.2 — Pantalla Principal del POS

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 2.2)
═══════════════════════════════════════

  □ docs/PROGRESS.md → hasta 2.1 todo ✅
  □ apps/pos/src/stores/cart.store.ts → LEER COMPLETO
    → Usar EXACTAMENTE estas acciones y estado
  □ apps/pos/src/stores/menu.store.ts → LEER COMPLETO
  □ apps/pos/src/services/api.client.ts → LEER COMPLETO
    → Usar este client para TODAS las llamadas API
  □ packages/animations/src/index.ts → LEER
    → Usar PopIn, SlideIn, AnimatedCounter, FadeIn, SkeletonLoader
  □ packages/types/src/menu.types.ts → LEER
  □ packages/types/src/cart.types.ts → LEER
  □ apps/pos/src/styles/globals.css → verificar colores YCC cargados
  □ docs/API_ENDPOINTS.md → verificar endpoints de menú disponibles

  Ejecutar: cd apps/pos && pnpm build → 0 errores

REGLA: Usar SOLO componentes de animación de @ycc/animations.
       NO crear animaciones inline con Framer Motion directamente.
       Usar SOLO el API client existente (no crear otro Axios instance).

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior React developer + UX designer. Crea la PANTALLA PRINCIPAL 
del POS de YCC.

[Layout, componentes, interacciones, keyboard shortcuts — 
 misma spec detallada que versión anterior]

COMPONENTES (10):
1. PosScreen, 2. PosHeader, 3. CategoryBar, 4. MenuGrid,
5. MenuItemCard, 6. SearchBar, 7. CartPanel, 8. CartItem,
9. CartTotals (con AnimatedCounter de @ycc/animations),
10. CartActions

USAR de @ycc/animations: PopIn, SlideIn, AnimatedCounter, FadeIn, SkeletonLoader
USAR de cart.store: addItem, removeItem, updateQuantity, clear, getTotal
USAR de api.client: para fetch de menú y categorías

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/pos && pnpm build → 0 errores
  pnpm typecheck → 0 errores

  □ Pantalla carga y muestra categorías del API
  □ Click en categoría filtra productos
  □ Click en producto → aparece en carrito con PopIn
  □ Cambiar cantidad → AnimatedCounter actualiza total
  □ Buscar producto → resultados con debounce
  □ Keyboard shortcuts funcionan (F1, F8, Escape, +/-)
  □ 0 errores en consola del browser
  □ Todos los imports de @ycc/* resuelven correctamente

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Agregar diagrama de componentes POS
  docs/CHANGELOG.md    → Entrada Prompt 2.2
  docs/PROGRESS.md     → Marcar [x] Prompt 2.2
```

---

## PROMPT 2.3 — Pantalla de Cobro (Checkout)

```
[CONTEXTO YCC POS — ver bloque global]

═══════════════════════════════════════
🔍 PRECHECK (Prompt 2.3)
═══════════════════════════════════════

  □ docs/PROGRESS.md → hasta 2.2 todo ✅
  □ apps/pos/src/stores/cart.store.ts → LEER (estado del carrito)
  □ apps/pos/src/components/cart/ → LEER TODOS los componentes
    → El checkout recibe datos del carrito existente
  □ apps/pos/src/services/api.client.ts → LEER
  □ docs/API_ENDPOINTS.md → verificar POST /sales existe
  □ packages/types/src/sale.types.ts → LEER (CreateSaleDTO)
  □ packages/animations/src/ → verificar AnimatedCounter, FadeIn disponibles

  Ejecutar: cd apps/pos && pnpm build → 0 errores

═══════════════════════════════════════
🔨 EXECUTE
═══════════════════════════════════════

Eres un senior React developer. Crea la pantalla de COBRO del POS YCC.

[Layout, componentes, flujo, animaciones — misma spec que versión anterior]

INTEGRACIÓN CON BACKEND:
- POST /sales con datos del cart.store
- Usar EXACTAMENTE CreateSaleDTO de @ycc/types
- Manejar errores con toast de @ycc/ui (si existe) o crear

═══════════════════════════════════════
✅ POSTCHECK
═══════════════════════════════════════

  cd apps/pos && pnpm build → 0 errores
  pnpm typecheck → 0 errores

  □ Navegar de POS → Checkout → datos del carrito visibles
  □ Pago efectivo: ingresar monto → cambio correcto → confirmar → éxito
  □ Pago tarjeta: flujo completo
  □ Después de confirmar: carrito se limpia, redirect a POS
  □ POST /sales se envía al backend correctamente
  □ Animaciones funcionan (counter, éxito)
  □ 0 errores en consola

  VERIFICACIÓN DE FASE 2 COMPLETA:
    ✅ 2.1 Setup + Design System
    ✅ 2.2 Pantalla POS principal
    ✅ 2.3 Pantalla de Cobro
    ✅ Flujo completo: Login → Abrir caja → Agregar items → Cobrar → Éxito
    ✅ pnpm typecheck → 0 errores
    ✅ 0 errores en consola del browser

═══════════════════════════════════════
📄 DOC UPDATE
═══════════════════════════════════════

  docs/ARCHITECTURE.md → Actualizar con flujo completo POS
  docs/CHANGELOG.md    → Entrada Prompt 2.3
  docs/PROGRESS.md     → Marcar [x] Prompt 2.3
```

---

*Continúa en 07_PROMPTS_POR_FASE_PARTE2_V2.md (Fases 3-7 + Auditoría)*
