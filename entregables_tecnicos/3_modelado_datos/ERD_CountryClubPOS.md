# ERD - Country Club POS

## Diagrama de Entidades-Relaciones

```mermaid
erDiagram
    %% Usuarios y Autenticación
    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : assigned
    
    %% Estructura Operativa
    AREA ||--o{ TERMINAL : contains
    TERMINAL ||--o{ SHIFT : opens
    SHIFT ||--o{ CASH_MOVEMENT : records
    SHIFT ||--o{ SALE : contains
    
    %% Socios y Cuentas
    MEMBER ||--o{ MEMBER_ACCOUNT : owns
    MEMBER_ACCOUNT ||--o{ ACCOUNT_CHARGE : has
    MEMBER ||--o{ SALE : charged_to
    
    %% Productos e Inventario
    PRODUCT ||--o{ SALE_LINE : sold_as
    PRODUCT ||--o{ INVENTORY_MOVEMENT : moves
    PRODUCT_CATEGORY ||--o{ PRODUCT : categorizes
    
    %% Ventas y Pagos
    SALE ||--o{ SALE_LINE : contains
    SALE ||--o{ PAYMENT : paid_by
    SALE ||--o{ ACCOUNT_CHARGE : generates
    SALE ||--o{ DISCOUNT : applies
    
    %% Comandas
    SALE ||--o{ ORDER_TICKET : creates
    ORDER_TICKET ||--o{ ORDER_TICKET_LINE : contains
    KITCHEN_STATION ||--o{ ORDER_TICKET : receives
    
    %% Auditoría y Sistema
    USER ||--o{ AUDIT_EVENT : performs
    TERMINAL ||--o{ AUDIT_EVENT : occurs_at
    SALE ||--o{ AUDIT_EVENT : audits
    SHIFT ||--o{ AUDIT_EVENT : audits
    
    %% Sincronización
    IDEMPOTENCY_KEY ||--o{ SYNC_EVENT : prevents_duplicates
    
    USER {
        uuid id PK
        string username UK
        string password_hash
        string email UK
        string first_name
        string last_name
        boolean active
        datetime created_at
        datetime updated_at
        datetime last_login_at
        string created_by
        string updated_by
    }
    
    ROLE {
        uuid id PK
        string name UK
        string description
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    USER_ROLE {
        uuid user_id FK
        uuid role_id FK
        datetime assigned_at
        string assigned_by
    }
    
    AREA {
        uuid id PK
        string code UK
        string name
        string description
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    TERMINAL {
        uuid id PK
        string code UK
        string name
        uuid area_id FK
        string location
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    SHIFT {
        uuid id PK
        uuid terminal_id FK
        uuid opened_by_user_id FK
        uuid closed_by_user_id FK
        enum status
        decimal opening_float
        decimal closing_float
        datetime opened_at
        datetime closed_at
        string notes
    }
    
    CASH_MOVEMENT {
        uuid id PK
        uuid shift_id FK
        uuid created_by_user_id FK
        enum type
        decimal amount
        string reason
        string reference
        datetime created_at
    }
    
    MEMBER {
        uuid id PK
        string member_number UK
        string first_name
        string last_name
        string email
        string phone
        enum status
        date join_date
        date birth_date
        datetime created_at
        datetime updated_at
    }
    
    MEMBER_ACCOUNT {
        uuid id PK
        uuid member_id FK
        string name
        enum type
        decimal credit_limit
        decimal current_balance
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    ACCOUNT_CHARGE {
        uuid id PK
        uuid member_account_id FK
        uuid sale_id FK
        decimal amount
        string description
        enum status
        uuid authorized_by_user_id FK
        datetime authorized_at
        datetime created_at
    }
    
    PRODUCT_CATEGORY {
        uuid id PK
        string name UK
        string description
        uuid parent_category_id FK
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    PRODUCT {
        uuid id PK
        string sku UK
        string name
        string description
        uuid category_id FK
        decimal price
        decimal cost
        decimal tax_rate
        boolean track_inventory
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    INVENTORY_MOVEMENT {
        uuid id PK
        uuid product_id FK
        uuid shift_id FK
        uuid created_by_user_id FK
        enum type
        decimal quantity
        decimal unit_cost
        string reason
        string reference
        datetime created_at
    }
    
    SALE {
        uuid id PK
        string folio
        uuid terminal_id FK
        uuid shift_id FK
        uuid member_id FK
        uuid created_by_user_id FK
        enum status
        decimal subtotal
        decimal tax_amount
        decimal discount_amount
        decimal total_amount
        decimal tip_amount
        string notes
        datetime created_at
        datetime updated_at
        datetime paid_at
        datetime voided_at
        string void_reason
        uuid voided_by_user_id FK
    }
    
    SALE_LINE {
        uuid id PK
        uuid sale_id FK
        uuid product_id FK
        decimal quantity
        decimal unit_price
        decimal tax_rate
        decimal line_total
        json modifiers
        string notes
        datetime created_at
        datetime updated_at
    }
    
    PAYMENT {
        uuid id PK
        uuid sale_id FK
        enum method
        decimal amount
        string reference
        string authorization_code
        enum status
        datetime captured_at
        datetime created_at
        datetime updated_at
    }
    
    DISCOUNT {
        uuid id PK
        uuid sale_id FK
        uuid created_by_user_id FK
        enum type
        decimal amount
        decimal percentage
        string reason
        uuid approved_by_user_id FK
        datetime approved_at
        datetime created_at
    }
    
    ORDER_TICKET {
        uuid id PK
        uuid sale_id FK
        uuid kitchen_station_id FK
        enum status
        string notes
        datetime created_at
        datetime started_at
        datetime completed_at
        uuid completed_by_user_id FK
    }
    
    ORDER_TICKET_LINE {
        uuid id PK
        uuid order_ticket_id FK
        uuid sale_line_id FK
        decimal quantity
        string notes
        enum status
        datetime created_at
        datetime updated_at
    }
    
    KITCHEN_STATION {
        uuid id PK
        string name UK
        string description
        boolean active
        datetime created_at
        datetime updated_at
    }
    
    AUDIT_EVENT {
        uuid id PK
        datetime at
        string action
        string entity_type
        uuid entity_id
        uuid actor_user_id FK
        uuid terminal_id FK
        json payload
        string prev_hash
        string hash
        string ip_address
        string user_agent
    }
    
    SYNC_EVENT {
        uuid id PK
        uuid idempotency_key_id FK
        string event_type
        json payload
        enum status
        int attempts
        datetime next_attempt_at
        datetime created_at
        datetime processed_at
        string error_message
    }
    
    IDEMPOTENCY_KEY {
        uuid id PK
        string key
        string scope
        datetime created_at
        datetime expires_at
    }
```

## Estados Definidos

### Estados de Venta (Sale.status)
- `DRAFT` - En creación
- `HELD` - Guardado temporalmente
- `SENT_TO_KITCHEN` - Enviado a cocina
- `PAID` - Pagado
- `VOIDED` - Cancelado
- `REFUNDED` - Devuelto

### Estados de Pago (Payment.status)
- `PENDING` - Pendiente de captura
- `CAPTURED` - Capturado exitosamente
- `FAILED` - Falló la captura
- `REFUNDED` - Devuelto

### Estados de Turno (Shift.status)
- `OPEN` - Abierto
- `CLOSED` - Cerrado

### Estados de Socio (Member.status)
- `ACTIVE` - Activo
- `INACTIVE` - Inactivo
- `SUSPENDED` - Suspendido

### Tipos de Movimiento de Efectivo (CashMovement.type)
- `CASH_IN` - Entrada de efectivo
- `CASH_OUT` - Salida de efectivo
- `SAFE_DROP` - Depósito en caja fuerte
- `BANK_DEPOSIT` - Depósito bancario

### Métodos de Pago (Payment.method)
- `CASH` - Efectivo
- `CARD` - Tarjeta
- `MEMBER_CHARGE` - Cargo a socio
- `MIXED` - Mixto

## Convenciones de Nomenclatura

### Tablas
- Nombres en plural y mayúsculas: `USERS`, `SALES`, `PRODUCTS`
- Separación con guion bajo: `CASH_MOVEMENTS`, `ORDER_TICKETS`

### Campos
- `id` como UUID primary key
- Foreign keys: `table_name_id` (ej: `user_id`, `sale_id`)
- Timestamps: `created_at`, `updated_at`
- Booleanos: prefijo `is_` o `has_` (ej: `is_active`, `has_inventory`)
- Enums: nombre descriptivo en minúsculas

### Índices
- Primary key en todas las tablas
- Foreign keys indexados
- Campos de búsqueda frecuentes indexados
- Timestamps para consultas por rango de fechas

## Relaciones Principales

1. **Usuario ↔ Rol**: Muchos a muchos através de `USER_ROLE`
2. **Terminal ↔ Turno**: Uno a muchos
3. **Turno ↔ Venta**: Uno a muchos
4. **Venta ↔ Líneas de Venta**: Uno a muchos
5. **Venta ↔ Pagos**: Uno a muchos
6. **Socio ↔ Cuentas**: Uno a muchos
7. **Producto ↔ Movimientos de Inventario**: Uno a muchos
8. **Venta ↔ Eventos de Auditoría**: Uno a muchos

## Campos Críticos de Auditoría

- **Timestamps**: `created_at`, `updated_at` en todas las tablas
- **Soft Delete**: Campo `deleted_at` en tablas principales (no mostrado en ERD para simplicidad)
- **Audit Trail**: Tabla `AUDIT_EVENT` con hash encadenado
- **User Tracking**: `created_by`, `updated_by` en tablas críticas
- **Idempotency**: `IDEMPOTENCY_KEY` para sincronización offline
