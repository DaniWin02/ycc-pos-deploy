# YCC Kitchen Display System (KDS)

## 📋 Overview

El KDS (Kitchen Display System) es una aplicación web moderna para la gestión de órdenes en tiempo real en cocinas comerciales. Proporciona una interfaz intuitiva para que el personal de cocina vea, gestione y complete órdenes de manera eficiente.

## 🚀 Features

### Core Features
- **Real-time Updates**: Conexión WebSocket para actualizaciones instantáneas
- **Multi-Station Support**: Cocina, Bar, Parrilla, Postres
- **Ticket Management**: Gestión completa de estados de tickets
- **Timer System**: Temporizadores inteligentes con alertas de urgencia
- **Expediter View**: Vista consolidada para control de calidad

### UX Features
- **Dark Theme**: Optimizado para ambientes de cocina
- **Responsive Design**: Funciona en tablets y monitores
- **Animations Suaves**: <300ms, 60fps performance
- **Accessibility**: WCAG 2.1 AA compliance

### Technical Features
- **TypeScript**: Tipado estricto para mejor mantenimiento
- **Zustand State Management**: Estado centralizado eficiente
- **Framer Motion**: Animaciones performantes
- **Modular Architecture**: Componentes reutilizables

## 🏗️ Architecture

### Component Structure
```
src/
├── components/
│   ├── KdsApp.tsx              # App principal
│   ├── KdsHeader.tsx            # Header con tiempo y contador
│   ├── KdsStationSelector.tsx    # Selector de estación
│   ├── KdsTicketGrid.tsx         # Grid de tickets
│   ├── KdsTicket.tsx             # Ticket individual
│   ├── KdsTicketHeader.tsx       # Header del ticket
│   ├── KdsTicketItem.tsx         # Item del ticket
│   ├── KdsTicketActions.tsx      # Acciones del ticket
│   ├── KdsTimer.tsx              # Componente de timer
│   ├── KdsPagination.tsx         # Paginación
│   ├── KdsExpediter.tsx         # Vista de expediter
│   └── ConnectionBanner.tsx       # Banner de conexión
├── stores/
│   └── useKdsStore.ts           # Zustand store con WebSocket
├── App.tsx                      # Router principal
├── main.tsx                     # Punto de entrada
└── index.css                    # Estilos KDS
```

### State Management
- **Zustand Store**: Estado centralizado con persistencia
- **WebSocket Integration**: Real-time con backend
- **Event Handling**: order:new, order:modified, order:cancelled

## 🎨 Design System

### Color Palette (Dark Theme)
- **Background**: #0F0F0F
- **Cards**: #1E1E1E
- **Border**: #2A2A2A
- **Text**: #FFFFFF
- **Secondary**: #9CA3AF
- **Header**: #1A1A1A

### Timer Colors
- **Green** (<5min): #10B981
- **Yellow** (5-10min): #F59E0B
- **Red** (>10min): #EF4444
- **Pulse** (>15min): Animación roja

## 📱 Responsive Breakpoints
- **Mobile**: <768px
- **Tablet**: 768px-1024px
- **Desktop**: >1024px

## 🔧 Development

### Prerequisites
- Node.js 18+
- pnpm package manager

### Installation
```bash
pnpm install
```

### Development Server
```bash
pnpm dev
```
Server runs on http://localhost:3002

### Build
```bash
pnpm build
```

### Linting
```bash
pnpm lint
```

### Type Checking
```bash
pnpm type-check
```

## 🔌 WebSocket Events

### Client → Server
- `join-room`: Unirse a room de estación
- `kds:item-started`: Marcar item como iniciado
- `kds:item-ready`: Marcar item como listo
- `expediter:bump-ticket`: Marcar ticket como entregado

### Server → Client
- `order:new`: Nueva orden recibida
- `order:modified`: Orden modificada
- `order:cancelled`: Orden cancelada

## 🎯 Usage

### Station Selection
1. Abrir aplicación en http://localhost:3002
2. Seleccionar estación (Cocina, Bar, Parrilla, Postres)
3. Sistema se conecta automáticamente al backend

### Ticket Management
1. **Ver Tickets**: Nuevos tickets aparecen automáticamente
2. **Actualizar Estado**: Click en item para cambiar estado
3. **Completar Ticket**: Click en "Completar" cuando todos los items estén listos
4. **Cancelar Ticket**: Click en "Cancelar" si es necesario

### Timer System
- **Verde**: <5 minutos - Normal
- **Amarillo**: 5-10 minutos - Atención
- **Rojo**: >10 minutos - Urgente
- **Pulso**: >15 minutos - Crítico

## 🔍 Troubleshooting

### Common Issues
1. **Connection Lost**: Verificar backend WebSocket server
2. **Missing Tickets**: Verificar room assignment
3. **Timer Issues**: Verificar sincronización de tiempo

### Debug Mode
```bash
# Habilitar logs de WebSocket
localStorage.setItem('kds-debug', 'true')
```

## 📊 Performance

### Metrics
- **Animation Duration**: <300ms
- **Frame Rate**: 60fps
- **Bundle Size**: ~500KB gzipped
- **Load Time**: <2s en 3G

### Optimization
- **Code Splitting**: Por ruta
- **Tree Shaking**: Eliminación de código muerto
- **Image Optimization**: WebP format
- **Caching**: Service Worker

## 🧪 Testing

### Unit Tests
```bash
pnpm test
```

### Integration Tests
```bash
pnpm test:integration
```

### E2E Tests
```bash
pnpm test:e2e
```

## 🚀 Deployment

### Environment Variables
```env
VITE_WS_URL=ws://localhost:3001
VITE_API_URL=http://localhost:3001
VITE_STORE_ID=store-1
```

### Docker Deployment
```bash
docker build -t ycc-kds .
docker run -p 3002:3002 ycc-kds
```

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Basic KDS functionality
- ✅ WebSocket integration
- ✅ Multi-station support
- ✅ Timer system
- ✅ Expediter view
- ✅ Responsive design
- ✅ Dark theme

### Planned Features
- 🔄 Voice commands
- 🔄 Kitchen printer integration
- 🔄 Analytics dashboard
- 🔄 Multi-language support

## 🤝 Contributing

### Guidelines
1. Follow TypeScript strict mode
2. Use semantic commits
3. Test all changes
4. Update documentation

### Code Style
- ESLint + Prettier
- Conventional Commits
- Component-first development
- Accessibility first

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For technical support:
- Email: dev@ycc.com
- Documentation: https://docs.ycc.com/kds
- Issues: https://github.com/ycc/kds/issues
