import { useState, useEffect, useCallback } from 'react';

// Theme configuration interface (matching Admin Panel)
export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  background: string;
  surface: string;
  card: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderLight: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  sidebarBackground: string;
  sidebarText: string;
  sidebarActive: string;
  sidebarActiveText: string;
  posHeader: string;
  posCartBackground: string;
  posProductCard: string;
  posProductCardHover: string;
  posButtonPrimary: string;
  posButtonSecondary: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  shadows: boolean;
  animations: boolean;
  isDark: boolean;
  updatedAt: Date;
}

// Default theme values
const defaultColors: ThemeColors = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  secondary: '#8B5CF6',
  secondaryLight: '#A78BFA',
  background: '#F3F4F6',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#4B5563',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  sidebarBackground: '#FFFFFF',
  sidebarText: '#374151',
  sidebarActive: '#EFF6FF',
  sidebarActiveText: '#2563EB',
  posHeader: '#F9FAFB',
  posCartBackground: '#FFFFFF',
  posProductCard: '#FFFFFF',
  posProductCardHover: '#F0FDF4',
  posButtonPrimary: '#10B981',
  posButtonSecondary: '#6B7280',
};

const defaultTheme: ThemeConfig = {
  id: 'default',
  name: 'Tema Predeterminado',
  colors: defaultColors,
  shadows: true,
  animations: true,
  isDark: false,
  updatedAt: new Date(),
};

// Theme hook for POS
export function useTheme() {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    // Load from localStorage on init
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ycc-pos-theme');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return { ...defaultTheme, ...parsed };
        } catch {
          return defaultTheme;
        }
      }
    }
    return defaultTheme;
  });

  const [isLoading, setIsLoading] = useState(false);

  // Listen for theme changes from other tabs/windows (Admin Panel)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ycc-pos-theme' && e.newValue) {
        try {
          const newTheme = JSON.parse(e.newValue);
          setTheme(prev => ({ ...prev, ...newTheme }));
        } catch {
          console.error('Failed to parse theme from storage');
        }
      }
    };

    const handleCustomEvent = (e: CustomEvent<ThemeConfig>) => {
      setTheme(prev => ({ ...prev, ...e.detail }));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('ycc-theme-change' as any, handleCustomEvent as any);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ycc-theme-change' as any, handleCustomEvent as any);
    };
  }, []);

  // Apply theme colors as CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    // Set all theme colors as CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Set theme flags
    root.style.setProperty('--theme-shadows', theme.shadows ? '1' : '0');
    root.style.setProperty('--theme-animations', theme.animations ? '1' : '0');
    root.style.setProperty('--theme-is-dark', theme.isDark ? '1' : '0');

    // Apply dark mode class
    if (theme.isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const updateTheme = useCallback((partial: Partial<ThemeConfig>) => {
    setTheme(prev => {
      const updated = { ...prev, ...partial, updatedAt: new Date() };
      localStorage.setItem('ycc-pos-theme', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateColors = useCallback((colors: Partial<ThemeColors>) => {
    setTheme(prev => {
      const updated = { 
        ...prev, 
        colors: { ...prev.colors, ...colors },
        updatedAt: new Date() 
      };
      localStorage.setItem('ycc-pos-theme', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetTheme = useCallback(() => {
    localStorage.removeItem('ycc-pos-theme');
    setTheme(defaultTheme);
  }, []);

  // Helper to get color with fallback
  const getColor = useCallback((colorKey: keyof ThemeColors, fallback?: string): string => {
    return theme.colors[colorKey] || fallback || '#000000';
  }, [theme.colors]);

  // CSS variable string helper
  const cssVar = useCallback((name: string) => {
    return `var(--color-${name})`;
  }, []);

  return {
    theme,
    isLoading,
    updateTheme,
    updateColors,
    resetTheme,
    getColor,
    cssVar,
    isDark: theme.isDark,
    shadows: theme.shadows,
    animations: theme.animations,
  };
}

// Theme class helpers
export const themeClasses = {
  // Button variants
  buttonPrimary: (colors: ThemeColors) => ({
    backgroundColor: colors.posButtonPrimary,
    color: '#FFFFFF',
  }),
  buttonSecondary: (colors: ThemeColors) => ({
    backgroundColor: colors.posButtonSecondary,
    color: '#FFFFFF',
  }),
  
  // Card variants
  card: (colors: ThemeColors) => ({
    backgroundColor: colors.card,
    borderColor: colors.border,
  }),
  
  // Text variants
  textPrimary: (colors: ThemeColors) => ({
    color: colors.textPrimary,
  }),
  textSecondary: (colors: ThemeColors) => ({
    color: colors.textSecondary,
  }),
  textMuted: (colors: ThemeColors) => ({
    color: colors.textMuted,
  }),
  
  // State badges
  success: (colors: ThemeColors) => ({
    backgroundColor: colors.successLight,
    color: colors.success,
  }),
  warning: (colors: ThemeColors) => ({
    backgroundColor: colors.warningLight,
    color: colors.warning,
  }),
  error: (colors: ThemeColors) => ({
    backgroundColor: colors.errorLight,
    color: colors.error,
  }),
};

export default useTheme;
