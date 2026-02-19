# INVESTIGACIÓN COMPLETA: JONAS SOFTWARE PARA PUNTO DE VENTA
## Documento de Referencia Técnica y Funcional
### Fecha: Febrero 2026 | Versión: 1.0

---

## TABLA DE CONTENIDOS

1. [Visión General de Jonas Software](#1-visión-general)
2. [Jonas Construction Software (Enterprise)](#2-jonas-construction)
3. [Módulos de Jonas Enterprise](#3-módulos)
4. [Integración y APIs de Jonas](#4-integración-apis)
5. [Flujo de Datos Jonas ↔ POS](#5-flujo-datos)
6. [Estrategia de Integración con Jonas](#6-estrategia-integración)
7. [Consideraciones Técnicas](#7-consideraciones-técnicas)
8. [Riesgos y Mitigaciones](#8-riesgos)

---

## 1. VISIÓN GENERAL DE JONAS SOFTWARE

### 1.1 ¿Qué es Jonas Software?
Jonas Software es una **división de Constellation Software Inc.** (TSX: CSU), una de las compañías de software más grandes de Canadá. Jonas Software opera como un **holding de empresas de software vertical** que adquiere y opera compañías de software en mercados verticales específicos.

### 1.2 Mercados Verticales de Jonas
Jonas Software opera en múltiples verticales:
- **Construcción** (Jonas Construction Software)
- **Fitness y Clubes** (Jonas Fitness, Club Automation)
- **Hospitalidad** (Jonas Hospitality)
- **Foodservice** (Jonas Foodservice)
- **Eventos** (Jonas Event Technology)

### 1.3 Dato Crítico: Jonas NO es un Solo Producto
**IMPORTANTE**: "Jonas" no es un único sistema ERP. Es un **grupo de empresas** con múltiples productos. Es fundamental identificar **exactamente cuál producto Jonas** se está utilizando en la operación, ya que cada uno tiene diferentes:
- Arquitecturas técnicas
- APIs disponibles
- Métodos de integración
- Bases de datos
- Capacidades

### 1.4 Productos Jonas Más Comunes

| Producto | Vertical | Descripción |
|----------|----------|-------------|
| **Jonas Enterprise** | Construcción | ERP completo para contratistas |
| **Jonas Premier** | Construcción | Versión para empresas medianas |
| **Jonas Fitness** | Fitness/Clubes | Gestión de gimnasios y clubes |
| **Jonas Club Software** | Clubes privados | Gestión de clubes |
| **Jonas Hospitality** | Hospitalidad | Gestión hotelera y restaurantes |
| **Jonas Foodservice** | Alimentación | Gestión de servicios de alimentos |

---

## 2. JONAS CONSTRUCTION SOFTWARE (ENTERPRISE)

### 2.1 Descripción
Jonas Construction Software (Jonas Enterprise) es un **ERP especializado para contratistas de construcción y servicios mecánicos**. Con más de 30 años en el mercado y más de 1,000 clientes.

### 2.2 Características Principales
- **Software de contabilidad de construcción** completamente integrado
- Diseñado para **contratistas especializados y mecánicos**
- Cumplimiento **GAAP** (Generally Accepted Accounting Principles)
- Gestión de **órdenes de trabajo y servicio**
- **Despacho** de técnicos en tiempo real
- **eMobile** para trabajo de campo

### 2.3 Arquitectura Técnica de Jonas Enterprise
- **Plataforma**: Windows-based (cliente-servidor)
- **Base de datos**: Microsoft SQL Server (típicamente)
- **Hosting**: On-premise o hosted por Jonas (cloud hosting)
- **Interfaz**: Windows desktop application + módulos web
- **Reportes**: Crystal Reports integrado

---

## 3. MÓDULOS DE JONAS ENTERPRISE

### 3.1 Módulo de Contabilidad (Accounting)

#### General Ledger (Libro Mayor)
- Completamente compatible con **GAAP**
- Diseñado específicamente para contratistas
- Flexibilidad de períodos contables abiertos
- Seguridad a nivel de usuario para posteo de transacciones
- Contabilidad **multi-compañía** con transacciones inter-compañía automáticas

#### Accounts Receivable (Cuentas por Cobrar)
- Control completo sobre facturación a clientes
- Gestión de cobros
- Opciones de facturación:
  - Facturación por avance de obra (Progress Billing)
  - Formato AIA
  - Facturación por costo de trabajo (Job Cost)
  - Contratos de mantenimiento preventivo
  - Órdenes de trabajo
  - Facturación por tiempo y materiales
- Cálculo automático de **retenciones (holdback/retainage)**

#### Accounts Payable (Cuentas por Pagar)
- Gestión de facturas de proveedores y subcontratistas
- Control de flujo de efectivo
- Selección de facturas a pagar y cuándo
- Automatización de:
  - Lien waivers
  - Liberación de retenciones
  - Pagos por depósito directo
  - Cuentas por pagar recurrentes

#### Fixed Assets (Activos Fijos)
- Monitoreo de ubicación y valor de activos
- Gestión de depreciación y amortización
- Seguimiento por categoría y ubicación
- Cálculo automático de depreciación con asientos mensuales
- Variedad de tasas y métodos de depreciación

### 3.2 Módulo de Nómina (Payroll)
- Nómina para EE.UU. y Canadá
- Procesamiento de nómina sindicalizada
- Nómina certificada
- Trabajo de aprendices
- Multi-depósito directo
- **Time & Attendance**: Acumulación de horas, vacaciones, incapacidades
- **Safety Work Hours**: Registro de seguridad laboral
- **eTimesheets**: Captura web de horas laborales remotas

### 3.3 Módulo de Inventario y Equipos
- Gestión de inventario de materiales
- Control de equipos y herramientas
- Seguimiento de ubicación de equipos
- Costos de mantenimiento

### 3.4 Módulo de Reportes
- Crystal Reports integrado
- Reportes financieros estándar
- Reportes de costos de trabajo
- Dashboards operativos

### 3.5 Módulo de Gestión Documental (Digio/eDigio)
- Gestión electrónica de documentos
- Vinculación de documentos a transacciones
- Protocolo estandarizado de gestión documental

### 3.6 Project Management Toolkit
- Gestión de proyectos de construcción
- Estimación de costos
- Control de presupuestos
- Seguimiento de avance

### 3.7 Service Management Toolkit
- Gestión de órdenes de servicio
- Despacho de técnicos
- Mantenimiento preventivo
- Facturación de servicios

### 3.8 Módulos Web (Portal)
- **eService**: Portal web para clientes
- **eMobile**: Aplicación móvil para técnicos de campo
- **eTimesheets**: Captura de horas vía web

---

## 4. INTEGRACIÓN Y APIs DE JONAS

### 4.1 Estado Actual de APIs de Jonas
**HALLAZGO CRÍTICO DE LA INVESTIGACIÓN:**

Jonas Construction Software **NO expone una API REST/SOAP pública documentada** de manera abierta. A diferencia de SAP Business One que tiene documentación extensiva de su Service Layer, Jonas opera con un modelo diferente:

#### Métodos de Integración Disponibles:

| Método | Descripción | Viabilidad |
|--------|-------------|------------|
| **Base de datos directa** | Acceso directo a SQL Server | Alta (con precauciones) |
| **Archivos de intercambio** | Importación/exportación de archivos CSV/XML | Media |
| **API propietaria** | APIs internas (requiere contacto con Jonas) | Requiere negociación |
| **Yellow Dog API** | Integración vía Yellow Dog Software (partner) | Para inventario retail |
| **Crystal Reports** | Extracción de datos vía reportes | Solo lectura |
| **ODBC/OLE DB** | Conexión a base de datos vía drivers estándar | Alta (solo lectura recomendado) |

### 4.2 Integración vía Base de Datos Directa (SQL Server)

**Esta es la estrategia más viable y común para integrar Jonas con sistemas externos.**

#### Ventajas:
- Acceso completo a todos los datos
- Sin dependencia de APIs propietarias
- Rendimiento óptimo (consultas directas)
- Flexibilidad total en las consultas

#### Precauciones CRÍTICAS:
1. **NUNCA escribir directamente** en tablas de Jonas sin entender la lógica de negocio
2. **Usar vistas (views)** para lectura de datos
3. **Usar stored procedures** de Jonas si existen para escritura
4. **Crear tablas intermedias** (staging tables) para intercambio de datos
5. **Respetar la integridad referencial** de la base de datos
6. **Coordinar con Jonas** para entender el esquema de datos
7. **Documentar todas las tablas** utilizadas

#### Tablas Principales Estimadas de Jonas (SQL Server):

> **NOTA**: Los nombres exactos de tablas deben confirmarse con el equipo de Jonas o mediante exploración de la base de datos. Los siguientes son nombres típicos basados en la estructura del sistema:

| Área | Tablas Probables | Uso |
|------|-----------------|-----|
| **Clientes** | `Customer`, `CustomerAddress`, `CustomerContact` | Maestro de clientes |
| **Artículos/Inventario** | `Inventory`, `InventoryItem`, `InventoryLocation` | Maestro de productos |
| **Facturación** | `Invoice`, `InvoiceDetail`, `InvoiceHeader` | Facturas |
| **Pagos** | `Payment`, `PaymentDetail`, `CashReceipt` | Cobros |
| **Contabilidad** | `GLAccount`, `GLTransaction`, `GLJournal` | Libro mayor |
| **Órdenes de Trabajo** | `WorkOrder`, `WorkOrderDetail`, `ServiceCall` | Servicio |

### 4.3 Integración vía Yellow Dog (Para Inventario Retail)
Yellow Dog Software ofrece una integración bidireccional con Jonas:
- **2-way Retail integration** vía Yellow Dog API
- Sincronización de inventario
- Para clientes de Food & Beverage: integración 1-way vía intercambio de archivos

### 4.4 Jonas Event Technology API (Referencia)
Jonas Event Technology (diferente a Jonas Construction) sí documenta APIs:
- API REST para gestión de eventos
- Documentación disponible en: https://jonas.events/documentation/api-overview/
- **NOTA**: Esta API es para el producto de eventos, NO para construcción

### 4.5 Contacto con Jonas para APIs
**Acción requerida**: Contactar directamente a Jonas Software para:
1. Solicitar documentación técnica de la base de datos
2. Preguntar por APIs disponibles o en desarrollo
3. Solicitar acceso a un ambiente de desarrollo/sandbox
4. Preguntar por partners de integración certificados
5. Revisar términos de licencia para acceso a base de datos

**Contacto Jonas Construction:**
- Web: https://www.jonasconstruction.com/
- Oficinas: 45 Vogell Road, Suite 500, Richmond Hill, Ontario, L4B 3P6, Canada

---

## 5. FLUJO DE DATOS JONAS ↔ POS

### 5.1 Datos que el POS Necesita LEER de Jonas

| Dato | Frecuencia | Prioridad |
|------|------------|-----------|
| Catálogo de artículos/inventario | Sincronización periódica (cada X min) | Alta |
| Precios y listas de precios | Sincronización periódica | Alta |
| Clientes/Socios de negocio | Sincronización periódica | Alta |
| Stock disponible por almacén | Tiempo real o casi real | Alta |
| Condiciones de pago | Al iniciar sesión | Media |
| Vendedores/Empleados | Al iniciar sesión | Media |
| Configuración fiscal | Al iniciar sesión | Media |
| Órdenes de trabajo abiertas | Según necesidad | Media |

### 5.2 Datos que el POS Necesita ESCRIBIR en Jonas

| Dato | Frecuencia | Prioridad |
|------|------------|-----------|
| Facturas de venta | Inmediato (post-venta) | Crítica |
| Pagos recibidos | Inmediato (post-pago) | Crítica |
| Notas de crédito/devoluciones | Inmediato | Crítica |
| Movimientos de inventario | Inmediato | Alta |
| Nuevos clientes | Según necesidad | Media |
| Cierre de caja | Al cierre | Alta |

### 5.3 Estrategia de Sincronización

```
┌─────────┐     ┌──────────────────┐     ┌─────────┐
│  JONAS   │◄───►│  MIDDLEWARE /     │◄───►│   POS   │
│  (SQL)   │     │  CAPA DE         │     │ (App)   │
│          │     │  INTEGRACIÓN     │     │         │
└─────────┘     └──────────────────┘     └─────────┘
                        │
                        ▼
                ┌──────────────────┐
                │  BASE DE DATOS   │
                │  INTERMEDIA      │
                │  (Staging DB)    │
                └──────────────────┘
```

---

## 6. ESTRATEGIA DE INTEGRACIÓN CON JONAS

### 6.1 Patrón Recomendado: Database Integration Layer

```
JONAS DB (SQL Server)
    │
    ├── [LECTURA] Vistas (Views) personalizadas
    │   ├── vw_POS_Items (artículos para POS)
    │   ├── vw_POS_Customers (clientes para POS)
    │   ├── vw_POS_Prices (precios para POS)
    │   ├── vw_POS_Stock (stock disponible)
    │   └── vw_POS_Config (configuración)
    │
    ├── [ESCRITURA] Stored Procedures
    │   ├── sp_POS_CreateInvoice (crear factura)
    │   ├── sp_POS_CreatePayment (registrar pago)
    │   ├── sp_POS_CreateCreditNote (nota de crédito)
    │   └── sp_POS_UpdateStock (actualizar stock)
    │
    └── [STAGING] Tablas intermedias
        ├── POS_SalesQueue (cola de ventas pendientes)
        ├── POS_PaymentQueue (cola de pagos pendientes)
        ├── POS_SyncLog (log de sincronización)
        └── POS_ErrorLog (log de errores)
```

### 6.2 Middleware de Integración
Se recomienda construir un **servicio middleware** que:

1. **Exponga una API REST** para el POS (similar al Service Layer de SAP)
2. **Traduzca** las operaciones del POS a operaciones de Jonas
3. **Maneje la cola** de transacciones pendientes
4. **Gestione reintentos** en caso de fallos
5. **Mantenga logs** de todas las operaciones
6. **Valide datos** antes de escribir en Jonas

### 6.3 Patrón de Cola de Mensajes (Message Queue)

```
POS Terminal → API REST → Message Queue → Worker → Jonas DB
                                              ↓
                                         SAP B1 (Service Layer)
```

Tecnologías recomendadas para la cola:
- **RabbitMQ** (open source, robusto)
- **Redis** (para colas simples y caché)
- **SQL Server Service Broker** (si ya se usa SQL Server)

---

## 7. CONSIDERACIONES TÉCNICAS

### 7.1 Acceso a Base de Datos Jonas
- Verificar que se tiene acceso de **lectura** a la BD de Jonas
- Solicitar un **usuario de base de datos dedicado** para el POS
- Configurar permisos **mínimos necesarios** (principio de menor privilegio)
- Establecer **conexión segura** (SSL/TLS para SQL Server)

### 7.2 Esquema de Base de Datos
- **Mapear las tablas principales** de Jonas antes de iniciar desarrollo
- Documentar **relaciones entre tablas** (foreign keys)
- Identificar **campos obligatorios** para cada operación
- Entender **triggers y constraints** existentes

### 7.3 Rendimiento
- Crear **índices** en las vistas personalizadas si es necesario
- Usar **connection pooling** para la conexión a SQL Server
- Implementar **caché** en el middleware para datos que cambian poco
- Monitorear **tiempos de respuesta** de las consultas

### 7.4 Manejo de Errores
- Implementar **circuit breaker** para la conexión a Jonas
- **Cola de reintentos** para transacciones fallidas
- **Alertas** cuando la sincronización falla
- **Modo offline** en el POS cuando Jonas no está disponible

---

## 8. RIESGOS Y MITIGACIONES

### 8.1 Riesgos Identificados

| # | Riesgo | Impacto | Probabilidad | Mitigación |
|---|--------|---------|--------------|------------|
| 1 | Jonas no permite acceso a BD | Crítico | Media | Negociar con Jonas antes de iniciar |
| 2 | Esquema de BD cambia con actualizaciones | Alto | Media | Vistas como capa de abstracción |
| 3 | Escritura directa corrompe datos | Crítico | Alta | Usar staging tables + validación |
| 4 | Sin soporte de Jonas para integración | Alto | Media | Documentar todo internamente |
| 5 | Rendimiento de consultas | Medio | Baja | Índices + caché + optimización |
| 6 | Conflictos de concurrencia | Alto | Media | Locks + transacciones + colas |
| 7 | Pérdida de datos en sincronización | Crítico | Baja | Logs + reintentos + reconciliación |

### 8.2 Acciones Inmediatas Requeridas

1. **URGENTE**: Contactar a Jonas Software para:
   - Confirmar acceso a base de datos
   - Solicitar documentación del esquema
   - Preguntar por APIs disponibles
   - Revisar términos de licencia

2. **URGENTE**: Obtener acceso a un ambiente de desarrollo/pruebas de Jonas

3. **IMPORTANTE**: Mapear el esquema actual de la base de datos de Jonas

4. **IMPORTANTE**: Identificar qué versión exacta de Jonas se está utilizando

---

## FUENTES DE REFERENCIA

### Jonas Software
1. **Jonas Construction Software**: https://www.jonasconstruction.com/
2. **Jonas Enterprise Modules**: https://construction.clubhouseonline-e3.com/Products/Enterprise/Enterprise-Modules
3. **Jonas Software (Corporate)**: https://jonassoftware.com/
4. **Jonas Vertical Markets**: https://jonassoftware.com/vertical-market-construction
5. **Yellow Dog Integration**: https://help.yellowdogsoftware.com/jonas-api

### Constellation Software (Empresa Matriz)
6. **Constellation Software**: https://www.csisoftware.com/
