import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  FolderPlus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Search,
  Filter
} from 'lucide-react'
import { MenuCategory, MenuCategoryCreateRequest, MenuCategoryUpdateRequest } from '@ycc/types'
import { useAdminStore } from '../stores/useAdminStore'

// Mock API functions
const fetchCategories = async (): Promise<MenuCategory[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  return [
    {
      id: 'cat-1',
      name: 'Bebidas',
      description: 'Todas las bebidas del menú',
      parentId: null,
      sortOrder: 1,
      isActive: true,
      imageUrl: '/images/bebidas.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [
        {
          id: 'cat-1-1',
          name: 'Refrescos',
          description: 'Refrescos embotellados',
          parentId: 'cat-1',
          sortOrder: 1,
          isActive: true,
          imageUrl: '/images/refrescos.jpg',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat-1-2',
          name: 'Jugos',
          description: 'Jugos naturales',
          parentId: 'cat-1',
          sortOrder: 2,
          isActive: true,
          imageUrl: '/images/jugos.jpg',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'cat-2',
      name: 'Comidas',
      description: 'Platillos principales',
      parentId: null,
      sortOrder: 2,
      isActive: true,
      imageUrl: '/images/comidas.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      children: [
        {
          id: 'cat-2-1',
          name: 'Desayunos',
          description: 'Opciones del desayuno',
          parentId: 'cat-2',
          sortOrder: 1,
          isActive: true,
          imageUrl: '/images/desayunos.jpg',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'cat-2-2',
          name: 'Comidas Corridas',
          description: 'Menú del día',
          parentId: 'cat-2',
          sortOrder: 2,
          isActive: true,
          imageUrl: '/images/comidas-corridas.jpg',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    },
    {
      id: 'cat-3',
      name: 'Postres',
      description: 'Opciones dulces',
      parentId: null,
      sortOrder: 3,
      isActive: true,
      imageUrl: '/images/postres.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      children: []
    }
  ]
}

const createCategory = async (data: MenuCategoryCreateRequest): Promise<MenuCategory> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id: `cat-${Date.now()}`,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

const updateCategory = async (id: string, data: MenuCategoryUpdateRequest): Promise<MenuCategory> => {
  await new Promise(resolve => setTimeout(resolve, 800))
  return {
    id,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date()
  } as MenuCategory
}

const deleteCategory = async (id: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500))
}

export function MenuCategoriesPage() {
  const { currentStore } = useAdminStore()
  const queryClient = useQueryClient()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Queries
  const { data: categories, isLoading } = useQuery({
    queryKey: ['menu-categories', currentStore],
    queryFn: fetchCategories,
    refetchInterval: 30000
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
      setIsCreateModalOpen(false)
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MenuCategoryUpdateRequest }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
      setEditingCategory(null)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] })
    }
  })

  // Handlers
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const handleCreateCategory = (data: MenuCategoryCreateRequest) => {
    createMutation.mutate(data)
  }

  const handleUpdateCategory = (data: MenuCategoryUpdateRequest) => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data })
    }
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      deleteMutation.mutate(id)
    }
  }

  // Filter categories
  const filteredCategories = categories?.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  // Tree component
  const CategoryTreeItem = ({ category, level = 0 }: { category: MenuCategory; level?: number }) => {
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.children && category.children.length > 0

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.1 }}
        className="select-none"
      >
        <div
          className={`
            flex items-center justify-between p-3 rounded-lg border
            hover:bg-admin-border transition-all duration-200 cursor-pointer
            ${level === 0 ? 'bg-white border-admin-border' : 'bg-admin-content/50 border-admin-border/50'}
          `}
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center space-x-3">
            {/* Expand/Collapse button */}
            {hasChildren && (
              <button
                onClick={() => toggleCategory(category.id)}
                className="p-1 hover:bg-admin-border rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-admin-text" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-admin-text" />
                )}
              </button>
            )}

            {/* Category info */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-admin-primary/10 rounded-lg flex items-center justify-center">
                <FolderPlus className="w-5 h-5 text-admin-primary" />
              </div>
              <div>
                <h4 className="font-medium text-admin-text">{category.name}</h4>
                <p className="text-sm text-admin-text-secondary">{category.description}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <span className={`
              px-2 py-1 rounded-full text-xs font-medium
              ${category.isActive 
                ? 'bg-admin-success/10 text-admin-success' 
                : 'bg-admin-danger/10 text-admin-danger'
              }
            `}>
              {category.isActive ? 'Activa' : 'Inactiva'}
            </span>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEditingCategory(category)}
              className="p-2 hover:bg-admin-border rounded transition-colors"
            >
              <Edit2 className="w-4 h-4 text-admin-text" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDeleteCategory(category.id)}
              className="p-2 hover:bg-admin-danger/10 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4 text-admin-danger" />
            </motion.button>
          </div>
        </div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {category.children?.map(child => (
                <CategoryTreeItem key={child.id} category={child} level={level + 1} />
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
            Categorías del Menú
          </h1>
          <p className="text-admin-text-secondary mt-1">
            Organiza tu menú con categorías jerárquicas
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-admin-primary text-white rounded-lg hover:bg-admin-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nueva Categoría</span>
        </motion.button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-admin-text-secondary" />
          <input
            type="text"
            placeholder="Buscar categorías..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-admin-border rounded-lg focus:outline-none focus:ring-2 focus:ring-admin-primary/20"
          />
        </div>

        <button className="flex items-center space-x-2 px-4 py-2 border border-admin-border rounded-lg hover:bg-admin-border transition-colors">
          <Filter className="w-5 h-5 text-admin-text" />
          <span>Filtros</span>
        </button>
      </div>

      {/* Categories Tree */}
      <div className="admin-card">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-admin-primary border-t-transparent rounded-full"></div>
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="space-y-2">
            {filteredCategories.map(category => (
              <CategoryTreeItem key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-admin-border rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderPlus className="w-8 h-8 text-admin-text-secondary" />
            </div>
            <h3 className="text-lg font-medium text-admin-text mb-2">
              {searchTerm ? 'No se encontraron categorías' : 'No hay categorías'}
            </h3>
            <p className="text-admin-text-secondary mb-4">
              {searchTerm 
                ? 'Intenta con otra búsqueda'
                : 'Crea tu primera categoría para organizar el menú'
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
                <span>Crear Categoría</span>
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-text">
            {categories?.length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Total Categorías</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-success">
            {categories?.filter(c => c.isActive).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Categorías Activas</p>
        </div>
        
        <div className="admin-card p-4">
          <h3 className="text-lg font-semibold text-admin-warning">
            {categories?.filter(c => !c.isActive).length || 0}
          </h3>
          <p className="text-sm text-admin-text-secondary">Categorías Inactivas</p>
        </div>
      </div>
    </motion.div>
  )
}
