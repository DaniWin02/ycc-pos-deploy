import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, Search, X, Camera, Image as ImageIcon, Upload, Sparkles, GitBranch } from 'lucide-react';
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
  variants?: ProductVariant[];
  variantOptions?: { name: string; values: string[] }[];
  createdAt: string;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  options: Record<string, string>;
  isActive: boolean;
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
    const product = products.find(p => p.id === productId);
    if (product) {
      openModal(product);
      setActiveTab('variants');
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
    preparationTime: 0,
    hasVariants: false
  });
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Variant management states
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [variantOptions, setVariantOptions] = useState<{ name: string; values: string[] }[]>([]);
  const [activeTab, setActiveTab] = useState<'general' | 'variants'>('general');
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');

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
      
      // Build complete product data including variants
      const productData = {
        ...formData,
        hasVariants: formData.hasVariants || false,
        variants: formData.hasVariants ? variants : [],
        variantOptions: formData.hasVariants ? variantOptions : []
      };
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
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
        preparationTime: product.preparationTime || 0,
        hasVariants: product.hasVariants || false
      });
      setImagePreview(product.image || '');
      setVariants(product.variants || []);
      setVariantOptions(product.variantOptions || []);
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
        preparationTime: 0,
        hasVariants: false
      });
      setImagePreview('');
      setVariants([]);
      setVariantOptions([]);
    }
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    setActiveTab('general');
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
      preparationTime: 0,
      hasVariants: false
    });
    setVariants([]);
    setVariantOptions([]);
    setActiveTab('general');
    setEditingVariant(null);
    setShowVariantModal(false);
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

  // ===== VARIANT MANAGEMENT FUNCTIONS =====
  
  // Generate all possible combinations from variant options
  const generateVariantCombinations = (options: { name: string; values: string[] }[]): Record<string, string>[] => {
    if (options.length === 0) return [];
    
    const combinations: Record<string, string>[] = [];
    const generate = (index: number, current: Record<string, string>) => {
      if (index === options.length) {
        combinations.push({ ...current });
        return;
      }
      const option = options[index];
      for (const value of option.values) {
        current[option.name] = value;
        generate(index + 1, current);
      }
    };
    generate(0, {});
    return combinations;
  };

  // Add a new variant option (e.g., Talla, Color)
  const handleAddOption = () => {
    if (!newOptionName.trim()) return;
    const values = newOptionValues.split(',').map(v => v.trim()).filter(Boolean);
    if (values.length === 0) {
      alert('Ingresa al menos un valor para la opción');
      return;
    }
    setVariantOptions([...variantOptions, { name: newOptionName.trim(), values }]);
    setNewOptionName('');
    setNewOptionValues('');
  };

  // Remove a variant option
  const handleRemoveOption = (index: number) => {
    const optionName = variantOptions[index].name;
    setVariantOptions(variantOptions.filter((_, i) => i !== index));
    // Remove variants that use this option
    setVariants(variants.filter(v => !v.options[optionName]));
  };

  // Add a variant manually
  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: Date.now().toString(),
      name: '',
      sku: `${formData.sku || 'VAR'}-${(variants.length + 1).toString().padStart(3, '0')}`,
      price: formData.price,
      stock: 0,
      options: {},
      isActive: true
    };
    setVariants([...variants, newVariant]);
    setEditingVariant(newVariant);
    setShowVariantModal(true);
  };

  // Edit a variant
  const handleEditVariant = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setShowVariantModal(true);
  };

  // Delete a variant
  const handleDeleteVariant = (variantId: string) => {
    if (confirm('¿Eliminar esta variante?')) {
      setVariants(variants.filter(v => v.id !== variantId));
    }
  };

  // Save variant changes
  const handleSaveVariant = (updatedVariant: ProductVariant) => {
    setVariants(variants.map(v => v.id === updatedVariant.id ? updatedVariant : v));
    setEditingVariant(null);
    setShowVariantModal(false);
  };

  // Generate all variant combinations automatically
  const handleGenerateVariants = () => {
    if (variantOptions.length === 0) {
      alert('Agrega al menos una opción (ej: Talla, Color) antes de generar variantes');
      return;
    }
    
    const combinations = generateVariantCombinations(variantOptions);
    const newVariants: ProductVariant[] = combinations.map((options, index) => {
      const variantName = Object.entries(options).map(([key, val]) => `${key}: ${val}`).join(', ');
      return {
        id: Date.now().toString() + index,
        name: variantName,
        sku: `${formData.sku || 'VAR'}-${(index + 1).toString().padStart(3, '0')}`,
        price: formData.price,
        stock: 0,
        options,
        isActive: true
      };
    });
    
    setVariants(newVariants);
    alert(`${newVariants.length} variantes generadas automáticamente`);
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
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                      product.hasVariants
                        ? 'bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100'
                        : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Sparkles className={`w-4 h-4 ${product.hasVariants ? 'text-purple-600' : 'text-gray-400'}`} />
                    {product.hasVariants ? `Variantes (${product.variants?.length || 0})` : 'Agregar Variantes'}
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

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  type="button"
                  onClick={() => setActiveTab('general')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'general'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  General
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('variants')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                    activeTab === 'variants'
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Variantes
                  {formData.hasVariants && (
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                      {variants.length}
                    </span>
                  )}
                </button>
              </div>

              {activeTab === 'general' && (
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
              )}

              {/* VARIANTS TAB */}
              {activeTab === 'variants' && (
                <div className="space-y-6">
                  {/* Enable Variants Toggle */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">Activar Variantes</h3>
                      <p className="text-sm text-gray-500">Permite crear múltiples versiones de este producto (tallas, colores, etc.)</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasVariants}
                        onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {formData.hasVariants && (
                    <>
                      {/* Variant Options Configuration */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Opciones de Variante</h4>
                        <p className="text-sm text-gray-500 mb-4">Define las características que varían (ej: Talla, Color)</p>
                        
                        {/* Add Option Form */}
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            placeholder="Nombre (ej: Talla)"
                            value={newOptionName}
                            onChange={(e) => setNewOptionName(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <input
                            type="text"
                            placeholder="Valores separados por coma (ej: S, M, L, XL)"
                            value={newOptionValues}
                            onChange={(e) => setNewOptionValues(e.target.value)}
                            className="flex-2 px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
                          />
                          <button
                            type="button"
                            onClick={handleAddOption}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Agregar
                          </button>
                        </div>

                        {/* Options List */}
                        {variantOptions.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {variantOptions.map((option, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <span className="font-medium text-gray-900">{option.name}</span>
                                  <span className="text-gray-500 ml-2">: {option.values.join(', ')}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveOption(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Generate Variants Button */}
                        {variantOptions.length > 0 && (
                          <button
                            type="button"
                            onClick={handleGenerateVariants}
                            className="w-full py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 flex items-center justify-center gap-2"
                          >
                            <GitBranch className="w-4 h-4" />
                            Generar Variantes ({variantOptions.map(o => o.values.length).reduce((a, b) => a * b, 1)} combinaciones)
                          </button>
                        )}
                      </div>

                      {/* Variants List */}
                      {variants.length > 0 && (
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                            <h4 className="font-medium text-gray-900">Variantes ({variants.length})</h4>
                            <button
                              type="button"
                              onClick={handleAddVariant}
                              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Agregar Manual
                            </button>
                          </div>
                          <div className="max-h-64 overflow-y-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-gray-600">Variante</th>
                                  <th className="px-4 py-2 text-left text-gray-600">SKU</th>
                                  <th className="px-4 py-2 text-right text-gray-600">Precio</th>
                                  <th className="px-4 py-2 text-right text-gray-600">Stock</th>
                                  <th className="px-4 py-2 text-center text-gray-600">Activo</th>
                                  <th className="px-4 py-2 text-center text-gray-600">Acciones</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {variants.map((variant) => (
                                  <tr key={variant.id} className={!variant.isActive ? 'bg-gray-50' : ''}>
                                    <td className="px-4 py-2 font-medium text-gray-900">
                                      {variant.name || Object.entries(variant.options).map(([k, v]) => `${k}: ${v}`).join(', ')}
                                    </td>
                                    <td className="px-4 py-2 text-gray-600 font-mono text-xs">{variant.sku}</td>
                                    <td className="px-4 py-2 text-right text-gray-900">${Number(variant.price || 0).toFixed(2)}</td>
                                    <td className="px-4 py-2 text-right text-gray-900">{variant.stock}</td>
                                    <td className="px-4 py-2 text-center">
                                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs ${variant.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {variant.isActive ? 'Sí' : 'No'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                      <div className="flex items-center justify-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() => handleEditVariant(variant)}
                                          className="text-indigo-600 hover:text-indigo-700"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteVariant(variant.id)}
                                          className="text-red-500 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* No Variants Message */}
                      {variants.length === 0 && variantOptions.length > 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">Haz clic en "Generar Variantes" para crear automáticamente todas las combinaciones</p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Save Button */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Variant Edit Modal */}
      {showVariantModal && editingVariant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Editar Variante</h3>
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    value={editingVariant.name}
                    onChange={(e) => setEditingVariant({ ...editingVariant, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    placeholder="ej: Talla M - Color Rojo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={editingVariant.sku}
                    onChange={(e) => setEditingVariant({ ...editingVariant, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingVariant.price}
                      onChange={(e) => setEditingVariant({ ...editingVariant, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                    <input
                      type="number"
                      value={editingVariant.stock}
                      onChange={(e) => setEditingVariant({ ...editingVariant, stock: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="variantActive"
                    checked={editingVariant.isActive}
                    onChange={(e) => setEditingVariant({ ...editingVariant, isActive: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label htmlFor="variantActive" className="ml-2 text-sm text-gray-700">
                    Variante activa
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveVariant(editingVariant)}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
