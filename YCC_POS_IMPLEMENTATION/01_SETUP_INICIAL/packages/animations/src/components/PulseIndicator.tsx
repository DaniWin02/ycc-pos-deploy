import React from 'react';
import { motion } from 'framer-motion';

interface PulseIndicatorProps {
  isActive: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Indicador de pulso para urgencia en KDS
export const PulseIndicator: React.FC<PulseIndicatorProps> = ({ 
  isActive, 
  className = '', 
  children 
}) => {
  return (
    <motion.div
      className={className}
      animate={isActive ? 'active' : 'idle'}
      variants={{
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
      }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 20
      }}
    >
      {children}
    </motion.div>
  );
};
