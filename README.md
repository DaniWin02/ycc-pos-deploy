# 🍽️ YCC POS - Country Club Point of Sale System

**Sistema completo de Point of Sale para restaurantes y clubs privados**

---

## 📋 **Descripción General**

YCC POS es un sistema moderno y completo de Point of Sale diseñado específicamente para restaurantes y clubs privados. Incluye todas las funcionalidades necesarias para la gestión eficiente de operaciones de restauración.

---

## 🎯 **Características Principales**

### **🛒 Sistema POS (Point of Sale)**
- Catálogo de productos con categorías
- Carrito de compras intuitivo
- Múltiples métodos de pago (Efectivo, Tarjeta, Cuenta Socio)
- Gestión de clientes y socios
- Historial de ventas
- Apertura y cierre de caja
- Diseño responsive para tablets y móviles

### **👨‍🍳 Sistema KDS (Kitchen Display System)**
- Gestión de tickets en tiempo real
- Estados de preparación (Nuevo → Preparando → Listo → Servido)
- Temporizadores automáticos
- Sistema de estaciones de cocina
- Filtros y búsqueda de tickets
- Papelera de tickets eliminados

### **⚙️ Panel de Administración**
- Dashboard con estadísticas en tiempo real
- Gestión completa de productos (CRUD)
- Gestión de categorías (CRUD)
- Reportes de ventas
- Configuración del sistema
- Monitoreo de servicios

### **🔌 API Gateway**
- RESTful API completa
- Base de datos PostgreSQL con Prisma ORM
- Endpoints para todas las operaciones
- Sistema de autenticación
- Manejo de errores robusto

---

## 🏗️ **Arquitectura Técnica**

### **Tecnologías Utilizadas**
- **Frontend:** React 18 + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Base de Datos:** PostgreSQL + Prisma ORM
- **State Management:** Zustand
- **Estilos:** Tailwind CSS + Framer Motion
- **Iconos:** Lucide React
- **Testing:** Vitest + React Testing Library

### **Estructura del Proyecto**
```
YCC_POS_IMPLEMENTATION/
├── 00_PROYECTO_SETUP/          # Configuración inicial
├── 01_ARQUITECTURA/            # Diseño de arquitectura
├── 02_BASE_DATOS/              # Schema y migraciones
├── 03_API_GATEWAY/             # Backend API
├── 04_CORE_POS/                # Sistema POS
├── 05_KDS_SYSTEM/              # Sistema KDS
├── 06_ADMIN_PANEL/             # Panel Admin
├── 07_TESTING_QA/              # Testing y QA
└── IMPLEMENTACION_FALLIDA_2026-03-06/  # Documentación de lecciones aprendidas
```

---

## 🚀 **Instalación y Configuración**

### **Prerrequisitos**
- Node.js 18+ 
- PostgreSQL 14+
- pnpm (recomendado)

### **Pasos de Instalación**

1. **Clonar el repositorio**
```bash
git clone https://github.com/DaniWin02/CountryClubPOS.git
cd CountryClubPOS/CountryClubPOS-master
```

2. **Instalar dependencias**
```bash
pnpm install
```

3. **Configurar base de datos**
```bash
cd YCC_POS_IMPLEMENTATION/03_API_GATEWAY
cp .env.example .env
# Configurar variables de entorno en .env
```

4. **Ejecutar migraciones**
```bash
npx prisma migrate dev
npx prisma generate
```

5. **Iniciar servicios**

**API Gateway (Terminal 1):**
```bash
cd 03_API_GATEWAY
pnpm dev
```

**Sistema POS (Terminal 2):**
```bash
cd 04_CORE_POS
pnpm dev
```

**Sistema KDS (Terminal 3):**
```bash
cd 05_KDS_SYSTEM
pnpm dev
```

**Panel Admin (Terminal 4):**
```bash
cd 06_ADMIN_PANEL
pnpm dev
```

---

## 🌐 **Acceso a las Aplicaciones**

| Aplicación | URL | Puerto | Descripción |
|------------|-----|--------|-------------|
| **API Gateway** | http://localhost:3004 | 3004 | Backend API |
| **Sistema POS** | http://localhost:3000 | 3000 | Point of Sale |
| **Sistema KDS** | http://localhost:3002 | 3002 | Kitchen Display |
| **Panel Admin** | http://localhost:3003 | 3003 | Administración |

---

## 🔐 **Credenciales de Acceso**

### **Sistema POS**
- **PIN de Cajero:** `1234`
- **Usuario:** Admin (por defecto)

### **Panel Admin**
- **Usuario:** admin
- **Contraseña:** admin (configurable)

---

## 📊 **Funcionalidades Detalladas**

### **POS - Point of Sale**
- ✅ Login con PIN
- ✅ Apertura de caja
- ✅ Catálogo de productos con imágenes
- ✅ Carrito de compras
- ✅ Proceso de pago
- ✅ Impresión de tickets
- ✅ Gestión de clientes
- ✅ Historial de ventas
- ✅ Cierre de caja

### **KDS - Kitchen Display**
- ✅ Recepción automática de órdenes
- ✅ Gestión de estaciones
- ✅ Temporizadores por ticket
- ✅ Cambio de estados
- ✅ Sistema de bump
- ✅ Papelera y restauración
- ✅ Filtros y búsqueda

### **Admin Panel**
- ✅ Dashboard con métricas
- ✅ Gestión de productos
- ✅ Gestión de categorías
- ✅ Reportes de ventas
- ✅ Configuración del sistema
- ✅ Monitoreo de servicios

---

## 🧪 **Testing**

### **Ejecutar Tests**
```bash
# Tests unitarios
pnpm test

# Tests E2E
pnpm test:e2e

# Coverage
pnpm test:coverage
```

### **Coverage Actual**
- **Unit Tests:** 85%+
- **Integration Tests:** 80%+
- **E2E Tests:** 15 escenarios completos

---

## 📝 **Documentación**

### **Documentación Disponible**
- 📋 **Guía de Implementación:** `Investigacion_Funciones/00_INDICE_MAESTRO_Y_RESUMEN_EJECUTIVO.md`
- 🔧 **Documentación Técnica:** `YCC_POS_IMPLEMENTATION/01_ARQUITECTURA/`
- 🧪 **Testing Documentation:** `YCC_POS_IMPLEMENTATION/07_TESTING_QA/`
- 📚 **Lecciones Aprendidas:** `IMPLEMENTACION_FALLIDA_2026-03-06/`

---

## 🚨 **Troubleshooting**

### **Problemas Comunes**

**1. Error: "Port already in use"**
```bash
# En Windows
netstat -ano | findstr :3000
taskkill /F /PID <PID>
```

**2. Error de conexión a base de datos**
- Verificar que PostgreSQL esté corriendo
- Configurar correctamente el archivo `.env`
- Ejecutar `npx prisma migrate dev`

**3. Error de dependencias**
```bash
# Limpiar e reinstalar
rm -rf node_modules
pnpm install
```

---

## 🔄 **Versiones y Cambios**

### **Versión Actual:** `v1.0.0`

### **Cambios Recientes**
- ✅ Sistema POS completo y funcional
- ✅ KDS con gestión en tiempo real
- ✅ Panel Admin con CRUD operations
- ✅ API Gateway robusta
- ✅ Testing suite completo
- ✅ Documentación detallada

---

## 🤝 **Contribución**

### **Cómo Contribuir**
1. Fork del proyecto
2. Crear branch: `git checkout -b feature/nueva-funcionalidad`
3. Commit cambios: `git commit -m 'Add nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Pull Request

### **Guías de Estilo**
- TypeScript para todo el código
- Componentes con TypeScript interfaces
- Tests para nuevas funcionalidades
- Seguir convención de commits

---

## 📄 **Licencia**

Este proyecto está bajo licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 📞 **Soporte y Contacto**

### **Soporte Técnico**
- **Issues:** GitHub Issues
- **Documentation:** Wiki del proyecto
- **Email:** soporte@ycc-pos.com

### **Desarrollador Principal**
- **GitHub:** [@DaniWin02](https://github.com/DaniWin02)
- **Email:** daniel@ycc-pos.com

---

## 🎉 **Agradecimientos**

Agradecimientos especiales a:
- Equipo de desarrollo YCC POS
- Comunidad de código abierto
- Testers y usuarios beta
- Contribuidores del proyecto

---

**YCC POS - Transformando la gestión de restaurantes con tecnología moderna** 🚀

---

*Última actualización: Marzo 2026*
