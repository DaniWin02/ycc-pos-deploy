# Convenciones y Estándares - Country Club POS

## 1. Convenciones de Nomenclatura

### 1.1 Base de Datos

#### Tablas
- **Nombre**: Plural en mayúsculas (ej: `USERS`, `SALES`, `PRODUCTS`)
- **Separación**: Guion bajo para nombres compuestos (ej: `CASH_MOVEMENTS`, `ORDER_TICKETS`)
- **Longitud máxima**: 30 caracteres
- **Prefijos especiales**: Ninguno (mantener simplicidad)

#### Columnas
- **Primary Key**: `id` (UUID v4)
- **Foreign Keys**: `table_name_id` (ej: `user_id`, `sale_id`, `product_id`)
- **Timestamps**: `created_at`, `updated_at` (TIMESTAMPTZ)
- **Booleanos**: `is_` o `has_` prefijo (ej: `is_active`, `has_inventory`)
- **Soft Delete**: `deleted_at` (TIMESTAMPTZ, nullable)
- **Nombres**: snake_case en minúsculas (ej: `first_name`, `opening_float`)

#### Índices
- **PK**: Automático en `id`
- **FK**: Indexados automáticamente
- **Búsqueda**: Prefijo `idx_` + tabla + columnas (ej: `idx_sales_folio`)
- **Únicos**: Prefijo `uk_` + tabla + columna (ej: `uk_users_username`)

### 1.2 Código

#### JavaScript/TypeScript
- **Variables**: camelCase (ej: `userName`, `saleTotal`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `MAX_DISCOUNT_PERCENTAGE`)
- **Funciones**: camelCase, verbos (ej: `createSale()`, `validatePayment()`)
- **Clases**: PascalCase (ej: `SaleService`, `UserRepository`)
- **Archivos**: kebab-case (ej: `sale-service.ts`, `user-controller.ts`)

#### APIs
- **Endpoints**: kebab-case (ej: `/api/v1/sales`, `/api/v1/cash-movements`)
- **Parámetros**: snake_case (ej: `user_id`, `sale_status`)
- **Headers**: kebab-case (ej: `Idempotency-Key`, `X-Request-ID`)

## 2. Estándares de Datos

### 2.1 Tipos de Datos

#### UUIDs
- **Formato**: UUID v4 estándar
- **Almacenamiento**: VARCHAR(36) o tipo UUID nativo
- **Ejemplo**: `550e8400-e29b-41d4-a716-446655440000`

#### Timestamps
- **Formato**: ISO 8601 UTC
- **Zona horaria**: Siempre UTC en BD, convertir en frontend
- **Ejemplo**: `2026-02-19T10:30:00.000Z`

#### Montos Monetarios
- **Tipo**: DECIMAL(10,2)
- **Precisión**: 2 decimales para montos finales
- **Cálculos**: Siempre usar tipo decimal, nunca float
- **Almacenamiento**: Centavos como unidad base

#### JSON
- **Formato**: JSONB en PostgreSQL, JSON en SQLite
- **Estructura**: Consistente, camelCase en claves
- **Validación**: Schema JSON para campos críticos

### 2.2 Enums y Estados

#### Formato
- **Valores**: Mayúsculas con guion bajo
- **Ejemplo**: `DRAFT`, `SENT_TO_KITCHEN`, `CASH_IN`

#### Estados de Venta
```typescript
enum SaleStatus {
  DRAFT = 'DRAFT',
  HELD = 'HELD',
  SENT_TO_KITCHEN = 'SENT_TO_KITCHEN',
  PAID = 'PAID',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED'
}
```

#### Métodos de Pago
```typescript
enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MEMBER_CHARGE = 'MEMBER_CHARGE',
  MIXED = 'MIXED'
}
```

## 3. Estándares de API

### 3.1 Estructura de Endpoints

#### Versionado
- **Formato**: `/api/v{major}/`
- **Ejemplo**: `/api/v1/sales`, `/api/v2/users`
- **Backward compatibility**: Mantener v1 mientras exista v2

#### Recursos
- **Plural**: Nombres de recursos en plural
- **Anidamiento**: Lógico y limitado a 2 niveles
- **Ejemplos**:
  - `GET /api/v1/sales`
  - `GET /api/v1/sales/{id}/payments`
  - `GET /api/v1/users/{id}/shifts`

#### HTTP Methods
- **GET**: Obtener recursos (idempotente)
- **POST**: Crear nuevos recursos
- **PUT**: Actualizar recurso completo (idempotente)
- **PATCH**: Actualización parcial
- **DELETE**: Eliminar recurso (idempotente)

### 3.2 Respuestas Estándar

#### Éxito
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "folio": "C1-000123",
    "total": 458.20
  },
  "meta": {
    "timestamp": "2026-02-19T10:30:00.000Z",
    "version": "v1"
  }
}
```

#### Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payment amount",
    "details": {
      "field": "amount",
      "value": -50.00,
      "constraint": "must be greater than 0"
    }
  },
  "meta": {
    "timestamp": "2026-02-19T10:30:00.000Z",
    "requestId": "req_123456"
  }
}
```

#### Paginación
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### 3.3 Headers Estándar

#### Request Headers
- `Content-Type: application/json`
- `Accept: application/json`
- `Authorization: Bearer {token}`
- `Idempotency-Key: {uuid}` (para operaciones críticas)
- `X-Request-ID: {uuid}` (para tracing)

#### Response Headers
- `Content-Type: application/json`
- `X-Request-ID: {uuid}` (echo del request)
- `X-Rate-Limit-Remaining: {number}`
- `Cache-Control: no-cache` (para datos dinámicos)

## 4. Estándares de Código

### 4.1 TypeScript

#### Configuración
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

#### Interfaces
```typescript
// Prefijar con I para interfaces
interface ISale {
  id: string;
  folio: string;
  total: number;
  status: SaleStatus;
  createdAt: Date;
}

// Tipos para enums
type SaleStatus = 'DRAFT' | 'HELD' | 'PAID' | 'VOIDED';
```

#### Validaciones
```typescript
// Usar class-validator para DTOs
import { IsUUID, IsDecimal, IsEnum, IsNotEmpty } from 'class-validator';

class CreateSaleDto {
  @IsUUID()
  terminalId: string;

  @IsDecimal()
  @IsNotEmpty()
  total: number;

  @IsEnum(SaleStatus)
  status: SaleStatus;
}
```

### 4.2 Pruebas

#### Nomenclatura
- **Archivos**: `*.test.ts` o `*.spec.ts`
- **Funciones**: `describe` + `it/should`
- **Ejemplo**:
```typescript
describe('SaleService', () => {
  it('should create sale with valid data', async () => {
    // test implementation
  });

  it('should reject sale with negative total', async () => {
    // test implementation
  });
});
```

#### Cobertura
- **Mínimo**: 80% de cobertura
- **Crítico**: 100% en servicios de pagos y auditoría

## 5. Estándares de Seguridad

### 5.1 Autenticación

#### Tokens
- **Access Token**: JWT, expiración 15 minutos
- **Refresh Token**: Rotación, expiración 7 días
- **Formato**: Bearer token en Authorization header

#### Passwords
- **Hashing**: bcrypt con salt rounds >= 12
- **Longitud mínima**: 8 caracteres
- **Complejidad**: Mayúsculas, minúsculas, números, símbolos

### 5.2 Validaciones

#### Input Validation
- **Backend**: Siempre validar, nunca confiar en frontend
- **Sanitización**: Trim, escape de caracteres especiales
- **SQL Injection**: Usar siempre parámetros preparados

#### Rate Limiting
- **General**: 100 requests por minuto por IP
- **Autenticación**: 5 intentos por minuto
- **Pagos**: 10 requests por minuto por usuario

### 5.3 Auditoría

#### Eventos Críticos
- Login/Logout
- Creación/Modificación de usuarios
- Operaciones de caja
- Cambios de precios
- Cancelaciones de ventas

#### Logging
```typescript
// Estructura estándar de log
{
  timestamp: "2026-02-19T10:30:00.000Z",
  level: "INFO" | "WARN" | "ERROR",
  service: "sale-service",
  action: "sale.created",
  userId: "uuid",
  terminalId: "uuid",
  requestId: "uuid",
  payload: { ... },
  error?: { ... }
}
```

## 6. Estándares de Despliegue

### 6.1 Variables de Entorno

#### Nomenclatura
- **Prefijo**: `POS_`
- **Formato**: UPPER_SNAKE_CASE
- **Ejemplos**:
```bash
POS_DATABASE_URL=postgresql://...
POS_JWT_SECRET=your-secret-key
POS_REDIS_URL=redis://...
POS_LOG_LEVEL=INFO
```

#### Archivos
- **Desarrollo**: `.env.development`
- **Producción**: `.env.production`
- **Ejemplo**: `.env.example`

### 6.2 Docker

#### Multi-stage builds
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

#### Health checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

## 7. Convenciones de Git

### 7.1 Branches

#### Nomenclatura
- **Feature**: `feature/descripcion-corta`
- **Bugfix**: `bugfix/descripcion-corta`
- **Hotfix**: `hotfix/descripcion-corta`
- **Release**: `release/vX.Y.Z`

#### Ejemplos
```bash
feature/sale-offline-sync
bugfix/payment-validation
hotfix/security-patch
release/v1.2.0
```

### 7.2 Commits

#### Formato (Conventional Commits)
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Tipos
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato/código sin lógica
- `refactor`: Refactorización
- `test`: Tests
- `chore`: Mantenimiento

#### Ejemplos
```bash
feat(sales): add offline sync support
fix(payments): validate positive amounts
docs(api): update authentication guide
test(sales): add unit tests for sale creation
```

### 7.3 Pull Requests

#### Template
```markdown
## Descripción
Breve descripción del cambio

## Tipo de Cambio
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests passing
```

## 8. Monitoreo y Métricas

### 8.1 Métricas de Aplicación

#### Performance
- **Response time**: < 200ms (percentil 95)
- **Throughput**: > 1000 req/s
- **Error rate**: < 0.1%

#### Business
- **Ventas por minuto**: Métrica crítica
- **Tiempo de sincronización**: < 5s
- **Disponibilidad**: > 99.9%

### 8.2 Alertas

#### Críticas
- Error rate > 1%
- Response time > 1s
- Servicio caído (health check falla)

#### Advertencias
- CPU > 80%
- Memory > 85%
- Disk space > 90%

Estos estándares aseguran consistencia, mantenibilidad y escalabilidad del sistema POS.
