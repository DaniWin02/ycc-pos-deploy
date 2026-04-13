import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, ClipboardList, Eye, X } from 'lucide-react'
import api from '../services/api'

interface PhysicalCount {
  id: string
  countNumber: string
  storeId: string
  status: string
  countDate: string
  startedAt?: string
  completedAt?: string
  countedBy?: string
  reviewedBy?: string
  notes?: string
  varianceAmount: number
  variancePercentage: number
  totalItems: number
  countedItems: number
  items?: any[]
}

export const InventoryCountsPage: React.FC = () => {
  const [counts, setCounts] = useState<PhysicalCount[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCount, setSelectedCount] = useState<PhysicalCount | null>(null)

  useEffect(() => {
    loadCounts()
  }, [])

  const loadCounts = async () => {
    try {
      setLoading(true)
      const data = await api.get<PhysicalCount[]>('/api/physical-counts')
      setCounts(data)
    } catch (error) {
      console.error('Error cargando conteos:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      REVIEWED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace(/_/g, ' ')}
      </span>
    )
  }

  const filteredCounts = counts.filter(count =>
    count.countNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Conteos Físicos</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Nuevo Conteo
        </button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar conteos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando conteos...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Varianza</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCounts.map((count) => (
                <tr key={count.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {count.countNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(count.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(count.countDate).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {count.countedItems} / {count.totalItems}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={count.varianceAmount < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      ${Math.abs(count.varianceAmount).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedCount(count)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Eye size={16} />
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredCounts.length === 0 && !loading && (
        <div className="text-center py-12">
          <ClipboardList className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No se encontraron conteos físicos</p>
        </div>
      )}

      {selectedCount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Detalle de Conteo</h2>
                <button onClick={() => setSelectedCount(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Número de Conteo</p>
                    <p className="font-medium">{selectedCount.countNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    {getStatusBadge(selectedCount.status)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Items Totales</p>
                    <p className="font-medium">{selectedCount.totalItems}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Items Contados</p>
                    <p className="font-medium">{selectedCount.countedItems}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Varianza</p>
                    <p className={`text-xl font-bold ${selectedCount.varianceAmount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${selectedCount.varianceAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
