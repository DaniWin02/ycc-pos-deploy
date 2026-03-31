# 🧪 GUÍA DE PRUEBA - SISTEMA KDS CON FILTRADO POR ESTACIONES

## 📍 ACCESO AL SISTEMA

**URL del KDS:** http://localhost:3002

---

## ✅ PROBLEMA 1 SOLUCIONADO: NAVEGACIÓN AL SELECCIONAR ESTACIÓN

### **Cambios Implementados:**

1. **AppNew.tsx** - Agregado `useEffect` que detecta cuando `stationId` cambia:
```typescript
useEffect(() => {
  if (stationId) {
    console.log('✅ Estación detectada:', stationId)
    setShowStationSelector(false)  // Oculta selector automáticamente
  }
}, [stationId])
```

2. **Flujo de navegación:**
```
Usuario toca estación → setStationId() → useEffect detecta cambio → 
setShowStationSelector(false) → Muestra pantalla principal KDS
```

---

## ✅ PROBLEMA 2 SOLUCIONADO: AISLAMIENTO POR ESTACIONES

### **Filtrado Triple Capa:**

#### **CAPA 1: Backend - Al guardar la venta**
`sales.routes.ts` línea 165:
```typescript
stationId: item.stationId  // Se guarda el stationId de cada item
```

#### **CAPA 2: Store - Al cargar tickets**
`useKdsStore.ts` líneas 312-325:
```typescript
const itemsForThisStation = sale.items.filter((item: any) => {
  const belongsToStation = item.stationId === stationId || 
                          (item.product && item.product.stationId === stationId);
  const isNotDelivered = item.status !== 'DELIVERED';
  
  // Log para verificar
  if (belongsToStation) {
    console.log(`✅ Item "${item.productName}" pertenece a estación ${stationId}`);
  } else {
    console.log(`❌ Item "${item.productName}" NO pertenece a estación ${stationId}`);
  }
  
  return belongsToStation && isNotDelivered;
});
```

#### **CAPA 3: Frontend - Filtrado adicional**
`AppNew.tsx` líneas 48-60:
```typescript
const filteredTickets = tickets.filter(ticket => {
  // Excluir servidos/cancelados
  if (ticket.status === 'SERVED' || ticket.status === 'CANCELLED') return false
  
  // Excluir eliminados
  if (ticket.deletedAt) return false
  
  // Verificar que tenga items (ya filtrados por estación)
  return ticket.items && ticket.items.length > 0
})
```

---

## 🧪 PRUEBA PASO A PASO

### **PASO 1: Abrir KDS**
```
http://localhost:3002
```
**Resultado esperado:** Pantalla de selección de estaciones con cards grandes

---

### **PASO 2: Seleccionar Estación "Parrilla"**
1. Toca el card naranja de "Parrilla"
2. Verifica en la consola del navegador (F12):
```
✅ Estación seleccionada: Parrilla (parrilla-id)
✅ Estación detectada: parrilla-id
📡 Cargando tickets para estación: parrilla-id
```

**Resultado esperado:** 
- ✅ Navega a la pantalla principal del KDS
- ✅ Header muestra "Parrilla" en naranja
- ✅ Badges de conteo visibles

---

### **PASO 3: Crear Venta Mixta en POS**

Abre el POS en http://localhost:3000 y crea una venta con:

| Producto | Categoría | Estación Asignada |
|----------|-----------|-------------------|
| Hamburguesa | Comida | Parrilla |
| Ensalada César | Comida | Cocina Fría |
| Pastel de Chocolate | Postres | Postres |
| Coca Cola | Bebidas | Bar |

**Completa la venta** y anota el número de folio (ej: SALE-001)

---

### **PASO 4: Verificar Filtrado en KDS Parrilla**

En el KDS de Parrilla (http://localhost:3002):

**Resultado esperado:**
- ✅ Aparece un ticket con el folio SALE-001
- ✅ El ticket muestra **SOLO** la Hamburguesa
- ❌ NO muestra Ensalada, Pastel ni Coca Cola

**Verificar en consola:**
```
📦 Procesando venta SALE-001 con 4 items
✅ Item "Hamburguesa" pertenece a estación parrilla-id
❌ Item "Ensalada César" NO pertenece a estación parrilla-id
❌ Item "Pastel de Chocolate" NO pertenece a estación parrilla-id
❌ Item "Coca Cola" NO pertenece a estación parrilla-id
```

---

### **PASO 5: Verificar en Otras Estaciones**

#### **5.1 Abrir KDS en otra ventana/pestaña**
```
http://localhost:3002
```

#### **5.2 Seleccionar "Cocina Fría"**
**Resultado esperado:**
- ✅ Aparece el mismo folio SALE-001
- ✅ Muestra **SOLO** la Ensalada César
- ❌ NO muestra Hamburguesa, Pastel ni Coca Cola

#### **5.3 Seleccionar "Postres"**
**Resultado esperado:**
- ✅ Aparece el mismo folio SALE-001
- ✅ Muestra **SOLO** el Pastel de Chocolate
- ❌ NO muestra Hamburguesa, Ensalada ni Coca Cola

#### **5.4 Seleccionar "Bar"**
**Resultado esperado:**
- ✅ Aparece el mismo folio SALE-001
- ✅ Muestra **SOLO** la Coca Cola
- ❌ NO muestra Hamburguesa, Ensalada ni Pastel

---

### **PASO 6: Probar Acciones Independientes**

#### **6.1 En KDS Parrilla:**
1. Toca "▶ Iniciar" en la Hamburguesa
2. Verifica que cambia a estado PREPARANDO (amarillo)

#### **6.2 En KDS Cocina Fría:**
1. Verifica que la Ensalada sigue en estado NUEVO (azul)
2. Toca "▶ Iniciar" en la Ensalada
3. Verifica que cambia a PREPARANDO

#### **6.3 En KDS Parrilla:**
1. Toca "✓ Marcar Listo" en la Hamburguesa
2. Verifica que cambia a LISTO (verde)
3. Toca "✓ Completar Entrega"
4. **Resultado esperado:** La Hamburguesa desaparece del KDS Parrilla

#### **6.4 Verificar en otras estaciones:**
- ✅ Ensalada sigue visible en Cocina Fría (estado PREPARANDO)
- ✅ Pastel sigue visible en Postres (estado NUEVO)
- ✅ Coca Cola sigue visible en Bar (estado NUEVO)

---

## 🔍 VERIFICACIÓN DE LOGS

### **Logs Esperados en Consola del Navegador:**

#### **Al seleccionar estación:**
```
✅ Estación seleccionada: Parrilla (parrilla-id-123)
✅ Estación detectada: parrilla-id-123
📡 Cargando tickets para estación: parrilla-id-123
```

#### **Al cargar tickets:**
```
📡 Pedidos recibidos del API: 5
🎯 Ventas filtradas para estación parrilla-id-123: 2 de 5
📋 Procesando 2 ventas para filtrar items...

📦 Procesando venta SALE-001 con 4 items
✅ Item "Hamburguesa" pertenece a estación parrilla-id-123
❌ Item "Ensalada César" NO pertenece a estación parrilla-id-123 (stationId del item: cocina-fria-id)
❌ Item "Pastel de Chocolate" NO pertenece a estación parrilla-id-123 (stationId del item: postres-id)
❌ Item "Coca Cola" NO pertenece a estación parrilla-id-123 (stationId del item: bar-id)

✅ Pedidos cargados: 2 | Servidos: 0 | Papelera: 0
```

---

## ❌ PROBLEMAS COMUNES Y SOLUCIONES

### **Problema: No navega al seleccionar estación**

**Solución:**
1. Abre la consola del navegador (F12)
2. Verifica que aparece: `✅ Estación detectada: [id]`
3. Si no aparece, limpia localStorage:
```javascript
localStorage.clear()
location.reload()
```

---

### **Problema: Aparecen productos de otras estaciones**

**Causas posibles:**

1. **Los productos no tienen `stationId` asignado**
   - Verifica en Admin Panel que cada producto tenga una estación
   - Ruta: http://localhost:3003 → Productos → Editar

2. **El POS no está enviando `stationId` en los items**
   - Verifica en `cart.store.ts` línea 119 que incluye `stationId`

3. **El backend no está guardando `stationId`**
   - Verifica en `sales.routes.ts` línea 165

**Verificación rápida:**
```javascript
// En consola del navegador del KDS
console.log(useKdsStore.getState().tickets[0].items)
// Cada item debe tener un campo con el stationId
```

---

### **Problema: Los items no desaparecen al completarlos**

**Solución:**
1. Verifica que el endpoint `/api/order-items/:id/status` existe
2. Verifica en consola del navegador:
```
✅ Items de estación actualizados: 1 items → DELIVERED
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

- [ ] ✅ Al tocar una estación, navega a la pantalla principal
- [ ] ✅ Header muestra el nombre correcto de la estación
- [ ] ✅ Badges de conteo funcionan (Nuevos, Preparando, Listos)
- [ ] ✅ Solo aparecen items de la estación actual
- [ ] ✅ Items de otras estaciones NO aparecen
- [ ] ✅ Al completar un item, desaparece de esa estación
- [ ] ✅ Items de otras estaciones siguen visibles en sus estaciones
- [ ] ✅ Al recargar la página, mantiene la estación seleccionada
- [ ] ✅ Botón "Salir" regresa al selector de estaciones
- [ ] ✅ Logs en consola muestran el filtrado correcto

---

## 🎯 RESULTADO ESPERADO FINAL

**Escenario:** Venta con 4 productos de 4 estaciones diferentes

| Estación | Ve | NO Ve |
|----------|-----|-------|
| Parrilla | Hamburguesa | Ensalada, Pastel, Coca Cola |
| Cocina Fría | Ensalada | Hamburguesa, Pastel, Coca Cola |
| Postres | Pastel | Hamburguesa, Ensalada, Coca Cola |
| Bar | Coca Cola | Hamburguesa, Ensalada, Pastel |

**Cada estación es COMPLETAMENTE INDEPENDIENTE** ✅

---

## 📞 SOPORTE

Si encuentras algún problema:
1. Abre la consola del navegador (F12)
2. Copia los logs que aparecen
3. Verifica que los productos tengan `stationId` en la base de datos
4. Reinicia el KDS: `pnpm dev` en la carpeta `05_KDS_SYSTEM`
