// Theme Configuration Types
export interface ThemeColors {
  // Primary brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Secondary/accent colors
  secondary: string;
  secondaryLight: string;
  
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // State colors
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;
  
  // Sidebar specific
  sidebarBackground: string;
  sidebarText: string;
  sidebarActive: string;
  sidebarActiveText: string;
  
  // POS specific
  posHeader: string;
  posCartBackground: string;
  posProductCard: string;
  posProductCardHover: string;
  posButtonPrimary: string;
  posButtonSecondary: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSizeBase: string;
  fontSizeSm: string;
  fontSizeLg: string;
  fontSizeXl: string;
  fontWeightNormal: number;
  fontWeightMedium: number;
  fontWeightBold: number;
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

export interface ThemeBranding {
  // Logo configuration
  logoUrl: string;
  logoWidth: number;
  logoHeight: number;
  faviconUrl: string;
  
  // App icons (for POS and Admin)
  posIconUrl: string;
  posIconColor: string;
  useCustomPosIcon: boolean;
  
  // Company info shown in receipts and UI
  companyName: string;
  companyTagline: string;
  showLogoInHeader: boolean;
  showLogoInReceipt: boolean;
  showLogoInLogin: boolean;
  
  // Icon style (outline, filled, two-tone)
  iconStyle: 'outline' | 'filled' | 'two-tone';
  
  // Custom app icon (for mobile/PWA)
  appIcon192: string;
  appIcon512: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: boolean;
  animations: boolean;
  isDark: boolean;
  branding: ThemeBranding;
  createdAt: Date;
  updatedAt: Date;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: string;
  config: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'>;
}

// Default theme values
export const defaultThemeColors: ThemeColors = {
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

export const defaultTypography: ThemeTypography = {
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSizeBase: '16px',
  fontSizeSm: '14px',
  fontSizeLg: '18px',
  fontSizeXl: '20px',
  fontWeightNormal: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
};

export const defaultSpacing: ThemeSpacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
};

export const defaultBorderRadius: ThemeBorderRadius = {
  none: '0',
  sm: '0.25rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  full: '9999px',
};

export const defaultBranding: ThemeBranding = {
  logoUrl: '',
  logoWidth: 120,
  logoHeight: 40,
  faviconUrl: '',
  posIconUrl: '',
  posIconColor: '#10B981',
  useCustomPosIcon: false,
  companyName: 'Mi Negocio',
  companyTagline: '',
  showLogoInHeader: true,
  showLogoInReceipt: true,
  showLogoInLogin: true,
  iconStyle: 'outline',
  appIcon192: '',
  appIcon512: '',
};

export const defaultTheme: Omit<ThemeConfig, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Tema Predeterminado',
  colors: defaultThemeColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
  borderRadius: defaultBorderRadius,
  shadows: true,
  animations: true,
  isDark: false,
  branding: defaultBranding,
};
