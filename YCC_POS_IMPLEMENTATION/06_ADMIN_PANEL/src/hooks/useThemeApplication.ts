import { useEffect, useCallback } from 'react';
import { useThemeStore } from '../stores/theme.store';
import { ThemeModule } from '../types/theme.types';

/**
 * Hook to apply theme CSS variables to the document root.
 * This ensures theme changes are reflected across all pages.
 */
export function useThemeApplication(module: ThemeModule = 'admin') {
  const { getEffectiveConfig, config } = useThemeStore();

  const applyTheme = useCallback(() => {
    const theme = getEffectiveConfig(module);
    const root = document.documentElement;

    // Apply Semantic Color Tokens
    if (theme.colors) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
          // Convert camelCase to kebab-case for CSS variables
          const cssVar = key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
          root.style.setProperty(`--${cssVar}`, value);
        }
      });
    }

    // Apply Typography
    if (theme.typography) {
      if (theme.typography.fontFamily) {
        root.style.setProperty('--font-family', theme.typography.fontFamily);
      }
      if (theme.typography.fontSizeBase) {
        root.style.setProperty('--font-size-base', theme.typography.fontSizeBase);
      }
    }

    // Apply Border Radius
    if (theme.borderRadius) {
      if (theme.borderRadius.base) {
        root.style.setProperty('--radius-base', theme.borderRadius.base);
      }
    }

    // Apply dark/light mode attribute
    root.setAttribute('data-theme', theme.isDark ? 'dark' : 'light');

    // Also store in localStorage for other windows/modules to sync
    localStorage.setItem(`ycc-theme-${module}-applied`, JSON.stringify({
      timestamp: Date.now(),
      isDark: theme.isDark
    }));
  }, [getEffectiveConfig, module]);

  // Apply theme on mount and when config changes
  useEffect(() => {
    applyTheme();
  }, [applyTheme, config]);

  // Listen for theme change events from other components
  useEffect(() => {
    const handleThemeChange = (event: CustomEvent) => {
      const { module: changedModule } = event.detail || {};
      // Reapply if it's the same module or if it's global (affects all)
      if (changedModule === module || changedModule === 'global' || !changedModule) {
        applyTheme();
      }
    };

    window.addEventListener('ycc-theme-change', handleThemeChange as EventListener);
    
    return () => {
      window.removeEventListener('ycc-theme-change', handleThemeChange as EventListener);
    };
  }, [applyTheme, module]);

  // Listen for storage events (cross-tab sync)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('ycc-theme-')) {
        applyTheme();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [applyTheme]);

  return { applyTheme };
}
