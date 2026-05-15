/**
 * AppearancePage v2.0 - Sistema de Personalización Visual
 * Reconstruido desde cero con arquitectura limpia y funcional
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Monitor,
  Moon,
  Sun,
  Settings,
  Smartphone,
  Utensils,
  Globe,
  RotateCcw,
  Check,
  RefreshCw
} from 'lucide-react';
import { useTheme } from '../../shared/theme';
import type { ThemeModule } from '../../shared/theme';

export function AppearancePage() {
  const { 
    config,
    setThemeMode,
    toggleThemeMode,
    setUseGlobal,
    resetModule,
    getCurrentMode,
    isUsingGlobal
  } = useTheme();

  const [selectedModule, setSelectedModule] = useState<ThemeModule>('admin');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const notify = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const currentMode = getCurrentMode(selectedModule);
  const usingGlobal = isUsingGlobal(selectedModule);

  const handleToggleMode = () => {
    toggleThemeMode(selectedModule);
    notify(`Modo ${currentMode === 'dark' ? 'claro' : 'oscuro'} activado`);
  };

  const handleReset = () => {
    if (confirm(`¿Restablecer ${selectedModule.toUpperCase()} a valores por defecto?`)) {
      resetModule(selectedModule);
      notify(`${selectedModule.toUpperCase()} restablecido`);
    }
  };

  const handleToggleGlobal = () => {
    setUseGlobal(selectedModule, !usingGlobal);
    notify(usingGlobal ? 'Tema personalizado activado' : 'Usando tema global');
  };

  const modules: { id: ThemeModule; label: string; icon: any; color: string }[] = [
    { id: 'global', label: 'Global', icon: Globe, color: 'bg-purple-500' },
    { id: 'admin', label: 'Admin Panel', icon: Settings, color: 'bg-blue-500' },
    { id: 'pos', label: 'POS Terminal', icon: Smartphone, color: 'bg-green-500' },
    { id: 'kds', label: 'KDS Cocina', icon: Utensils, color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Toast Notification */}
      {showToast && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
        >
          <Check className="w-5 h-5" />
          {toastMessage}
        </motion.div>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Personalización Visual</h1>
        <p className="text-gray-600">Sistema de temas v2.0 - Gestiona la apariencia de cada módulo</p>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Module Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Seleccionar Módulo</h2>
            
            <div className="space-y-3">
              {modules.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModule(mod.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    selectedModule === mod.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${mod.color} text-white`}>
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-900">{mod.label}</div>
                    <div className="text-xs text-gray-500">
                      {getCurrentMode(mod.id) === 'dark' ? 'Modo oscuro' : 'Modo claro'}
                    </div>
                  </div>
                  {selectedModule === mod.id && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </button>
              ))}
            </div>

            {/* Global Theme Toggle */}
            {selectedModule !== 'global' && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Usar tema global</span>
                  <button
                    onClick={handleToggleGlobal}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      usingGlobal ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        usingGlobal ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {usingGlobal 
                    ? 'Este módulo hereda la configuración global' 
                    : 'Este módulo usa configuración personalizada'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content - Theme Controls */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Configuración de {modules.find(m => m.id === selectedModule)?.label}
              </h2>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restablecer
              </button>
            </div>

            {/* Theme Mode Toggle */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">Modo de Tema</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setThemeMode(selectedModule, 'light')}
                  className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 transition-all ${
                    currentMode === 'light'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sun className={`w-6 h-6 ${currentMode === 'light' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Modo Claro</div>
                    <div className="text-xs text-gray-500">Fondo blanco</div>
                  </div>
                </button>

                <button
                  onClick={() => setThemeMode(selectedModule, 'dark')}
                  className={`flex items-center justify-center gap-3 p-6 rounded-lg border-2 transition-all ${
                    currentMode === 'dark'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Moon className={`w-6 h-6 ${currentMode === 'dark' ? 'text-blue-600' : 'text-gray-400'}`} />
                  <div className="text-left">
                    <div className="font-semibold text-gray-900">Modo Oscuro</div>
                    <div className="text-xs text-gray-500">Fondo oscuro</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Preview Card */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Vista Previa</label>
              <div 
                className={`p-6 rounded-lg border-2 transition-all ${
                  currentMode === 'dark' 
                    ? 'bg-gray-900 border-gray-700' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className={`mb-4 ${currentMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <h3 className="text-xl font-bold mb-2">Ejemplo de Contenido</h3>
                  <p className={currentMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Este es un ejemplo de cómo se verá el contenido con el tema {currentMode === 'dark' ? 'oscuro' : 'claro'}.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Botón Principal
                  </button>
                  <button className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentMode === 'dark'
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}>
                    Botón Secundario
                  </button>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Monitor className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Sincronización en Tiempo Real</h4>
                  <p className="text-sm text-blue-700">
                    Los cambios se aplican automáticamente a todas las instancias abiertas del módulo seleccionado.
                    {selectedModule !== 'global' && usingGlobal && (
                      <span className="block mt-1">
                        Este módulo está heredando la configuración global. Desactiva "Usar tema global" para personalizarlo.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleToggleMode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Alternar Modo
              </button>
            </div>
          </div>

          {/* Configuration Summary */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen de Configuración</h3>
            <div className="space-y-3">
              {modules.map((mod) => {
                const mode = getCurrentMode(mod.id);
                const isGlobal = isUsingGlobal(mod.id);
                
                return (
                  <div key={mod.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded ${mod.color} text-white`}>
                        <mod.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{mod.label}</div>
                        <div className="text-xs text-gray-500">
                          {mod.id !== 'global' && isGlobal ? 'Heredando global' : `Modo ${mode}`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {mode === 'dark' ? (
                        <Moon className="w-4 h-4 text-gray-600" />
                      ) : (
                        <Sun className="w-4 h-4 text-gray-600" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
