import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /products - Obtener todos los productos
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: true,
        station: true, // IMPORTANTE: Incluir estación
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        modifierGroups: {
          include: {
            modifierGroup: {
              include: {
                modifiers: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      },
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
      where: { id },
      include: {
        category: true,
        station: true,
        variants: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        },
        modifierGroups: {
          include: {
            modifierGroup: {
              include: {
                modifiers: {
                  where: { isActive: true }
                }
              }
            }
          }
        }
      }
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
    const { name, description, price, categoryId, sku, isActive, image, stationId, preparationTime } = req.body;
    
    console.log('📝 Creando producto:', { name, price, categoryId, stationId });
    
    // VALIDACIÓN OBLIGATORIA: stationId es requerido
    if (!stationId) {
      return res.status(400).json({ 
        error: 'Estación es requerida',
        details: 'Todos los productos deben tener una estación asignada'
      });
    }
    
    // Verificar que la estación existe
    const station = await prisma.station.findUnique({
      where: { id: stationId }
    });
    
    if (!station) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }
    
    const product = await prisma.product.create({
      data: {
        sku: sku || `PROD-${Date.now()}`,
        name,
        description: description || '',
        categoryId: categoryId || 'cmn93ybl30002mzmaou7c0e38', // Bebidas por defecto
        price: parseFloat(price),
        isActive: isActive !== undefined ? isActive : true,
        image: image || null,
        stationId, // OBLIGATORIO
        preparationTime: preparationTime ? parseInt(preparationTime) : null
      },
      include: {
        category: true,
        station: true // Incluir estación en respuesta
      }
    });
    
    console.log('✅ Producto creado:', product.id, 'en estación:', station.displayName);
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
    const { name, description, price, categoryId, sku, isActive, image, stationId, preparationTime, currentStock } = req.body;
    
    console.log('✏️ Actualizando producto:', id);
    
    // Verificar que el producto existe
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });
    
    if (!existingProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    // Construir objeto de actualización
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description || null;
    
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({ error: 'Precio inválido' });
      }
      updateData.price = parsedPrice;
    }
    
    if (categoryId !== undefined && categoryId !== '') updateData.categoryId = categoryId;
    
    if (sku !== undefined && sku !== '' && sku !== existingProduct.sku) {
      updateData.sku = sku;
    }
    
    if (isActive !== undefined) updateData.isActive = isActive;
    if (image !== undefined) updateData.image = image || null;
    
    if (stationId !== undefined && stationId !== '') {
      // Verificar que la nueva estación existe
      const station = await prisma.station.findUnique({ where: { id: stationId } });
      if (!station) return res.status(404).json({ error: 'Estación no encontrada' });
      updateData.stationId = stationId;
    }
    
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
    
    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        station: true
      }
    });
    
    res.json(product);
  } catch (error: any) {
    console.error('❌ Error actualizando producto:', error);
    if (error.code === 'P2002') return res.status(400).json({ error: 'El SKU ya está en uso' });
    res.status(500).json({ error: 'Error actualizando producto', details: error.message });
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
