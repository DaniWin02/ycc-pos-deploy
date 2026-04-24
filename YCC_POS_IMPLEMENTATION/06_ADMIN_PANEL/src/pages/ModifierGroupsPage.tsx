import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Search,
  ChevronDown,
  ChevronRight,
  Settings,
  X,
  Package,
  Edit2
} from 'lucide-react';

interface Modifier {
  id: string;
  modifierGroupId: string;
  name: string;
  description: string | null;
  priceAdd: number;
  isActive: boolean;
}

interface ModifierGroup {
  id: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  isActive: boolean;
  modifiers: Modifier[];
  _count?: {
    modifiers: number;
    products: number;
  };
}

export function ModifierGroupsPage() {
  const [groups, setGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ModifierGroup | null>(null);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', isRequired: false });
  const [modifierForm, setModifierForm] = useState({ name: '', description: '', priceAdd: 0 });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3004/api/modifier-groups?includeInactive=true');
      const data = await res.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3004/api/modifier-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await loadGroups();
        setIsCreateModalOpen(false);
        setFormData({ name: '', description: '', isRequired: false });
      }
    } catch (err) {
      alert('Error creando grupo');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('¿Desactivar este grupo?')) return;
    try {
      await fetch(`http://localhost:3004/api/modifier-groups/${id}`, { method: 'DELETE' });
      await loadGroups();
    } catch (err) {
      alert('Error al desactivar');
    }
  };

  const handleEditGroup = (group: ModifierGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      isRequired: group.isRequired
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;
    try {
      const res = await fetch(`http://localhost:3004/api/modifier-groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await loadGroups();
        setIsEditModalOpen(false);
        setEditingGroup(null);
        setFormData({ name: '', description: '', isRequired: false });
      } else {
        const error = await res.json();
        alert(error.error || 'Error actualizando grupo');
      }
    } catch (err) {
      alert('Error actualizando grupo');
    }
  };

  const handleCreateModifier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;
    try {
      const res = await fetch('http://localhost:3004/api/modifiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...modifierForm, modifierGroupId: selectedGroup.id })
      });
      if (res.ok) {
        await loadGroups();
        setIsModifierModalOpen(false);
        setModifierForm({ name: '', description: '', priceAdd: 0 });
      }
    } catch (err) {
      alert('Error creando modificador');
    }
  };

  const handleDeleteModifier = async (id: string) => {
    if (!confirm('¿Eliminar este modificador?')) return;
    try {
      await fetch(`http://localhost:3004/api/modifiers/${id}`, { method: 'DELETE' });
      await loadGroups();
    } catch (err) {
      alert('Error al eliminar');
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesActive = showInactive || g.isActive;
    return matchesSearch && matchesActive;
  });

  return (
    <div className="h-full bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            Grupos de Modificadores
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona ingredientes extra, opciones y personalizaciones
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Grupo
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar grupos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="rounded text-blue-600"
          />
          <span className="text-sm text-gray-600">Mostrar inactivos</span>
        </label>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron grupos
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGroups.map(group => (
            <div key={group.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Group Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleExpand(group.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {expandedGroups.has(group.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.description || 'Sin descripción'}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{group._count?.modifiers || group.modifiers.length} opciones</span>
                      <span>•</span>
                      <span>{group._count?.products || 0} productos</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${group.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {group.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedGroup(group);
                      setIsModifierModalOpen(true);
                    }}
                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                    title="Agregar opción"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditGroup(group)}
                    className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg"
                    title="Editar grupo"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                    title="Desactivar grupo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Modifiers List */}
              <AnimatePresence>
                {expandedGroups.has(group.id) && group.modifiers.length > 0 && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-gray-100 bg-gray-50"
                  >
                    {group.modifiers.map(mod => (
                      <div key={mod.id} className="px-4 py-3 flex items-center justify-between border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                            <Package className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{mod.name}</p>
                            <p className="text-sm text-gray-500">{mod.description || 'Sin descripción'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-medium ${mod.priceAdd > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {mod.priceAdd > 0 ? `+$${mod.priceAdd}` : 'Gratis'}
                          </span>
                          <button
                            onClick={() => handleDeleteModifier(mod.id)}
                            className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-gray-900">{groups.length}</p>
          <p className="text-sm text-gray-500">Total Grupos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-green-600">{groups.filter(g => g.isActive).length}</p>
          <p className="text-sm text-gray-500">Grupos Activos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-blue-600">
            {groups.reduce((sum, g) => sum + g.modifiers.length, 0)}
          </p>
          <p className="text-sm text-gray-500">Total Opciones</p>
        </div>
      </div>

      {/* Create Group Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Nuevo Grupo</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Ingredientes Extra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del grupo"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="isRequired" className="text-sm text-gray-700">Requerido</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Modifier Modal */}
      <AnimatePresence>
        {isModifierModalOpen && selectedGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Nueva Opción - {selectedGroup.name}</h2>
                <button onClick={() => setIsModifierModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateModifier} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    required
                    type="text"
                    value={modifierForm.name}
                    onChange={(e) => setModifierForm({ ...modifierForm, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Queso Extra"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={modifierForm.description}
                    onChange={(e) => setModifierForm({ ...modifierForm, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción de la opción"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio adicional ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={modifierForm.priceAdd}
                    onChange={(e) => setModifierForm({ ...modifierForm, priceAdd: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModifierModalOpen(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Agregar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Group Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingGroup && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Editar Grupo - {editingGroup.name}</h2>
                <button 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingGroup(null);
                    setFormData({ name: '', description: '', isRequired: false });
                  }} 
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleUpdateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del grupo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Descripción del grupo"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsRequired"
                    checked={formData.isRequired}
                    onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                    className="rounded text-blue-600"
                  />
                  <label htmlFor="editIsRequired" className="text-sm text-gray-700">Requerido</label>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingGroup(null);
                      setFormData({ name: '', description: '', isRequired: false });
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
