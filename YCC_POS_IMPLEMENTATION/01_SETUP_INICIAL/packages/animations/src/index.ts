// Exportar todas las animaciones del sistema YCC POS
export * from './variants/kds';
export * from './components';

// Re-exportar para fácil acceso
export { 
  slideIn, 
  bump, 
  pulse, 
  fadeIn,
  fadeOut 
} from './variants';

export { 
  AnimatedCounter, 
  PulseIndicator, 
  SlideInTransition 
} from './components';
