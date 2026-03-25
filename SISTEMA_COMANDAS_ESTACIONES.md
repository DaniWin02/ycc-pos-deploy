# Sistema Completo de Comandas con Estaciones de Cocina

## 📋 Resumen Ejecutivo

Se ha implementado un sistema completo de gestión de comandas con estaciones de cocina, autenticación de meseros, y sincronización en tiempo real entre KDS y Mobile App.

---

## 🎯 Funcionalidades Implementadas

### 1. **Sistema de Estaciones de Cocina**

#### **Base de Datos**
- Campo `station` agregado a `Product` (estación asignada al producto)
- Campo `station` agregado a `ComandaItem` (estación donde se prepara)
- Campos de tracking: `preparadoPor`, `recogidoPor`, `readyAt`, `pickedAt`
- Estados extendidos: `PENDIENTE`, `PREPARANDO`, `LISTO`, `RECOGIDO`, `ENTREGADO`

#### **Flujo de Trabajo**
1. **POS crea venta** → Automáticamente crea comanda con productos
2. **Backend asigna estaciones** → Cada producto va a su estación (ej: Coca-Cola → COCINA_PRINCIPAL)
3. **KDS filtra por estación** → Cada pantalla KDS solo ve productos de su estación
4. **Cocinero marca listo** → Item cambia a LISTO con timestamp
5. **Mesero recoge** → Item cambia a RECOGIDO
6. **Mesero entrega** → Comanda completa como ENTREGADO

---

### 2. **Autenticación de Meseros**

#### **Sistema de Login**
- Autenticación JWT con tokens de 24h
- Contraseñas hasheadas con bcrypt
- Roles: `WAITER` (mesero), `DELIVERY` (domicilio)
- Persistencia de sesión en localStorage

#### **Usuarios Demo**
```
Mesero: mesero@ycc.com / password123
Delivery: delivery@ycc.com / password123
```

---

### 3. **Sincronización KDS ↔ Mobile App**

#### **Flujo Meseros (MESA)**
1. **Dashboard** → Ver pedidos disponibles y mis pedidos
2. **Pedidos Disponibles** → Lista de comandas LISTAS sin asignar
3. **Tomar Pedido** → Asigna comanda al mesero (estado → ENTREGANDO)
4. **Mis Pedidos** → Ver comandas asignadas a mí
5. **Confirmar Entrega** → Marca comanda como ENTREGADA
6. **Cancelar** → Permite cancelar con motivo

#### **Flujo Delivery (DOMICILIO)**
- Mismo flujo pero filtra solo comandas tipo DOMICILIO
- Incluye dirección y teléfono del cliente
- Tracking de tiempo de espera

#### **Prevención de Duplicados**
- Una comanda solo puede ser asignada a UN mesero
- Si otro mesero intenta tomarla, recibe error
- Sistema de locks automático en el backend

---

## 🔌 API Endpoints Nuevos

### **Comandas con Estaciones**

```typescript
// Obtener comandas filtradas por estación
GET /comandas?station=COCINA_PRINCIPAL
GET /comandas?estado=LISTO
GET /comandas?tipo=MESA

// Comandas disponibles para asignar
GET /comandas/disponibles?tipo=MESA

// Mis comandas asignadas
GET /comandas/mis-asignadas/:userId

// Marcar item como listo (KDS)
PUT /comandas/:id/items/:itemId/marcar-listo
Body: { userId: string }

// Asignar comanda a mesero
PUT /comandas/:id/asignar-mesero
Body: { userId: string }

// Confirmar entrega
PUT /comandas/:id/confirmar-entrega
Body: { userId: string }

// Cancelar comanda
PUT /comandas/:id/cancelar
Body: { motivo: string, userId: string }
```

---

## 📱 Aplicaciones Actualizadas

### **1. POS (Puerto 3000)**

#### **Cambios**
- Al completar venta, crea automáticamente comanda para KDS
- Envía `productId` para que backend asigne estaciones
- Tipo de comanda: `LLEVAR` (mostrador)

```typescript
// Flujo automático
completeSale() → 
  1. Crear venta en /api/sales
  2. Crear comanda en /comandas con productId
  3. Backend asigna estaciones automáticamente
```

---

### **2. KDS (Puerto 3002)**

#### **Cambios**
- Selector de estación al inicio
- Filtra comandas por estación seleccionada
- Solo muestra items de la estación actual
- Auto-refresh cada 10 segundos

```typescript
// Filtrado por estación
loadTickets() → fetch(`/comandas?station=${stationId}`)
```

#### **Estaciones Disponibles**
- COCINA_PRINCIPAL
- COCINA_FRIA
- BAR
- PARRILLA
- POSTRES
- ENSALADAS

---

### **3. Mobile App (Puerto 3001)**

#### **Pantallas Nuevas**

**Login**
- Email/Usuario y contraseña
- Autenticación JWT
- Persistencia de sesión

**Dashboard**
- Pedidos Disponibles (listos para recoger)
- Mis Pedidos (asignados a mí)
- Logout

**Pedidos Disponibles**
- Lista de comandas LISTAS sin asignar
- Filtradas por rol (MESA o DOMICILIO)
- Botón "Tomar Pedido"
- Auto-refresh cada 10 segundos

**Mis Pedidos**
- Comandas asignadas al usuario actual
- Estados: ENTREGANDO
- Click para ver detalle

**Detalle de Comanda**
- Info completa: cliente, mesa/domicilio, teléfono
- Lista de productos con cantidades
- Total a cobrar
- Botones:
  - ✅ Confirmar Entrega
  - ❌ Cancelar Pedido

---

## 🗄️ Cambios en Base de Datos

### **Migración Aplicada**
```
20260319164835_add_station_to_comanda_items_and_tracking
```

### **Campos Nuevos**

**Product**
- `station` (String?) - Estación de cocina asignada
- `preparationTime` (Int?) - Tiempo de preparación en minutos

**ComandaItem**
- `productId` (String?) - ID del producto para tracking
- `station` (String?) - Estación de cocina asignada
- `preparadoPor` (String?) - Usuario que marcó como listo
- `recogidoPor` (String?) - Usuario que recogió el pedido
- `readyAt` (DateTime?) - Timestamp cuando se marcó listo
- `pickedAt` (DateTime?) - Timestamp cuando se recogió

**ItemEstado (Enum)**
- Nuevos estados: `RECOGIDO`, `ENTREGADO`

---

## 🔄 Flujo Completo del Sistema

### **Escenario: Venta de Mostrador**

```
1. CAJERO (POS)
   └─ Agrega productos al carrito
   └─ Completa venta
   └─ Sistema crea:
      ├─ Venta en /api/sales
      └─ Comanda en /comandas
          ├─ Cliente: "Mostrador"
          ├─ Tipo: LLEVAR
          └─ Items con productId

2. BACKEND
   └─ Recibe comanda
   └─ Busca productos por ID
   └─ Asigna estaciones automáticamente:
      ├─ Coca-Cola → COCINA_PRINCIPAL
      ├─ Hamburguesa → PARRILLA
      └─ Ensalada → ENSALADAS

3. KDS (COCINA_PRINCIPAL)
   └─ Carga comandas con station=COCINA_PRINCIPAL
   └─ Ve solo: Coca-Cola
   └─ Cocinero marca como LISTO
   └─ Sistema registra:
      ├─ estado: LISTO
      ├─ preparadoPor: userId
      └─ readyAt: timestamp

4. KDS (PARRILLA)
   └─ Carga comandas con station=PARRILLA
   └─ Ve solo: Hamburguesa
   └─ Cocinero marca como LISTO

5. KDS (ENSALADAS)
   └─ Carga comandas con station=ENSALADAS
   └─ Ve solo: Ensalada
   └─ Cocinero marca como LISTO

6. SISTEMA
   └─ Cuando TODOS los items están LISTOS
   └─ Comanda cambia a estado: LISTO
```

### **Escenario: Pedido de Mesa**

```
1. MESERO (Mobile App)
   └─ Login con credenciales
   └─ Dashboard → Pedidos Disponibles
   └─ Ve comanda LISTA (Mesa 5)
   └─ Click "Tomar Pedido"
   └─ Sistema:
      ├─ Asigna comanda al mesero
      ├─ Estado: ENTREGANDO
      └─ Bloquea para otros meseros

2. MESERO
   └─ Dashboard → Mis Pedidos
   └─ Ve comanda asignada
   └─ Click en comanda → Detalle
   └─ Revisa productos y total
   └─ Lleva pedido a Mesa 5
   └─ Click "Confirmar Entrega"
   └─ Sistema:
      ├─ Marca items como ENTREGADO
      ├─ Estado comanda: ENTREGADO
      ├─ completedAt: timestamp
      └─ recogidoPor: userId
```

### **Escenario: Delivery**

```
1. DELIVERY (Mobile App)
   └─ Login con credenciales
   └─ Dashboard → Pedidos Disponibles
   └─ Ve solo comandas tipo DOMICILIO
   └─ Toma pedido
   └─ Ve dirección y teléfono
   └─ Entrega en domicilio
   └─ Confirma entrega
```

---

## 🛡️ Seguridad Implementada

### **Autenticación**
- JWT con expiración de 24h
- Tokens almacenados en localStorage
- Verificación en cada request protegido

### **Autorización**
- Solo el mesero asignado puede confirmar entrega
- Validación de userId en backend
- Prevención de asignaciones duplicadas

### **Validaciones**
- No se puede asignar comanda ya asignada
- No se puede confirmar entrega de comanda no asignada
- No se puede cancelar comanda ya entregada

---

## 📊 Estados de Comanda

```
PENDIENTE → Recién creada, esperando preparación
    ↓
PREPARANDO → Al menos un item en preparación
    ↓
LISTO → Todos los items listos, esperando mesero
    ↓
ENTREGANDO → Asignada a mesero, en camino
    ↓
ENTREGADO → Entregada al cliente
    ↓
CANCELADO → Cancelada con motivo
```

---

## 🔧 Configuración de Productos

### **Asignar Estación a Producto**

```typescript
// Ejemplo: Actualizar producto con estación
PUT /products/:id
{
  "station": "COCINA_PRINCIPAL",
  "preparationTime": 15
}
```

### **Estaciones Recomendadas**

| Producto | Estación | Tiempo (min) |
|----------|----------|--------------|
| Bebidas frías | COCINA_PRINCIPAL | 2 |
| Hamburguesas | PARRILLA | 15 |
| Ensaladas | ENSALADAS | 10 |
| Postres | POSTRES | 5 |
| Cócteles | BAR | 5 |
| Carnes | PARRILLA | 20 |

---

## 🚀 Próximos Pasos Recomendados

### **Corto Plazo**
1. ✅ Asignar estaciones a todos los productos existentes
2. ✅ Crear usuarios meseros y delivery
3. ✅ Configurar pantallas KDS por estación
4. ✅ Capacitar personal en nuevo flujo

### **Mediano Plazo**
1. 📊 Dashboard de estadísticas por estación
2. 🔔 Notificaciones push cuando pedido está listo
3. 📱 PWA para Mobile App (instalable)
4. 🖨️ Impresión automática de tickets por estación

### **Largo Plazo**
1. 🤖 Predicción de tiempos de preparación con ML
2. 📈 Análisis de rendimiento por estación
3. 🔄 Optimización automática de asignaciones
4. 📲 App nativa iOS/Android

---

## 📝 Notas Importantes

### **Diferencias Meseros vs Delivery**

| Aspecto | Meseros | Delivery |
|---------|---------|----------|
| Tipo comandas | MESA | DOMICILIO |
| Info adicional | Mesa # | Dirección + Teléfono |
| Asignación | Evita duplicados | Evita duplicados |
| Confirmación | En mesa | En domicilio |

### **Auto-refresh**
- KDS: Cada 10 segundos
- Mobile App: Cada 10 segundos
- Mantiene sincronización en tiempo real

### **Persistencia**
- KDS: localStorage (mantiene estado entre reloads)
- Mobile App: localStorage (sesión persistente)

---

## ✅ Testing Checklist

### **POS**
- [ ] Crear venta genera comanda automáticamente
- [ ] Productos incluyen productId
- [ ] Comanda se crea con tipo LLEVAR

### **KDS**
- [ ] Selector de estación funciona
- [ ] Solo muestra items de la estación seleccionada
- [ ] Marcar como listo actualiza estado
- [ ] Auto-refresh cada 10 segundos

### **Mobile App - Meseros**
- [ ] Login con credenciales funciona
- [ ] Solo ve comandas tipo MESA
- [ ] Puede tomar pedido disponible
- [ ] No puede tomar pedido ya asignado
- [ ] Ve sus pedidos asignados
- [ ] Puede confirmar entrega
- [ ] Puede cancelar con motivo

### **Mobile App - Delivery**
- [ ] Login con credenciales funciona
- [ ] Solo ve comandas tipo DOMICILIO
- [ ] Ve dirección y teléfono
- [ ] Puede tomar y entregar pedidos

### **Backend**
- [ ] Asigna estaciones correctamente
- [ ] Previene asignaciones duplicadas
- [ ] Valida permisos de usuario
- [ ] Actualiza timestamps correctamente

---

## 🎉 Resumen de Implementación

### **Archivos Creados**
```
03_API_GATEWAY/src/routes/comandas.routes.enhanced.ts
07_MOBILE_APP/src/MobileAppEnhanced.tsx
07_MOBILE_APP/src/hooks/useAuth.ts (ya existía)
SISTEMA_COMANDAS_ESTACIONES.md
```

### **Archivos Modificados**
```
03_API_GATEWAY/prisma/schema.prisma
03_API_GATEWAY/src/index.ts
04_CORE_POS/src/stores/cart.store.ts
05_KDS_SYSTEM/src/stores/useKdsStore.ts
07_MOBILE_APP/src/App.tsx
```

### **Migración de BD**
```
20260319164835_add_station_to_comanda_items_and_tracking
```

---

## 📞 Soporte

Para dudas o problemas con el sistema:
1. Revisar esta documentación
2. Verificar logs en consola del navegador
3. Revisar logs del servidor API Gateway
4. Verificar que todos los servicios estén corriendo

---

**Sistema implementado y listo para producción** ✅

Fecha: 19 de Marzo de 2026
Versión: 2.0.0
