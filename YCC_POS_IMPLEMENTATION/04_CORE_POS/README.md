# Fase 0.4 - Core POS
## Terminal de Ventas Completa
### Fecha: 23 de Febrero 2026

---

## 📋 Objetivo

Crear la aplicación POS completa con:
- **Terminal de ventas** con carrito de compras
- **Gestión de productos** con búsqueda y filtros
- **Procesamiento de pagos** en efectivo, tarjeta y cuentas de socios
- **Gestión de sesiones de caja** con apertura y cierre
- **Integración con API Gateway** para autenticación y datos

---

## 🏗️ Estructura a Crear

```
04_CORE_POS/
├── README.md                    # Documentación de la fase
├── src/
│   ├── components/              # Componentes React reutilizables
│   ├── hooks/                  # Hooks personalizados
│   ├── stores/                 # Estado global con Zustand
│   ├── services/               # Servicios de negocio
│   ├── utils/                  # Utilidades comunes
│   ├── types/                  # Tipos TypeScript
│   └── app.ts                 # Aplicación principal
├── public/                       # Archivos estáticos
├── docs/
│   ├── COMPONENTS.md           # Componentes disponibles
│   └── HOOKS.md             # Hooks personalizados
└── package.json                  # Configuración del paquete
```

---

## 🛠️ Componentes Principales

### src/components/
- **ProductCard** - Tarjeta de producto con imagen y precio
- **CartItem** - Item del carrito con cantidad y modificadores
- **NumericKeypad** - Teclado numérico para cantidades
- **CustomerSearch** - Búsqueda de clientes/socios
- **PaymentMethodSelector** - Selector de método de pago
- **CashDrawer** - Cajón de efectivo animado
- **ReceiptPrinter** - Componente de impresión de tickets

### src/hooks/
- **useCart** - Gestión del carrito de compras
- **useProducts** - Búsqueda y filtrado de productos
- **useCustomers** - Búsqueda de clientes/socios
- **usePayments** - Procesamiento de pagos
- **useAuth** - Estado de autenticación
- **useCashSession** - Gestión de sesión de caja

### src/stores/
- **cartStore** - Estado del carrito
- **authStore** - Estado de autenticación
- **productsStore** - Catálogo de productos
- **customersStore** - Clientes y socios
- **cashSessionStore** - Sesión de caja actual

---

## 📦 Servicios de Negocio

### src/services/
- **cartService** - Lógica del carrito
- **productsService** - Gestión de catálogo
- **customersService** - Gestión de clientes
- **ordersService** - Creación y gestión de órdenes
- **paymentsService** - Procesamiento de pagos
- **cashSessionService** - Sesiones de caja
- **authService** - Comunicación con API Gateway

---

## 🎯 Características Clave

### 1. **Terminal de Ventas**
- **Catálogo de productos** con búsqueda en tiempo real
- **Carrito de compras** con modificadores
- **Gestión de clientes** y socios
- **Múltiples métodos de pago**
- **Impresión de tickets** y facturas
- **Modo offline** con sincronización

### 2. **Integración**
- **Conexión con API Gateway** para autenticación
- **Consumo de endpoints** de productos, clientes, órdenes
- **Sincronización** automática con base de datos central

### 3. **Experiencia de Usuario**
- **Interfaz táctil** optimizada para uso rápido
- **Atajos de teclado** para operaciones frecuentes
- **Feedback visual** y sonoro para acciones
- **Modo oscuro/claro** para diferentes ambientes

---

## ✅ Postcheck

### Validación del Core POS
- [ ] `pnpm install` funciona sin errores
- [ ] `pnpm typecheck` retorna 0 errores
- [ ] Componentes React renderizan correctamente
- [ ] Estado global funciona con Zustand
- [ ] Servicios consumen API Gateway
- [ ] Carrito de compras funcional
- [ ] Procesamiento de pagos funciona
- [ ] Sesiones de caja operativas

---

## 🔄 Siguiente Paso

**Completar este prompt y continuar con Fase 0.5: Kitchen Display System**

---

*Este es el corazón del frontend que será utilizado por los cajeros del Country Club.*
