/**
 * ThemeProvider - Proveedor centralizado de temas para YCC POS
 * 
 * Características:
 * - Sincronización en tiempo real vía Socket.IO
 * - Persistencia en localStorage y backend
 * - Soporte para modo global y por módulo
 * - Actualización instantánea de CSS variables
 */

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ThemeMode, ThemeModule, ModuleThemeConfig, ThemeSystemConfig, ThemeChangeEvent } from './types';
import { defaultThemeConfig, applyThemeToDOM, getStoredTheme, saveThemeToStorage } from './utils';

interface ThemeContextValue {
  // Estado actual
  currentModule: ThemeModule;
  config: ThemeSystemConfig;
  
  // Acciones
  setThemeMode: (module: ThemeModule, mode: ThemeMode) => void;
  toggleThemeMode: (module: ThemeModule) => void;
  setUseGlobal: (module: ThemeModule, useGlobal: boolean) => void;
  updateCustomColors: (module: ThemeModule, colors: Partial<ModuleThemeConfig['customColors']>) => void;
  resetModule: (module: ThemeModule) => void;
  resetAll: () => void;
  
  // Utilidades
  getCurrentMode: (module: ThemeModule) => ThemeMode;
  isUsingGlobal: (module: ThemeModule) => boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  module: ThemeModule;
  apiUrl?: string;
}

export function ThemeProvider({ children, module, apiUrl }: ThemeProviderProps) {
  const [config, setConfig] = useState<ThemeSystemConfig>(() => {
    // Intentar cargar desde localStorage primero
    const stored = getStoredTheme();
    return stored || defaultThemeConfig;
  });
  
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Inicializar Socket.IO para sincronización en tiempo real
  useEffect(() => {
    if (!apiUrl) return;

    const socketInstance = io(apiUrl, {
      transports: ['polling', 'websocket'],
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('🎨 [Theme] Conectado a servidor de temas');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('🎨 [Theme] Desconectado del servidor');
      setIsConnected(false);
    });

    // Escuchar cambios de tema desde otros clientes
    socketInstance.on('theme:updated', (event: ThemeChangeEvent) => {
      console.log('🎨 [Theme] Cambio recibido:', event);
      
      // Solo aplicar si no es del mismo módulo (evitar loops)
      if (event.source !== 'user' || event.module !== module) {
        setConfig(prev => ({
          ...prev,
          [event.module]: event.config,
          lastUpdated: new Date(event.timestamp)
        }));
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [apiUrl, module]);

  // Aplicar tema al DOM cuando cambie la configuración
  useEffect(() => {
    const moduleConfig = config[module];
    const effectiveMode = moduleConfig.useGlobal ? config.global.mode : moduleConfig.mode;
    
    applyThemeToDOM(module, effectiveMode, moduleConfig.customColors);
    saveThemeToStorage(config);
  }, [config, module]);

  // Cargar tema desde backend al iniciar
  useEffect(() => {
    if (!apiUrl) return;

    const loadThemeFromBackend = async () => {
      try {
        const response = await fetch(`${apiUrl}/theme/config`);
        if (response.ok) {
          const { data } = await response.json();
          if (data) {
            setConfig({
              ...data,
              lastUpdated: new Date(data.lastUpdated)
            });
            console.log('🎨 [Theme] Configuración cargada desde backend');
          }
        }
      } catch (error) {
        console.error('🎨 [Theme] Error cargando desde backend:', error);
      }
    };

    loadThemeFromBackend();
  }, [apiUrl]);

  // Guardar cambios en backend
  const saveToBackend = useCallback(async (newConfig: ThemeSystemConfig) => {
    if (!apiUrl) return;

    try {
      await fetch(`${apiUrl}/theme/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig })
      });
      console.log('🎨 [Theme] Guardado en backend');
    } catch (error) {
      console.error('🎨 [Theme] Error guardando en backend:', error);
    }
  }, [apiUrl]);

  // Emitir cambio vía Socket.IO
  const emitThemeChange = useCallback((targetModule: ThemeModule, moduleConfig: ModuleThemeConfig) => {
    if (!socket || !isConnected) return;

    const event: ThemeChangeEvent = {
      module: targetModule,
      config: moduleConfig,
      timestamp: new Date(),
      source: 'user'
    };

    socket.emit('theme:change', event);
    console.log('🎨 [Theme] Cambio emitido:', event);
  }, [socket, isConnected]);

  // Acciones
  const setThemeMode = useCallback((targetModule: ThemeModule, mode: ThemeMode) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [targetModule]: {
          ...prev[targetModule],
          mode
        },
        lastUpdated: new Date()
      };
      
      saveToBackend(newConfig);
      emitThemeChange(targetModule, newConfig[targetModule]);
      
      return newConfig;
    });
  }, [saveToBackend, emitThemeChange]);

  const toggleThemeMode = useCallback((targetModule: ThemeModule) => {
    const currentMode = config[targetModule].mode;
    const newMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    setThemeMode(targetModule, newMode);
  }, [config, setThemeMode]);

  const setUseGlobal = useCallback((targetModule: ThemeModule, useGlobal: boolean) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [targetModule]: {
          ...prev[targetModule],
          useGlobal
        },
        lastUpdated: new Date()
      };
      
      saveToBackend(newConfig);
      emitThemeChange(targetModule, newConfig[targetModule]);
      
      return newConfig;
    });
  }, [saveToBackend, emitThemeChange]);

  const updateCustomColors = useCallback((targetModule: ThemeModule, colors: Partial<ModuleThemeConfig['customColors']>) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [targetModule]: {
          ...prev[targetModule],
          customColors: {
            ...prev[targetModule].customColors,
            ...colors
          }
        },
        lastUpdated: new Date()
      };
      
      saveToBackend(newConfig);
      emitThemeChange(targetModule, newConfig[targetModule]);
      
      return newConfig;
    });
  }, [saveToBackend, emitThemeChange]);

  const resetModule = useCallback((targetModule: ThemeModule) => {
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [targetModule]: defaultThemeConfig[targetModule],
        lastUpdated: new Date()
      };
      
      saveToBackend(newConfig);
      emitThemeChange(targetModule, newConfig[targetModule]);
      
      return newConfig;
    });
  }, [saveToBackend, emitThemeChange]);

  const resetAll = useCallback(() => {
    const newConfig = {
      ...defaultThemeConfig,
      lastUpdated: new Date()
    };
    
    setConfig(newConfig);
    saveToBackend(newConfig);
    
    // Emitir reset para todos los módulos
    (['global', 'admin', 'pos', 'kds'] as ThemeModule[]).forEach(mod => {
      emitThemeChange(mod, newConfig[mod]);
    });
  }, [saveToBackend, emitThemeChange]);

  const getCurrentMode = useCallback((targetModule: ThemeModule): ThemeMode => {
    const moduleConfig = config[targetModule];
    return moduleConfig.useGlobal ? config.global.mode : moduleConfig.mode;
  }, [config]);

  const isUsingGlobal = useCallback((targetModule: ThemeModule): boolean => {
    return config[targetModule].useGlobal;
  }, [config]);

  const value: ThemeContextValue = {
    currentModule: module,
    config,
    setThemeMode,
    toggleThemeMode,
    setUseGlobal,
    updateCustomColors,
    resetModule,
    resetAll,
    getCurrentMode,
    isUsingGlobal
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Hook para usar el contexto de temas
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
}
