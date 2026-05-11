import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

// Semantic Theme Interface (aligned with POS and Admin)
export interface ModuleTheme {
  colors: Record<string, string>;
  typography: {
    fontFamily: string;
    fontSizeBase: string;
    fontWeightNormal: number;
    fontWeightMedium: number;
    fontWeightBold: number;
  };
  borderRadius: {
    base: string;
  };
  isDark: boolean;
  shadows: boolean;
}

const THEME_KEY = 'ycc-theme-kds';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

// Legacy interface maintained for backward compatibility
export interface UseThemeReturn {
  theme: ModuleTheme | null;
  isDark: boolean;
  cssVar: (name: string) => string;
}

/**
 * Hook useTheme - Sistema de tema sincronizado para KDS
 * 
 * Este hook ahora se integra con el sistema unificado de temas de YCC.
 * Los cambios desde el Admin se sincronizan en tiempo real vía WebSocket.
 */
export const useTheme = (): UseThemeReturn => {
  const [theme, setTheme] = useState<ModuleTheme | null>(() => {
    // Cargar tema inicial
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing KDS theme', e);
        return null;
      }
    }
    return null;
  });

  const socketRef = useRef<Socket | null>(null);
  const currentThemeRef = useRef(theme);

  // Actualizar ref cuando cambia el tema
  useEffect(() => {
    currentThemeRef.current = theme;
  }, [theme]);

  // ==========================================================================
  // APLICAR TEMA
  // ==========================================================================

  const applyTheme = useCallback((config: ModuleTheme | Partial<ModuleTheme>, source: string = 'unknown') => {
    const root = document.documentElement;
    
    console.log(`🎨 [KDS] Applying theme from: ${source}`, { isDark: config.isDark, colorCount: Object.keys(config.colors || {}).length });
    
    // Apply Colors
    if (config.colors) {
      let appliedCount = 0;
      Object.entries(config.colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
          const cssVar = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          root.style.setProperty(`--${cssVar}`, value);
          appliedCount++;
        }
      });
      console.log(`🎨 [KDS] Applied ${appliedCount} color variables`);
    }

    // Apply Typography
    if (config.typography) {
      if (config.typography.fontFamily) {
        root.style.setProperty('--font-family', config.typography.fontFamily);
        console.log(`🎨 [KDS] Applied font-family: ${config.typography.fontFamily}`);
      }
      if (config.typography.fontSizeBase) {
        root.style.setProperty('--font-size-base', config.typography.fontSizeBase);
      }
    }

    // Apply Radius
    if (config.borderRadius?.base) {
      root.style.setProperty('--radius-base', config.borderRadius.base);
    }

    // Apply dark/light mode - CRITICAL for theme switching
    if (config.isDark !== undefined) {
      const themeValue = config.isDark ? 'dark' : 'light';
      root.setAttribute('data-theme', themeValue);
      console.log(`🎨 [KDS] Theme mode set to: ${themeValue}`);
    }

    // Actualizar estado
    setTheme(prev => {
      const newTheme = { ...(prev || {} as any), ...config } as ModuleTheme;
      
      // Guardar en localStorage
      localStorage.setItem(THEME_KEY, JSON.stringify(newTheme));
      
      // Notificar aplicación
      localStorage.setItem(`${THEME_KEY}-applied`, JSON.stringify({
        timestamp: Date.now(),
        isDark: newTheme.isDark,
      }));
      
      return newTheme;
    });
  }, []);

  // ==========================================================================
  // WEBSOCKET SYNC
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
      console.log('🎨 [KDS] Theme sync connected');
      
      // Unirse a la sala del módulo KDS
      socket.emit('join-module', 'kds');
      
      // Solicitar estado actual
      socket.emit('theme:sync-all');
    });

    socket.on('disconnect', () => {
      console.log('🎨 [KDS] Theme sync disconnected');
    });

    // Escuchar actualizaciones de tema
    socket.on('theme:update', (payload: any) => {
      const { module, tokens, isDark, typography, borderRadius } = payload;
      
      // Aplicar si es global o específicamente para KDS
      if (module === 'kds' || module === 'global') {
        const update: Partial<ModuleTheme> = {
          colors: { ...currentThemeRef.current?.colors, ...tokens },
        };
        
        if (isDark !== undefined) {
          update.isDark = isDark;
        }
        
        if (typography) {
          update.typography = { 
            ...currentThemeRef.current?.typography, 
            ...typography 
          };
        }
        
        if (borderRadius) {
          update.borderRadius = {
            ...currentThemeRef.current?.borderRadius,
            ...borderRadius
          };
        }

        applyTheme(update, `WebSocket-${module}`);
        
        console.log(`🎨 [KDS] Theme updated from ${module}`);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [applyTheme]);

  // ==========================================================================
  // LOCALSTORAGE SYNC (Cross-tab)
  // ==========================================================================

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === THEME_KEY && e.newValue) {
        console.log('🎨 [KDS] Theme changed from another tab (localStorage)');
        try {
          const config = JSON.parse(e.newValue);
          applyTheme(config, 'localStorage');
        } catch (err) {
          console.error('Error parsing theme from storage:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [applyTheme]);

  // ==========================================================================
  // CUSTOM EVENT SYNC (Real-time intra-tab)
  // ==========================================================================

  useEffect(() => {
    const handleThemeChange = (e: CustomEvent) => {
      const { module, config } = e.detail || {};
      
      if (module === 'kds' || module === 'global') {
        const update: Partial<ModuleTheme> = {
          colors: { ...currentThemeRef.current?.colors, ...config?.colors },
          isDark: config?.isDark ?? currentThemeRef.current?.isDark,
        };
        
        if (config?.typography) {
          update.typography = { 
            ...currentThemeRef.current?.typography, 
            ...config.typography 
          };
        }

        applyTheme(update, 'CustomEvent');
      }
    };

    window.addEventListener('ycc-theme-change', handleThemeChange as EventListener);
    return () => window.removeEventListener('ycc-theme-change', handleThemeChange as EventListener);
  }, [applyTheme]);

  return {
    theme,
    isDark: theme?.isDark ?? false,
    cssVar: (name: string) => `var(${name})`,
  };
};
