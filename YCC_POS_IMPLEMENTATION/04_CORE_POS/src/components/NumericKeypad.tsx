import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
    { key: 'backspace', label: '⌫', className: 'bg-orange-500 hover:bg-orange-600' },
    { key: 'enter', label: '✓', className: 'bg-green-500 hover:bg-green-600' }
  ];

  return (
    <motion.div
      className={`
        bg-gray-900 rounded-lg p-4 shadow-xl
        ${disabled ? 'opacity-50 pointer-events-none' : ''}
        ${className}
      `}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="grid grid-cols-3 gap-2 mb-4">
        {keypadButtons.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-2">
            {row.map((key) => (
              <motion.button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`
                  ${key === 'clear' 
                    ? 'col-span-2 bg-red-500 text-white hover:bg-red-600' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                  }
                  ${isPressed === key ? 'scale-95 bg-blue-600' : ''}
                  rounded-lg py-4 text-2xl font-bold transition-all duration-150
                  ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
                `}
                whileTap={{ scale: 0.95 }}
                disabled={disabled}
              >
                {key === 'clear' ? 'C' : key}
              </motion.button>
            ))}
          </div>
        ))}
      </div>
      
      {/* Botones de acción */}
      <div className="flex gap-2">
        {actionButtons.map((button) => (
          <motion.button
            key={button.key}
            onClick={() => handleKeyPress(button.key)}
            className={`
              ${button.className}
              text-white rounded-lg py-4 text-xl font-bold transition-all duration-150
              ${isPressed === button.key ? 'scale-95' : ''}
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
            whileTap={{ scale: 0.95 }}
            disabled={disabled}
          >
            {button.label}
          </motion.button>
        ))}
      </div>
      
      {/* Display del valor actual */}
      <div className="mt-4 bg-gray-800 rounded-lg p-4 text-center">
        <div className="text-4xl font-mono text-green-400 tracking-wider">
          {value || '0'}
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {value.length}/{maxLength} caracteres
        </div>
      </div>
      
      {/* Atajos de teclado */}
      <div className="mt-4 text-center text-gray-500 text-sm">
        <div className="font-semibold">Atajos de teclado:</div>
        <div className="mt-1 space-y-1">
          <div>• Números 0-9</div>
          <div>• Punto decimal</div>
          <div>• Backspace para borrar</div>
          <div>• Enter para confirmar</div>
          <div>• Esc/Delete para limpiar</div>
        </div>
      </div>
    </motion.div>
  );
};
