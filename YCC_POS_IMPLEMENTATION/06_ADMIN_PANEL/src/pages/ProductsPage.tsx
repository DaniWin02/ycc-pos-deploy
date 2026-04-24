import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, Search, X, Camera, Image as ImageIcon, Upload, Sparkles } from 'lucide-react';
import { StationSelector } from '../components/StationSelector';
import { detectStation, getSuggestedStationName } from '../utils/stationAutoAssign';

interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  categoryId: string;
  stock?: number;
  currentStock?: number;
  image?: string;
  stationId?: string;
  station?: { id: string; name: string; displayName: string; color?: string };
  preparationTime?: number;
  isActive: boolean;
  hasVariants: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface Station {
  id: string;
  name: string;
  displayName: string;
  color?: string;
  isActive: boolean;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';

export const ProductsPage: React.FC<{ onNavigate?: (page: string, params?: any) => void }> = ({ onNavigate }) => {
  let navigate: any = null;
  try {
    navigate = useNavigate();
  } catch (e) {
    // No estamos en un Router context
  }

  const handleManageVariants = (productId: string) => {
    if (onNavigate) {
      onNavigate('product-variants', { productId });
    } else if (navigate) {
      navigate(`/admin/product-variants?productId=${productId}`);
    } else {
      window.location.href = `/admin/product-variants?productId=${productId}`;
    }
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    currentStock: 0,
    isActive: true,
    image: '',
    sku: '',
    stationId: '',
    preparationTime: 0
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Cargar productos, categorías y estaciones desde el API
  useEffect(() => {
    loadProducts();
    loadCategories();
    loadStations();
  }, []);
  
  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      setCategories([]);
    }
  };

  const loadStations = async () => {
    try {
      const response = await fetch(`${API_URL}/stations`);
      if (response.ok) {
        const data = await response.json();
        setStations(data.filter((s: Station) => s.isActive));
      }
    } catch (error) {
      console.error('Error cargando estaciones:', error);
    }
  };

  const createCategory = async (name: string) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: '' })
      });
      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
        setFormData({ ...formData, categoryId: newCategory.id });
        setShowNewCategoryInput(false);
        setNewCategoryName('');
        return newCategory.id;
      }
    } catch (error) {
      console.error('Error creando categoría:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.stationId) {
      alert('⚠️ Debes seleccionar una estación para el producto.');
      return;
    }
    try {
      const url = editingProduct 
        ? `${API_URL}/products/${editingProduct.id}`
        : `${API_URL}/products`;
      const method = editingProduct ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        alert(editingProduct ? '✅ Producto actualizado exitosamente' : '✅ Producto creado exitosamente');
        await loadProducts();
        closeModal();
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.error || 'Error desconocido'}`);
      }
    } catch (error) {
      alert('❌ Error de conexión.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        await loadProducts();
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        categoryId: product.categoryId || product.category || '',
        currentStock: product.stock || product.currentStock || 0,
        isActive: product.isActive,
        image: product.image || '',
        sku: product.sku,
        stationId: product.stationId || product.station?.id || '',
        preparationTime: product.preparationTime || 0
      });
      setImagePreview(product.image || '');
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        categoryId: categories.length > 0 ? categories[0].id : '',
        currentStock: 0,
        isActive: true,
        image: '',
        sku: '',
        stationId: '',
        preparationTime: 0
      });
      setImagePreview('');
    }
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImagePreview('');
    setFormData({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      currentStock: 0,
      isActive: true,
      image: '',
      sku: '',
      stationId: '',
      preparationTime: 0
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen válido (JPG, PNG, GIF)');
        return;
      }
      
      // Validar tamaño (máximo 1MB para evitar problemas con base64)
      const maxSize = 1 * 1024 * 1024; // 1MB en bytes
      if (file.size > maxSize) {
        alert('⚠️ La imagen es demasiado grande. El tamaño máximo es 1MB.\n\nTip: Reduce el tamaño de la imagen antes de subirla.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        
        // Verificar que el resultado base64 no sea demasiado grande
        const base64Size = result.length;
        const maxBase64Size = 1.5 * 1024 * 1024; // 1.5MB en base64
        
        if (base64Size > maxBase64Size) {
          alert('⚠️ La imagen codificada es demasiado grande. Por favor, usa una imagen más pequeña.');
          return;
        }
        
        console.log('📷 Imagen cargada:', {
          originalSize: (file.size / 1024).toFixed(2) + ' KB',
          base64Size: (base64Size / 1024).toFixed(2) + ' KB'
        });
        
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  // Función para asignar estación automáticamente basada en categoría y nombre
  const autoAssignStation = (categoryId: string, productName: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !productName || stations.length === 0) return;
    
    const detectedStationId = detectStation(category.name, productName, stations);
    if (detectedStationId) {
      const station = stations.find(s => s.id === detectedStationId);
      console.log(`✨ Estación detectada automáticamente: ${station?.displayName || detectedStationId}`);
      setFormData(prev => ({ ...prev, stationId: detectedStationId }));
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-600 mt-1">Gestiona el catálogo de productos</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
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

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando productos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-white relative overflow-hidden flex items-center justify-center border-b border-gray-200">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Package className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
                  {product.hasVariants && (
                    <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Variantes
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2 h-10">{product.description}</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-indigo-600">${Number(product.price).toFixed(2)}</span>
                  <span className={`text-sm font-medium ${
                    (product.stock || product.currentStock || 0) <= 0 
                      ? 'text-red-600' 
                      : (product.stock || product.currentStock || 0) <= 10 
                        ? 'text-orange-500' 
                        : 'text-green-600'
                  }`}>
                    Stock: {product.stock || product.currentStock || 0}
                    {(product.stock || product.currentStock || 0) <= 0 && ' ⚠️'}
                    {(product.stock || product.currentStock || 0) > 0 && (product.stock || product.currentStock || 0) <= 10 && ' ⚡'}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(product)}
                      className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleManageVariants(product.id)}
                    className="w-full flex items-center justify-center gap-2 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-2 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                  >
                    <Sparkles className="w-4 h-4" />
                    Gestionar Variantes
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                </h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const newName = e.target.value;
                      setFormData({ ...formData, name: newName });
                      // Asignar estación automáticamente si ya hay categoría seleccionada
                      if (formData.categoryId && newName && !formData.stationId) {
                        autoAssignStation(formData.categoryId, newName);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto</label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="space-y-3">
                        <div className="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                          <div className="h-64 flex items-center justify-center p-4">
                            <img 
                              src={imagePreview} 
                              alt="Vista previa"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleImageRemove}
                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <label className="cursor-pointer block">
                          <span className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                            <Upload className="w-4 h-4" />
                            Cambiar Imagen
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">No hay imagen seleccionada</p>
                        <label className="cursor-pointer">
                          <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                            <Upload className="w-4 h-4" />
                            Seleccionar Imagen
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Camera className="w-4 h-4" />
                      <span>Formatos: JPG, PNG, GIF. Máximo 5MB</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stock {editingProduct && (
                        <span className="text-gray-500 font-normal">
                          (Actual: <span className={(editingProduct.stock || editingProduct.currentStock || 0) <= 0 ? 'text-red-600 font-medium' : (editingProduct.stock || editingProduct.currentStock || 0) <= 10 ? 'text-orange-500 font-medium' : 'text-green-600 font-medium'}>
                            {editingProduct.stock || editingProduct.currentStock || 0}
                          </span>)
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.currentStock}
                      onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {editingProduct && formData.currentStock !== (editingProduct.stock || editingProduct.currentStock || 0) && (
                      <p className="text-xs mt-1 text-blue-600">
                        Cambio: {formData.currentStock > (editingProduct.stock || editingProduct.currentStock || 0) ? '+' : ''}
                        {formData.currentStock - (editingProduct.stock || editingProduct.currentStock || 0)} unidades
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                  {!showNewCategoryInput ? (
                    <div className="flex gap-2">
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) => {
                          if (e.target.value === '__new__') {
                            setShowNewCategoryInput(true);
                          } else {
                            const newCategoryId = e.target.value;
                            setFormData({ ...formData, categoryId: newCategoryId });
                            // Asignar estación automáticamente basada en la nueva categoría
                            if (newCategoryId && formData.name) {
                              autoAssignStation(newCategoryId, formData.name);
                            }
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        <option value="__new__" className="font-semibold text-indigo-600">+ Crear nueva categoría</option>
                      </select>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nombre de la nueva categoría"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (newCategoryName.trim()) {
                            await createCategory(newCategoryName.trim());
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Crear
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategoryName('');
                        }}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {/* Selector de Estación - OBLIGATORIO */}
                <StationSelector
                  value={formData.stationId}
                  onChange={(stationId) => setFormData({ ...formData, stationId })}
                  required={true}
                />

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Producto activo
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingProduct ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
