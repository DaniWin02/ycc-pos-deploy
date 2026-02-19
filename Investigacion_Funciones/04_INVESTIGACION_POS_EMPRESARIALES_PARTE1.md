# INVESTIGACIÓN: SISTEMAS POS EMPRESARIALES
## Arquitectura, Kitchen Display, Inventario con Costeo de Recetas
### Fecha: Febrero 2026 | Versión: 1.0

---

## TABLA DE CONTENIDOS — PARTE 1

1. [Panorama de POS Empresariales](#1-panorama)
2. [Oracle MICROS Simphony (El Gigante)](#2-oracle-simphony)
3. [Toast POS (Líder en EE.UU.)](#3-toast-pos)
4. [Lightspeed Restaurant](#4-lightspeed)
5. [Odoo POS + Manufacturing (Open Source)](#5-odoo)
6. [URY ERP (Open Source Completo)](#6-ury)
7. [Otros POS Open Source Relevantes](#7-otros-open-source)

---

## 1. PANORAMA DE POS EMPRESARIALES

### 1.1 Empresas Investigadas

| Sistema | Empresa | Clientes Notables | Escala |
|---------|---------|-------------------|--------|
| **Oracle MICROS Simphony** | Oracle | McDonald's, Marriott, Hilton, stadiums | +330,000 sitios en 180 países |
| **Toast POS** | Toast Inc. (NYSE: TOST) | Cadenas medianas-grandes EE.UU. | +120,000 restaurantes |
| **Lightspeed Restaurant** | Lightspeed Commerce (NYSE: LSPD) | Five Guys, cadenas multi-ubicación | +100,000 ubicaciones |
| **Square for Restaurants** | Block Inc. (NYSE: SQ) | Restaurantes medianos | Millones de comercios |
| **CrunchTime** | CrunchTime (adquirido por xtraCHEF) | Five Guys, Jersey Mike's, sweetgreen | Multi-unidad enterprise |
| **MarketMan** | MarketMan | +15,000 restaurantes globales | Multi-ubicación |
| **Odoo POS** | Odoo S.A. (Open Source) | Miles de empresas globales | Open source + Enterprise |
| **URY ERP** | URY (Open Source) | Restaurantes India/Global | FOSS completo |
| **Floreant POS** | Floreant (Open Source) | Cafés, restaurantes pequeños-medianos | Open source Java |

### 1.2 Componentes Comunes en TODOS los POS Empresariales

```
┌─────────────────────────────────────────────────────────────────┐
│                    ECOSISTEMA POS EMPRESARIAL                    │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ POS Terminal │  │ Self-Service │  │ Online Ordering      │   │
│  │ (Cajero)     │  │ Kiosk        │  │ (Web/App/Delivery)   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│         └─────────────────┼──────────────────────┘               │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              ORDER MANAGEMENT SYSTEM                     │     │
│  │  (Gestión centralizada de pedidos)                       │     │
│  └────────────────────────┬────────────────────────────────┘     │
│                           │                                      │
│         ┌─────────────────┼─────────────────┐                    │
│         ▼                 ▼                 ▼                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ KDS Cocina   │  │ KDS Bar      │  │ KDS Expediter│           │
│  │ (Kitchen     │  │              │  │ (Coordinador)│           │
│  │  Display)    │  │              │  │              │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              BACK OFFICE                                 │     │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │     │
│  │  │ Inventario │ │ Recetas/   │ │ Reportes/          │   │     │
│  │  │ & Compras  │ │ Costeo     │ │ Analytics          │   │     │
│  │  └────────────┘ └────────────┘ └────────────────────┘   │     │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────────────┐   │     │
│  │  │ Nómina/    │ │ Contabilidad│ │ CRM/Lealtad       │   │     │
│  │  │ Labor      │ │            │ │                    │   │     │
│  │  └────────────┘ └────────────┘ └────────────────────┘   │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │              HQ / MULTI-LOCATION MANAGEMENT              │     │
│  │  Gestión centralizada de menú, precios, reportes,        │     │
│  │  inventario, nómina para TODAS las sucursales             │     │
│  └─────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ORACLE MICROS SIMPHONY (EL GIGANTE)

### 2.1 ¿Qué es?
Oracle MICROS Simphony es el **POS más grande del mundo** para food & beverage. Lo usan cadenas como McDonald's, Marriott, Hilton, estadios deportivos, parques temáticos, cruceros.

### 2.2 Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    ORACLE CLOUD                          │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │  SIMPHONY CLOUD SERVICE (EMC)                    │     │
│  │  Enterprise Management Console                    │     │
│  │  - Configuración centralizada                     │     │
│  │  - Gestión de menú global                         │     │
│  │  - Reportes multi-propiedad                       │     │
│  │  - Gestión de empleados                           │     │
│  │  - Configuración de impuestos                     │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │ HTTPS / Web Services
                          │
┌─────────────────────────┼────────────────────────────────┐
│  PROPIEDAD / SUCURSAL   │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐     │
│  │  SIMPHONY APPLICATION SERVER                     │     │
│  │  (Windows o Oracle Linux)                         │     │
│  │  - Procesamiento de transacciones                 │     │
│  │  - Lógica de negocio                              │     │
│  │  - Base de datos local (resiliencia)              │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                │
│    ┌────────────────────┼────────────────────┐           │
│    ▼                    ▼                    ▼           │
│  ┌──────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │ POS  │  │ KDS (Kitchen │  │ Self-Service      │       │
│  │ Work │  │  Display     │  │ Kiosk             │       │
│  │ Stat.│  │  System)     │  │                   │       │
│  └──────┘  └──────────────┘  └──────────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 2.3 Características Clave de Simphony

**Multi-Propiedad:**
- Una sola consola (EMC) gestiona **cientos o miles** de ubicaciones
- Cambios de menú se propagan a todas las ubicaciones en minutos
- Cada propiedad puede tener configuración local (precios, impuestos)
- Reportes consolidados a nivel empresa, región, propiedad

**Kitchen Display System (KDS):**
- Pantallas en cocina que reciben pedidos en tiempo real
- Routing inteligente: cada ítem va a la estación correcta (parrilla, freidora, bar, etc.)
- Temporizadores de preparación con alertas de retraso
- Estado de pedido: Recibido → En preparación → Listo → Servido
- Soporte para múltiples cocinas por ubicación

**APIs Disponibles (Documentadas por Oracle):**
- **REST APIs**: Business Intelligence, Configuration & Content, Transaction Services Gen 2
- **JavaScript Extensibility API**: Para personalizar la interfaz del POS
- **HTML5 Custom Page Control API**: Páginas personalizadas en el POS
- **Import/Export API**: Importación/exportación masiva de datos
- **PMS Interface**: Integración con Property Management Systems (hoteles)
- **Kiosk JavaScript API**: Para kioscos de autoservicio

**Inventario (vía Oracle Back Office):**
- Inventory Management Mobile Solutions
- Conteo de inventario vía app móvil
- Recepción de mercancía
- Transferencias entre ubicaciones
- Integración con proveedores

### 2.4 Documentación Oficial
- Portal principal: https://docs.oracle.com/en/industries/food-beverage/simphony/index.html
- KDS Configuration: https://docs.oracle.com/en/industries/food-beverage/simphony/kdscu/index.html
- Transaction Processing: https://docs.oracle.com/en/industries/food-beverage/simphony/simcg/index.html
- REST APIs: https://docs.oracle.com/en/industries/food-beverage/simphony/ccapi/index.html

---

## 3. TOAST POS (LÍDER EN EE.UU.)

### 3.1 ¿Qué es?
Toast es el **POS #1 para restaurantes en Estados Unidos**. Empresa pública (NYSE: TOST) con +120,000 restaurantes. Diseñado exclusivamente para food & beverage.

### 3.2 Arquitectura de Toast

```
┌─────────────────────────────────────────────────────────┐
│                    TOAST CLOUD                           │
│                                                          │
│  ┌─────────────────────────────────────────────────┐     │
│  │  TOAST MANAGEMENT PORTAL (Web)                   │     │
│  │  - Gestión de menú                                │     │
│  │  - Reportes y analytics                           │     │
│  │  - Gestión de empleados                           │     │
│  │  - Configuración multi-ubicación                  │     │
│  │  - Integraciones (DoorDash, UberEats, etc.)       │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                │
│  ┌─────────────────────────────────────────────────┐     │
│  │  TOAST APIs (Developer Platform)                  │     │
│  │  - Orders API (crear, leer, modificar pedidos)    │     │
│  │  - Menus API (leer menú, precios, modificadores)  │     │
│  │  - Configuration API (info del restaurante)       │     │
│  │  - Labor API (empleados, turnos)                  │     │
│  │  - Stock API (inventario)                         │     │
│  │  - Webhooks (notificaciones en tiempo real)       │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                │
└─────────────────────────┼────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────┐
│  RESTAURANTE            │                                │
│                         ▼                                │
│  ┌─────────────────────────────────────────────────┐     │
│  │  TOAST HUB (Hardware local)                      │     │
│  │  - Procesamiento local                            │     │
│  │  - Modo offline                                   │     │
│  │  - Sincronización con cloud                       │     │
│  └──────────────────────┬──────────────────────────┘     │
│                         │                                │
│    ┌────────────────────┼────────────────────┐           │
│    ▼                    ▼                    ▼           │
│  ┌──────┐  ┌──────────────┐  ┌──────────────────┐       │
│  │ POS  │  │ KDS          │  │ Toast Go          │       │
│  │ Term.│  │ (Kitchen     │  │ (Handheld)        │       │
│  │      │  │  Display)    │  │                   │       │
│  └──────┘  └──────────────┘  └──────────────────┘       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 3.3 Kitchen Display System (KDS) de Toast — Detalle Profundo

**Fuente**: Documentación oficial de Toast (doc.toasttab.com)

#### Tipos de Dispositivos KDS:
1. **Prep Station (Estación de preparación)**: Muestra solo los ítems que corresponden a esa estación (ej: parrilla, freidora, ensaladas)
2. **Expediter (Coordinador)**: Ve TODOS los ítems del pedido completo. Coordina que todo salga junto

#### Flujo de un Pedido en KDS:

```
CAJERO/MESERO                    COCINA
─────────────                    ──────
1. Toma pedido en POS     ──→   2. Pedido aparece en KDS
                                 3. Items se rutean a estaciones:
                                    - Hamburguesa → KDS Parrilla
                                    - Papas fritas → KDS Freidora
                                    - Ensalada → KDS Fríos
                                    - Bebida → KDS Bar
                                 4. Cada estación marca "Listo" ✓
                                 5. Expediter ve todo el pedido
                                 6. Cuando TODO está listo → BUMP
                                 7. Notificación al POS/mesero
```

#### Características del KDS de Toast:
- **Grid View**: Vista en cuadrícula con tickets de tamaño configurable (Small, Medium, Large)
- **Preview Tickets**: Los cocineros ven items mientras el mesero aún está tomando el pedido (antes de enviar)
- **Paginación**: Navegación entre páginas de tickets
- **Estado de pago**: Muestra si el pedido ya fue pagado o no
- **Dark Mode**: Para cocinas con poca luz
- **Food Runner Fulfillment**: Items individuales se marcan como entregados
- **Modo Offline**: Funciona sin internet usando sincronización local
- **Temporizadores**: Tiempo desde que se recibió el pedido, con colores (verde → amarillo → rojo)
- **Multi-idioma**: Interfaz en múltiples idiomas

#### Routing de Pedidos:
- Cada **categoría de producto** se asigna a una **estación KDS**
- Un mismo item puede ir a **múltiples estaciones** (ej: hamburguesa va a parrilla Y a expediter)
- Configuración de **"fire on next"**: Items aparecen en preview mientras se sigue tomando el pedido
- **Auto-fire**: Pedidos de delivery/online van directo a cocina sin aprobación manual

### 3.4 Toast Orders API — Estructura de Datos

**Estructura de un Pedido (Order):**
```json
{
  "guid": "abc-123-def",
  "entityType": "Order",
  "restaurantGuid": "rest-001",
  "createdDate": "2026-02-18T12:30:00.000Z",
  "modifiedDate": "2026-02-18T12:35:00.000Z",
  "diningOption": {
    "guid": "dine-in-guid",
    "entityType": "DiningOption"
  },
  "checks": [
    {
      "guid": "check-001",
      "entityType": "Check",
      "displayNumber": "42",
      "selections": [
        {
          "guid": "sel-001",
          "entityType": "MenuItemSelection",
          "item": {
            "guid": "item-burger",
            "entityType": "MenuItem"
          },
          "itemGroup": {
            "guid": "group-entrees",
            "entityType": "MenuGroup"
          },
          "quantity": 1,
          "preDiscountPrice": 12.99,
          "price": 12.99,
          "tax": 1.04,
          "voided": false,
          "displayName": "Classic Burger",
          "modifiers": [
            {
              "guid": "mod-001",
              "entityType": "MenuItemSelection",
              "displayName": "Extra Cheese",
              "price": 1.50,
              "quantity": 1
            },
            {
              "guid": "mod-002",
              "entityType": "MenuItemSelection",
              "displayName": "NO Onions",
              "price": 0.00,
              "preModifier": "NO"
            }
          ]
        }
      ],
      "payments": [
        {
          "guid": "pay-001",
          "entityType": "Payment",
          "type": "CREDIT",
          "amount": 15.53,
          "tipAmount": 2.00,
          "cardType": "VISA",
          "last4Digits": "1234"
        }
      ],
      "totalAmount": 15.53,
      "taxAmount": 1.04,
      "netAmount": 14.49
    }
  ],
  "table": {
    "guid": "table-5",
    "entityType": "Table",
    "name": "Table 5"
  },
  "server": {
    "guid": "emp-001",
    "entityType": "Employee",
    "firstName": "Juan"
  },
  "revenueCenter": {
    "guid": "rc-001",
    "entityType": "RevenueCenter",
    "name": "Dining Room"
  }
}
```

### 3.5 Documentación Oficial Toast
- Developer Portal: https://doc.toasttab.com/
- Orders API: https://doc.toasttab.com/doc/devguide/portalOrdersApiOverview.html
- Menus API: https://doc.toasttab.com/doc/devguide/apiUsingMenusApiDataToSubmitProperlyFormedOrders_V2.html
- KDS Overview: https://doc.toasttab.com/doc/platformguide/platformKDSOverview.html
- Modifiers: https://doc.toasttab.com/doc/devguide/apiSpecifyingModifiersAndInstructions.html

---

## 4. LIGHTSPEED RESTAURANT

### 4.1 ¿Qué es?
Lightspeed Restaurant (NYSE: LSPD) es un POS cloud para restaurantes multi-ubicación. Lo usa Five Guys (13+ ubicaciones con Lightspeed), cadenas medianas y grandes.

### 4.2 Características Multi-Ubicación

- **Un solo dashboard** para gestionar todas las ubicaciones
- **Menú personalizable por ubicación**: Mismo menú base, precios diferentes por sucursal
- **Menú diferente por canal**: Un menú para dine-in, otro para delivery
- **Menú por dispositivo**: Asignar menú específico a cada terminal
- **Floor plan personalizable**: Plano de mesas drag-and-drop por ubicación
- **Datos de cliente compartidos** entre ubicaciones
- **Open API**: Para integraciones personalizadas
- **Reportes por ubicación**: Revenue por hora/día/semana/mes, items más vendidos, desempeño de empleados
- **Advanced Reporting**: Análisis profundo de revenue y performance

### 4.3 KDS de Lightspeed
- Conecta Front of House (FOH) con Back of House (BOH)
- Pedidos enviados con un tap desde el POS
- Soporte para cursos (entrantes, plato fuerte, postre)
- Routing a cocina o bar
- Integración con delivery apps (UberEats, DoorDash) en una sola pantalla

### 4.4 Integración con Inventario
Lightspeed no tiene inventario de ingredientes nativo robusto, pero se integra con:
- **MarketMan**: Inventario + costeo de recetas
- **Lightspeed Accounting**: Contabilidad automatizada
- **xtraCHEF/CrunchTime**: Food cost management

### 4.5 Documentación
- Multi-location: https://www.lightspeedhq.com/pos/restaurant/multilocation-restaurant-pos/
- API: Disponible para partners certificados

---

## 5. ODOO POS + MANUFACTURING (OPEN SOURCE)

### 5.1 ¿Qué es?
Odoo es un **ERP open source** completo que incluye módulo POS, Manufacturing (BOM/Recetas), Inventario, Contabilidad, y más. Es el **único sistema open source que integra POS + BOM + Inventario** de forma nativa.

### 5.2 Arquitectura de Odoo POS

```
┌─────────────────────────────────────────────────────────┐
│                    ODOO SERVER                           │
│                    (Python + PostgreSQL)                  │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ POS      │ │ Inventory│ │ Manufact.│ │ Account. │   │
│  │ Module   │ │ Module   │ │ Module   │ │ Module   │   │
│  │          │ │          │ │ (BOM/    │ │          │   │
│  │          │ │          │ │  Recipes)│ │          │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                │
│  │ Purchase │ │ Sales    │ │ CRM      │                │
│  │ Module   │ │ Module   │ │ Module   │                │
│  └──────────┘ └──────────┘ └──────────┘                │
│                                                          │
└──────────────────────┬──────────────────────────────────┘
                       │
            ┌──────────┼──────────┐
            ▼          ▼          ▼
      ┌──────────┐ ┌──────────┐ ┌──────────┐
      │ POS      │ │ POS      │ │ Kitchen  │
      │ Terminal │ │ Terminal │ │ Screen   │
      │ (Web)    │ │ (Tablet) │ │ (Web)    │
      └──────────┘ └──────────┘ └──────────┘
```

### 5.3 Flujo BOM (Bill of Materials) para Recetas en Odoo

**Este es el patrón que Odoo usa para costeo de recetas:**

```
PASO 1: Crear Ingredientes como Productos
─────────────────────────────────────────
- Producto: "Lechuga" (tipo: Almacenable, costo: $15/kg)
- Producto: "Tomate" (tipo: Almacenable, costo: $20/kg)
- Producto: "Carne molida" (tipo: Almacenable, costo: $120/kg)
- Producto: "Pan hamburguesa" (tipo: Almacenable, costo: $5/pieza)

PASO 2: Crear Producto Final (Platillo)
────────────────────────────────────────
- Producto: "Hamburguesa Clásica" (tipo: Almacenable o Consumible)
- Precio de venta: $89.00

PASO 3: Crear BOM (Bill of Materials / Receta)
───────────────────────────────────────────────
BOM para "Hamburguesa Clásica" (produce 1 unidad):
  - Lechuga:       0.050 kg  ($15/kg  = $0.75)
  - Tomate:        0.080 kg  ($20/kg  = $1.60)
  - Carne molida:  0.150 kg  ($120/kg = $18.00)
  - Pan:           1.000 pza ($5/pza  = $5.00)
  ─────────────────────────────────────────────
  COSTO TOTAL RECETA:                   $25.35
  PRECIO VENTA:                         $89.00
  MARGEN BRUTO:                         $63.65 (71.5%)

PASO 4: Venta en POS
─────────────────────
- Cajero vende "Hamburguesa Clásica" en POS
- Odoo crea una Orden de Manufactura (MO) automáticamente
- La MO "consume" los ingredientes del inventario:
  - Lechuga: -0.050 kg
  - Tomate: -0.080 kg
  - Carne molida: -0.150 kg
  - Pan: -1.000 pza
- El inventario de ingredientes se actualiza en tiempo real
```

### 5.4 Código Fuente Relevante de Odoo (GitHub)

**Repositorio principal**: https://github.com/odoo/odoo

**Modelo de BOM (Bill of Materials):**
```python
# odoo/addons/mrp/models/mrp_bom.py (simplificado)
class MrpBom(models.Model):
    _name = 'mrp.bom'
    _description = 'Bill of Material'

    product_tmpl_id = fields.Many2one('product.template', 'Product')
    product_qty = fields.Float('Quantity', default=1.0)
    bom_line_ids = fields.One2many('mrp.bom.line', 'bom_id', 'BoM Lines')
    type = fields.Selection([
        ('normal', 'Manufacture this product'),
        ('phantom', 'Kit')  # Kit = se descompone automáticamente
    ])

class MrpBomLine(models.Model):
    _name = 'mrp.bom.line'
    _description = 'Bill of Material Line'

    bom_id = fields.Many2one('mrp.bom', 'Parent BoM')
    product_id = fields.Many2one('product.product', 'Component')
    product_qty = fields.Float('Quantity', default=1.0)
    product_uom_id = fields.Many2one('uom.uom', 'Unit of Measure')
```

**Modelo de POS Order:**
```python
# odoo/addons/point_of_sale/models/pos_order.py (simplificado)
class PosOrder(models.Model):
    _name = 'pos.order'

    lines = fields.One2many('pos.order.line', 'order_id')
    partner_id = fields.Many2one('res.partner', 'Customer')
    session_id = fields.Many2one('pos.session', 'Session')
    amount_total = fields.Float('Total')
    amount_tax = fields.Float('Taxes')
    amount_paid = fields.Float('Paid')
    state = fields.Selection([
        ('draft', 'New'),
        ('paid', 'Paid'),
        ('done', 'Posted'),
        ('invoiced', 'Invoiced'),
        ('cancel', 'Cancelled')
    ])
```

**Modelo de Restaurant (Mesas, Pisos, Impresoras):**
```python
# odoo/addons/pos_restaurant/models/restaurant.py (simplificado)
class RestaurantFloor(models.Model):
    _name = 'restaurant.floor'
    name = fields.Char('Floor Name')
    table_ids = fields.One2many('restaurant.table', 'floor_id', 'Tables')

class RestaurantTable(models.Model):
    _name = 'restaurant.table'
    name = fields.Char('Table Name')
    floor_id = fields.Many2one('restaurant.floor', 'Floor')
    seats = fields.Integer('Seats')
    position_h = fields.Float('Horizontal Position')
    position_v = fields.Float('Vertical Position')
    state = fields.Selection([
        ('available', 'Available'),
        ('occupied', 'Occupied')
    ])

class RestaurantPrinter(models.Model):
    _name = 'restaurant.printer'
    name = fields.Char('Printer Name')
    proxy_ip = fields.Char('Proxy IP Address')
    product_categories_ids = fields.Many2many(
        'pos.category',
        string='Printed Product Categories'
    )
    # ↑ ESTO es el routing: cada impresora/KDS
    #   recibe solo las categorías asignadas
```

### 5.5 Fuentes Odoo
- GitHub (código completo): https://github.com/odoo/odoo
- POS Module: https://github.com/odoo/odoo/tree/master/addons/point_of_sale
- POS Restaurant: https://github.com/odoo/odoo/tree/master/addons/pos_restaurant
- Manufacturing (BOM): https://github.com/odoo/odoo/tree/master/addons/mrp
- OCA POS Addons: https://github.com/OCA/pos
- Foro BOM + POS: https://www.odoo.com/forum/help-1/bill-of-materials-for-meal-recipes-ingredients-7561

---

## 6. URY ERP (OPEN SOURCE COMPLETO PARA RESTAURANTES)

### 6.1 ¿Qué es?
URY es un **sistema de gestión de restaurantes FOSS (Free and Open Source)** construido sobre ERPNext/Frappe. Es el proyecto open source más completo específicamente para restaurantes.

**GitHub**: https://github.com/ury-erp/ury

### 6.2 Componentes

| Componente | Repo | Descripción |
|------------|------|-------------|
| **URY** | `ury-erp/ury` | App principal (ERPNext) |
| **URY POS** | `ury-erp/pos` | Terminal POS web (React) |
| **URY Mosaic** | `ury-erp/mosaic` | Kitchen Display System |

### 6.3 Features de URY (Completas)

**POS & Billing:**
- Control de acceso basado en roles
- Checklists pre-facturación (verificación de stock, higiene)
- Vinculado con módulos de stock y contabilidad
- Multi-formato: servicio de mesa, QSR, takeaway
- Multi-cajero y control de terminales
- Apertura, cierre de turno y conciliación de caja

**Menu & Recipe Management:**
- Menú centralizado con control a nivel de sucursal
- **Mapeo de recetas usando Bill of Materials (BOM)**
- Control de precios, disponibilidad y porciones por sucursal
- Combos, modificadores y bundles
- Integrado con planificación de producción para prep diario

**Table Order Management:**
- Toma de pedidos mobile-first para meseros
- Sincronización en vivo con cocina y cajero
- **Verificación de inventario en tiempo real antes de tomar pedido**
- Modificadores, secuencia de cursos y notas
- Integración con billing y KDS

**Kitchen Display & KOT Management:**
- Soporte para **múltiples cocinas** con routing avanzado a impresoras
- KDS interactivo con estados en vivo: **Preparando → Listo → Servido**
- Tracking de retrasos, cancelaciones y modificaciones
- Analytics de cocina en tiempo real
- Flujo seamless desde pedido hasta servicio entre estaciones

**Operational Red Flags & Alerts:**
- Pedidos retrasados y brechas en tiempo de preparación
- KOT no iniciado después de tomar pedido
- Cuentas sin cerrar y mesas ocupadas por mucho tiempo
- Cancelaciones y modificaciones excesivas de KOT
- Alertas en tiempo real para excepciones operativas
- Dashboard para resolución rápida de problemas entre sucursales

**Reports & Analytics:**
- **Daily Profit & Loss** (P&L diario)
- Reportes de **shortage y excess** (faltantes y excedentes)
- Performance por curso y por item
- Tracking de desempeño de meseros/capitanes
- Comparaciones entre sucursales
- Tendencias de ventas por cliente
- Reportes detallados de ventas, producción y stock

### 6.4 Stack Técnico de URY
- **Backend**: Python (Frappe/ERPNext framework)
- **Frontend POS**: React + TypeScript
- **KDS (Mosaic)**: React
- **Base de datos**: MariaDB
- **Licencia**: GNU GPL v3

---

## 7. OTROS POS OPEN SOURCE RELEVANTES

### 7.1 Floreant POS
- **URL**: https://floreant.org/
- **GitHub**: https://github.com/floreantpos/floreant-pos
- **Lenguaje**: Java
- **Plataforma**: Windows, Linux, Mac, Raspberry Pi
- **Características**: POS restaurante, KDS, gestión de mesas, inventario básico, reportes
- **Instalación**: En menos de 90 segundos
- **Limitación**: Inventario básico, sin costeo de recetas nativo

### 7.2 Chromis POS
- **Lenguaje**: Java
- **Características**: POS retail/restaurante, KDS, inventario
- **Open Source**: Sí (GPL)

### 7.3 TastyIgniter
- **GitHub**: https://github.com/tastyigniter/TastyIgniter
- **Lenguaje**: PHP (Laravel)
- **Enfoque**: Restaurantes con delivery online
- **Características**: Pedidos online, gestión de menú, delivery tracking

### 7.4 Kasirku
- **GitHub**: https://github.com/rezadrian01/Kasirku
- **Lenguaje**: PHP (Laravel)
- **Características**: POS moderno, menú digital, pagos, impresión térmica, tracking en tiempo real
