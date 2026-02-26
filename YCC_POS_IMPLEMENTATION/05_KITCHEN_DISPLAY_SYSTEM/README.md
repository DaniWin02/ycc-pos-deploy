# Fase 0.5 - Kitchen Display System (KDS)
## Sistema de Visualización de Cocina
### Fecha: 23 de Febrero 2026

---

## 📋 Objetivo

Crear el Kitchen Display System (KDS) completo con:
- **Visualización en tiempo real** de órdenes de cocina
- **Gestión de estaciones** de preparación
- **Estados de items** con temporizadores
- **Integración WebSocket** para actualizaciones live
- **Interfaz táctil** optimizada para cocina
- **Notificaciones visuales** y sonoras

---

## 🏗️ Estructura a Crear

```
05_KITCHEN_DISPLAY_SYSTEM/
├── README.md                    # Documentación de la fase
├── src/
│   ├── components/              # Componentes React del KDS
│   │   ├── KdsTicket.tsx
│   │   ├── KdsTicketItem.tsx
│   │   ├── KdsTimer.tsx
│   │   ├── KdsStationSelector.tsx
│   │   ├── KdsProgressBar.tsx
│   │   └── KdsStatusIndicator.tsx
│   ├── hooks/                  # Hooks personalizados del KDS
│   │   ├── useKdsWebSocket.ts
│   │   ├── useKdsTickets.ts
│   │   └── useKdsStation.ts
│   ├── stores/                 # Estado global con Zustand
│   │   └── kdsStore.ts
│   ├── services/               # Servicios de WebSocket y API
│   │   ├── websocket.service.ts
│   │   └── kds.service.ts
│   ├── utils/                  # Utilidades del KDS
│   │   ├── time.utils.ts
│   │   └── status.utils.ts
│   ├── types/                  # Tipos TypeScript del KDS
│   │   └── kds.types.ts
│   └── app.ts                 # Aplicación principal del KDS
├── public/                       # Archivos estáticos
├── docs/
│   ├── KDS_WORKFLOW.md      # Flujo de trabajo del KDS
│   └── WEBSOCKET_EVENTS.md  # Eventos WebSocket
└── package.json                  # Configuración del paquete
```

---

## 🍳 Componentes Principales

### KdsTicket
- **Visualización completa** del ticket de orden
- **Items individuales** con estados y temporizadores
- **Información del cliente** y mesa
- **Acciones rápidas** para cambiar estados
- **Animaciones** para nuevos tickets y actualizaciones

### KdsTicketItem
- **Estado visual** del item (pendiente, preparando, listo)
- **Temporizador** con colores según urgencia
- **Modificadores** y notas visibles
- **Botones de acción** para cambiar estado

### KdsTimer
- **Temporizador en tiempo real** desde creación del item
- **Colores dinámicos** según tiempo transcurrido
- **Formato** HH:MM:SS
- **Alertas** cuando excede tiempo límite

### KdsStationSelector
- **Selector de estación** de trabajo
- **Conexión automática** al WebSocket
- **Indicador de estado** de conexión
- **Cambio dinámico** de estación

---

## 🔄 Flujo de Trabajo del KDS

### 1. **Conexión Inicial**
- Usuario selecciona estación de cocina
- Sistema establece conexión WebSocket
- Carga tickets pendientes de la estación

### 2. **Recepción de Nuevas Órdenes**
- WebSocket recibe evento 'order:new'
- Ticket aparece con animación slide-in
- Temporizadores inician automáticamente

### 3. **Gestión de Items**
- Chef marca item como "en preparación"
- Temporizador cambia color a amarillo
- WebSocket emite 'kds:item-started'

### 4. **Finalización de Items**
- Chef marca item como "listo"
- Temporizador cambia color a verde
- WebSocket emite 'kds:item-ready'

### 5. **Completación de Ticket**
- Todos los items listos → ticket completo
- Ticket desaparece con animación fade-out
- WebSocket emite 'kds:ticket-ready'

---

## 🌐 Eventos WebSocket

### Eventos de Entrada
- **order:new** - Nueva orden creada
- **order:modified** - Orden modificada
- **order:cancelled** - Orden cancelada

### Eventos de Salida
- **kds:item-started** - Item iniciado
- **kds:item-ready** - Item completado
- **kds:ticket-ready** - Ticket completado

### Eventos de Sistema
- **kds:station-connected** - Estación conectada
- **kds:station-disconnected** - Estación desconectada
- **kds:reconnecting** - Reconectando

---

## 🎨 Diseño y UX

### Tema Oscuro
- **Fondo negro** para reducir fatiga visual
- **Texto blanco/alto contraste** para legibilidad
- **Colores vibrantes** para estados importantes
- **Sin elementos decorativos** para máxima claridad

### Interfaz Táctil
- **Botones grandes** (mínimo 44px)
- **Espaciado adecuado** entre elementos
- **Feedback táctil** inmediato
- **Gestos soportados** para acciones rápidas

### Indicadores Visuales
- **Semáforo de tiempo**: Verde (<5min), Amarillo (5-15min), Rojo (>15min)
- **Pulse animation** para items urgentes
- **Slide-in** para nuevos tickets
- **Bounce** para actualizaciones importantes

---

## ✅ Postcheck

### Validación del KDS
- [ ] `pnpm install` funciona sin errores
- [ ] `pnpm typecheck` retorna 0 errores
- [ ] Conexión WebSocket estable y automática
- [ ] Recepción de nuevas órdenes en tiempo real
- [ ] Cambios de estado sincronizados
- [ ] Temporizadores funcionando correctamente
- [ ] Animaciones suaves y responsivas
- [ ] Interfaz táctil optimizada

---

## 🔄 Siguiente Paso

**Completar este prompt y continuar con Fase 0.6: Admin Panel**

---

*Este es el sistema de cocina que permitirá coordinación eficiente entre cocina y meseros.*
