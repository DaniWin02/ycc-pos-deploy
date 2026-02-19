# PLAN MAESTRO DE IMPLEMENTACIÓN: PUNTO DE VENTA
## Integrado con SAP Business One + Jonas Software
### Fecha: Febrero 2026 | Versión: 1.0

---

## TABLA DE CONTENIDOS

1. [Arquitectura General del Sistema](#1-arquitectura)
2. [Stack Tecnológico Recomendado](#2-stack-tecnológico)
3. [Diseño de la Capa de Integración (Middleware)](#3-middleware)
4. [Flujos de Negocio Detallados](#4-flujos-negocio)
5. [Modelo de Datos del POS](#5-modelo-datos)
6. [Plan de Fases de Implementación](#6-fases)
7. [Buenas Prácticas Contables y Administrativas](#7-buenas-prácticas)
8. [Seguridad y Cumplimiento](#8-seguridad)
9. [Pruebas y Calidad](#9-pruebas)
10. [Operación y Mantenimiento](#10-operación)

---

## 1. ARQUITECTURA GENERAL DEL SISTEMA

### 1.1 Diagrama de Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CAPA DE PRESENTACIÓN                         │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Terminal  │  │ Terminal  │  │ Terminal  │  │ Panel Admin      │   │
│  │ POS #1   │  │ POS #2   │  │ POS #N   │  │ (Dashboard Web)  │   │
│  │ (Web App)│  │ (Web App)│  │ (Web App)│  │                  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │
│       │              │              │                  │             │
└───────┼──────────────┼──────────────┼──────────────────┼─────────────┘
        │              │              │                  │
        └──────────────┼──────────────┘                  │
                       │                                 │
┌──────────────────────┼─────────────────────────────────┼─────────────┐
│                      ▼           CAPA API               ▼             │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                    API GATEWAY / BACKEND                        │ │
│  │                    (Node.js / .NET Core)                        │ │
│  │                                                                 │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │ │
│  │  │ Auth     │ │ Ventas   │ │ Inventario│ │ Reportes         │  │ │
│  │  │ Service  │ │ Service  │ │ Service   │ │ Service          │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │ │
│  │  │ Clientes │ │ Pagos    │ │ Caja      │ │ Sincronización   │  │ │
│  │  │ Service  │ │ Service  │ │ Service   │ │ Service          │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │ │
│  └─────────────────────┬───────────────────────────────────────────┘ │
│                        │                                             │
└────────────────────────┼─────────────────────────────────────────────┘
                         │
┌────────────────────────┼─────────────────────────────────────────────┐
│                        ▼      CAPA DE INTEGRACIÓN                    │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                 MIDDLEWARE DE INTEGRACIÓN                        │ │
│  │                                                                 │ │
│  │  ┌────────────────┐  ┌──────────────┐  ┌────────────────────┐  │ │
│  │  │ SAP B1         │  │ Jonas        │  │ Cola de Mensajes   │  │ │
│  │  │ Connector      │  │ Connector    │  │ (Message Queue)    │  │ │
│  │  │ (Service Layer)│  │ (SQL Direct) │  │                    │  │ │
│  │  └───────┬────────┘  └──────┬───────┘  └────────┬───────────┘  │ │
│  │          │                  │                    │              │ │
│  └──────────┼──────────────────┼────────────────────┼──────────────┘ │
│             │                  │                    │                │
└─────────────┼──────────────────┼────────────────────┼────────────────┘
              │                  │                    │
    ┌─────────▼──────┐  ┌───────▼────────┐  ┌───────▼────────┐
    │  SAP Business   │  │  Jonas         │  │  POS Database  │
    │  One            │  │  Enterprise    │  │  (Local/Cache) │
    │  (SQL/HANA)     │  │  (SQL Server)  │  │  (PostgreSQL/  │
    │                 │  │                │  │   Redis)       │
    └─────────────────┘  └────────────────┘  └────────────────┘
```

### 1.2 Principios Arquitectónicos

1. **Separación de responsabilidades**: Cada capa tiene una función clara
2. **Desacoplamiento**: POS no depende directamente de SAP ni Jonas
3. **Resiliencia**: El POS funciona incluso si SAP o Jonas están caídos (modo offline)
4. **Consistencia eventual**: Los datos se sincronizan de forma asíncrona cuando es necesario
5. **Auditoría completa**: Toda transacción queda registrada
6. **Escalabilidad horizontal**: Se pueden agregar terminales sin afectar rendimiento
7. **Seguridad en capas**: Autenticación y autorización en cada nivel

### 1.3 Flujo de una Venta Típica

```
1. Cajero escanea productos en Terminal POS
2. POS consulta precios/stock del caché local
3. Cajero aplica descuentos (si autorizado)
4. Cliente paga (efectivo/tarjeta/mixto)
5. POS registra venta en BD local
6. POS envía venta al Backend API
7. Backend API encola la transacción
8. Worker procesa la cola:
   a. Crea Factura en SAP B1 (Service Layer)
   b. Registra Pago en SAP B1
   c. Actualiza datos en Jonas (SQL)
   d. Genera CFDI (si aplica)
9. POS recibe confirmación
10. Se imprime ticket/factura
```

---

## 2. STACK TECNOLÓGICO RECOMENDADO

### 2.1 Frontend (Terminal POS)

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Framework** | React + TypeScript | Ecosistema maduro, tipado fuerte, componentes reutilizables |
| **UI Library** | Tailwind CSS + shadcn/ui | Diseño moderno, rápido, personalizable |
| **State Management** | Zustand o Redux Toolkit | Manejo de estado predecible para carrito/sesión |
| **Offline Storage** | IndexedDB (Dexie.js) | Almacenamiento local para modo offline |
| **HTTP Client** | Axios o TanStack Query | Caché, reintentos, cancelación de requests |
| **Lector de barras** | Web HID API / Keyboard wedge | Compatibilidad con escáneres estándar |
| **Impresión** | ESC/POS vía WebUSB o servicio local | Impresión directa en impresoras térmicas |

### 2.2 Backend API

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Runtime** | Node.js (LTS) o .NET 8 | Alto rendimiento, ecosistema amplio |
| **Framework** | NestJS (Node) o ASP.NET Core | Estructura empresarial, inyección de dependencias |
| **ORM** | Prisma (Node) o Entity Framework (.NET) | Type-safe, migraciones, consultas optimizadas |
| **Validación** | Zod (Node) o FluentValidation (.NET) | Validación de esquemas robusta |
| **Autenticación** | JWT + Refresh Tokens | Stateless, escalable |
| **Documentación API** | OpenAPI/Swagger | Auto-documentación de endpoints |

### 2.3 Base de Datos del POS

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **BD Principal** | PostgreSQL 16+ | Robusta, ACID, JSON nativo, extensible |
| **Caché** | Redis 7+ | Caché de productos, precios, sesiones |
| **Cola de mensajes** | Redis Streams o RabbitMQ | Procesamiento asíncrono de transacciones |
| **Búsqueda** | PostgreSQL Full-Text o Meilisearch | Búsqueda rápida de productos |

### 2.4 Infraestructura

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Contenedores** | Docker + Docker Compose | Despliegue consistente y reproducible |
| **Reverse Proxy** | Nginx o Traefik | SSL termination, load balancing |
| **Monitoreo** | Prometheus + Grafana | Métricas en tiempo real |
| **Logs** | Winston/Pino + ELK Stack | Logs centralizados y buscables |
| **CI/CD** | GitHub Actions o GitLab CI | Automatización de despliegues |

### 2.5 Alternativa: Stack .NET (Si el equipo es más fuerte en .NET)

Dado que Jonas y SAP B1 están en ecosistema Windows/SQL Server:

| Componente | Tecnología |
|------------|------------|
| **Backend** | ASP.NET Core 8 Web API |
| **ORM** | Entity Framework Core 8 |
| **Frontend** | React + TypeScript (igual) |
| **BD POS** | SQL Server Express (consistencia con Jonas) |
| **Caché** | Redis o MemoryCache |
| **Cola** | SQL Server Service Broker o RabbitMQ |

---

## 3. DISEÑO DE LA CAPA DE INTEGRACIÓN (MIDDLEWARE)

### 3.1 Conector SAP Business One

```
┌─────────────────────────────────────────────┐
│           SAP B1 CONNECTOR                   │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Session Manager                       │  │
│  │  - Login/Logout automático             │  │
│  │  - Renovación de sesión B1SESSION      │  │
│  │  - Pool de conexiones                  │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Entity Mappers                        │  │
│  │  - POS Item ↔ SAP Item                 │  │
│  │  - POS Customer ↔ SAP BusinessPartner  │  │
│  │  - POS Invoice ↔ SAP Invoice           │  │
│  │  - POS Payment ↔ SAP IncomingPayment   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Operations                            │  │
│  │  - createInvoice()                     │  │
│  │  - createPayment()                     │  │
│  │  - createCreditNote()                  │  │
│  │  - getItems()                          │  │
│  │  - getCustomers()                      │  │
│  │  - getStock()                          │  │
│  │  - getPrices()                         │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Error Handler                         │  │
│  │  - Retry logic (exponential backoff)   │  │
│  │  - Circuit breaker                     │  │
│  │  - Dead letter queue                   │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

#### Ejemplo de Configuración del Conector SAP B1:

```typescript
// sap-b1-config.ts
interface SAPB1Config {
  serviceLayerUrl: string;    // https://sap-server:50000/b1s/v1
  companyDB: string;          // "SBO_MIEMPRESA"
  username: string;           // Usuario dedicado POS
  password: string;           // Encriptado en vault
  sessionTimeout: number;     // 25 min (antes del timeout de 30)
  maxRetries: number;         // 3
  retryDelay: number;         // 1000ms (exponential)
  batchSize: number;          // 20 (para sync masiva)
}
```

### 3.2 Conector Jonas

```
┌─────────────────────────────────────────────┐
│           JONAS CONNECTOR                    │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Database Connection Manager           │  │
│  │  - Connection pool (SQL Server)        │  │
│  │  - Read-only connection (consultas)    │  │
│  │  - Write connection (staging tables)   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Read Operations (Vistas)              │  │
│  │  - getInventoryItems()                 │  │
│  │  - getCustomers()                      │  │
│  │  - getPrices()                         │  │
│  │  - getStockLevels()                    │  │
│  │  - getWorkOrders()                     │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Write Operations (Staging)            │  │
│  │  - queueInvoice()                      │  │
│  │  - queuePayment()                      │  │
│  │  - queueCreditNote()                   │  │
│  │  - queueInventoryAdjustment()          │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Sync Engine                           │  │
│  │  - Scheduled sync (cron jobs)          │  │
│  │  - Delta sync (solo cambios)           │  │
│  │  - Full sync (reconciliación)          │  │
│  │  - Conflict resolution                 │  │
│  └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 3.3 Estrategia de Sincronización Bidireccional

```
┌─────────────────────────────────────────────────────────────┐
│                  FLUJO DE SINCRONIZACIÓN                     │
│                                                              │
│  SAP B1 ──────────┐                                         │
│  (Service Layer)   │    ┌──────────────┐    ┌─────────┐     │
│                    ├───→│  POS Cache   │───→│  POS    │     │
│  Jonas ───────────┘    │  (Redis)     │    │  App    │     │
│  (SQL Direct)          └──────────────┘    └────┬────┘     │
│                                                  │          │
│                        ┌──────────────┐          │          │
│  SAP B1 ◄──────────────│  Message     │◄─────────┘          │
│  (Service Layer)       │  Queue       │                     │
│                        │  (Redis/RMQ) │                     │
│  Jonas ◄───────────────│              │                     │
│  (Staging Tables)      └──────────────┘                     │
│                                                              │
│  SINCRONIZACIÓN DE LECTURA (cada 5-15 min):                 │
│  1. Leer artículos nuevos/modificados de SAP B1             │
│  2. Leer artículos nuevos/modificados de Jonas              │
│  3. Resolver conflictos (SAP B1 = fuente de verdad)         │
│  4. Actualizar caché Redis del POS                          │
│                                                              │
│  SINCRONIZACIÓN DE ESCRITURA (inmediata):                   │
│  1. POS encola transacción en Message Queue                 │
│  2. Worker toma transacción de la cola                      │
│  3. Worker escribe en SAP B1 (Service Layer)                │
│  4. Worker escribe en Jonas (Staging → SP)                  │
│  5. Worker confirma al POS                                  │
│  6. Si falla: reintento con backoff exponencial             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Definición de "Fuente de Verdad" (Source of Truth)

**DECISIÓN ARQUITECTÓNICA CRÍTICA:**

| Dato | Fuente de Verdad | Justificación |
|------|-------------------|---------------|
| **Artículos/Productos** | SAP B1 | ERP principal de gestión comercial |
| **Precios** | SAP B1 | Listas de precios centralizadas |
| **Clientes** | SAP B1 | Maestro de socios de negocio |
| **Stock** | SAP B1 | Control de inventario centralizado |
| **Contabilidad** | SAP B1 | Libro mayor oficial |
| **Impuestos** | SAP B1 | Configuración fiscal |
| **Órdenes de Trabajo** | Jonas | Módulo especializado de Jonas |
| **Proyectos** | Jonas | Gestión de proyectos de construcción |
| **Nómina** | Jonas | Módulo de nómina de Jonas |
| **Ventas POS** | POS → SAP B1 | Se genera en POS, se replica a SAP |

> **NOTA**: Esta decisión debe validarse con el equipo de negocio. Si Jonas es el ERP principal y SAP B1 es secundario, las fuentes de verdad podrían invertirse.

---

## 4. FLUJOS DE NEGOCIO DETALLADOS

### 4.1 Flujo: Venta Simple (Efectivo)

```
PASO  ACTOR       ACCIÓN                           SISTEMA
────  ─────       ──────                           ───────
1     Cajero      Inicia sesión en POS             POS valida credenciales (JWT)
2     Cajero      Escanea código de barras         POS busca en caché Redis
3     POS         Muestra producto + precio         Caché local
4     Cajero      Ajusta cantidad                  POS actualiza carrito
5     Cajero      Repite pasos 2-4 por producto    POS acumula en carrito
6     Cajero      Presiona "Cobrar"                POS calcula total + impuestos
7     Cajero      Selecciona "Efectivo"            POS muestra monto a cobrar
8     Cajero      Ingresa monto recibido           POS calcula cambio
9     Cajero      Confirma venta                   POS ejecuta:
                                                    a) Guarda venta en BD local
                                                    b) Encola para SAP B1
                                                    c) Encola para Jonas
                                                    d) Imprime ticket
10    Worker      Procesa cola                     Crea Invoice en SAP B1
11    Worker      Procesa cola                     Crea IncomingPayment en SAP B1
12    Worker      Procesa cola                     Escribe en Jonas (staging)
13    POS         Muestra confirmación             Venta completada
```

### 4.2 Flujo: Venta con Tarjeta de Crédito

```
PASO  ACTOR       ACCIÓN                           SISTEMA
────  ─────       ──────                           ───────
1-6   (Igual que venta simple)
7     Cajero      Selecciona "Tarjeta"             POS conecta con terminal bancaria
8     Terminal    Procesa pago                     Comunicación con banco
9     Terminal    Retorna autorización             Código de autorización
10    POS         Registra venta + pago            BD local + cola
11    Worker      Crea Invoice en SAP B1           Service Layer
12    Worker      Crea IncomingPayment (tarjeta)   Service Layer (con auth code)
13    Worker      Escribe en Jonas                 Staging tables
```

### 4.3 Flujo: Devolución

```
PASO  ACTOR       ACCIÓN                           SISTEMA
────  ─────       ──────                           ───────
1     Cajero      Selecciona "Devolución"          POS cambia a modo devolución
2     Cajero      Busca venta original             POS busca por # ticket/factura
3     POS         Muestra detalle de venta         BD local o consulta SAP B1
4     Cajero      Selecciona artículos a devolver  POS marca artículos
5     Supervisor  Autoriza devolución (si req.)    POS valida permisos
6     Cajero      Confirma devolución              POS ejecuta:
                                                    a) Guarda devolución en BD local
                                                    b) Encola Credit Note para SAP B1
                                                    c) Encola para Jonas
                                                    d) Imprime nota de crédito
7     Worker      Crea CreditNote en SAP B1        Service Layer (ref. a factura orig.)
8     Worker      Procesa reembolso                Según método de pago original
9     Worker      Escribe en Jonas                 Staging tables
```

### 4.4 Flujo: Apertura de Caja

```
PASO  ACTOR       ACCIÓN                           SISTEMA
────  ─────       ──────                           ───────
1     Cajero      Inicia sesión                    POS valida credenciales
2     POS         Verifica caja asignada           BD local
3     Cajero      Declara fondo de caja            POS registra monto inicial
4     POS         Registra apertura                BD local + log de auditoría
5     POS         Habilita operaciones de venta    Terminal listo para operar
```

### 4.5 Flujo: Cierre de Caja (Corte Z)

```
PASO  ACTOR       ACCIÓN                           SISTEMA
────  ─────       ──────                           ───────
1     Cajero      Selecciona "Cierre de Caja"      POS inicia proceso de cierre
2     POS         Calcula totales del turno:        BD local
                  - Total ventas efectivo
                  - Total ventas tarjeta
                  - Total devoluciones
                  - Total descuentos
                  - Fondo de caja
3     Cajero      Cuenta efectivo en caja           POS registra conteo
4     POS         Calcula diferencia                Esperado vs. Contado
5     Cajero      Justifica diferencia (si hay)     POS registra comentario
6     Supervisor  Autoriza cierre (si diferencia)   POS valida permisos
7     POS         Genera reporte de cierre          PDF + impresión
8     POS         Envía cierre al backend           API → SAP B1 + Jonas
9     POS         Bloquea terminal                  Hasta próxima apertura
```

### 4.6 Flujo: Sincronización de Catálogo

```
PASO  SISTEMA     ACCIÓN                           DETALLE
────  ───────     ──────                           ───────
1     Scheduler   Dispara sync cada 10 min         Cron job
2     Sync Engine Lee artículos de SAP B1          GET /b1s/v1/Items?$filter=UpdateDate ge '...'
3     Sync Engine Lee artículos de Jonas           SELECT FROM vw_POS_Items WHERE modified > ...
4     Sync Engine Compara y resuelve conflictos    SAP B1 = fuente de verdad
5     Sync Engine Actualiza caché Redis            SET pos:items:{code} {json}
6     Sync Engine Registra log de sync             BD local
7     POS         Detecta cambios en caché         Notificación vía WebSocket o polling
```

---

## 5. MODELO DE DATOS DEL POS (BASE DE DATOS LOCAL)

### 5.1 Tablas Principales

```sql
-- ============================================
-- CONFIGURACIÓN
-- ============================================

CREATE TABLE pos_stores (
    id              UUID PRIMARY KEY,
    code            VARCHAR(20) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    address         TEXT,
    phone           VARCHAR(20),
    tax_id          VARCHAR(20),        -- RFC
    sap_warehouse   VARCHAR(20),        -- Código almacén SAP B1
    jonas_branch    VARCHAR(20),        -- Código sucursal Jonas
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_terminals (
    id              UUID PRIMARY KEY,
    store_id        UUID REFERENCES pos_stores(id),
    terminal_number INTEGER NOT NULL,
    name            VARCHAR(50),
    printer_config  JSONB,              -- Config impresora
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_users (
    id              UUID PRIMARY KEY,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    full_name       VARCHAR(100) NOT NULL,
    role            VARCHAR(20) NOT NULL,  -- 'cashier', 'supervisor', 'admin'
    pin             VARCHAR(10),           -- PIN rápido para autorizaciones
    sap_user_code   INTEGER,               -- Código vendedor en SAP B1
    store_id        UUID REFERENCES pos_stores(id),
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CATÁLOGO (CACHÉ DE SAP B1 / JONAS)
-- ============================================

CREATE TABLE pos_items (
    id              UUID PRIMARY KEY,
    item_code       VARCHAR(50) UNIQUE NOT NULL,  -- Código SAP B1
    barcode         VARCHAR(50),
    name            VARCHAR(200) NOT NULL,
    description     TEXT,
    category_code   VARCHAR(50),
    category_name   VARCHAR(100),
    unit_price      DECIMAL(18,6) NOT NULL,
    tax_code        VARCHAR(20),
    tax_rate        DECIMAL(5,2),
    unit_of_measure VARCHAR(20),
    track_inventory BOOLEAN DEFAULT true,
    stock_quantity  DECIMAL(18,6) DEFAULT 0,
    min_stock       DECIMAL(18,6) DEFAULT 0,
    image_url       VARCHAR(500),
    sap_item_code   VARCHAR(50),          -- Referencia SAP B1
    jonas_item_id   VARCHAR(50),          -- Referencia Jonas
    sat_product_key VARCHAR(10),          -- Clave SAT producto/servicio
    sat_unit_key    VARCHAR(10),          -- Clave SAT unidad
    is_active       BOOLEAN DEFAULT true,
    synced_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_customers (
    id              UUID PRIMARY KEY,
    customer_code   VARCHAR(50) UNIQUE NOT NULL,  -- Código SAP B1
    name            VARCHAR(200) NOT NULL,
    tax_id          VARCHAR(20),          -- RFC
    email           VARCHAR(200),
    phone           VARCHAR(20),
    address         TEXT,
    tax_regime      VARCHAR(10),          -- Régimen fiscal SAT
    cfdi_use        VARCHAR(10),          -- Uso CFDI SAT
    payment_terms   VARCHAR(20),
    credit_limit    DECIMAL(18,2),
    balance         DECIMAL(18,2),
    sap_bp_code     VARCHAR(50),          -- CardCode SAP B1
    jonas_customer_id VARCHAR(50),        -- ID Jonas
    is_active       BOOLEAN DEFAULT true,
    synced_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_price_lists (
    id              UUID PRIMARY KEY,
    list_code       VARCHAR(20) NOT NULL,
    list_name       VARCHAR(100),
    item_code       VARCHAR(50) NOT NULL,
    price           DECIMAL(18,6) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'MXN',
    valid_from      DATE,
    valid_to        DATE,
    sap_price_list  INTEGER,
    synced_at       TIMESTAMPTZ,
    UNIQUE(list_code, item_code)
);

-- ============================================
-- TRANSACCIONES DE VENTA
-- ============================================

CREATE TABLE pos_cash_sessions (
    id              UUID PRIMARY KEY,
    terminal_id     UUID REFERENCES pos_terminals(id),
    user_id         UUID REFERENCES pos_users(id),
    store_id        UUID REFERENCES pos_stores(id),
    opening_amount  DECIMAL(18,2) NOT NULL,
    closing_amount  DECIMAL(18,2),
    expected_amount DECIMAL(18,2),
    difference      DECIMAL(18,2),
    status          VARCHAR(20) DEFAULT 'open',  -- 'open', 'closed'
    opened_at       TIMESTAMPTZ DEFAULT NOW(),
    closed_at       TIMESTAMPTZ,
    notes           TEXT
);

CREATE TABLE pos_sales (
    id              UUID PRIMARY KEY,
    sale_number     SERIAL,                       -- Número consecutivo
    ticket_number   VARCHAR(20) UNIQUE NOT NULL,  -- Folio de ticket
    terminal_id     UUID REFERENCES pos_terminals(id),
    user_id         UUID REFERENCES pos_users(id),
    cash_session_id UUID REFERENCES pos_cash_sessions(id),
    customer_id     UUID REFERENCES pos_customers(id),
    sale_type       VARCHAR(20) DEFAULT 'sale',   -- 'sale', 'return', 'void'
    subtotal        DECIMAL(18,2) NOT NULL,
    tax_amount      DECIMAL(18,2) NOT NULL,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    total           DECIMAL(18,2) NOT NULL,
    status          VARCHAR(20) DEFAULT 'completed', -- 'pending','completed','voided','synced'
    sap_doc_entry   INTEGER,                      -- DocEntry de factura SAP B1
    sap_doc_num     INTEGER,                      -- DocNum de factura SAP B1
    jonas_invoice_id VARCHAR(50),                  -- ID factura Jonas
    cfdi_uuid       VARCHAR(50),                  -- UUID del CFDI
    cfdi_status     VARCHAR(20),                  -- 'pending','stamped','cancelled'
    original_sale_id UUID,                        -- Para devoluciones
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    synced_at       TIMESTAMPTZ
);

CREATE TABLE pos_sale_items (
    id              UUID PRIMARY KEY,
    sale_id         UUID REFERENCES pos_sales(id),
    item_id         UUID REFERENCES pos_items(id),
    item_code       VARCHAR(50) NOT NULL,
    item_name       VARCHAR(200) NOT NULL,
    quantity        DECIMAL(18,6) NOT NULL,
    unit_price      DECIMAL(18,6) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(18,2) DEFAULT 0,
    tax_code        VARCHAR(20),
    tax_rate        DECIMAL(5,2),
    tax_amount      DECIMAL(18,2),
    line_total      DECIMAL(18,2) NOT NULL,
    warehouse_code  VARCHAR(20),
    serial_number   VARCHAR(50),
    batch_number    VARCHAR(50),
    notes           TEXT
);

CREATE TABLE pos_payments (
    id              UUID PRIMARY KEY,
    sale_id         UUID REFERENCES pos_sales(id),
    payment_method  VARCHAR(20) NOT NULL,  -- 'cash','credit_card','debit_card','transfer','voucher'
    amount          DECIMAL(18,2) NOT NULL,
    reference       VARCHAR(100),          -- # autorización, # transferencia, etc.
    card_type       VARCHAR(20),           -- 'visa','mastercard','amex'
    card_last_four  VARCHAR(4),
    auth_code       VARCHAR(50),
    change_amount   DECIMAL(18,2) DEFAULT 0,
    sap_payment_entry INTEGER,             -- DocEntry pago SAP B1
    sat_payment_form VARCHAR(2),           -- Forma de pago SAT (01,04,28,etc.)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SINCRONIZACIÓN Y AUDITORÍA
-- ============================================

CREATE TABLE pos_sync_queue (
    id              UUID PRIMARY KEY,
    entity_type     VARCHAR(50) NOT NULL,  -- 'invoice','payment','credit_note'
    entity_id       UUID NOT NULL,
    target_system   VARCHAR(20) NOT NULL,  -- 'sap_b1', 'jonas'
    payload         JSONB NOT NULL,
    status          VARCHAR(20) DEFAULT 'pending', -- 'pending','processing','completed','failed'
    attempts        INTEGER DEFAULT 0,
    max_attempts    INTEGER DEFAULT 5,
    last_error      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    processed_at    TIMESTAMPTZ,
    next_retry_at   TIMESTAMPTZ
);

CREATE TABLE pos_audit_log (
    id              UUID PRIMARY KEY,
    user_id         UUID,
    terminal_id     UUID,
    action          VARCHAR(50) NOT NULL,  -- 'login','sale','return','void','price_override','discount'
    entity_type     VARCHAR(50),
    entity_id       UUID,
    details         JSONB,
    ip_address      VARCHAR(45),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE pos_sync_log (
    id              UUID PRIMARY KEY,
    sync_type       VARCHAR(50) NOT NULL,  -- 'items','customers','prices','stock'
    source_system   VARCHAR(20) NOT NULL,  -- 'sap_b1', 'jonas'
    records_read    INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    records_failed  INTEGER DEFAULT 0,
    duration_ms     INTEGER,
    status          VARCHAR(20),           -- 'success','partial','failed'
    error_details   TEXT,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ
);
```

---

## 6. PLAN DE FASES DE IMPLEMENTACIÓN

### FASE 0: PREPARACIÓN (Semanas 1-3)
**Objetivo**: Asegurar acceso y entendimiento de ambos sistemas

| # | Tarea | Responsable | Duración | Dependencia |
|---|-------|-------------|----------|-------------|
| 0.1 | Contactar Jonas: solicitar acceso BD y documentación | PM | 1 sem | - |
| 0.2 | Obtener credenciales Service Layer SAP B1 | Admin SAP | 1 sem | - |
| 0.3 | Configurar ambiente de desarrollo SAP B1 (sandbox) | Admin SAP | 1 sem | 0.2 |
| 0.4 | Mapear esquema de BD Jonas (tablas, relaciones) | DBA | 2 sem | 0.1 |
| 0.5 | Documentar flujo de ventas actual (AS-IS) | Analista | 1 sem | - |
| 0.6 | Definir flujo de ventas deseado (TO-BE) | Analista + Negocio | 1 sem | 0.5 |
| 0.7 | Validar requisitos fiscales (CFDI, SAT) | Contador | 1 sem | - |
| 0.8 | Seleccionar PAC para timbrado CFDI | PM + Contador | 1 sem | 0.7 |

**Entregables Fase 0:**
- Acceso confirmado a Jonas BD
- Ambiente sandbox SAP B1 funcional
- Documento de mapeo de BD Jonas
- Documento de flujos AS-IS y TO-BE
- Requisitos fiscales documentados
- PAC seleccionado

### FASE 1: INFRAESTRUCTURA Y CONECTORES (Semanas 4-7)
**Objetivo**: Establecer la base técnica y conectividad

| # | Tarea | Responsable | Duración | Dependencia |
|---|-------|-------------|----------|-------------|
| 1.1 | Setup proyecto (monorepo, CI/CD, Docker) | DevOps | 1 sem | - |
| 1.2 | Diseñar e implementar BD del POS (PostgreSQL) | Backend | 1 sem | - |
| 1.3 | Implementar conector SAP B1 Service Layer | Backend | 2 sem | 0.3 |
| 1.4 | Implementar conector Jonas (SQL Direct) | Backend | 2 sem | 0.4 |
| 1.5 | Implementar cola de mensajes (Redis/RabbitMQ) | Backend | 1 sem | 1.1 |
| 1.6 | Implementar motor de sincronización | Backend | 2 sem | 1.3, 1.4 |
| 1.7 | Tests de integración conectores | QA | 1 sem | 1.3, 1.4 |

**Entregables Fase 1:**
- Repositorio configurado con CI/CD
- BD POS creada con migraciones
- Conector SAP B1 funcional (CRUD básico)
- Conector Jonas funcional (lectura + staging)
- Cola de mensajes operativa
- Sincronización básica de catálogo funcionando

### FASE 2: BACKEND API CORE (Semanas 8-11)
**Objetivo**: API completa del POS

| # | Tarea | Responsable | Duración | Dependencia |
|---|-------|-------------|----------|-------------|
| 2.1 | API de autenticación (JWT + roles) | Backend | 1 sem | 1.1 |
| 2.2 | API de catálogo (productos, precios, stock) | Backend | 1 sem | 1.6 |
| 2.3 | API de clientes | Backend | 1 sem | 1.6 |
| 2.4 | API de ventas (crear, consultar, anular) | Backend | 2 sem | 1.5 |
| 2.5 | API de pagos (efectivo, tarjeta, mixto) | Backend | 1 sem | 2.4 |
| 2.6 | API de devoluciones y notas de crédito | Backend | 1 sem | 2.4 |
| 2.7 | API de caja (apertura, cierre, cortes) | Backend | 1 sem | 2.4 |
| 2.8 | API de reportes | Backend | 1 sem | 2.4 |
| 2.9 | Documentación OpenAPI/Swagger | Backend | Continuo | - |
| 2.10 | Tests unitarios y de integración | QA | Continuo | - |

**Entregables Fase 2:**
- API REST completa documentada con Swagger
- Todos los flujos de negocio implementados
- Cobertura de tests > 80%

### FASE 3: FRONTEND POS (Semanas 10-15)
**Objetivo**: Interfaz de usuario del terminal POS
*(Inicia en paralelo con Fase 2)*

| # | Tarea | Responsable | Duración | Dependencia |
|---|-------|-------------|----------|-------------|
| 3.1 | Diseño UI/UX del POS (wireframes + mockups) | Diseñador | 2 sem | 0.6 |
| 3.2 | Setup proyecto React + TypeScript | Frontend | 1 sem | - |
| 3.3 | Pantalla de login | Frontend | 0.5 sem | 3.1, 2.1 |
| 3.4 | Pantalla principal de venta (carrito) | Frontend | 2 sem | 3.1 |
| 3.5 | Búsqueda de productos (barcode + texto) | Frontend | 1 sem | 3.4, 2.2 |
| 3.6 | Pantalla de cobro (métodos de pago) | Frontend | 1.5 sem | 3.4, 2.5 |
| 3.7 | Pantalla de devoluciones | Frontend | 1 sem | 3.4, 2.6 |
| 3.8 | Pantalla de apertura/cierre de caja | Frontend | 1 sem | 2.7 |
| 3.9 | Panel de reportes/dashboard | Frontend | 1.5 sem | 2.8 |
| 3.10 | Modo offline (IndexedDB + sync) | Frontend | 2 sem | 3.4 |
| 3.11 | Integración con impresora térmica | Frontend | 1 sem | 3.6 |
| 3.12 | Integración con lector de barras | Frontend | 0.5 sem | 3.5 |

**Entregables Fase 3:**
- Aplicación POS funcional completa
- Modo offline operativo
- Impresión de tickets
- Lectura de códigos de barras

### FASE 4: INTEGRACIÓN FISCAL (Semanas 14-16)
**Objetivo**: Cumplimiento fiscal mexicano

| # | Tarea | Responsable | Duración | Dependencia |
|---|-------|-------------|----------|-------------|
| 4.1 | Integración con PAC (timbrado CFDI) | Backend | 2 sem | 0.8, 2.4 |
| 4.2 | Generación de XML CFDI 4.0 | Backend | 1 sem | 4.1 |
| 4.3 | Complemento de pago (REP) | Backend | 1 sem | 4.1 |
| 4.4 | Cancelación de CFDI | Backend | 0.5 sem | 4.1 |
| 4.5 | Validación con contador | Contador | 1 sem | 4.1-4.4 |

**Entregables Fase 4:**
- Timbrado CFDI funcional
- Complementos de pago
- Cancelación de CFDI
- Validación contable aprobada

### FASE 5: PRUEBAS INTEGRALES (Semanas 17-19)
**Objetivo**: Validar todo el sistema end-to-end

| # | Tarea | Responsable | Duración | Dependencia |
|---|-------|-------------|----------|-------------|
| 5.1 | Pruebas end-to-end (POS → SAP B1 → Jonas) | QA | 2 sem | Fases 1-4 |
| 5.2 | Pruebas de carga y rendimiento | QA | 1 sem | 5.1 |
| 5.3 | Pruebas de modo offline y reconexión | QA | 1 sem | 5.1 |
| 5.4 | Pruebas de conciliación contable | Contador | 1 sem | 5.1 |
| 5.5 | Pruebas de usuario (UAT) | Usuarios | 1 sem | 5.1-5.4 |
| 5.6 | Corrección de bugs | Dev Team | 1 sem | 5.5 |

### FASE 6: DESPLIEGUE Y GO-LIVE (Semanas 20-22)
**Objetivo**: Puesta en producción

| # | Tarea | Responsable | Duración | Dependencia |
|---|-------|-------------|----------|-------------|
| 6.1 | Preparar ambiente de producción | DevOps | 1 sem | - |
| 6.2 | Migración de datos iniciales | DBA | 1 sem | 6.1 |
| 6.3 | Capacitación de usuarios | PM | 1 sem | 5.5 |
| 6.4 | Go-live piloto (1 terminal) | Todo el equipo | 1 sem | 6.1-6.3 |
| 6.5 | Monitoreo intensivo | Dev Team | 2 sem | 6.4 |
| 6.6 | Rollout completo (todos los terminales) | PM | 1 sem | 6.5 |

### Resumen de Timeline

```
Sem  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19 20 21 22
     ├──FASE 0──┤
                 ├─────FASE 1─────┤
                                   ├─────FASE 2──────┤
                              ├──────────FASE 3──────────────┤
                                                  ├──FASE 4──┤
                                                              ├──FASE 5──┤
                                                                          ├─FASE 6─┤
```

**Duración total estimada: 22 semanas (~5.5 meses)**

---

## 7. BUENAS PRÁCTICAS CONTABLES Y ADMINISTRATIVAS

### 7.1 Principios Contables (NIF/GAAP)

| Principio | Aplicación en POS |
|-----------|-------------------|
| **Entidad** | Cada tienda/sucursal es una unidad contable identificable |
| **Negocio en marcha** | Sistema diseñado para operación continua |
| **Periodo contable** | Cortes diarios, mensuales, anuales |
| **Devengado** | Ingresos se registran al momento de la venta |
| **Valor histórico** | Precios registrados al momento de la transacción |
| **Dualidad económica** | Cada venta genera asiento doble (débito/crédito) |
| **Consistencia** | Mismas políticas contables en todos los terminales |
| **Revelación suficiente** | Reportes detallados de todas las operaciones |
| **Importancia relativa** | Redondeo y manejo de centavos consistente |
| **Comparabilidad** | Reportes estandarizados entre periodos |

### 7.2 Controles Internos

| Control | Implementación |
|---------|----------------|
| **Segregación de funciones** | Cajero ≠ Supervisor ≠ Admin |
| **Autorización** | Descuentos > X% requieren supervisor |
| **Custodia** | Fondo de caja asignado por persona |
| **Registro** | Toda transacción queda en log inmutable |
| **Conciliación** | Cierre de caja diario obligatorio |
| **Auditoría** | Trail completo de quién hizo qué y cuándo |
| **Límites** | Montos máximos por transacción/descuento |
| **Anulaciones** | Requieren autorización y justificación |

### 7.3 Políticas de Descuento

```
Nivel 1: Cajero       → Hasta 5% de descuento
Nivel 2: Supervisor   → Hasta 15% de descuento
Nivel 3: Gerente      → Hasta 30% de descuento
Nivel 4: Director     → Sin límite (con justificación)
```

### 7.4 Manejo de Efectivo

- **Fondo de caja fijo** por terminal
- **Retiros parciales** cuando el efectivo excede un monto
- **Cierre de caja** obligatorio al final de cada turno
- **Diferencias** documentadas y autorizadas
- **Depósitos bancarios** registrados y conciliados

### 7.5 Conciliación Diaria

```
REPORTE DE CONCILIACIÓN DIARIA
═══════════════════════════════
Fecha: 2026-02-18
Terminal: POS-01
Cajero: Juan Pérez

VENTAS:
  Efectivo:           $15,230.00
  Tarjeta Crédito:     $8,450.00
  Tarjeta Débito:      $3,200.00
  Transferencia:       $1,500.00
  ─────────────────────────────
  Total Ventas:       $28,380.00

DEVOLUCIONES:
  Efectivo:              $450.00
  Tarjeta:               $200.00
  ─────────────────────────────
  Total Devoluciones:    $650.00

NETO:                 $27,730.00

CAJA:
  Fondo inicial:       $3,000.00
  + Cobros efectivo:  $15,230.00
  - Devoluciones ef.:    $450.00
  - Retiros:           $5,000.00
  ─────────────────────────────
  Esperado en caja:   $12,780.00
  Contado en caja:    $12,775.00
  Diferencia:             -$5.00

ESTADO: ✓ Dentro de tolerancia ($10.00)
```

---

## 8. SEGURIDAD Y CUMPLIMIENTO

### 8.1 Seguridad de la Aplicación

| Capa | Medida | Detalle |
|------|--------|---------|
| **Red** | HTTPS/TLS 1.3 | Todo el tráfico encriptado |
| **Red** | Firewall | Solo puertos necesarios abiertos |
| **Red** | VPN | Para acceso remoto a SAP/Jonas |
| **Auth** | JWT + Refresh | Tokens con expiración corta (15 min) |
| **Auth** | Bcrypt | Passwords hasheados con salt |
| **Auth** | 2FA | Para operaciones sensibles (admin) |
| **Auth** | PIN | Para autorizaciones rápidas en POS |
| **API** | Rate Limiting | Máximo requests por minuto |
| **API** | Input Validation | Zod/Joi en todos los endpoints |
| **API** | SQL Injection | ORM + Prepared Statements |
| **API** | XSS | Sanitización de inputs |
| **Datos** | Encryption at rest | BD encriptada |
| **Datos** | PCI DSS | No almacenar datos completos de tarjeta |
| **Audit** | Logs inmutables | Append-only audit trail |

### 8.2 Cumplimiento PCI DSS (Tarjetas)

**El POS NO debe almacenar:**
- Número completo de tarjeta
- CVV/CVC
- PIN de tarjeta
- Datos de banda magnética

**El POS SÍ puede almacenar:**
- Últimos 4 dígitos (para referencia)
- Código de autorización
- Tipo de tarjeta (Visa, MC, etc.)
- Monto de la transacción

### 8.3 Cumplimiento Fiscal (SAT México)

| Requisito | Implementación |
|-----------|----------------|
| **CFDI 4.0** | Generación automática post-venta |
| **Timbrado** | Integración con PAC certificado |
| **Cancelación** | Proceso de cancelación con motivo |
| **Complemento de pago** | Para pagos diferidos (PPD) |
| **Retenciones** | Cálculo automático según régimen |
| **Addenda** | Soporte para addendas de clientes |
| **Almacenamiento** | XMLs guardados 5 años mínimo |

---

## 9. PRUEBAS Y CALIDAD

### 9.1 Estrategia de Testing

| Tipo | Herramienta | Cobertura Mínima |
|------|-------------|------------------|
| **Unit Tests** | Jest / xUnit | 80% |
| **Integration Tests** | Supertest / TestContainers | Todos los endpoints |
| **E2E Tests** | Playwright / Cypress | Flujos principales |
| **Load Tests** | k6 / Artillery | 100 transacciones/min |
| **Security Tests** | OWASP ZAP | Sin vulnerabilidades críticas |

### 9.2 Escenarios de Prueba Críticos

1. Venta simple con efectivo → Verificar factura en SAP B1 + Jonas
2. Venta con tarjeta → Verificar pago en SAP B1
3. Venta mixta (efectivo + tarjeta) → Verificar ambos pagos
4. Devolución total → Verificar nota de crédito en SAP B1
5. Devolución parcial → Verificar montos correctos
6. Cierre de caja → Verificar conciliación
7. Modo offline → Vender sin conexión y sincronizar después
8. Concurrencia → Múltiples terminales vendiendo simultáneamente
9. Fallo de red durante venta → Recuperación sin pérdida de datos
10. Timbrado CFDI → Verificar XML válido ante SAT

---

## 10. OPERACIÓN Y MANTENIMIENTO

### 10.1 Monitoreo

| Métrica | Umbral Alerta | Umbral Crítico |
|---------|---------------|----------------|
| Tiempo respuesta API | > 500ms | > 2000ms |
| Cola de sincronización | > 50 items | > 200 items |
| Errores de sync | > 5/hora | > 20/hora |
| Uso de CPU servidor | > 70% | > 90% |
| Uso de disco | > 70% | > 90% |
| Sesiones SAP B1 activas | > 80% del máximo | > 95% |

### 10.2 Backup y Recuperación

| Componente | Frecuencia | Retención | RPO | RTO |
|------------|------------|-----------|-----|-----|
| BD POS | Cada 1 hora | 30 días | 1 hora | 2 horas |
| BD POS (full) | Diario | 1 año | 24 horas | 4 horas |
| Configuración | Cada cambio | Indefinido | 0 | 1 hora |
| Logs | Diario | 1 año | 24 horas | N/A |
| XMLs CFDI | Diario | 5 años+ | 24 horas | 24 horas |

### 10.3 Plan de Contingencia

| Escenario | Acción |
|-----------|--------|
| SAP B1 caído | POS opera en modo offline, cola acumula transacciones |
| Jonas caído | POS opera normal, sync a Jonas se pausa |
| Internet caído | POS opera offline, sync cuando se restaure |
| BD POS caída | Restaurar último backup, reprocesar cola |
| Terminal POS falla | Cambiar a terminal de respaldo |
| Impresora falla | Reimpresión desde otro terminal |

---

## APÉNDICE A: PREGUNTAS PENDIENTES PARA EL NEGOCIO

1. **¿Cuál es el producto exacto de Jonas que se utiliza?** (Enterprise, Premier, otro)
2. **¿Cuál es la versión de Jonas instalada?**
3. **¿Se tiene acceso a la base de datos de Jonas?**
4. **¿Cuál es la fuente de verdad principal: SAP B1 o Jonas?**
5. **¿Cuántos terminales POS se necesitan inicialmente?**
6. **¿Cuántas sucursales/tiendas?**
7. **¿Se requiere facturación CFDI en el POS o se hace después?**
8. **¿Qué PAC se utiliza actualmente (si hay)?**
9. **¿Se manejan números de serie o lotes?**
10. **¿Se requiere manejo de múltiples monedas?**
11. **¿Cuáles son los métodos de pago aceptados?**
12. **¿Se requiere programa de lealtad/puntos?**
13. **¿Se necesita integración con terminal bancaria? ¿Cuál?**
14. **¿Cuál es el volumen estimado de transacciones diarias?**
15. **¿Se requiere modo offline?**

---

## APÉNDICE B: EQUIPO RECOMENDADO

| Rol | Cantidad | Dedicación |
|-----|----------|------------|
| Project Manager | 1 | 100% |
| Arquitecto / Tech Lead | 1 | 100% |
| Backend Developer (Sr) | 2 | 100% |
| Frontend Developer (Sr) | 1 | 100% |
| DBA / DevOps | 1 | 50% |
| QA Engineer | 1 | 100% |
| Consultor SAP B1 | 1 | 50% |
| Consultor Jonas | 1 | 25% (o según disponibilidad) |
| Contador / Fiscal | 1 | 25% |
| Diseñador UI/UX | 1 | 50% (Fases 0-3) |

---

*Documento preparado como base de investigación y planificación. Debe ser validado y ajustado con el equipo de negocio y técnico antes de iniciar la implementación.*
