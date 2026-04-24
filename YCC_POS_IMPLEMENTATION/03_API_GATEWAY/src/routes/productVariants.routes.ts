import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/product-variants
 * Obtener todas las variantes (con filtro opcional por producto)
 */
router.get('/', async (req, res) => {
  try {
    const { productId, includeInactive } = req.query;

    const where: any = {};
    if (productId) where.productId = productId as string;
    if (includeInactive !== 'true') where.isActive = true;

    const variants = await prisma.productVariant.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            image: true
          }
        }
      },
      orderBy: [
        { productId: 'asc' },
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(variants);
  } catch (error: any) {
    console.error('Error obteniendo variantes:', error);
    res.status(500).json({ error: 'Error obteniendo variantes', details: error.message });
  }
});

/**
 * GET /api/product-variants/:id
 * Obtener una variante específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await prisma.productVariant.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            image: true,
            price: true
          }
        }
      }
    });

    if (!variant) {
      return res.status(404).json({ error: 'Variante no encontrada' });
    }

    res.json(variant);
  } catch (error: any) {
    console.error('Error obteniendo variante:', error);
    res.status(500).json({ error: 'Error obteniendo variante', details: error.message });
  }
});

/**
 * POST /api/product-variants
 * Crear nueva variante
 */
router.post('/', async (req, res) => {
  try {
    const { productId, name, sku, price, cost, currentStock, image, description, sortOrder } = req.body;

    if (!productId || !name || !sku || price === undefined) {
      return res.status(400).json({ error: 'Producto, nombre, SKU y precio son requeridos' });
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar SKU único en todas las variantes
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku }
    });

    if (existingSku) {
      return res.status(409).json({ error: 'Ya existe una variante con ese SKU' });
    }

    // Verificar nombre único para este producto
    const existingName = await prisma.productVariant.findFirst({
      where: { productId, name }
    });

    if (existingName) {
      return res.status(409).json({ error: `El producto ya tiene una variante llamada "${name}"` });
    }

    // Usar transacción para crear la variante y actualizar el producto
    const variant = await prisma.$transaction(async (tx) => {
      const newVariant = await tx.productVariant.create({
        data: {
          productId,
          name,
          sku,
          price: parseFloat(price),
          cost: cost ? parseFloat(cost) : null,
          currentStock: currentStock ? parseFloat(currentStock) : 0,
          image: image || null,
          description: description || null,
          sortOrder: sortOrder || 0
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          }
        }
      });

      // Si es la primera variante, marcar el producto como con variantes
      if (!product.hasVariants) {
        await tx.product.update({
          where: { id: productId },
          data: { hasVariants: true }
        });
      }

      return newVariant;
    });

    console.log(`✅ Variante creada: ${variant.name} (${variant.sku})`);
    res.status(201).json(variant);
  } catch (error: any) {
    console.error('Error creando variante:', error);
    res.status(500).json({ error: 'Error creando variante', details: error.message });
  }
});

/**
 * PUT /api/product-variants/:id
 * Actualizar variante
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, price, cost, currentStock, image, description, sortOrder, isActive } = req.body;

    // Verificar si existe la variante
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id }
    });

    if (!existingVariant) {
      return res.status(404).json({ error: 'Variante no encontrada' });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (cost !== undefined) updateData.cost = cost ? parseFloat(cost) : null;
    if (currentStock !== undefined) updateData.currentStock = parseFloat(currentStock);
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;

    const variant = await prisma.productVariant.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      }
    });

    console.log(`✅ Variante actualizada: ${variant.name}`);
    res.json(variant);
  } catch (error: any) {
    console.error('Error actualizando variante:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Conflicto: El SKU o el nombre ya están en uso' });
    }
    res.status(500).json({ error: 'Error actualizando variante', details: error.message });
  }
});

/**
 * DELETE /api/product-variants/:id
 * Desactivar variante (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const variant = await prisma.$transaction(async (tx) => {
      const updated = await tx.productVariant.update({
        where: { id },
        data: { isActive: false }
      });

      // Verificar si quedan variantes activas para el producto
      const activeVariantsCount = await tx.productVariant.count({
        where: { 
          productId: updated.productId,
          isActive: true
        }
      });

      // Si ya no hay variantes activas, podríamos marcar el producto como sin variantes activas
      // pero mantenemos hasVariants=true porque la configuración existe.
      
      return updated;
    });

    console.log(`✅ Variante desactivada: ${variant.name}`);
    res.json(variant);
  } catch (error: any) {
    console.error('Error desactivando variante:', error);
    res.status(500).json({ error: 'Error desactivando variante', details: error.message });
  }
});

/**
 * GET /api/product-variants/product/:productId
 * Obtener variantes de un producto específico
 */
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    const { includeInactive } = req.query;

    const where: any = { productId };
    if (includeInactive !== 'true') where.isActive = true;

    const variants = await prisma.productVariant.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(variants);
  } catch (error: any) {
    console.error('Error obteniendo variantes del producto:', error);
    res.status(500).json({ error: 'Error obteniendo variantes', details: error.message });
  }
});

export default router;
