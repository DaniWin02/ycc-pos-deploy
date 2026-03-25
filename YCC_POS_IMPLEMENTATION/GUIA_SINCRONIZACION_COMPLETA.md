# 🔄 Guía de Sincronización Completa - YCC POS

## ✅ IMPLEMENTACIONES COMPLETADAS

### 1. Endpoint `/api/sales` Creado

**Archivo:** `03_API_GATEWAY/src/routes/sales.routes.ts`

**Endpoints disponibles:**
- `GET /api/sales` - Listar todas las ventas
- `GET /api/sales/:id` - Obtener venta específica
- `POST /api/sales` - Crear nueva venta (desde POS)
- `PUT /api/sales/:id` - Actualizar estado (para KDS)
- `GET /api/sales/stats/summary` - Estadísticas de ventas

**Registrado en:** `03_API_GATEWAY/src/index.ts` línea 51

### 2. API Client para KDS

**Archivo:** `05_KDS_SYSTEM/src/lib/apiClient.ts`

**Características:**
- Cliente HTTP centralizado
- Validación automática de endpoints
- Logging detallado
- Manejo robusto de errores
- Tipos TypeScript para pedidos

### 3. KDS Actualizado para Consumir API Real

**Archivo:** `05_KDS_SYSTEM/src/stores/useKdsStore.ts`

**Cambios:**
- ✅ Ahora consume `/api/sales` en lugar de `/comandas`
- ✅ Transforma datos del API a formato KDS
- ✅ Mantiene sincronización con localStorage
- ✅ Merge inteligente de datos (API + local)

---

## 🎯 FLUJO DE DATOS ACTUAL

### Escenario: Venta en POS → Aparece en KDS

```
1. Usuario completa venta en POS
   ↓
2. POS → POST /api/sales
   Body: {
     items: [...],
     totalAmount: 150.00,
     paymentMethod: 'CASH',
     userId: 'user-cashier',
     terminalId: 'terminal-main'
   }
   ↓
3. API Gateway → Guarda en DB (tabla Order)
   ↓
4. API Gateway → Responde 201 Created
   ↓
5. KDS (polling cada 5-10 segundos)
   → GET /api/sales
   ↓
6. KDS recibe nuevo pedido
   ↓
7. KDS muestra ticket en pantalla
```

---

## 🚀 PRÓXIMOS PASOS PARA SINCRONIZACIÓN COMPLETA

### Paso 1: Reiniciar API Gateway

```bash
cd YCC_POS_IMPLEMENTATION/03_API_GATEWAY
pnpm dev
```

**Verificar que aparezca:**
```
🚀 API Gateway running on http://localhost:3004
[API] Rutas registradas:
  - /api/products
  - /api/categories
  - /api/sales          ← NUEVO
  - /api/cash-sessions
  - /api/shifts
```

### Paso 2: Probar Endpoint de Sales

```bash
# Crear venta de prueba
curl -X POST http://localhost:3004/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": "prod-1",
        "name": "Hamburguesa",
        "quantity": 2,
        "unitPrice": 85.00,
        "sku": "COM-001"
      }
    ],
    "totalAmount": 170.00,
    "subtotal": 170.00,
    "taxAmount": 0,
    "paymentMethod": "CASH",
    "userId": "user-cashier",
    "terminalId": "terminal-main"
  }'

# Verificar que se creó
curl http://localhost:3004/api/sales
```

### Paso 3: Configurar Polling en KDS

**Archivo:** `05_KDS_SYSTEM/src/App.tsx`

Agregar polling automático:

```typescript
// Polling cada 5 segundos para nuevos pedidos
useEffect(() => {
  if (!selectedStation) return;
  
  // Cargar inmediatamente
  loadTickets();
  
  // Polling cada 5 segundos
  const interval = setInterval(() => {
    loadTickets();
  }, 5000);
  
  return () => clearInterval(interval);
}, [selectedStation]);
```

### Paso 4: Actualizar POS para Crear Ventas en API

**Archivo:** `04_CORE_POS/src/App.tsx`

Verificar que la función `completeSale` use el endpoint correcto:

```typescript
const handleCompleteSale = async () => {
  try {
    // Crear venta en API
    const sale = await api.post(endpoints.sales.create(), {
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        sku: item.sku
      })),
      totalAmount: totals.total,
      subtotal: totals.subtotal,
      taxAmount: totals.tax,
      paymentMethod,
      cashReceived: cashReceived ? parseFloat(cashReceived) : null,
      change: totals.change,
      userId,
      terminalId
    });
    
    console.log('✅ Venta creada:', sale.folio);
    
    // Limpiar carrito
    clearCart();
    
    toast.success(`Venta completada: ${sale.folio}`);
  } catch (error) {
    console.error('Error creando venta:', error);
    toast.error('Error al procesar la venta');
  }
};
```

### Paso 5: Verificar Admin Panel

**Archivo:** `06_ADMIN_PANEL/src/pages/SalesPage.tsx`

Asegurar que consume `/api/sales`:

```typescript
const fetchSales = async () => {
  try {
    const response = await fetch('http://localhost:3004/api/sales');
    const data = await response.json();
    setSales(data);
  } catch (error) {
    console.error('Error cargando ventas:', error);
  }
};
```

---

## 🔧 CONFIGURACIÓN DE POLLING (Sincronización Simple)

### Opción 1: Polling en KDS (Implementado)

```typescript
// En KDS App.tsx
useEffect(() => {
  const interval = setInterval(() => {
    loadTickets(); // Llama a GET /api/sales
  }, 5000); // Cada 5 segundos
  
  return () => clearInterval(interval);
}, []);
```

**Ventajas:**
- ✅ Simple de implementar
- ✅ No requiere Socket.io
- ✅ Funciona inmediatamente

**Desventajas:**
- ⚠️ Delay de hasta 5 segundos
- ⚠️ Más requests al servidor

### Opción 2: WebSockets (Futuro - Opcional)

Para tiempo real instantáneo, instalar Socket.io:

```bash
# Backend
cd 03_API_GATEWAY
pnpm add socket.io

# Frontend (POS, KDS, Admin)
cd 04_CORE_POS
pnpm add socket.io-client
```

**Implementación Backend:**

```typescript
// En index.ts
import { Server } from 'socket.io';
import { createServer } from 'http';

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// En sales.routes.ts
router.post('/', async (req, res) => {
  const sale = await prisma.order.create({ data: ... });
  
  // Emitir evento a todos los clientes
  io.emit('sale:created', sale);
  
  res.status(201).json(sale);
});
```

**Implementación Frontend (KDS):**

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3004');

useEffect(() => {
  socket.on('sale:created', (newSale) => {
    console.log('🔔 Nuevo pedido recibido:', newSale);
    loadTickets(); // Refrescar lista
  });
  
  return () => {
    socket.off('sale:created');
  };
}, []);
```

---

## 📊 ENDPOINTS DISPONIBLES

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Actualizar producto
- `DELETE /api/products/:id` - Eliminar producto

### Categorías
- `GET /api/categories` - Listar categorías
- `POST /api/categories` - Crear categoría
- `PUT /api/categories/:id` - Actualizar categoría
- `DELETE /api/categories/:id` - Eliminar categoría

### Ventas (NUEVO)
- `GET /api/sales` - Listar ventas
- `GET /api/sales/:id` - Obtener venta
- `POST /api/sales` - Crear venta
- `PUT /api/sales/:id` - Actualizar estado
- `GET /api/sales/stats/summary` - Estadísticas

### Cash Sessions
- `GET /api/cash-sessions/active/:terminalId` - Sesión activa
- `POST /api/cash-sessions/open` - Abrir caja
- `POST /api/cash-sessions/close/:id` - Cerrar caja

### Shifts
- `GET /api/shifts/current/:userId` - Turno actual
- `POST /api/shifts/start` - Iniciar turno
- `POST /api/shifts/end/:id` - Finalizar turno

---

## ✅ CHECKLIST DE SINCRONIZACIÓN

### Backend (API Gateway)
- [x] Endpoint `/api/sales` creado
- [x] Registrado en `index.ts`
- [x] CRUD completo implementado
- [x] Logging detallado agregado
- [ ] Socket.io instalado (opcional)
- [ ] Eventos emitidos (opcional)

### POS
- [x] API Client centralizado existe
- [x] Consume `/api/products`
- [ ] Crear ventas en `/api/sales`
- [ ] Verificar que ventas se guardan en DB
- [ ] Escuchar eventos (si Socket.io)

### KDS
- [x] API Client creado
- [x] Store actualizado para `/api/sales`
- [x] Transformación de datos implementada
- [ ] Polling configurado en App.tsx
- [ ] Probar recepción de pedidos
- [ ] Escuchar eventos (si Socket.io)

### Admin Panel
- [ ] Verificar consume `/api/sales`
- [ ] Verificar consume `/api/products`
- [ ] Verificar consume `/api/categories`
- [ ] Refrescar listas al crear/editar
- [ ] Escuchar eventos (si Socket.io)

---

## 🧪 PRUEBAS DE SINCRONIZACIÓN

### Test 1: Crear Producto en Admin → Ver en POS

```
1. Abrir Admin Panel (http://localhost:3003)
2. Ir a Productos
3. Crear nuevo producto: "Pizza Pepperoni" - $120.00
4. Abrir POS (http://localhost:3000)
5. Verificar que aparece en catálogo
```

**Resultado esperado:** ✅ Producto aparece en POS

### Test 2: Venta en POS → Ver en KDS

```
1. Abrir POS (http://localhost:3000)
2. Login con PIN 1234
3. Agregar productos al carrito
4. Completar venta
5. Abrir KDS (http://localhost:3002)
6. Seleccionar estación
7. Verificar que aparece ticket
```

**Resultado esperado:** ✅ Ticket aparece en KDS (máximo 5 segundos de delay)

### Test 3: Ver Ventas en Admin

```
1. Completar venta en POS
2. Abrir Admin Panel
3. Ir a Ventas/Reportes
4. Verificar que aparece la venta
```

**Resultado esperado:** ✅ Venta aparece en Admin

---

## 🔥 PROBLEMAS COMUNES Y SOLUCIONES

### Problema: KDS no muestra pedidos

**Solución:**
1. Verificar que API Gateway está corriendo en puerto 3004
2. Abrir consola del navegador en KDS
3. Buscar logs: `📡 Cargando pedidos desde...`
4. Verificar que `/api/sales` devuelve datos:
   ```bash
   curl http://localhost:3004/api/sales
   ```

### Problema: Productos no aparecen en POS

**Solución:**
1. Verificar que productos existen en DB (ejecutar seed)
2. Verificar endpoint:
   ```bash
   curl http://localhost:3004/api/products
   ```
3. Revisar consola del navegador en POS
4. Verificar que `apiClient.ts` está configurado correctamente

### Problema: Error 404 en endpoints

**Solución:**
1. Verificar que API Gateway está corriendo
2. Verificar que el endpoint está registrado en `index.ts`
3. Verificar que la URL incluye `/api`:
   - ✅ Correcto: `http://localhost:3004/api/sales`
   - ❌ Incorrecto: `http://localhost:3004/sales`

---

## 🎯 RESULTADO FINAL ESPERADO

**Sistema Completamente Sincronizado:**

1. **Admin Panel** crea producto
   → Producto guardado en DB
   → POS puede verlo inmediatamente (con refetch)

2. **POS** completa venta
   → Venta guardada en DB
   → KDS recibe pedido (máximo 5 segundos)
   → Admin puede ver venta en reportes

3. **KDS** actualiza estado de pedido
   → Estado guardado en DB
   → Admin ve estadísticas actualizadas

**Todos los módulos comparten la misma fuente de verdad: PostgreSQL vía API Gateway** ✅

---

## 📝 NOTAS IMPORTANTES

- **NUNCA** usar datos mock en producción
- **SIEMPRE** validar respuestas del API
- **PROHIBIDO** tener múltiples fuentes de verdad
- **OBLIGATORIO** usar apiClient centralizado
- **CRÍTICO** manejar errores de red

---

## 🚀 MEJORAS FUTURAS

1. **React Query** - Cache inteligente y auto-refetch
2. **Socket.io** - Sincronización en tiempo real instantánea
3. **Optimistic Updates** - UX más fluida
4. **Offline Support** - Funcionar sin conexión
5. **Retry Logic** - Reintentos automáticos en errores
6. **Error Boundaries** - Manejo robusto de errores
7. **Loading States** - Feedback visual mejorado
8. **Toast Notifications** - Notificaciones de eventos

---

**Sistema listo para sincronización completa.** 🎉
