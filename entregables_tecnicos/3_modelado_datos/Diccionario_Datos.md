# Diccionario de Datos - Country Club POS

## Convenciones Generales

- **IDs**: UUID v4 (string de 36 caracteres)
- **Timestamps**: ISO 8601 UTC (YYYY-MM-DDTHH:mm:ss.sssZ)
- **Decimales**: Precisión monetaria (10,2) para montos, (8,4) para tasas
- **Strings**: UTF-8, trim automático en entrada
- **Booleanos**: true/false, con valor por defecto definido
- **Enums**: Case-sensitive, valores en mayúsculas

---

## Tabla: USERS

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único del usuario | |
| username | VARCHAR(50) | NO | | | Nombre de usuario para login | Único, alfanumérico, min 3 chars |
| password_hash | VARCHAR(255) | NO | | | Hash de contraseña (bcrypt) | Mínimo 60 chars |
| email | VARCHAR(255) | NO | | | Correo electrónico | Único, formato email válido |
| first_name | VARCHAR(100) | NO | | | Nombre del usuario | |
| last_name | VARCHAR(100) | NO | | | Apellido del usuario | |
| active | BOOLEAN | NO | | true | Usuario activo/inactivo | |
| created_at | TIMESTAMPTZ | NO | | NOW() | Fecha de creación | |
| updated_at | TIMESTAMPTZ | NO | | NOW() | Última actualización | |
| last_login_at | TIMESTAMPTZ | YES | | | Último login exitoso | |
| created_by | UUID | YES | FK USERS.id | | Usuario que creó el registro | |
| updated_by | UUID | YES | FK USERS.id | | Usuario que actualizó | |

---

## Tabla: ROLES

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único del rol | |
| name | VARCHAR(50) | NO | | | Nombre del rol | Único, enum: CASHIER, SUPERVISOR, ADMIN, etc. |
| description | TEXT | YES | | | Descripción del rol | |
| active | BOOLEAN | NO | | true | Rol activo/inactivo | |
| created_at | TIMESTAMPTZ | NO | | NOW() | Fecha de creación | |
| updated_at | TIMESTAMPTZ | NO | | NOW() | Última actualización | |

---

## Tabla: AREAS

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único del área | |
| code | VARCHAR(20) | NO | | | Código del área | Único, mayúsculas, sin espacios |
| name | VARCHAR(100) | NO | | | Nombre del área | |
| description | TEXT | YES | | | Descripción del área | |
| active | BOOLEAN | NO | | true | Área activa/inactiva | |
| created_at | TIMESTAMPTZ | NO | | NOW() | Fecha de creación | |
| updated_at | TIMESTAMPTZ | NO | | NOW() | Última actualización | |

---

## Tabla: TERMINALS

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único de terminal | |
| code | VARCHAR(20) | NO | | | Código de terminal | Único, mayúsculas |
| name | VARCHAR(100) | NO | | | Nombre de terminal | |
| area_id | UUID | NO | FK AREAS.id | | Área a la que pertenece | |
| location | VARCHAR(255) | YES | | | Ubicación física | |
| active | BOOLEAN | NO | | true | Terminal activo/inactivo | |
| created_at | TIMESTAMPTZ | NO | | NOW() | Fecha de creación | |
| updated_at | TIMESTAMPTZ | NO | | NOW() | Última actualización | |

---

## Tabla: SHIFTS

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único de turno | |
| terminal_id | UUID | NO | FK TERMINALS.id | | Terminal del turno | |
| opened_by_user_id | UUID | NO | FK USERS.id | | Usuario que abrió turno | |
| closed_by_user_id | UUID | YES | FK USERS.id | | Usuario que cerró turno | |
| status | VARCHAR(20) | NO | | 'OPEN' | Estado del turno | Enum: OPEN, CLOSED |
| opening_float | DECIMAL(10,2) | NO | | 0.00 | Fondo inicial | >= 0 |
| closing_float | DECIMAL(10,2) | YES | | | Fondo de cierre | >= 0 |
| opened_at | TIMESTAMPTZ | NO | | NOW() | Fecha/hora apertura | |
| closed_at | TIMESTAMPTZ | YES | | | Fecha/hora cierre | |
| notes | TEXT | YES | | | Notas del turno | |

---

## Tabla: SALES

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único de venta | |
| folio | VARCHAR(50) | NO | | | Folio de venta | Único por terminal/fecha |
| terminal_id | UUID | NO | FK TERMINALS.id | | Terminal de venta | |
| shift_id | UUID | YES | FK SHIFTS.id | | Turno de venta | |
| member_id | UUID | YES | FK MEMBERS.id | | Socio asociado | |
| created_by_user_id | UUID | NO | FK USERS.id | | Usuario que creó venta | |
| status | VARCHAR(20) | NO | | 'DRAFT' | Estado de venta | Enum: DRAFT, HELD, SENT_TO_KITCHEN, PAID, VOIDED, REFUNDED |
| subtotal | DECIMAL(10,2) | NO | | 0.00 | Subtotal sin impuestos | >= 0 |
| tax_amount | DECIMAL(10,2) | NO | | 0.00 | Monto de impuestos | >= 0 |
| discount_amount | DECIMAL(10,2) | NO | | 0.00 | Monto de descuentos | >= 0 |
| total_amount | DECIMAL(10,2) | NO | | 0.00 | Total final | >= 0 |
| tip_amount | DECIMAL(10,2) | NO | | 0.00 | Monto de propina | >= 0 |
| notes | TEXT | YES | | | Notas de la venta | |
| created_at | TIMESTAMPTZ | NO | | NOW() | Fecha de creación | |
| updated_at | TIMESTAMPTZ | NO | | NOW() | Última actualización | |
| paid_at | TIMESTAMPTZ | YES | | | Fecha/hora de pago | |
| voided_at | TIMESTAMPTZ | YES | | | Fecha/hora de cancelación | |
| void_reason | TEXT | YES | | | Motivo de cancelación | |
| voided_by_user_id | UUID | YES | FK USERS.id | | Usuario que canceló | |

---

## Tabla: SALE_LINES

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único | |
| sale_id | UUID | NO | FK SALES.id | | Venta padre | |
| product_id | UUID | NO | FK PRODUCTS.id | | Producto vendido | |
| quantity | DECIMAL(8,3) | NO | | | Cantidad vendida | > 0 |
| unit_price | DECIMAL(10,2) | NO | | | Precio unitario | >= 0 |
| tax_rate | DECIMAL(8,4) | NO | | 0.0000 | Tasa de impuesto | >= 0, <= 1 |
| line_total | DECIMAL(10,2) | NO | | | Total línea | = quantity * unit_price |
| modifiers | JSONB | YES | | | Modificadores del producto | |
| notes | TEXT | YES | | | Notas de la línea | |
| created_at | TIMESTAMPTZ | NO | | NOW() | Fecha de creación | |
| updated_at | TIMESTAMPTZ | NO | | NOW() | Última actualización | |

---

## Tabla: PAYMENTS

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único | |
| sale_id | UUID | NO | FK SALES.id | | Venta asociada | |
| method | VARCHAR(20) | NO | | | Método de pago | Enum: CASH, CARD, MEMBER_CHARGE, MIXED |
| amount | DECIMAL(10,2) | NO | | | Monto del pago | > 0 |
| reference | VARCHAR(255) | YES | | | Referencia (voucher, autorización) | |
| authorization_code | VARCHAR(100) | YES | | | Código de autorización | |
| status | VARCHAR(20) | NO | | 'PENDING' | Estado del pago | Enum: PENDING, CAPTURED, FAILED, REFUNDED |
| captured_at | TIMESTAMPTZ | YES | | | Fecha/hora de captura | |
| created_at | TIMESTAMPTZ | NO | | NOW() | Fecha de creación | |
| updated_at | TIMESTAMPTZ | NO | | NOW() | Última actualización | |

---

## Tabla: PRODUCTS

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único | |
| sku | VARCHAR(50) | NO | | | SKU del producto | Único |
| name | VARCHAR(200) | NO | | | Nombre del producto | |
| description | TEXT | YES | | | Descripción del producto | |
| category_id | UUID | YES | FK PRODUCT_CATEGORIES.id | | Categoría del producto | |
| price | DECIMAL(10,2) | NO | | | Precio de venta | >= 0 |
| cost | DECIMAL(10,2) | YES | | | Costo del producto | >= 0 |
| tax_rate | DECIMAL(8,4) | NO | | 0.0000 | Tasa de impuesto | >= 0, <= 1 |
| track_inventory | BOOLEAN | NO | | false | ¿Controla inventario? | |
| active | BOOLEAN | NO | | true | Producto activo/inactivo | |
| created_at | TIMESTAMPTZ | NO | | NOW() | Fecha de creación | |
| updated_at | TIMESTAMPTZ | NO | | NOW() | Última actualización | |

---

## Tabla: MEMBERS

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único | |
| member_number | VARCHAR(50) | NO | | | Número de socio | Único |
| first_name | VARCHAR(100) | NO | | | Nombre del socio | |
| last_name | VARCHAR(100) | NO | | | Apellido del socio | |
| email | VARCHAR(255) | YES | | | Correo electrónico | Formato email válido |
| phone | VARCHAR(50) | YES | | | Teléfono | |
| status | VARCHAR(20) | NO | | 'ACTIVE' | Estado del socio | Enum: ACTIVE, INACTIVE, SUSPENDED |
| join_date | DATE | NO | | | Fecha de ingreso | |
| birth_date | DATE | YES | | | Fecha de nacimiento | |
| created_at | TIMESTAMPTZ | NO | | NOW() | Fecha de creación | |
| updated_at | TIMESTAMPTZ | NO | | NOW() | Última actualización | |

---

## Tabla: AUDIT_EVENTS

| Campo | Tipo | Nulo | PK/FK | Default | Descripción | Reglas |
|-------|------|------|-------|---------|-------------|--------|
| id | UUID | NO | PK | uuid_generate_v4() | Identificador único | |
| at | TIMESTAMPTZ | NO | | NOW() | Fecha/hora del evento | |
| action | VARCHAR(100) | NO | | | Acción realizada | Ej: SALE_CREATED, PAYMENT_CAPTURED |
| entity_type | VARCHAR(50) | NO | | | Tipo de entidad afectada | Ej: SALE, USER, PRODUCT |
| entity_id | UUID | NO | | | ID de entidad afectada | |
| actor_user_id | UUID | NO | FK USERS.id | | Usuario que realizó acción | |
| terminal_id | UUID | YES | FK TERMINALS.id | | Terminal donde ocurrió | |
| payload | JSONB | NO | | | Datos del evento | |
| prev_hash | VARCHAR(64) | YES | | | Hash del evento anterior | |
| hash | VARCHAR(64) | NO | | | Hash SHA256 del evento | |
| ip_address | INET | YES | | | Dirección IP del cliente | |
| user_agent | TEXT | YES | | | User agent del cliente | |

---

## Reglas de Negocio Adicionales

### Validaciones de Montos
- Todos los campos monetarios usan DECIMAL(10,2)
- No se permiten valores negativos excepto en ajustes de inventario
- El total de una venta debe ser igual a: subtotal + impuestos - descuentos

### Validaciones de Estados
- Una venta solo puede pasar a PAID si tiene pagos que cubran el total
- Una venta solo puede ser cancelada si está en estado DRAFT, HELD o PAID
- Un turno solo puede ser cerrado si no hay ventas pendientes

### Reglas de Integridad
- Eliminación en cascada: líneas de venta al eliminar venta
- Restricción de clave externa: no se puede eliminar producto con ventas asociadas
- Timestamps automáticos en created_at/updated_at

### Índices Recomendados
```sql
-- Búsqueda rápida por folio
CREATE INDEX idx_sales_folio ON SALES(folio);

-- Búsqueda por rango de fechas
CREATE INDEX idx_sales_created_at ON SALES(created_at);
CREATE INDEX idx_audit_events_at ON AUDIT_EVENTS(at);

-- Búsqueda por estado
CREATE INDEX idx_sales_status ON SALES(status);
CREATE INDEX idx_shifts_status ON SHIFTS(status);

-- Búsqueda por usuario
CREATE INDEX idx_sales_created_by ON SALES(created_by_user_id);
CREATE INDEX idx_audit_events_actor ON AUDIT_EVENTS(actor_user_id);
```
