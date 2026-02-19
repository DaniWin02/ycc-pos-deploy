# Fase 0 — 1‑Pager (Aterrizaje) — POS Country Club Mérida

## Objetivo (qué problema resuelve y para quién)
**Problema**
- Cobro en múltiples puntos del club (restaurante/bar/pro-shop/eventos) con necesidad de continuidad operativa aun con fallas de red.
- Trazabilidad y control (caja, cancelaciones, descuentos, cargos a socio) con auditoría.
- Base para integraciones futuras (socios, contabilidad/ERP, facturación MX).

**Para quién**
- Operación: cajeros, meseros/runner, supervisores.
- Administración: finanzas/contabilidad, almacén, TI.

## Solución propuesta (resumen)
POS **web responsive** (tablet/PC) con adaptación a móvil vía **PWA**, enfoque **offline-first** (captura local + sincronización), y backend con **idempotencia** y **auditoría append-only**.

## MVP (alcance mínimo)
Imprescindible para iniciar operación controlada:
- **Login + roles (RBAC)**.
- **Venta (ticket)**:
  - Alta de ticket, líneas, impuestos, totales.
  - Guardar ticket (HELD) y retomarlo.
  - Cancelación con motivo y permisos.
- **Pagos**:
  - Efectivo.
  - Tarjeta (registro de referencia/voucher/token; sin almacenar PAN/CVV).
  - Cargo a cuenta de socio (validación básica de estatus/límite).
- **Caja/turnos**:
  - Apertura y cierre (corte X/Z), retiros/depósitos.
- **Offline + sync**:
  - Persistencia local (IndexedDB) + outbox.
  - Endpoint de sync (push/pull) con idempotencia.
- **Auditoría**:
  - Registro de eventos clave (ventas, cancelaciones, cierres, movimientos de efectivo).

## No‑MVP (se deja para después)
- CFDI / facturación electrónica.
- Integración completa con ERP/contabilidad del club.
- Inventario avanzado (kardex completo, lotes, producción, etc.).
- Promociones avanzadas (motor complejo por reglas).
- Reportería avanzada y dashboards.
- KDS completo / enrutamiento por estación (solo básico en MVP).

## Criterios de éxito (métricas)
### Operación
- **Tiempo de captura de ticket** (promedio): <= 30–60s para venta simple.
- **Tiempo de cobro** (desde “Cobrar” a confirmación):
  - Online: <= 2s (sin integración de pago) / <= 5s (con integración).
  - Offline: <= 1s (persistencia local).
- **Disponibilidad operativa**: el POS permite vender en modo offline durante fallas.

### Calidad
- **Errores de sincronización**: < 0.5% de eventos con rechazo (excluye validaciones de negocio).
- **Duplicados**: 0 ventas duplicadas por reintentos (idempotencia).
- **Integridad de auditoría**: 100% de operaciones críticas generan `AuditEvent`.

### Negocio
- **Ventas/día capturadas**: 100% de ventas registradas por terminal.
- **Diferencias de caja**: tendencia a disminuir (definir línea base con operación actual).

## Entregables
### Entregables Fase 0
- Este **1‑pager**.
- Lista priorizada **Must / Should / Could** (documento separado).

### Entregables Fase 1
- User stories.
- Flujos (login, compra, caja, cargo a socio, etc.).
- Documentación de pantallas (elementos por pantalla).
- Reglas de negocio (validaciones, estados, permisos, cálculos).
- Diagramas visuales (Mermaid):
  - Flujos (activity/flow)
  - Navegación
  - Secuencias (sync/outbox)
  - State machines de procesos clave

## Referencia
Documento detallado (arquitectura, wireframes, endpoints y `schema.prisma`):
- `Proyecto_POS_CountryClubMerida_Handoff.md`

Diagramas funcionales (Fase 1):
- `Fase1_Requerimientos_DisenoFuncional_POS_CountryClubMerida.md`
