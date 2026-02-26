import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Store, Check } from 'lucide-react'
import { useAdminStore } from '../../stores/useAdminStore'

interface Store {
  id: string
  name: string
  address?: string
  phone?: string
  status: 'online' | 'offline' | 'maintenance'
}

const stores: Store[] = [
  {
    id: 'store-1',
    name: 'Country Club Principal',
    address: 'Av. Principal #1234, Col. Centro',
    phone: '+52 555-1234',
    status: 'online'
  },
  {
    id: 'store-2',
    name: 'Country Club Norte',
    address: 'Av. Norte #5678, Col. Juárez',
    phone: '+52 555-5678',
    status: 'online'
  },
  {
    id: 'store-3',
    name: 'Country Club Sur',
    address: 'Av. Sur #9012, Col. del Valle',
    phone: '+52 555-9012',
    status: 'maintenance'
  }
]

export function StoreSelector() {
  const { currentStore, setCurrentStore } = useAdminStore()
  const [isOpen, setIsOpen] = useState(false)

  const handleStoreSelect = (store: Store) => {
    setCurrentStore(store.id, store.name)
    setIsOpen(false)
  }

  const getStatusColor = (status: Store['status']) => {
    switch (status) {
      case 'online':
        return 'bg-admin-success/20 text-admin-success border-admin-success'
      case 'offline':
        return 'bg-admin-danger/20 text-admin-danger border-admin-danger'
      case 'maintenance':
        return 'bg-admin-warning/20 text-admin-warning border-admin-warning'
      default:
        return 'bg-admin-border/20 text-admin-text-secondary border-admin-border'
    }
  }

  const getStatusIcon = (status: Store['status']) => {
    switch (status) {
      case 'online':
        return <Check className="w-3 h-3" />
      case 'offline':
        return <div className="w-3 h-3 bg-admin-danger rounded-full"></div>
      case 'maintenance':
        return <div className="w-3 h-3 bg-admin-warning rounded-full"></div>
      default:
        return <div className="w-3 h-3 bg-admin-border rounded-full"></div>
    }
  }

  const currentStoreData = stores.find(s => s.id === currentStore)

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-3 px-4 py-2 bg-white border border-admin-border rounded-lg
          hover:bg-admin-border hover:shadow-md transition-all duration-200
        `}
      >
        <Store className="w-5 h-5 text-admin-text" />
        
        <div className="text-left">
          <div className="font-medium text-admin-text">
            {currentStoreData?.name || 'Seleccionar Tienda'}
          </div>
          <div className="text-sm text-admin-text-secondary">
            {currentStoreData?.address || ''}
          </div>
        </div>

        <ChevronDown 
          className={`w-4 h-4 text-admin-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white border border-admin-border rounded-lg shadow-xl z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-admin-border">
              <h3 className="font-semibold text-admin-text mb-2">
                Seleccionar Tienda
              </h3>
              <div className="text-sm text-admin-text-secondary">
                Elige la tienda que quieres administrar
              </div>
            </div>

            {/* Stores List */}
            <div className="max-h-64 overflow-y-auto">
              {stores.map((store) => (
                <motion.button
                  key={store.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleStoreSelect(store)}
                  className={`
                    w-full text-left p-4 border-b border-admin-border/50
                    hover:bg-admin-border transition-colors duration-200
                    ${store.id === currentStore 
                      ? 'bg-admin-primary/10 border-admin-primary' 
                      : ''
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Status indicator */}
                      <div className={`
                        flex items-center space-x-2 px-2 py-1 rounded-full text-xs font-medium
                        ${getStatusColor(store.status)}
                      `}>
                        {getStatusIcon(store.status)}
                        <span>{store.status.toUpperCase()}</span>
                      </div>

                      {/* Store info */}
                      <div>
                        <div className="font-medium text-admin-text">
                          {store.name}
                        </div>
                        <div className="text-sm text-admin-text-secondary">
                          {store.address}
                        </div>
                      </div>
                    </div>

                    {/* Checkmark for selected */}
                    {store.id === currentStore && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-admin-primary"
                      >
                        <Check className="w-5 h-5" />
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-admin-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-admin-text-secondary">
                  {stores.filter(s => s.status === 'online').length} de {stores.length} tiendas online
                </span>
                <button className="text-admin-primary hover:text-admin-primary-hover font-medium">
                  Ver todas las tiendas
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
