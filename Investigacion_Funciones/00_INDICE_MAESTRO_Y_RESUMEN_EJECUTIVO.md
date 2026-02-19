# PROYECTO: PUNTO DE VENTA (PDV)
## Integrado con SAP Business One + Jonas Software
### ÍNDICE MAESTRO Y RESUMEN EJECUTIVO
### Fecha: Febrero 2026

---

## DOCUMENTOS DE ESTE PAQUETE

| # | Documento | Contenido |
|---|-----------|-----------|
| **00** | **Este documento** | Índice maestro, resumen ejecutivo, decisiones clave |
| **01** | `01_INVESTIGACION_COMPLETA_SAP_B1.md` | Todo sobre SAP Business One: Service Layer API, DI API, Gateway, Customer Checkout, módulos, entidades, autenticación, flujos de venta, fiscalidad |
| **02** | `02_INVESTIGACION_COMPLETA_JONAS.md` | Todo sobre Jonas Software: módulos, arquitectura, integración, acceso a BD, riesgos, estrategia |
| **03** | `03_PLAN_MAESTRO_IMPLEMENTACION_POS.md` | Arquitectura completa, stack tecnológico, middleware, flujos de negocio, modelo de datos SQL, plan de fases (22 semanas), buenas prácticas contables, seguridad, pruebas |

---

## RESUMEN EJECUTIVO

### Objetivo
Construir un **Punto de Venta (POS) desde cero**, profesional y robusto, que se integre bidireccionalmente con **SAP Business One** (ERP principal) y **Jonas Software** (ERP de construcción/servicios), siguiendo las mejores prácticas de contaduría, administración y programación.

### Hallazgos Clave de la Investigación

#### SAP Business One
- **Service Layer (REST API)** es la interfaz recomendada por SAP para integraciones externas
- API basada en **OData v3/v4**, comunicación HTTPS, formato JSON
- Expone **+200 entidades** de negocio (facturas, pagos, inventario, clientes, etc.)
- Autenticación vía **B1SESSION cookie** (Basic Auth) u **OAuth 2.0**
- Documentación oficial **extensa y pública**
- SAP tiene su propio POS (**SAP Customer Checkout**) pero construir uno propio da más flexibilidad y permite integrar Jonas

#### Jonas Software
- Jonas es un **grupo de empresas** de software vertical (construcción, fitness, hospitalidad, etc.)
- Jonas Construction Enterprise usa **SQL Server** como base de datos
- **NO tiene API REST/SOAP pública documentada** — este es el hallazgo más crítico
- La integración debe hacerse vía **acceso directo a SQL Server** (lectura) + **tablas staging** (escritura)
- Es **URGENTE** contactar a Jonas para confirmar acceso y obtener documentación del esquema
- Módulos relevantes: Contabilidad (GL, AR, AP), Inventario, Órdenes de Trabajo

### Decisiones Arquitectónicas Principales

| Decisión | Elección | Razón |
|----------|----------|-------|
| **Interfaz SAP B1** | Service Layer (REST) | Recomendado por SAP, multiplataforma, escalable |
| **Interfaz Jonas** | SQL Server directo + Staging | Única opción viable sin API pública |
| **Fuente de verdad** | SAP B1 (por defecto) | ERP principal para ventas/inventario/contabilidad |
| **Frontend POS** | React + TypeScript | Moderno, tipado, funciona en web y offline |
| **Backend** | Node.js (NestJS) o .NET Core | Ambos viables; .NET si el equipo es más fuerte ahí |
| **BD del POS** | PostgreSQL + Redis | Robusta, ACID, caché rápido |
| **Comunicación** | Cola de mensajes (Redis/RabbitMQ) | Desacoplamiento, resiliencia, modo offline |
| **Fiscalidad** | CFDI 4.0 vía PAC | Cumplimiento SAT México |

### Riesgos Principales

| Riesgo | Severidad | Acción Inmediata |
|--------|-----------|------------------|
| Jonas no permite acceso a BD | **CRÍTICO** | Contactar Jonas ANTES de iniciar desarrollo |
| Esquema Jonas no documentado | **ALTO** | Mapear BD manualmente si no hay docs |
| Licencias SAP (sesiones Service Layer) | **MEDIO** | Verificar licencias disponibles |
| Complejidad fiscal CFDI | **MEDIO** | Involucrar contador desde Fase 0 |

### Timeline Estimado

```
FASE 0: Preparación .............. Semanas 1-3   (3 semanas)
FASE 1: Infraestructura ......... Semanas 4-7   (4 semanas)
FASE 2: Backend API ............. Semanas 8-11  (4 semanas)
FASE 3: Frontend POS ............ Semanas 10-15 (6 semanas, paralelo)
FASE 4: Integración Fiscal ...... Semanas 14-16 (3 semanas)
FASE 5: Pruebas Integrales ...... Semanas 17-19 (3 semanas)
FASE 6: Despliegue .............. Semanas 20-22 (3 semanas)
─────────────────────────────────────────────────────────────
TOTAL: ~22 semanas (5.5 meses)
```

### Acciones Inmediatas (Antes de Empezar a Programar)

1. **URGENTE**: Contactar a Jonas Software para confirmar acceso a base de datos y solicitar documentación técnica
2. **URGENTE**: Obtener credenciales de Service Layer de SAP B1 y configurar ambiente sandbox
3. **IMPORTANTE**: Definir con el negocio cuál es la fuente de verdad principal (SAP B1 vs Jonas)
4. **IMPORTANTE**: Seleccionar PAC para timbrado CFDI
5. **IMPORTANTE**: Documentar los flujos de venta actuales (AS-IS)
6. **IMPORTANTE**: Responder las 15 preguntas del Apéndice A del documento 03

---

## FUENTES OFICIALES CONSULTADAS

### SAP Business One
| Recurso | URL |
|---------|-----|
| Service Layer API Reference | https://help.sap.com/doc/056f69366b5345a386bb8149f1700c19/10.0/en-US/Service%20Layer%20API%20Reference.html |
| Working with Service Layer (PDF) | https://help.sap.com/doc/fc2f5477516c404c8bf9ad1315a17238/10.0/en-US/Working_with_SAP_Business_One_Service_Layer.pdf |
| API Gateway (PDF) | https://help.sap.com/doc/896f5237207d479ba5618d2666754d9a/10.0/en-US/How_to_Work_with_SAP_Business_One_API_Gateway.pdf |
| DI API Reference | https://help.sap.com/doc/089315d8d0f8475a9fc84fb919b501a3/10.0/en-US/SDKHelp/SAPbobsCOM_P.html |
| SAP Learning - Service Layer | https://learning.sap.com/courses/leveraging-the-sap-business-one-service-layer |
| SAP Customer Checkout | https://www.sap.com/products/crm/pos-customer-checkout.html |
| SAP Community - B1 + POS | https://community.sap.com/t5/enterprise-resource-planning-q-a/connecting-a-point-of-sale-pos-systems-to-sap-business-one/qaq-p/8518170 |
| Service Layer API (Mirror completo) | https://ozeraydin.com/sapb1/SapBusinessOneServiceLayerAPIReference.html |
| Authentication Best Practices | https://ahmed.aboalia.com/blogs/Service-Layer-Authentication-Best-Practices |

### Jonas Software
| Recurso | URL |
|---------|-----|
| Jonas Construction Software | https://www.jonasconstruction.com/ |
| Jonas Enterprise Modules | https://construction.clubhouseonline-e3.com/Products/Enterprise/Enterprise-Modules |
| Jonas Software (Corporate) | https://jonassoftware.com/ |
| Jonas Vertical Markets | https://jonassoftware.com/vertical-market-construction |
| Yellow Dog - Jonas Integration | https://help.yellowdogsoftware.com/jonas-api |

### Integración POS + SAP
| Recurso | URL |
|---------|-----|
| SAP B1 Integration Scenarios | https://www.appseconnect.com/sap-business-one-integration-scenarios-use-cases-and-powerful-solutions/ |
| SAP Customer Checkout + B1 | https://consensusintl.com/sap-customer-checkout-pos-for-small-retail-business |
| SAP POS Integration (S/4HANA ref.) | https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/9905622a5c1f49ba84e9076fc83a9c2c/a559d0a17e8d40f48fc24750574e877d.html |

---

*Este paquete de documentación constituye la base de investigación completa para el proyecto de Punto de Venta. Todo el contenido está fundamentado en documentación oficial y fuentes verificables.*
