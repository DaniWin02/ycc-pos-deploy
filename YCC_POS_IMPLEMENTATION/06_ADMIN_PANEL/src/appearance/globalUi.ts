import type { GlobalUiConfig } from '../types/theme.types';
import { defaultGlobalUiConfig } from '../types/theme.types';

const UI_CONFIG_KEY = 'ycc-ui-config';

const UI_SCALE_VALUES = [90, 100, 110, 125] as const;
const RADIUS_SCALE_VALUES = [80, 100, 120] as const;

const isDensity = (value: unknown): value is GlobalUiConfig['density'] =>
  value === 'compact' || value === 'comfortable' || value === 'spacious';

const isAnimationsLevel = (value: unknown): value is GlobalUiConfig['animationsLevel'] =>
  value === 'off' || value === 'reduced' || value === 'full';

const isKdsLayout = (value: unknown): value is GlobalUiConfig['kdsLayout'] =>
  value === 'grid' || value === 'list' || value === 'compact';

const isPosLayout = (value: unknown): value is GlobalUiConfig['posLayout'] =>
  value === 'grid' || value === 'list';

export const sanitizeGlobalUiConfig = (input: unknown): GlobalUiConfig => {
  const candidate = (input && typeof input === 'object') ? (input as Partial<GlobalUiConfig>) : {};

  return {
    density: isDensity(candidate.density) ? candidate.density : defaultGlobalUiConfig.density,
    uiScale: UI_SCALE_VALUES.includes(candidate.uiScale as any)
      ? (candidate.uiScale as GlobalUiConfig['uiScale'])
      : defaultGlobalUiConfig.uiScale,
    borderRadiusScale: RADIUS_SCALE_VALUES.includes(candidate.borderRadiusScale as any)
      ? (candidate.borderRadiusScale as GlobalUiConfig['borderRadiusScale'])
      : defaultGlobalUiConfig.borderRadiusScale,
    animationsLevel: isAnimationsLevel(candidate.animationsLevel)
      ? candidate.animationsLevel
      : defaultGlobalUiConfig.animationsLevel,
    kdsLayout: isKdsLayout(candidate.kdsLayout) ? candidate.kdsLayout : defaultGlobalUiConfig.kdsLayout,
    posLayout: isPosLayout(candidate.posLayout) ? candidate.posLayout : defaultGlobalUiConfig.posLayout,
    adminSidebarCollapsed: typeof candidate.adminSidebarCollapsed === 'boolean'
      ? candidate.adminSidebarCollapsed
      : defaultGlobalUiConfig.adminSidebarCollapsed,
  };
};

export const applyGlobalUiCssVariables = (config: GlobalUiConfig) => {
  const root = document.documentElement;
  root.style.setProperty('--ui-scale', String(config.uiScale / 100));
  root.style.setProperty('--radius-scale', String(config.borderRadiusScale / 100));
  root.style.setProperty('--motion-level', config.animationsLevel);
  root.setAttribute('data-motion-level', config.animationsLevel);
  root.style.setProperty('--density', config.density);
  root.setAttribute('data-density', config.density);
  root.setAttribute('data-pos-layout', config.posLayout);
  root.setAttribute('data-kds-layout', config.kdsLayout);
  root.setAttribute('data-admin-sidebar-collapsed', String(config.adminSidebarCollapsed));
};

export const readGlobalUiConfig = (): GlobalUiConfig => {
  try {
    const raw = localStorage.getItem(UI_CONFIG_KEY);
    if (!raw) return defaultGlobalUiConfig;
    return sanitizeGlobalUiConfig(JSON.parse(raw));
  } catch {
    return defaultGlobalUiConfig;
  }
};

export const emitGlobalUiConfig = (config: GlobalUiConfig) => {
  localStorage.setItem(UI_CONFIG_KEY, JSON.stringify(config));
  localStorage.setItem('ycc-ui-config-updated', Date.now().toString());
  window.dispatchEvent(new CustomEvent('ycc-ui-config-change', { detail: config }));
};
