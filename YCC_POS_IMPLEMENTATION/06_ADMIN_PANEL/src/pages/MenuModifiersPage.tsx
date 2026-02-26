import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Settings
} from 'lucide-react'
import { 
  ModifierGroup, 
  ModifierOption,
  ModifierGroupCreateRequest,
  ModifierGroupUpdateRequest,
  ModifierOptionCreateRequest,
  ModifierOptionUpdateRequest
} from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchModifierGroups = async (): Promise<ModifierGroup[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'group-1',
      name: 'Extras de Hamburguesa',
      description: 'Ingredientes adicionales para hamburguesas',
      sortOrder: 1,
      isActive: true,
      options: [
        {
          id: 'opt-1',
          modifierGroupId: 'group-1',
          name: 'Queso Extra',
          description: 'Porción adicional de queso cheddar',
          price: 15.00,
          cost: 6.00,
          sortOrder: 1,
          isActive: true,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'opt-2',
          modifierGroupId: 'group-1',
          name: 'Tocino',
          description: 'Tocino crujiente extra',
          price: 20.00,
          cost: 8.00,
          sortOrder: 2,
          isActive: true,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'group-2',
      name: 'Salsas',
      description: 'Selección de salsas',
      sortOrder: 2,
      isActive: true,
      options: [
        {
          id: 'opt-3',
          modifierGroupId: 'group-2',
          name: 'Mayonesa',
          description: 'Mayonesa tradicional',
          price: 0,
          cost: 0,
          sortOrder: 1,
          isActive: true,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'opt-4',
          modifierGroupId: 'group-2',
          name: 'Mostaza',
          description: 'Mostaza dijon',
          price: 0,
          cost: 0,
          sortOrder: 2,
          isActive: true,
          isAvailable: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'group-3',
      name: 'Bebidas',
      description: 'Opciones de bebidas',
      sortOrder: 3,
      isActive: false,
      options: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

const createModifierGroup = async (data: ModifierGroupCreateRequest): Promise<ModifierGroup> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `group-${Date.now()}`,
    ...data,
    options: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const updateModifierGroup = async (id: string, data: ModifierGroupUpdateRequest): Promise<ModifierGroup> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    ...data,
    options: [],
    createdAt: new Date(),
    updatedAt: new Date()
  } as ModifierGroup
}

const deleteModifierGroup = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

const createModifierOption = async (data: ModifierOptionCreateRequest): Promise<ModifierOption> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `opt-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const updateModifierOption = async (id: string, data: ModifierOptionUpdateRequest): Promise<ModifierOption> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  } as ModifierOption
}

const deleteModifierOption = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

export function MenuModifiersPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null)
  const [editingOption, setEditingOption] = useState<ModifierOption | null>(null)
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false)
  const [isCreateOptionModalOpen, setIsCreateOptionModalOpen] = useState(false)
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')

  // Queries
  const { data: groups, isLoading } = useQuery({
    queryKey: ['modifier-groups', currentStore],
    queryFn: fetchModifierGroups,
    refetchInterval: 30000
  })

  // Mutations
  const createGroupMutation = useMutation({
    mutationFn: createModifierGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-groups'] })
      setIsCreateGroupModalOpen(false)
    }
  })

  const updateGroupMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModifierGroupUpdateRequest }) =>
      updateModifierGroup(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-groups'] })
      setEditingGroup(null)
    }
  })

  const deleteGroupMutation = useMutation({
    mutationFn: deleteModifierGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-groups'] })
    }
  })

  const createOptionMutation = useMutation({
    mutationFn: createModifierOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-groups'] })
      setIsCreateOptionModalOpen(false)
    }
  })

  const updateOptionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ModifierOptionUpdateRequest }) =>
      updateModifierOption(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-groups'] })
      setEditingOption(null)
    }
  })

  const deleteOptionMutation = useMutation({
    mutationFn: deleteModifierOption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modifier-groups'] })
    }
  })

  // Handlers
  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const handleCreateGroup = (data: ModifierGroupCreateRequest) => {
    createGroupMutation.mutate(data)
  }

  const handleUpdateGroup = (data: ModifierGroupUpdateRequest) => {
    if (editingGroup) {
      updateGroupMutation.mutate({ id: editingGroup.id, data })
    }
  }

  const handleDeleteGroup = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este grupo de modificadores?')) {
      deleteGroupMutation.mutate(id)
    }
  }

  const handleCreateOption = (data: ModifierOptionCreateRequest) => {
    createOptionMutation.mutate(data)
  }

  const handleUpdateOption = (data: ModifierOptionUpdateRequest) => {
    if (editingOption) {
      updateOptionMutation.mutate({ id: editingOption.id, data })
    }
  }

  const handleDeleteOption = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta opción?')) {
      deleteOptionMutation.mutate(id)
    }
  }

  // Filter groups
  const filteredGroups = groups?.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesActive = showInactive || group.isActive
    return matchesSearch && matchesActive
  }) || []

  // Group component
  const ModifierGroupItem = ({ group, level = 0 }: { group: ModifierGroup; level?: number }) => {
    const isExpanded = expandedGroups.has(group.id)
    const hasOptions = group.options && group.options.length > 0

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.1 }}
        className="select-none"
      >
        <div
          className={`
            flex items-center justify-between p-4 rounded-lg border
            hover:bg-admin-border transition-all duration-200 cursor-pointer
            ${level === 0 ? 'bg-white border-admin-border' : 'bg-admin-content/50 border-admin-border/50'}
          `}
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center space-x-3">
            {/* Expand/Collapse button */}
            {hasOptions && (
              <button
                onClick={() => toggleGroup(group.id)}
                className="p-1 hover:bg-admin-border rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-admin-text" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-admin-text" />
                )}
              </button>
            )}

            {/* Group info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-admin-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-admin-primary" />
              </div>
              <div>
                <h4 className="font-medium text-admin-text">{group.name}</h4>
                <p className="text-sm text-admin-text-secondary">{group.description}</p>
                <p className="text-xs text-admin-text-secondary">
                  {group.options?.length || 0} opciones
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${group.isActive 
                ? 'bg-admin-success/10 text-admin-success' 
                : 'bg-admin-danger/10 text-admin-danger'
              }
            `}>
              {group.isActive ? 'Activo' : 'Inactivo'}
            </span>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setSelectedGroupId(group.id)
                setIsCreateOptionModalOpen(true)
              }}
              className="p-2 hover:bg-admin-border rounded transition-colors"
              title="Agregar opción"
            >
              <Plus className="w-4 h-4 text-admin-text" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditingGroup(group)}
              className="p-2 hover:bg-admin-border rounded transition-colors"
            >
              <Edit2 className="w-4 h-4 text-admin-text" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDeleteGroup(group.id)}
              className="p-2 hover:bg-admin-danger/10 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-admin-danger" />
            </motion.button>
          </div>
        </div>

        {/* Options */}
        <AnimatePresence>
          {hasOptions && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {group.options?.map(option => (
                <div
                  key={option.id}
                  className="flex items-center justify-between p-3 border-l-4 border-admin-primary/30 bg-admin-content/30 ml-8 mr-4 my-2 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <h5 className="font-medium text-admin-text">{option.name}</h5>
                      <p className="text-sm text-admin-text-secondary">{option.description}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm font-medium text-admin-primary">
                          ${option.price.toFixed(2)}
                        </span>
                        {option.cost > 0 && (
                          <span className="text-xs text-admin-text-secondary">
                            Costo: ${option.cost.toFixed(2)}
                          </span>
                        )}
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${option.isAvailable 
                            ? 'bg-admin-success/10 text-admin-success' 
                            : 'bg-admin-warning/10 text-admin-warning'
                          }
                        `}>
                          {option.isAvailable ? 'Disponible' : 'No disponible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingOption(option)}
                      className="p-2 hover:bg-admin-border rounded transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-admin-text" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteOption(option.id)}
                      className="p-2 hover:bg-admin-danger/10 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-admin-danger" />
                    </motion.button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

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
            Modificadores del Menú
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Gestiona grupos de modificadores y sus opciones
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateGroupModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo Grupo</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar grupos de modificadores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

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

      {/* Groups List */}
      <div className="admin-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredGroups.length > 0 ? (
          <div className="space-y-2">
            {filteredGroups.map(group => (
              <ModifierGroupItem key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-admin-border rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron grupos' : 'No hay grupos de modificadores'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'Crea tu primer grupo de modificadores'
              }
            </p>
            {!searchTerm && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Grupo</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {groups?.length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Grupos</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-success">
            {groups?.filter(g => g.isActive).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Grupos Activos</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {groups?.reduce((sum, g) => sum + (g.options?.length || 0), 0) || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Opciones</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-warning">
            {groups?.reduce((sum, g) => sum + (g.options?.filter(o => !o.isAvailable).length || 0), 0) || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Opciones No Disponibles</p>
        </div>
      </div>

      {/* Simple Modals (placeholder for actual forms) */}
      <AnimatePresence>
        {isCreateGroupModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreateGroupModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nuevo Grupo de Modificadores</h2>
              <p className="text-gray-600 mb-4">
                Formulario de creación de grupo (placeholder - implementar formulario completo)
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreateGroupModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleCreateGroup({
                      name: 'Nuevo Grupo',
                      description: 'Descripción del grupo',
                      sortOrder: 1,
                      isActive: true
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

      <AnimatePresence>
        {isCreateOptionModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsCreateOptionModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Nueva Opción de Modificador</h2>
              <p className="text-gray-600 mb-4">
                Formulario de creación de opción (placeholder - implementar formulario completo)
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsCreateOptionModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    handleCreateOption({
                      modifierGroupId: selectedGroupId,
                      name: 'Nueva Opción',
                      description: 'Descripción de la opción',
                      price: 10,
                      cost: 4,
                      sortOrder: 1,
                      isActive: true,
                      isAvailable: true
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
