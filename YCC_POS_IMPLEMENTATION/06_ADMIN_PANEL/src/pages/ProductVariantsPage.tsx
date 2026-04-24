import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Search,
  Package,
  Layers,
  X,
  DollarSign,
  Tag,
  Edit2,
  ArrowLeft
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  price: number;
}

interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  cost: number | null;
  currentStock: number;
  image: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  product: Product;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';

interface ProductVariantsPageProps {
  productId?: string;
  onBack?: () => void;
}

export function ProductVariantsPage({ productId, onBack }: ProductVariantsPageProps = {}) {
  let searchParams: any = null;
  try {
    const [params] = useSearchParams();
    searchParams = params;
  } catch (e) {
    // No estamos en un Router context
  }

  const initialProductId = productId || (searchParams ? searchParams.get('productId') : '') || '';
  
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    name: '',
    sku: '',
    price: 0,
    cost: 0,
    currentStock: 0,
    description: ''
  });

  useEffect(() => {
    loadVariants();
  }, [selectedProductId]);

  useEffect(() => {
    loadVariants();
    loadProducts();
  }, []);

  // Efecto para auto-generar SKU basado en el producto y nombre de variante
  useEffect(() => {
    if (isCreateModalOpen && formData.productId && formData.name && !editingVariant) {
      const product = products.find(p => p.id === formData.productId);
      if (product) {
        const generatedSku = `${product.sku}-${formData.name.toUpperCase().replace(/\s+/g, '-')}`;
        setFormData(prev => ({ ...prev, sku: generatedSku }));
      }
    }
  }, [formData.productId, formData.name, isCreateModalOpen, products, editingVariant]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = selectedProductId 
        ? `${API_URL}/product-variants?productId=${selectedProductId}`
        : `${API_URL}/product-variants?includeInactive=true`;
      const res = await fetch(url);
      const data = await res.json();
      // Normalizar datos para asegurar que currentStock sea siempre número
      const normalizedData = Array.isArray(data) ? data.map((v: any) => ({
        ...v,
        currentStock: typeof v.currentStock === 'string' ? parseInt(v.currentStock, 10) || 0 : (v.currentStock || 0),
        price: typeof v.price === 'string' ? parseFloat(v.price) || 0 : (v.price || 0),
        cost: typeof v.cost === 'string' ? parseFloat(v.cost) || null : (v.cost || null)
      })) : [];
      setVariants(normalizedData);
    } catch (err) {
      console.error('Error loading variants:', err);
      setError('No se pudieron cargar las variantes. Verifica la conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`${API_URL}/product-variants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await loadVariants();
        setIsCreateModalOpen(false);
        setFormData({ productId: '', name: '', sku: '', price: 0, cost: 0, currentStock: 0, description: '' });
      } else {
        setError(data.error || 'Error creando variante');
      }
    } catch (err) {
      setError('Error de red al crear variante');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar esta variante? Los registros históricos se mantendrán.')) return;
    try {
      const res = await fetch(`${API_URL}/product-variants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await loadVariants();
      } else {
        const data = await res.json();
        alert(data.error || 'Error al desactivar');
      }
    } catch (err) {
      alert('Error de red al desactivar');
    }
  };

  const handleToggleActive = async (variant: ProductVariant) => {
    try {
      const res = await fetch(`${API_URL}/product-variants/${variant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !variant.isActive })
      });
      if (res.ok) {
        await loadVariants();
      }
    } catch (err) {
      alert('Error al cambiar estado');
    }
  };

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      productId: variant.productId,
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      cost: variant.cost || 0,
      currentStock: parseInt(String(variant.currentStock)) || 0,
      description: variant.description || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant) return;
    setError(null);
    try {
      const res = await fetch(`${API_URL}/product-variants/${editingVariant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        await loadVariants();
        setIsEditModalOpen(false);
        setEditingVariant(null);
        setFormData({ productId: '', name: '', sku: '', price: 0, cost: 0, currentStock: 0, description: '' });
      } else {
        setError(data.error || 'Error actualizando variante');
      }
    } catch (err) {
      setError('Error de red al actualizar variante');
    }
  };

  const filteredVariants = variants.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedByProduct = filteredVariants.reduce((acc, variant) => {
    const productId = variant.productId;
    if (!acc[productId]) {
      acc[productId] = {
        product: variant.product,
        variants: []
      };
    }
    acc[productId].variants.push(variant);
    return acc;
  }, {} as Record<string, { product: Product; variants: ProductVariant[] }>);

  return (
    <div className="h-full bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
              title="Volver a Productos"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-purple-600" />
              Variantes de Productos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona tamaños, sabores y opciones de productos
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Variante
        </button>
      </div>

      {/* Stock Level Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-gray-600">Sin stock (0)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span className="text-gray-600">Stock bajo (1-10)</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-600">Stock normal (11+)</span>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar variantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <select
          value={selectedProductId}
          onChange={(e) => {
            setSelectedProductId(e.target.value);
            loadVariants();
          }}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Todos los productos</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Variants by Product */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Cargando...</div>
      ) : Object.keys(groupedByProduct).length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No se encontraron variantes
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByProduct).map(([productId, { product, variants }]) => (
            <div key={productId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Product Header */}
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <Package className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  <p className="text-sm text-gray-500">SKU: {product.sku} • Precio base: ${product.price}</p>
                </div>
                <span className="text-sm text-gray-500">{variants.length} variantes</span>
              </div>

              {/* Product Stock Summary */}
              <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-800 font-medium">
                    Stock total de {product.name}: {variants.filter(v => v.isActive).reduce((sum, v) => sum + (v.currentStock || 0), 0)} unidades
                  </span>
                  <span className="text-blue-600">
                    {variants.filter(v => v.currentStock <= 0).length > 0 && 
                      `⚠️ ${variants.filter(v => v.currentStock <= 0).length} sin stock`
                    }
                  </span>
                </div>
              </div>

              {/* Variants List */}
              <div className="divide-y divide-gray-100">
                {variants.map(variant => (
                  <div key={variant.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Tag className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{variant.name}</p>
                        <p className="text-sm text-gray-500">SKU: {variant.sku}</p>
                        {variant.description && (
                          <p className="text-xs text-gray-400">{variant.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-purple-600">${variant.price}</p>
                        {variant.cost && (
                          <p className="text-xs text-gray-500">Costo: ${variant.cost}</p>
                        )}
                        <p className={`text-xs font-medium ${
                          variant.currentStock <= 0 
                            ? 'text-red-600' 
                            : variant.currentStock <= 10 
                              ? 'text-orange-500' 
                              : 'text-gray-600'
                        }`}>
                          Stock: {variant.currentStock}
                          {variant.currentStock <= 0 && ' ⚠️'}
                          {variant.currentStock > 0 && variant.currentStock <= 10 && ' ⚡'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(variant)}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            variant.isActive 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {variant.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                        <button
                          onClick={() => handleEdit(variant)}
                          className="p-2 hover:bg-amber-50 text-amber-600 rounded-lg"
                          title="Editar variante"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(variant.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg"
                          title="Desactivar variante"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-gray-900">{variants.length}</p>
          <p className="text-sm text-gray-500">Total Variantes</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-green-600">{variants.filter(v => v.isActive).length}</p>
          <p className="text-sm text-gray-500">Activas</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-blue-600">
            {new Set(variants.map(v => v.productId)).size}
          </p>
          <p className="text-sm text-gray-500">Productos con variantes</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <p className="text-2xl font-bold text-purple-600">
            {variants.filter(v => v.isActive).reduce((sum, v) => sum + (v.currentStock || 0), 0)}
          </p>
          <p className="text-sm text-gray-500">Stock total (activas)</p>
          <p className="text-xs text-gray-400 mt-1">
            Inactivas: {variants.filter(v => !v.isActive).reduce((sum, v) => sum + (v.currentStock || 0), 0)}
          </p>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Nueva Variante</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" onClick={() => setError(null)} />
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de variante *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: Grande, 1L, Light, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    required
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="SKU único de la variante"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock inicial</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Descripción opcional"
                  />
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
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Crear
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Variant Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingVariant && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Editar Variante - {editingVariant.name}</h2>
                <button 
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingVariant(null);
                    setFormData({ productId: '', name: '', sku: '', price: 0, cost: 0, currentStock: 0, description: '' });
                  }} 
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <X className="w-4 h-4 flex-shrink-0" onClick={() => setError(null)} />
                  {error}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de variante *</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Ej: Grande, 1L, Light, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input
                    required
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="SKU único de la variante"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        required
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Costo</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                        className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock {editingVariant && (
                      <span className="text-gray-500 font-normal">
                        (Actual: <span className={editingVariant.currentStock <= 0 ? 'text-red-600 font-medium' : editingVariant.currentStock <= 10 ? 'text-orange-500 font-medium' : 'text-green-600 font-medium'}>
                          {editingVariant.currentStock}
                        </span>)
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={Number(formData.currentStock)}
                    onChange={(e) => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                      setFormData({ ...formData, currentStock: isNaN(val) ? 0 : val });
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  {editingVariant && Number(formData.currentStock) !== Number(editingVariant.currentStock) && (
                    <p className="text-xs mt-1 text-blue-600">
                      Cambio: {Number(formData.currentStock) > Number(editingVariant.currentStock) ? '+' : ''}
                      {Number(formData.currentStock) - Number(editingVariant.currentStock)} unidades
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Descripción opcional"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      setEditingVariant(null);
                      setFormData({ productId: '', name: '', sku: '', price: 0, cost: 0, currentStock: 0, description: '' });
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
