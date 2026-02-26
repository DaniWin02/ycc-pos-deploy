import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  format?: (value: number) => string;
}

// Componente de contador animado para costos en tiempo real
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 300, 
  className = '', 
  format = (val) => val.toString() 
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setDisplayValue(value);
      setIsAnimating(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [value, duration]);

  return (
    <AnimatePresence>
      <motion.div
        className={className}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isAnimating ? 1 : 0.8,
          scale: isAnimating ? 1.1 : 1
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 25
        }}
      >
        {format(displayValue)}
      </motion.div>
    </AnimatePresence>
  );
};
