import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/product-modifier-groups
 * Obtener todas las asignaciones (con filtros opcionales)
 */
router.get('/', async (req, res) => {
  try {
    const { productId, modifierGroupId } = req.query;

    const where: any = {};
    if (productId) where.productId = productId as string;
    if (modifierGroupId) where.modifierGroupId = modifierGroupId as string;

    const assignments = await prisma.productModifierGroup.findMany({
      where,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            image: true,
            price: true,
            isActive: true
          }
        },
        modifierGroup: {
          select: {
            id: true,
            name: true,
            description: true,
            isRequired: true,
            isActive: true,
            _count: {
              select: { modifiers: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(assignments);
  } catch (error: any) {
    console.error('Error obteniendo asignaciones:', error);
    res.status(500).json({ error: 'Error obteniendo asignaciones', details: error.message });
  }
});

/**
 * GET /api/product-modifier-groups/products-with-modifiers
 * Obtener productos con sus grupos de modificadores asignados
 */
router.get('/products-with-modifiers', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        sku: true,
        image: true,
        price: true,
        modifierGroups: {
          include: {
            modifierGroup: {
              select: {
                id: true,
                name: true,
                description: true,
                isRequired: true,
                _count: { select: { modifiers: true } }
              }
            }
          }
        },
        station: {
          select: {
            id: true,
            displayName: true,
            color: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.json(products);
  } catch (error: any) {
    console.error('Error obteniendo productos con modificadores:', error);
    res.status(500).json({ error: 'Error obteniendo productos', details: error.message });
  }
});

/**
 * POST /api/product-modifier-groups
 * Crear nueva asignación
 */
router.post('/', async (req, res) => {
  try {
    const { productId, modifierGroupId } = req.body;

    if (!productId || !modifierGroupId) {
      return res.status(400).json({ error: 'Producto y grupo de modificadores son requeridos' });
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Verificar que el grupo de modificadores existe
    const modifierGroup = await prisma.modifierGroup.findUnique({
      where: { id: modifierGroupId }
    });

    if (!modifierGroup) {
      return res.status(404).json({ error: 'Grupo de modificadores no encontrado' });
    }

    // Verificar que no exista duplicado
    const existing = await prisma.productModifierGroup.findUnique({
      where: {
        productId_modifierGroupId: {
          productId,
          modifierGroupId
        }
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Este modificador ya está asignado a este producto' });
    }

    const assignment = await prisma.productModifierGroup.create({
      data: { productId, modifierGroupId },
      include: {
        product: {
          select: { id: true, name: true, sku: true, image: true }
        },
        modifierGroup: {
          select: { id: true, name: true, description: true, isRequired: true }
        }
      }
    });

    console.log(`✅ Modificador '${assignment.modifierGroup.name}' asignado a '${assignment.product.name}'`);
    res.status(201).json(assignment);
  } catch (error: any) {
    console.error('Error creando asignación:', error);
    res.status(500).json({ error: 'Error creando asignación', details: error.message });
  }
});

/**
 * DELETE /api/product-modifier-groups/:id
 * Eliminar asignación
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.productModifierGroup.delete({
      where: { id },
      include: {
        product: { select: { name: true } },
        modifierGroup: { select: { name: true } }
      }
    });

    console.log(`✅ Asignación eliminada: ${assignment.modifierGroup.name} de ${assignment.product.name}`);
    res.json({ message: 'Asignación eliminada correctamente', assignment });
  } catch (error: any) {
    console.error('Error eliminando asignación:', error);
    res.status(500).json({ error: 'Error eliminando asignación', details: error.message });
  }
});

/**
 * DELETE /api/product-modifier-groups
 * Eliminar asignación por producto y grupo (alternativa al :id)
 */
router.delete('/', async (req, res) => {
  try {
    const { productId, modifierGroupId } = req.query;

    if (!productId || !modifierGroupId) {
      return res.status(400).json({ error: 'Se requieren productId y modifierGroupId' });
    }

    const assignment = await prisma.productModifierGroup.delete({
      where: {
        productId_modifierGroupId: {
          productId: productId as string,
          modifierGroupId: modifierGroupId as string
        }
      },
      include: {
        product: { select: { name: true } },
        modifierGroup: { select: { name: true } }
      }
    });

    console.log(`✅ Asignación eliminada: ${assignment.modifierGroup.name} de ${assignment.product.name}`);
    res.json({ message: 'Asignación eliminada correctamente', assignment });
  } catch (error: any) {
    console.error('Error eliminando asignación:', error);
    res.status(500).json({ error: 'Error eliminando asignación', details: error.message });
  }
});

export default router;
