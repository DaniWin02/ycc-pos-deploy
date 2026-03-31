# 🎯 IMPLEMENTACIÓN COMPLETA - SISTEMA DE ESTACIONES KDS

## 📊 RESUMEN EJECUTIVO

**Objetivo:** Implementar un sistema robusto de estaciones para el KDS donde cada producto tiene una estación asignada obligatoria, las ventas se distribuyen automáticamente por estación, y cada KDS muestra solo los productos de su estación.

**Estado Actual:**
- ✅ Schema de Prisma actualizado con modelo `Station`
- ✅ Relación `Product.stationId` creada (obligatoria)
- ✅ Script de migración creado
- ✅ API endpoints de estaciones creados
- ✅ Rutas registradas en API Gateway

**Pendiente:**
- ⏳ Ejecutar migración de base de datos
- ⏳ Actualizar Admin Panel
- ⏳ Modificar POS
- ⏳ Implementar Socket.io por estación
- ⏳ Actualizar KDS

---

## 🔧 PASO 1: MIGRACIÓN DE BASE DE DATOS

### 1.1 Generar y Aplicar Migración de Prisma

```bash
cd 03_API_GATEWAY

# Generar migración
npx prisma migrate dev --name add_stations_model

# Esto creará:
# - Tabla Station
# - Campo stationId en Product
# - Relación entre Product y Station
```

### 1.2 Ejecutar Script de Consolidación de Estaciones

```bash
# Compilar TypeScript
npx ts-node scripts/migrate-stations.ts

# O si prefieres compilar primero:
npx tsc scripts/migrate-stations.ts
node scripts/migrate-stations.js
```

**Este script:**
- ✅ Crea 6 estaciones predefinidas
- ✅ Analiza cada producto existente
- ✅ Asigna estación automáticamente por nombre/categoría
- ✅ Muestra distribución final

**Estaciones creadas:**
1. **Bar** (azul) - Bebidas, cervezas, vinos
2. **Parrilla** (rojo) - Carnes, hamburguesas, asados
3. **Cocina Fría** (verde) - Ensaladas, frutas, sandwiches
4. **Cocina Caliente** (naranja) - Sopas, pastas, guisados
5. **Postres** (rosa) - Pasteles, helados, flanes
6. **Cocina General** (gris) - Todo lo demás

---

## 🔧 PASO 2: ACTUALIZAR ADMIN PANEL

### 2.1 Crear Componente de Selector de Estación

**Archivo:** `06_ADMIN_PANEL/src/components/StationSelector.tsx`

```tsx
import React, { useEffect, useState } from 'react';

interface Station {
  id: string;
  name: string;
  displayName: string;
  color?: string;
}

interface StationSelectorProps {
  value: string;
  onChange: (stationId: string) => void;
  required?: boolean;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  value,
  onChange,
  required = true
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3004/api/stations')
      .then(res => res.json())
      .then(data => {
        setStations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando estaciones:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando estaciones...</div>;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Estación {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Seleccionar estación...</option>
        {stations.map(station => (
          <option key={station.id} value={station.id}>
            {station.displayName}
          </option>
        ))}
      </select>
    </div>
  );
};
```

### 2.2 Actualizar Formulario de Productos

**Archivo:** `06_ADMIN_PANEL/src/pages/ProductsPage.tsx` (o similar)

```tsx
import { StationSelector } from '../components/StationSelector';

// En el formulario de crear/editar producto:
<StationSelector
  value={formData.stationId}
  onChange={(stationId) => setFormData({ ...formData, stationId })}
  required={true}
/>
```

### 2.3 Actualizar Validación al Guardar Producto

```tsx
const handleSaveProduct = async () => {
  // Validar que tenga estación asignada
  if (!formData.stationId) {
    alert('Debe seleccionar una estación para el producto');
    return;
  }

  // Continuar con el guardado normal...
  const response = await fetch('http://localhost:3004/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  // ...
};
```

---

## 🔧 PASO 3: ACTUALIZAR RUTAS DE PRODUCTOS (BACKEND)

### 3.1 Modificar Endpoint POST /api/products

**Archivo:** `03_API_GATEWAY/src/routes/products.routes.ts`

```typescript
router.post('/', async (req, res) => {
  try {
    const { name, sku, categoryId, stationId, price, cost, /* ... */ } = req.body;

    // VALIDACIÓN OBLIGATORIA
    if (!stationId) {
      return res.status(400).json({ 
        error: 'Estación es requerida',
        details: 'Todos los productos deben tener una estación asignada'
      });
    }

    // Verificar que la estación existe
    const station = await prisma.station.findUnique({
      where: { id: stationId }
    });

    if (!station) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        categoryId,
        stationId, // OBLIGATORIO
        price,
        cost,
        // ... otros campos
      },
      include: {
        category: true,
        station: true // Incluir estación en respuesta
      }
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error creando producto', details: error.message });
  }
});
```

### 3.2 Incluir Station en GET /api/products

```typescript
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        station: true // IMPORTANTE: Incluir estación
      }
    });
    res.json(products);
  } catch (error: any) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
});
```

---

## 🔧 PASO 4: MODIFICAR POS PARA INCLUIR ESTACIÓN

### 4.1 Actualizar Cart Store

**Archivo:** `04_CORE_POS/src/stores/cart.store.ts`

```typescript
// En la función completeSale:
const items = items.map(item => ({
  productId: item.productId,
  name: item.name,
  quantity: item.quantity,
  unitPrice: item.unitPrice,
  stationId: item.station?.id, // AGREGAR ESTO
  stationName: item.station?.name, // AGREGAR ESTO
  modifiers: item.modifiers || []
}));

// Enviar al backend
const response = await fetch(`${apiUrl}/api/sales`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items, // Ahora incluye stationId y stationName
    totalAmount,
    paymentMethod,
    customerName,
    notes
  })
});
```

---

## 🔧 PASO 5: BACKEND - AGRUPAR POR ESTACIÓN Y SOCKET.IO

### 5.1 Modificar Endpoint POST /api/sales

**Archivo:** `03_API_GATEWAY/src/routes/sales.routes.ts`

```typescript
router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, customerName, notes } = req.body;

    // Crear orden
    const order = await prisma.order.create({
      data: {
        folio: `SALE-${Date.now().toString(36).toUpperCase()}`,
        totalAmount,
        status: 'PENDING',
        // ... otros campos
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            productName: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            // ... otros campos
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                station: true // IMPORTANTE
              }
            }
          }
        }
      }
    });

    // AGRUPAR POR ESTACIÓN
    const groupedByStation = new Map<string, any[]>();

    order.items.forEach(item => {
      const stationId = item.product.station.id;
      const stationName = item.product.station.name;

      if (!groupedByStation.has(stationId)) {
        groupedByStation.set(stationId, []);
      }

      groupedByStation.get(stationId)!.push({
        ...item,
        stationName: item.product.station.displayName
      });
    });

    // EMITIR SOCKET.IO POR ESTACIÓN
    const io = req.app.get('io');
    if (io) {
      groupedByStation.forEach((items, stationId) => {
        const stationName = items[0].stationName;

        // Emitir a la sala de la estación
        io.to(`station-${stationId}`).emit('order:new', {
          orderId: order.id,
          folio: order.folio,
          station: stationName,
          items: items,
          customerName: order.customerName,
          createdAt: order.createdAt
        });

        console.log(`📡 Orden ${order.folio} enviada a estación: ${stationName} (${items.length} items)`);
      });
    }

    res.status(201).json(order);
  } catch (error: any) {
    console.error('Error creando venta:', error);
    res.status(500).json({ error: 'Error creando venta', details: error.message });
  }
});
```

### 5.2 Configurar Socket.IO Rooms

**Archivo:** `03_API_GATEWAY/src/index.ts`

```typescript
// Después de crear el servidor Socket.io:
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado:', socket.id);

  // Unirse a una estación
  socket.on('join-station', (stationId: string) => {
    socket.join(`station-${stationId}`);
    console.log(`📍 Socket ${socket.id} se unió a estación: ${stationId}`);
  });

  // Salir de una estación
  socket.on('leave-station', (stationId: string) => {
    socket.leave(`station-${stationId}`);
    console.log(`📍 Socket ${socket.id} salió de estación: ${stationId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});
```

---

## 🔧 PASO 6: ACTUALIZAR KDS

### 6.1 Modificar Selector de Estación

**Archivo:** `05_KDS_SYSTEM/src/App.tsx`

```tsx
// Cargar estaciones desde API
const [stations, setStations] = useState<Station[]>([]);

useEffect(() => {
  fetch('http://localhost:3004/api/stations')
    .then(res => res.json())
    .then(data => setStations(data))
    .catch(err => console.error('Error cargando estaciones:', err));
}, []);

// Selector de estación
{!stationId && (
  <div className="grid grid-cols-2 gap-4">
    {stations.map(station => (
      <button
        key={station.id}
        onClick={() => {
          setStationId(station.id);
          // Conectar Socket.io a la estación
          socket.emit('join-station', station.id);
        }}
        style={{ backgroundColor: station.color }}
        className="p-8 rounded-lg text-white text-2xl font-bold"
      >
        {station.displayName}
      </button>
    ))}
  </div>
)}
```

### 6.2 Conectar Socket.io por Estación

**Archivo:** `05_KDS_SYSTEM/src/stores/useKdsStore.ts`

```typescript
// Conectar a Socket.io cuando se selecciona estación
setStationId: (stationId) => {
  set({ stationId });

  // Conectar Socket.io
  const socket = io('http://localhost:3004');

  socket.on('connect', () => {
    console.log('🔌 Conectado a Socket.io');
    socket.emit('join-station', stationId);
  });

  socket.on('order:new', (data) => {
    console.log('📥 Nueva orden recibida:', data);
    
    // Agregar ticket al KDS
    const ticket: KdsTicket = {
      id: data.orderId,
      folio: data.folio,
      items: data.items.map((item: any) => ({
        id: item.id,
        name: item.productName,
        quantity: item.quantity,
        notes: '',
        status: 'PENDING'
      })),
      status: 'NEW',
      createdAt: new Date(data.createdAt),
      table: data.customerName,
      priority: 'normal',
      tipo: 'MESA'
    };

    get().addTicket(ticket);
  });

  socket.on('order:updated', (data) => {
    console.log('🔄 Orden actualizada:', data);
    // Actualizar ticket existente
  });
},
```

### 6.3 Filtrar Órdenes por Estación

```typescript
loadTickets: async () => {
  const { stationId } = get();
  if (!stationId) return;

  try {
    // Cargar solo órdenes de esta estación
    const response = await fetch(
      `http://localhost:3004/api/orders?station=${stationId}&status=PENDING,PREPARING,READY`
    );
    const orders = await response.json();

    // Filtrar items que pertenecen a esta estación
    const tickets = orders.map((order: any) => ({
      id: order.id,
      folio: order.folio,
      items: order.items.filter((item: any) => 
        item.product.stationId === stationId
      ),
      // ... resto de campos
    })).filter((ticket: any) => ticket.items.length > 0);

    set({ tickets });
  } catch (error) {
    console.error('Error cargando tickets:', error);
  }
},
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Base de Datos
- [ ] Ejecutar `npx prisma migrate dev --name add_stations_model`
- [ ] Ejecutar `npx ts-node scripts/migrate-stations.ts`
- [ ] Verificar que todos los productos tengan `stationId`

### Backend (API Gateway)
- [ ] Actualizar `products.routes.ts` para validar `stationId`
- [ ] Modificar `sales.routes.ts` para agrupar por estación
- [ ] Configurar Socket.io rooms en `index.ts`
- [ ] Reiniciar API Gateway

### Admin Panel
- [ ] Crear componente `StationSelector`
- [ ] Actualizar formulario de productos
- [ ] Agregar validación de estación obligatoria
- [ ] Probar crear/editar productos

### POS
- [ ] Actualizar `cart.store.ts` para incluir estación
- [ ] Verificar que productos tengan `station` en respuesta del API
- [ ] Probar crear venta y verificar logs

### KDS
- [ ] Actualizar selector de estación con API
- [ ] Implementar Socket.io por estación
- [ ] Filtrar órdenes por estación
- [ ] Probar recepción de órdenes en tiempo real

---

## 🧪 PRUEBAS

### Prueba 1: Asignación de Estación
1. Ir al Admin Panel
2. Crear nuevo producto
3. Verificar que selector de estación sea obligatorio
4. Asignar estación y guardar
5. Verificar en base de datos que `stationId` esté presente

### Prueba 2: Distribución por Estación
1. Crear venta en POS con productos de diferentes estaciones:
   - 1 Coca Cola (Bar)
   - 1 Hamburguesa (Parrilla)
   - 1 Ensalada (Cocina Fría)
2. Verificar logs del backend:
   ```
   📡 Orden SALE-XXX enviada a estación: Bar (1 items)
   📡 Orden SALE-XXX enviada a estación: Parrilla (1 items)
   📡 Orden SALE-XXX enviada a estación: Cocina Fría (1 items)
   ```

### Prueba 3: KDS por Estación
1. Abrir 3 ventanas de KDS
2. Seleccionar estación diferente en cada una:
   - KDS 1: Bar
   - KDS 2: Parrilla
   - KDS 3: Cocina Fría
3. Crear venta con productos mixtos
4. Verificar que cada KDS reciba SOLO sus productos

---

## 🚨 TROUBLESHOOTING

### Error: "Column 'stationId' cannot be null"
**Causa:** Productos sin estación asignada
**Solución:** Ejecutar script de migración nuevamente

### Error: "Station not found"
**Causa:** Estaciones no creadas en DB
**Solución:** Verificar que script de migración se ejecutó correctamente

### KDS no recibe órdenes
**Causa:** Socket.io no conectado a sala correcta
**Solución:** Verificar logs de `join-station` en backend

### Productos aparecen en todas las estaciones
**Causa:** Filtrado por estación no implementado
**Solución:** Revisar lógica de filtrado en KDS

---

## 📚 DOCUMENTACIÓN ADICIONAL

### Estructura de Datos

```typescript
// Station
{
  id: string;
  name: string;           // "bar", "parrilla", etc.
  displayName: string;    // "Bar", "Parrilla", etc.
  color: string;          // "#3B82F6"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Product (actualizado)
{
  id: string;
  name: string;
  stationId: string;      // OBLIGATORIO
  station: Station;       // Relación
  // ... otros campos
}

// Order Item (con estación)
{
  id: string;
  productId: string;
  product: {
    station: Station;     // Incluir en queries
  }
  // ... otros campos
}
```

### Endpoints API

```
GET    /api/stations              - Listar estaciones
GET    /api/stations/:id          - Obtener estación
POST   /api/stations              - Crear estación
PUT    /api/stations/:id          - Actualizar estación
DELETE /api/stations/:id          - Desactivar estación

GET    /api/products              - Listar productos (incluye station)
POST   /api/products              - Crear producto (requiere stationId)

POST   /api/sales                 - Crear venta (agrupa por estación)
GET    /api/orders?station=:id    - Filtrar órdenes por estación
```

### Eventos Socket.io

```typescript
// Cliente → Servidor
socket.emit('join-station', stationId);
socket.emit('leave-station', stationId);

// Servidor → Cliente
socket.on('order:new', { orderId, folio, station, items });
socket.on('order:updated', { orderId, status });
```

---

## 🎯 RESULTADO ESPERADO

**Flujo Completo:**

```
1. Admin crea producto "Hamburguesa" → Asigna a "Parrilla"
   ↓
2. POS crea venta con:
   - Hamburguesa (Parrilla)
   - Coca Cola (Bar)
   - Ensalada (Cocina Fría)
   ↓
3. Backend agrupa items por estación
   ↓
4. Socket.io emite a 3 salas:
   - station-parrilla → Hamburguesa
   - station-bar → Coca Cola
   - station-cocina-fria → Ensalada
   ↓
5. KDS de Parrilla recibe SOLO Hamburguesa
   KDS de Bar recibe SOLO Coca Cola
   KDS de Cocina Fría recibe SOLO Ensalada
```

**Beneficios:**
- ✅ Cada estación ve solo lo que le corresponde
- ✅ No hay confusión en cocina
- ✅ Distribución automática
- ✅ Escalable a N estaciones
- ✅ Centralizado en backend
- ✅ Tiempo real con Socket.io

---

## 📞 SOPORTE

Si encuentras problemas durante la implementación, revisa:
1. Logs del API Gateway
2. Logs del navegador (consola)
3. Base de datos (Prisma Studio: `npx prisma studio`)
4. Conexiones Socket.io (Network tab en DevTools)
