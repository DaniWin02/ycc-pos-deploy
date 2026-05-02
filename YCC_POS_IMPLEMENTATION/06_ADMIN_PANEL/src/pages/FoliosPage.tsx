import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Hash, Calendar, Trash2, AlertTriangle, TrendingUp, BarChart3, Download } from 'lucide-react'
import api from '../services/api'

interface FolioStats {
  totalSales: number
  foliosByDay: Record<string, number>
  dateRange: {
    start: string
    end: string
  }
}

export const FoliosPage: React.FC = () => {
  const [stats, setStats] = useState<FolioStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [deleteStartDate, setDeleteStartDate] = useState('')
  const [deleteEndDate, setDeleteEndDate] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async (start?: string, end?: string) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (start) params.append('startDate', start)
      if (end) params.append('endDate', end)
      
      const data = await api.get<FolioStats>(`/sales/folios/stats?${params.toString()}`)
      setStats(data)
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
      alert('Error al cargar estadísticas de folios')
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    loadStats(startDate, endDate)
  }

  const handleDeleteHistory = async () => {
    if (!deleteStartDate || !deleteEndDate) {
      alert('Debe seleccionar ambas fechas')
      return
    }

    if (new Date(deleteStartDate) > new Date(deleteEndDate)) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin')
      return
    }

    try {
      setIsDeleting(true)
      const result = await api.delete('/sales/folios/history', {
        startDate: deleteStartDate,
        endDate: deleteEndDate,
        confirm: true
      })

      alert(`✅ ${(result as { deletedCount: number }).deletedCount} ventas eliminadas exitosamente`)
      setShowDeleteConfirm(false)
      setDeleteStartDate('')
      setDeleteEndDate('')
      loadStats()
    } catch (error: any) {
      console.error('Error eliminando historial:', error)
      alert('Error al eliminar historial de folios')
    } finally {
      setIsDeleting(false)
    }
  }

  const sortedDays = stats ? Object.entries(stats.foliosByDay).sort((a, b) => b[0].localeCompare(a[0])) : []

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Folios</h1>
          <p className="text-gray-600 mt-1">Administra el historial de folios de ventas</p>
        </div>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          <Trash2 size={20} />
          Eliminar Historial
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Filtrar por Fecha
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Filtrar
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total de Ventas</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalSales}</p>
                </div>
                <Hash className="text-blue-500" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Días con Ventas</p>
                  <p className="text-3xl font-bold text-green-600">{Object.keys(stats.foliosByDay).length}</p>
                </div>
                <Calendar className="text-green-500" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Promedio Diario</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {Object.keys(stats.foliosByDay).length > 0
                      ? Math.round(stats.totalSales / Object.keys(stats.foliosByDay).length)
                      : 0}
                  </p>
                </div>
                <TrendingUp className="text-purple-500" size={40} />
              </div>
            </div>
          </div>

          {/* Tabla de folios por día */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <BarChart3 size={20} />
                Folios por Día
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Día</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rango de Folios</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedDays.map(([date, count], index) => {
                    const dateObj = new Date(date)
                    const dayName = dateObj.toLocaleDateString('es-MX', { weekday: 'long' })
                    return (
                      <tr key={date} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {dateObj.toLocaleDateString('es-MX')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {dayName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {count} ventas
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          #001 - #{String(count).padStart(3, '0')}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <Hash className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No hay datos disponibles</p>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Eliminar Historial de Folios</h2>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Esta acción eliminará permanentemente todas las ventas en el rango de fechas seleccionado.
                <strong className="text-red-600"> Esta acción no se puede deshacer.</strong>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    value={deleteStartDate}
                    onChange={(e) => setDeleteStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                  <input
                    type="date"
                    value={deleteEndDate}
                    onChange={(e) => setDeleteEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setDeleteStartDate('')
                  setDeleteEndDate('')
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteHistory}
                disabled={isDeleting || !deleteStartDate || !deleteEndDate}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
