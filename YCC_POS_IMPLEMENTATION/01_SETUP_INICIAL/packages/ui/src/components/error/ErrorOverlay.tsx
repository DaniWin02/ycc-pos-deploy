import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home, Mail, Phone } from 'lucide-react'

interface ErrorOverlayProps {
  error?: Error
  onRetry?: () => void
  onGoHome?: () => void
  showContactInfo?: boolean
  customMessage?: string
  isFullscreen?: boolean
}

export const ErrorOverlay: React.FC<ErrorOverlayProps> = ({
  error,
  onRetry,
  onGoHome,
  showContactInfo = true,
  customMessage,
  isFullscreen = true
}) => {
  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      window.location.reload()
    }
  }

  const handleGoHome = () => {
    if (onGoHome) {
      onGoHome()
    } else {
      window.location.href = '/'
    }
  }

  const containerClass = isFullscreen 
    ? 'min-h-screen' 
    : 'min-h-[400px]'

  return (
    <div className={`${containerClass} bg-gray-50 flex items-center justify-center px-4`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-8 text-center"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3, ease: 'easeOut' }}
          className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6"
        >
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </motion.div>

        {/* Error Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-2xl font-bold text-gray-900 mb-4"
        >
          Error Crítico
        </motion.h1>

        {/* Error Message */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          className="text-gray-600 mb-6"
        >
          {customMessage || 
           'Ha ocurrido un error crítico que impide continuar con la operación. Por favor, intenta nuevamente o contacta al soporte técnico.'}
        </motion.p>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && error && (
          <motion.details
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="mb-6 text-left"
          >
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2">
              Ver detalles técnicos
            </summary>
            <div className="mt-2 p-4 bg-gray-100 rounded-lg text-xs text-gray-600 overflow-auto max-h-40">
              <div className="font-semibold mb-2">Error:</div>
              <pre className="whitespace-pre-wrap break-words">
                {error.toString()}
              </pre>
              {error.stack && (
                <>
                  <div className="font-semibold mb-2 mt-4">Stack Trace:</div>
                  <pre className="whitespace-pre-wrap break-words">
                    {error.stack}
                  </pre>
                </>
              )}
            </div>
          </motion.details>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <button
            onClick={handleRetry}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar nuevamente
          </button>
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Ir al inicio
          </button>
        </motion.div>

        {/* Contact Information */}
        {showContactInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            className="border-t border-gray-200 pt-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              ¿Necesitas ayuda?
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                soporte@countryclub.com
              </div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                +1 (555) 123-4567
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-500">
              <p>Horario de soporte: Lunes a Viernes, 9:00 AM - 6:00 PM</p>
              <p className="mt-1">ID de referencia: {error?.name || 'ERR-' + Date.now()}</p>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="mt-6 pt-4 border-t border-gray-200"
        >
          <p className="text-xs text-gray-400">
            Country Club POS v1.0.0
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Hook for handling critical errors
export const useErrorOverlay = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const showError = (error: Error) => {
    setError(error)
  }

  const clearError = () => {
    setError(null)
  }

  return {
    error,
    showError,
    clearError,
    hasError: !!error
  }
}

// Component for wrapping app with error overlay
export const AppWithErrorOverlay: React.FC<{
  children: React.ReactNode
  onError?: (error: Error) => void
}> = ({ children, onError }) => {
  const { error, showError, clearError } = useErrorOverlay()

  // Global error handler
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = new Error(event.message)
      error.stack = event.error?.stack
      showError(error)
      if (onError) {
        onError(error)
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = new Error(event.reason?.message || 'Unhandled promise rejection')
      showError(error)
      if (onError) {
        onError(error)
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [showError, onError])

  if (error) {
    return (
      <ErrorOverlay
        error={error}
        onRetry={clearError}
      />
    )
  }

  return <>{children}</>
}
