import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Trash2, Eye, X, TrendingDown } from 'lucide-react'
import api from '../services/api'

interface WasteRecord {
  id: string
  wasteNumber: string
  storeId: string
  wasteDate: string
  reportedBy: string
  approvedBy?: string
  status: string
  totalValue: number
  reason?: string
  notes?: string
  items?: any[]
}

export const InventoryWastePage: React.FC = () => {
  const [wasteRecords, setWasteRecords] = useState<WasteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<WasteRecord | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadWasteRecords()
    loadStats()
  }, [])

  const loadWasteRecords = async () => {
    try {
      setLoading(true)
      const data = await api.get<WasteRecord[]>('/api/waste')
      setWasteRecords(data)
    } catch (error) {
      console.error('Error cargando registros de desperdicio:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await api.get<any>('/api/waste/stats/summary')
      setStats(data)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
  }

  const filteredRecords = wasteRecords.filter(record =>
    record.wasteNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registro de Desperdicio</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus size={20} />
          Nuevo Registro
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Desperdiciado</p>
                <p className="text-2xl font-bold text-red-600">${stats.totalValue?.toFixed(2) || '0.00'}</p>
              </div>
              <TrendingDown className="text-red-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Registros Totales</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalRecords || 0}</p>
              </div>
              <Trash2 className="text-gray-500" size={32} />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Por Razón</p>
              {stats.byReason && Object.entries(stats.byReason).slice(0, 3).map(([reason, data]: [string, any]) => (
                <div key={reason} className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{reason}</span>
                  <span className="font-medium">${data.value?.toFixed(2) || '0.00'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar registros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando registros...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.wasteNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(record.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.wasteDate).toLocaleDateString('es-MX')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    ${record.totalValue.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => setSelectedRecord(record)}
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

      {filteredRecords.length === 0 && !loading && (
        <div className="text-center py-12">
          <Trash2 className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No se encontraron registros de desperdicio</p>
        </div>
      )}

      {selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Detalle de Desperdicio</h2>
                <button onClick={() => setSelectedRecord(null)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Número de Registro</p>
                    <p className="font-medium">{selectedRecord.wasteNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    {getStatusBadge(selectedRecord.status)}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Valor Total</p>
                    <p className="text-2xl font-bold text-red-600">${selectedRecord.totalValue.toFixed(2)}</p>
                  </div>
                  {selectedRecord.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Notas</p>
                      <p className="text-gray-700">{selectedRecord.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
