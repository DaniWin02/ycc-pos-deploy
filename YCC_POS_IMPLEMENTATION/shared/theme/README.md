# 🎨 Sistema de Temas YCC POS v2.0

Sistema centralizado de personalización visual para Admin Panel, POS y KDS.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Uso Básico](#uso-básico)
- [Tokens Semánticos](#tokens-semánticos)
- [API Reference](#api-reference)
- [Ejemplos](#ejemplos)
- [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura

### Componentes Principales

```
shared/theme/
├── tokens.css          # Tokens semánticos CSS (light/dark)
├── types.ts            # Tipos TypeScript
├── utils.ts            # Utilidades (contraste, persistencia)
├── ThemeProvider.tsx   # Provider React con Context API
├── tailwind.config.js  # Configuración Tailwind
└── README.md           # Esta documentación
```

### Flujo de Datos

```
Usuario cambia tema en Admin Panel
         ↓
ThemeProvider actualiza estado local
         ↓
├─→ Guarda en localStorage (persistencia local)
├─→ Guarda en backend (persistencia global)
├─→ Aplica CSS variables al DOM
└─→ Emite evento Socket.IO
         ↓
Otros clientes (POS/KDS) reciben evento
         ↓
Actualizan su tema automáticamente
```

---

## 📦 Instalación

### 1. Importar CSS de tokens

En el archivo principal de tu aplicación (`main.tsx` o `App.tsx`):

```tsx
import '../shared/theme/tokens.css';
```

### 2. Configurar Tailwind

Actualiza tu `tailwind.config.js`:

```js
const sharedConfig = require('../shared/theme/tailwind.config.js');

module.exports = {
  ...sharedConfig,
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
};
```

### 3. Envolver app con ThemeProvider

```tsx
import { ThemeProvider } from '../shared/theme';
import { API_URL } from './lib/config';

function App() {
  return (
    <ThemeProvider module="admin" apiUrl={API_URL}>
      {/* Tu aplicación */}
    </ThemeProvider>
  );
}
```

**Módulos disponibles:**
- `"admin"` - Admin Panel
- `"pos"` - POS Terminal
- `"kds"` - Kitchen Display System
- `"global"` - Configuración global

---

## 🎯 Uso Básico

### Hook `useTheme`

```tsx
import { useTheme } from '../shared/theme';

function MyComponent() {
  const {
    currentModule,
    config,
    setThemeMode,
    toggleThemeMode,
    getCurrentMode,
    isUsingGlobal,
  } = useTheme();

  return (
    <div>
      <p>Modo actual: {getCurrentMode(currentModule)}</p>
      
      <button onClick={() => toggleThemeMode(currentModule)}>
        Cambiar tema
      </button>
      
      <button onClick={() => setThemeMode('admin', 'dark')}>
        Modo oscuro
      </button>
    </div>
  );
}
```

### Cambiar tema de un módulo

```tsx
// Cambiar a modo oscuro
setThemeMode('kds', 'dark');

// Cambiar a modo claro
setThemeMode('pos', 'light');

// Toggle (alternar)
toggleThemeMode('admin');
```

### Usar tema global

```tsx
// Hacer que POS use el tema global
setUseGlobal('pos', true);

// Usar tema personalizado
setUseGlobal('pos', false);
```

### Colores personalizados

```tsx
updateCustomColors('kds', {
  primary: '38 92% 50%',      // Naranja
  background: '24 9.8% 10%',  // Fondo oscuro cálido
});
```

### Resetear configuración

```tsx
// Resetear un módulo
resetModule('admin');

// Resetear todo el sistema
resetAll();
```

---

## 🎨 Tokens Semánticos

### Superficies

| Token | Uso | Ejemplo |
|-------|-----|---------|
| `--background` | Fondo principal | `bg-background` |
| `--foreground` | Texto principal | `text-foreground` |
| `--card` | Fondo de cards | `bg-card` |
| `--card-foreground` | Texto en cards | `text-card-foreground` |

### Colores Primarios

| Token | Uso | Ejemplo |
|-------|-----|---------|
| `--primary` | Color principal | `bg-primary` |
| `--primary-foreground` | Texto sobre primary | `text-primary-foreground` |
| `--primary-hover` | Hover de botones | `hover:bg-primary-hover` |

### Estados

| Token | Uso | Ejemplo |
|-------|-----|---------|
| `--success` | Éxito | `bg-success` |
| `--warning` | Advertencia | `bg-warning` |
| `--danger` | Error/peligro | `bg-danger` |
| `--info` | Información | `bg-info` |

### Componentes UI

| Token | Uso | Ejemplo |
|-------|-----|---------|
| `--border` | Bordes | `border-border` |
| `--input` | Inputs | `border-input` |
| `--muted` | Elementos secundarios | `bg-muted` |
| `--accent` | Acentos | `bg-accent` |

### Sidebar y Navbar

| Token | Uso | Ejemplo |
|-------|-----|---------|
| `--sidebar` | Fondo sidebar | `bg-sidebar` |
| `--sidebar-active` | Item activo | `bg-sidebar-active` |
| `--navbar` | Fondo navbar | `bg-navbar` |

---

## 📚 API Reference

### ThemeProvider Props

```tsx
interface ThemeProviderProps {
  children: ReactNode;
  module: 'admin' | 'pos' | 'kds' | 'global';
  apiUrl?: string; // URL del backend para sincronización
}
```

### useTheme() Return

```tsx
interface ThemeContextValue {
  // Estado
  currentModule: ThemeModule;
  config: ThemeSystemConfig;
  
  // Acciones
  setThemeMode: (module: ThemeModule, mode: 'light' | 'dark') => void;
  toggleThemeMode: (module: ThemeModule) => void;
  setUseGlobal: (module: ThemeModule, useGlobal: boolean) => void;
  updateCustomColors: (module: ThemeModule, colors: Partial<ThemeTokens>) => void;
  resetModule: (module: ThemeModule) => void;
  resetAll: () => void;
  
  // Utilidades
  getCurrentMode: (module: ThemeModule) => 'light' | 'dark';
  isUsingGlobal: (module: ThemeModule) => boolean;
}
```

---

## 💡 Ejemplos

### Ejemplo 1: Botón que cambia de tema

```tsx
import { useTheme } from '../shared/theme';
import { Moon, Sun } from 'lucide-react';

function ThemeToggle() {
  const { currentModule, getCurrentMode, toggleThemeMode } = useTheme();
  const mode = getCurrentMode(currentModule);

  return (
    <button
      onClick={() => toggleThemeMode(currentModule)}
      className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
    >
      {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
}
```

### Ejemplo 2: Selector de módulo

```tsx
function ModuleSelector() {
  const { currentModule, config, setThemeMode } = useTheme();
  const modules = ['global', 'admin', 'pos', 'kds'] as const;

  return (
    <div className="space-y-2">
      {modules.map(module => (
        <div key={module} className="flex items-center justify-between p-3 bg-card rounded-lg">
          <span className="font-medium">{module.toUpperCase()}</span>
          
          <div className="flex gap-2">
            <button
              onClick={() => setThemeMode(module, 'light')}
              className={`px-3 py-1 rounded ${
                config[module].mode === 'light'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              Claro
            </button>
            
            <button
              onClick={() => setThemeMode(module, 'dark')}
              className={`px-3 py-1 rounded ${
                config[module].mode === 'dark'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              }`}
            >
              Oscuro
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Ejemplo 3: Color Picker personalizado

```tsx
function ColorPicker({ token }: { token: keyof ThemeTokens }) {
  const { currentModule, updateCustomColors } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const hsl = hexToHSL(hex); // Convertir HEX a HSL
    
    updateCustomColors(currentModule, {
      [token]: hsl
    });
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium">{token}</label>
      <input
        type="color"
        onChange={handleChange}
        className="w-10 h-10 rounded cursor-pointer"
      />
    </div>
  );
}
```

---

## 🐛 Troubleshooting

### Los cambios no se aplican

1. **Verificar que ThemeProvider esté envolviendo la app**
   ```tsx
   <ThemeProvider module="admin" apiUrl={API_URL}>
     <App />
   </ThemeProvider>
   ```

2. **Verificar que tokens.css esté importado**
   ```tsx
   import '../shared/theme/tokens.css';
   ```

3. **Verificar que Tailwind esté configurado correctamente**
   ```js
   // tailwind.config.js
   const sharedConfig = require('../shared/theme/tailwind.config.js');
   module.exports = { ...sharedConfig };
   ```

### Los temas no se sincronizan entre apps

1. **Verificar conexión Socket.IO**
   - Abrir DevTools → Network → WS
   - Debe haber conexión activa a Socket.IO

2. **Verificar que apiUrl esté configurado**
   ```tsx
   <ThemeProvider module="admin" apiUrl="https://api.example.com">
   ```

3. **Verificar eventos en consola**
   - Buscar logs: `🎨 [Theme]`

### Contraste bajo en textos

Usar las utilidades de validación:

```tsx
import { calculateContrast, meetsWCAG_AA } from '../shared/theme';

const contrast = calculateContrast(
  '221.2 83.2% 53.3%', // primary
  '210 40% 98%'        // primary-foreground
);

if (!meetsWCAG_AA(contrast)) {
  console.warn('⚠️ Contraste insuficiente');
}
```

---

## 🚀 Próximos Pasos

1. **Crear presets de temas**
   - Temas predefinidos (Corporate, Dark Blue, High Contrast, etc.)

2. **Exportar/Importar configuraciones**
   - Guardar temas como JSON
   - Compartir entre instalaciones

3. **Preview en tiempo real**
   - Vista previa de componentes con el tema aplicado

4. **Modo automático**
   - Detectar preferencia del sistema operativo
   - Cambiar automáticamente según hora del día

---

## 📄 Licencia

Parte del sistema YCC POS - Uso interno

## 👥 Soporte

Para dudas o problemas, contactar al equipo de desarrollo.
