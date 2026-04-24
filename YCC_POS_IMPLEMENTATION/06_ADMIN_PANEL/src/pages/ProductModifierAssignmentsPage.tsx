import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Search,
  Package,
  Link2,
  X,
  Settings,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ModifierGroup {
  id: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  isActive: boolean;
  _count?: { modifiers: number };
}

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  price: number;
}

interface ProductWithModifiers extends Product {
  modifierGroups: {
    id: string;
    modifierGroup: ModifierGroup;
  }[];
  station?: {
    displayName: string;
    color: string;
  } | null;
}

export function ProductModifierAssignmentsPage() {
  const [products, setProducts] = useState<ProductWithModifiers[]>([]);
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductWithModifiers | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Load products with their modifier assignments
      const productsRes = await fetch('http://localhost:3004/api/product-modifier-groups/products-with-modifiers');
      const productsData = await productsRes.json();
      setProducts(Array.isArray(productsData) ? productsData : []);

      // Load available modifier groups
      const groupsRes = await fetch('http://localhost:3004/api/modifier-groups?includeInactive=true');
      const groupsData = await groupsRes.json();
      setModifierGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (modifierGroupId: string) => {
    if (!selectedProduct) return;
    try {
      const res = await fetch('http://localhost:3004/api/product-modifier-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          modifierGroupId
        })
      });

      if (res.ok) {
        await loadData();
        setIsAssignModalOpen(false);
        setSelectedProduct(null);
      } else {
        const error = await res.json();
        alert(error.error || 'Error al asignar');
      }
    } catch (err) {
      alert('Error al asignar modificador');
    }
  };

  const handleRemove = async (assignmentId: string) => {
    if (!confirm('¿Eliminar esta asignación?')) return;
    try {
      await fetch(`http://localhost:3004/api/product-modifier-groups/${assignmentId}`, {
        method: 'DELETE'
      });
      await loadData();
    } catch (err) {
      alert('Error al eliminar asignación');
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get available modifier groups for a product (not yet assigned)
  const getAvailableGroups = (product: ProductWithModifiers) => {
    const assignedIds = product.modifierGroups.map(mg => mg.modifierGroup.id);
    return modifierGroups.filter(mg => 
      !assignedIds.includes(mg.id) && mg.isActive
    );
  };

  return (
    <div className="h-full bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Link2 className="w-6 h-6 text-indigo-600" />
            Asignación Producto-Modificador
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona qué modificadores aplican a cada producto
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          <p className="text-sm text-gray-500">Productos</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-indigo-600">
            {products.reduce((sum, p) => sum + p.modifierGroups.length, 0)}
          </p>
          <p className="text-sm text-gray-500">Asignaciones totales</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-green-600">
            {products.filter(p => p.modifierGroups.length > 0).length}
          </p>
          <p className="text-sm text-gray-500">Con modificadores</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-orange-600">
            {products.filter(p => p.modifierGroups.length === 0).length}
          </p>
          <p className="text-sm text-gray-500">Sin modificadores</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Products List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron productos
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProducts.map(product => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Product Header */}
              <div className="p-4 flex items-center justify-between bg-gray-50 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                    ) : (
                      <Package className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>SKU: {product.sku}</span>
                      <span>•</span>
                      <span>${product.price}</span>
                      {product.station && (
                        <>
                          <span>•</span>
                          <span 
                            className="px-2 py-0.5 rounded text-xs text-white"
                            style={{ backgroundColor: product.station.color }}
                          >
                            {product.station.displayName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsAssignModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Asignar Modificador
                </button>
              </div>

              {/* Assigned Modifier Groups */}
              <div className="p-4">
                {product.modifierGroups.length === 0 ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Sin modificadores asignados</span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {product.modifierGroups.map(({ id, modifierGroup }) => (
                      <div 
                        key={id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                          modifierGroup.isRequired 
                            ? 'bg-amber-50 border-amber-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <Settings className={`w-4 h-4 ${
                          modifierGroup.isRequired ? 'text-amber-600' : 'text-gray-500'
                        }`} />
                        <div>
                          <span className="font-medium text-gray-900">{modifierGroup.name}</span>
                          <span className="text-xs text-gray-500 ml-1">
                            ({modifierGroup._count?.modifiers || 0} opciones)
                          </span>
                        </div>
                        {modifierGroup.isRequired && (
                          <span className="text-xs px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded">
                            Requerido
                          </span>
                        )}
                        <button
                          onClick={() => handleRemove(id)}
                          className="p-1 hover:bg-red-100 text-red-600 rounded ml-1"
                          title="Eliminar asignación"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Modal */}
      <AnimatePresence>
        {isAssignModalOpen && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold">Asignar Modificador</h2>
                  <p className="text-sm text-gray-500">{selectedProduct.name}</p>
                </div>
                <button 
                  onClick={() => {
                    setIsAssignModalOpen(false);
                    setSelectedProduct(null);
                  }} 
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {getAvailableGroups(selectedProduct).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>Todos los modificadores disponibles ya están asignados a este producto</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 mb-3">
                    Selecciona un grupo de modificadores para asignar:
                  </p>
                  {getAvailableGroups(selectedProduct).map(group => (
                    <button
                      key={group.id}
                      onClick={() => handleAssign(group.id)}
                      className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors text-left"
                    >
                      <div>
                        <div className="font-medium text-gray-900">{group.name}</div>
                        <div className="text-sm text-gray-500">
                          {group._count?.modifiers || 0} opciones
                          {group.isRequired && ' • Requerido'}
                        </div>
                        {group.description && (
                          <div className="text-xs text-gray-400 mt-1">{group.description}</div>
                        )}
                      </div>
                      <Plus className="w-5 h-5 text-indigo-600" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
