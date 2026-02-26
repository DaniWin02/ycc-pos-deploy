import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toast: (toast: Omit<Toast, 'id'>) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
  dismiss: (id: string) => void
  dismissAll: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

interface ToastComponentProps {
  toast: Toast
  onDismiss: () => void
}

const ToastComponent: React.FC<ToastComponentProps> = ({ toast, onDismiss }) => {
  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = () => {
    switch (toast.type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        flex items-start p-4 rounded-lg border shadow-lg backdrop-blur-sm
        min-w-[320px] max-w-md
        ${getBackgroundColor()}
      `}
    >
      <div className="flex-shrink-0 mr-3">
        {getIcon()}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className={`font-semibold ${getTextColor()}`}>
          {toast.title}
        </div>
        {toast.message && (
          <div className={`mt-1 text-sm ${getTextColor()} opacity-80`}>
            {toast.message}
          </div>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={`
              mt-2 text-sm font-medium underline
              ${getTextColor()}
              hover:opacity-80 transition-opacity
            `}
          >
            {toast.action.label}
          </button>
        )}
      </div>
      
      <button
        onClick={onDismiss}
        className={`
          flex-shrink-0 ml-3 p-1 rounded-md
          ${getTextColor()} opacity-60 hover:opacity-100
          transition-opacity
        `}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastComponent toast={toast} onDismiss={() => onDismiss(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
    const timeout = toastTimeouts.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      toastTimeouts.current.delete(id)
    }
  }, [])

  const dismissAll = useCallback(() => {
    setToasts([])
    toastTimeouts.current.forEach((timeout) => clearTimeout(timeout))
    toastTimeouts.current.clear()
  }, [])

  const toast = useCallback((toastData: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      duration: 5000,
      ...toastData
    }

    setToasts((prev) => [...prev, toast])

    // Auto-dismiss after duration
    if (toast.duration && toast.duration > 0) {
      const timeout = setTimeout(() => {
        dismiss(id)
      }, toast.duration)
      toastTimeouts.current.set(id, timeout)
    }

    return id
  }, [dismiss])

  const success = useCallback((title: string, message?: string) => {
    return toast({ type: 'success', title, message })
  }, [toast])

  const error = useCallback((title: string, message?: string) => {
    return toast({ type: 'error', title, message, duration: 0 }) // Don't auto-dismiss errors
  }, [toast])

  const warning = useCallback((title: string, message?: string) => {
    return toast({ type: 'warning', title, message })
  }, [toast])

  const info = useCallback((title: string, message?: string) => {
    return toast({ type: 'info', title, message })
  }, [toast])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      toastTimeouts.current.forEach((timeout) => clearTimeout(timeout))
    }
  }, [])

  const value: ToastContextType = {
    toast,
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}
