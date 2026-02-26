import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, Users, Package } from 'lucide-react'
import { useAdminStore } from '../../stores/useAdminStore'

interface Alert {
  id: string
  type: 'warning' | 'success' | 'info' | 'error'
  title: string
  message: string
  timestamp: Date
  acknowledged: boolean
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const { currentStore } = useAdminStore()

  // Mock WebSocket connection for real-time alerts
  useEffect(() => {
    // Simulate receiving alerts
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Stock Bajo',
        message: 'Papas Fritas está por debajo del mínimo (15 unidades)',
        timestamp: new Date(Date.now() - 5 * 60000),
        acknowledged: false
      },
      {
        id: '2',
        type: 'info',
        title: 'Nueva Orden',
        message: 'Orden #ORD-456 creada por $285',
        timestamp: new Date(Date.now() - 2 * 60000),
        acknowledged: false
      },
      {
        id: '3',
        type: 'success',
        title: 'Meta Diaria',
        message: 'Ventas diarias alcanzadas: $12,500 / $10,000',
        timestamp: new Date(Date.now() - 15 * 60000),
        acknowledged: false
      },
      {
        id: '4',
        type: 'error',
        title: 'Error de Sistema',
        message: 'Conexión con terminal POS-03 perdida',
        timestamp: new Date(Date.now() - 8 * 60000),
        acknowledged: false
      }
    ]

    setAlerts(mockAlerts)

    // Simulate WebSocket updates
    const interval = setInterval(() => {
      const newAlert: Alert = {
        id: Date.now().toString(),
        type: Math.random() > 0.7 ? 'warning' : 'info',
        title: Math.random() > 0.5 ? 'Alerta Automática' : 'Actualización',
        message: 'Mensaje de prueba del sistema',
        timestamp: new Date(),
        acknowledged: false
      }
      
      setAlerts(prev => [newAlert, ...prev.slice(0, 9)])
    }, 30000) // New alert every 30 seconds

    return () => clearInterval(interval)
  }, [currentStore])

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    )
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-admin-warning" />
      case 'success':
        return <CheckCircle className="w-5 h-5 text-admin-success" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-admin-danger" />
      default:
        return <Clock className="w-5 h-5 text-admin-text-secondary" />
    }
  }

  const getAlertStyles = (type: Alert['type']) => {
    switch (type) {
      case 'warning':
        return 'border-admin-warning bg-admin-warning/10 text-admin-warning'
      case 'success':
        return 'border-admin-success bg-admin-success/10 text-admin-success'
      case 'error':
        return 'border-admin-danger bg-admin-danger/10 text-admin-danger'
      default:
        return 'border-admin-border bg-admin-border/10 text-admin-text'
    }
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Justo ahora'
    if (minutes < 60) return `Hace ${minutes} min`
    if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)}h ${minutes % 60} min`
    return `Hace ${Math.floor(minutes / 1440)} días`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="admin-card"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-admin-text">
            Alertas en Tiempo Real
          </h3>
          <p className="text-sm text-admin-text-secondary">
            Monitoreo del sistema {currentStoreName}
          </p>
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-status-online rounded-full"></div>
          <span className="text-sm text-admin-text-secondary">Conectado</span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05
              }}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all
                ${alert.acknowledged 
                  ? 'opacity-60 bg-admin-border/20' 
                  : getAlertStyles(alert.type)
                }
              `}
              onClick={() => acknowledgeAlert(alert.id)}
            >
              {/* Alert content */}
              <div className="flex items-start space-x-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-admin-text">
                      {alert.title}
                    </h4>
                    
                    {!alert.acknowledged && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          acknowledgeAlert(alert.id)
                        }}
                        className="text-xs px-2 py-1 bg-admin-primary text-white rounded hover:bg-admin-primary-hover"
                      >
                        Marcar como leído
                      </motion.button>
                    )}
                  </div>

                  <p className="text-sm text-admin-text-secondary">
                    {alert.message}
                  </p>

                  <div className="flex items-center space-x-2 text-xs text-admin-text-secondary">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(alert.timestamp)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-4 pt-4 border-t border-admin-border"
      >
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-admin-text">
              {alerts.filter(a => !a.acknowledged).length}
            </p>
            <p className="text-sm text-admin-text-secondary">Pendientes</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-admin-warning">
              {alerts.filter(a => a.type === 'warning').length}
            </p>
            <p className="text-sm text-admin-text-secondary">Advertencias</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-admin-success">
              {alerts.filter(a => a.type === 'success').length}
            </p>
            <p className="text-sm text-admin-text-secondary">Éxitos</p>
          </div>
          
          <div>
            <p className="text-2xl font-bold text-admin-danger">
              {alerts.filter(a => a.type === 'error').length}
            </p>
            <p className="text-sm text-admin-text-secondary">Errores</p>
          </div>
        </div>
      </motion.div>

      {/* Empty state */}
      {alerts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-admin-border rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-admin-success" />
          </div>
          <p className="text-admin-text-secondary">
            No hay alertas activas
          </p>
          <p className="text-sm text-admin-text-secondary">
            El sistema está funcionando normalmente
          </p>
        </div>
      )}
    </motion.div>
  )
}
