import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react'

interface OfflineBannerProps {
  isOnline?: boolean
  onRetry?: () => void
  customMessage?: string
  showRetryButton?: boolean
  position?: 'top' | 'bottom'
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline: propIsOnline,
  onRetry,
  customMessage,
  showRetryButton = true,
  position = 'top'
}) => {
  const [isOnline, setIsOnline] = useState(propIsOnline ?? navigator.onLine)
  const [isRetrying, setIsRetrying] = useState(false)

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Update when prop changes
  useEffect(() => {
    if (propIsOnline !== undefined) {
      setIsOnline(propIsOnline)
    }
  }, [propIsOnline])

  const handleRetry = async () => {
    if (onRetry) {
      setIsRetrying(true)
      try {
        await onRetry()
      } finally {
        setIsRetrying(false)
      }
    }
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-0 left-0 right-0'
      case 'bottom':
        return 'bottom-0 left-0 right-0'
    }
  }

  const getMessage = () => {
    if (customMessage) return customMessage
    
    if (isOnline) {
      return 'Conexión restaurada'
    } else {
      return 'Sin conexión a internet. Algunas funciones pueden no estar disponibles.'
    }
  }

  const getIcon = () => {
    if (isOnline) {
      return <Wifi className="w-4 h-4" />
    } else {
      return <WifiOff className="w-4 h-4" />
    }
  }

  const getBackgroundColor = () => {
    if (isOnline) {
      return 'bg-green-50 border-green-200 text-green-800'
    } else {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800'
    }
  }

  // Don't render if online and no custom message
  if (isOnline && !customMessage) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ 
          opacity: 0,
          y: position === 'top' ? -100 : 100
        }}
        animate={{ 
          opacity: 1,
          y: 0
        }}
        exit={{ 
          opacity: 0,
          y: position === 'top' ? -100 : 100
        }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`
          fixed z-50 flex items-center justify-between
          px-4 py-3 border-b backdrop-blur-sm
          ${getPositionClasses()}
          ${getBackgroundColor()}
        `}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium">
              {getMessage()}
            </p>
            {!isOnline && (
              <p className="text-xs opacity-75 mt-1">
                Verificando conexión...
              </p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          {!isOnline && showRetryButton && onRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="
                flex items-center space-x-2 px-3 py-1.5
                bg-white bg-opacity-50 rounded-md
                hover:bg-opacity-70 transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              {isRetrying ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs">Reintentando...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  <span className="text-xs">Reintentar</span>
                </>
              )}
            </button>
          )}
          
          {isOnline && (
            <button
              onClick={() => setIsOnline(false)} // For testing
              className="text-xs opacity-50 hover:opacity-100 transition-opacity"
            >
              <AlertTriangle className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Hook for online/offline status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// Component that shows connection status in a small indicator
export const ConnectionStatus: React.FC<{
  showText?: boolean
  className?: string
}> = ({ showText = false, className = '' }) => {
  const isOnline = useOnlineStatus()

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`
        w-2 h-2 rounded-full
        ${isOnline ? 'bg-green-500' : 'bg-red-500'}
      `} />
      {showText && (
        <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      )}
    </div>
  )
}
