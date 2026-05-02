import { useState, useEffect, useCallback } from 'react';

/**
 * Hook personalizado para manejar responsive design
 * Proporciona información sobre el viewport, breakpoints, orientación y más
 */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type Orientation = 'portrait' | 'landscape';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveState {
  // Dimensiones
  width: number;
  height: number;
  
  // Breakpoints
  breakpoint: Breakpoint;
  isXs: boolean;
  isSm: boolean;
  isMd: boolean;
  isLg: boolean;
  isXl: boolean;
  is2xl: boolean;
  
  // Comparaciones útiles
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Orientación
  orientation: Orientation;
  isPortrait: boolean;
  isLandscape: boolean;
  
  // Características del dispositivo
  deviceType: DeviceType;
  aspectRatio: number;
  
  // Utilidades
  isTouch: boolean;
  isRetina: boolean;
  touchTargetSize: number;
  
  // Fullscreen
  isFullscreen: boolean;
}

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive(): ResponsiveState {
  const getBreakpoint = (width: number): Breakpoint => {
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const getDeviceType = (width: number): DeviceType => {
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const getOrientation = (width: number, height: number): Orientation => {
    return width > height ? 'landscape' : 'portrait';
  };

  const [state, setState] = useState<ResponsiveState>(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const breakpoint = getBreakpoint(width);
    const deviceType = getDeviceType(width);
    const orientation = getOrientation(width, height);
    
    return {
      width,
      height,
      breakpoint,
      isXs: breakpoint === 'xs',
      isSm: breakpoint === 'sm',
      isMd: breakpoint === 'md',
      isLg: breakpoint === 'lg',
      isXl: breakpoint === 'xl',
      is2xl: breakpoint === '2xl',
      isMobile: deviceType === 'mobile',
      isTablet: deviceType === 'tablet',
      isDesktop: deviceType === 'desktop',
      orientation,
      isPortrait: orientation === 'portrait',
      isLandscape: orientation === 'landscape',
      deviceType,
      aspectRatio: width / height,
      isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      isRetina: window.devicePixelRatio > 1,
      touchTargetSize: width < 768 ? 48 : 44,
      isFullscreen: !!document.fullscreenElement,
    };
  });

  useEffect(() => {
    let rafId: number;
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;

    const handleResize = () => {
      // Cancelar el frame anterior si existe
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Solo actualizar si cambió significativamente (evitar micro-ajustes)
        if (Math.abs(width - lastWidth) > 5 || Math.abs(height - lastHeight) > 5) {
          lastWidth = width;
          lastHeight = height;
          
          const breakpoint = getBreakpoint(width);
          const deviceType = getDeviceType(width);
          const orientation = getOrientation(width, height);
          
          setState({
            width,
            height,
            breakpoint,
            isXs: breakpoint === 'xs',
            isSm: breakpoint === 'sm',
            isMd: breakpoint === 'md',
            isLg: breakpoint === 'lg',
            isXl: breakpoint === 'xl',
            is2xl: breakpoint === '2xl',
            isMobile: deviceType === 'mobile',
            isTablet: deviceType === 'tablet',
            isDesktop: deviceType === 'desktop',
            orientation,
            isPortrait: orientation === 'portrait',
            isLandscape: orientation === 'landscape',
            deviceType,
            aspectRatio: width / height,
            isTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
            isRetina: window.devicePixelRatio > 1,
            touchTargetSize: width < 768 ? 48 : 44,
            isFullscreen: !!document.fullscreenElement,
          });
        }
      });
    };

    const handleFullscreenChange = () => {
      setState(prev => ({
        ...prev,
        isFullscreen: !!document.fullscreenElement,
      }));
    };

    // Throttled resize listener
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', throttledResize, { passive: true });
    window.addEventListener('orientationchange', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('resize', throttledResize);
      window.removeEventListener('orientationchange', handleResize);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      clearTimeout(resizeTimeout);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return state;
}

/**
 * Hook para manejar grid columns dinámicas basado en el viewport
 */
export function useResponsiveGrid(
  minItemWidth: number = 300,
  maxColumns: number = 6
): { gridTemplateColumns: string; columnCount: number } {
  const { width } = useResponsive();
  
  const columnCount = Math.min(
    Math.max(1, Math.floor(width / minItemWidth)),
    maxColumns
  );
  
  return {
    gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
    columnCount,
  };
}

/**
 * Hook para calcular dimensiones proporcionales
 */
export function useProportionalDimensions(
  baseWidth: number = 1920,
  baseHeight: number = 1080
) {
  const { width, height } = useResponsive();
  
  const scale = Math.min(width / baseWidth, height / baseHeight);
  const proportional = (value: number) => Math.round(value * scale);
  
  return {
    scale,
    proportional,
    width: proportional(baseWidth),
    height: proportional(baseHeight),
  };
}

/**
 * Hook para detectar si es un dispositivo táctil pequeño
 */
export function useIsSmallTouch(): boolean {
  const { isMobile, isTouch, width } = useResponsive();
  return isMobile && isTouch && width < 768;
}

export default useResponsive;
