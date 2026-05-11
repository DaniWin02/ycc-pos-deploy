import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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
  X
} from 'lucide-react';
import { useThemeStore } from '../stores/theme.store';
import { useThemeApplication } from '../hooks/useThemeApplication';
import { ThemeModule, defaultSemanticLight, defaultSemanticDark } from '../types/theme.types';

// ===================== COMPONENTS =====================

const ColorPicker = ({ label, value, onChange }: { label: string; value: string; onChange: (val: string) => void }) => (
  <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 font-mono uppercase">{value}</span>
      <input 
        type="color" 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer rounded border-0 p-0 overflow-hidden" 
      />
    </div>
  </div>
);

const Section = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: any }) => (
  <div className="mb-8 last:mb-0">
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-5 h-5 text-indigo-600" />}
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

// ===================== PAGE =====================

export function AppearancePage() {
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
    updateGlobalUi
  } = useThemeStore();

  // Apply theme for real-time preview
  useThemeApplication(activeModule);

  const [activeCategory, setActiveCategory] = useState<'colors' | 'typography' | 'branding' | 'global'>('colors');
  const [showPreview, setShowPreview] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const notify = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Get current module configuration (effective, including inheritance)
  const currentModuleConfig = useMemo(() => getEffectiveConfig(activeModule), [config, activeModule, getEffectiveConfig]);

  // Note: Theme is now applied globally via useThemeApplication hook in App.tsx
  // This ensures all pages receive theme updates, not just the appearance page

  const toggleDarkMode = () => {
    const isDark = !currentModuleConfig.isDark;
    updateModuleConfig(activeModule, { 
      isDark,
      colors: isDark ? defaultSemanticDark : defaultSemanticLight
    });
    notify(`Modo ${isDark ? 'oscuro' : 'claro'} activado para ${activeModule.toUpperCase()}`);
  };

  const handleExport = () => {
    const themeJson = exportTheme();
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ycc-theme-modular-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Tema exportado correctamente');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const themeJson = e.target?.result as string;
      if (importTheme(themeJson)) {
        notify('Tema importado correctamente');
      } else {
        notify('Error al importar tema');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 overflow-hidden">
      {showToast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-4 right-4 z-50 bg-indigo-600 text-white px-6 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-3">
          <Check className="w-5 h-5" /> {toastMessage}
        </motion.div>
      )}

      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personalización Visual</h1>
          <p className="text-sm text-gray-500">Arquitectura de temas independiente por módulo</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" /> Importar
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={() => setShowPreview(!showPreview)} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${showPreview ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-700 border'}`}>
            <Eye className="w-4 h-4" /> {showPreview ? 'Ocultar Vista' : 'Mostrar Vista'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-96 bg-white border-r overflow-y-auto flex flex-col shadow-inner">
          <div className="p-4 border-b bg-gray-50/50">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Contexto de Edición</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setActiveModule('global')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${activeModule === 'global' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                <Maximize2 className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">GLOBAL</span>
              </button>
              <button onClick={() => setActiveModule('admin')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${activeModule === 'admin' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                <Settings className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">ADMIN</span>
              </button>
              <button onClick={() => setActiveModule('pos')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${activeModule === 'pos' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                <Smartphone className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">POS</span>
              </button>
              <button onClick={() => setActiveModule('kds')} className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${activeModule === 'kds' ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm' : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'}`}>
                <Utensils className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">KDS</span>
              </button>
            </div>
          </div>

          <div className="flex border-b sticky top-0 bg-white z-10 shadow-sm">
            <button onClick={() => setActiveCategory('colors')} className={`flex-1 py-3 text-xs font-bold transition-all ${activeCategory === 'colors' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>COLORES</button>
            <button onClick={() => setActiveCategory('typography')} className={`flex-1 py-3 text-xs font-bold transition-all ${activeCategory === 'typography' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>TEXTO</button>
            <button onClick={() => setActiveCategory('branding')} className={`flex-1 py-3 text-xs font-bold transition-all ${activeCategory === 'branding' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>MARCA</button>
            <button onClick={() => setActiveCategory('global')} className={`flex-1 py-3 text-xs font-bold transition-all ${activeCategory === 'global' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>UX</button>
          </div>

          <div className="p-6">
            {activeCategory === 'colors' && (
              <Section title="Esquema Semántico" icon={Palette}>
                <button onClick={toggleDarkMode} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 mb-6 group hover:border-indigo-300 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${currentModuleConfig.isDark ? 'bg-indigo-600 text-white' : 'bg-amber-100 text-amber-600'}`}>
                      {currentModuleConfig.isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-gray-900">Modo {currentModuleConfig.isDark ? 'Oscuro' : 'Claro'}</p>
                      <p className="text-[10px] text-gray-500 uppercase font-medium">Click para alternar</p>
                    </div>
                  </div>
                  <RefreshCcw className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform duration-500" />
                </button>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Primarios</label>
                    <ColorPicker label="Acción Principal" value={currentModuleConfig.colors.primary || '#059669'} onChange={(val) => updateModuleConfig(activeModule, { colors: { primary: val, ring: val } })} />
                    <ColorPicker label="Texto sobre Primario" value={currentModuleConfig.colors.primaryForeground || '#ffffff'} onChange={(val) => updateModuleConfig(activeModule, { colors: { primaryForeground: val } })} />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fondo y Texto</label>
                    <ColorPicker label="Fondo Base" value={currentModuleConfig.colors.background || '#ffffff'} onChange={(val) => updateModuleConfig(activeModule, { colors: { background: val } })} />
                    <ColorPicker label="Texto Base" value={currentModuleConfig.colors.foreground || '#0f172a'} onChange={(val) => updateModuleConfig(activeModule, { colors: { foreground: val } })} />
                    <ColorPicker label="Tarjetas" value={currentModuleConfig.colors.card || '#ffffff'} onChange={(val) => updateModuleConfig(activeModule, { colors: { card: val, popover: val } })} />
                    <ColorPicker label="Bordes" value={currentModuleConfig.colors.border || '#e2e8f0'} onChange={(val) => updateModuleConfig(activeModule, { colors: { border: val, input: val } })} />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estados Críticos</label>
                    <ColorPicker label="Destructivo" value={currentModuleConfig.colors.destructive || '#ef4444'} onChange={(val) => updateModuleConfig(activeModule, { colors: { destructive: val } })} />
                    <ColorPicker label="Muteado" value={currentModuleConfig.colors.muted || '#f1f5f9'} onChange={(val) => updateModuleConfig(activeModule, { colors: { muted: val, accent: val } })} />
                  </div>
                </div>
              </Section>
            )}

            {activeCategory === 'typography' && (
              <Section title="Tipografía" icon={Type}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Familia Tipográfica</label>
                    <select value={currentModuleConfig.typography.fontFamily} onChange={(e) => updateModuleConfig(activeModule, { typography: { fontFamily: e.target.value } })} className="w-full h-12 px-4 bg-white border-2 border-gray-100 rounded-xl text-sm font-medium focus:border-indigo-500 outline-none transition-all">
                      <option value="Inter, system-ui, sans-serif">Inter (Moderna)</option>
                      <option value="system-ui, sans-serif">Sistema (Nativa)</option>
                      <option value="'Roboto', sans-serif">Roboto (Google)</option>
                      <option value="'JetBrains Mono', monospace">JetBrains (Mono)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Tamaño de Texto Base</label>
                    <input type="text" value={currentModuleConfig.typography.fontSizeBase} onChange={(e) => updateModuleConfig(activeModule, { typography: { fontSizeBase: e.target.value } })} className="w-full h-12 px-4 border-2 border-gray-100 rounded-xl text-sm" placeholder="16px" />
                  </div>
                </div>
              </Section>
            )}

            {activeCategory === 'branding' && (
              <Section title="Branding" icon={Building2}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Nombre del Club/Empresa</label>
                    <input type="text" value={config.branding.companyName} onChange={(e) => updateBranding({ companyName: e.target.value })} className="w-full h-12 px-4 border-2 border-gray-100 rounded-xl text-sm font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">URL del Logo</label>
                    <div className="flex gap-2">
                      <input type="text" value={config.branding.logoUrl} onChange={(e) => updateBranding({ logoUrl: e.target.value })} className="flex-1 h-12 px-4 border-2 border-gray-100 rounded-xl text-sm" placeholder="https://..." />
                      <button className="h-12 w-12 flex items-center justify-center bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"><Image className="w-5 h-5 text-gray-400" /></button>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {activeCategory === 'global' && (
              <Section title="Experiencia Global" icon={Maximize2}>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-bold text-gray-700">Densidad de Interfaz</label>
                    <select value={globalUi.density} onChange={(e) => updateGlobalUi({ density: e.target.value as any })} className="w-full h-12 px-4 border-2 border-gray-100 rounded-xl text-sm focus:border-indigo-500 outline-none">
                      <option value="compact">Compacta (Más Datos)</option>
                      <option value="comfortable">Cómoda (Estándar)</option>
                      <option value="spacious">Espaciada (Táctil)</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-gray-700">Escala UI</label>
                      <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{globalUi.uiScale}%</span>
                    </div>
                    <input type="range" min={90} max={125} step={5} value={globalUi.uiScale} onChange={(e) => updateGlobalUi({ uiScale: Number(e.target.value) as any })} className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                  </div>
                </div>
              </Section>
            )}

            <div className="mt-12 pt-8 border-t flex flex-col gap-3">
              <button onClick={() => { if(confirm(`¿Restablecer el módulo ${activeModule.toUpperCase()} a los valores predeterminados?`)) resetModule(activeModule); }} className="w-full flex items-center justify-center gap-2 px-6 py-4 text-sm font-black text-red-600 bg-red-50 rounded-2xl hover:bg-red-100 transition-all active:scale-95 shadow-sm">
                <RotateCcw className="w-5 h-5" /> RESTABLECER {activeModule.toUpperCase()}
              </button>
            </div>
          </div>
        </aside>

        <main className={`flex-1 p-8 bg-gray-100 overflow-y-auto transition-all duration-500 ${showPreview ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center">
                  {activeModule === 'pos' ? <Smartphone className="w-6 h-6 text-indigo-600" /> : activeModule === 'kds' ? <Utensils className="w-6 h-6 text-indigo-600" /> : <Monitor className="w-6 h-6 text-indigo-600" />}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Previsualización</h2>
                  <p className="text-xs font-bold text-gray-400 tracking-widest">{activeModule.toUpperCase()} ISOLATED CONTEXT</p>
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-base)] shadow-2xl overflow-hidden border transition-all duration-300 transform perspective-1000" style={{ 
              backgroundColor: 'var(--background)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)',
              fontFamily: 'var(--font-family)',
              fontSize: 'var(--font-size-base)',
              borderRadius: 'var(--radius-base)'
            }}>
              <div className="h-16 border-b flex items-center px-6 gap-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-base font-black tracking-tight">{config.branding.companyName}</div>
                <div className="ml-auto flex gap-3">
                  <div className="px-4 py-2 rounded-lg font-bold text-xs" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    Turno: Abierto
                  </div>
                  <div className="w-10 h-10 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                </div>
              </div>

              <div className="p-10 space-y-10">
                <div className="space-y-3">
                  <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>Panel de Control</h1>
                  <p className="text-lg font-medium opacity-70" style={{ color: 'var(--muted-foreground)' }}>Personalización de {activeModule} con tokens semánticos.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <button className="px-6 py-4 font-black transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 shadow-lg" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-base)' }}>
                    PRINCIPAL
                  </button>
                  <button className="px-6 py-4 font-black border-2 transition-all hover:bg-gray-100 active:scale-95 flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--secondary)', color: 'var(--secondary-foreground)', borderColor: 'var(--border)', borderRadius: 'var(--radius-base)' }}>
                    SECUNDARIO
                  </button>
                  <button className="px-6 py-4 font-black border-2 opacity-30 cursor-not-allowed flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', borderColor: 'var(--border)', borderRadius: 'var(--radius-base)' }}>
                    BLOQUEADO
                  </button>
                  <button className="px-6 py-4 font-black transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 shadow-lg" style={{ backgroundColor: 'var(--destructive)', color: 'var(--destructive-foreground)', borderRadius: 'var(--radius-base)' }}>
                    PELIGRO
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 border-2 shadow-xl transition-all" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--card-foreground)', borderRadius: 'var(--radius-base)' }}>
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-xl font-black uppercase tracking-tight">Métricas de Venta</h3>
                      <div className="w-12 h-6 rounded-full p-1" style={{ backgroundColor: 'var(--primary)' }}>
                        <div className="w-4 h-4 bg-white rounded-full ml-auto shadow-sm" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-3 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                        <div className="h-full w-4/5" style={{ backgroundColor: 'var(--primary)' }} />
                      </div>
                      <div className="flex justify-between text-sm font-bold opacity-60">
                        <span>Progreso Diario</span>
                        <span>80%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 border-2 shadow-xl transition-all" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', borderRadius: 'var(--radius-base)' }}>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--accent)', color: 'var(--accent-foreground)' }}>
                        <Settings className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="h-4 w-32 rounded-full mb-1" style={{ backgroundColor: 'var(--foreground)' }} />
                        <div className="h-3 w-20 rounded-full opacity-40" style={{ backgroundColor: 'var(--muted-foreground)' }} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-full rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
                      <div className="h-3 w-3/4 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
                    </div>
                  </div>
                </div>

                <div className="max-w-sm space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Input de Formulario</label>
                    <input type="text" placeholder="Previsualización de input..." className="w-full h-14 px-5 border-2 outline-none transition-all focus:ring-4 font-medium" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)', borderRadius: 'var(--radius-base)', '--tw-ring-color': 'var(--primary)' } as any} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-white border-2 border-dashed border-gray-300 rounded-[var(--radius-base)] flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-black text-gray-900 tracking-tight">Accesibilidad Garantizada</h4>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  Los tokens semánticos (Foreground/Background) aseguran el contraste perfecto. Al configurar {activeModule.toUpperCase()}, el Admin Panel sigue utilizando sus propias variables aisladas.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}