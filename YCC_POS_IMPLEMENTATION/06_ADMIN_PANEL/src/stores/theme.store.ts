import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  ThemeConfig, 
  ThemeModule,
  ModuleConfig,
  GlobalUiConfig,
  defaultGlobalUiConfig,
  defaultTheme,
  defaultSemanticLight,
  defaultSemanticDark
} from '../types/theme.types';
import { API_URL } from '../lib/config';

interface ThemeState {
  // Current complete config
  config: ThemeConfig;
  
  // UI State for Editor
  activeModule: ThemeModule;
  isPreviewMode: boolean;
  globalUi: GlobalUiConfig;
  
  // Actions
  setActiveModule: (module: ThemeModule) => void;
  updateModuleConfig: (module: ThemeModule, partial: Partial<ModuleConfig>) => void;
  updateBranding: (branding: Partial<ThemeConfig['branding']>) => void;
  setPreviewMode: (enabled: boolean) => void;
  updateGlobalUi: (partial: Partial<GlobalUiConfig>) => void;
  
  // Helper to get effective theme for a module
  getEffectiveConfig: (module: ThemeModule) => ModuleConfig;
  
  // Reset
  resetModule: (module: ThemeModule) => void;
  resetAll: () => void;
  
  // Export/Import
  exportTheme: () => string;
  importTheme: (json: string) => boolean;
  
  // Backend sync
  saveToBackend: () => Promise<void>;
  loadFromBackend: () => Promise<void>;
}

// Helper function to save theme to backend
const saveThemeToBackend = async (config: ThemeConfig, module: ThemeModule) => {
  try {
    await fetch(`${API_URL}/theme/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config, module })
    });
  } catch (error) {
    console.error('Error saving theme to backend:', error);
  }
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      config: {
        ...defaultTheme,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as ThemeConfig,
      
      activeModule: 'global',
      isPreviewMode: false,
      globalUi: defaultGlobalUiConfig,

      setActiveModule: (module) => set({ activeModule: module }),

      updateModuleConfig: (module, partial) => {
        set((state) => {
          const newConfig = { ...state.config };
          newConfig[module] = {
            ...newConfig[module],
            ...partial,
            colors: { ...newConfig[module].colors, ...partial.colors },
            typography: { ...newConfig[module].typography, ...partial.typography },
            borderRadius: { ...newConfig[module].borderRadius, ...partial.borderRadius },
          };
          newConfig.updatedAt = new Date();

          // Broadcast change to localStorage for POS/KDS isolation
          if (typeof window !== 'undefined') {
            localStorage.setItem(`ycc-theme-${module}`, JSON.stringify(get().getEffectiveConfig(module)));
            window.dispatchEvent(new CustomEvent('ycc-theme-change', { detail: { module, config: newConfig[module] } }));
          }

          // Save to backend
          saveThemeToBackend(newConfig, module);

          return { config: newConfig };
        });
      },

      updateBranding: (branding) => {
        set((state) => ({
          config: {
            ...state.config,
            branding: { ...state.config.branding, ...branding },
            updatedAt: new Date(),
          }
        }));
      },

      getEffectiveConfig: (module) => {
        const { config } = get();
        if (module === 'global') return config.global;

        const global = config.global;
        const local = config[module];

        // Merge logic: local overrides global
        return {
          ...global,
          ...local,
          colors: { ...global.colors, ...local.colors },
          typography: { ...global.typography, ...local.typography },
          borderRadius: { ...global.borderRadius, ...local.borderRadius },
          isDark: local.isDark ?? global.isDark,
          shadows: local.shadows ?? global.shadows,
        } as ModuleConfig;
      },

      setPreviewMode: (enabled) => set({ isPreviewMode: enabled }),
      
      updateGlobalUi: (partial) => {
        set((state) => ({
          globalUi: { ...state.globalUi, ...partial }
        }));
      },

      resetModule: (module) => {
        set((state) => {
          const newConfig = { ...state.config };
          if (module === 'global') {
            newConfig.global = defaultTheme.global;
          } else {
            newConfig[module] = { ...defaultTheme[module], colors: {} };
          }
          return { config: newConfig };
        });
      },

      resetAll: () => set({ 
        config: { ...defaultTheme, id: generateId(), createdAt: new Date(), updatedAt: new Date() } as ThemeConfig 
      }),

      exportTheme: () => JSON.stringify(get().config),
      
      importTheme: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (parsed.global && parsed.admin) {
            set({ config: { ...parsed, updatedAt: new Date() } });
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      saveToBackend: async () => {
        const { config, activeModule } = get();
        await saveThemeToBackend(config, activeModule);
      },

      loadFromBackend: async () => {
        try {
          const response = await fetch(`${API_URL}/theme/config`);
          if (response.ok) {
            const { data } = await response.json();
            if (data) {
              set({ config: { ...data, updatedAt: new Date(data.updatedAt) } });
            }
          }
        } catch (error) {
          console.error('Error loading theme from backend:', error);
        }
      },
    }),
    {
      name: 'ycc-theme-storage-v2',
    }
  )
);
