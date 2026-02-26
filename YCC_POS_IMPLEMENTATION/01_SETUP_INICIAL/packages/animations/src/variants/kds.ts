import { Variants } from 'framer-motion';

// Variantes de animación para el Kitchen Display System (KDS)
export const kdsVariants: Variants = {
  // Slide in desde la derecha para nuevos tickets
  slideIn: {
    hidden: { 
      x: 300, 
      opacity: 0,
      scale: 0.8
    },
    visible: { 
      x: 0, 
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      x: -300, 
      opacity: 0,
      scale: 0.8,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  },
  
  // Animación de bump para notificación de urgencia
  bump: {
    idle: { 
      scale: 1,
      transition: { duration: 0.2 }
    },
    active: { 
      scale: [1, 1.1, 1],
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 25
      }
    }
  },
  
  // Pulso para indicar urgencia (> 15 min)
  pulse: {
    idle: { 
      opacity: 0.6,
      scale: 1
    },
    active: { 
      opacity: 1,
      scale: 1.05,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 20
      }
    }
  },
  
  // Fade in para banners de reconexión
  fadeIn: {
    hidden: { 
      opacity: 0,
      y: -20
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      transition: {
        type: 'spring',
        stiffness: 200,
        damping: 25
      }
    }
  }
};

// Exportar variantes individuales para uso fácil
export const slideIn = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  variants: kdsVariants.slideIn
};

export const bump = {
  whileHover: 'active',
  variants: kdsVariants.bump
};

export const pulse = {
  variants: kdsVariants.pulse
};

export const fadeIn = {
  initial: 'hidden',
  animate: 'visible',
  exit: 'hidden',
  variants: kdsVariants.fadeIn
};
