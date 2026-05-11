import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme, ModuleTheme } from '../hooks/useTheme';

interface ThemeContextType {
  theme: ModuleTheme | null;
  isDark: boolean;
  cssVar: (name: string) => string;
  getColor: (key: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, isDark, cssVar } = useTheme();

  const getColor = (key: string) => {
    if (!theme) return 'transparent';
    return theme.colors[key] || 'transparent';
  };

  const value = {
    theme,
    isDark,
    cssVar,
    getColor
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}

export default ThemeProvider;
