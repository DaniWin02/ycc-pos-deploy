/**
 * Tipos TypeScript para el sistema de temas YCC POS
 */

export type ThemeMode = 'light' | 'dark';
export type ThemeModule = 'admin' | 'pos' | 'kds' | 'global';

/**
 * Configuración de tema para un módulo específico
 */
export interface ModuleThemeConfig {
  mode: ThemeMode;
  customColors?: Partial<ThemeTokens>;
  useGlobal: boolean; // Si true, hereda del tema global
}

/**
 * Tokens de color semánticos (valores HSL sin hsl())
 * Ejemplo: "221.2 83.2% 53.3%"
 */
export interface ThemeTokens {
  // Superficies
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Primarios
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  primaryActive: string;
  
  // Secundarios
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
  
  // Muted
  muted: string;
  mutedForeground: string;
  
  // Accent
  accent: string;
  accentForeground: string;
  
  // Destructive
  destructive: string;
  destructiveForeground: string;
  
  // Estados
  success: string;
  successForeground: string;
  successLight: string;
  warning: string;
  warningForeground: string;
  warningLight: string;
  danger: string;
  dangerForeground: string;
  dangerLight: string;
  info: string;
  infoForeground: string;
  infoLight: string;
  
  // Bordes e inputs
  border: string;
  borderHover: string;
  input: string;
  inputBackground: string;
  
  // Ring
  ring: string;
  ringOffset: string;
  
  // Sidebar
  sidebar: string;
  sidebarForeground: string;
  sidebarBorder: string;
  sidebarHover: string;
  sidebarActive: string;
  sidebarActiveForeground: string;
  
  // Navbar
  navbar: string;
  navbarForeground: string;
  navbarBorder: string;
  
  // Disabled
  disabled: string;
  disabledForeground: string;
  
  // Placeholder
  placeholder: string;
}

/**
 * Configuración completa del sistema de temas
 */
export interface ThemeSystemConfig {
  global: ModuleThemeConfig;
  admin: ModuleThemeConfig;
  pos: ModuleThemeConfig;
  kds: ModuleThemeConfig;
  lastUpdated: Date;
  version: string;
}

/**
 * Evento de cambio de tema para sincronización
 */
export interface ThemeChangeEvent {
  module: ThemeModule;
  config: ModuleThemeConfig;
  timestamp: Date;
  source: 'user' | 'sync' | 'init';
}

/**
 * Preset de tema predefinido
 */
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  module: ThemeModule;
  config: ModuleThemeConfig;
  preview?: string; // URL de imagen de preview
}
