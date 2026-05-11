/**
 * AppearancePage V2 - Sistema de Personalización Visual Unificado
 * 
 * Características:
 * - Preview real por módulo (Admin, POS, KDS)
 * - Herencia de tokens (Global → Módulo específico)
 * - Sincronización en tiempo real vía WebSocket
 * - Corrección automática de contraste
 * - Persistencia de configuraciones
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Check,
  Download,
  Eye,
  Image,
  Layout,
  Maximize2,
  Monitor,
  Moon,
  Palette,
  Redo,
  RefreshCcw,
  RotateCcw,
  Settings,
  Sun,
  Type,
  Upload,
  Undo,
  Utensils,
  Smartphone,
  X,
  Globe,
  Zap,
  AlertCircle,
  Info
} from 'lucide-react';
import { useThemeStore } from '../stores/theme.store';
import { 
  SemanticTokens, 
  defaultLightTokens, 
  defaultDarkTokens,
  toCssVarName 
} from '../../../shared/tokens/semanticTokens';
import { ModulePreview } from '../components/Appearance/ModulePreview';

// ============================================================================
// TIPOS
// ============================================================================

type ThemeModule = 'global' | 'admin' | 'pos' | 'kds';
type TokenCategory = 'surface' | 'action' | 'state' | 'ui' | 'border' | 'nav';

interface TokenGroup {
  category: TokenCategory;
  label: string;
  description: string;
  tokens: (keyof SemanticTokens)[];
}

// ============================================================================
// CONFIGURACIÓN DE GRUPOS DE TOKENS
// ============================================================================

const TOKEN_GROUPS: TokenGroup[] = [
  {
    category: 'surface',
    label: 'Superficies',
    description: 'Colores de fondo y superficies principales',
    tokens: ['background', 'foreground', 'card', 'cardForeground', 'popover', 'popoverForeground'],
  },
  {
    category: 'action',
    label: 'Acciones',
    description: 'Botones principales y secundarios',
    tokens: ['primary', 'primaryForeground', 'primaryHover', 'primaryActive', 'secondary', 'secondaryForeground'],
  },
  {
    category: 'state',
    label: 'Estados',
    description: 'Éxito, advertencia, peligro e información',
    tokens: ['success', 'successForeground', 'successLight', 'warning', 'warningForeground', 'warningLight', 'danger', 'dangerForeground', 'dangerLight', 'info', 'infoForeground', 'infoLight'],
  },
  {
    category: 'ui',
    label: 'Elementos UI',
    description: 'Elementos de interfaz como acentos y muted',
    tokens: ['muted', 'mutedForeground', 'accent', 'accentForeground', 'disabled', 'disabledForeground', 'placeholder'],
  },
  {
    category: 'border',
    label: 'Bordes e Inputs',
    description: 'Bordes, inputs y anillos de enfoque',
    tokens: ['border', 'borderHover', 'input', 'inputBackground', 'ring', 'ringOffset'],
  },
  {
    category: 'nav',
    label: 'Navegación',
    description: 'Colores específicos para navegación',
    tokens: ['navBackground', 'navForeground', 'navActive', 'navActiveForeground', 'navHover'],
  },
];

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const ColorPicker = ({ 
  label, 
  value, 
  onChange,
  description 
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
  description?: string;
}) => (
  <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-800/50 border rounded-lg hover:border-primary/50 transition-all group">
    <div className="flex-1 min-w-0">
      <span className="text-sm font-medium text-foreground block truncate">{label}</span>
      {description && (
        <span className="text-[10px] text-muted-foreground block truncate">{description}</span>
      )}
    </div>
    <div className="flex items-center gap-2 ml-2">
      <span className="text-xs font-mono uppercase opacity-50 hidden sm:block">{value}</span>
      <div className="relative">
        <input 
          type="color" 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border-0 p-0 overflow-hidden opacity-0 absolute inset-0" 
        />
        <div 
          className="h-8 w-8 rounded-lg border-2 border-border shadow-sm transition-transform group-hover:scale-105"
          style={{ backgroundColor: value }}
        />
      </div>
    </div>
  </div>
);

const Section = ({ 
  title, 
  children, 
  icon: Icon,
  description 
}: { 
  title: string; 
  children: React.ReactNode; 
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}) => (
  <div className="mb-8 last:mb-0">
    <div className="flex items-start gap-3 mb-4">
      {Icon && (
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div>
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

const ModuleSelector = ({
  activeModule,
  onChange
}: {
  activeModule: ThemeModule;
  onChange: (module: ThemeModule) => void;
}) => {
  const modules: { id: ThemeModule; label: string; icon: any; description: string }[] = [
    { id: 'global', label: 'Global', icon: Globe, description: 'Afecta todos los módulos' },
    { id: 'admin', label: 'Admin', icon: Settings, description: 'Panel administrativo' },
    { id: 'pos', label: 'POS', icon: Smartphone, description: 'Punto de venta' },
    { id: 'kds', label: 'KDS', icon: Utensils, description: 'Kitchen Display' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {modules.map((mod) => (
        <button
          key={mod.id}
          onClick={() => onChange(mod.id)}
          className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
            activeModule === mod.id 
              ? 'border-primary bg-primary/5 text-primary' 
              : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/50'
          }`}
        >
          <mod.icon className="w-5 h-5 mb-1.5" />
          <span className="text-[11px] font-bold uppercase">{mod.label}</span>
          <span className="text-[9px] opacity-70 mt-0.5 hidden sm:block">{mod.description}</span>
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function AppearancePageV2() {
  const {
    config,
    activeModule,
    setActiveModule,
    updateModuleConfig,
    updateBranding,
    getEffectiveConfig,
    resetModule,
    exportTheme,
    importTheme,
    globalUi,
    updateGlobalUi,
  } = useThemeStore();

  const [activeCategory, setActiveCategory] = useState<TokenCategory>('surface');
  const [showPreview, setShowPreview] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  // Obtener configuración efectiva incluyendo herencia
  const currentConfig = useMemo(() => getEffectiveConfig(activeModule), [
    config, 
    activeModule, 
    getEffectiveConfig
  ]);

  // Tokens para preview
  const previewTokens = useMemo(() => {
    const tokens: Record<string, string> = {};
    
    Object.entries(currentConfig.colors || {}).forEach(([key, value]) => {
      if (typeof value === 'string') {
        tokens[toCssVarName(key)] = value;
      }
    });
    
    return tokens;
  }, [currentConfig]);

  // Notificaciones
  const notify = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }, []);

  // Toggle dark mode con corrección de contraste
  const toggleDarkMode = useCallback(() => {
    const newIsDark = !currentConfig.isDark;
    const baseTokens = newIsDark ? defaultDarkTokens : defaultLightTokens;
    
    updateModuleConfig(activeModule, {
      isDark: newIsDark,
      colors: baseTokens,
    });
    
    setIsDirty(true);
    notify(`Modo ${newIsDark ? 'oscuro' : 'claro'} activado`);
  }, [activeModule, currentConfig.isDark, updateModuleConfig, notify]);

  // Actualizar token individual
  const handleTokenChange = useCallback((tokenKey: keyof SemanticTokens, value: string) => {
    updateModuleConfig(activeModule, {
      colors: { [tokenKey]: value },
    });
    setIsDirty(true);
  }, [activeModule, updateModuleConfig]);

  // Exportar tema
  const handleExport = useCallback(() => {
    const themeJson = exportTheme();
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ycc-theme-${activeModule}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Tema exportado correctamente');
  }, [exportTheme, activeModule, notify]);

  // Importar tema
  const handleImport = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const themeJson = e.target?.result as string;
      if (importTheme(themeJson)) {
        setIsDirty(false);
        notify('Tema importado correctamente');
      } else {
        notify('Error al importar tema');
      }
    };
    reader.readAsText(file);
  }, [importTheme, notify]);

  // Resetear módulo
  const handleReset = useCallback(() => {
    if (confirm(`¿Restablecer ${activeModule.toUpperCase()} a valores predeterminados?`)) {
      resetModule(activeModule);
      setIsDirty(false);
      notify(`${activeModule.toUpperCase()} restablecido`);
    }
  }, [activeModule, resetModule, notify]);

  // Guardar cambios (broadcast a todos los módulos)
  const handleSave = useCallback(() => {
    // Emitir evento de cambio de tema
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('ycc-theme-change', {
        detail: {
          module: activeModule,
          config: currentConfig,
          timestamp: Date.now(),
        },
      });
      window.dispatchEvent(event);
      
      // Guardar en localStorage
      localStorage.setItem(`ycc-theme-${activeModule}`, JSON.stringify(currentConfig));
    }
    
    setIsDirty(false);
    notify('Cambios guardados y sincronizados');
  }, [activeModule, currentConfig, notify]);

  // Grupo de tokens activo
  const activeGroup = TOKEN_GROUPS.find(g => g.category === activeCategory);

  return (
    <div className="flex h-full flex-col bg-background overflow-hidden">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-primary text-primary-foreground px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-3"
          >
            <Check className="w-5 h-5" /> 
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-card border-b px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Personalización Visual</h1>
          <p className="text-sm text-muted-foreground">
            Sistema de tokens semánticos con herencia global
            {isDirty && <span className="ml-2 text-warning font-medium">• Cambios sin guardar</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExport} 
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border rounded-lg hover:bg-muted transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar
          </button>
          <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border rounded-lg hover:bg-muted transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> Importar
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button 
            onClick={() => setShowPreview(!showPreview)} 
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              showPreview ? 'bg-primary text-primary-foreground shadow-lg' : 'bg-card text-foreground border'
            }`}
          >
            <Eye className="w-4 h-4" /> 
            {showPreview ? 'Ocultar Vista' : 'Mostrar Vista'}
          </button>
          {isDirty && (
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-primary-foreground bg-success rounded-lg hover:brightness-110 transition-all shadow-lg"
            >
              <Zap className="w-4 h-4" />
              Guardar
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Controls */}
        <aside className="w-96 bg-card border-r overflow-y-auto flex flex-col shrink-0">
          {/* Module Selector */}
          <div className="p-4 border-b bg-muted/30">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Contexto de Edición
            </label>
            <ModuleSelector activeModule={activeModule} onChange={setActiveModule} />
            
            {activeModule !== 'global' && (
              <div className="mt-3 p-2 rounded-lg bg-info/10 border border-info/20 flex items-start gap-2">
                <Info className="w-4 h-4 text-info shrink-0 mt-0.5" />
                <p className="text-xs text-info">
                  Editando {activeModule.toUpperCase()}. Los cambios sobrescriben la configuración global solo para este módulo.
                </p>
              </div>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex border-b sticky top-0 bg-card z-10">
            {TOKEN_GROUPS.map(group => (
              <button
                key={group.category}
                onClick={() => setActiveCategory(group.category)}
                className={`flex-1 py-3 text-xs font-bold transition-all ${
                  activeCategory === group.category 
                    ? 'text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {group.label.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Token Editor */}
          <div className="p-4 space-y-6">
            <Section 
              title={activeGroup?.label || 'Tokens'} 
              description={activeGroup?.description}
              icon={Palette}
            >
              {/* Dark Mode Toggle */}
              {activeCategory === 'surface' && (
                <button 
                  onClick={toggleDarkMode}
                  className="w-full flex items-center justify-between p-4 bg-muted rounded-xl border border-border mb-6 group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={`p-2 rounded-lg ${
                        currentConfig.isDark 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-warning/20 text-warning'
                      }`}
                    >
                      {currentConfig.isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-foreground">
                        Modo {currentConfig.isDark ? 'Oscuro' : 'Claro'}
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-medium">
                        Click para alternar
                      </p>
                    </div>
                  </div>
                  <RefreshCcw className="w-4 h-4 text-muted-foreground group-hover:rotate-180 transition-transform duration-500" />
                </button>
              )}

              {/* Color Pickers */}
              <div className="space-y-3">
                {activeGroup?.tokens.map(tokenKey => {
                  const value = currentConfig.colors?.[tokenKey] || '#000000';
                  return (
                    <ColorPicker
                      key={tokenKey}
                      label={tokenKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      value={value as string}
                      onChange={(val) => handleTokenChange(tokenKey as keyof SemanticTokens, val)}
                      description={`CSS: --${toCssVarName(tokenKey as string)}`}
                    />
                  );
                })}
              </div>
            </Section>

            {/* Typography Section */}
            {activeCategory === 'surface' && (
              <Section title="Tipografía" icon={Type}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Familia Tipográfica</label>
                    <select 
                      value={currentConfig.typography?.fontFamily || 'Inter, system-ui, sans-serif'}
                      onChange={(e) => updateModuleConfig(activeModule, {
                        typography: { fontFamily: e.target.value }
                      })}
                      className="w-full h-12 px-4 bg-background border-2 border-border rounded-xl text-sm font-medium focus:border-primary outline-none transition-all"
                    >
                      <option value="Inter, system-ui, sans-serif">Inter (Moderna)</option>
                      <option value="system-ui, sans-serif">Sistema (Nativa)</option>
                      <option value="'Roboto', sans-serif">Roboto (Google)</option>
                      <option value="'JetBrains Mono', monospace">JetBrains (Mono)</option>
                    </select>
                  </div>
                </div>
              </Section>
            )}

            {/* Global UI Settings */}
            {activeCategory === 'surface' && (
              <Section title="Experiencia Global" icon={Maximize2}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Densidad de Interfaz</label>
                    <select 
                      value={globalUi.density}
                      onChange={(e) => updateGlobalUi({ density: e.target.value as any })}
                      className="w-full h-12 px-4 bg-background border-2 border-border rounded-xl text-sm font-medium focus:border-primary outline-none transition-all"
                    >
                      <option value="compact">Compacta (Más Datos)</option>
                      <option value="comfortable">Cómoda (Estándar)</option>
                      <option value="spacious">Espaciada (Táctil)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-muted-foreground">Escala UI</label>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                        {globalUi.uiScale}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min={90} 
                      max={125} 
                      step={5} 
                      value={globalUi.uiScale}
                      onChange={(e) => updateGlobalUi({ uiScale: Number(e.target.value) as any })}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* Reset Button */}
            <div className="pt-8 border-t border-border">
              <button 
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-black text-destructive bg-destructive/10 rounded-2xl hover:bg-destructive/20 transition-all active:scale-95"
              >
                <RotateCcw className="w-5 h-5" /> 
                RESTABLECER {activeModule.toUpperCase()}
              </button>
            </div>
          </div>
        </aside>

        {/* Preview Area */}
        <main 
          className={`flex-1 p-8 bg-muted overflow-y-auto transition-all duration-500 ${
            showPreview ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center"
                  style={{ backgroundColor: currentConfig.colors?.primary, color: currentConfig.colors?.primaryForeground }}
                >
                  {activeModule === 'pos' ? <Smartphone className="w-6 h-6" /> : 
                   activeModule === 'kds' ? <Utensils className="w-6 h-6" /> : 
                   activeModule === 'global' ? <Globe className="w-6 h-6" /> :
                   <Settings className="w-6 h-6" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
                    Vista Previa
                  </h2>
                  <p className="text-xs font-bold text-muted-foreground tracking-widest">
                    {activeModule.toUpperCase()} • {currentConfig.isDark ? 'MODO OSCURO' : 'MODO CLARO'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: isDirty ? '#f59e0b' : '#10b981',
                  }}
                />
                {isDirty ? 'Cambios pendientes' : 'Sincronizado'}
              </div>
            </div>

            {/* Module Preview Component */}
            <div className="rounded-xl border-2 border-border bg-card p-6 shadow-xl">
              <ModulePreview 
                module={activeModule}
                tokens={previewTokens}
                isDark={currentConfig.isDark}
              />
            </div>

            {/* Accessibility Info */}
            <div className="mt-8 p-6 bg-card border-2 border-dashed border-border rounded-xl flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ backgroundColor: currentConfig.colors?.primary, color: currentConfig.colors?.primaryForeground }}
              >
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-foreground tracking-tight">
                  Herencia Visual Activa
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeModule === 'global' 
                    ? `Los cambios en GLOBAL afectan a todos los módulos del sistema. Los módulos específicos pueden sobrescribir tokens individuales.`
                    : `Editando ${activeModule.toUpperCase()}. Este módulo hereda de GLOBAL y aplica sus propios tokens donde están definidos.`
                  }
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
