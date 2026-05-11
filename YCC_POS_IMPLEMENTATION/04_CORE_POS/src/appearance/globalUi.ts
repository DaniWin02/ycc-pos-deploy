const DEFAULT_CONFIG = {
  density: 'comfortable',
  uiScale: 100,
  borderRadiusScale: 100,
  animationsLevel: 'full',
  kdsLayout: 'grid',
  posLayout: 'grid',
  adminSidebarCollapsed: false,
} as const;

const UI_SCALE_VALUES = [90, 100, 110, 125] as const;
const RADIUS_SCALE_VALUES = [80, 100, 120] as const;

const sanitize = (input: any) => ({
  density: ['compact', 'comfortable', 'spacious'].includes(input?.density) ? input.density : DEFAULT_CONFIG.density,
  uiScale: UI_SCALE_VALUES.includes(input?.uiScale) ? input.uiScale : DEFAULT_CONFIG.uiScale,
  borderRadiusScale: RADIUS_SCALE_VALUES.includes(input?.borderRadiusScale) ? input.borderRadiusScale : DEFAULT_CONFIG.borderRadiusScale,
  animationsLevel: ['off', 'reduced', 'full'].includes(input?.animationsLevel) ? input.animationsLevel : DEFAULT_CONFIG.animationsLevel,
  kdsLayout: ['grid', 'list', 'compact'].includes(input?.kdsLayout) ? input.kdsLayout : DEFAULT_CONFIG.kdsLayout,
  posLayout: ['grid', 'list'].includes(input?.posLayout) ? input.posLayout : DEFAULT_CONFIG.posLayout,
  adminSidebarCollapsed: typeof input?.adminSidebarCollapsed === 'boolean' ? input.adminSidebarCollapsed : DEFAULT_CONFIG.adminSidebarCollapsed,
});

export const applyGlobalUiConfig = () => {
  try {
    const raw = localStorage.getItem('ycc-ui-config');
    const cfg = sanitize(raw ? JSON.parse(raw) : {});
    const root = document.documentElement;
    root.style.setProperty('--ui-scale', String(cfg.uiScale / 100));
    root.style.setProperty('--radius-scale', String(cfg.borderRadiusScale / 100));
    root.style.setProperty('--motion-level', cfg.animationsLevel);
    root.setAttribute('data-motion-level', cfg.animationsLevel);
    root.style.setProperty('--density', cfg.density);
    root.setAttribute('data-density', cfg.density);
    root.setAttribute('data-pos-layout', cfg.posLayout);
    root.setAttribute('data-kds-layout', cfg.kdsLayout);
  } catch {
    // noop
  }
};
