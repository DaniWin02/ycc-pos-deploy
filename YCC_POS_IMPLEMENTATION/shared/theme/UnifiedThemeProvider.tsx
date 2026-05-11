/**
 * Theme Provider Unificado para todos los módulos YCC POS
 * Maneja herencia de tokens, sincronización WebSocket y persistencia
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo,
  ReactNode 
} from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  SemanticTokens, 
  TypographyTokens,
  ThemeConfiguration,
  defaultLightTheme,
  defaultDarkTheme,
  generateCssVariables,
  mergeTokens 
} from '../tokens/semanticTokens';

// ============================================================================
// TIPOS
// ============================================================================

export type ThemeModule = 'global' | 'admin' | 'pos' | 'kds' | 'mobile';

export interface ModuleThemeConfig {
  tokens: Partial<SemanticTokens>;
  typography?: Partial<TypographyTokens>;
  isDark: boolean;
  overrides?: string[]; // Lista de tokens que sobrescribe del global
}

export interface UnifiedThemeState {
  global: ThemeConfiguration;
  admin: Partial<ThemeConfiguration>;
  pos: Partial<ThemeConfiguration>;
  kds: Partial<ThemeConfiguration>;
  mobile: Partial<ThemeConfiguration>;
}

export interface ThemeContextValue {
  // Estado actual
  currentModule: ThemeModule;
  effectiveConfig: ThemeConfiguration;
  
  // Tokens aplicados
  tokens: SemanticTokens;
  isDark: boolean;
  
  // Helpers
  getToken: (key: keyof SemanticTokens) => string;
  getCssVar: (name: string) => string;
  
  // Acciones
  updateToken: (key: keyof SemanticTokens, value: string) => void;
  updateMultipleTokens: (updates: Partial<SemanticTokens>) => void;
  toggleDarkMode: () => void;
  resetToDefaults: () => void;
  
  // Sincronización
  isConnected: boolean;
  lastSyncTime: number | null;
}

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

const STORAGE_KEY = 'ycc-unified-theme';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

// ============================================================================
// CONTEXT
// ============================================================================

const UnifiedThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// UTILIDADES
// ============================================================================

function loadStoredConfig(): Partial<UnifiedThemeState> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error loading theme config:', e);
  }
  return {};
}

function saveConfig(state: UnifiedThemeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving theme config:', e);
  }
}

function mergeWithGlobal(
  global: ThemeConfiguration,
  local: Partial<ThemeConfiguration>
): ThemeConfiguration {
  return {
    tokens: mergeTokens(global.tokens, local.tokens || {}),
    typography: { ...global.typography, ...(local.typography || {}) },
    spacing: global.spacing,
    borders: global.borders,
    shadows: global.shadows,
    animations: global.animations,
    isDark: local.isDark ?? global.isDark,
    density: local.density || global.density,
  };
}

// ============================================================================
// PROVIDER
// ============================================================================

interface UnifiedThemeProviderProps {
  children: ReactNode;
  module: ThemeModule;
  enableSync?: boolean;
}

export function UnifiedThemeProvider({
  children,
  module,
  enableSync = true,
}: UnifiedThemeProviderProps) {
  // Estado interno
  const [state, setState] = useState<UnifiedThemeState>(() => {
    const stored = loadStoredConfig();
    return {
      global: defaultLightTheme,
      admin: stored.admin || {},
      pos: stored.pos || {},
      kds: stored.kds || {},
      mobile: stored.mobile || {},
    };
  });

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

  // Configuración efectiva para el módulo actual
  const effectiveConfig = useMemo(() => {
    const localConfig = state[module] || {};
    return mergeWithGlobal(state.global, localConfig);
  }, [state, module]);

  // ==========================================================================
  // APLICACIÓN DE TOKENS CSS
  // ==========================================================================

  const applyTokensToDocument = useCallback((config: ThemeConfiguration) => {
    const root = document.documentElement;
    const vars = generateCssVariables(config.tokens);

    // Aplicar tokens semánticos
    Object.entries(vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Aplicar atributos de tema
    root.setAttribute('data-theme', config.isDark ? 'dark' : 'light');
    root.setAttribute('data-density', config.density);
    root.setAttribute('data-module', module);

    // Aplicar variables de tipografía
    if (config.typography?.fontFamily) {
      root.style.setProperty('--font-family-sans', config.typography.fontFamily.sans);
      root.style.setProperty('--font-family-mono', config.typography.fontFamily.mono);
    }

  }, [module]);

  // ==========================================================================
  // CONEXIÓN WEBSOCKET
  // ==========================================================================

  useEffect(() => {
    if (!enableSync) return;

    const newSocket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('🎨 Theme sync connected');
      
      // Unirse a la sala del módulo
      newSocket.emit('join-module', module);
      
      // Solicitar estado actual
      newSocket.emit('theme:sync-all');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('🎨 Theme sync disconnected');
    });

    newSocket.on('theme:update', (payload) => {
      const { module: updatedModule, tokens, isDark } = payload;
      
      setState(prev => {
        const newState = { ...prev };
        
        if (updatedModule === 'global') {
          // Actualizar global y recalcular todos
          newState.global = {
            ...prev.global,
            tokens: mergeTokens(prev.global.tokens, tokens),
            isDark,
          };
        } else {
          // Actualizar módulo específico
          newState[updatedModule as keyof UnifiedThemeState] = {
            ...prev[updatedModule as keyof UnifiedThemeState],
            tokens: { ...(prev[updatedModule as keyof UnifiedThemeState] as any)?.tokens, ...tokens },
            isDark,
          };
        }
        
        saveConfig(newState);
        return newState;
      });

      setLastSyncTime(Date.now());
    });

    newSocket.on('theme:current-state', (serverState: ThemeSyncState) => {
      setState(prev => {
        const newState = { ...prev };
        
        Object.entries(serverState).forEach(([key, value]) => {
          if (value && key !== 'global') {
            newState[key as keyof UnifiedThemeState] = {
              ...prev[key as keyof UnifiedThemeState],
              ...value,
            };
          }
        });
        
        saveConfig(newState);
        return newState;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [enableSync, module]);

  // ==========================================================================
  // APLICACIÓN DE CAMBIOS
  // ==========================================================================

  useEffect(() => {
    applyTokensToDocument(effectiveConfig);
  }, [effectiveConfig, applyTokensToDocument]);

  // ==========================================================================
  // ACCIONES
  // ==========================================================================

  const updateToken = useCallback((key: keyof SemanticTokens, value: string) => {
    setState(prev => {
      const newState = { ...prev };
      
      if (module === 'global') {
        newState.global = {
          ...prev.global,
          tokens: { ...prev.global.tokens, [key]: value },
        };
      } else {
        const localConfig = prev[module] || {};
        newState[module] = {
          ...localConfig,
          tokens: { ...localConfig.tokens, [key]: value },
        };
      }
      
      saveConfig(newState);
      
      // Emitir cambio si hay conexión
      if (socket?.connected) {
        socket.emit('theme:update', {
          module,
          tokens: { [key]: value },
          isDark: newState.global.isDark,
          timestamp: Date.now(),
        });
      }
      
      return newState;
    });
  }, [module, socket]);

  const updateMultipleTokens = useCallback((updates: Partial<SemanticTokens>) => {
    setState(prev => {
      const newState = { ...prev };
      
      if (module === 'global') {
        newState.global = {
          ...prev.global,
          tokens: { ...prev.global.tokens, ...updates },
        };
      } else {
        const localConfig = prev[module] || {};
        newState[module] = {
          ...localConfig,
          tokens: { ...localConfig.tokens, ...updates },
        };
      }
      
      saveConfig(newState);
      
      if (socket?.connected) {
        socket.emit('theme:update', {
          module,
          tokens: updates,
          isDark: newState.global.isDark,
          timestamp: Date.now(),
        });
      }
      
      return newState;
    });
  }, [module, socket]);

  const toggleDarkMode = useCallback(() => {
    setState(prev => {
      const newIsDark = !prev.global.isDark;
      const newTheme = newIsDark ? defaultDarkTheme : defaultLightTheme;
      
      const newState: UnifiedThemeState = {
        ...prev,
        global: {
          ...prev.global,
          isDark: newIsDark,
          tokens: newTheme.tokens,
        },
      };
      
      saveConfig(newState);
      
      if (socket?.connected) {
        socket.emit('theme:update', {
          module: 'global',
          tokens: newTheme.tokens,
          isDark: newIsDark,
          timestamp: Date.now(),
        });
      }
      
      return newState;
    });
  }, [socket]);

  const resetToDefaults = useCallback(() => {
    setState({
      global: defaultLightTheme,
      admin: {},
      pos: {},
      kds: {},
      mobile: {},
    });
    
    saveConfig({
      global: defaultLightTheme,
      admin: {},
      pos: {},
      kds: {},
      mobile: {},
    } as UnifiedThemeState);
    
    if (socket?.connected) {
      socket.emit('theme:reset');
    }
  }, [socket]);

  // ==========================================================================
  // HELPERS
  // ==========================================================================

  const getToken = useCallback(
    (key: keyof SemanticTokens) => effectiveConfig.tokens[key],
    [effectiveConfig]
  );

  const getCssVar = useCallback((name: string) => {
    return `var(--${name})`;
  }, []);

  // ==========================================================================
  // VALUE
  // ==========================================================================

  const value: ThemeContextValue = useMemo(
    () => ({
      currentModule: module,
      effectiveConfig,
      tokens: effectiveConfig.tokens,
      isDark: effectiveConfig.isDark,
      getToken,
      getCssVar,
      updateToken,
      updateMultipleTokens,
      toggleDarkMode,
      resetToDefaults,
      isConnected,
      lastSyncTime,
    }),
    [
      module,
      effectiveConfig,
      getToken,
      getCssVar,
      updateToken,
      updateMultipleTokens,
      toggleDarkMode,
      resetToDefaults,
      isConnected,
      lastSyncTime,
    ]
  );

  return (
    <UnifiedThemeContext.Provider value={value}>
      {children}
    </UnifiedThemeContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useUnifiedTheme() {
  const context = useContext(UnifiedThemeContext);
  
  if (context === undefined) {
    throw new Error('useUnifiedTheme must be used within UnifiedThemeProvider');
  }
  
  return context;
}

export function useThemeToken<K extends keyof SemanticTokens>(key: K): string {
  const { tokens } = useUnifiedTheme();
  return tokens[key];
}

export function useCssVar(name: string): string {
  return `var(--${name})`;
}
