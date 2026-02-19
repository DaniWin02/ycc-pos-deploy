# Country Club POS - Guía de Configuración

## 🚀 Resumen del Proyecto

Sistema de Punto de Venta (POS) web para Country Club Mérida con capacidades offline-first, sincronización automática y gestión completa de ventas, pagos, inventario y socios.

### 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes + Prisma ORM
- **Base de Datos**: PostgreSQL (producción) / SQLite (desarrollo)
- **Caché/Sesiones**: Redis
- **Autenticación**: JWT con refresh tokens
- **PWA**: Service Workers para funcionalidad offline
- **Despliegue**: Docker + Docker Compose

---

## 📋 Prerrequisitos

### Software Requerido
- **Node.js**: v18.17.0 o superior
- **npm**: v9.0.0 o superior (o yarn/pnpm)
- **PostgreSQL**: v14+ (para producción)
- **Redis**: v6+ (para sesiones y caché)
- **Docker**: v20+ (opcional pero recomendado)
- **Git**: v2.30+

### Herramientas de Desarrollo
- **VS Code**: Editor recomendado
- **Postman/Insomnia**: Para probar APIs
- **DBeaver/Postico**: Cliente de base de datos

---

## 🚀 Instalación Rápida

### 1. Clonar el Repositorio
```bash
git clone https://github.com/countryclubmerida/pos-system.git
cd pos-system
```

### 2. Instalar Dependencias
```bash
# Usando npm
npm install

# O usando yarn
yarn install

# O usando pnpm
pnpm install
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus configuraciones
nano .env.local
```

### 4. Configurar Base de Datos
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar datos iniciales
npx prisma db seed
```

### 5. Iniciar Servidor de Desarrollo
```bash
# Modo desarrollo
npm run dev

# O en modo producción local
npm run build
npm start
```

### 6. Verificar Instalación
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ⚙️ Configuración Detallada

### Variables de Entorno

#### `.env.local` (Desarrollo)
```bash
# Base de Datos
DATABASE_URL="file:./dev.db"

# Redis (opcional para desarrollo)
REDIS_URL="redis://localhost:6379"

# JWT Secrets (generar nuevos)
JWT_ACCESS_SECRET="your-super-secret-access-key-min-32-chars"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-min-32-chars"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# API Configuration
API_BASE_URL="http://localhost:3000/api/v1"

# Logging
LOG_LEVEL="debug"
LOG_FILE="./logs/app.log"

# PWA Configuration
PWA_OFFLINE_SUPPORT=true
PWA_CACHE_STRATEGY="CacheFirst"

# Development Settings
NODE_ENV="development"
PORT=3000
```

#### `.env.production` (Producción)
```bash
# Base de Datos PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/countryclub_pos"

# Redis Production
REDIS_URL="redis://username:password@redis-server:6379"

# JWT Secrets (usar variables seguras)
JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET}"
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}"

# Next.js Production
NEXTAUTH_URL="https://pos.countryclubmerida.com"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# API Configuration
API_BASE_URL="https://pos.countryclubmerida.com/api/v1"

# Logging
LOG_LEVEL="info"
LOG_FILE="/var/log/countryclub-pos/app.log"

# PWA Configuration
PWA_OFFLINE_SUPPORT=true
PWA_CACHE_STRATEGY="NetworkFirst"

# Production Settings
NODE_ENV="production"
PORT=3000

# Security
CORS_ORIGIN="https://countryclubmerida.com"
SESSION_COOKIE_SECURE=true
BCRYPT_ROUNDS=12
```

### Configuración de Base de Datos

#### PostgreSQL (Producción)
```sql
-- Crear base de datos
CREATE DATABASE countryclub_pos;

-- Crear usuario
CREATE USER pos_user WITH PASSWORD 'secure_password';

-- Conceder permisos
GRANT ALL PRIVILEGES ON DATABASE countryclub_pos TO pos_user;

-- Conceder permisos en esquemas
\c countryclub_pos;
GRANT ALL ON SCHEMA public TO pos_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO pos_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO pos_user;
```

#### Redis (Producción)
```bash
# Configuración recomendada de redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

---

## 🐳 Docker Setup

### Docker Compose (Desarrollo)
```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/countryclub_pos
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
      - ./logs:/app/logs
    depends_on:
      - db
      - redis
    command: npm run dev

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=countryclub_pos
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql

  redis:
    image: redis:6-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Docker Compose (Producción)
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_ACCESS_SECRET=${JWT_ACCESS_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:6-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

### Dockerfiles

#### Dockerfile.dev
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar código fuente
COPY . .

# Generar Prisma client
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

#### Dockerfile.prod
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Generar Prisma client
RUN npx prisma generate

# Construir aplicación
RUN npm run build

# Imagen de producción
FROM node:18-alpine AS production

WORKDIR /app

# Crear usuario no root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S posuser -u 1001

# Copiar dependencias y build
COPY --from=builder --chown=posuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=posuser:nodejs /app/.next ./.next
COPY --from=builder --chown=posuser:nodejs /app/package.json ./package.json
COPY --from=builder --chown=posuser:nodejs /app/prisma ./prisma
COPY --from=builder --chown=posuser:nodejs /app/public ./public

# Instalar Prisma client
RUN npx prisma generate

USER posuser

EXPOSE 3000

CMD ["npm", "start"]
```

---

## 📁 Estructura del Proyecto

```
countryclub-pos/
├── src/
│   ├── app/                    # App Router (Next.js 13+)
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── api/               # API Routes
│   │   │   └── v1/           # Versionamiento de API
│   │   ├── pos/               # Aplicación POS principal
│   │   ├── admin/             # Panel administrativo
│   │   └── globals.css       # Estilos globales
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes UI reutilizables
│   │   ├── forms/            # Formularios
│   │   └── layout/           # Componentes de layout
│   ├── lib/                  # Utilidades y configuración
│   │   ├── auth/             # Configuración de autenticación
│   │   ├── db/               # Configuración de base de datos
│   │   ├── utils/            # Funciones utilitarias
│   │   └── validations/      # Validaciones
│   ├── types/                # Definiciones TypeScript
│   ├── hooks/                # Custom React hooks
│   ├── services/             # Servicios de API
│   └── store/                # Estado global (Zustand/Redux)
├── prisma/
│   ├── schema.prisma         # Esquema de base de datos
│   ├── migrations/           # Migraciones
│   └── seed.ts              # Datos iniciales
├── public/                   # Archivos estáticos
├── docs/                     # Documentación
├── scripts/                  # Scripts de utilidad
├── tests/                    # Tests unitarios y de integración
├── docker-compose.dev.yml    # Docker desarrollo
├── docker-compose.prod.yml   # Docker producción
├── Dockerfile.dev            # Dockerfile desarrollo
├── Dockerfile.prod           # Dockerfile producción
├── .env.example              # Variables de entorno ejemplo
├── .gitignore               # Archivos ignorados por Git
├── README.md                # Este archivo
├── package.json              # Dependencias del proyecto
├── tailwind.config.js       # Configuración TailwindCSS
├── next.config.js            # Configuración Next.js
└── tsconfig.json            # Configuración TypeScript
```

---

## 🔄 Scripts Disponibles

### Scripts de Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm start

# Ejecutar linter
npm run lint

# Corregir linter automáticamente
npm run lint:fix

# Ejecutar formateador
npm run format

# Ejecutar tests
npm run test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

### Scripts de Base de Datos
```bash
# Generar cliente Prisma
npm run db:generate

# Crear nueva migración
npm run db:migrate

# Aplicar migraciones
npm run db:deploy

# Reiniciar base de datos
npm run db:reset

# Poblar datos iniciales
npm run db:seed

# Ver base de datos en UI
npm run db:studio
```

### Scripts de Docker
```bash
# Iniciar entorno de desarrollo con Docker
npm run docker:dev

# Iniciar entorno de producción con Docker
npm run docker:prod

# Construir imágenes Docker
npm run docker:build

# Limpiar Docker
npm run docker:clean
```

### Scripts de Utilidad
```bash
# Verificar tipos TypeScript
npm run type-check

# Limpiar caché
npm run clean

# Actualizar dependencias
npm run update

# Analizar tamaño de bundle
npm run analyze

# Generar documentación de API
npm run docs:generate
```

---

## 🔧 Configuración de Herramientas

### VS Code Extensions Recomendadas
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "prisma.prisma",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-git-graph"
  ]
}
```

### Configuración de ESLint (`.eslintrc.json`)
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Configuración de Prettier (`.prettierrc`)
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

---

## 🧪 Testing

### Ejecutar Tests
```bash
# Todos los tests
npm test

# Tests unitarios
npm run test:unit

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e

# Con cobertura
npm run test:coverage
```

### Configuración de Tests
```typescript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testMatch: [
    '<rootDir>/tests/**/*.test.ts',
    '<rootDir>/src/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

---

## 🚀 Despliegue

### Despliegue en VPS (DigitalOcean, Vultr, etc.)
```bash
# 1. Clonar repositorio
git clone https://github.com/countryclubmerida/pos-system.git
cd pos-system

# 2. Configurar variables de entorno
cp .env.example .env.production
# Editar .env.production con valores reales

# 3. Construir y levantar con Docker
docker-compose -f docker-compose.prod.yml up -d

# 4. Ejecutar migraciones
docker-compose exec app npx prisma migrate deploy

# 5. Poblar datos iniciales
docker-compose exec app npx prisma db seed
```

### Despliegue en Vercel
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Autenticar
vercel login

# 3. Desplegar
vercel --prod

# 4. Configurar variables de entorno en Vercel Dashboard
```

### Despliegue en Railway
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Autenticar
railway login

# 3. Crear proyecto
railway init

# 4. Configurar variables de entorno
railway variables set NODE_ENV=production
railway variables set DATABASE_URL=your_database_url

# 5. Desplegar
railway up
```

---

## 🔍 Monitoreo y Logs

### Configuración de Logs
```typescript
// src/lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'countryclub-pos' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Health Check Endpoint
```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificar conexión a base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    // Verificar conexión a Redis
    await redis.ping();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version,
      uptime: process.uptime(),
      checks: {
        database: 'healthy',
        redis: 'healthy'
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 });
  }
}
```

---

## 🛠️ Mantenimiento

### Tareas Programadas (Cron Jobs)
```bash
# Limpiar logs antiguos (diario)
0 2 * * * find /var/log/countryclub-pos -name "*.log" -mtime +30 -delete

# Backup de base de datos (diario)
0 3 * * * pg_dump countryclub_pos > /backups/db_$(date +\%Y\%m\%d).sql

# Limpiar sesiones expiradas (cada hora)
0 * * * * curl -X POST http://localhost:3000/api/v1/maintenance/cleanup-sessions
```

### Actualización del Sistema
```bash
# 1. Backup actual
./scripts/backup.sh

# 2. Actualizar código
git pull origin main

# 3. Actualizar dependencias
npm update

# 4. Ejecutar migraciones
npx prisma migrate deploy

# 5. Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart
```

---

## 📞 Soporte y Troubleshooting

### Problemas Comunes

#### 1. Error de Conexión a Base de Datos
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar conexión
psql -h localhost -U postgres -d countryclub_pos

# Revisar URL en .env
echo $DATABASE_URL
```

#### 2. Error de Migración
```bash
# Resetear base de datos (cuidado: borra datos)
npx prisma migrate reset

# O crear nueva migración
npx prisma migrate dev --name fix_migration
```

#### 3. Problemas con Redis
```bash
# Verificar Redis
redis-cli ping

# Verificar configuración
redis-cli config get "*"
```

### Recursos de Ayuda
- **Documentación oficial**: [docs.countryclubmerida.com](https://docs.countryclubmerida.com)
- **Issues de GitHub**: [github.com/countryclubmerida/pos-system/issues](https://github.com/countryclubmerida/pos-system/issues)
- **Soporte técnico**: soporte@countryclubmerida.com

---

## 📝 Licencia

Este proyecto está licenciado bajo la MIT License. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

**¡Listo! 🎉 Tu sistema Country Club POS está configurado y listo para usar.**
