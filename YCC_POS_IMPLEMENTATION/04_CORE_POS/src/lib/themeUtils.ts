// Theme Utility Functions for POS
// These functions help apply dynamic theme values from CSS variables

import { ThemeColors } from '../hooks/useTheme';

/**
 * Get a CSS variable value for a theme color
 */
export const getThemeColor = (colorName: keyof ThemeColors): string => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${colorName}`)
    .trim();
};

/**
 * Apply theme styles to an element
 */
export const applyThemeStyles = (
  element: HTMLElement,
  styles: Partial<Record<keyof ThemeColors, string>>
): void => {
  Object.entries(styles).forEach(([key, value]) => {
    if (value) {
      element.style.setProperty(`--color-${key}`, value);
    }
  });
};

/**
 * Get all theme colors as an object
 */
export const getAllThemeColors = (): Partial<ThemeColors> => {
  if (typeof window === 'undefined') return {};
  
  const colors: Partial<ThemeColors> = {};
  const colorKeys: (keyof ThemeColors)[] = [
    'primary', 'primaryLight', 'primaryDark', 'secondary', 'secondaryLight',
    'background', 'surface', 'card', 'textPrimary', 'textSecondary', 'textMuted',
    'border', 'borderLight', 'success', 'successLight', 'warning', 'warningLight',
    'error', 'errorLight', 'info', 'infoLight', 'sidebarBackground', 'sidebarText',
    'sidebarActive', 'sidebarActiveText', 'posHeader', 'posCartBackground',
    'posProductCard', 'posProductCardHover', 'posButtonPrimary', 'posButtonSecondary',
  ];
  
  colorKeys.forEach(key => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${key}`)
      .trim();
    if (value) {
      colors[key] = value;
    }
  });
  
  return colors;
};

/**
 * Check if dark mode is active
 */
export const isDarkMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark') ||
    getComputedStyle(document.documentElement).getPropertyValue('--theme-is-dark').trim() === '1';
};

/**
 * Get theme-aware class names
 */
export const themeClass = {
  // Backgrounds
  bg: {
    primary: 'bg-theme-primary',
    success: 'bg-theme-success',
    successLight: 'bg-theme-success-light',
    warning: 'bg-theme-warning',
    warningLight: 'bg-theme-warning-light',
    error: 'bg-theme-error',
    errorLight: 'bg-theme-error-light',
    info: 'bg-theme-info',
    infoLight: 'bg-theme-info-light',
    background: 'bg-theme-background',
    surface: 'bg-theme-surface',
    card: 'bg-theme-card',
    posHeader: 'bg-theme-pos-header',
    posCart: 'bg-theme-pos-cart',
    posProduct: 'bg-theme-pos-product',
    sidebar: 'bg-theme-sidebar',
    sidebarActive: 'bg-theme-sidebar-active',
  },
  
  // Text
  text: {
    primary: 'text-theme-primary',
    success: 'text-theme-success',
    warning: 'text-theme-warning',
    error: 'text-theme-error',
    info: 'text-theme-info',
    primaryText: 'text-theme-text',
    secondary: 'text-theme-text-secondary',
    muted: 'text-theme-text-muted',
    sidebar: 'text-theme-sidebar',
    sidebarActive: 'text-theme-sidebar-active',
  },
  
  // Borders
  border: {
    default: 'border-theme',
    light: 'border-theme-light',
    primary: 'border-theme-primary',
    success: 'border-theme-success',
    warning: 'border-theme-warning',
    error: 'border-theme-error',
  },
  
  // Interactive
  hover: {
    primary: 'hover:bg-theme-primary',
    success: 'hover:bg-theme-success',
    surface: 'hover:bg-theme-surface',
  },
  
  focus: {
    primary: 'focus:border-theme-primary',
  },
};

/**
 * Get inline styles for dynamic theming (useful for React style prop)
 */
export const themeStyle = {
  bg: (color: keyof ThemeColors): React.CSSProperties => ({
    backgroundColor: `var(--color-${color})`,
  }),
  text: (color: keyof ThemeColors): React.CSSProperties => ({
    color: `var(--color-${color})`,
  }),
  border: (color: keyof ThemeColors): React.CSSProperties => ({
    borderColor: `var(--color-${color})`,
  }),
};

/**
 * Badge style helpers
 */
export const badgeStyle = {
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

/**
 * Button style helpers
 */
export const buttonStyle = {
  primary: 'btn-theme-primary',
  secondary: 'btn-theme-secondary',
};

/**
 * Utility to merge class names with theme classes
 */
export const cx = (...classes: (string | undefined | false | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};
