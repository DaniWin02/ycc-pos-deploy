import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Clock,
  Volume2,
  Palette,
  LayoutGrid,
  Bell,
  Save,
  RotateCcw,
  Check,
  AlertTriangle,
  ChefHat,
  Utensils,
  Coffee,
  AlertCircle,
  Eye,
  EyeOff,
  Type,
  Maximize2
} from 'lucide-react';

// KDS Configuration Interface
interface KDSConfig {
  // Display Settings
  layout: 'grid' | 'list' | 'compact';
  cardsPerRow: number;
  fontSize: 'small' | 'medium' | 'large';
  showImages: boolean;
  showTimer: boolean;
  showOrderNumber: boolean;
  showCustomerName: boolean;
  
  // Timer Settings
  warningTime: number; // seconds
  dangerTime: number; // seconds
  autoArchiveTime: number; // minutes
  
  // Alert Settings
  soundEnabled: boolean;
  soundVolume: number;
  soundType: 'bell' | 'chime' | 'buzz' | 'none';
  desktopNotifications: boolean;
  flashOnNewOrder: boolean;
  
  // Color Coding by Station
  stationColors: Record<string, string>;
  
  // Priority Settings
  priorityEnabled: boolean;
  priorityLabels: string[];
}

const defaultConfig: KDSConfig = {
  layout: 'grid',
  cardsPerRow: 3,
  fontSize: 'medium',
  showImages: true,
  showTimer: true,
  showOrderNumber: true,
  showCustomerName: true,
  warningTime: 300, // 5 minutes
  dangerTime: 600, // 10 minutes
  autoArchiveTime: 30,
  soundEnabled: true,
  soundVolume: 70,
  soundType: 'bell',
  desktopNotifications: true,
  flashOnNewOrder: true,
  stationColors: {
    'cocina': '#EF4444',
    'bar': '#059669', // Verde Country Club
    'parrilla': '#F59E0B',
    'ensaladas': '#10B981',
    'pasteleria': '#8B5CF6',
  },
  priorityEnabled: true,
  priorityLabels: ['Normal', 'Urgente', 'Express'],
};

// Color Picker Component
const ColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (color: string) => void;
}> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-8 h-8 rounded cursor-pointer border border-gray-300"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 px-2 py-1 text-sm border rounded"
      />
    </div>
  </div>
);

// Section Component
const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6"
  >
    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
      {icon}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
);

export const KDSConfigPage: React.FC = () => {
  const [config, setConfig] = useState<KDSConfig>(defaultConfig);
  const [savedMessage, setSavedMessage] = useState(false);
  const [activeTab, setActiveTab] = useState<'display' | 'timers' | 'alerts' | 'colors'>('display');

  // Load config from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('kds-config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(prev => ({ ...prev, ...parsed }));
      } catch {
        console.error('Failed to load KDS config');
      }
    }
  }, []);

  const updateConfig = (updates: Partial<KDSConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('kds-config', JSON.stringify(updated));
      // Broadcast to KDS
      localStorage.setItem('kds-config-updated', Date.now().toString());
      window.dispatchEvent(new CustomEvent('kds-config-change', { detail: updated }));
      return updated;
    });
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const resetToDefault = () => {
    setConfig(defaultConfig);
    localStorage.setItem('kds-config', JSON.stringify(defaultConfig));
    localStorage.setItem('kds-config-updated', Date.now().toString());
    window.dispatchEvent(new CustomEvent('kds-config-change', { detail: defaultConfig }));
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Monitor className="w-6 h-6 text-indigo-600" />
              Configuración KDS
            </h1>
            <p className="text-gray-600 mt-1">
              Personaliza el comportamiento y apariencia del Kitchen Display System
            </p>
          </div>

          <div className="flex items-center gap-2">
            {savedMessage && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg"
              >
                <Check className="w-4 h-4" />
                <span className="text-sm font-medium">¡Guardado!</span>
              </motion.div>
            )}
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Restaurar
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex gap-6">
          {[
            { id: 'display', label: 'Pantalla', icon: LayoutGrid },
            { id: 'timers', label: 'Tiempos', icon: Clock },
            { id: 'alerts', label: 'Alertas', icon: Bell },
            { id: 'colors', label: 'Colores', icon: Palette },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-w-5xl mx-auto">
        {/* Display Settings */}
        {activeTab === 'display' && (
          <Section title="Configuración de Pantalla" icon={<LayoutGrid className="w-5 h-5 text-blue-600" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Layout</label>
                <select
                  value={config.layout}
                  onChange={(e) => updateConfig({ layout: e.target.value as any })}
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
                  value={config.fontSize}
                  onChange={(e) => updateConfig({ fontSize: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="small">Pequeño</option>
                  <option value="medium">Mediano</option>
                  <option value="large">Grande</option>
                </select>
              </div>

              {config.layout === 'grid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tarjetas por Fila</label>
                  <select
                    value={config.cardsPerRow}
                    onChange={(e) => updateConfig({ cardsPerRow: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Elementos a Mostrar</h3>
              {[
                { key: 'showImages', label: 'Imágenes de productos', icon: Eye },
                { key: 'showTimer', label: 'Temporizador de tiempo', icon: Clock },
                { key: 'showOrderNumber', label: 'Número de orden', icon: Hash },
                { key: 'showCustomerName', label: 'Nombre del cliente', icon: User },
              ].map(({ key, label, icon: Icon }) => (
                <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config[key as keyof KDSConfig] as boolean}
                    onChange={(e) => updateConfig({ [key]: e.target.checked } as any)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                </label>
              ))}
            </div>
          </Section>
        )}

        {/* Timer Settings */}
        {activeTab === 'timers' && (
          <Section title="Configuración de Tiempos" icon={<Clock className="w-5 h-5 text-amber-600" />}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Advertencia (amarillo)
                </label>
                <input
                  type="range"
                  min="60"
                  max="1800"
                  step="60"
                  value={config.warningTime}
                  onChange={(e) => updateConfig({ warningTime: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1 min</span>
                  <span className="font-medium text-amber-600">{formatTime(config.warningTime)}</span>
                  <span>30 min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Peligro (rojo)
                </label>
                <input
                  type="range"
                  min="120"
                  max="3600"
                  step="60"
                  value={config.dangerTime}
                  onChange={(e) => updateConfig({ dangerTime: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>2 min</span>
                  <span className="font-medium text-red-600">{formatTime(config.dangerTime)}</span>
                  <span>60 min</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Auto-archivar órdenes completadas después de
                </label>
                <select
                  value={config.autoArchiveTime}
                  onChange={(e) => updateConfig({ autoArchiveTime: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={5}>5 minutos</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos</option>
                  <option value={30}>30 minutos</option>
                  <option value={60}>1 hora</option>
                </select>
              </div>
            </div>
          </Section>
        )}

        {/* Alert Settings */}
        {activeTab === 'alerts' && (
          <Section title="Configuración de Alertas" icon={<Bell className="w-5 h-5 text-purple-600" />}>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-700">Sonido de Notificación</span>
                    <p className="text-sm text-gray-500">Reproducir sonido cuando llega una nueva orden</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.soundEnabled}
                  onChange={(e) => updateConfig({ soundEnabled: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>

              {config.soundEnabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Sonido</label>
                    <select
                      value={config.soundType}
                      onChange={(e) => updateConfig({ soundType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="bell">Campana</option>
                      <option value="chime">Carrillón</option>
                      <option value="buzz">Zumbido</option>
                      <option value="none">Ninguno</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Volumen</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={config.soundVolume}
                      onChange={(e) => updateConfig({ soundVolume: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-500 mt-1">{config.soundVolume}%</div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-700">Notificaciones de Escritorio</span>
                    <p className="text-sm text-gray-500">Mostrar notificación del navegador</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.desktopNotifications}
                  onChange={(e) => updateConfig({ desktopNotifications: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="font-medium text-gray-700">Destello en Nueva Orden</span>
                    <p className="text-sm text-gray-500">Hacer parpadear la pantalla</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={config.flashOnNewOrder}
                  onChange={(e) => updateConfig({ flashOnNewOrder: e.target.checked })}
                  className="w-5 h-5 text-indigo-600 rounded"
                />
              </div>
            </div>
          </Section>
        )}

        {/* Color Settings */}
        {activeTab === 'colors' && (
          <Section title="Colores por Estación" icon={<Palette className="w-5 h-5 text-pink-600" />}>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">
                Configura los colores para identificar visualmente cada estación de trabajo en el KDS.
              </p>
              
              {Object.entries(config.stationColors).map(([station, color]) => (
                <ColorPicker
                  key={station}
                  label={station.charAt(0).toUpperCase() + station.slice(1)}
                  value={color}
                  onChange={(newColor) => updateConfig({
                    stationColors: { ...config.stationColors, [station]: newColor }
                  })}
                />
              ))}

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Vista Previa</h4>
                <div className="flex gap-3">
                  {Object.entries(config.stationColors).map(([station, color]) => (
                    <div
                      key={station}
                      className="px-4 py-2 rounded-lg text-white font-medium text-sm"
                      style={{ backgroundColor: color }}
                    >
                      {station.charAt(0).toUpperCase() + station.slice(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

// Helper icon component
const Hash = () => <span className="text-gray-500 font-mono">#</span>;
const User = () => <Utensils className="w-4 h-4 text-gray-500" />;

export default KDSConfigPage;
