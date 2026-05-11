// Theme Configuration Types - Modular & Accessible
export type ThemeModule = 'global' | 'admin' | 'pos' | 'kds';

export interface SemanticColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
}

export interface ThemeColors extends SemanticColors {
  // Legacy support & specific brand colors
  primaryLight: string;
  primaryDark: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSizeBase: string;
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightBold: number;
}

export interface ThemeSpacing {
  base: string; // Base spacing unit
}

export interface ThemeBorderRadius {
  base: string; // Base radius unit
}

export interface ModuleConfig {
  colors: Partial<ThemeColors>;
  typography: Partial<ThemeTypography>;
  borderRadius: Partial<ThemeBorderRadius>;
  isDark: boolean;
  shadows: boolean;
}

export interface ThemeConfig {
  id: string;
  name: string;
  global: ModuleConfig;
  admin: ModuleConfig;
  pos: ModuleConfig;
  kds: ModuleConfig;
  branding: ThemeBranding;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemeBranding {
  logoUrl: string;
  faviconUrl: string;
  companyName: string;
  companyTagline: string;
  showLogoInHeader: boolean;
}

export interface GlobalUiConfig {
  density: 'compact' | 'comfortable' | 'spacious';
  uiScale: 90 | 100 | 110 | 125;
  borderRadiusScale: 80 | 100 | 120;
  animationsLevel: 'off' | 'reduced' | 'full';
  kdsLayout: 'grid' | 'list' | 'compact';
  posLayout: 'grid' | 'list';
}

// --- DEFAULT VALUES (LIGHT) ---
export const defaultSemanticLight: SemanticColors = {
  background: '#ffffff',
  foreground: '#0f172a',
  card: '#ffffff',
  cardForeground: '#0f172a',
  popover: '#ffffff',
  popoverForeground: '#0f172a',
  primary: '#059669', // emerald-600 - Verde Country Club
  primaryForeground: '#ffffff',
  secondary: '#f1f5f9',
  secondaryForeground: '#0f172a',
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  accent: '#f1f5f9',
  accentForeground: '#0f172a',
  destructive: '#ef4444',
  destructiveForeground: '#ffffff',
  border: '#e2e8f0',
  input: '#e2e8f0',
  ring: '#059669', // emerald-600
};

// --- DEFAULT VALUES (DARK) ---
export const defaultSemanticDark: SemanticColors = {
  background: '#020617',
  foreground: '#f8fafc',
  card: '#020617',
  cardForeground: '#f8fafc',
  popover: '#020617',
  popoverForeground: '#f8fafc',
  primary: '#10b981', // emerald-500 - Verde Country Club
  primaryForeground: '#0f172a',
  secondary: '#1e293b',
  secondaryForeground: '#f8fafc',
  muted: '#1e293b',
  mutedForeground: '#94a3b8',
  accent: '#1e293b',
  accentForeground: '#f8fafc',
  destructive: '#7f1d1d',
  destructiveForeground: '#f8fafc',
  border: '#1e293b',
  input: '#1e293b',
  ring: '#10b981', // emerald-500
};

export const defaultModuleConfig: ModuleConfig = {
  colors: {}, // Inherits from global
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSizeBase: '16px',
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  },
  borderRadius: {
    base: '0.5rem',
  },
  isDark: false,
  shadows: true,
};

export const defaultGlobalConfig: ModuleConfig = {
  ...defaultModuleConfig,
  colors: defaultSemanticLight,
};

export const defaultTheme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Default',
  global: defaultGlobalConfig,
  admin: { ...defaultModuleConfig, colors: {} },
  pos: { ...defaultModuleConfig, colors: {} },
  kds: { ...defaultModuleConfig, colors: {} },
  branding: {
    logoUrl: '',
    faviconUrl: '',
    companyName: 'Country Club POS',
    companyTagline: 'Gestión Integral',
    showLogoInHeader: true,
  },
};

export const defaultGlobalUiConfig: GlobalUiConfig = {
  density: 'comfortable',
  uiScale: 100,
  borderRadiusScale: 100,
  animationsLevel: 'full',
  kdsLayout: 'grid',
  posLayout: 'grid',
};
