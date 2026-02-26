# Fase 0.2 - Base de Datos
## Configuración de Base de Datos PostgreSQL
### Fecha: 23 de Febrero 2026

---

## 📋 Objetivo

Configurar la base de datos completa para el sistema YCC POS con:
- **Schema Prisma** completo con todas las entidades
- **Migraciones** base para estructura de tablas
- **Seed data** inicial para desarrollo
- **Configuración PostgreSQL** para producción

---

## 🏗️ Estructura a Crear

```
02_BASE_DATOS/
├── README.md                    # Documentación de la fase
├── prisma/
│   ├── schema.prisma          # Esquema completo de la BD
│   ├── migrations/              # Migraciones SQL
│   └── seed.ts               # Datos iniciales
├── docs/
│   ├── ERD.md                 # Diagrama entidad-relación
│   └── DATA_DICTIONARY.md     # Diccionario de datos
└── scripts/
    ├── setup-db.sh             # Script de setup inicial
    └── seed-data.sh             # Script de seed data
```

---

## 🗄️ Schema Prisma

### Entidades Principales

#### Usuarios y Autenticación
```prisma
model User {
  id              String   @id @default(cuid())
  username        String   @unique
  email           String   @unique
  passwordHash    String
  firstName       String
  lastName        String
  role            UserRole @default(CASHIER)
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model UserRole {
  id        String   @id @default(cuid())
  name      String   @unique
  permissions Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### Tiendas y Terminales
```prisma
model Store {
  id          String   @id @default(cuid())
  name        String
  address     String
  phone       String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Terminal {
  id          String   @id @default(cuid())
  storeId     String
  name        String
  location    String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  store       Store    @relation(fields: [storeId], references: [id])
  cashSessions CashSession[]
}
```

#### Productos y Categorías
```prisma
model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  parentId     String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  parent      Category? @relation("CategoryChildren", fields: [parentId])
  children    Category[] @relation("CategoryChildren")
}

model Product {
  id          String   @id @default(cuid())
  sku         String   @unique
  name        String
  description String?
  categoryId  String
  price        Decimal
  cost        Decimal?
  taxRate      Decimal   @default(0.16)
  trackInventory Boolean  @default(true)
  currentStock Decimal   @default(0)
  minStockLevel Decimal?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  category    Category @relation(fields: [categoryId], references: [id])
  inventoryMovements InventoryMovement[]
}
```

#### Órdenes y Ventas
```prisma
model Order {
  id              String   @id @default(cuid())
  folio           String   @unique
  customerId      String?
  customerName    String?
  tableId         String?
  terminalId       String
  storeId         String
  createdByUserId  String
  status          OrderStatus @default(PENDING)
  subtotal         Decimal
  taxAmount        Decimal   @default(0)
  discountAmount   Decimal   @default(0)
  tipAmount        Decimal   @default(0)
  totalAmount     Decimal
  paymentStatus    PaymentStatus @default(PENDING)
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  completedAt     DateTime?
  customer        Customer? @relation(fields: [customerId], references: [id])
  terminal       Terminal @relation(fields: [terminalId], references: [id])
  createdByUser  User @relation(fields: [createdByUserId], references: [id])
  items           OrderItem[]
  payments        Payment[]
}

model OrderItem {
  id              String   @id @default(cuid())
  orderId         String
  productId       String
  productName     String
  sku             String
  quantity         Decimal
  unitPrice       Decimal
  totalPrice      Decimal
  taxRate         Decimal   @default(0.16)
  taxAmount       Decimal
  discountAmount   Decimal   @default(0)
  modifiers        Json
  notes           String?
  status          OrderItemStatus @default(PENDING)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  order           Order @relation(fields: [orderId], references: [id])
}

model Payment {
  id                String   @id @default(cuid())
  orderId           String
  method            PaymentMethod
  amount            Decimal
  reference         String?
  authorizationCode String?
  status            PaymentStatus @default(PENDING)
  capturedAt        DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  order             Order @relation(fields: [orderId], references: [id])
}
```

---

## 📊 Enums del Sistema

```typescript
export enum OrderStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum OrderItemStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  CAPTURED = 'CAPTURED',
  VOIDED = 'VOIDED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  MEMBER_ACCOUNT = 'MEMBER_ACCOUNT',
  MIXED = 'MIXED'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  CASHIER = 'CASHIER',
  MANAGER = 'MANAGER',
  KITCHEN = 'KITCHEN'
}
```

---

## ✅ Postcheck

### Validación de la Base de Datos
- [ ] `prisma generate` crea esquema SQL correctamente
- [ ] `prisma db push` crea tablas en PostgreSQL
- [ ] Migraciones base ejecutan sin errores
- [ ] Seed data se inserta correctamente
- [ ] Conexión PostgreSQL funciona
- [ ] Scripts de setup funcionan

---

## 🔄 Siguiente Paso

**Completar este prompt y continuar con Fase 0.3: API Gateway**

---

*Esta es la base de datos para todo el sistema YCC POS.*
