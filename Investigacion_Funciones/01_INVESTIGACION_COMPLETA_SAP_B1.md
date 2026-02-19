# INVESTIGACIÓN COMPLETA: SAP BUSINESS ONE PARA PUNTO DE VENTA
## Documento de Referencia Técnica y Funcional
### Fecha: Febrero 2026 | Versión: 1.0

---

## TABLA DE CONTENIDOS

1. [Visión General de SAP Business One](#1-visión-general)
2. [Service Layer API (REST)](#2-service-layer-api)
3. [DI API (Data Interface)](#3-di-api)
4. [API Gateway](#4-api-gateway)
5. [SAP Customer Checkout (POS Nativo)](#5-sap-customer-checkout)
6. [Módulos Relevantes para POS](#6-módulos-relevantes)
7. [Entidades Clave del Service Layer para POS](#7-entidades-clave)
8. [Autenticación y Seguridad](#8-autenticación)
9. [Flujo de Documentos de Venta](#9-flujo-documentos)
10. [Consideraciones Fiscales México](#10-consideraciones-fiscales)

---

## 1. VISIÓN GENERAL DE SAP BUSINESS ONE

### 1.1 ¿Qué es SAP Business One?
SAP Business One (SAP B1) es un ERP diseñado para pequeñas y medianas empresas que integra todas las funciones empresariales principales:

- **Gestión Financiera** (Contabilidad, Bancos, Presupuestos)
- **Ventas y Clientes** (Oportunidades, Cotizaciones, Pedidos, Facturas)
- **Compras y Proveedores** (Órdenes de compra, Recepción, Facturas de proveedor)
- **Inventario y Producción** (Gestión de almacenes, Listas de materiales)
- **Gestión de Proyectos**
- **Recursos Humanos**
- **Reportes y Analítica**

### 1.2 Bases de Datos Soportadas
- **Microsoft SQL Server** (versión on-premise)
- **SAP HANA** (versión optimizada con analítica en tiempo real)

### 1.3 Versiones Actuales
- SAP Business One 10.0 (FP 2402 y posteriores)
- SAP Business One, version for SAP HANA 10.0

### 1.4 Opciones de Despliegue
- **On-Premise**: Instalación local en servidores propios
- **Cloud**: SAP Business One Cloud (gestionado por SAP/Partner)
- **Híbrido**: Combinación de ambos

---

## 2. SERVICE LAYER API (REST) — INTERFAZ PRINCIPAL PARA POS

### 2.1 ¿Qué es el Service Layer?
El Service Layer es la **API REST de nueva generación** de SAP Business One. Es el método **RECOMENDADO por SAP** para integraciones externas como un Punto de Venta.

**Características principales:**
- API RESTful basada en protocolo **OData v3.0 y v4.0**
- Comunicación vía **HTTPS** (TLS 1.2/1.3)
- Formato de datos: **JSON** (por defecto) y XML
- Operaciones CRUD completas sobre todas las entidades de negocio
- Soporte para consultas complejas con filtros OData ($filter, $select, $orderby, $top, $skip)
- Transacciones batch
- Soporte para campos definidos por usuario (UDFs)
- Soporte para tablas definidas por usuario (UDTs)

### 2.2 URL Base del Service Layer
```
https://<servidor>:50000/b1s/v1/    (SQL Server)
https://<servidor>:50000/b1s/v2/    (SAP HANA - OData v4)
```

### 2.3 Operaciones HTTP Soportadas

| Método HTTP | Operación | Ejemplo |
|-------------|-----------|---------|
| `POST` | Crear | `POST /b1s/v1/Invoices` |
| `GET` | Leer | `GET /b1s/v1/Items('A00001')` |
| `PATCH` | Actualizar parcial | `PATCH /b1s/v1/Items('A00001')` |
| `PUT` | Actualizar completo | `PUT /b1s/v1/Items('A00001')` |
| `DELETE` | Eliminar | `DELETE /b1s/v1/Items('A00001')` |

### 2.4 Consultas OData Soportadas

```
# Filtrar artículos activos
GET /b1s/v1/Items?$filter=Valid eq 'tYES'

# Seleccionar campos específicos
GET /b1s/v1/Items?$select=ItemCode,ItemName,QuantityOnStock

# Ordenar por nombre
GET /b1s/v1/Items?$orderby=ItemName asc

# Paginación
GET /b1s/v1/Items?$top=20&$skip=40

# Contar registros
GET /b1s/v1/Items/$count

# Combinación de filtros
GET /b1s/v1/Items?$filter=ItemType eq 'itItems' and Valid eq 'tYES'&$select=ItemCode,ItemName,QuantityOnStock&$top=50
```

### 2.5 Operaciones Batch (Transacciones Múltiples)
El Service Layer soporta operaciones batch para ejecutar múltiples operaciones en una sola transacción HTTP:

```http
POST /b1s/v1/$batch
Content-Type: multipart/mixed; boundary=batch_boundary

--batch_boundary
Content-Type: application/http
Content-Transfer-Encoding: binary

POST /b1s/v1/Invoices HTTP/1.1
Content-Type: application/json

{
  "CardCode": "C001",
  "DocumentLines": [...]
}

--batch_boundary--
```

### 2.6 Cross-Join Queries
Para consultas que involucran múltiples entidades:
```
GET /b1s/v1/$crossjoin(Items,ItemWarehouseInfoCollection)?$filter=Items/ItemCode eq ItemWarehouseInfoCollection/ItemCode
```

---

## 3. DI API (DATA INTERFACE API)

### 3.1 ¿Qué es la DI API?
La DI API es una **librería COM/COM+** que proporciona acceso directo a la base de datos de SAP Business One. Es más antigua que el Service Layer pero sigue siendo válida.

### 3.2 Comparación: Service Layer vs DI API

| Característica | Service Layer (REST) | DI API (COM) |
|---------------|---------------------|--------------|
| **Protocolo** | HTTP/HTTPS REST | COM/COM+ |
| **Lenguajes** | Cualquiera (HTTP) | .NET, VB, C++ |
| **Plataforma** | Multiplataforma | Solo Windows |
| **Rendimiento** | Bueno (HTTP overhead) | Excelente (directo) |
| **Escalabilidad** | Alta (stateless) | Media (instancias COM) |
| **Recomendación SAP** | **PREFERIDO** para nuevos desarrollos | Legacy/Específico |
| **Instalación** | No requiere en cliente | Requiere SDK en servidor |

### 3.3 Recomendación para POS
**Usar Service Layer (REST)** como interfaz principal porque:
- No requiere instalación de componentes en el cliente POS
- Funciona desde cualquier plataforma (Web, Mobile, Desktop)
- Es el estándar actual y futuro de SAP
- Mejor escalabilidad para múltiples terminales POS
- Soporte nativo para JSON

---

## 4. API GATEWAY

### 4.1 ¿Qué es el API Gateway de SAP B1?
El API Gateway proporciona un **punto de entrada unificado** para acceder a todos los servicios API de SAP Business One.

**Beneficios:**
- Endpoint único para todas las APIs
- Autenticación centralizada (single sign-on)
- Una sola sesión de login para acceder a todos los servicios
- Balanceo de carga
- Gestión de versiones de API

### 4.2 URL del API Gateway
```
https://<servidor>:54000/
```

### 4.3 Servicios Disponibles vía Gateway
- Service Layer (datos de negocio)
- Messaging Service (notificaciones)
- Extension Registry
- Analytical Service (SAP HANA)

---

## 5. SAP CUSTOMER CHECKOUT (POS NATIVO DE SAP)

### 5.1 ¿Qué es?
SAP Customer Checkout es la **solución POS oficial de SAP** diseñada para integrarse nativamente con SAP Business One.

### 5.2 Funcionalidades
- **Ventas y devoluciones** de mercancía
- **Cierre de caja** y cuentas diarias
- **Gestión de descuentos** y vouchers
- **Pagos**: efectivo, tarjetas débito/crédito, gift cards
- **Integración de pedidos** de cliente (anticipos, facturas)
- **Gestión de lealtad** (cupones, vouchers)
- **Gestión de artículos**: 100% integrada con SAP B1
- **Reportes en tiempo real**: ingresos por tienda/producto
- **Gestión de mesas** (para restaurantes/hospitalidad)
- Funciona **online y offline**
- Desplegable en **PC o tablet**

### 5.3 Ediciones
- **On-Premise**: Instalación local
- **Cloud Edition**: Basada en la nube (lanzada 2025)

### 5.4 Integración con SAP B1
- Sincronización automática de artículos, precios, clientes
- Creación automática de facturas/notas de crédito en SAP B1
- Sincronización de inventario en tiempo real
- Reportes consolidados

### 5.5 ¿Por qué NO usar SAP Customer Checkout directamente?
Razones para construir un POS personalizado:
- **Personalización total** de la interfaz y flujos
- **Integración con Jonas** (no soportada nativamente)
- **Control completo** sobre la lógica de negocio
- **Funcionalidades específicas** del giro de negocio
- **Independencia** de licenciamiento adicional de SAP
- **Flexibilidad** para integrar hardware específico

### 5.6 Lecciones del SAP Customer Checkout para Nuestro POS
Debemos replicar las mejores prácticas:
- Funcionamiento **offline** con sincronización posterior
- **Cierre de caja** con cuadre automático
- Soporte para **múltiples métodos de pago**
- **Gestión de devoluciones** vinculadas a ventas originales
- **Reportes en tiempo real**
- **Gestión centralizada** de múltiples terminales

---

## 6. MÓDULOS DE SAP B1 RELEVANTES PARA POS

### 6.1 Módulo de Ventas (Sales - AR)
Flujo completo de documentos de venta:

```
Cotización → Pedido de Venta → Entrega → Factura de Venta → Pago Recibido
(Sales Quotation → Sales Order → Delivery → A/R Invoice → Incoming Payment)
```

**Para POS, el flujo típico es:**
```
Factura de Venta (A/R Invoice) + Pago Recibido (Incoming Payment)
```
O en modo simplificado:
```
A/R Invoice con pago integrado
```

### 6.2 Módulo de Inventario (Inventory)
- **Items (Artículos)**: Maestro de productos
- **Warehouses (Almacenes)**: Ubicaciones de stock
- **Price Lists (Listas de Precios)**: Múltiples listas por cliente/grupo
- **Special Prices**: Precios especiales por cliente
- **Inventory Transactions**: Entradas, salidas, transferencias
- **Stock Taking**: Conteo físico de inventario
- **Bar Codes**: Códigos de barras por artículo
- **Serial Numbers**: Números de serie
- **Batch Numbers**: Números de lote

### 6.3 Módulo de Socios de Negocio (Business Partners)
- **Clientes**: Datos maestros, direcciones, contactos
- **Grupos de clientes**: Clasificación y descuentos
- **Condiciones de pago**: Términos comerciales
- **Límites de crédito**: Control de crédito

### 6.4 Módulo Financiero
- **Plan de cuentas**: Estructura contable
- **Centros de costo**: Distribución de gastos
- **Impuestos (Tax Codes)**: Configuración fiscal
- **Medios de pago**: Efectivo, cheques, tarjetas, transferencias
- **Bancos**: Cuentas bancarias de la empresa

### 6.5 Módulo de Reportes
- **Crystal Reports**: Reportes personalizados
- **Queries**: Consultas SQL personalizadas
- **Dashboards**: Tableros de control

---

## 7. ENTIDADES CLAVE DEL SERVICE LAYER PARA POS

### 7.1 Catálogo Completo de Entidades Relevantes

#### VENTAS (Sales)
| Entidad | Endpoint | Descripción |
|---------|----------|-------------|
| `Invoices` | `/b1s/v1/Invoices` | Facturas de venta (A/R Invoice) |
| `CreditNotes` | `/b1s/v1/CreditNotes` | Notas de crédito |
| `Orders` | `/b1s/v1/Orders` | Pedidos de venta |
| `DeliveryNotes` | `/b1s/v1/DeliveryNotes` | Entregas/Remisiones |
| `Quotations` | `/b1s/v1/Quotations` | Cotizaciones |
| `Returns` | `/b1s/v1/Returns` | Devoluciones |
| `DownPayments` | `/b1s/v1/DownPayments` | Anticipos |

#### PAGOS
| Entidad | Endpoint | Descripción |
|---------|----------|-------------|
| `IncomingPayments` | `/b1s/v1/IncomingPayments` | Pagos recibidos de clientes |
| `VendorPayments` | `/b1s/v1/VendorPayments` | Pagos a proveedores |
| `CreditCards` | `/b1s/v1/CreditCards` | Tarjetas de crédito configuradas |
| `WizardPaymentMethods` | `/b1s/v1/WizardPaymentMethods` | Métodos de pago |

#### INVENTARIO
| Entidad | Endpoint | Descripción |
|---------|----------|-------------|
| `Items` | `/b1s/v1/Items` | Maestro de artículos |
| `ItemGroups` | `/b1s/v1/ItemGroups` | Grupos de artículos |
| `Warehouses` | `/b1s/v1/Warehouses` | Almacenes |
| `PriceLists` | `/b1s/v1/PriceLists` | Listas de precios |
| `SpecialPrices` | `/b1s/v1/SpecialPrices` | Precios especiales |
| `BarCodes` | `/b1s/v1/BarCodes` | Códigos de barras |
| `StockTransfers` | `/b1s/v1/StockTransfers` | Transferencias de stock |
| `InventoryGenEntries` | `/b1s/v1/InventoryGenEntries` | Entradas de inventario |
| `InventoryGenExits` | `/b1s/v1/InventoryGenExits` | Salidas de inventario |
| `BinLocations` | `/b1s/v1/BinLocations` | Ubicaciones en almacén |
| `SerialNumberDetails` | `/b1s/v1/SerialNumberDetails` | Números de serie |
| `BatchNumberDetails` | `/b1s/v1/BatchNumberDetails` | Números de lote |

#### SOCIOS DE NEGOCIO
| Entidad | Endpoint | Descripción |
|---------|----------|-------------|
| `BusinessPartners` | `/b1s/v1/BusinessPartners` | Clientes y proveedores |
| `BusinessPartnerGroups` | `/b1s/v1/BusinessPartnerGroups` | Grupos de socios |
| `ContactEmployees` | `/b1s/v1/ContactEmployees` | Contactos |

#### FINANZAS
| Entidad | Endpoint | Descripción |
|---------|----------|-------------|
| `ChartOfAccounts` | `/b1s/v1/ChartOfAccounts` | Plan de cuentas |
| `JournalEntries` | `/b1s/v1/JournalEntries` | Asientos contables |
| `VatGroups` | `/b1s/v1/VatGroups` | Grupos de IVA/Impuestos |
| `CashDiscounts` | `/b1s/v1/CashDiscounts` | Descuentos por pronto pago |

#### CONFIGURACIÓN
| Entidad | Endpoint | Descripción |
|---------|----------|-------------|
| `Users` | `/b1s/v1/Users` | Usuarios del sistema |
| `Branches` | `/b1s/v1/Branches` | Sucursales |
| `Currencies` | `/b1s/v1/Currencies` | Monedas |
| `PaymentTermsTypes` | `/b1s/v1/PaymentTermsTypes` | Condiciones de pago |
| `SalesPersons` | `/b1s/v1/SalesPersons` | Vendedores |

#### SERVICIOS ESPECIALES
| Servicio | Endpoint | Descripción |
|----------|----------|-------------|
| `CompanyService` | `/b1s/v1/CompanyService` | Info de la empresa |
| `BarCodesService` | `/b1s/v1/BarCodesService` | Gestión de códigos de barras |
| `InventoryCountingsService` | `/b1s/v1/InventoryCountingsService` | Conteos de inventario |

### 7.2 Ejemplo: Crear Factura de Venta (Operación Core del POS)

```json
POST /b1s/v1/Invoices
Content-Type: application/json

{
  "CardCode": "C20000",
  "DocDate": "2026-02-18",
  "DocDueDate": "2026-02-18",
  "Comments": "Venta POS Terminal 01",
  "SalesPersonCode": 1,
  "DocumentLines": [
    {
      "ItemCode": "A00001",
      "Quantity": 2,
      "UnitPrice": 150.00,
      "WarehouseCode": "01",
      "TaxCode": "IVA16"
    },
    {
      "ItemCode": "A00002",
      "Quantity": 1,
      "UnitPrice": 299.99,
      "WarehouseCode": "01",
      "TaxCode": "IVA16",
      "DiscountPercent": 10
    }
  ]
}
```

### 7.3 Ejemplo: Registrar Pago Recibido

```json
POST /b1s/v1/IncomingPayments
Content-Type: application/json

{
  "DocType": "rCustomer",
  "CardCode": "C20000",
  "CashAccount": "1.1.1.01.001",
  "CashSum": 599.99,
  "PaymentInvoices": [
    {
      "DocEntry": 12345,
      "SumApplied": 599.99,
      "InvoiceType": "it_Invoice"
    }
  ]
}
```

### 7.4 Ejemplo: Pago con Tarjeta de Crédito

```json
POST /b1s/v1/IncomingPayments
Content-Type: application/json

{
  "DocType": "rCustomer",
  "CardCode": "C20000",
  "CreditCards": [
    {
      "CreditCard": 1,
      "CreditCardNumber": "XXXX-XXXX-XXXX-1234",
      "CardValidUntil": "2027-12-31",
      "VoucherNum": "AUTH123456",
      "CreditSum": 599.99,
      "CreditType": "cr_Regular",
      "NumOfPayments": 1
    }
  ],
  "PaymentInvoices": [
    {
      "DocEntry": 12345,
      "SumApplied": 599.99,
      "InvoiceType": "it_Invoice"
    }
  ]
}
```

### 7.5 Ejemplo: Consultar Stock de un Artículo

```
GET /b1s/v1/Items('A00001')?$select=ItemCode,ItemName,QuantityOnStock,QuantityOrderedByCustomers,QuantityOrderedFromVendors
```

### 7.6 Ejemplo: Buscar Artículo por Código de Barras

```
GET /b1s/v1/BarCodes?$filter=Barcode eq '7501234567890'&$select=ItemNo,Barcode,UoMEntry
```

---

## 8. AUTENTICACIÓN Y SEGURIDAD

### 8.1 Métodos de Autenticación

#### Basic Authentication (Recomendado para POS interno)
```json
POST /b1s/v1/Login
Content-Type: application/json

{
  "CompanyDB": "SBO_MIEMPRESA",
  "UserName": "manager",
  "Password": "1234"
}
```

**Respuesta exitosa:**
```
HTTP/1.1 200 OK
Set-Cookie: B1SESSION=PTRzIjYK-weN6-1Lx1-ZG0J-3ARxfjcU0Shy; path=/b1s
Set-Cookie: ROUTEID=.node0; path=/b1s
```

#### OAuth 2.0 (Para aplicaciones públicas)
- Requiere configuración de Identity Provider
- Flujo Authorization Code o Client Credentials
- Más seguro para aplicaciones expuestas a internet

### 8.2 Gestión de Sesiones
- La cookie `B1SESSION` debe enviarse en cada request subsecuente
- La cookie `ROUTEID` asegura sticky sessions en clusters
- **Timeout de sesión**: 30 minutos por defecto (configurable)
- **Máximo de sesiones simultáneas**: Depende de la licencia

### 8.3 Logout
```json
POST /b1s/v1/Logout
```

### 8.4 Mejores Prácticas de Seguridad para POS
1. **Usar HTTPS siempre** (TLS 1.2+)
2. **Certificados válidos** (no self-signed en producción)
3. **Crear usuario específico** para el POS con permisos mínimos
4. **Renovar sesiones** antes del timeout
5. **No almacenar credenciales** en texto plano en el cliente
6. **Implementar rate limiting** en el middleware
7. **Logs de auditoría** de todas las transacciones
8. **Encriptar** datos sensibles en tránsito y reposo

---

## 9. FLUJO DE DOCUMENTOS DE VENTA EN SAP B1

### 9.1 Flujo Completo

```
┌─────────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────────┐    ┌────────────────┐
│ Cotización   │───→│ Pedido Venta │───→│ Entrega   │───→│ Factura      │───→│ Pago Recibido  │
│ (Quotation)  │    │ (Sales Order)│    │ (Delivery)│    │ (AR Invoice) │    │ (Inc. Payment) │
└─────────────┘    └──────────────┘    └───────────┘    └──────────────┘    └────────────────┘
```

### 9.2 Flujo Simplificado para POS

```
┌──────────────────┐    ┌────────────────┐
│ Factura de Venta  │───→│ Pago Recibido  │
│ (A/R Invoice)     │    │ (Inc. Payment) │
└──────────────────┘    └────────────────┘
```

**O en una sola operación (Factura + Pago simultáneo):**
```
POST /b1s/v1/Invoices  →  POST /b1s/v1/IncomingPayments (referenciando la factura)
```

### 9.3 Flujo de Devolución

```
┌──────────────────┐    ┌────────────────┐
│ Nota de Crédito   │───→│ Pago Saliente  │
│ (Credit Note)     │    │ (Reembolso)    │
└──────────────────┘    └────────────────┘
```

### 9.4 Impacto Contable Automático
Cada documento en SAP B1 genera **asientos contables automáticos**:

| Documento | Débito | Crédito |
|-----------|--------|---------|
| Factura de Venta | Cuentas por Cobrar | Ingresos por Ventas + IVA |
| Pago Recibido (Efectivo) | Caja | Cuentas por Cobrar |
| Pago Recibido (Tarjeta) | Banco/Clearing | Cuentas por Cobrar |
| Nota de Crédito | Devoluciones sobre Ventas | Cuentas por Cobrar |

---

## 10. CONSIDERACIONES FISCALES PARA MÉXICO

### 10.1 CFDI (Comprobante Fiscal Digital por Internet)
- SAP B1 soporta la generación de CFDI a través de **add-ons certificados**
- El POS debe integrarse con un **PAC (Proveedor Autorizado de Certificación)**
- Tipos de CFDI relevantes para POS:
  - **Ingreso**: Facturas de venta
  - **Egreso**: Notas de crédito/devoluciones
  - **Pago**: Complemento de pago (REP)
  - **Traslado**: Carta porte (si aplica)

### 10.2 Impuestos
- **IVA 16%**: Tasa general
- **IVA 0%**: Alimentos, medicinas (según aplique)
- **IEPS**: Impuesto especial (según productos)
- **Retenciones**: ISR, IVA (según régimen del cliente)

### 10.3 Requisitos del SAT
- RFC del emisor y receptor
- Régimen fiscal
- Uso de CFDI (código de uso)
- Forma de pago (01-Efectivo, 04-Tarjeta, 28-Tarjeta débito, etc.)
- Método de pago (PUE-Pago en una sola exhibición, PPD-Pago en parcialidades)
- Clave de producto/servicio SAT
- Clave de unidad SAT

---

## FUENTES OFICIALES DE REFERENCIA

### Documentación SAP
1. **Service Layer API Reference**: https://help.sap.com/doc/056f69366b5345a386bb8149f1700c19/10.0/en-US/Service%20Layer%20API%20Reference.html
2. **Working with Service Layer**: https://help.sap.com/doc/fc2f5477516c404c8bf9ad1315a17238/10.0/en-US/Working_with_SAP_Business_One_Service_Layer.pdf
3. **API Gateway**: https://help.sap.com/doc/896f5237207d479ba5618d2666754d9a/10.0/en-US/How_to_Work_with_SAP_Business_One_API_Gateway.pdf
4. **DI API Reference**: https://help.sap.com/doc/089315d8d0f8475a9fc84fb919b501a3/10.0/en-US/SDKHelp/SAPbobsCOM_P.html
5. **SAP Learning - Service Layer**: https://learning.sap.com/courses/leveraging-the-sap-business-one-service-layer
6. **SAP Customer Checkout**: https://www.sap.com/products/crm/pos-customer-checkout.html
7. **SAP Community**: https://community.sap.com/topics/business-one

### Referencia API Completa (Mirror)
8. **Service Layer API Reference (completa)**: https://ozeraydin.com/sapb1/SapBusinessOneServiceLayerAPIReference.html
