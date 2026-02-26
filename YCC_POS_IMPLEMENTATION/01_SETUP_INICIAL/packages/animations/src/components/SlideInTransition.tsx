import React from 'react';
import { AnimatePresence } from 'framer-motion';

interface SlideInTransitionProps {
  show: boolean;
  direction?: 'left' | 'right';
  className?: string;
  children?: React.ReactNode;
}

// Componente de transición slide-in para banners y notificaciones
export const SlideInTransition: React.FC<SlideInTransitionProps> = ({ 
  show, 
  direction = 'right',
  className = '', 
  children 
}) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ 
            x: direction === 'right' ? 300 : -300,
            opacity: 0,
            scale: 0.8
          }}
          animate={{ 
            x: 0,
            opacity: 1,
            scale: 1
          }}
          exit={{ 
            x: direction === 'right' ? -300 : 300,
            opacity: 0,
            scale: 0.8
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
