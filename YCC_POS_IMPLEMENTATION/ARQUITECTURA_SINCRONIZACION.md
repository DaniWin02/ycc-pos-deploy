# 🔄 Arquitectura de Sincronización - YCC POS

## 📋 Estado Actual

### Módulos del Sistema
- **POS** (Puerto 3000) - Punto de Venta
- **Admin Panel** (Puerto 3003) - Panel Administrativo  
- **KDS** (Puerto 3002) - Kitchen Display System
- **API Gateway** (Puerto 3004) - Backend Unificado

### ✅ Configuración Correcta Actual

**API Gateway:**
- Base URL: `http://localhost:3004`
- Todos los endpoints con prefijo `/api`
- Ejemplos: `/api/products`, `/api/categories`, `/api/sales`

**POS:**
- ✅ Usa `apiClient.ts` centralizado
- ✅ Base URL: `http://localhost:3004/api`
- ✅ Endpoints: `/products`, `/categories`, `/cash-sessions`, `/shifts`

**Admin Panel:**
- ⚠️ Usa fetch directo en algunos lugares
- ⚠️ URLs hardcodeadas: `http://localhost:3004/api/...`
- ✅ Consume productos y categorías correctamente

**KDS:**
- ⚠️ Usa datos mock/locales
- ❌ NO consume API real
- ❌ NO recibe pedidos en tiempo real

---

## 🎯 Arquitectura de Sincronización Propuesta

### Fase 1: Unificación de API Client (CRÍTICO)

**Crear `shared/apiClient.ts` que todos los módulos usen:**

```typescript
// Base URL única
const API_BASE_URL = 'http://localhost:3004/api';

// Cliente HTTP centralizado
export const api = {
  get: <T>(endpoint: string) => fetch(`${API_BASE_URL}${endpoint}`).then(r => r.json()),
  post: <T>(endpoint: string, data: any) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  put: <T>(endpoint: string, data: any) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  delete: <T>(endpoint: string) => fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'DELETE'
  }).then(r => r.json())
};

// Endpoints documentados
export const endpoints = {
  products: {
    list: () => '/products',
    create: () => '/products',
    update: (id: string) => `/products/${id}`,
    delete: (id: string) => `/products/${id}`
  },
  categories: {
    list: () => '/categories',
    create: () => '/categories',
    update: (id: string) => `/categories/${id}`,
    delete: (id: string) => `/categories/${id}`
  },
  sales: {
    list: () => '/sales',
    create: () => '/sales',
    get: (id: string) => `/sales/${id}`
  }
};
```

### Fase 2: Sincronización con Polling (Simple)

**En cada módulo, implementar auto-refetch:**

```typescript
// POS - Recargar productos cada 30 segundos
useEffect(() => {
  const interval = setInterval(() => {
    refetchProducts();
  }, 30000);
  return () => clearInterval(interval);
}, []);

// Admin - Recargar al crear/editar
const handleCreateProduct = async (data) => {
  await api.post(endpoints.products.create(), data);
  refetchProducts(); // Refrescar lista inmediatamente
};

// KDS - Polling de pedidos cada 5 segundos
useEffect(() => {
  const interval = setInterval(() => {
    fetchNewOrders();
  }, 5000);
  return () => clearInterval(interval);
}, []);
```

### Fase 3: WebSockets (Tiempo Real - Opcional)

**Backend - Emitir eventos:**

```typescript
// En products.routes.ts
router.post('/', async (req, res) => {
  const product = await prisma.product.create({ data: req.body });
  
  // Emitir evento a todos los clientes conectados
  io.emit('product:created', product);
  
  res.status(201).json(product);
});
```

**Frontend - Escuchar eventos:**

```typescript
// En POS, Admin, KDS
useEffect(() => {
  socket.on('product:created', (newProduct) => {
    // Agregar a lista local o refetch
    refetchProducts();
  });
  
  socket.on('sale:created', (newSale) => {
    // KDS recibe pedido nuevo
    addOrderToKDS(newSale);
  });
  
  return () => {
    socket.off('product:created');
    socket.off('sale:created');
  };
}, []);
```

---

## 🔧 Implementación por Módulo

### 1. API Gateway (Backend)

**Endpoints Requeridos:**

```
GET    /api/products          - Lista todos los productos
POST   /api/products          - Crear producto
PUT    /api/products/:id      - Actualizar producto
DELETE /api/products/:id      - Eliminar producto

GET    /api/categories        - Lista todas las categorías
POST   /api/categories        - Crear categoría
PUT    /api/categories/:id    - Actualizar categoría
DELETE /api/categories/:id    - Eliminar categoría

GET    /api/sales             - Lista todas las ventas
POST   /api/sales             - Crear venta (desde POS)
GET    /api/sales/:id         - Obtener venta específica
```

**Eventos a Emitir:**
- `product:created` - Cuando se crea un producto
- `product:updated` - Cuando se actualiza un producto
- `product:deleted` - Cuando se elimina un producto
- `category:created` - Cuando se crea una categoría
- `sale:created` - Cuando se crea una venta (para KDS)
- `order:updated` - Cuando cambia estado de pedido

### 2. POS (Frontend)

**Consumir:**
- `GET /api/products` - Cargar catálogo
- `GET /api/categories` - Filtros de categorías
- `POST /api/sales` - Enviar venta al backend

**Escuchar:**
- `product:created` → Refrescar catálogo
- `product:updated` → Actualizar producto en lista
- `category:created` → Refrescar categorías

### 3. Admin Panel (Frontend)

**Consumir:**
- `GET /api/products` - Ver productos
- `POST /api/products` - Crear producto
- `PUT /api/products/:id` - Editar producto
- `DELETE /api/products/:id` - Eliminar producto
- `GET /api/categories` - Ver categorías
- `POST /api/categories` - Crear categoría

**Emitir (vía API):**
- Crear producto → Backend emite `product:created`
- Editar producto → Backend emite `product:updated`

### 4. KDS (Frontend)

**Consumir:**
- `GET /api/sales?status=pending` - Pedidos pendientes
- `PUT /api/sales/:id` - Actualizar estado de pedido

**Escuchar:**
- `sale:created` → Mostrar nuevo pedido
- `order:updated` → Actualizar estado visual

---

## 📊 Flujo de Datos Completo

### Escenario 1: Crear Producto en Admin

```
1. Admin Panel → POST /api/products
2. API Gateway → Guarda en DB
3. API Gateway → Emite evento 'product:created'
4. POS escucha → Refetch productos
5. Admin escucha → Actualiza lista local
```

### Escenario 2: Venta en POS

```
1. POS → POST /api/sales
2. API Gateway → Guarda venta en DB
3. API Gateway → Emite evento 'sale:created'
4. KDS escucha → Muestra nuevo pedido
5. Admin escucha → Actualiza dashboard
```

### Escenario 3: Actualizar Estado en KDS

```
1. KDS → PUT /api/sales/:id (status: 'preparing')
2. API Gateway → Actualiza DB
3. API Gateway → Emite evento 'order:updated'
4. KDS escucha → Actualiza UI
5. Admin escucha → Actualiza estadísticas
```

---

## ✅ Checklist de Implementación

### Backend (API Gateway)
- [ ] Verificar todos los endpoints CRUD existen
- [ ] Instalar Socket.io: `pnpm add socket.io`
- [ ] Configurar Socket.io en index.ts
- [ ] Emitir eventos en cada operación CRUD
- [ ] Agregar CORS para WebSockets

### POS
- [ ] Copiar apiClient.ts si no existe
- [ ] Reemplazar fetch directo por api client
- [ ] Configurar Socket.io client
- [ ] Implementar listeners de eventos
- [ ] Agregar auto-refetch en useEffect

### Admin Panel
- [ ] Crear/copiar apiClient.ts
- [ ] Reemplazar TODAS las llamadas fetch directas
- [ ] Configurar Socket.io client
- [ ] Implementar listeners de eventos
- [ ] Refrescar listas al recibir eventos

### KDS
- [ ] Crear apiClient.ts
- [ ] Eliminar datos mock
- [ ] Consumir /api/sales
- [ ] Configurar Socket.io client
- [ ] Escuchar 'sale:created' para nuevos pedidos
- [ ] Implementar actualización de estados

---

## 🚀 Prioridades

### Fase 1 (Crítico - Hacer YA)
1. ✅ Verificar que API Gateway tiene todos los endpoints
2. ✅ Unificar API client en todos los módulos
3. ✅ Eliminar datos mock del KDS
4. ✅ Configurar KDS para consumir /api/sales

### Fase 2 (Importante - Siguiente)
1. Instalar Socket.io en backend y frontends
2. Implementar eventos básicos (product:created, sale:created)
3. Configurar listeners en cada módulo
4. Probar flujo completo

### Fase 3 (Mejoras - Después)
1. Implementar React Query para cache
2. Agregar manejo de reconexión
3. Implementar optimistic updates
4. Agregar logs de eventos

---

## 🔥 Problemas Actuales y Soluciones

### Problema 1: KDS usa datos mock
**Solución:** Configurar KDS para consumir `/api/sales` con polling cada 5 segundos

### Problema 2: Admin Panel usa fetch directo
**Solución:** Crear apiClient.ts y reemplazar todas las llamadas

### Problema 3: No hay sincronización en tiempo real
**Solución:** Implementar Socket.io o polling como fallback

### Problema 4: Productos creados en Admin no aparecen en POS
**Solución:** Implementar auto-refetch o WebSocket listeners

---

## 📝 Notas Importantes

- **NUNCA** usar datos mock en producción
- **SIEMPRE** validar que la API devuelve datos correctos
- **PROHIBIDO** tener múltiples fuentes de verdad
- **OBLIGATORIO** usar el mismo apiClient en todos los módulos
- **CRÍTICO** manejar errores de red y reconexión

---

## 🎯 Resultado Esperado

**Sistema Sincronizado:**
- ✅ Crear producto en Admin → Aparece en POS inmediatamente
- ✅ Venta en POS → Pedido aparece en KDS en tiempo real
- ✅ Actualizar estado en KDS → Se refleja en Admin
- ✅ Todos los módulos usan la misma base de datos
- ✅ Consistencia de datos garantizada
