import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme, ThemeConfig, ThemeColors } from '../hooks/useTheme';

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (partial: Partial<ThemeConfig>) => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  resetTheme: () => void;
  getColor: (colorKey: keyof ThemeColors, fallback?: string) => string;
  cssVar: (name: string) => string;
  isDark: boolean;
  shadows: boolean;
  animations: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <ThemeContext.Provider value={theme}>
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
