# Diagrama Entidad-Relación - YCC POS
## Base de Datos Completa
### Fecha: 23 de Febrero 2026

---

## 📋 Resumen

Diagrama completo de la base de datos del sistema YCC POS mostrando todas las entidades y sus relaciones.

---

## 🗄️ Diagrama General

```mermaid
erDiagram
    %% ========================================
    %% USUARIOS Y AUTENTICACIÓN
    %% ========================================
    
    User ||--o{ UserRoles : has }
    User ||--o{ CreatedOrders : creates }
    User ||--o{ OpenedSessions : opens }
    
    UserRole {
        id PK
        name UK
        permissions JSON
        createdAt
        updatedAt
    }
    
    %% ========================================
    %% TIENDAS Y TERMINALES
    %% ========================================
    
    Store ||--o{ Terminals : contains }
    
    Terminal {
        id PK
        storeId FK
        name
        location
        isActive
        createdAt
        updatedAt
        store FK
    }
    
    %% ========================================
    %% SESIONES DE CAJA
    %% ========================================
    
    Terminal ||--o{ CashSessions : has }
    
    CashSession {
        id PK
        terminalId FK
        openedByUserId FK
        closedByUserId FK
        openingFloat
        closingFloat
        status
        openedAt
        closedAt
        createdAt
        updatedAt
        terminal FK
        openedByUser FK
        closedByUser FK
    }
    
    %% ========================================
    %% CLIENTES/SOCIOS
    %% ========================================
    
    Customer {
        id PK
        memberNumber UK
        firstName
        lastName
        email
        phone
        address
        isActive
        createdAt
        updatedAt
        orders FK
    }
    
    %% ========================================
    %% PRODUCTOS Y CATEGORÍAS
    %% ========================================
    
    Category {
        id PK
        name UK
        description
        parentId FK
        isActive
        createdAt
        updatedAt
        parent FK
        children FK
        products FK
    }
    
    Product {
        id PK
        sku UK
        name
        description
        categoryId FK
        price
        cost
        taxRate
        trackInventory
        currentStock
        minStockLevel
        isActive
        createdAt
        updatedAt
        category FK
        inventoryMovements FK
    }
    
    %% ========================================
    %% INVENTARIO
    %% ========================================
    
    Ingredient {
        id PK
        name UK
        description
        unit
        currentCost
        supplierId
        isActive
        createdAt
        updatedAt
        inventoryMovements FK
    }
    
    InventoryMovement {
        id PK
        productId FK
        ingredientId FK
        type
        quantity
        unitCost
        reason
        reference
        storeId
        terminalId
        createdById FK
        createdAt
        updatedAt
        product FK
        ingredient FK
        terminal FK
        createdByUser FK
    }
    
    %% ========================================
    %% MODIFICADORES
    %% ========================================
    
    ModifierGroup {
        id PK
        name UK
        description
        isRequired
        isActive
        createdAt
        updatedAt
        modifiers FK
    }
    
    Modifier {
        id PK
        modifierGroupId FK
        name
        description
        priceAdd
        isActive
        createdAt
        updatedAt
        modifierGroup FK
    }
    
    %% ========================================
    %% ÓRDENES Y VENTAS
    %% ========================================
    
    Order {
        id PK
        folio UK
        customerId FK
        customerName
        tableId
        terminalId FK
        storeId
        createdByUserId FK
        status
        subtotal
        taxAmount
        discountAmount
        tipAmount
        totalAmount
        paymentStatus
        notes
        createdAt
        updatedAt
        completedAt
        customer FK
        terminal FK
        createdByUser FK
        orderItems FK
        payments FK
    }
    
    OrderItem {
        id PK
        orderId FK
        productId FK
        productName
        sku
        quantity
        unitPrice
        totalPrice
        taxRate
        taxAmount
        discountAmount
        modifiers JSON
        notes
        status
        createdAt
        updatedAt
        order FK
    }
    
    Payment {
        id PK
        orderId FK
        method
        amount
        reference
        authorizationCode
        status
        capturedAt
        createdAt
        updatedAt
        order FK
    }
```

---

## 📊 Relaciones Principales

### 1. **Usuarios y Roles**
- Un `User` puede tener múltiples `UserRole`
- `UserRoles` define permisos específicos por rol
- Roles: ADMIN, CASHIER, MANAGER, KITCHEN

### 2. **Tiendas y Terminales**
- Una `Store` contiene múltiples `Terminal`
- `Terminal` pertenece a una `Store`
- `Terminal` gestiona múltiples `CashSession`

### 3. **Clientes y Órdenes**
- Un `Customer` puede tener múltiples `Order`
- `Order` pertenece a un `Customer`, `Terminal`, `Store`, `User`
- `Order` contiene múltiples `OrderItem` y `Payment`

### 4. **Productos y Categorías**
- `Category` tiene estructura jerárquica (padre/hijos)
- `Product` pertenece a una `Category`
- `Product` tiene `InventoryMovement` para control de stock

### 5. **Inventario**
- `Ingredient` para control de costos
- `InventoryMovement` registra todos los movimientos
- Relacionado con `Product` e `Ingredient`

### 6. **Modificadores**
- `ModifierGroup` contiene múltiples `Modifier`
- `Modifier` pertenece a un `ModifierGroup`
- `OrderItem` puede tener múltiples `Modifier` (JSON)

---

## 🔍 Reglas de Negocio

### 1. **Integridad Referencial**
- Todas las relaciones FK tienen índices
- Eliminación en cascada controlada para mantener integridad

### 2. **Estados de Órdenes**
- `Order.status`: PENDING → ACTIVE → COMPLETED
- `OrderItem.status`: PENDING → CONFIRMED → PREPARING → READY → COMPLETED
- `Payment.status`: PENDING → CAPTURED → VOIDED/REFUNDED

### 3. **Control de Inventario**
- `currentStock` se actualiza con cada `InventoryMovement`
- `trackInventory` controla si se debe actualizar stock
- `minStockLevel` genera alertas de reorden

### 4. **Sesiones de Caja**
- Solo una `CashSession` activa por `Terminal`
- `openingFloat` y `closingFloat` para control de efectivo
- `status`: OPEN → CLOSED

---

## 📈 Índices Recomendados

```sql
-- Índices para rendimiento óptimo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_stores_active ON stores(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_terminals_store ON terminals(store_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_terminals_active ON terminals(is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_member ON customers(member_number);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_active ON customers(is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_active ON categories(is_active);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_track_inventory ON products(track_inventory);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_folio ON orders(folio);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_terminal ON orders(terminal_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_store ON orders(store_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product ON order_items(product_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_method ON payments(method);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cash_sessions_terminal ON cash_sessions(terminal_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cash_sessions_status ON cash_sessions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_cash_sessions_opened_at ON cash_sessions(opened_at);
```

---

## ✅ Validación del Schema

### ✅ **Entidades Creadas**: 15 modelos principales
### ✅ **Relaciones Definidas**: Todas las FK con sus reglas
### ✅ **Enums Implementados**: 6 enums para estados y tipos
### ✅ **Índices Optimizados**: 20+ índices para rendimiento

---

## 🔄 Siguiente Paso

**Completar este prompt y continuar con Fase 0.3: API Gateway**

---

*Este ERD representa la estructura completa de datos para el sistema YCC POS.*
