import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ThemeConfig, 
  ThemeColors, 
  ThemeTypography, 
  ThemeSpacing, 
  ThemeBorderRadius,
  ThemeBranding,
  defaultTheme 
} from '../types/theme.types';

interface ThemeState {
  // Current active theme
  currentTheme: ThemeConfig;
  
  // Theme history for undo/redo
  themeHistory: ThemeConfig[];
  historyIndex: number;
  
  // Actions
  setTheme: (theme: Partial<ThemeConfig>) => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  updateTypography: (typography: Partial<ThemeTypography>) => void;
  updateSpacing: (spacing: Partial<ThemeSpacing>) => void;
  updateBorderRadius: (borderRadius: Partial<ThemeBorderRadius>) => void;
  updateBranding: (branding: Partial<ThemeBranding>) => void;
  toggleShadows: () => void;
  toggleAnimations: () => void;
  toggleDarkMode: () => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  
  // Reset to default
  resetToDefault: () => void;
  
  // Export/Import
  exportTheme: () => string;
  importTheme: (json: string) => boolean;
  
  // Apply to POS (broadcast)
  applyToPOS: () => void;
  
  // Preview
  isPreviewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const createThemeConfig = (partial: Partial<ThemeConfig> = {}): ThemeConfig => ({
  id: partial.id || generateId(),
  name: partial.name || defaultTheme.name,
  colors: { ...defaultTheme.colors, ...partial.colors },
  typography: { ...defaultTheme.typography, ...partial.typography },
  spacing: { ...defaultTheme.spacing, ...partial.spacing },
  borderRadius: { ...defaultTheme.borderRadius, ...partial.borderRadius },
  shadows: partial.shadows ?? defaultTheme.shadows,
  animations: partial.animations ?? defaultTheme.animations,
  isDark: partial.isDark ?? defaultTheme.isDark,
  branding: { ...defaultTheme.branding, ...partial.branding },
  createdAt: partial.createdAt || new Date(),
  updatedAt: new Date(),
});

// Broadcast theme changes to other tabs/windows
const broadcastThemeChange = (theme: ThemeConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ycc-pos-theme', JSON.stringify(theme));
    window.dispatchEvent(new CustomEvent('ycc-theme-change', { detail: theme }));
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentTheme: createThemeConfig(),
      themeHistory: [createThemeConfig()],
      historyIndex: 0,
      isPreviewMode: false,

      setTheme: (theme) => {
        const newTheme = createThemeConfig({
          ...get().currentTheme,
          ...theme,
          updatedAt: new Date(),
        });
        
        const newHistory = get().themeHistory.slice(0, get().historyIndex + 1);
        newHistory.push(newTheme);
        
        set({
          currentTheme: newTheme,
          themeHistory: newHistory.slice(-20), // Keep last 20 states
          historyIndex: newHistory.length - 1,
        });
        
        broadcastThemeChange(newTheme);
      },

      updateColors: (colors) => {
        get().setTheme({
          colors: { ...get().currentTheme.colors, ...colors },
        });
      },

      updateTypography: (typography) => {
        get().setTheme({
          typography: { ...get().currentTheme.typography, ...typography },
        });
      },

      updateSpacing: (spacing) => {
        get().setTheme({
          spacing: { ...get().currentTheme.spacing, ...spacing },
        });
      },

      updateBorderRadius: (borderRadius) => {
        get().setTheme({
          borderRadius: { ...get().currentTheme.borderRadius, ...borderRadius },
        });
      },

      updateBranding: (branding) => {
        get().setTheme({
          branding: { ...get().currentTheme.branding, ...branding },
        });
      },

      toggleShadows: () => {
        get().setTheme({ shadows: !get().currentTheme.shadows });
      },

      toggleAnimations: () => {
        get().setTheme({ animations: !get().currentTheme.animations });
      },

      toggleDarkMode: () => {
        const isDark = !get().currentTheme.isDark;
        const colors = { ...get().currentTheme.colors };
        
        // Auto-adjust colors for dark mode
        if (isDark) {
          colors.background = '#111827';
          colors.surface = '#1F2937';
          colors.card = '#374151';
          colors.textPrimary = '#F9FAFB';
          colors.textSecondary = '#D1D5DB';
          colors.textMuted = '#9CA3AF';
          colors.border = '#374151';
          colors.borderLight = '#4B5563';
          colors.sidebarBackground = '#1F2937';
          colors.sidebarText = '#D1D5DB';
          colors.sidebarActive = '#2563EB';
          colors.sidebarActiveText = '#FFFFFF';
          colors.posCartBackground = '#1F2937';
          colors.posProductCard = '#374151';
        } else {
          // Revert to light mode defaults
          Object.assign(colors, defaultTheme.colors);
        }
        
        get().setTheme({ isDark, colors });
      },

      undo: () => {
        const { historyIndex, themeHistory } = get();
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          const prevTheme = themeHistory[newIndex];
          set({
            currentTheme: prevTheme,
            historyIndex: newIndex,
          });
          broadcastThemeChange(prevTheme);
        }
      },

      redo: () => {
        const { historyIndex, themeHistory } = get();
        if (historyIndex < themeHistory.length - 1) {
          const newIndex = historyIndex + 1;
          const nextTheme = themeHistory[newIndex];
          set({
            currentTheme: nextTheme,
            historyIndex: newIndex,
          });
          broadcastThemeChange(nextTheme);
        }
      },

      canUndo: () => get().historyIndex > 0,
      canRedo: () => get().historyIndex < get().themeHistory.length - 1,

      resetToDefault: () => {
        get().setTheme(defaultTheme);
      },

      exportTheme: () => {
        const theme = get().currentTheme;
        return JSON.stringify(theme, null, 2);
      },

      importTheme: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (parsed.colors && parsed.typography) {
            get().setTheme(parsed);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      applyToPOS: () => {
        broadcastThemeChange(get().currentTheme);
      },

      setPreviewMode: (enabled) => {
        set({ isPreviewMode: enabled });
      },
    }),
    {
      name: 'ycc-admin-theme',
      partialize: (state) => ({ 
        currentTheme: state.currentTheme,
        themeHistory: state.themeHistory,
        historyIndex: state.historyIndex,
      }),
    }
  )
);
