import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Building2,
  Phone,
  Mail,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  Eye
} from 'lucide-react'
import { 
  Supplier, 
  SupplierCreateRequest,
  SupplierUpdateRequest,
  SupplierFilters
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchSuppliers = async (filters?: SupplierFilters): Promise<Supplier[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'sup-1',
      name: 'Carnicería Central',
      description: 'Proveedor principal de carnes de alta calidad',
      contactPerson: 'Juan Pérez',
      email: 'juan@carniceriacentral.com',
      phone: '+52 55 1234 5678',
      address: 'Av. Principal #123, Col. Centro, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '06000',
      taxId: 'CAR123456XYZ',
      paymentTerms: 'Net 30',
      deliveryDays: ['Lunes', 'Miércoles', 'Viernes'],
      minimumOrder: 500,
      isActive: true,
      rating: 4.8,
      totalOrders: 45,
      lastOrderDate: new Date('2024-01-15'),
      notes: 'Proveedor confiable, entrega puntual',
      website: 'https://carniceriacentral.com',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 'sup-2',
      name: 'Panadería Artesanal',
      description: 'Pan fresco y productos de panadería',
      contactPerson: 'María González',
      email: 'contacto@panaderiaartesanal.com',
      phone: '+52 55 8765 4321',
      address: 'Calle de la Harina #456, Col. Roma, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '06700',
      taxId: 'PAN789012ABC',
      paymentTerms: 'Net 15',
      deliveryDays: ['Martes', 'Jueves', 'Sábado'],
      minimumOrder: 200,
      isActive: true,
      rating: 4.5,
      totalOrders: 32,
      lastOrderDate: new Date('2024-01-18'),
      notes: 'Buenos productos, entrega temprana',
      website: 'https://panaderiaartesanal.com',
      createdAt: new Date('2023-02-15'),
      updatedAt: new Date('2024-01-18')
    },
    {
      id: 'sup-3',
      name: 'Verdurería del Campo',
      description: 'Frutas y verduras frescas',
      contactPerson: 'Carlos Rodríguez',
      email: 'info@verdureriadecampo.com',
      phone: '+52 55 2345 6789',
      address: 'Mercado Central #789, Col. Doctores, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '06720',
      taxId: 'VER345678DEF',
      paymentTerms: 'Net 7',
      deliveryDays: ['Lunes', 'Miércoles', 'Viernes', 'Sábado'],
      minimumOrder: 150,
      isActive: true,
      rating: 4.2,
      totalOrders: 28,
      lastOrderDate: new Date('2024-01-20'),
      notes: 'Productos frescos, precios competitivos',
      website: 'https://verdureriadecampo.com',
      createdAt: new Date('2023-03-10'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 'sup-4',
      name: 'Bebidas y Lácteos SA',
      description: 'Distribuidor de bebidas y productos lácteos',
      contactPerson: 'Ana Martínez',
      email: 'ventas@bebidaslacteos.com',
      phone: '+52 55 3456 7890',
      address: 'Calzada de la Leche #101, Col. Narvarte, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '03020',
      taxId: 'BEB901234GHI',
      paymentTerms: 'Net 21',
      deliveryDays: ['Martes', 'Viernes'],
      minimumOrder: 300,
      isActive: false,
      rating: 3.8,
      totalOrders: 15,
      lastOrderDate: new Date('2023-12-10'),
      notes: 'Servio irregular, precios elevados',
      website: 'https://bebidaslacteos.com',
      createdAt: new Date('2023-04-20'),
      updatedAt: new Date('2023-12-10')
    },
    {
      id: 'sup-5',
      name: 'Importadora Premium',
      description: 'Productos importados y gourmet',
      contactPerson: 'Roberto Silva',
      email: 'contacto@importadorapremium.com',
      phone: '+52 55 4567 8901',
      address: 'Av. Gourmet #202, Col. Polanco, CDMX',
      city: 'Ciudad de México',
      state: 'CDMX',
      country: 'México',
      postalCode: '11560',
      taxId: 'IMP567890JKL',
      paymentTerms: 'Net 45',
      deliveryDays: ['Viernes'],
      minimumOrder: 1000,
      isActive: true,
      rating: 4.9,
      totalOrders: 12,
      lastOrderDate: new Date('2024-01-10'),
      notes: 'Productos exclusivos, excelente calidad',
      website: 'https://importadorapremium.com',
      createdAt: new Date('2023-05-15'),
      updatedAt: new Date('2024-01-10')
    }
  ]
}

const createSupplier = async (data: SupplierCreateRequest): Promise<Supplier> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `sup-${Date.now()}`,
    ...data,
    totalOrders: 0,
    lastOrderDate: undefined,
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const updateSupplier = async (id: string, data: SupplierUpdateRequest): Promise<Supplier> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    name: data.name || '',
    description: data.description || '',
    contactPerson: data.contactPerson || '',
    email: data.email || '',
    phone: data.phone || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    country: data.country || '',
    postalCode: data.postalCode || '',
    taxId: data.taxId || '',
    paymentTerms: data.paymentTerms || '',
    deliveryDays: data.deliveryDays || [],
    minimumOrder: data.minimumOrder || 0,
    isActive: data.isActive || true,
    rating: 0,
    totalOrders: 0,
    lastOrderDate: undefined,
    notes: data.notes || '',
    website: data.website || '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const deleteSupplier = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

export function InventorySuppliersPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [selectedRating, setSelectedRating] = useState<string>('')
  const [showInactive, setShowInactive] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  // Queries
  const { data: suppliers, isLoading } = useQuery({
    queryKey: ['suppliers', searchTerm, selectedCity, selectedRating, showInactive],
    queryFn: () => fetchSuppliers({
      search: searchTerm,
      city: selectedCity || undefined,
      minRating: selectedRating ? parseInt(selectedRating) : undefined,
      isActive: showInactive ? undefined : true
    }),
    refetchInterval: 30000
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setIsCreateModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SupplierUpdateRequest }) =>
      updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setEditingSupplier(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    }
  })

  // Handlers
  const handleCreateSupplier = (data: SupplierCreateRequest) => {
    createMutation.mutate(data)
  }

  const handleUpdateSupplier = (data: SupplierUpdateRequest) => {
    if (editingSupplier) {
      updateMutation.mutate({ id: editingSupplier.id, data })
    }
  }

  const handleDeleteSupplier = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proveedor?')) {
      deleteMutation.mutate(id)
    }
  }

  // Get rating stars
  const getRatingStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      )
    }
    return stars
  }

  // Filter suppliers
  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCity = !selectedCity || supplier.city === selectedCity
    const matchesRating = !selectedRating || supplier.rating >= parseInt(selectedRating)
    const matchesActive = showInactive || supplier.isActive
    return matchesSearch && matchesCity && matchesRating && matchesActive
  }) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-admin-text">
            Proveedores
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Gestiona proveedores y sus información de contacto
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Proveedor</span>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todas las ciudades</option>
          <option value="Ciudad de México">Ciudad de México</option>
        </select>

        <select
          value={selectedRating}
          onChange={(e) => setSelectedRating(e.target.value)}
          className="px-3 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
        >
          <option value="">Todas las calificaciones</option>
          <option value="4">4+ estrellas</option>
          <option value="3">3+ estrellas</option>
          <option value="2">2+ estrellas</option>
        </select>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 text-admin-primary border-admin-border rounded focus:ring-admin-primary"
          />
          <span className="text-sm text-admin-text">Mostrar inactivos</span>
        </label>
      </div>

      {/* Suppliers Table */}
      <div className="admin-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredSuppliers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-admin-border">
                  <th className="text-left p-4 font-medium text-admin-text">Proveedor</th>
                  <th className="text-left p-4 font-medium text-admin-text">Contacto</th>
                  <th className="text-left p-4 font-medium text-admin-text">Ubicación</th>
                  <th className="text-left p-4 font-medium text-admin-text">Calificación</th>
                  <th className="text-left p-4 font-medium text-admin-text">Órdenes</th>
                  <th className="text-left p-4 font-medium text-admin-text">Estado</th>
                  <th className="text-left p-4 font-medium text-admin-text">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier, index) => (
                  <motion.tr
                    key={supplier.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-admin-border/50 hover:bg-admin-border/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-admin-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-admin-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium text-admin-text">{supplier.name}</h4>
                          <p className="text-sm text-admin-text-secondary line-clamp-1">
                            {supplier.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm text-admin-text">
                        <div className="flex items-center space-x-1 mb-1">
                          <Phone className="w-3 h-3 text-admin-text-secondary" />
                          <span>{supplier.contactPerson}</span>
                        </div>
                        <div className="flex items-center space-x-1 mb-1">
                          <Mail className="w-3 h-3 text-admin-text-secondary" />
                          <span className="text-xs">{supplier.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-admin-text-secondary" />
                          <span className="text-xs">{supplier.phone}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm text-admin-text">
                        <div className="flex items-center space-x-1 mb-1">
                          <MapPin className="w-3 h-3 text-admin-text-secondary" />
                          <span>{supplier.city}</span>
                        </div>
                        <div className="text-xs text-admin-text-secondary">
                          {supplier.address}
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex">
                          {getRatingStars(supplier.rating)}
                        </div>
                        <span className="text-sm text-admin-text-secondary">
                          {supplier.rating.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="text-sm text-admin-text">
                        <div className="font-medium">{supplier.totalOrders}</div>
                        <div className="text-xs text-admin-text-secondary">
                          {supplier.lastOrderDate 
                            ? `Última: ${new Date(supplier.lastOrderDate).toLocaleDateString()}`
                            : 'Sin órdenes'
                          }
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${supplier.isActive 
                          ? 'bg-admin-success/10 text-admin-success' 
                          : 'bg-admin-danger/10 text-admin-danger'
                        }
                      `}>
                        {React.createElement(
                          supplier.isActive ? CheckCircle : XCircle,
                          { className: 'w-3 h-3 inline mr-1' }
                        )}
                        {supplier.isActive ? 'Activo' : 'Inactivo'}
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingSupplier(supplier)}
                          className="p-2 hover:bg-admin-border rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-admin-text" />
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteSupplier(supplier.id)}
                          className="p-2 hover:bg-admin-danger/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-admin-danger" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-admin-border rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron proveedores' : 'No hay proveedores'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'Crea tu primer proveedor para empezar'
              }
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Proveedor</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {suppliers?.length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Proveedores</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-success">
            {suppliers?.filter(s => s.isActive).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Activos</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-warning">
            {suppliers?.filter(s => s.rating >= 4).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">4+ Estrellas</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-danger">
            {suppliers?.filter(s => !s.isActive).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Inactivos</p>
        </div>
      </div>

      {/* Simple Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo Proveedor</h2>
              <p className="text-gray-600 mb-4">
                Formulario de creación de proveedor (placeholder - implementar formulario completo)
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleCreateSupplier({
                      name: 'Nuevo Proveedor',
                      description: 'Descripción del proveedor',
                      contactPerson: 'Contacto',
                      email: 'proveedor@ejemplo.com',
                      phone: '+52 55 0000 0000',
                      address: 'Dirección',
                      city: 'Ciudad de México',
                      state: 'CDMX',
                      country: 'México',
                      postalCode: '00000',
                      taxId: 'TAX123456',
                      paymentTerms: 'Net 30',
                      deliveryDays: ['Lunes'],
                      minimumOrder: 100,
                      isActive: true,
                      notes: '',
                      website: ''
                    })
                  }}
                  className="px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover"
                >
                  Crear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
