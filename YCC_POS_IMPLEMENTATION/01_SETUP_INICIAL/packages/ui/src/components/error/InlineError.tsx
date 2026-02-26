import React from 'react'
import { AlertCircle, X } from 'lucide-react'

interface InlineErrorProps {
  message: string
  onDismiss?: () => void
  variant?: 'error' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onDismiss,
  variant = 'error',
  size = 'md',
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: <AlertCircle className="w-4 h-4 text-red-500" />
        }
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: <AlertCircle className="w-4 h-4 text-yellow-500" />
        }
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: <AlertCircle className="w-4 h-4 text-blue-500" />
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: 'p-2',
          textSize: 'text-xs',
          iconSize: 'w-3 h-3'
        }
      case 'md':
        return {
          padding: 'p-3',
          textSize: 'text-sm',
          iconSize: 'w-4 h-4'
        }
      case 'lg':
        return {
          padding: 'p-4',
          textSize: 'text-base',
          iconSize: 'w-5 h-5'
        }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()

  return (
    <div className={`
      flex items-start space-x-2 rounded-lg border
      ${variantStyles.bg} ${variantStyles.border}
      ${sizeStyles.padding} ${className}
    `}>
      <div className="flex-shrink-0 mt-0.5">
        {variant === 'error' ? (
          <AlertCircle className={`${sizeStyles.iconSize} text-red-500`} />
        ) : variant === 'warning' ? (
          <AlertCircle className={`${sizeStyles.iconSize} text-yellow-500`} />
        ) : (
          <AlertCircle className={`${sizeStyles.iconSize} text-blue-500`} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`${sizeStyles.textSize} ${variantStyles.text} font-medium`}>
          {message}
        </p>
      </div>
      
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`
            flex-shrink-0 p-1 rounded-md
            ${variantStyles.text} opacity-60 hover:opacity-100
            transition-opacity
          `}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

// Hook for form field errors
export const useFieldError = (initialError?: string) => {
  const [error, setError] = React.useState<string | undefined>(initialError)

  const showError = (message: string) => {
    setError(message)
  }

  const clearError = () => {
    setError(undefined)
  }

  return {
    error,
    showError,
    clearError,
    hasError: !!error
  }
}

// Component for form fields with error
export interface FieldWithErrorProps {
  label?: string
  error?: string
  children: React.ReactNode
  required?: boolean
}

export const FieldWithError: React.FC<FieldWithErrorProps> = ({
  label,
  error,
  children,
  required = false
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {children}
      
      {error && (
        <InlineError
          message={error}
          variant="error"
          size="sm"
        />
      )}
    </div>
  )
}
