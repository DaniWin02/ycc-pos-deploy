# Fase 0.1 - Setup del Monorepo
## Configuración Inicial del Proyecto YCC POS
### Fecha: 23 de Febrero 2026

---

## 📋 Objetivo

Configurar la base completa del monorepo YCC POS con:
- **Estructura de carpetas** organizada
- **pnpm workspaces** configurado
- **TypeScript** configurado para todo el proyecto
- **ESLint + Prettier** para consistencia de código
- **Scripts de desarrollo** automatizados

---

## 🏗️ Estructura a Crear

```
YCC_POS_IMPLEMENTATION/
└── 01_SETUP_INICIAL/
    ├── docs/
    │   ├── PROGRESS.md
    │   ├── ARCHITECTURE.md
    │   └── API_ENDPOINTS.md
    ├── packages/
    │   ├── types/
    │   │   └── src/
    │   │       ├── index.ts
    │   │       ├── kds.types.ts
    │   │       ├── websocket.types.ts
    │   │       └── order.types.ts
    │   ├── animations/
    │   │   └── src/
    │   │       ├── index.ts
    │   │       └── variants/
    │   │           └── kds.ts
    │   └── utils/
    │       └── src/
    │           └── index.ts
    └── apps/
        ├── pos/
        ├── kds/
        ├── admin/
        └── api/
```

---

## 📦 Paquetes (packages/)

### packages/types/src/index.ts
```typescript
// Exportar todos los tipos del sistema
export * from './kds.types';
export * from './websocket.types';
export * from './order.types';

// Tipos base del sistema
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}
```

### packages/types/src/kds.types.ts
```typescript
import { BaseEntity } from './index';

export interface KdsStation {
  id: string;
  name: string;
  isActive: boolean;
}

export interface KdsTicketItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  modifiers: string[];
  status: KdsItemStatus;
  stationId: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface KdsTicket {
  id: string;
  orderId: string;
  folio: string;
  customerName?: string;
  tableName?: string;
  items: KdsTicketItem[];
  status: KdsTicketStatus;
  createdAt: Date;
  stationId: string;
}

export enum KdsTicketStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED'
}

export enum KdsItemStatus {
  PENDING = 'PENDING',
  STARTED = 'STARTED',
  READY = 'READY',
  COMPLETED = 'COMPLETED'
}
```

### packages/types/src/websocket.types.ts
```typescript
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: Date;
  roomId?: string;
}

export interface KdsWebSocketEvents {
  'order:new': {
    orderId: string;
    items: any[];
  };
  'order:modified': {
    orderId: string;
    changes: any[];
  };
  'order:cancelled': {
    orderId: string;
    reason: string;
  };
  'kds:item-started': {
    ticketId: string;
    itemId: string;
  };
  'kds:item-ready': {
    ticketId: string;
    itemId: string;
  };
  'kds:ticket-ready': {
    ticketId: string;
    orderId: string;
  };
}
```

### packages/animations/src/index.ts
```typescript
export * from './variants/kds';
export * from './components';

// Re-exportar para fácil acceso
export { SlideIn, Pulse, FadeIn } from './variants';
export { AnimatedCounter, PulseIndicator } from './components';
```

### packages/animations/src/variants/kds.ts
```typescript
import { Variants } from 'framer-motion';

export const kdsVariants: Variants = {
  slideIn: {
    hidden: { x: 300, opacity: 0 },
    visible: { x: 0, opacity: 1 },
    exit: { x: -300, opacity: 0 }
  },
  bump: {
    idle: { scale: 1 },
    active: { scale: 1.1 }
  },
  pulse: {
    idle: { opacity: 0.6 },
    active: { opacity: 1, scale: 1.05 }
  }
};

export const slideIn = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  variants: kdsVariants.slideIn
};

export const bump = {
  whileHover: 'active',
  variants: kdsVariants.bump
};

export const pulse = {
  variants: kdsVariants.pulse
};
```

---

## 📱 Apps Base

### apps/pos/
- **Vite + React + TypeScript**
- **TailwindCSS** para estilos
- **React Router** para navegación
- **Zustand** para estado global

### apps/kds/
- **Misma configuración** que apps/pos/
- **WebSocket client** para tiempo real
- **Componentes compartidos** de packages/

### apps/admin/
- **Misma configuración** base
- **Dashboard con métricas**
- **Gestión CRUD** de todos los módulos

### apps/api/
- **Express + TypeScript**
- **Prisma** para base de datos
- **JWT** para autenticación
- **WebSocket server** para tiempo real

---

## 📄 Archivos de Configuración

### package.json (root)
```json
{
  "name": "ycc-pos",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "scripts": {
    "dev": "concurrently \"pnpm --filter api dev\" \"pnpm --filter pos dev\" \"pnpm --filter kds dev\" \"pnpm --filter admin dev\"",
    "build": "pnpm --filter api build && pnpm --filter pos build && pnpm --filter kds build && pnpm --filter admin build",
    "typecheck": "pnpm --filter api typecheck && pnpm --filter pos typecheck && pnpm --filter kds typecheck && pnpm --filter admin typecheck",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write ./**/*.{ts,tsx,json,md}\"",
    "test": "pnpm --filter api test && pnpm --filter pos test && pnpm --filter kds test && pnpm --filter admin test"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "concurrently": "^8.0.0"
  }
}
```

### tsconfig.json (root)
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": true,
    "strict": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmitOnError": true,
    "paths": {
      "@ycc/*": ["./packages/*/src"],
      "@/*": ["./apps/*/src"]
    }
  },
  "include": [
    "packages/*/src/**/*",
    "apps/*/src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
```

---

## ✅ Postcheck

### Validación del Setup
- [ ] `pnpm install` funciona sin errores
- [ ] `pnpm typecheck` retorna 0 errores
- [ ] Estructura de carpetas creada correctamente
- [ ] Workspaces configurados correctamente
- [ ] TypeScript paths funcionan
- [ ] ESLint configurado y funcionando
- [ ] Prettier configurado y funcionando

---

## 🔄 Siguiente Fase

**Completar este prompt y continuar con Fase 0.2: Base de Datos**

---

*Este es el fundamento para todo el sistema YCC POS.*
