import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  X, 
  Monitor,
  AlertCircle
} from 'lucide-react'

interface Station {
  id: string
  name: string
  displayName: string
  color: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    products: number
  }
}

const PRESET_COLORS = [
  '#EF4444', // Rojo
  '#F97316', // Naranja
  '#F59E0B', // Ámbar
  '#84CC16', // Lima
  '#10B981', // Esmeralda
  '#06B6D4', // Cyan
  '#3B82F6', // Azul
  '#6366F1', // Índigo
  '#8B5CF6', // Violeta
  '#EC4899', // Rosa
  '#6B7280', // Gris
]

export const StationsPage: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStation, setEditingStation] = useState<Station | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    color: '#3B82F6',
  })

  // Cargar estaciones
  useEffect(() => {
    loadStations()
  }, [])

  const loadStations = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3004/api/stations?includeInactive=true')
      if (!response.ok) throw new Error('Error cargando estaciones')
      const data = await response.json()
      setStations(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message)
      setStations([])
    } finally {
      setLoading(false)
    }
  }

  const filteredStations = stations.filter(s =>
    s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setEditingStation(null)
    setFormData({ name: '', displayName: '', color: '#3B82F6' })
    setIsModalOpen(true)
  }

  const handleEdit = (station: Station) => {
    setEditingStation(station)
    setFormData({
      name: station.name,
      displayName: station.displayName,
      color: station.color,
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (station: Station) => {
    if (station._count?.products && station._count.products > 0) {
      alert(`No se puede eliminar. Tiene ${station._count.products} productos asignados.`)
      return
    }

    if (!confirm(`¿Desactivar la estación "${station.displayName}"?`)) return

    try {
      const response = await fetch(`http://localhost:3004/api/stations/${station.id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Error al desactivar')
      await loadStations()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingStation 
        ? `http://localhost:3004/api/stations/${editingStation.id}`
        : 'http://localhost:3004/api/stations'
      
      const method = editingStation ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error guardando estación')
      }

      await loadStations()
      setIsModalOpen(false)
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="h-full bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Monitor className="w-6 h-6 text-blue-600" />
            Estaciones KDS
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona las estaciones de trabajo para el sistema de cocina
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Estación
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar estaciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando estaciones...</div>
      ) : filteredStations.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchTerm ? 'No se encontraron estaciones' : 'No hay estaciones. Crea una nueva.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStations.map((station) => (
            <motion.div
              key={station.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-sm border-2 p-4 ${
                station.isActive ? 'border-gray-100' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: station.color + '20' }}
                >
                  <Monitor className="w-6 h-6" style={{ color: station.color }} />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(station)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(station)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900">{station.displayName}</h3>
              <p className="text-sm text-gray-500">{station.name}</p>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {station._count?.products || 0} productos
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  station.isActive 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {station.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingStation ? 'Editar Estación' : 'Nueva Estación'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de visualización *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Ej: Cocina Principal"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {!editingStation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Identificador (URL) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ej: cocina-principal"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Solo letras, números y guiones. Se usará en URLs.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-lg transition-all ${
                          formData.color === color 
                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingStation ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
