# 🎨 Guía de Migración - Sistema de Temas v2.0

Esta guía explica cómo integrar el nuevo sistema de temas en Admin Panel, POS y KDS.

---

## 📋 Índice

1. [Resumen del Sistema](#resumen-del-sistema)
2. [Integración en Admin Panel](#integración-en-admin-panel)
3. [Integración en POS](#integración-en-pos)
4. [Integración en KDS](#integración-en-kds)
5. [Verificación](#verificación)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Resumen del Sistema

### Arquitectura

```
shared/theme/
├── tokens.css          # Tokens semánticos CSS (50+ variables)
├── types.ts            # Tipos TypeScript
├── utils.ts            # Utilidades (contraste, persistencia)
├── ThemeProvider.tsx   # Provider React con Context API
├── tailwind.config.js  # Configuración Tailwind compartida
└── README.md           # Documentación completa
```

### Características

✅ **Tokens semánticos** - Variables CSS reutilizables  
✅ **Modo claro/oscuro** - Por módulo o global  
✅ **Sincronización en tiempo real** - Vía Socket.IO  
✅ **Persistencia** - localStorage + backend  
✅ **Accesibilidad** - Validación de contraste WCAG  

---

## 🔧 Integración en Admin Panel

### Paso 1: Importar CSS de tokens

Editar `06_ADMIN_PANEL/src/main.tsx`:

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// ✅ AGREGAR ESTA LÍNEA
import '../shared/theme/tokens.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Paso 2: Actualizar Tailwind Config

Editar `06_ADMIN_PANEL/tailwind.config.js`:

```js
const sharedThemeConfig = require('../shared/theme/tailwind.config.js');

/** @type {import('tailwindcss').Config} */
module.exports = {
  ...sharedThemeConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Mantener plugins existentes si los hay
  plugins: [],
};
```

### Paso 3: Envolver App con ThemeProvider

Editar `06_ADMIN_PANEL/src/App.tsx`:

```tsx
import { ThemeProvider } from '../shared/theme';
import { API_URL } from './lib/config';

function App() {
  return (
    <ThemeProvider module="admin" apiUrl={API_URL}>
      {/* Tu aplicación existente */}
      <Router>
        <Routes>
          {/* ... rutas ... */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
```

### Paso 4: Actualizar componentes clave

**Ejemplo: Actualizar Sidebar**

Antes:
```tsx
<div className="bg-gray-900 text-white">
  <button className="bg-blue-600 hover:bg-blue-700">
    Click
  </button>
</div>
```

Después:
```tsx
<div className="bg-sidebar text-sidebar-foreground">
  <button className="bg-primary text-primary-foreground hover:bg-primary-hover">
    Click
  </button>
</div>
```

**Tokens disponibles:**
- `bg-background` / `text-foreground` - Fondo y texto principal
- `bg-card` / `text-card-foreground` - Cards
- `bg-primary` / `text-primary-foreground` - Botones principales
- `bg-sidebar` / `text-sidebar-foreground` - Sidebar
- `border-border` - Bordes
- Ver lista completa en `shared/theme/README.md`

---

## 🛒 Integración en POS

### Paso 1: Importar CSS

Editar `04_POS_TERMINAL/src/main.tsx`:

```tsx
import '../shared/theme/tokens.css';
```

### Paso 2: Tailwind Config

Editar `04_POS_TERMINAL/tailwind.config.js`:

```js
const sharedThemeConfig = require('../shared/theme/tailwind.config.js');

module.exports = {
  ...sharedThemeConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
};
```

### Paso 3: ThemeProvider

Editar `04_POS_TERMINAL/src/App.tsx`:

```tsx
import { ThemeProvider } from '../shared/theme';
import { API_URL } from './lib/config';

function App() {
  return (
    <ThemeProvider module="pos" apiUrl={API_URL}>
      {/* App POS */}
    </ThemeProvider>
  );
}
```

### Paso 4: Actualizar componentes

**Ejemplo: Botones de productos**

Antes:
```tsx
<button className="bg-green-600 text-white rounded-lg p-4">
  Producto
</button>
```

Después:
```tsx
<button className="bg-primary text-primary-foreground rounded-lg p-4 hover:bg-primary-hover active:bg-primary-active">
  Producto
</button>
```

---

## 🍳 Integración en KDS

### Paso 1: Importar CSS

Editar `05_KDS_SYSTEM/src/main.tsx`:

```tsx
import '../shared/theme/tokens.css';
```

### Paso 2: Tailwind Config

Editar `05_KDS_SYSTEM/tailwind.config.js`:

```js
const sharedThemeConfig = require('../shared/theme/tailwind.config.js');

module.exports = {
  ...sharedThemeConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
};
```

### Paso 3: ThemeProvider

Editar `05_KDS_SYSTEM/src/AppNew.tsx`:

```tsx
import { ThemeProvider } from '../shared/theme';
import { API_URL } from './lib/config';

function AppNew() {
  return (
    <ThemeProvider module="kds" apiUrl={API_URL}>
      {/* App KDS */}
    </ThemeProvider>
  );
}
```

### Paso 4: Actualizar componentes

**Ejemplo: Cards de órdenes**

Antes:
```tsx
<div className="bg-orange-100 border-orange-500">
  <h3 className="text-orange-900">Orden #123</h3>
</div>
```

Después:
```tsx
<div className="bg-card border-border">
  <h3 className="text-card-foreground">Orden #123</h3>
</div>
```

---

## ✅ Verificación

### 1. Verificar que los tokens se carguen

Abrir DevTools → Elements → Inspeccionar `<html>`:

```html
<html data-theme="light" data-module="admin">
```

Debería tener los atributos `data-theme` y `data-module`.

### 2. Verificar CSS Variables

En DevTools → Elements → Computed:

Buscar variables como:
- `--background`
- `--foreground`
- `--primary`

Deberían tener valores HSL como `221.2 83.2% 53.3%`.

### 3. Verificar Socket.IO

DevTools → Network → WS:

Debería haber una conexión WebSocket activa.

### 4. Probar cambio de tema

1. Ir a Admin Panel → Apariencias
2. Cambiar modo oscuro/claro
3. Verificar que se aplique instantáneamente
4. Abrir POS/KDS en otra pestaña
5. Cambiar tema global
6. Verificar que POS/KDS se actualicen

---

## 🐛 Troubleshooting

### Problema: Los tokens no se aplican

**Solución:**
1. Verificar que `tokens.css` esté importado en `main.tsx`
2. Verificar que Tailwind config use `sharedThemeConfig`
3. Limpiar caché: `npm run build` o `pnpm build`

### Problema: Errores de TypeScript

**Solución:**
```bash
# Instalar dependencias de shared
cd YCC_POS_IMPLEMENTATION/shared/theme
npm install socket.io-client
```

### Problema: Sincronización no funciona

**Solución:**
1. Verificar que `apiUrl` esté configurado en ThemeProvider
2. Verificar conexión Socket.IO en DevTools → Network → WS
3. Verificar que backend esté corriendo
4. Verificar logs en consola: buscar `🎨 [Theme]`

### Problema: Colores hardcodeados persisten

**Solución:**

Buscar y reemplazar:
```bash
# Buscar colores hardcodeados
grep -r "bg-gray-" src/
grep -r "text-blue-" src/
grep -r "border-red-" src/

# Reemplazar con tokens semánticos
bg-gray-900 → bg-background
text-blue-600 → text-primary
border-red-500 → border-destructive
```

---

## 📚 Recursos Adicionales

- **Documentación completa:** `shared/theme/README.md`
- **Ejemplos de componentes:** Ver `AppearancePage.tsx`
- **Lista de tokens:** Ver `shared/theme/tokens.css`
- **API Reference:** Ver `shared/theme/types.ts`

---

## 🚀 Próximos Pasos

1. ✅ Integrar en Admin Panel
2. ✅ Integrar en POS
3. ✅ Integrar en KDS
4. ⏳ Refactorizar componentes principales
5. ⏳ Crear presets de temas
6. ⏳ Agregar modo automático (sistema/hora)

---

## 💡 Tips

### Migración Gradual

No es necesario migrar todos los componentes de una vez:

1. **Fase 1:** Integrar ThemeProvider (sin cambios visuales)
2. **Fase 2:** Migrar componentes principales (Sidebar, Navbar)
3. **Fase 3:** Migrar componentes secundarios (Cards, Buttons)
4. **Fase 4:** Migrar componentes específicos (Forms, Tables)

### Convenciones de Nombres

- Usar tokens semánticos, no colores específicos
- `bg-primary` en lugar de `bg-blue-600`
- `text-foreground` en lugar de `text-gray-900`
- `border-border` en lugar de `border-gray-300`

### Testing

Probar en ambos modos:
```tsx
// En desarrollo, agregar botón de debug
<button onClick={() => toggleThemeMode('admin')}>
  Toggle Theme
</button>
```

---

**¿Dudas?** Consultar `shared/theme/README.md` o revisar la implementación en `AppearancePage.tsx`.
