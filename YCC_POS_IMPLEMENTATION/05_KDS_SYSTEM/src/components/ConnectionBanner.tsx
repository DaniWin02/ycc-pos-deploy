import React from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { motion } from 'framer-motion'
import { useKdsStore } from '../stores/useKdsStore'

export function ConnectionBanner() {
  const { connectionStatus, connect } = useKdsStore()

  const handleReconnect = () => {
    connect()
  }

  if (connectionStatus === 'connected') {
    return null
  }

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {connectionStatus === 'reconnecting' ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span className="font-medium">
                Reconectando al servidor...
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">
                Conexión perdida
              </span>
            </>
          )}
        </div>

        {connectionStatus === 'disconnected' && (
          <button
            onClick={handleReconnect}
            className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors"
          >
            <Wifi className="w-4 h-4" />
            <span>Reconectar</span>
          </button>
        )}
      </div>
    </motion.div>
  )
}
