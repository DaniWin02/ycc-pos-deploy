import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useResponsive } from '../hooks/useResponsive';

interface NumericKeypadProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  onBackspace?: () => void;
  onEnter?: () => void;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

// Teclado numérico táctil para el POS
export const NumericKeypad: React.FC<NumericKeypadProps> = ({ 
  value, 
  onChange, 
  onClear, 
  onBackspace, 
  onEnter,
  maxLength = 10,
  disabled = false,
  className = ''
}) => {
  const [isPressed, setIsPressed] = useState<string | null>(null);
  const { isMobile, isTablet, touchTargetSize } = useResponsive();

  const handleKeyPress = (key: string) => {
    if (disabled) return;
    
    setIsPressed(key);
    setTimeout(() => setIsPressed(null), 150);
    
    switch (key) {
      case 'clear':
        onClear?.();
        break;
      case 'backspace':
        onBackspace?.();
        break;
      case 'enter':
        onEnter?.();
        break;
      default:
        if (value.length < maxLength) {
          onChange(value + key);
        }
        break;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (disabled) return;
    
    const key = e.key;
    
    if (key >= '0' && key <= '9') {
      e.preventDefault();
      handleKeyPress(key);
    } else if (key === '.') {
      e.preventDefault();
      handleKeyPress('.');
    } else if (key === 'Backspace') {
      e.preventDefault();
      handleKeyPress('backspace');
    } else if (key === 'Enter') {
      e.preventDefault();
      handleKeyPress('enter');
    } else if (key === 'Escape') {
      e.preventDefault();
      handleKeyPress('clear');
    } else if (key === 'Delete') {
      e.preventDefault();
      handleKeyPress('clear');
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, disabled]);

  const keypadButtons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '.', 'clear']
  ];

  const actionButtons = [
    { key: 'backspace', label: '⌫', icon: '←', className: 'bg-orange-500 hover:bg-orange-600' },
    { key: 'enter', label: '✓', icon: '✓', className: 'bg-green-500 hover:bg-green-600' }
  ];

  return (
    <motion.div
      className={`
        bg-gray-900 rounded-xl p-fluid-md shadow-xl
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="grid grid-cols-3 gap-fluid-sm mb-fluid-sm">
        {keypadButtons.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((key) => (
              <motion.button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`
                  ${key === 'clear' 
                    ? 'col-span-1 bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                  }
                  ${isPressed === key ? 'scale-95 bg-blue-600' : ''}
                  touch-target-comfortable rounded-lg text-fluid-2xl font-bold 
                  transition-all duration-150 shadow-lg
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                  active:shadow-inner
                `}
                whileTap={{ scale: 0.9 }}
                disabled={disabled}
              >
                <span className="flex items-center justify-center">
                  {key === 'clear' ? (
                    <span className="text-fluid-lg">C</span>
                  ) : (
                    <span className="text-fluid-2xl">{key}</span>
                  )}
                </span>
              </motion.button>
            ))}
          </React.Fragment>
        ))}
      </div>
      
      {/* Botones de acción */}
      <div className="flex gap-fluid-sm">
        {actionButtons.map((button) => (
          <motion.button
            key={button.key}
            onClick={() => handleKeyPress(button.key)}
            className={`
              ${button.className}
              touch-target-comfortable flex-1
              text-white rounded-lg text-fluid-xl font-bold 
              transition-all duration-150 shadow-lg
              ${isPressed === button.key ? 'scale-95' : ''}
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              active:shadow-inner flex items-center justify-center gap-2
            `}
            whileTap={{ scale: 0.9 }}
            disabled={disabled}
          >
            <span className="text-fluid-2xl">{button.icon}</span>
            <span className="hidden sm:inline text-fluid-base">{button.label}</span>
          </motion.button>
        ))}
      </div>
      
      {/* Display del valor actual */}
      <div className="mt-fluid-md bg-gray-800 rounded-lg p-fluid-md text-center border border-gray-700">
        <div className="text-fluid-3xl font-mono text-green-400 tracking-wider font-bold">
          {value || '0'}
        </div>
        <div className="text-fluid-xs text-gray-500 mt-1">
          {value.length}/{maxLength} caracteres
        </div>
      </div>
      
      {/* Atajos de teclado - Oculto en móvil */}
      <div className="mt-fluid-sm text-center text-gray-500 hidden md:block">
        <div className="font-semibold text-fluid-xs">Atajos de teclado:</div>
        <div className="mt-1 space-y-0.5 text-fluid-xs">
          <div>• Números 0-9 • Backspace • Enter • Esc</div>
        </div>
      </div>
    </motion.div>
  );
};
