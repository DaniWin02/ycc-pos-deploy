# Políticas y Estándares de API - Country Club POS

## 1. Políticas Generales

### 1.1 Versionado
- **Formato**: `/api/v{major}/`
- **Estrategia**: Versionado por URL (no por headers)
- **Backward Compatibility**: Mantener versión anterior por al menos 6 meses
- **Deprecación**: Headers `X-Deprecation-Warning` con fecha de fin de soporte

### 1.2 Rate Limiting
```yaml
General:
  requests_per_minute: 100
  burst: 20
  
Authentication:
  login_attempts: 5 per minute
  password_reset: 3 per hour
  
Critical Operations:
  payments: 10 per minute per user
  sales_creation: 30 per minute per terminal
  void_operations: 5 per minute per user
```

### 1.3 Timeouts
```yaml
Connection: 5 seconds
Read: 30 seconds
Write: 60 seconds
Database Query: 10 seconds
External API: 15 seconds
```

## 2. Políticas de Paginación

### 2.1 Parámetros Estándar
```typescript
interface PaginationParams {
  page: number;        // 1-based, default: 1
  limit: number;       // 1-100, default: 20
  sort?: string;       // field:asc|field:desc
  cursor?: string;     // for cursor-based pagination
}
```

### 2.2 Response de Paginación
```typescript
interface PaginationResponse {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextCursor?: string;
    prevCursor?: string;
  };
}
```

### 2.3 Estrategias por Tipo de Datos

#### Offset-based (General)
- Para datos históricos y reportes
- Permite saltar a páginas específicas
- Límite: 10,000 registros máximo

#### Cursor-based (Tiempo Real)
- Para feeds y datos en tiempo real
- Más eficiente para datasets grandes
- Usa timestamp o ID como cursor

```typescript
// Ejemplo cursor-based
GET /api/v1/sales?limit=20&cursor=2026-02-19T10:30:00.000Z_550e8400-e29b-41d4-a716-446655440400
```

## 3. Políticas de Filtrado y Búsqueda

### 3.1 Filtros Estándar
```typescript
interface StandardFilters {
  date_from?: string;     // ISO 8601
  date_to?: string;       // ISO 8601
  status?: string[];      // Array de estados
  created_by?: string;    // UUID
  updated_by?: string;    // UUID
}
```

### 3.2 Búsqueda de Texto
```typescript
interface SearchParams {
  q?: string;            // Término de búsqueda
  fields?: string[];     // Campos específicos
  fuzzy?: boolean;       // Búsqueda difusa
  exact?: boolean;       // Búsqueda exacta
}
```

### 3.3 Ejemplos de Uso
```http
# Búsqueda por texto con filtros
GET /api/v1/sales?q=juan&status=PAID,VOIDED&date_from=2026-02-01T00:00:00Z

# Búsqueda en campos específicos
GET /api/v1/members?q=perez&fields=first_name,last_name&exact=true

# Búsqueda difusa
GET /api/v1/products?q=agua&fuzzy=true
```

## 4. Políticas de Ordenamiento

### 4.1 Campos Ordenables
```typescript
const sortableFields = {
  sales: ['created_at', 'updated_at', 'total_amount', 'folio'],
  products: ['name', 'sku', 'price', 'created_at'],
  members: ['first_name', 'last_name', 'member_number', 'join_date'],
  shifts: ['opened_at', 'closed_at', 'opening_float']
};
```

### 4.2 Sintaxis de Ordenamiento
```http
# Simple
GET /api/v1/sales?sort=created_at:desc

# Múltiple
GET /api/v1/sales?sort=status:asc,created_at:desc

# Por defecto (created_at:desc)
GET /api/v1/sales
```

## 5. Políticas de Idempotencia

### 5.1 Requisitos
- **Header Obligatorio**: `Idempotency-Key` para operaciones críticas
- **Formato**: UUID v4
- **TTL**: 24 horas para claves de idempotencia
- **Scope**: Por endpoint y usuario

### 5.2 Operaciones que Requieren Idempotencia
```typescript
const idempotentOperations = [
  'POST /api/v1/sales',
  'POST /api/v1/payments',
  'DELETE /api/v1/sales/{id}',
  'POST /api/v1/shifts',
  'POST /api/v1/sync/outbox'
];
```

### 5.3 Implementación
```typescript
// Middleware de idempotencia
async function idempotencyMiddleware(req, res, next) {
  const key = req.headers['idempotency-key'];
  const userId = req.user.id;
  const endpoint = `${req.method} ${req.route.path}`;
  
  if (!key && requiresIdempotency(endpoint)) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'IDEMPOTENCY_KEY_REQUIRED',
        message: 'Idempotency-Key header is required for this operation'
      }
    });
  }
  
  // Verificar si ya existe
  const existing = await IdempotencyKey.findOne({
    where: { key, scope: `${userId}:${endpoint}` }
  });
  
  if (existing) {
    return res.status(200).json(existing.response);
  }
  
  // Guardar clave y continuar
  req.idempotencyKey = key;
  next();
}
```

## 6. Políticas de Validación

### 6.1 Validación de Input
```typescript
// Usar class-validator
import { IsUUID, IsDecimal, IsEnum, IsNotEmpty, Min, Max } from 'class-validator';

class CreateSaleDto {
  @IsUUID()
  @IsNotEmpty()
  terminal_id: string;
  
  @IsDecimal()
  @Min(0.01)
  total_amount: number;
  
  @IsEnum(SaleStatus)
  status: SaleStatus;
}
```

### 6.2 Sanitización
```typescript
// Sanitización automática
import { transform, Transform } from 'class-transformer';

class ProductDto {
  @Transform(({ value }) => value?.trim())
  name: string;
  
  @Transform(({ value }) => parseFloat(value).toFixed(2))
  price: number;
}
```

### 6.3 Validaciones de Negocio
```typescript
// Validaciones específicas del POS
class SaleValidator {
  static validateSaleCreation(sale: CreateSaleDto) {
    // No permitir ventas sin líneas
    if (!sale.lines || sale.lines.length === 0) {
      throw new ValidationError('Sale must have at least one line');
    }
    
    // Validar que el total coincida
    const calculatedTotal = this.calculateTotal(sale.lines);
    if (Math.abs(calculatedTotal - sale.total_amount) > 0.01) {
      throw new ValidationError('Total amount does not match line items');
    }
    
    // Validar límites de descuento
    if (sale.discount_amount > calculatedTotal * 0.5) {
      throw new ValidationError('Discount cannot exceed 50% of total');
    }
  }
}
```

## 7. Políticas de Manejo de Errores

### 7.1 Códigos de Error Estándar
```typescript
enum ErrorCode {
  // Client Errors (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Server Errors (5xx)
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  SYNC_ERROR = 'SYNC_ERROR'
}
```

### 7.2 Formato de Error
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Array<{
      field?: string;
      value?: any;
      constraint: string;
    }>;
    stack?: string; // Solo en desarrollo
  };
  meta: ResponseMeta;
}
```

### 7.3 Logging de Errores
```typescript
// Estructura de log de error
interface ErrorLog {
  timestamp: string;
  level: 'ERROR';
  service: string;
  action: string;
  userId?: string;
  terminalId?: string;
  requestId: string;
  error: {
    code: string;
    message: string;
    stack?: string;
    context?: any;
  };
}
```

## 8. Políticas de Caching

### 8.1 Estrategias por Tipo de Dato
```typescript
const cacheStrategies = {
  // Catáatos maestros (larga duración)
  products: { ttl: 3600, strategy: 'cache-first' },
  members: { ttl: 1800, strategy: 'cache-first' },
  
  // Datos transaccionales (corta duración)
  sales: { ttl: 60, strategy: 'network-first' },
  shifts: { ttl: 300, strategy: 'network-first' },
  
  // Datos de configuración (muy larga duración)
  terminals: { ttl: 7200, strategy: 'cache-first' },
  areas: { ttl: 7200, strategy: 'cache-first' }
};
```

### 8.2 Headers de Caching
```http
# Para datos cacheables
Cache-Control: public, max-age=3600
ETag: "abc123"
Last-Modified: Wed, 19 Feb 2026 10:30:00 GMT

# Para datos dinámicos
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

### 8.3 Invalidación de Caché
```typescript
// Invalidación por eventos
class CacheInvalidator {
  static async onProductUpdate(productId: string) {
    await cache.del(`product:${productId}`);
    await cache.del('products:list');
  }
  
  static async onSaleCreation(saleId: string) {
    await cache.del('sales:dashboard');
    await cache.del(`shift:${sale.shiftId}:stats`);
  }
}
```

## 9. Políticas de Seguridad

### 9.1 Headers de Seguridad
```http
# Headers obligatorios
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()

# Headers CORS (configurables)
Access-Control-Allow-Origin: https://countryclubmerida.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Idempotency-Key
Access-Control-Max-Age: 86400
```

### 9.2 Validación de Input
```typescript
// Sanitización XSS
import DOMPurify from 'dompurify';

function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
}

// Validación SQL Injection (usando ORM)
// Siempre usar parámetros preparados
const sales = await prisma.sale.findMany({
  where: {
    status: 'PAID',
    created_at: {
      gte: new Date(dateFrom)
    }
  }
});
```

### 9.3 Rate Limiting por Usuario
```typescript
// Rate limiting específico por rol
const rateLimits = {
  CASHIER: {
    sales: { requests: 30, window: '1m' },
    payments: { requests: 30, window: '1m' },
    searches: { requests: 100, window: '1m' }
  },
  SUPERVISOR: {
    voids: { requests: 10, window: '1m' },
    discounts: { requests: 20, window: '1m' }
  },
  ADMIN: {
    all: { requests: 200, window: '1m' }
  }
};
```

## 10. Políticas de Monitoreo

### 10.1 Métricas Obligatorias
```typescript
interface APIMetrics {
  // Performance
  response_time: number;
  request_count: number;
  error_rate: number;
  
  // Business
  sales_per_minute: number;
  payments_success_rate: number;
  sync_success_rate: number;
  
  // System
  database_connections: number;
  memory_usage: number;
  cpu_usage: number;
}
```

### 10.2 Health Checks
```typescript
// Endpoint de health check
GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2026-02-19T12:00:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "redis": "healthy",
    "external_apis": "healthy"
  },
  "uptime": 86400
}
```

### 10.3 Alertas
```typescript
// Umbrales de alerta
const alertThresholds = {
  response_time_p95: { warning: 500, critical: 1000 }, // ms
  error_rate: { warning: 0.01, critical: 0.05 }, // 1%, 5%
  database_connections: { warning: 80, critical: 90 }, // %
  sync_failure_rate: { warning: 0.02, critical: 0.1 } // 2%, 10%
};
```

## 11. Políticas de Documentación

### 11.1 OpenAPI Specification
- **Archivo**: `openapi.yaml` en raíz del proyecto
- **Validación**: Automática en CI/CD
- **Generación**: Automática desde código fuente
- **Hosting**: Swagger UI en `/docs`

### 11.2 Ejemplos en Documentación
- Cada endpoint debe tener ejemplos de request/response
- Incluir casos de error comunes
- Ejemplos con datos realistas del dominio del POS

### 11.3 Versionado de Documentación
- Mantener documentación de versiones anteriores
- Changelog con breaking changes
- Guías de migración entre versiones

## 12. Políticas de Testing

### 12.1 Cobertura Requerida
```typescript
const coverageRequirements = {
  overall: 80,
  critical_paths: 100, // Pagos, autenticación, sincronización
  business_logic: 90,
  utilities: 70
};
```

### 12.2 Tipos de Tests
- **Unit Tests**: Lógica de negocio, validaciones
- **Integration Tests**: Endpoints completos con BD
- **E2E Tests**: Flujos críticos del POS
- **Load Tests**: Performance bajo carga
- **Security Tests**: Vulnerabilidades comunes

### 12.3 Datos de Test
```typescript
// Seeds consistentes para tests
const testSeeds = {
  users: ['cashier', 'supervisor', 'admin'],
  products: ['agua', 'sandwich', 'cerveza'],
  terminals: ['caja01', 'caja02'],
  members: ['socio_activo', 'socio_inactivo']
};
```

Estas políticas aseguran consistencia, seguridad y mantenibilidad de la API del Country Club POS.
