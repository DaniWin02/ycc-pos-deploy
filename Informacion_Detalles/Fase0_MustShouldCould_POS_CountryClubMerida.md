# Fase 0 — Priorización Must / Should / Could — POS Country Club Mérida

## Must (imprescindible)
- Login y sesión.
- Roles/permisos (RBAC) por acción.
- Catálogo de productos/servicios (consulta/búsqueda).
- Venta (ticket):
  - Agregar/eliminar líneas.
  - Cálculo de subtotal/impuestos/total.
  - Guardar ticket (HELD) y retomarlo.
  - Cancelar ticket con motivo + permiso.
- Pagos:
  - Efectivo (cambio).
  - Tarjeta (registro voucher/referencia; sin almacenar PAN/CVV).
  - Cargo a socio (búsqueda + validación de estatus; reglas mínimas).
- Caja/turnos:
  - Apertura de turno.
  - Corte X/Z y cierre.
  - Retiros/depósitos con motivo.
- Offline-first:
  - Persistencia local (IndexedDB).
  - Cola local (outbox) y sincronización al reconectar.
  - Idempotencia en backend para evitar duplicados.
- Auditoría:
  - Eventos críticos (venta pagada, cancelación, cierre turno, movimientos efectivo, descuentos).

## Should (debería tener pronto)
- Comandas básicas (enviar a cocina/bar + estado).
- Descuentos con autorización de supervisor (umbral configurable).
- Pagos mixtos (ej. efectivo + tarjeta).
- Reimpresión de ticket / envío por email/WhatsApp (sin CFDI).
- Reportes básicos:
  - Ventas por día/turno/terminal.
  - Métodos de pago.
  - Diferencias de caja.
- Inventario básico:
  - Decremento por venta.
  - Ajustes manuales.

## Could (nice-to-have)
- Motor de promociones avanzado.
- Integración con terminal de pago (API) en lugar de solo registrar voucher.
- KDS completo (ruteo por estación, tiempos, métricas).
- Inventario avanzado (lotes, caducidades, conteos cíclicos).
- Integración con reservas / tee times.
- Dashboards en tiempo real.

## Notas
- Las listas se ajustan una vez se definan reglas del club (propina, autorización de cargo a socio, políticas de cancelación).
