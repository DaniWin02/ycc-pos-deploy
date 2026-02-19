# INVESTIGACIÓN: COSTEO DE RECETAS E INVENTARIO POR INGREDIENTES
## Cómo lo Hacen las Empresas Grandes — Lógica, Funcionamiento y Output
### Fecha: Febrero 2026 | Versión: 1.0

---

## TABLA DE CONTENIDOS — PARTE 2

1. [El Problema del Costeo de Recetas](#1-problema)
2. [Cómo lo Resuelven las Empresas Grandes](#2-empresas-grandes)
3. [Modelo de Datos Completo para Costeo de Recetas](#3-modelo-datos)
4. [Lógica de Costeo: Paso a Paso con Ejemplo Real](#4-lógica-costeo)
5. [Actual vs. Teórico (AvT): La Métrica de Oro](#5-avt)
6. [Deducción Automática de Inventario](#6-deducción)
7. [Multi-Sucursal: Cómo Funciona](#7-multi-sucursal)
8. [Kitchen Display System: Arquitectura Completa](#8-kds)
9. [Flujo Completo End-to-End](#9-flujo-completo)
10. [Modelo de Datos SQL Completo](#10-sql)
11. [Reportes y Outputs Clave](#11-reportes)
12. [Código Open Source de Referencia](#12-código)

---

## 1. EL PROBLEMA DEL COSTEO DE RECETAS

### 1.1 El Escenario Real

Tienes un restaurante. Tu inventario tiene:
- 5 tipos de aceite (oliva, vegetal, coco, aguacate, ajonjolí)
- 5 tipos de jamón (serrano, york, pavo, ibérico, ahumado)
- Quesos, tomates, lechugas, carnes, panes, salsas, especias...

Cada ingrediente tiene un **costo unitario** que cambia con cada compra al proveedor.

Cuando preparas una "Hamburguesa Especial", usas:
- 150g de carne molida res
- 30g de queso cheddar
- 20ml de aceite vegetal
- 50g de lechuga
- 80g de tomate
- 1 pan de hamburguesa
- 15ml de salsa especial (que a su vez es una sub-receta con sus propios ingredientes)

**Las preguntas que el sistema debe responder:**
1. ¿Cuánto cuesta producir esta hamburguesa HOY?
2. ¿Cuánto me queda de cada ingrediente después de vender 50 hamburguesas?
3. ¿Cuánto DEBERÍA haber usado vs. cuánto REALMENTE usé?
4. ¿Cuál es mi margen real por platillo?
5. ¿Qué sucursal está desperdiciando más?
6. ¿Cuándo debo re-ordenar cada ingrediente?

### 1.2 Por Qué es Crítico

```
INDUSTRIA RESTAURANTERA — ESTRUCTURA DE COSTOS TÍPICA:
═══════════════════════════════════════════════════════
  Food Cost (Costo de alimentos):     28-35% de ventas
  Labor Cost (Nómina):                25-35% de ventas
  Overhead (Renta, servicios, etc.):  20-25% de ventas
  ─────────────────────────────────────────────────────
  Margen neto:                         5-15% de ventas

  → Una reducción del 2% en food cost = 
    DUPLICAR el margen neto en muchos casos
```

---

## 2. CÓMO LO RESUELVEN LAS EMPRESAS GRANDES

### 2.1 Sistemas Especializados en Costeo

| Sistema | Usado por | Enfoque |
|---------|-----------|---------|
| **CrunchTime** | Five Guys, Jersey Mike's, sweetgreen | AvT, food cost management, multi-unit |
| **MarketMan** | +15,000 restaurantes globales | Recipe costing, inventory, POS integration |
| **Recipe Costing Software** | Integra con Square, Toast, etc. | Costeo puro de recetas |
| **xtraCHEF** (ahora CrunchTime) | Cadenas medianas-grandes | Invoice processing + food cost |
| **BlueCart** | Restaurantes enterprise | Procurement + inventory |
| **Galley Solutions** | Cadenas grandes | AvT + recipe management |
| **meez** | Chefs profesionales | Recipe costing + training |
| **WISK** | Bares y restaurantes | Inventory + recipe costing |

### 2.2 Patrón Universal: Cómo Funciona en TODOS

Todos los sistemas profesionales siguen el **mismo patrón fundamental**:

```
┌─────────────────────────────────────────────────────────────┐
│                    CICLO DE COSTEO                            │
│                                                              │
│  1. COMPRAS                                                  │
│     Proveedor → Factura → Recepción → Actualización de       │
│     costos de ingredientes                                   │
│                                                              │
│  2. RECETAS (BOM)                                            │
│     Ingrediente + Cantidad + Unidad = Costo por porción      │
│     Sub-recetas se resuelven recursivamente                  │
│                                                              │
│  3. VENTA (POS)                                              │
│     Venta de platillo → Deducción automática de              │
│     ingredientes del inventario (teórico)                    │
│                                                              │
│  4. CONTEO FÍSICO                                            │
│     Inventario real contado periódicamente                   │
│                                                              │
│  5. ANÁLISIS (AvT)                                           │
│     Teórico vs. Real = Varianza                              │
│     Varianza = Desperdicio + Robo + Error de porción         │
│                                                              │
│  6. ACCIÓN                                                   │
│     Ajustar porciones, cambiar proveedores, capacitar,       │
│     modificar menú, investigar robo                          │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 MarketMan — Cómo Funciona (Detalle)

**Fuente**: Documentación oficial de MarketMan (marketman.com)

**Inventario Perpetuo:**
1. Las **compras** al proveedor **suman** al inventario
2. Las **ventas** registradas en el POS **restan** ingredientes automáticamente
3. El sistema mantiene un **inventario teórico** en tiempo real

**Recipe Costing:**
- Cada platillo del menú tiene una receta con ingredientes porcionados
- Los costos se actualizan **dinámicamente** cuando llega una nueva factura del proveedor
- Reportes de **profitabilidad por platillo** actualizados en tiempo real
- **AI** para optimizar márgenes y reducir desperdicio

**Actual vs. Teórico:**
- Reportes que comparan uso real vs. uso teórico
- Identifican varianzas por ingrediente
- Detectan robo, desperdicio y sobre-porcionamiento

**Multi-Ubicación:**
- Feature "HQ" para gestionar todas las ubicaciones desde un solo lugar
- Comparación de food cost entre sucursales
- Estándares de calidad consistentes entre unidades

### 2.4 CrunchTime — Cómo Funciona (Detalle)

**Fuente**: Documentación oficial de CrunchTime (crunchtime.com)

CrunchTime es usado por las **cadenas más grandes** (Five Guys, Jersey Mike's, sweetgreen).

**Food Cost Management (AvT):**
- Dashboard que muestra varianza Actual vs. Teórico al abrir
- Tracking de desperdicio con respuesta rápida a problemas
- Identificación de items más rentables (o costosos) del menú
- Eliminación de errores en recepción de mercancía y facturación

**Herramientas requeridas para AvT según CrunchTime:**
1. Precios locales precisos para TODOS los ingredientes
2. Conteo de inventario inicial y final preciso
3. Cantidades de ingredientes especificadas para TODAS las recetas
4. Sistema para registrar desperdicio con precisión
5. Sistema para capturar en **tiempo real** las recetas vendidas y sus costos de ingredientes asociados (y deducir del inventario los ingredientes individuales)

**Ejemplo real de CrunchTime (Betty's Burgers):**
```
AUSTIN:
  Actual Food Cost:     32.1% de ventas
  Theoretical Food Cost: 29.5% de ventas
  VARIANZA:              2.6% de ventas ← PROBLEMA

HOUSTON:
  Actual Food Cost:     32.8% de ventas
  Theoretical Food Cost: 31.9% de ventas
  VARIANZA:              0.9% de ventas ← BIEN

Si cada restaurante tiene $1,000,000 en ventas/año:
  Austin pierde 1.7% extra = $17,000/año en profit perdido
  Con 24 restaurantes similares = $204,000/año en pérdidas
```

---

## 3. MODELO DE DATOS COMPLETO PARA COSTEO DE RECETAS

### 3.1 Entidades Principales

```
┌──────────────────┐     ┌──────────────────┐
│   INGREDIENTE    │     │    PROVEEDOR     │
│   (Inventory     │     │   (Supplier)     │
│    Item)         │     │                  │
│                  │     │                  │
│  - código        │     │  - nombre        │
│  - nombre        │     │  - contacto      │
│  - unidad base   │     │  - lead time     │
│  - costo actual  │◄────│                  │
│  - costo promedio│     └──────────────────┘
│  - stock actual  │
│  - stock mínimo  │
│  - categoría     │
└────────┬─────────┘
         │
         │ (ingrediente de)
         ▼
┌──────────────────┐     ┌──────────────────┐
│  RECETA (Recipe) │     │  PLATILLO        │
│  / BOM           │────→│  (Menu Item)     │
│                  │     │                  │
│  - ingrediente   │     │  - nombre        │
│  - cantidad      │     │  - precio venta  │
│  - unidad        │     │  - categoría     │
│  - merma %       │     │  - costo receta  │
│  - es sub-receta?│     │  - margen %      │
└──────────────────┘     │  - activo        │
                         └────────┬─────────┘
                                  │
                                  │ (se vende en)
                                  ▼
                         ┌──────────────────┐
                         │  VENTA (Sale)    │
                         │                  │
                         │  - fecha         │
                         │  - cantidad      │
                         │  - precio        │
                         │  - sucursal      │
                         │  - terminal      │
                         └──────────────────┘
```

### 3.2 Concepto de Sub-Recetas (Recipes dentro de Recipes)

```
EJEMPLO: "Hamburguesa Especial" ($89.00)
═══════════════════════════════════════

Receta Principal:
├── Carne molida res ........... 150g  @ $120/kg  = $18.00
├── Pan hamburguesa ............ 1 pza @ $5/pza   = $5.00
├── Queso cheddar .............. 30g   @ $180/kg  = $5.40
├── Lechuga .................... 50g   @ $15/kg   = $0.75
├── Tomate ..................... 80g   @ $20/kg   = $1.60
├── Aceite vegetal ............. 20ml  @ $30/lt   = $0.60
│
├── [SUB-RECETA] Salsa Especial  15ml
│   ├── Mayonesa ............... 10ml  @ $45/lt   = $0.45
│   ├── Mostaza ................ 3ml   @ $35/lt   = $0.11
│   ├── Chipotle en adobo ...... 2g   @ $80/kg   = $0.16
│   └── Costo sub-receta 15ml: ..................... $0.72
│
├── [SUB-RECETA] Guarnición Papas 120g
│   ├── Papa ................... 120g  @ $12/kg   = $1.44
│   ├── Aceite para freír ...... 40ml  @ $25/lt   = $1.00
│   ├── Sal .................... 2g    @ $8/kg    = $0.02
│   └── Costo sub-receta 120g: ..................... $2.46
│
└── COSTO TOTAL RECETA: ........................... $34.53
    PRECIO VENTA: .................................. $89.00
    MARGEN BRUTO: .................................. $54.47
    FOOD COST %: ................................... 38.8%
    
    ⚠️ Food cost > 35% → Revisar precios o porciones
```

### 3.3 Manejo de Merma (Yield/Waste Factor)

Las empresas grandes manejan un **factor de merma** por ingrediente:

```
EJEMPLO: Tomate
───────────────
  Peso comprado:     1.000 kg
  Merma (tallo, semillas, daño): 15%
  Peso utilizable:   0.850 kg
  
  Costo compra:      $20.00/kg
  Costo real (con merma): $20.00 / 0.85 = $23.53/kg
  
  → En la receta, si necesito 80g de tomate:
    Costo = 0.080 kg × $23.53/kg = $1.88
    (NO $1.60 como sin merma)
```

```
FACTOR DE MERMA POR INGREDIENTE:
═══════════════════════════════
Ingrediente          Merma %    Costo/kg    Costo Real/kg
─────────────────    ───────    ────────    ─────────────
Tomate               15%       $20.00      $23.53
Lechuga              20%       $15.00      $18.75
Cebolla              10%       $12.00      $13.33
Carne molida          3%       $120.00     $123.71
Pollo entero         35%       $65.00      $100.00
Pescado filete       40%       $180.00     $300.00
Papa                 15%       $12.00      $14.12
Aguacate             30%       $50.00      $71.43
```

---

## 4. LÓGICA DE COSTEO: PASO A PASO CON EJEMPLO REAL

### 4.1 Paso 1: Registro de Compra (Actualización de Costos)

```
COMPRA #1234 — Proveedor: "Distribuidora del Centro"
Fecha: 2026-02-18
Sucursal: Centro

Artículo              Cantidad    Unidad    Precio Unit.    Total
──────────────────    ────────    ──────    ────────────    ──────
Carne molida res      10.000     kg        $118.00         $1,180.00
Queso cheddar          5.000     kg        $175.00         $875.00
Pan hamburguesa      200.000     pza       $4.80           $960.00
Lechuga               8.000     kg        $14.50          $116.00
Tomate               15.000     kg        $19.00          $285.00
Aceite vegetal         5.000     lt        $28.00          $140.00
                                                    ──────────────
                                            TOTAL:  $3,556.00
```

**Actualización de costos (método promedio ponderado):**
```
Carne molida res:
  Stock anterior:  5.000 kg @ $120.00/kg = $600.00
  Compra nueva:   10.000 kg @ $118.00/kg = $1,180.00
  ─────────────────────────────────────────────────
  Stock nuevo:    15.000 kg
  Costo promedio: ($600 + $1,180) / 15 = $118.67/kg
```

### 4.2 Paso 2: Cálculo de Costo de Receta

```
FUNCIÓN: calcularCostoReceta(receta_id)
═══════════════════════════════════════

ENTRADA: receta_id = "HAMBURGUESA_ESPECIAL"

PROCESO:
  costo_total = 0

  PARA CADA línea EN receta.ingredientes:
    SI línea.es_sub_receta:
      // Recursión: calcular costo de la sub-receta
      costo_sub = calcularCostoReceta(línea.sub_receta_id)
      costo_linea = costo_sub * línea.cantidad
    SINO:
      // Ingrediente directo
      ingrediente = obtenerIngrediente(línea.ingrediente_id)
      costo_unitario = ingrediente.costo_promedio
      
      // Aplicar factor de merma
      SI ingrediente.merma_porcentaje > 0:
        costo_unitario = costo_unitario / (1 - ingrediente.merma_porcentaje)
      
      // Convertir unidades si es necesario
      cantidad_convertida = convertirUnidad(
        línea.cantidad, 
        línea.unidad, 
        ingrediente.unidad_base
      )
      
      costo_linea = cantidad_convertida * costo_unitario
    
    costo_total += costo_linea

  RETORNAR costo_total

SALIDA: $34.53
```

### 4.3 Paso 3: Venta en POS → Deducción de Inventario

```
EVENTO: Venta de 1 "Hamburguesa Especial" en POS

PROCESO AUTOMÁTICO:
═══════════════════

1. POS registra venta: 1 × Hamburguesa Especial @ $89.00

2. Sistema resuelve la receta (BOM explosion):
   
   Hamburguesa Especial → Ingredientes:
   ├── Carne molida res:    0.150 kg
   ├── Pan hamburguesa:     1.000 pza
   ├── Queso cheddar:       0.030 kg
   ├── Lechuga:             0.050 kg
   ├── Tomate:              0.080 kg
   ├── Aceite vegetal:      0.020 lt
   ├── [Salsa Especial]:
   │   ├── Mayonesa:        0.010 lt
   │   ├── Mostaza:         0.003 lt
   │   └── Chipotle:        0.002 kg
   └── [Guarnición Papas]:
       ├── Papa:             0.120 kg
       ├── Aceite freír:     0.040 lt
       └── Sal:              0.002 kg

3. Sistema deduce del inventario teórico:
   
   Ingrediente          Antes       Deducción    Después
   ──────────────────   ─────────   ─────────    ─────────
   Carne molida res     15.000 kg   -0.150 kg    14.850 kg
   Pan hamburguesa     200.000 pza  -1.000 pza  199.000 pza
   Queso cheddar         5.000 kg   -0.030 kg     4.970 kg
   Lechuga               8.000 kg   -0.050 kg     7.950 kg
   Tomate               15.000 kg   -0.080 kg    14.920 kg
   Aceite vegetal         5.000 lt   -0.060 lt     4.940 lt
   Mayonesa              2.000 lt   -0.010 lt     1.990 lt
   Mostaza               1.000 lt   -0.003 lt     0.997 lt
   Chipotle              0.500 kg   -0.002 kg     0.498 kg
   Papa                 20.000 kg   -0.120 kg    19.880 kg
   Sal                   5.000 kg   -0.002 kg     4.998 kg

4. Sistema registra el costo teórico de la venta:
   Costo teórico: $34.53
   Precio venta:  $89.00
   Margen:        $54.47 (61.2%)
```

### 4.4 Paso 4: Conteo Físico de Inventario

```
CONTEO FÍSICO — Sucursal Centro — 2026-02-18 (fin del día)
═══════════════════════════════════════════════════════════

Ingrediente          Teórico     Contado     Diferencia    Valor $
──────────────────   ─────────   ─────────   ──────────    ───────
Carne molida res     12.350 kg   11.800 kg   -0.550 kg     -$65.27
Pan hamburguesa     182.000 pza 180.000 pza  -2.000 pza    -$9.60
Queso cheddar         4.120 kg    4.050 kg   -0.070 kg    -$12.25
Lechuga               6.200 kg    5.500 kg   -0.700 kg    -$10.50
Tomate               11.600 kg   10.800 kg   -0.800 kg    -$16.00
Aceite vegetal         3.800 lt    3.750 lt   -0.050 lt     -$1.40
Papa                 15.200 kg   14.500 kg   -0.700 kg     -$8.40
                                              ─────────────────────
                                              TOTAL VARIANZA: -$123.42

ANÁLISIS:
  Ventas del día: $8,500.00
  Food cost teórico: $2,890.00 (34.0%)
  Food cost real: $2,890.00 + $123.42 = $3,013.42 (35.5%)
  VARIANZA: 1.5% ← Dentro de rango aceptable (< 2%)
  
  ⚠️ Lechuga: varianza alta (-0.700 kg)
     Posible causa: sobre-porcionamiento o desperdicio por calor
  ⚠️ Tomate: varianza alta (-0.800 kg)
     Posible causa: producto dañado no registrado como merma
```

---

## 5. ACTUAL VS. TEÓRICO (AvT): LA MÉTRICA DE ORO

### 5.1 Fórmulas

```
COSTO TEÓRICO (Theoretical Food Cost):
═══════════════════════════════════════
  Σ (items vendidos × costo receta de cada item)
  ─────────────────────────────────────────────── × 100
                  Ventas totales

COSTO REAL (Actual Food Cost / COGS):
═════════════════════════════════════
  (Inventario Inicial + Compras - Inventario Final)
  ─────────────────────────────────────────────────── × 100
                    Ventas totales

VARIANZA (Food Cost Variance):
══════════════════════════════
  Actual Food Cost % - Theoretical Food Cost %

  Ideal: < 2%
  Aceptable: 2-4%
  Problema: > 4%
  Crítico: > 6%
```

### 5.2 Ejemplo Completo de AvT

```
REPORTE AvT — Sucursal Centro — Semana 7 (Feb 10-16, 2026)
═══════════════════════════════════════════════════════════

VENTAS TOTALES: $59,500.00

INVENTARIO:
  Inicio de semana:    $12,400.00
  Compras semana:      $18,200.00
  Fin de semana:       $11,800.00
  ────────────────────────────────
  COGS Real:           $18,800.00
  Actual Food Cost:    31.6%

TEÓRICO (basado en recetas × ventas):
  Costo teórico total: $17,850.00
  Theoretical Food Cost: 30.0%

VARIANZA:
  31.6% - 30.0% = 1.6%
  En dinero: $18,800 - $17,850 = $950.00 de pérdida

TOP 5 INGREDIENTES CON MAYOR VARIANZA:
  1. Carne molida:  $280 de varianza (29.5% del total)
  2. Queso:         $180 de varianza (18.9%)
  3. Aguacate:      $150 de varianza (15.8%)
  4. Pollo:         $120 de varianza (12.6%)
  5. Aceite:         $85 de varianza (8.9%)

ACCIONES RECOMENDADAS:
  → Verificar porcionamiento de carne (posible sobre-porción)
  → Revisar recepción de queso (posible error de proveedor)
  → Capacitar en corte de aguacate (merma alta)
```

---

## 6. DEDUCCIÓN AUTOMÁTICA DE INVENTARIO

### 6.1 Métodos de Costeo de Inventario

| Método | Descripción | Uso |
|--------|-------------|-----|
| **Promedio Ponderado** | Costo = (valor total stock) / (cantidad total) | **MÁS COMÚN en restaurantes** |
| **FIFO** | First In, First Out — se usa el costo más antiguo primero | Perecederos |
| **LIFO** | Last In, First Out — se usa el costo más reciente | Raro en restaurantes |
| **Último Costo** | Se usa el precio de la última compra | Simple pero menos preciso |

### 6.2 Algoritmo de Deducción (Pseudocódigo)

```
FUNCIÓN: deducirInventarioPorVenta(venta)
═════════════════════════════════════════

PARA CADA línea EN venta.items:
  platillo = obtenerPlatillo(línea.item_id)
  receta = obtenerReceta(platillo.receta_id)
  cantidad_vendida = línea.cantidad
  
  // Resolver BOM (Bill of Materials) recursivamente
  ingredientes_flat = resolverBOM(receta, cantidad_vendida)
  
  PARA CADA ing EN ingredientes_flat:
    // Deducir del inventario de la sucursal
    inventario = obtenerInventarioSucursal(
      ing.ingrediente_id, 
      venta.sucursal_id
    )
    
    inventario.stock_teorico -= ing.cantidad_total
    inventario.ultima_deduccion = AHORA()
    
    // Registrar movimiento
    crearMovimientoInventario({
      tipo: 'DEDUCCION_VENTA',
      ingrediente_id: ing.ingrediente_id,
      cantidad: -ing.cantidad_total,
      costo_unitario: inventario.costo_promedio,
      costo_total: ing.cantidad_total * inventario.costo_promedio,
      referencia_venta: venta.id,
      sucursal_id: venta.sucursal_id,
      fecha: AHORA()
    })
    
    // Verificar stock mínimo
    SI inventario.stock_teorico <= inventario.stock_minimo:
      crearAlerta({
        tipo: 'STOCK_BAJO',
        ingrediente: ing.nombre,
        stock_actual: inventario.stock_teorico,
        stock_minimo: inventario.stock_minimo,
        sucursal: venta.sucursal_id
      })
    
    guardar(inventario)


FUNCIÓN: resolverBOM(receta, cantidad_multiplicador)
════════════════════════════════════════════════════
  resultado = []
  
  PARA CADA línea EN receta.lineas:
    cantidad_necesaria = línea.cantidad * cantidad_multiplicador
    
    SI línea.es_sub_receta:
      // Recursión para sub-recetas
      sub_resultado = resolverBOM(
        línea.sub_receta, 
        cantidad_necesaria / línea.sub_receta.rendimiento
      )
      resultado.agregar(sub_resultado)
    SINO:
      resultado.agregar({
        ingrediente_id: línea.ingrediente_id,
        nombre: línea.ingrediente.nombre,
        cantidad_total: cantidad_necesaria,
        unidad: línea.unidad
      })
  
  RETORNAR resultado
```

---

## 7. MULTI-SUCURSAL: CÓMO FUNCIONA

### 7.1 Arquitectura Multi-Sucursal

```
┌─────────────────────────────────────────────────────────────┐
│                         HQ (Central)                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Menú Global  │  │ Recetas      │  │ Reportes         │   │
│  │ (Master)     │  │ Estándar     │  │ Consolidados     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘   │
│         │                 │                                  │
│         │    Se propagan a cada sucursal                     │
│         │                 │                                  │
└─────────┼─────────────────┼──────────────────────────────────┘
          │                 │
    ┌─────┼─────────────────┼─────────────────┐
    │     ▼                 ▼                 │
    │  ┌──────────────────────────────────┐   │
    │  │  SUCURSAL CENTRO                  │   │
    │  │  - Menú local (hereda de global)  │   │
    │  │  - Precios locales (puede variar) │   │
    │  │  - Inventario LOCAL               │   │
    │  │  - Costos de ingredientes LOCALES │   │
    │  │  - Proveedores LOCALES            │   │
    │  │  - Empleados LOCALES              │   │
    │  └──────────────────────────────────┘   │
    │                                         │
    │  ┌──────────────────────────────────┐   │
    │  │  SUCURSAL NORTE                   │   │
    │  │  - Mismo menú, diferentes precios │   │
    │  │  - Inventario independiente       │   │
    │  │  - Costos de ingredientes propios │   │
    │  └──────────────────────────────────┘   │
    │                                         │
    │  ┌──────────────────────────────────┐   │
    │  │  SUCURSAL SUR                     │   │
    │  │  - Menú reducido (subset)         │   │
    │  │  - Inventario independiente       │   │
    │  │  - Proveedores diferentes         │   │
    │  └──────────────────────────────────┘   │
    └─────────────────────────────────────────┘
```

### 7.2 Reglas Multi-Sucursal

| Dato | Nivel | Descripción |
|------|-------|-------------|
| **Recetas** | Global (HQ) | Misma receta en todas las sucursales |
| **Menú** | Global + Override local | Menú base global, cada sucursal puede activar/desactivar items |
| **Precios de venta** | Local | Cada sucursal puede tener precios diferentes |
| **Costos de ingredientes** | Local | Cada sucursal compra a precios diferentes |
| **Inventario** | Local | Cada sucursal tiene su propio stock |
| **Proveedores** | Local | Cada sucursal puede tener proveedores diferentes |
| **Empleados** | Local | Cada sucursal tiene su propio staff |
| **Reportes** | Global + Local | Consolidados y por sucursal |

### 7.3 Implicación para Costeo

```
MISMA RECETA, DIFERENTE COSTO POR SUCURSAL:

Hamburguesa Especial — Receta estándar (global):
  Carne molida: 150g
  Pan: 1 pza
  Queso: 30g
  ...

SUCURSAL CENTRO (CDMX):
  Carne molida: $118.67/kg → Costo receta: $34.53
  Precio venta: $89.00
  Margen: 61.2%

SUCURSAL NORTE (Monterrey):
  Carne molida: $125.00/kg → Costo receta: $36.20
  Precio venta: $95.00
  Margen: 61.9%

SUCURSAL SUR (Mérida):
  Carne molida: $110.00/kg → Costo receta: $32.85
  Precio venta: $79.00
  Margen: 58.4%
```

---

## 8. KITCHEN DISPLAY SYSTEM: ARQUITECTURA COMPLETA

### 8.1 Flujo de Datos del KDS

```
┌──────────┐     ┌──────────────┐     ┌──────────────────────────┐
│  POS     │────→│  ORDER       │────→│  KDS ROUTER              │
│  Terminal│     │  MANAGER     │     │                          │
│          │     │              │     │  Reglas de routing:      │
└──────────┘     └──────────────┘     │  - Categoría → Estación  │
                                      │  - Prioridad             │
                                      │  - Secuencia de cursos   │
                                      └────────┬─────────────────┘
                                               │
                              ┌─────────────────┼─────────────────┐
                              ▼                 ▼                 ▼
                       ┌──────────┐      ┌──────────┐      ┌──────────┐
                       │ KDS      │      │ KDS      │      │ KDS      │
                       │ PARRILLA │      │ FREIDORA │      │ BAR      │
                       │          │      │          │      │          │
                       │ Items:   │      │ Items:   │      │ Items:   │
                       │ -Burger  │      │ -Papas   │      │ -Bebidas │
                       │ -Steak   │      │ -Nuggets │      │ -Cocteles│
                       └────┬─────┘      └────┬─────┘      └────┬─────┘
                            │                 │                  │
                            │    ✓ Listo      │    ✓ Listo       │  ✓ Listo
                            ▼                 ▼                  ▼
                       ┌─────────────────────────────────────────────┐
                       │            KDS EXPEDITER                     │
                       │                                              │
                       │  Pedido #42 — Mesa 5 — Juan (mesero)        │
                       │  ┌─────────────────────────────────────┐    │
                       │  │ ✓ Hamburguesa Especial  (Parrilla)  │    │
                       │  │ ✓ Papas Fritas          (Freidora)  │    │
                       │  │ ✓ Coca-Cola             (Bar)       │    │
                       │  │ ○ Ensalada César        (Fríos)     │    │
                       │  └─────────────────────────────────────┘    │
                       │  Estado: ESPERANDO ENSALADA (3:45 min)      │
                       └─────────────────────────────────────────────┘
                                          │
                                          │ Todo listo → BUMP
                                          ▼
                       ┌─────────────────────────────────────────────┐
                       │  NOTIFICACIÓN → POS/Mesero                  │
                       │  "Pedido #42 Mesa 5 LISTO para servir"      │
                       └─────────────────────────────────────────────┘
```

### 8.2 Estados de un Pedido en KDS

```
NUEVO → EN COLA → EN PREPARACIÓN → LISTO → SERVIDO
  │                    │              │        │
  │                    │              │        └→ Completado
  │                    │              └→ Bump (expediter)
  │                    └→ Cocinero toca el ticket
  └→ Llega a la pantalla

COLORES POR TIEMPO:
  Verde:   < 5 min (en tiempo)
  Amarillo: 5-10 min (atención)
  Rojo:    > 10 min (retrasado)
  Parpadeando: > 15 min (crítico)
```

### 8.3 Configuración de Routing

```json
// Ejemplo de configuración de routing KDS
{
  "kds_stations": [
    {
      "id": "kds-grill",
      "name": "Parrilla",
      "type": "prep_station",
      "categories": ["hamburguesas", "carnes", "pollo_grill"],
      "display_ip": "192.168.1.101",
      "printer_ip": "192.168.1.201"
    },
    {
      "id": "kds-fryer",
      "name": "Freidora",
      "type": "prep_station",
      "categories": ["papas", "nuggets", "empanizados"],
      "display_ip": "192.168.1.102"
    },
    {
      "id": "kds-cold",
      "name": "Fríos",
      "type": "prep_station",
      "categories": ["ensaladas", "postres_frios", "ceviches"],
      "display_ip": "192.168.1.103"
    },
    {
      "id": "kds-bar",
      "name": "Bar",
      "type": "prep_station",
      "categories": ["bebidas", "cocteles", "cafes"],
      "display_ip": "192.168.1.104"
    },
    {
      "id": "kds-expo",
      "name": "Expediter",
      "type": "expediter",
      "categories": ["ALL"],
      "display_ip": "192.168.1.105"
    }
  ],
  "routing_rules": {
    "default_station": "kds-expo",
    "fire_on_send": true,
    "course_sequencing": true,
    "auto_bump_on_all_fulfilled": true,
    "notify_server_on_complete": true,
    "time_thresholds": {
      "warning_minutes": 5,
      "alert_minutes": 10,
      "critical_minutes": 15
    }
  }
}
```

---

## 9. FLUJO COMPLETO END-TO-END

### 9.1 Desde la Compra hasta el Reporte

```
DÍA TÍPICO EN UN RESTAURANTE MULTI-SUCURSAL
═══════════════════════════════════════════

06:00 — RECEPCIÓN DE MERCANCÍA
  → Proveedor entrega ingredientes
  → Encargado verifica cantidades vs. orden de compra
  → Registra recepción en sistema (app móvil)
  → Sistema actualiza inventario y costos promedio
  → Si hay discrepancia de precio → alerta automática

07:00 — PREP (MISE EN PLACE)
  → Chef revisa producción del día
  → Sistema sugiere cantidades a preparar basado en:
    - Ventas históricas del mismo día de la semana
    - Eventos especiales
    - Inventario actual
  → Se preparan sub-recetas (salsas, bases, etc.)
  → Se registra producción → inventario de sub-recetas sube

10:00 — APERTURA DE SERVICIO
  → Cajeros abren turno (fondo de caja)
  → Terminales POS activos
  → KDS encendidos en cada estación

10:15 — PRIMERA VENTA
  → Cliente ordena: 1 Hamburguesa Especial + 1 Coca-Cola
  → Mesero toma pedido en tablet/POS
  → Pedido se envía a cocina:
    - Hamburguesa → KDS Parrilla
    - Papas (guarnición) → KDS Freidora
    - Coca-Cola → KDS Bar
  → Expediter ve el pedido completo
  → Cada estación prepara y marca "Listo"
  → Expediter hace "Bump" cuando todo está listo
  → Mesero recibe notificación → sirve al cliente
  → Cliente paga → POS registra venta + pago
  → Sistema deduce ingredientes del inventario teórico:
    - Carne: -150g
    - Pan: -1 pza
    - Queso: -30g
    - etc.

... (continúa el servicio todo el día) ...

22:00 — CIERRE DE SERVICIO
  → Último pedido servido
  → Cajeros hacen cierre de caja (corte Z)
  → Sistema calcula:
    - Total ventas por método de pago
    - Total ventas por categoría
    - Diferencia de caja

22:30 — CONTEO DE INVENTARIO (si es día de conteo)
  → Encargado cuenta ingredientes clave
  → Registra conteo en app móvil
  → Sistema compara teórico vs. real
  → Genera reporte de varianza

23:00 — REPORTES AUTOMÁTICOS
  → Sistema genera y envía por email:
    - P&L del día por sucursal
    - Food cost % del día
    - Varianza AvT (si hubo conteo)
    - Alertas de stock bajo
    - Items más/menos vendidos
    - Comparación entre sucursales
```

---

## 10. MODELO DE DATOS SQL COMPLETO

### 10.1 Tablas para Costeo de Recetas e Inventario

```sql
-- ============================================
-- INGREDIENTES (MATERIA PRIMA)
-- ============================================

CREATE TABLE ingredients (
    id                  UUID PRIMARY KEY,
    code                VARCHAR(50) UNIQUE NOT NULL,
    name                VARCHAR(200) NOT NULL,
    category_id         UUID REFERENCES ingredient_categories(id),
    base_unit_id        UUID REFERENCES units_of_measure(id),
    -- Costeo
    current_cost        DECIMAL(18,6) NOT NULL DEFAULT 0,
    average_cost        DECIMAL(18,6) NOT NULL DEFAULT 0,
    last_purchase_cost  DECIMAL(18,6) DEFAULT 0,
    costing_method      VARCHAR(20) DEFAULT 'weighted_average',
    -- Merma
    waste_percentage    DECIMAL(5,2) DEFAULT 0,
    effective_cost      DECIMAL(18,6) GENERATED ALWAYS AS (
        CASE WHEN waste_percentage < 100 
             THEN average_cost / (1 - waste_percentage / 100)
             ELSE average_cost 
        END
    ) STORED,
    -- Control
    is_perishable       BOOLEAN DEFAULT false,
    shelf_life_days     INTEGER,
    storage_temp        VARCHAR(20),
    -- SAP / Jonas refs
    sap_item_code       VARCHAR(50),
    jonas_item_id       VARCHAR(50),
    sat_product_key     VARCHAR(10),
    sat_unit_key        VARCHAR(10),
    --
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ingredient_categories (
    id                  UUID PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    parent_id           UUID REFERENCES ingredient_categories(id),
    sort_order          INTEGER DEFAULT 0
);

CREATE TABLE units_of_measure (
    id                  UUID PRIMARY KEY,
    code                VARCHAR(10) UNIQUE NOT NULL,
    name                VARCHAR(50) NOT NULL,
    category            VARCHAR(20) NOT NULL,  -- 'weight','volume','unit','length'
    base_unit_id        UUID REFERENCES units_of_measure(id),
    conversion_factor   DECIMAL(18,10) DEFAULT 1
    -- Ej: 1 kg = 1000 g → g tiene factor 0.001 hacia kg
);

-- ============================================
-- RECETAS (BILL OF MATERIALS)
-- ============================================

CREATE TABLE recipes (
    id                  UUID PRIMARY KEY,
    code                VARCHAR(50) UNIQUE NOT NULL,
    name                VARCHAR(200) NOT NULL,
    menu_item_id        UUID REFERENCES menu_items(id),
    recipe_type         VARCHAR(20) NOT NULL,  -- 'finished','sub_recipe','prep'
    yield_quantity      DECIMAL(18,6) NOT NULL DEFAULT 1,
    yield_unit_id       UUID REFERENCES units_of_measure(id),
    -- Costeo calculado
    total_cost          DECIMAL(18,6) DEFAULT 0,
    cost_per_portion    DECIMAL(18,6) DEFAULT 0,
    last_costed_at      TIMESTAMPTZ,
    -- Metadata
    prep_time_minutes   INTEGER,
    cook_time_minutes   INTEGER,
    instructions        TEXT,
    photo_url           VARCHAR(500),
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipe_lines (
    id                  UUID PRIMARY KEY,
    recipe_id           UUID REFERENCES recipes(id) NOT NULL,
    line_number         INTEGER NOT NULL,
    -- Puede ser ingrediente O sub-receta (nunca ambos)
    ingredient_id       UUID REFERENCES ingredients(id),
    sub_recipe_id       UUID REFERENCES recipes(id),
    --
    quantity            DECIMAL(18,6) NOT NULL,
    unit_id             UUID REFERENCES units_of_measure(id) NOT NULL,
    -- Costo calculado de esta línea
    line_cost           DECIMAL(18,6) DEFAULT 0,
    -- Notas
    preparation_note    VARCHAR(200),
    is_optional         BOOLEAN DEFAULT false,
    --
    CONSTRAINT chk_ingredient_or_subrecipe 
        CHECK (
            (ingredient_id IS NOT NULL AND sub_recipe_id IS NULL) OR
            (ingredient_id IS NULL AND sub_recipe_id IS NOT NULL)
        ),
    UNIQUE(recipe_id, line_number)
);

-- ============================================
-- MENÚ (PLATILLOS A LA VENTA)
-- ============================================

CREATE TABLE menu_items (
    id                  UUID PRIMARY KEY,
    code                VARCHAR(50) UNIQUE NOT NULL,
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    category_id         UUID REFERENCES menu_categories(id),
    -- Precio y costo
    base_price          DECIMAL(18,2) NOT NULL,
    recipe_cost         DECIMAL(18,6) DEFAULT 0,
    food_cost_pct       DECIMAL(5,2) DEFAULT 0,
    margin_pct          DECIMAL(5,2) DEFAULT 0,
    -- Impuestos
    tax_code            VARCHAR(20),
    tax_rate            DECIMAL(5,2),
    -- KDS routing
    kds_station_id      UUID REFERENCES kds_stations(id),
    -- Control
    is_active           BOOLEAN DEFAULT true,
    available_for_pos   BOOLEAN DEFAULT true,
    available_for_kiosk BOOLEAN DEFAULT true,
    available_for_online BOOLEAN DEFAULT true,
    --
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE menu_item_modifiers (
    id                  UUID PRIMARY KEY,
    menu_item_id        UUID REFERENCES menu_items(id),
    modifier_group_id   UUID REFERENCES modifier_groups(id),
    is_required         BOOLEAN DEFAULT false,
    min_selections      INTEGER DEFAULT 0,
    max_selections      INTEGER DEFAULT 1
);

CREATE TABLE modifier_groups (
    id                  UUID PRIMARY KEY,
    name                VARCHAR(100) NOT NULL,
    -- Ej: "Término de carne", "Extras", "Sin..."
    sort_order          INTEGER DEFAULT 0
);

CREATE TABLE modifier_options (
    id                  UUID PRIMARY KEY,
    group_id            UUID REFERENCES modifier_groups(id),
    name                VARCHAR(100) NOT NULL,
    price_adjustment    DECIMAL(18,2) DEFAULT 0,
    -- Impacto en receta (ingredientes extra/menos)
    recipe_adjustment   JSONB,
    -- Ej: {"ingredient_id": "xxx", "quantity_change": 0.030, "unit": "kg"}
    sort_order          INTEGER DEFAULT 0
);

-- ============================================
-- INVENTARIO POR SUCURSAL
-- ============================================

CREATE TABLE store_inventory (
    id                  UUID PRIMARY KEY,
    store_id            UUID REFERENCES stores(id) NOT NULL,
    ingredient_id       UUID REFERENCES ingredients(id) NOT NULL,
    -- Stock
    theoretical_stock   DECIMAL(18,6) NOT NULL DEFAULT 0,
    actual_stock        DECIMAL(18,6),
    last_count_date     TIMESTAMPTZ,
    -- Costos locales
    local_average_cost  DECIMAL(18,6) DEFAULT 0,
    local_last_cost     DECIMAL(18,6) DEFAULT 0,
    -- Par levels
    par_level           DECIMAL(18,6) DEFAULT 0,
    reorder_point       DECIMAL(18,6) DEFAULT 0,
    reorder_quantity    DECIMAL(18,6) DEFAULT 0,
    --
    UNIQUE(store_id, ingredient_id)
);

CREATE TABLE inventory_movements (
    id                  UUID PRIMARY KEY,
    store_id            UUID REFERENCES stores(id) NOT NULL,
    ingredient_id       UUID REFERENCES ingredients(id) NOT NULL,
    movement_type       VARCHAR(30) NOT NULL,
    -- 'PURCHASE','SALE_DEDUCTION','WASTE','TRANSFER_IN',
    -- 'TRANSFER_OUT','COUNT_ADJUSTMENT','PRODUCTION','RETURN'
    quantity            DECIMAL(18,6) NOT NULL,  -- positivo=entrada, negativo=salida
    unit_cost           DECIMAL(18,6),
    total_cost          DECIMAL(18,6),
    stock_after         DECIMAL(18,6),
    -- Referencias
    reference_type      VARCHAR(30),  -- 'purchase_order','sale','waste_log','transfer','count'
    reference_id        UUID,
    notes               TEXT,
    --
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTEOS FÍSICOS
-- ============================================

CREATE TABLE inventory_counts (
    id                  UUID PRIMARY KEY,
    store_id            UUID REFERENCES stores(id) NOT NULL,
    count_date          DATE NOT NULL,
    count_type          VARCHAR(20) NOT NULL,  -- 'full','partial','spot_check'
    status              VARCHAR(20) DEFAULT 'draft',  -- 'draft','in_progress','completed','approved'
    counted_by          UUID REFERENCES users(id),
    approved_by         UUID REFERENCES users(id),
    total_theoretical   DECIMAL(18,2),
    total_actual        DECIMAL(18,2),
    total_variance      DECIMAL(18,2),
    variance_percentage DECIMAL(5,2),
    notes               TEXT,
    completed_at        TIMESTAMPTZ,
    approved_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE inventory_count_lines (
    id                  UUID PRIMARY KEY,
    count_id            UUID REFERENCES inventory_counts(id) NOT NULL,
    ingredient_id       UUID REFERENCES ingredients(id) NOT NULL,
    theoretical_qty     DECIMAL(18,6) NOT NULL,
    counted_qty         DECIMAL(18,6),
    variance_qty        DECIMAL(18,6) GENERATED ALWAYS AS (
        counted_qty - theoretical_qty
    ) STORED,
    unit_cost           DECIMAL(18,6),
    variance_value      DECIMAL(18,2) GENERATED ALWAYS AS (
        (counted_qty - theoretical_qty) * unit_cost
    ) STORED,
    notes               TEXT
);

-- ============================================
-- COMPRAS Y PROVEEDORES
-- ============================================

CREATE TABLE suppliers (
    id                  UUID PRIMARY KEY,
    code                VARCHAR(50) UNIQUE NOT NULL,
    name                VARCHAR(200) NOT NULL,
    contact_name        VARCHAR(100),
    phone               VARCHAR(20),
    email               VARCHAR(200),
    address             TEXT,
    lead_time_days      INTEGER DEFAULT 1,
    payment_terms       VARCHAR(50),
    is_active           BOOLEAN DEFAULT true
);

CREATE TABLE purchase_orders (
    id                  UUID PRIMARY KEY,
    po_number           VARCHAR(20) UNIQUE NOT NULL,
    store_id            UUID REFERENCES stores(id) NOT NULL,
    supplier_id         UUID REFERENCES suppliers(id) NOT NULL,
    status              VARCHAR(20) DEFAULT 'draft',
    -- 'draft','sent','partially_received','received','cancelled'
    order_date          DATE NOT NULL,
    expected_date       DATE,
    received_date       DATE,
    subtotal            DECIMAL(18,2),
    tax_amount          DECIMAL(18,2),
    total               DECIMAL(18,2),
    notes               TEXT,
    created_by          UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE purchase_order_lines (
    id                  UUID PRIMARY KEY,
    po_id               UUID REFERENCES purchase_orders(id) NOT NULL,
    ingredient_id       UUID REFERENCES ingredients(id) NOT NULL,
    ordered_qty         DECIMAL(18,6) NOT NULL,
    received_qty        DECIMAL(18,6) DEFAULT 0,
    unit_id             UUID REFERENCES units_of_measure(id) NOT NULL,
    unit_cost           DECIMAL(18,6) NOT NULL,
    line_total          DECIMAL(18,2),
    notes               TEXT
);

-- ============================================
-- REGISTRO DE DESPERDICIO
-- ============================================

CREATE TABLE waste_logs (
    id                  UUID PRIMARY KEY,
    store_id            UUID REFERENCES stores(id) NOT NULL,
    ingredient_id       UUID REFERENCES ingredients(id) NOT NULL,
    quantity            DECIMAL(18,6) NOT NULL,
    unit_id             UUID REFERENCES units_of_measure(id) NOT NULL,
    unit_cost           DECIMAL(18,6),
    total_cost          DECIMAL(18,2),
    waste_reason        VARCHAR(30) NOT NULL,
    -- 'spoilage','overproduction','preparation','damaged','expired','other'
    notes               TEXT,
    logged_by           UUID REFERENCES users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- KDS (KITCHEN DISPLAY SYSTEM)
-- ============================================

CREATE TABLE kds_stations (
    id                  UUID PRIMARY KEY,
    store_id            UUID REFERENCES stores(id) NOT NULL,
    name                VARCHAR(50) NOT NULL,
    station_type        VARCHAR(20) NOT NULL,  -- 'prep_station','expediter'
    display_ip          VARCHAR(45),
    printer_ip          VARCHAR(45),
    sort_order          INTEGER DEFAULT 0,
    is_active           BOOLEAN DEFAULT true
);

CREATE TABLE kds_station_categories (
    station_id          UUID REFERENCES kds_stations(id),
    category_id         UUID REFERENCES menu_categories(id),
    PRIMARY KEY (station_id, category_id)
);

CREATE TABLE kds_tickets (
    id                  UUID PRIMARY KEY,
    order_id            UUID NOT NULL,
    station_id          UUID REFERENCES kds_stations(id) NOT NULL,
    status              VARCHAR(20) DEFAULT 'new',
    -- 'new','in_progress','ready','served','cancelled'
    priority            INTEGER DEFAULT 0,
    received_at         TIMESTAMPTZ DEFAULT NOW(),
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    served_at           TIMESTAMPTZ,
    prep_time_seconds   INTEGER
);

CREATE TABLE kds_ticket_items (
    id                  UUID PRIMARY KEY,
    ticket_id           UUID REFERENCES kds_tickets(id) NOT NULL,
    menu_item_id        UUID REFERENCES menu_items(id) NOT NULL,
    quantity            INTEGER NOT NULL,
    modifiers           JSONB,
    special_instructions TEXT,
    status              VARCHAR(20) DEFAULT 'pending',
    -- 'pending','preparing','ready','served','cancelled'
    completed_at        TIMESTAMPTZ
);
```

---

## 11. REPORTES Y OUTPUTS CLAVE

### 11.1 Reporte: Food Cost por Platillo

```
REPORTE: FOOD COST POR PLATILLO — Sucursal Centro — Feb 2026
═════════════════════════════════════════════════════════════

Platillo                  Precio   Costo    Food%   Margen   Qty    Revenue
                          Venta    Receta                    Vendida
─────────────────────     ──────   ──────   ─────   ──────   ─────  ────────
Hamburguesa Especial      $89.00   $34.53   38.8%   61.2%    420    $37,380
Hamburguesa Clásica       $69.00   $25.35   36.7%   63.3%    380    $26,220
Ensalada César            $59.00   $15.80   26.8%   73.2%    210    $12,390
Pasta Alfredo             $79.00   $22.10   28.0%   72.0%    185    $14,615
Filete de Res             $189.00  $78.50   41.5%   58.5%    95     $17,955
Tacos al Pastor (3)       $49.00   $14.20   29.0%   71.0%    520    $25,480
Pizza Margarita           $99.00   $28.90   29.2%   70.8%    160    $15,840
Sopa del Día              $39.00   $8.50    21.8%   78.2%    290    $11,310
─────────────────────────────────────────────────────────────────────────────
TOTALES                                     31.2%   68.8%   2,260  $161,190

⚠️ ALERTAS:
  - Filete de Res: Food cost 41.5% > 35% → Revisar precio o porción
  - Hamburguesa Especial: Food cost 38.8% > 35% → Revisar ingredientes
```

### 11.2 Reporte: AvT por Sucursal

```
REPORTE: ACTUAL VS. TEÓRICO — Todas las Sucursales — Semana 7
══════════════════════════════════════════════════════════════

Sucursal       Ventas      Teórico%   Actual%   Varianza%   Varianza$
─────────      ────────    ────────   ───────   ─────────   ─────────
Centro         $59,500     30.0%      31.6%     1.6%        $952
Norte          $45,200     29.5%      30.8%     1.3%        $588
Sur            $38,800     31.2%      32.0%     0.8%        $310
Poniente       $52,100     30.8%      34.2%     3.4%        $1,771 ⚠️
Oriente        $41,600     29.8%      30.5%     0.7%        $291
─────────────────────────────────────────────────────────────────────
TOTAL          $237,200    30.3%      31.8%     1.5%        $3,912

⚠️ ALERTA: Sucursal Poniente tiene varianza de 3.4%
   → Investigar: recepción, porcionamiento, desperdicio, posible robo
```

### 11.3 Reporte: Ingredientes con Mayor Varianza

```
REPORTE: TOP INGREDIENTES POR VARIANZA — Sucursal Poniente
═══════════════════════════════════════════════════════════

Ingrediente          Teórico    Real      Varianza   Valor $    % Total
──────────────────   ────────   ───────   ────────   ────────   ───────
Carne molida res     45.2 kg    48.8 kg   -3.6 kg    -$427.20   24.1%
Queso cheddar        12.8 kg    14.5 kg   -1.7 kg    -$297.50   16.8%
Aguacate             8.5 kg     10.2 kg   -1.7 kg    -$121.43   6.9%
Aceite oliva         6.2 lt     7.8 lt    -1.6 lt    -$112.00   6.3%
Camarón              5.1 kg     6.0 kg    -0.9 kg    -$270.00   15.2%
──────────────────────────────────────────────────────────────────────
TOP 5 TOTAL                                          -$1,228.13  69.3%

ACCIONES:
  1. Carne molida: Verificar porcionamiento con báscula
  2. Queso: Revisar recepción (posible faltante de proveedor)
  3. Camarón: Alto valor → posible robo → investigar
```

---

## 12. CÓDIGO OPEN SOURCE DE REFERENCIA

### 12.1 Repositorios Recomendados

| Repo | URL | Lenguaje | Características |
|------|-----|----------|-----------------|
| **Odoo** | https://github.com/odoo/odoo | Python | POS + BOM + Inventario + Contabilidad (completo) |
| **URY ERP** | https://github.com/ury-erp/ury | Python (Frappe) | POS restaurante + KDS + P&L + Recetas |
| **URY POS** | https://github.com/ury-erp/pos | React + TS | Frontend POS moderno |
| **URY Mosaic** | https://github.com/ury-erp/mosaic | React | Kitchen Display System |
| **Floreant POS** | https://github.com/floreantpos/floreant-pos | Java | POS restaurante + KDS |
| **OCA POS** | https://github.com/OCA/pos | Python | Addons POS para Odoo |
| **TastyIgniter** | https://github.com/tastyigniter/TastyIgniter | PHP (Laravel) | Restaurante + delivery |

### 12.2 Archivos Clave a Estudiar en Odoo

```
odoo/addons/
├── point_of_sale/          ← Módulo POS completo
│   ├── models/
│   │   ├── pos_order.py    ← Modelo de orden POS
│   │   ├── pos_session.py  ← Sesiones de caja
│   │   └── pos_config.py   ← Configuración de terminal
│   └── static/src/         ← Frontend JS del POS
│
├── pos_restaurant/         ← Extensión restaurante
│   ├── models/
│   │   └── restaurant.py   ← Mesas, pisos, impresoras/KDS routing
│   └── static/src/         ← UI de restaurante
│
├── mrp/                    ← Manufacturing (BOM/Recetas)
│   ├── models/
│   │   ├── mrp_bom.py      ← Bill of Materials (RECETAS)
│   │   ├── mrp_production.py ← Órdenes de manufactura
│   │   └── stock_move.py   ← Movimientos de inventario
│   └── report/             ← Reportes de producción
│
├── stock/                  ← Inventario
│   ├── models/
│   │   ├── product.py      ← Productos con costeo
│   │   ├── stock_quant.py  ← Cantidades en stock
│   │   ├── stock_move.py   ← Movimientos de stock
│   │   └── stock_warehouse.py ← Almacenes
│   └── report/
│
└── purchase/               ← Compras
    ├── models/
    │   ├── purchase_order.py ← Órdenes de compra
    │   └── account_invoice.py ← Facturas de proveedor
    └── report/
```

### 12.3 Archivos Clave a Estudiar en URY

```
ury/
├── ury/                    ← App principal (Frappe/ERPNext)
│   ├── ury_pos/
│   │   ├── doctype/
│   │   │   ├── ury_order/  ← Modelo de orden
│   │   │   └── ury_table/  ← Modelo de mesa
│   │   └── api.py          ← API endpoints
│   └── ury_mosaic/         ← KDS
│       └── doctype/
│           └── ury_kot/    ← Kitchen Order Ticket
│
├── pos/                    ← Frontend POS (React + TypeScript)
│   ├── src/
│   │   ├── components/     ← Componentes UI
│   │   ├── hooks/          ← Custom hooks
│   │   ├── store/          ← State management
│   │   └── utils/          ← Utilidades
│   └── package.json
│
└── mosaic/                 ← Frontend KDS (React)
    ├── src/
    │   ├── components/     ← Componentes KDS
    │   └── hooks/          ← Hooks para WebSocket/polling
    └── package.json
```

---

## FUENTES OFICIALES CONSULTADAS

### Sistemas Empresariales
1. **Oracle MICROS Simphony Docs**: https://docs.oracle.com/en/industries/food-beverage/simphony/index.html
2. **Toast Developer Portal**: https://doc.toasttab.com/
3. **Toast KDS Documentation**: https://doc.toasttab.com/doc/platformguide/platformKDSOverview.html
4. **Lightspeed Restaurant**: https://www.lightspeedhq.com/pos/restaurant/
5. **MarketMan Platform**: https://www.marketman.com/platform/recipe-costing-software
6. **CrunchTime Food Cost**: https://www.crunchtime.com/inventory-management/food-cost-management
7. **Recipe Costing Software**: https://www.recipe-costing.com/restaurant-inventory-management/

### Metodología AvT (Actual vs. Teórico)
8. **MarginEdge Guide**: https://www.marginedge.com/blog/a-restaurant-operators-guide-to-actual-vs-theoretical-food-costs-and-usage
9. **CrunchTime AvT Explained**: https://www.crunchtime.com/blog/blog/explaining-actual-vs-theoretical-food-cost-variance

### Código Open Source
10. **Odoo (GitHub)**: https://github.com/odoo/odoo
11. **URY ERP (GitHub)**: https://github.com/ury-erp/ury
12. **URY POS (GitHub)**: https://github.com/ury-erp/pos
13. **URY Mosaic KDS (GitHub)**: https://github.com/ury-erp/mosaic
14. **Floreant POS**: https://floreant.org/
15. **OCA POS Addons**: https://github.com/OCA/pos
16. **TastyIgniter**: https://github.com/tastyigniter/TastyIgniter

### Odoo BOM + POS
17. **Odoo Forum BOM+POS**: https://www.odoo.com/forum/help-1/bill-of-materials-for-meal-recipes-ingredients-7561
18. **Odoo POS Restaurant Module**: https://apps.odoo.com/apps/modules/14.0/aspl_restaurant
19. **Odoo POS Product BOM**: https://apps.odoo.com/apps/modules/17.0/pos_product_bom
