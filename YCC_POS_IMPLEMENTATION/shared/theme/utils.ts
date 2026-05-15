/**
 * Utilidades para el sistema de temas YCC POS
 */

import type { ThemeMode, ThemeModule, ThemeSystemConfig, ThemeTokens, ModuleThemeConfig } from './types';

/**
 * Configuración por defecto del sistema de temas
 */
export const defaultThemeConfig: ThemeSystemConfig = {
  global: {
    mode: 'light',
    useGlobal: false,
    customColors: undefined
  },
  admin: {
    mode: 'light',
    useGlobal: true,
    customColors: undefined
  },
  pos: {
    mode: 'light',
    useGlobal: true,
    customColors: undefined
  },
  kds: {
    mode: 'light',
    useGlobal: true,
    customColors: undefined
  },
  lastUpdated: new Date(),
  version: '2.0.0'
};

/**
 * Tokens por defecto para modo claro
 */
export const defaultLightTokens: ThemeTokens = {
  background: '0 0% 100%',
  foreground: '222.2 84% 4.9%',
  card: '0 0% 100%',
  cardForeground: '222.2 84% 4.9%',
  popover: '0 0% 100%',
  popoverForeground: '222.2 84% 4.9%',
  primary: '221.2 83.2% 53.3%',
  primaryForeground: '210 40% 98%',
  primaryHover: '221.2 83.2% 45%',
  primaryActive: '221.2 83.2% 38%',
  secondary: '210 40% 96.1%',
  secondaryForeground: '222.2 47.4% 11.2%',
  secondaryHover: '210 40% 92%',
  muted: '210 40% 96.1%',
  mutedForeground: '215.4 16.3% 46.9%',
  accent: '210 40% 96.1%',
  accentForeground: '222.2 47.4% 11.2%',
  destructive: '0 84.2% 60.2%',
  destructiveForeground: '210 40% 98%',
  success: '142.1 76.2% 36.3%',
  successForeground: '355.7 100% 97.3%',
  successLight: '142.1 76.2% 95%',
  warning: '38 92% 50%',
  warningForeground: '48 96% 89%',
  warningLight: '48 100% 96%',
  danger: '0 84.2% 60.2%',
  dangerForeground: '210 40% 98%',
  dangerLight: '0 86% 97%',
  info: '199 89% 48%',
  infoForeground: '210 40% 98%',
  infoLight: '204 94% 94%',
  border: '214.3 31.8% 91.4%',
  borderHover: '214.3 31.8% 80%',
  input: '214.3 31.8% 91.4%',
  inputBackground: '0 0% 100%',
  ring: '221.2 83.2% 53.3%',
  ringOffset: '0 0% 100%',
  sidebar: '0 0% 98%',
  sidebarForeground: '222.2 84% 4.9%',
  sidebarBorder: '214.3 31.8% 91.4%',
  sidebarHover: '210 40% 96.1%',
  sidebarActive: '221.2 83.2% 53.3%',
  sidebarActiveForeground: '210 40% 98%',
  navbar: '0 0% 100%',
  navbarForeground: '222.2 84% 4.9%',
  navbarBorder: '214.3 31.8% 91.4%',
  disabled: '214.3 31.8% 91.4%',
  disabledForeground: '215.4 16.3% 46.9%',
  placeholder: '215.4 16.3% 46.9%'
};

/**
 * Tokens por defecto para modo oscuro
 */
export const defaultDarkTokens: ThemeTokens = {
  background: '222.2 84% 4.9%',
  foreground: '210 40% 98%',
  card: '222.2 84% 8%',
  cardForeground: '210 40% 98%',
  popover: '222.2 84% 8%',
  popoverForeground: '210 40% 98%',
  primary: '217.2 91.2% 59.8%',
  primaryForeground: '222.2 47.4% 11.2%',
  primaryHover: '217.2 91.2% 65%',
  primaryActive: '217.2 91.2% 70%',
  secondary: '217.2 32.6% 17.5%',
  secondaryForeground: '210 40% 98%',
  secondaryHover: '217.2 32.6% 22%',
  muted: '217.2 32.6% 17.5%',
  mutedForeground: '215 20.2% 65.1%',
  accent: '217.2 32.6% 17.5%',
  accentForeground: '210 40% 98%',
  destructive: '0 62.8% 30.6%',
  destructiveForeground: '210 40% 98%',
  success: '142.1 70.6% 45.3%',
  successForeground: '144.9 80.4% 10%',
  successLight: '142.1 70.6% 15%',
  warning: '38 92% 50%',
  warningForeground: '48 96% 10%',
  warningLight: '48 100% 15%',
  danger: '0 62.8% 30.6%',
  dangerForeground: '210 40% 98%',
  dangerLight: '0 62.8% 15%',
  info: '199 89% 48%',
  infoForeground: '210 40% 98%',
  infoLight: '199 89% 15%',
  border: '217.2 32.6% 17.5%',
  borderHover: '217.2 32.6% 25%',
  input: '217.2 32.6% 17.5%',
  inputBackground: '222.2 84% 8%',
  ring: '217.2 91.2% 59.8%',
  ringOffset: '222.2 84% 4.9%',
  sidebar: '222.2 84% 6%',
  sidebarForeground: '210 40% 98%',
  sidebarBorder: '217.2 32.6% 17.5%',
  sidebarHover: '217.2 32.6% 17.5%',
  sidebarActive: '217.2 91.2% 59.8%',
  sidebarActiveForeground: '222.2 47.4% 11.2%',
  navbar: '222.2 84% 6%',
  navbarForeground: '210 40% 98%',
  navbarBorder: '217.2 32.6% 17.5%',
  disabled: '217.2 32.6% 17.5%',
  disabledForeground: '215 20.2% 40%',
  placeholder: '215 20.2% 65.1%'
};

/**
 * Aplica el tema al DOM actualizando CSS variables y data attributes
 */
export function applyThemeToDOM(
  module: ThemeModule,
  mode: ThemeMode,
  customColors?: Partial<ThemeTokens>
): void {
  const root = document.documentElement;
  
  // Establecer data attributes
  root.setAttribute('data-theme', mode);
  root.setAttribute('data-module', module);
  
  // Si hay colores personalizados, aplicarlos
  if (customColors) {
    Object.entries(customColors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--${kebabCase(key)}`, value);
      }
    });
  }
  
  console.log(`🎨 [Theme] Aplicado: module=${module}, mode=${mode}`);
}

/**
 * Convierte camelCase a kebab-case
 */
function kebabCase(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Obtiene el tema almacenado en localStorage
 */
export function getStoredTheme(): ThemeSystemConfig | null {
  try {
    const stored = localStorage.getItem('ycc-theme-system-v2');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        lastUpdated: new Date(parsed.lastUpdated)
      };
    }
  } catch (error) {
    console.error('🎨 [Theme] Error leyendo localStorage:', error);
  }
  return null;
}

/**
 * Guarda el tema en localStorage
 */
export function saveThemeToStorage(config: ThemeSystemConfig): void {
  try {
    localStorage.setItem('ycc-theme-system-v2', JSON.stringify(config));
  } catch (error) {
    console.error('🎨 [Theme] Error guardando en localStorage:', error);
  }
}

/**
 * Calcula el contraste entre dos colores HSL
 * Retorna un ratio de contraste (1-21)
 */
export function calculateContrast(hsl1: string, hsl2: string): number {
  const rgb1 = hslToRgb(hsl1);
  const rgb2 = hslToRgb(hsl2);
  
  const l1 = relativeLuminance(rgb1);
  const l2 = relativeLuminance(rgb2);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convierte HSL a RGB
 */
function hslToRgb(hsl: string): [number, number, number] {
  const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
  const sNorm = s / 100;
  const lNorm = l / 100;
  
  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }
  
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255)
  ];
}

/**
 * Calcula la luminancia relativa de un color RGB
 */
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Verifica si un contraste cumple con WCAG AA (mínimo 4.5:1 para texto normal)
 */
export function meetsWCAG_AA(contrast: number): boolean {
  return contrast >= 4.5;
}

/**
 * Verifica si un contraste cumple con WCAG AAA (mínimo 7:1 para texto normal)
 */
export function meetsWCAG_AAA(contrast: number): boolean {
  return contrast >= 7;
}
