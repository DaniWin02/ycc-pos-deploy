import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Palette, 
  Type, 
  Layout,
  Image, 
  Save, 
  RotateCcw, 
  Undo, 
  Redo, 
  Download, 
  Upload,
  Eye,
  Monitor,
  Smartphone,
  Building2,
  ShoppingCart,
  Sun,
  Moon,
  Check,
  Volume2,
  Grid3X3,
  List,
  Maximize2
} from 'lucide-react';
import { useThemeStore } from '../stores/theme.store';

// Color input component
const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (color: string) => void;
  description?: string;
}> = ({ label, value, onChange, description }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded cursor-pointer border border-gray-300 p-1"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
          placeholder="#000000"
        />
      </div>
    </div>
  );
};

// Section component
const Section: React.FC<{
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// Toast notification component
const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50"
    >
      <Check className="w-4 h-4" />
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
};

export function AppearancePage() {
  const {
    currentTheme,
    updateColors,
    updateTypography,
    updateBranding,
    toggleDarkMode,
    toggleShadows,
    undo,
    redo,
    canUndo,
    canRedo,
    resetToDefault,
    exportTheme,
    importTheme,
    isPreviewMode,
    setPreviewMode,
  } = useThemeStore();

  // Ensure branding exists with defaults
  const branding = currentTheme.branding ?? {
    logoUrl: '',
    logoWidth: 120,
    logoHeight: 40,
    faviconUrl: '',
    posIconUrl: '',
    posIconColor: '#10B981',
    useCustomPosIcon: false,
    companyName: 'Mi Negocio',
    companyTagline: '',
    showLogoInHeader: true,
    showLogoInReceipt: true,
    showLogoInLogin: true,
    iconStyle: 'outline',
    appIcon192: '',
    appIcon512: '',
  };

  const [activeTab, setActiveTab] = useState<'colors' | 'typography' | 'layout' | 'branding' | 'pos' | 'kds'>('colors');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // KDS Config State
  const [kdsConfig, setKdsConfig] = useState({
    layout: 'grid' as 'grid' | 'list' | 'compact',
    cardsPerRow: 3,
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    showImages: true,
    showTimer: true,
    showOrderNumber: true,
    showCustomerName: true,
    soundEnabled: true,
    soundType: 'bell',
    soundVolume: 80,
    desktopNotifications: true,
    flashOnNewOrder: true,
    priorityEnabled: true,
    warningTime: 300,
    dangerTime: 600,
    autoArchiveTime: 30,
    stationColors: {
      cocina: '#EF4444',
      bar: '#3B82F6',
      parrilla: '#F59E0B',
      ensaladas: '#10B981',
      pasteleria: '#8B5CF6',
    },
  });

  // POS Config State
  const [posConfig, setPosConfig] = useState({
    layout: 'grid' as 'grid' | 'list',
    productsPerRow: 4,
    showProductImages: true,
    showProductPrices: true,
    showProductStock: true,
    showCategories: true,
    cartPosition: 'right' as 'right' | 'bottom' | 'overlay',
    showQuickPayment: true,
    showDiscountButton: true,
    showSplitPayment: true,
    enableBarcodeScanner: true,
    autoPrintReceipt: false,
    receiptPrinterEnabled: true,
    ticketPrinterEnabled: false,
    enableComandas: true,
    defaultPOSMode: 'COUNTER' as 'COUNTER' | 'TABLE' | 'DELIVERY',
    enableCashDrawer: true,
    enableTips: true,
    tipPresets: [10, 15, 20],
    enableLoyalty: false,
  });

  // Load configs from localStorage
  useEffect(() => {
    const savedKds = localStorage.getItem('kds-config');
    if (savedKds) {
      try {
        const parsed = JSON.parse(savedKds);
        setKdsConfig(prev => ({ ...prev, ...parsed }));
      } catch {
        console.error('Failed to load KDS config');
      }
    }

    const savedPos = localStorage.getItem('pos-config');
    if (savedPos) {
      try {
        const parsed = JSON.parse(savedPos);
        setPosConfig(prev => ({ ...prev, ...parsed }));
      } catch {
        console.error('Failed to load POS config');
      }
    }
  }, []);

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const updateKdsConfig = (updates: Partial<typeof kdsConfig>) => {
    setKdsConfig(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('kds-config', JSON.stringify(updated));
      localStorage.setItem('kds-config-updated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('kds-config-change', { detail: updated }));
      return updated;
    });
    showNotification('Configuración KDS guardada');
  };

  const updatePosConfig = (updates: Partial<typeof posConfig>) => {
    setPosConfig(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('pos-config', JSON.stringify(updated));
      localStorage.setItem('pos-config-updated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('pos-config-change', { detail: updated }));
      return updated;
    });
    showNotification('Configuración POS guardada');
  };

  const handleExport = () => {
    const themeJson = exportTheme();
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Tema exportado');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeJson = e.target?.result as string;
        importTheme(themeJson);
        showNotification('Tema importado exitosamente');
      } catch (error) {
        alert('Error al importar el tema. Verifica que el archivo sea válido.');
      }
    };
    reader.readAsText(file);
  };

  const tabs = [
    { id: 'colors', label: 'Colores', icon: Palette },
    { id: 'typography', label: 'Tipografía', icon: Type },
    { id: 'layout', label: 'Diseño', icon: Layout },
    { id: 'branding', label: 'Marca', icon: Image },
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'kds', label: 'KDS', icon: Monitor },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apariencia</h1>
            <p className="text-sm text-gray-500 mt-1">
              Personaliza los colores, tipografía y diseño de tu sistema
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-2 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Deshacer"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-2 rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Rehacer"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            {/* Preview Mode Toggle */}
            <button
              onClick={() => setPreviewMode(!isPreviewMode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isPreviewMode
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isPreviewMode ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="text-sm">{isPreviewMode ? 'Vista Previa ON' : 'Vista Previa'}</span>
            </button>

            {/* Export/Import */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Exportar</span>
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Importar</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {/* Reset */}
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Restablecer</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* COLORS TAB */}
            {activeTab === 'colors' && (
              <>
                <Section title="Colores de Marca" icon={<Palette className="w-5 h-5 text-blue-600" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Color Primario"
                      value={currentTheme.colors.primary}
                      onChange={(color) => updateColors({ primary: color })}
                      description="Usado en botones principales y elementos de marca"
                    />
                    <ColorPicker
                      label="Color Secundario"
                      value={currentTheme.colors.secondary}
                      onChange={(color) => updateColors({ secondary: color })}
                      description="Usado en elementos secundarios y acentos"
                    />
                    <ColorPicker
                      label="Color Primario Oscuro"
                      value={currentTheme.colors.primaryDark}
                      onChange={(color) => updateColors({ primaryDark: color })}
                      description="Variante oscura para estados hover"
                    />
                    <ColorPicker
                      label="Color Primario Claro"
                      value={currentTheme.colors.primaryLight}
                      onChange={(color) => updateColors({ primaryLight: color })}
                      description="Variante clara para fondos y estados suaves"
                    />
                  </div>
                </Section>

                <Section title="Colores de Estado" icon={<Check className="w-5 h-5 text-green-600" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Éxito"
                      value={currentTheme.colors.success}
                      onChange={(color) => updateColors({ success: color })}
                    />
                    <ColorPicker
                      label="Error"
                      value={currentTheme.colors.error}
                      onChange={(color) => updateColors({ error: color })}
                    />
                    <ColorPicker
                      label="Advertencia"
                      value={currentTheme.colors.warning}
                      onChange={(color) => updateColors({ warning: color })}
                    />
                    <ColorPicker
                      label="Información"
                      value={currentTheme.colors.info}
                      onChange={(color) => updateColors({ info: color })}
                    />
                  </div>
                </Section>

                <Section title="Fondos y Texto" icon={<Layout className="w-5 h-5 text-gray-600" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Fondo Principal"
                      value={currentTheme.colors.background}
                      onChange={(color) => updateColors({ background: color })}
                    />
                    <ColorPicker
                      label="Superficie/Tarjetas"
                      value={currentTheme.colors.surface}
                      onChange={(color) => updateColors({ surface: color })}
                    />
                    <ColorPicker
                      label="Texto Principal"
                      value={currentTheme.colors.textPrimary}
                      onChange={(color) => updateColors({ textPrimary: color })}
                    />
                    <ColorPicker
                      label="Texto Secundario"
                      value={currentTheme.colors.textSecondary}
                      onChange={(color) => updateColors({ textSecondary: color })}
                    />
                  </div>
                </Section>

                <Section title="Colores del POS" icon={<Monitor className="w-5 h-5 text-purple-600" />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorPicker
                      label="Encabezado POS"
                      value={currentTheme.colors.posHeader || currentTheme.colors.primary}
                      onChange={(color) => updateColors({ posHeader: color })}
                    />
                    <ColorPicker
                      label="Tarjeta de Producto"
                      value={currentTheme.colors.posProductCard || currentTheme.colors.surface}
                      onChange={(color) => updateColors({ posProductCard: color })}
                    />
                    <ColorPicker
                      label="Fondo del Carrito"
                      value={currentTheme.colors.posCartBackground || currentTheme.colors.surface}
                      onChange={(color) => updateColors({ posCartBackground: color })}
                    />
                    <ColorPicker
                      label="Botón Primario POS"
                      value={currentTheme.colors.posButtonPrimary || currentTheme.colors.primary}
                      onChange={(color) => updateColors({ posButtonPrimary: color })}
                    />
                  </div>
                </Section>

                {/* Live Preview */}
                <Section title="Vista Previa en Vivo" icon={<Eye className="w-5 h-5 text-indigo-600" />}>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-3">Botones</p>
                      <div className="flex flex-wrap gap-2">
                        <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: currentTheme.colors.primary }}>Primario</button>
                        <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: currentTheme.colors.secondary }}>Secundario</button>
                        <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: currentTheme.colors.success }}>Éxito</button>
                        <button className="px-4 py-2 rounded text-white text-sm" style={{ backgroundColor: currentTheme.colors.error }}>Error</button>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-3">Tarjetas</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded border" style={{ backgroundColor: currentTheme.colors.surface, borderColor: currentTheme.colors.border }}>
                          <p className="text-sm font-medium" style={{ color: currentTheme.colors.textPrimary }}>Tarjeta</p>
                          <p className="text-xs" style={{ color: currentTheme.colors.textSecondary }}>Contenido</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Section>
              </>
            )}

            {/* TYPOGRAPHY TAB */}
            {activeTab === 'typography' && (
              <Section title="Configuración de Tipografía" icon={<Type className="w-5 h-5 text-indigo-600" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Familia de Fuente</label>
                    <select
                      value={currentTheme.typography.fontFamily}
                      onChange={(e) => updateTypography({ fontFamily: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="Inter, system-ui, sans-serif">Inter</option>
                      <option value="Roboto, system-ui, sans-serif">Roboto</option>
                      <option value="Poppins, system-ui, sans-serif">Poppins</option>
                      <option value="Open Sans, system-ui, sans-serif">Open Sans</option>
                      <option value="Montserrat, system-ui, sans-serif">Montserrat</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño Base</label>
                    <input
                      type="text"
                      value={currentTheme.typography.fontSizeBase}
                      onChange={(e) => updateTypography({ fontSizeBase: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </Section>
            )}

            {/* LAYOUT TAB */}
            {activeTab === 'layout' && (
              <Section title="Configuración de Diseño" icon={<Layout className="w-5 h-5 text-indigo-600" />}>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {currentTheme.isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Modo Oscuro</p>
                        <p className="text-sm text-gray-500">Activar tema oscuro para toda la aplicación</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleDarkMode}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        currentTheme.isDark ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          currentTheme.isDark ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        <Maximize2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Sombras</p>
                        <p className="text-sm text-gray-500">Añadir sombras a tarjetas y botones</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleShadows}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        currentTheme.shadows ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          currentTheme.shadows ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </Section>
            )}

            {/* BRANDING TAB */}
            {activeTab === 'branding' && (
              <Section title="Identidad de Marca" icon={<Image className="w-5 h-5 text-pink-600" />}>
                <div className="space-y-6">
                  {/* Logo Principal */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Image className="w-5 h-5" />
                      Logo Principal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          URL del Logo (o dejar vacío para icono por defecto)
                        </label>
                        <input
                          type="text"
                          value={branding.logoUrl}
                          onChange={(e) => updateBranding({ logoUrl: e.target.value })}
                          placeholder="https://mi-sitio.com/logo.png"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Recomendado: PNG o SVG con fondo transparente
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Ancho (px)</label>
                          <input
                            type="number"
                            value={branding.logoWidth}
                            onChange={(e) => updateBranding({ logoWidth: parseInt(e.target.value) || 120 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alto (px)</label>
                          <input
                            type="number"
                            value={branding.logoHeight}
                            onChange={(e) => updateBranding({ logoHeight: parseInt(e.target.value) || 40 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Preview Logo */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
                      <div className="flex items-center gap-4">
                        {branding.logoUrl ? (
                          <img
                            src={branding.logoUrl}
                            alt="Logo"
                            style={{ width: branding.logoWidth, height: branding.logoHeight }}
                            className="object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="flex items-center justify-center bg-gray-200 rounded" style={{ width: branding.logoWidth, height: branding.logoHeight }}>
                            <ShoppingCart className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <span className="text-gray-500 text-sm">
                          {branding.logoUrl ? 'Logo personalizado' : 'Icono por defecto'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* POS Icon */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Monitor className="w-5 h-5" />
                      Icono del POS
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Icono Personalizado del POS
                        </label>
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={branding.useCustomPosIcon}
                            onChange={(e) => updateBranding({ useCustomPosIcon: e.target.checked })}
                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700">Usar icono personalizado</span>
                        </div>
                        {branding.useCustomPosIcon && (
                          <>
                            <input
                              type="text"
                              value={branding.posIconUrl}
                              onChange={(e) => updateBranding({ posIconUrl: e.target.value })}
                              placeholder="https://mi-sitio.com/pos-icon.png"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                            />
                            <div className="mt-2 flex items-center gap-3">
                              <label className="text-sm font-medium text-gray-700">Color del icono:</label>
                              <input
                                type="color"
                                value={branding.posIconColor}
                                onChange={(e) => updateBranding({ posIconColor: e.target.value })}
                                className="w-8 h-8 rounded cursor-pointer"
                              />
                              <span className="text-xs text-gray-500 font-mono">{branding.posIconColor}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">Vista Previa:</p>
                        <div className="flex items-center gap-3">
                          {branding.useCustomPosIcon && branding.posIconUrl ? (
                            <img
                              src={branding.posIconUrl}
                              alt="POS Icon"
                              className="w-10 h-10 object-contain"
                              style={{ color: branding.posIconColor }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: branding.posIconColor }}>
                              <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <span className="text-gray-500 text-sm">
                            {branding.useCustomPosIcon ? 'Icono personalizado' : 'Icono por defecto'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de la Empresa */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Información de la Empresa
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Negocio</label>
                        <input
                          type="text"
                          value={branding.companyName}
                          onChange={(e) => updateBranding({ companyName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Eslogan / Tagline</label>
                        <input
                          type="text"
                          value={branding.companyTagline}
                          onChange={(e) => updateBranding({ companyTagline: e.target.value })}
                          placeholder="Tu eslogan aquí..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                    
                    {/* Opciones de visibilidad */}
                    <div className="mt-4 space-y-3">
                      <p className="text-sm font-medium text-gray-700">Mostrar logo en:</p>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={branding.showLogoInHeader}
                            onChange={(e) => updateBranding({ showLogoInHeader: e.target.checked })}
                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700">Encabezado</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={branding.showLogoInReceipt}
                            onChange={(e) => updateBranding({ showLogoInReceipt: e.target.checked })}
                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700">Tickets / Recibos</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={branding.showLogoInLogin}
                            onChange={(e) => updateBranding({ showLogoInLogin: e.target.checked })}
                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                          />
                          <span className="text-sm text-gray-700">Pantalla de Login</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Estilo de Iconos */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4">Estilo de Iconos</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {(['outline', 'filled', 'two-tone'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => updateBranding({ iconStyle: style })}
                          className={`p-4 rounded-lg border-2 text-center transition-all ${
                            branding.iconStyle === style
                              ? 'border-pink-500 bg-pink-50'
                              : 'border-gray-200 hover:border-pink-300'
                          }`}
                        >
                          <div className="text-2xl mb-2">
                            {style === 'outline' && '○'}
                            {style === 'filled' && '●'}
                            {style === 'two-tone' && '◐'}
                          </div>
                          <span className="text-sm font-medium capitalize">
                            {style === 'outline' && 'Contorno'}
                            {style === 'filled' && 'Relleno'}
                            {style === 'two-tone' && 'Dos Tonos'}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* App Icons (PWA) */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Iconos de App (PWA)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icono 192x192px</label>
                        <input
                          type="text"
                          value={branding.appIcon192}
                          onChange={(e) => updateBranding({ appIcon192: e.target.value })}
                          placeholder="https://.../icon-192.png"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icono 512x512px</label>
                        <input
                          type="text"
                          value={branding.appIcon512}
                          onChange={(e) => updateBranding({ appIcon512: e.target.value })}
                          placeholder="https://.../icon-512.png"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Estos iconos se usan cuando la app se instala en dispositivos móviles
                    </p>
                  </div>
                </div>
              </Section>
            )}

            {/* POS TAB */}
            {activeTab === 'pos' && (
              <Section title="Configuración POS" icon={<ShoppingCart className="w-5 h-5 text-indigo-600" />}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Layout de Productos</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updatePosConfig({ layout: 'grid' })}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                            posConfig.layout === 'grid'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Grid3X3 className="w-5 h-5" />
                          <span className="font-medium">Grilla</span>
                        </button>
                        <button
                          onClick={() => updatePosConfig({ layout: 'list' })}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-colors ${
                            posConfig.layout === 'list'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <List className="w-5 h-5" />
                          <span className="font-medium">Lista</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Productos por Fila</label>
                      <select
                        value={posConfig.productsPerRow}
                        onChange={(e) => updatePosConfig({ productsPerRow: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                        <option value={6}>6</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Opciones de Visualización</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {[
                        { key: 'showProductImages', label: 'Mostrar imágenes' },
                        { key: 'showProductPrices', label: 'Mostrar precios' },
                        { key: 'showProductStock', label: 'Mostrar stock' },
                        { key: 'showCategories', label: 'Mostrar categorías' },
                        { key: 'showQuickPayment', label: 'Pago rápido' },
                        { key: 'showDiscountButton', label: 'Botón descuento' },
                        { key: 'enableBarcodeScanner', label: 'Escáner código' },
                        { key: 'enableComandas', label: 'Habilitar comandas' },
                        { key: 'enableTips', label: 'Propinas' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={posConfig[key as keyof typeof posConfig] as boolean}
                            onChange={(e) => updatePosConfig({ [key]: e.target.checked } as any)}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Configuración de Impresoras</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Impresora de Recibos</span>
                        <input
                          type="checkbox"
                          checked={posConfig.receiptPrinterEnabled}
                          onChange={(e) => updatePosConfig({ receiptPrinterEnabled: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">Auto-imprimir Recibo</span>
                        <input
                          type="checkbox"
                          checked={posConfig.autoPrintReceipt}
                          onChange={(e) => updatePosConfig({ autoPrintReceipt: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {/* KDS TAB */}
            {activeTab === 'kds' && (
              <Section title="Configuración KDS" icon={<Monitor className="w-5 h-5 text-indigo-600" />}>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                      <select
                        value={kdsConfig.layout}
                        onChange={(e) => updateKdsConfig({ layout: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="grid">Grilla</option>
                        <option value="list">Lista</option>
                        <option value="compact">Compacto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño de Fuente</label>
                      <select
                        value={kdsConfig.fontSize}
                        onChange={(e) => updateKdsConfig({ fontSize: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="small">Pequeño</option>
                        <option value="medium">Mediano</option>
                        <option value="large">Grande</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Tiempos de Alerta (segundos)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Advertencia</label>
                        <input
                          type="number"
                          value={kdsConfig.warningTime}
                          onChange={(e) => updateKdsConfig({ warningTime: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Peligro</label>
                        <input
                          type="number"
                          value={kdsConfig.dangerTime}
                          onChange={(e) => updateKdsConfig({ dangerTime: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Auto-archivar (min)</label>
                        <input
                          type="number"
                          value={kdsConfig.autoArchiveTime}
                          onChange={(e) => updateKdsConfig({ autoArchiveTime: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Opciones de Visualización</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: 'showImages', label: 'Mostrar imágenes' },
                        { key: 'showTimer', label: 'Mostrar temporizador' },
                        { key: 'showOrderNumber', label: 'Número de orden' },
                        { key: 'showCustomerName', label: 'Nombre del cliente' },
                        { key: 'soundEnabled', label: 'Sonido habilitado' },
                        { key: 'desktopNotifications', label: 'Notificaciones escritorio' },
                        { key: 'flashOnNewOrder', label: 'Destello en nueva orden' },
                        { key: 'priorityEnabled', label: 'Prioridades habilitadas' },
                      ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={kdsConfig[key as keyof typeof kdsConfig] as boolean}
                            onChange={(e) => updateKdsConfig({ [key]: e.target.checked } as any)}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          <span className="text-sm text-gray-700">{label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Colores por Estación</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(kdsConfig.stationColors).map(([station, color]) => (
                        <div key={station} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 capitalize">{station}</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={color}
                              onChange={(e) => updateKdsConfig({
                                stationColors: { ...kdsConfig.stationColors, [station]: e.target.value }
                              })}
                              className="w-8 h-8 rounded cursor-pointer border border-gray-300"
                            />
                            <input
                              type="text"
                              value={color}
                              onChange={(e) => updateKdsConfig({
                                stationColors: { ...kdsConfig.stationColors, [station]: e.target.value }
                              })}
                              className="w-20 px-2 py-1 text-sm border rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <Section 
                title={`Vista Previa - ${tabs.find(t => t.id === activeTab)?.label}`}
                icon={<Eye className="w-5 h-5 text-indigo-600" />}
              >
                {/* Colors Preview */}
                {activeTab === 'colors' && (
                  <div className="space-y-4">
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <div className="px-3 py-2 text-sm font-medium bg-gray-50 border-b">Colores de Marca</div>
                      <div className="p-3 space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1 py-2 px-3 rounded text-white text-center text-sm" style={{ backgroundColor: currentTheme.colors.primary }}>Primario</div>
                          <div className="flex-1 py-2 px-3 rounded text-white text-center text-sm" style={{ backgroundColor: currentTheme.colors.secondary }}>Secundario</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-gray-200">
                      <div className="px-3 py-2 text-sm font-medium bg-gray-50 border-b">Estados</div>
                      <div className="p-3 space-y-2">
                        <div className="flex gap-2 text-xs">
                          <span className="px-3 py-2 rounded flex-1 text-center text-white" style={{ backgroundColor: currentTheme.colors.success }}>Éxito</span>
                          <span className="px-3 py-2 rounded flex-1 text-center text-white" style={{ backgroundColor: currentTheme.colors.error }}>Error</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Typography Preview */}
                {activeTab === 'typography' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-gray-200 p-4" style={{ fontFamily: currentTheme.typography.fontFamily }}>
                      <p className="text-xs text-gray-500 mb-1">Fuente: {currentTheme.typography.fontFamily}</p>
                      <h1 className="text-2xl font-bold mb-2" style={{ color: currentTheme.colors.textPrimary }}>Título H1</h1>
                      <h2 className="text-xl font-semibold mb-2" style={{ color: currentTheme.colors.textPrimary }}>Título H2</h2>
                      <p className="text-base mb-2" style={{ color: currentTheme.colors.textPrimary }}>Texto normal</p>
                      <p className="text-sm" style={{ color: currentTheme.colors.textSecondary }}>Texto pequeño</p>
                    </div>
                  </div>
                )}

                {/* Layout Preview */}
                {activeTab === 'layout' && (
                  <div className="space-y-4">
                    <div className={`rounded-lg overflow-hidden border border-gray-200 p-4 ${currentTheme.isDark ? 'bg-gray-900' : 'bg-white'}`}>
                      <p className={`text-xs mb-3 ${currentTheme.isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Modo: {currentTheme.isDark ? 'Oscuro' : 'Claro'}
                      </p>
                      <div className="p-2 rounded" style={{ 
                        backgroundColor: currentTheme.isDark ? '#374151' : currentTheme.colors.surface,
                        color: currentTheme.isDark ? '#F9FAFB' : currentTheme.colors.textPrimary
                      }}>
                        Tarjeta de ejemplo
                      </div>
                    </div>
                    {currentTheme.shadows && (
                      <div className="rounded-lg border border-gray-200 p-4">
                        <p className="text-xs text-gray-500 mb-3">Sombras Habilitadas</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded bg-white shadow-sm text-xs text-center">Small</div>
                          <div className="p-3 rounded bg-white shadow-md text-xs text-center">Medium</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* POS Preview */}
                {activeTab === 'pos' && (
                  <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                    <div className="px-3 py-2 text-sm font-medium text-white" style={{ backgroundColor: currentTheme.colors.posHeader || currentTheme.colors.primary }}>
                      POS - Mostrador
                    </div>
                    <div className="p-4 space-y-3" style={{ backgroundColor: currentTheme.colors.background }}>
                      {posConfig.showCategories && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {['Todos', 'Bebidas'].map((cat, i) => (
                            <span key={cat} className="px-3 py-1 rounded-full text-xs whitespace-nowrap text-white" style={{ backgroundColor: i === 0 ? currentTheme.colors.primary : currentTheme.colors.surface }}>
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="grid gap-2 grid-cols-2">
                        <div className="p-2 rounded-lg border text-center" style={{ backgroundColor: currentTheme.colors.posProductCard || currentTheme.colors.surface, borderColor: currentTheme.colors.border }}>
                          <p className="text-xs font-medium" style={{ color: currentTheme.colors.textPrimary }}>Café</p>
                          {posConfig.showProductPrices && (
                            <p className="text-xs" style={{ color: currentTheme.colors.primary }}>$45.00</p>
                          )}
                        </div>
                      </div>
                      <div className="p-2 rounded border" style={{ backgroundColor: currentTheme.colors.posCartBackground || currentTheme.colors.surface, borderColor: currentTheme.colors.border }}>
                        <p className="text-xs font-medium mb-2" style={{ color: currentTheme.colors.textPrimary }}>Carrito</p>
                        <button className="w-full py-1 px-2 rounded text-xs text-white" style={{ backgroundColor: currentTheme.colors.posButtonPrimary || currentTheme.colors.primary }}>
                          {posConfig.showQuickPayment ? 'Pago Rápido' : 'Pagar'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Branding Preview */}
                {activeTab === 'branding' && (
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-3">Vista Previa de Marca</h4>
                      
                      {/* Header Preview */}
                      <div className="p-3 bg-gray-100 rounded-lg mb-3">
                        <p className="text-xs text-gray-500 mb-2">Encabezado:</p>
                        <div className="flex items-center gap-3 bg-white p-2 rounded shadow-sm">
                          {branding.logoUrl ? (
                            <img
                              src={branding.logoUrl}
                              alt="Logo"
                              style={{ width: 40, height: 20 }}
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                              <Image className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <span className="font-semibold text-sm">{branding.companyName}</span>
                        </div>
                      </div>

                      {/* POS Icon Preview */}
                      <div className="p-3 bg-gray-100 rounded-lg mb-3">
                        <p className="text-xs text-gray-500 mb-2">Icono del POS:</p>
                        <div className="flex items-center gap-3">
                          {branding.useCustomPosIcon && branding.posIconUrl ? (
                            <img
                              src={branding.posIconUrl}
                              alt="POS"
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: branding.posIconColor }}>
                              <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <span className="text-sm text-gray-600">
                            {branding.useCustomPosIcon ? 'Personalizado' : 'Por defecto'}
                          </span>
                        </div>
                      </div>

                      {/* Icon Style Preview */}
                      <div className="p-3 bg-gray-100 rounded-lg">
                        <p className="text-xs text-gray-500 mb-2">Estilo de Iconos:</p>
                        <div className="flex gap-2">
                          {['outline', 'filled', 'two-tone'].map((style) => (
                            <div
                              key={style}
                              className={`px-3 py-1 rounded text-xs ${
                                branding.iconStyle === style
                                  ? 'bg-pink-500 text-white'
                                  : 'bg-white text-gray-600'
                              }`}
                            >
                              {style === 'outline' && 'Contorno'}
                              {style === 'filled' && 'Relleno'}
                              {style === 'two-tone' && 'Dos Tonos'}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* KDS Preview */}
                {activeTab === 'kds' && (
                  <div className="space-y-3">
                    <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                      <div className="px-3 py-2 bg-gray-800 text-white text-sm font-medium flex justify-between items-center">
                        <span>KDS Display</span>
                        {kdsConfig.showTimer && <span className="text-xs">⏱️ 05:23</span>}
                      </div>
                      <div className="p-3 space-y-2" style={{ backgroundColor: '#1F2937' }}>
                        <div className="p-3 rounded border-l-4" style={{ backgroundColor: '#374151', borderLeftColor: kdsConfig.stationColors.cocina }}>
                          <div className="flex justify-between items-start mb-2">
                            {kdsConfig.showOrderNumber && <span className="text-white font-bold text-sm">#42</span>}
                            {kdsConfig.showTimer && <span className="text-green-400 text-xs">02:15</span>}
                          </div>
                          <div className="text-gray-300 text-sm">2x Hamburguesa</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <p className="text-xs text-gray-500 mb-2">Estaciones:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(kdsConfig.stationColors).map(([station, color]) => (
                          <span key={station} className="px-2 py-1 rounded text-xs text-white capitalize" style={{ backgroundColor: color }}>
                            {station}
                          </span>
                        ))}
                      </div>
                    </div>
                    {kdsConfig.soundEnabled && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Volume2 className="w-4 h-4" />
                        <span>Sonido: {kdsConfig.soundType} ({kdsConfig.soundVolume}%)</span>
                      </div>
                    )}
                  </div>
                )}
              </Section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
