/**
 * Hook useSyncedTheme - Sincronización de tema entre módulos
 * 
 * Este hook combina el tema local con el tema sincronizado del Admin.
 * Escucha cambios vía WebSocket y localStorage.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  SemanticTokens, 
  ThemeConfiguration,
  defaultLightTheme,
  defaultDarkTheme,
  generateCssVariables,
  mergeTokens
} from '../tokens/semanticTokens';

// ============================================================================
// TIPOS
// ============================================================================

export type ThemeModule = 'pos' | 'kds' | 'admin';

export interface SyncedThemeState {
  config: ThemeConfiguration;
  isDark: boolean;
  isLoading: boolean;
  isConnected: boolean;
  lastSyncTime: Date | null;
}

export interface UseSyncedThemeReturn extends SyncedThemeState {
  // Acciones
  updateToken: (key: keyof SemanticTokens, value: string) => void;
  updateTokens: (updates: Partial<SemanticTokens>) => void;
  toggleDarkMode: () => void;
  resetToDefaults: () => void;
  refreshFromServer: () => void;
  
  // Helpers
  getToken: (key: keyof SemanticTokens) => string;
  getCssVar: (name: string) => string;
  
  // Para componentes legacy
  theme: ThemeConfiguration;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const getStorageKey = (module: ThemeModule) => `ycc-theme-${module}`;
const getLegacyStorageKey = (module: ThemeModule) => `ycc-theme-${module}-config`;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useSyncedTheme(module: ThemeModule): UseSyncedThemeReturn {
  // Estado interno
  const [state, setState] = useState<SyncedThemeState>(() => {
    const stored = loadStoredConfig(module);
    return {
      config: stored || defaultLightTheme,
      isDark: stored?.isDark ?? false,
      isLoading: true,
      isConnected: false,
      lastSyncTime: null,
    };
  });

  const socketRef = useRef<Socket | null>(null);
  const isInitializing = useRef(true);

  // ==========================================================================
  // CARGA INICIAL
  // ==========================================================================

  useEffect(() => {
    // Intentar cargar desde localStorage primero
    const stored = loadStoredConfig(module);
    if (stored) {
      setState(prev => ({
        ...prev,
        config: stored,
        isDark: stored.isDark,
        isLoading: false,
      }));
      applyTokensToDocument(stored);
    }
    isInitializing.current = false;
  }, [module]);

  // ==========================================================================
  // CONEXIÓN WEBSOCKET
  // ==========================================================================

  useEffect(() => {
    const socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setState(prev => ({ ...prev, isConnected: true }));
      console.log(`🎨 [${module}] Theme sync connected`);
      
      // Unirse a la sala del módulo
      socket.emit('join-module', module);
      
      // Solicitar estado actual
      socket.emit('theme:sync-all');
    });

    socket.on('disconnect', () => {
      setState(prev => ({ ...prev, isConnected: false }));
      console.log(`🎨 [${module}] Theme sync disconnected`);
    });

    socket.on('theme:update', (payload: any) => {
      const { module: updatedModule, tokens, isDark, timestamp } = payload;
      
      // Aplicar si es global o el mismo módulo
      if (updatedModule === 'global' || updatedModule === module) {
        setState(prev => {
          const newConfig: ThemeConfiguration = {
            ...prev.config,
            tokens: updatedModule === 'global' 
              ? mergeTokens(prev.config.tokens, tokens)
              : { ...prev.config.tokens, ...tokens },
            isDark: isDark ?? prev.isDark,
          };
          
          // Guardar y aplicar
          saveStoredConfig(module, newConfig);
          applyTokensToDocument(newConfig);
          
          return {
            ...prev,
            config: newConfig,
            isDark: newConfig.isDark,
            lastSyncTime: new Date(timestamp || Date.now()),
          };
        });
      }
    });

    socket.on('theme:current-state', (serverState: any) => {
      const moduleState = serverState[module] || serverState.global;
      
      if (moduleState) {
        setState(prev => {
          const mergedConfig: ThemeConfiguration = {
            ...prev.config,
            ...moduleState,
            tokens: mergeTokens(prev.config.tokens, moduleState.tokens || {}),
          };
          
          saveStoredConfig(module, mergedConfig);
          applyTokensToDocument(mergedConfig);
          
          return {
            ...prev,
            config: mergedConfig,
            isDark: mergedConfig.isDark,
            isLoading: false,
            lastSyncTime: new Date(),
          };
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [module]);

  // ==========================================================================
  // LOCALSTORAGE SYNC (Cross-tab)
  // ==========================================================================

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === getStorageKey(module) && e.newValue) {
        try {
          const config = JSON.parse(e.newValue) as ThemeConfiguration;
          setState(prev => ({
            ...prev,
            config,
            isDark: config.isDark,
          }));
          applyTokensToDocument(config);
        } catch (err) {
          console.error('Error parsing theme from storage:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [module]);

  // ==========================================================================
  // ACCIONES
  // ==========================================================================

  const updateToken = useCallback((key: keyof SemanticTokens, value: string) => {
    setState(prev => {
      const newConfig: ThemeConfiguration = {
        ...prev.config,
        tokens: { ...prev.config.tokens, [key]: value },
      };
      
      saveStoredConfig(module, newConfig);
      applyTokensToDocument(newConfig);
      
      // Notificar al servidor si está conectado
      if (socketRef.current?.connected) {
        socketRef.current.emit('theme:update', {
          module,
          tokens: { [key]: value },
          isDark: newConfig.isDark,
          timestamp: Date.now(),
        });
      }
      
      // Emitir evento local para otros componentes
      emitLocalThemeChange(module, newConfig);
      
      return { ...prev, config: newConfig };
    });
  }, [module]);

  const updateTokens = useCallback((updates: Partial<SemanticTokens>) => {
    setState(prev => {
      const newConfig: ThemeConfiguration = {
        ...prev.config,
        tokens: { ...prev.config.tokens, ...updates },
      };
      
      saveStoredConfig(module, newConfig);
      applyTokensToDocument(newConfig);
      
      if (socketRef.current?.connected) {
        socketRef.current.emit('theme:update', {
          module,
          tokens: updates,
          isDark: newConfig.isDark,
          timestamp: Date.now(),
        });
      }
      
      emitLocalThemeChange(module, newConfig);
      
      return { ...prev, config: newConfig };
    });
  }, [module]);

  const toggleDarkMode = useCallback(() => {
    setState(prev => {
      const newIsDark = !prev.isDark;
      const baseTokens = newIsDark ? defaultDarkTheme : defaultLightTheme;
      
      const newConfig: ThemeConfiguration = {
        ...prev.config,
        isDark: newIsDark,
        tokens: baseTokens.tokens,
      };
      
      saveStoredConfig(module, newConfig);
      applyTokensToDocument(newConfig);
      
      if (socketRef.current?.connected) {
        socketRef.current.emit('theme:update', {
          module,
          tokens: newConfig.tokens,
          isDark: newIsDark,
          timestamp: Date.now(),
        });
      }
      
      emitLocalThemeChange(module, newConfig);
      
      return { ...prev, config: newConfig, isDark: newIsDark };
    });
  }, [module]);

  const resetToDefaults = useCallback(() => {
    const defaultConfig = state.isDark ? defaultDarkTheme : defaultLightTheme;
    
    saveStoredConfig(module, defaultConfig);
    applyTokensToDocument(defaultConfig);
    
    setState(prev => ({
      ...prev,
      config: defaultConfig,
    }));
    
    if (socketRef.current?.connected) {
      socketRef.current.emit('theme:reset');
    }
  }, [module, state.isDark]);

  const refreshFromServer = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('theme:sync-all');
    }
  }, []);

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  const getToken = useCallback(
    (key: keyof SemanticTokens) => state.config.tokens[key],
    [state.config.tokens]
  );

  const getCssVar = useCallback((name: string) => {
    return `var(--${name})`;
  }, []);

  // ==========================================================================
  // RETURN
  // ==========================================================================

  return {
    ...state,
    updateToken,
    updateTokens,
    toggleDarkMode,
    resetToDefaults,
    refreshFromServer,
    getToken,
    getCssVar,
    theme: state.config,
  };
}

// ============================================================================
// UTILIDADES
// ============================================================================

function loadStoredConfig(module: ThemeModule): ThemeConfiguration | null {
  try {
    // Intentar cargar del nuevo formato
    const stored = localStorage.getItem(getStorageKey(module));
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Fallback al formato legacy
    const legacy = localStorage.getItem(getLegacyStorageKey(module));
    if (legacy) {
      return JSON.parse(legacy);
    }
  } catch (e) {
    console.error('Error loading theme config:', e);
  }
  return null;
}

function saveStoredConfig(module: ThemeModule, config: ThemeConfiguration) {
  try {
    localStorage.setItem(getStorageKey(module), JSON.stringify(config));
    
    // También guardar el timestamp de aplicación
    localStorage.setItem(`${getStorageKey(module)}-applied`, JSON.stringify({
      timestamp: Date.now(),
      isDark: config.isDark,
    }));
  } catch (e) {
    console.error('Error saving theme config:', e);
  }
}

function applyTokensToDocument(config: ThemeConfiguration) {
  const root = document.documentElement;
  const vars = generateCssVariables(config.tokens);

  // Aplicar tokens
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  // Aplicar atributos
  root.setAttribute('data-theme', config.isDark ? 'dark' : 'light');
  root.setAttribute('data-density', config.density);
}

function emitLocalThemeChange(module: ThemeModule, config: ThemeConfiguration) {
  const event = new CustomEvent('ycc-theme-change', {
    detail: {
      module,
      config,
      timestamp: Date.now(),
    },
  });
  window.dispatchEvent(event);
}
