import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ error: 'Error obteniendo productos' });
  }
});

// GET /products/:id - Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ error: 'Error obteniendo producto' });
  }
});

// POST /products - Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { name, description, price, categoryId, sku, isActive, image, station, preparationTime } = req.body;
    
    console.log('📝 Creando producto:', { name, price, categoryId });
    
    const product = await prisma.product.create({
      data: {
        sku: sku || `PROD-${Date.now()}`,
        name,
        description: description || '',
        categoryId: categoryId || 'cat-bebidas',
        price: parseFloat(price),
        isActive: isActive !== undefined ? isActive : true,
        image: image || null,
        station: station || null,
        preparationTime: preparationTime ? parseInt(preparationTime) : null
      }
    });
    
    console.log('✅ Producto creado:', product.id);
    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creando producto:', error);
    res.status(500).json({ error: 'Error creando producto', details: error.message });
  }
});

// PUT /products/:id - Actualizar un producto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, categoryId, sku, isActive, image, station, preparationTime, currentStock } = req.body;
    
    console.log('✏️ Actualizando producto:', id);
    console.log('📦 Datos recibidos:', { 
      name, 
      price, 
      categoryId, 
      hasImage: !!image,
      imageSize: image ? image.length : 0 
    });
    
    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Construir objeto de actualización solo con campos definidos
    const updateData: any = {};
    
    if (name !== undefined && name !== '') updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Precio inválido' });
      }
      updateData.price = parsedPrice;
    }
    
    if (categoryId !== undefined && categoryId !== '') updateData.categoryId = categoryId;
    
    // Solo actualizar SKU si es diferente y no está vacío
    if (sku !== undefined && sku !== '' && sku !== existingProduct.sku) {
      updateData.sku = sku;
    }
    
    if (isActive !== undefined) updateData.isActive = isActive;
    if (image !== undefined) updateData.image = image || null;
    if (station !== undefined) updateData.station = station || null;
    
    if (preparationTime !== undefined) {
      const parsed = parseInt(preparationTime);
      updateData.preparationTime = isNaN(parsed) ? null : parsed;
    }
    
    if (currentStock !== undefined) {
      const parsed = parseFloat(currentStock);
      if (!isNaN(parsed)) {
        updateData.currentStock = parsed;
      }
    }
    
    console.log('🔄 Campos a actualizar:', Object.keys(updateData));
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });
    
    console.log('✅ Producto actualizado exitosamente:', product.id);
    res.json(product);
  } catch (error: any) {
    console.error('❌ Error actualizando producto:', error);
    console.error('Stack:', error.stack);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        error: 'El SKU ya está en uso por otro producto',
        details: error.message 
      });
    }
    
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'Producto no encontrado',
        details: error.message 
      });
    }
    
    res.status(500).json({ 
      error: 'Error actualizando producto', 
      details: error.message,
      code: error.code 
    });
  }
});

// DELETE /products/:id - Eliminar un producto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.product.delete({
      where: { id }
    });
    
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ error: 'Error eliminando producto' });
  }
});

export default router;
