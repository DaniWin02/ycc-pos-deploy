# Brief técnico — POS Web/PWA (Country Club Mérida)

## 1) Objetivo
Construir un **POS web** para Country Club Mérida, operable en **tablet/PC** y **adaptable a móvil** mediante **PWA**, con capacidad **offline-first** y **sincronización automática** al reconectar.

Inspiración funcional:
- POS retail con offline robusto (store-and-forward).
- POS para clubes (cargos a cuenta de socio, ecosistema de módulos).

## 2) Alcance MVP (P0/P1)
### Roles
- Cajero
- Mesero/Runner (móvil)
- Supervisor
- Almacén
- Admin

### Módulos
- **Ventas**: ticket, líneas, impuestos, descuentos, cancelaciones.
- **Pagos**: efectivo, tarjeta (registro voucher/token), **cargo a cuenta de socio**.
- **Caja/Turnos**: apertura, corte X/Z, retiros, depósitos, arqueo.
- **Comandas (F&B)**: envío a cocina/bar (KDS/impresora) y estados.
- **Inventario básico**: decremento por venta + ajustes/conteos (iterativo).
- **Promociones básicas**: % descuento, 2x1, combos (iterativo).
- **Auditoría**: bitácora append-only.

Fuera de MVP (P2): CFDI, integración ERP/contabilidad/reservas, reportes avanzados.

## 3) Stack recomendado (prototipo local migrable)
- **Next.js (App Router)**: UI + API en el mismo proyecto.
- **PWA**: `next-pwa` o Service Worker propio.
- **ORM/Migraciones**: **Prisma**.
- **BD prototipo local**: **SQLite** (`DATABASE_URL="file:./dev.db"`).
- **BD producción**: **Postgres** (mismo esquema/migraciones).

Motivo: iteración rápida en un solo repo + ruta clara de migración.

## 4) Arquitectura offline/sync (resumen)
### Cliente (PWA)
- Persistencia local: **IndexedDB**.
- Cola local: **outbox** con eventos transaccionales (venta pagada, cierre turno, etc.).
- Reintentos con backoff; al reconectar empuja cola.

### Backend
- API REST.
- **Idempotencia obligatoria** por evento/request (`Idempotency-Key`).
- Estrategia MVP:
  - Maestros: server-wins.
  - Transacciones: append-only.

## 5) Endpoints clave (borrador)
- `GET /api/sync/bootstrap?since=...`
  - Devuelve maestros mínimos: productos, impuestos, socios “lite”, promos, permisos.
- `POST /api/sync/outbox`
  - Empuja eventos con header `Idempotency-Key`.
  - Responde aceptados/rechazados.

## 6) Modelo de datos (alto nivel)
Entidades principales (MVP):
- **Auth/Roles**: `User`, `Role`, `UserRole`
- **Operación**: `Area`, `Terminal`
- **Catálogos**: `Product`
- **Socios**: `Member`, `MemberAccount`, `AccountCharge`
- **Venta**: `Sale`, `SaleLine`, `Payment`
- **Caja**: `Shift`, `CashMovement`
- **Auditoría**: `AuditEvent` (append-only, con hashing encadenado `prevHash/hash`)
- **Idempotencia**: `IdempotencyKey` (deduplicación por `scope+key`)

Nota de importes: usar **Decimal** (evitar float).

## 7) Auditoría y controles
- RBAC por rol.
- Aprobación de supervisor para:
  - Descuentos altos
  - Cancelaciones tardías
  - Ajustes de inventario
- PCI: **no** almacenar PAN/CVV; solo token/voucher.
- Auditoría encadenada:
  - `hash = sha256(prevHash + canonicalJson(payload) + metadata)`

## 8) Riesgos/decisiones abiertas
- Reglas de **cargo a socio** (PIN/firma, límites, autorizaciones).
- Política de **propina** y reglas fiscales/contables.
- Integración de pagos: terminal externa vs API (Stripe/otro).
- Operación offline: volumen de transacciones y límites de cola.

## 9) Próximos pasos (sugeridos)
1) Crear repo/proyecto Next.js + Prisma + SQLite.
2) Implementar auth + RBAC mínimo.
3) Implementar flujo P0: venta→pago→persistencia→auditoría.
4) Implementar `outbox` local (IndexedDB) + `POST /api/sync/outbox`.
5) Seeds demo (roles, usuarios, área/terminal, productos, socio).
6) Pruebas: idempotencia, duplicados, reconexión, cierres de turno.

## Referencia
Documento detallado de arquitectura/diagramas/wireframes/esquema:
- `Proyecto_POS_CountryClubMerida_Handoff.md`
