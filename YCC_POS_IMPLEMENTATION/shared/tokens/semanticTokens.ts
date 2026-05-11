/**
 * Sistema de Design Tokens Semánticos - YCC POS
 * Compartido entre todos los módulos: Admin, POS, KDS
 */

// ============================================================================
// TIPOS DE TOKENS SEMÁNTICOS
// ============================================================================

export interface SemanticTokens {
  // Colores de Superficie
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Colores de Acción
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  primaryActive: string;
  
  secondary: string;
  secondaryForeground: string;
  secondaryHover: string;
  
  // Colores de Estado
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
  
  // Colores de UI
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  
  // Bordes y Inputs
  border: string;
  borderHover: string;
  input: string;
  inputBackground: string;
  ring: string;
  ringOffset: string;
  
  // Estados Especiales
  disabled: string;
  disabledForeground: string;
  placeholder: string;
  
  // Navegación
  navBackground: string;
  navForeground: string;
  navActive: string;
  navActiveForeground: string;
  navHover: string;
}

// ============================================================================
// TIPOGRAFÍA
// ============================================================================

export interface TypographyTokens {
  fontFamily: {
    sans: string;
    mono: string;
    display: string;
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    black: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

// ============================================================================
// ESPACIADO Y DIMENSIONES
// ============================================================================

export interface SpacingTokens {
  px: string;
  0: string;
  0.5: string;
  1: string;
  1.5: string;
  2: string;
  2.5: string;
  3: string;
  3.5: string;
  4: string;
  5: string;
  6: string;
  8: string;
  10: string;
  12: string;
  16: string;
  20: string;
  24: string;
  32: string;
  40: string;
  48: string;
  64: string;
}

// ============================================================================
// BORDES Y RADIOS
// ============================================================================

export interface BorderTokens {
  radius: {
    none: string;
    sm: string;
    base: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    full: string;
  };
  width: {
    default: string;
    thin: string;
    thick: string;
  };
}

// ============================================================================
// SOMBRAS
// ============================================================================

export interface ShadowTokens {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
}

// ============================================================================
// ANIMACIONES
// ============================================================================

export interface AnimationTokens {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    default: string;
    in: string;
    out: string;
    inOut: string;
  };
}

// ============================================================================
// CONFIGURACIÓN COMPLETA DE TEMA
// ============================================================================

export interface ThemeConfiguration {
  tokens: SemanticTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borders: BorderTokens;
  shadows: ShadowTokens;
  animations: AnimationTokens;
  isDark: boolean;
  density: 'compact' | 'comfortable' | 'spacious';
}

// ============================================================================
// VALORES POR DEFECTO - MODO CLARO
// ============================================================================

export const defaultLightTokens: SemanticTokens = {
  // Superficies
  background: '#ffffff',
  foreground: '#0f172a',
  card: '#ffffff',
  cardForeground: '#0f172a',
  popover: '#ffffff',
  popoverForeground: '#0f172a',
  
  // Acciones - Verde Country Club
  primary: '#059669', // emerald-600
  primaryForeground: '#ffffff',
  primaryHover: '#047857', // emerald-700
  primaryActive: '#065f46', // emerald-800
  
  secondary: '#f1f5f9',
  secondaryForeground: '#0f172a',
  secondaryHover: '#e2e8f0',
  
  // Estados
  success: '#10b981',
  successForeground: '#ffffff',
  successLight: '#d1fae5',
  
  warning: '#f59e0b',
  warningForeground: '#ffffff',
  warningLight: '#fef3c7',
  
  danger: '#ef4444',
  dangerForeground: '#ffffff',
  dangerLight: '#fee2e2',
  
  info: '#3b82f6',
  infoForeground: '#ffffff',
  infoLight: '#dbeafe',
  
  // UI
  muted: '#f1f5f9',
  mutedForeground: '#64748b',
  accent: '#f1f5f9',
  accentForeground: '#0f172a',
  
  // Bordes
  border: '#e2e8f0',
  borderHover: '#cbd5e1',
  input: '#e2e8f0',
  inputBackground: '#ffffff',
  ring: '#059669', // emerald-600
  ringOffset: '#ffffff',
  
  // Estados
  disabled: '#f1f5f9',
  disabledForeground: '#94a3b8',
  placeholder: '#94a3b8',
  
  // Navegación
  navBackground: '#f8fafc',
  navForeground: '#475569',
  navActive: '#d1fae5', // emerald-100
  navActiveForeground: '#059669', // emerald-600
  navHover: '#f1f5f9',
};

// ============================================================================
// VALORES POR DEFECTO - MODO OSCURO
// ============================================================================

export const defaultDarkTokens: SemanticTokens = {
  // Superficies
  background: '#0f172a',
  foreground: '#f8fafc',
  card: '#1e293b',
  cardForeground: '#f8fafc',
  popover: '#1e293b',
  popoverForeground: '#f8fafc',
  
  // Acciones - Verde Country Club
  primary: '#10b981', // emerald-500
  primaryForeground: '#0f172a',
  primaryHover: '#059669', // emerald-600
  primaryActive: '#047857', // emerald-700
  
  secondary: '#334155',
  secondaryForeground: '#f8fafc',
  secondaryHover: '#475569',
  
  // Estados
  success: '#34d399',
  successForeground: '#0f172a',
  successLight: '#064e3b',
  
  warning: '#fbbf24',
  warningForeground: '#0f172a',
  warningLight: '#78350f',
  
  danger: '#f87171',
  dangerForeground: '#0f172a',
  dangerLight: '#7f1d1d',
  
  info: '#60a5fa',
  infoForeground: '#0f172a',
  infoLight: '#1e3a8a',
  
  // UI
  muted: '#334155',
  mutedForeground: '#94a3b8',
  accent: '#334155',
  accentForeground: '#f8fafc',
  
  // Bordes
  border: '#334155',
  borderHover: '#475569',
  input: '#334155',
  inputBackground: '#1e293b',
  ring: '#10b981', // emerald-500
  ringOffset: '#0f172a',
  
  // Estados
  disabled: '#334155',
  disabledForeground: '#64748b',
  placeholder: '#64748b',
  
  // Navegación
  navBackground: '#1e293b',
  navForeground: '#94a3b8',
  navActive: '#064e3b', // emerald-900
  navActiveForeground: '#10b981', // emerald-500
  navHover: '#334155',
};

// ============================================================================
// TIPOGRAFÍA POR DEFECTO
// ============================================================================

export const defaultTypography: TypographyTokens = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'JetBrains Mono, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    display: 'Inter, system-ui, sans-serif',
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};

// ============================================================================
// ESPACIADO POR DEFECTO
// ============================================================================

export const defaultSpacing: SpacingTokens = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
  40: '10rem',
  48: '12rem',
  64: '16rem',
};

// ============================================================================
// BORDES POR DEFECTO
// ============================================================================

export const defaultBorders: BorderTokens = {
  radius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  width: {
    default: '1px',
    thin: '0.5px',
    thick: '2px',
  },
};

// ============================================================================
// SOMBRAS POR DEFECTO
// ============================================================================

export const defaultShadows: ShadowTokens = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

// ============================================================================
// ANIMACIONES POR DEFECTO
// ============================================================================

export const defaultAnimations: AnimationTokens = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

// ============================================================================
// CONFIGURACIONES COMPLETAS POR DEFECTO
// ============================================================================

export const defaultLightTheme: ThemeConfiguration = {
  tokens: defaultLightTokens,
  typography: defaultTypography,
  spacing: defaultSpacing,
  borders: defaultBorders,
  shadows: defaultShadows,
  animations: defaultAnimations,
  isDark: false,
  density: 'comfortable',
};

export const defaultDarkTheme: ThemeConfiguration = {
  tokens: defaultDarkTokens,
  typography: defaultTypography,
  spacing: defaultSpacing,
  borders: defaultBorders,
  shadows: defaultShadows,
  animations: defaultAnimations,
  isDark: true,
  density: 'comfortable',
};

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Convierte camelCase a kebab-case para variables CSS
 */
export function toCssVarName(key: string): string {
  return key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Genera las variables CSS a partir de los tokens
 */
export function generateCssVariables(tokens: SemanticTokens): Record<string, string> {
  const vars: Record<string, string> = {};
  
  Object.entries(tokens).forEach(([key, value]) => {
    const cssVar = toCssVarName(key);
    vars[`--${cssVar}`] = value;
  });
  
  return vars;
}

/**
 * Aplica las variables CSS al elemento root
 */
export function applyTokensToRoot(tokens: SemanticTokens): void {
  const root = document.documentElement;
  const vars = generateCssVariables(tokens);
  
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Mezcla dos configuraciones de tokens (para herencia)
 */
export function mergeTokens(
  global: Partial<SemanticTokens>,
  local: Partial<SemanticTokens>
): SemanticTokens {
  return {
    ...defaultLightTokens,
    ...global,
    ...local,
  } as SemanticTokens;
}
