# Fase 0.4 - YCC Mobile App - Aplicación Móvil para Meseros y Delivery

Aplicación web móvil para gestión de comandas en tiempo real para meseros y personal de delivery.

## � Características

### Para Meseros
- 📋 **Vista de comandas de mesa** en tiempo real
- ✅ **Gestión de estados**: LISTO → ENTREGANDO → ENTREGADO
- 🔔 **Notificaciones** de pedidos listos
- 📊 **Dashboard** con estadísticas del día
- ⏱️ **Timer** de tiempo de espera por comanda
- 🎯 **Prioridades automáticas** (URGENTE/ALTA/MEDIA/BAJA)

### Para Delivery
- 🚚 **Vista de pedidos a domicilio**
- 📍 **Información completa** de entrega (dirección, teléfono)
- 🗺️ **Seguimiento** de entregas en progreso
- ✅ **Confirmación** de entrega al cliente
- 📊 **Estadísticas** de entregas completadas

## 🎨 Pantallas

### 1. Login
- Selección de rol (Mesero/Delivery)
- Ingreso de nombre
- Interfaz simple y rápida
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
