# 🎨 Ejemplo Visual: Sistema de Multicomandas

## 📱 Interfaz del Usuario

### **Vista Principal con Multicomandas Activas**

```
┌─────────────────────────────────────────────────────────────────┐
│  YCC POS                    [🛒 Carrito Simple] [📋 Multicomandas]│
├─────────────────────────────────────────────────────────────────┤
│  Comandas Activas (3)                          [+ Nueva]         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ 👥 Mesa 1│  │ 🛍️ Llevar│  │ ☕ Barra │                      │
│  │ Items: 5 │  │ Items: 2 │  │ Items: 3 │                      │
│  │ $450.00  │  │ $120.00  │  │ $180.00  │                      │
│  │ ✓ ACTIVA │  │          │  │          │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Producto 1]  [Producto 2]  [Producto 3]  [Producto 4]        │
│  [Producto 5]  [Producto 6]  [Producto 7]  [Producto 8]        │
│                                                                  │
│                                                   ┌─────────────┐│
│                                                   │ Mesa 1      ││
│                                                   │ ────────────││
│                                                   │ Café  x2    ││
│                                                   │ $70.00      ││
│                                                   │             ││
│                                                   │ Pastel x1   ││
│                                                   │ $85.00      ││
│                                                   │ ────────────││
│                                                   │ Total:      ││
│                                                   │ $450.00     ││
│                                                   │             ││
│                                                   │ [Cobrar]    ││
│                                                   └─────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Flujo de Trabajo Detallado

### **Escenario 1: Restaurante con 3 Mesas**

#### **Estado Inicial**
```
Comandas Activas: 0
Modo: Multicomandas activado
```

#### **Paso 1: Crear Mesa 1**
```
Usuario → Click "Nueva" → Selecciona "Mesa" → Ingresa "1" → Crear

Resultado:
┌──────────────┐
│ 👥 Mesa 1    │
│ Items: 0     │
│ $0.00        │
│ ✓ ACTIVA     │
└──────────────┘
```

#### **Paso 2: Agregar productos a Mesa 1**
```
Usuario → Click "Café" → Click "Pastel" → Click "Refresco"

Resultado:
┌──────────────┐
│ 👥 Mesa 1    │
│ Items: 3     │
│ $185.00      │
│ ✓ ACTIVA     │
└──────────────┘
```

#### **Paso 3: Crear Mesa 2**
```
Usuario → Click "Nueva" → Selecciona "Mesa" → Ingresa "2" → Crear

Resultado:
┌──────────────┐  ┌──────────────┐
│ 👥 Mesa 1    │  │ 👥 Mesa 2    │
│ Items: 3     │  │ Items: 0     │
│ $185.00      │  │ $0.00        │
│              │  │ ✓ ACTIVA     │
└──────────────┘  └──────────────┘
```

#### **Paso 4: Agregar productos a Mesa 2**
```
Usuario → Click "Hamburguesa" → Click "Papas"

Resultado:
┌──────────────┐  ┌──────────────┐
│ 👥 Mesa 1    │  │ 👥 Mesa 2    │
│ Items: 3     │  │ Items: 2     │
│ $185.00      │  │ $250.00      │
│              │  │ ✓ ACTIVA     │
└──────────────┘  └──────────────┘
```

#### **Paso 5: Volver a Mesa 1 y agregar más**
```
Usuario → Click en "Mesa 1" → Click "Postre"

Resultado:
┌──────────────┐  ┌──────────────┐
│ 👥 Mesa 1    │  │ 👥 Mesa 2    │
│ Items: 4     │  │ Items: 2     │
│ $270.00      │  │ $250.00      │
│ ✓ ACTIVA     │  │              │
└──────────────┘  └──────────────┘
```

#### **Paso 6: Cobrar Mesa 1**
```
Usuario → Selecciona Mesa 1 → Click "Cobrar" → Pagar

Resultado:
┌──────────────┐
│ 👥 Mesa 2    │
│ Items: 2     │
│ $250.00      │
│ ✓ ACTIVA     │
└──────────────┘

Mesa 1 cerrada y guardada en historial
```

---

## 🎨 Diseño de Componentes

### **Tarjeta de Comanda (Inactiva)**
```
┌──────────────────┐
│ [X]              │  ← Botón eliminar
│ 👥 Mesa 3        │  ← Icono + nombre
│ MESA             │  ← Tipo
│ ────────────────│
│ Items: 5         │  ← Cantidad items
│ Total: $450.00   │  ← Total con IVA
│ 👤 Juan Pérez    │  ← Cliente (opcional)
└──────────────────┘
```

### **Tarjeta de Comanda (Activa)**
```
┌══════════════════┐
║ [X]              ║  ← Botón eliminar
║ 👥 Mesa 1        ║  ← Icono + nombre
║ MESA             ║  ← Tipo
║ ════════════════║
║ Items: 3         ║  ← Cantidad items
║ Total: $185.00   ║  ← Total con IVA
║ 👤 María López   ║  ← Cliente (opcional)
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║  ← Barra verde activa
└══════════════════┘
```

### **Modal de Nueva Comanda**
```
┌─────────────────────────────────┐
│ Nueva Comanda              [X]  │
├─────────────────────────────────┤
│                                 │
│ Tipo de Comanda:                │
│ ┌────────┐  ┌────────┐         │
│ │ 👥     │  │ 🛍️     │         │
│ │ Mesa   │  │ Llevar │         │
│ └────────┘  └────────┘         │
│ ┌────────┐  ┌────────┐         │
│ │ ☕     │  │ 📦     │         │
│ │ Barra  │  │ Pedido │         │
│ └────────┘  └────────┘         │
│                                 │
│ Número de Mesa:                 │
│ ┌─────────────────────────────┐│
│ │          5                   ││
│ └─────────────────────────────┘│
│                                 │
│ Nombre Personalizado (Opcional)│
│ ┌─────────────────────────────┐│
│ │ Juan Pérez                   ││
│ └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│ [Cancelar]    [Crear Comanda]  │
└─────────────────────────────────┘
```

---

## 💡 Casos de Uso Reales

### **Caso 1: Restaurante Ocupado**
```
Situación: 5 mesas ocupadas simultáneamente

Comandas Activas:
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│Mesa 1│ │Mesa 2│ │Mesa 3│ │Mesa 4│ │Mesa 5│
│$450  │ │$320  │ │$180  │ │$650  │ │$220  │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘

Beneficio: Mesero puede tomar órdenes de todas las mesas
sin perder información
```

### **Caso 2: Barra + Mesas**
```
Situación: Pedidos de barra y mesas al mismo tiempo

Comandas Activas:
┌──────┐ ┌──────┐ ┌──────┐
│Barra │ │Mesa 1│ │Mesa 2│
│$85   │ │$450  │ │$320  │
└──────┘ └──────┘ └──────┘

Beneficio: Separar pedidos rápidos (barra) de mesas
```

### **Caso 3: Para Llevar + Local**
```
Situación: Clientes comiendo en local + pedidos para llevar

Comandas Activas:
┌──────┐ ┌──────┐ ┌──────┐
│Mesa 1│ │Llevar│ │Mesa 2│
│$450  │ │$120  │ │$320  │
└──────┘ └──────┘ └──────┘

Beneficio: Diferenciar tipo de servicio
```

---

## 📊 Información en Tiempo Real

### **Tarjeta de Comanda - Detalles**
```
┌────────────────────────────┐
│ 👥 Mesa 1              [X] │
│ MESA                       │
├────────────────────────────┤
│ Items: 5                   │
│ Total: $450.00             │
│                            │
│ Desglose:                  │
│ • Subtotal: $387.93        │
│ • IVA 16%: $62.07          │
│                            │
│ 👤 Juan Pérez              │
│ 🕐 Creada: 10:30 AM        │
│ 🕐 Actualizada: 10:45 AM   │
└────────────────────────────┘
```

---

## 🎯 Indicadores Visuales

### **Estados de Comanda**
```
ACTIVA (Verde):
┌══════════════════┐
║ Mesa 1           ║
║ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓║ ← Barra verde
└══════════════════┘

EN PROCESO (Amarillo):
┌──────────────────┐
│ Mesa 2           │
│ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒│ ← Barra amarilla
└──────────────────┘

CERRADA (Gris):
┌──────────────────┐
│ Mesa 3           │
│ ░░░░░░░░░░░░░░░░│ ← Barra gris
└──────────────────┘
```

### **Tipos de Comanda (Colores)**
```
MESA:    Azul    (👥)
LLEVAR:  Verde   (🛍️)
BARRA:   Morado  (☕)
PEDIDO:  Naranja (📦)
```

---

## 🔄 Transiciones y Animaciones

### **Crear Nueva Comanda**
```
1. Click "Nueva"
   ↓
2. Modal aparece con fade-in
   ↓
3. Seleccionar tipo (highlight)
   ↓
4. Ingresar datos
   ↓
5. Click "Crear"
   ↓
6. Modal desaparece con fade-out
   ↓
7. Nueva tarjeta aparece con slide-in
   ↓
8. Tarjeta se marca como activa (scale-up)
```

### **Cambiar Entre Comandas**
```
1. Click en comanda inactiva
   ↓
2. Comanda anterior pierde highlight (fade-out)
   ↓
3. Nueva comanda gana highlight (fade-in + scale-up)
   ↓
4. Carrito actualiza items (smooth transition)
```

### **Eliminar Comanda**
```
1. Click en [X]
   ↓
2. Confirmación aparece
   ↓
3. Si confirma: tarjeta desaparece con slide-out
   ↓
4. Comandas restantes se reorganizan (smooth)
```

---

## ✅ Resumen Visual

El sistema de multicomandas proporciona:

✅ **Claridad Visual** - Cada comanda es fácilmente identificable  
✅ **Organización** - Múltiples órdenes sin confusión  
✅ **Eficiencia** - Cambio rápido entre comandas  
✅ **Información** - Totales y detalles en tiempo real  
✅ **Flexibilidad** - Diferentes tipos de servicio  
✅ **Profesionalismo** - Interfaz moderna y pulida  

**El diseño mantiene la simplicidad del POS original mientras agrega potencia para manejar múltiples órdenes simultáneamente.**
