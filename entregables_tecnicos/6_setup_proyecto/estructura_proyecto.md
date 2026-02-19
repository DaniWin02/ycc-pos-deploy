# Estructura del Proyecto - Country Club POS

## 📁 Estructura de Carpetas

```
countryclub-pos/
├── 📂 src/
│   ├── 📂 app/                    # App Router (Next.js 13+)
│   │   ├── 📂 (auth)/            # Rutas de autenticación
│   │   │   ├── 📄 login/page.tsx
│   │   │   └── 📄 layout.tsx
│   │   ├── 📂 api/               # API Routes
│   │   │   └── 📂 v1/           # Versionamiento de API
│   │   │       ├── 📂 auth/
│   │   │       ├── 📂 sales/
│   │   │       ├── 📂 products/
│   │   │       └── 📂 members/
│   │   ├── 📂 pos/               # Aplicación POS principal
│   │   │   ├── 📄 page.tsx
│   │   │   ├── 📂 components/
│   │   │   └── 📄 layout.tsx
│   │   ├── 📂 admin/             # Panel administrativo
│   │   └── 📄 globals.css       # Estilos globales
│   ├── 📂 components/            # Componentes React
│   │   ├── 📂 ui/               # Componentes UI reutilizables
│   │   ├── 📂 forms/            # Formularios
│   │   └── 📂 layout/           # Componentes de layout
│   ├── 📂 lib/                  # Utilidades y configuración
│   │   ├── 📂 auth/             # Configuración de autenticación
│   │   ├── 📂 db/               # Configuración de base de datos
│   │   ├── 📂 utils/            # Funciones utilitarias
│   │   └── 📂 validations/      # Validaciones
│   ├── 📂 types/                # Definiciones TypeScript
│   ├── 📂 hooks/                # Custom React hooks
│   ├── 📂 services/             # Servicios de API
│   └── 📂 store/                # Estado global (Zustand)
├── 📂 prisma/
│   ├── 📄 schema.prisma         # Esquema de base de datos
│   ├── 📂 migrations/           # Migraciones
│   └── 📄 seed.ts              # Datos iniciales
├── 📂 public/                   # Archivos estáticos
├── 📂 docs/                     # Documentación
├── 📂 scripts/                  # Scripts de utilidad
├── 📂 tests/                    # Tests unitarios y de integración
├── 📂 docker-compose.dev.yml    # Docker desarrollo
├── 📂 docker-compose.prod.yml   # Docker producción
├── 📄 Dockerfile.dev            # Dockerfile desarrollo
├── 📄 Dockerfile.prod           # Dockerfile producción
├── 📄 .env.example              # Variables de entorno ejemplo
├── 📄 .gitignore               # Archivos ignorados por Git
├── 📄 README.md                # Este archivo
├── 📄 package.json              # Dependencias del proyecto
├── 📄 tailwind.config.js       # Configuración TailwindCSS
├── 📄 next.config.js            # Configuración Next.js
└── 📄 tsconfig.json            # Configuración TypeScript
```

## 🏗️ Convenciones de Nomenclatura

### Archivos y Carpetas
- **Componentes**: PascalCase (`SaleForm.tsx`)
- **Páginas**: kebab-case (`sale-management/`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Utilidades**: camelCase (`formatCurrency.ts`)
- **Tipos**: PascalCase (`SaleType.ts`)

### Estructura por Feature
```
src/
├── features/
│   ├── sales/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── auth/
│   └── products/
├── shared/
│   ├── components/
│   ├── utils/
│   └── types/
```

## 📋 Configuraciones Clave

### Next.js Config
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['countryclubmerida.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
```

### TypeScript Config
```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Tailwind Config
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
    },
  },
  plugins: [],
}
```

## 🔄 Flujo de Trabajo

### 1. Desarrollo de Nuevo Feature
1. Crear rama: `git checkout -b feature/nuevo-feature`
2. Crear estructura de carpetas
3. Desarrollar componentes y lógica
4. Agregar tests
5. Actualizar documentación
6. Crear Pull Request

### 2. Estructura de Componente
```typescript
// src/components/sales/SaleForm.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

interface SaleFormProps {
  onSubmit: (data: SaleData) => void
  initialData?: SaleData
}

export function SaleForm({ onSubmit, initialData }: SaleFormProps) {
  // Lógica del componente
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* JSX del formulario */}
    </form>
  )
}
```

### 3. Estructura de API Route
```typescript
// src/app/api/v1/sales/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { SaleService } from '@/services/sale.service'
import { authMiddleware } from '@/middleware/auth.middleware'

export async function GET(request: NextRequest) {
  try {
    // Lógica de GET
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Lógica de POST
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
```

## 📁 Archivos de Configuración

### .gitignore
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/

# Production
build/
dist/

# Environment variables
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite

# Logs
logs/
*.log
```

### .env.example
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/countryclub_pos"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_ACCESS_SECRET="your-access-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# API
API_BASE_URL="http://localhost:3000/api/v1"

# Development
NODE_ENV="development"
PORT=3000
```

Esta estructura proporciona una base sólida y escalable para el desarrollo del sistema POS del Country Club Mérida.
