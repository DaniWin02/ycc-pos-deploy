import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/modifier-groups
 * Obtener todos los grupos de modificadores
 */
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;

    const where = includeInactive === 'true' ? {} : { isActive: true };

    const groups = await prisma.modifierGroup.findMany({
      where,
      include: {
        modifiers: {
          where: includeInactive === 'true' ? {} : { isActive: true },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: { 
            modifiers: true,
            products: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(groups);
  } catch (error: any) {
    console.error('Error obteniendo grupos de modificadores:', error);
    res.status(500).json({ error: 'Error obteniendo grupos', details: error.message });
  }
});

/**
 * GET /api/modifier-groups/:id
 * Obtener un grupo específico con sus modificadores
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const group = await prisma.modifierGroup.findUnique({
      where: { id },
      include: {
        modifiers: {
          orderBy: { createdAt: 'asc' }
        },
        products: {
          include: {
            product: {
              select: { id: true, name: true, sku: true }
            }
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Grupo no encontrado' });
    }

    res.json(group);
  } catch (error: any) {
    console.error('Error obteniendo grupo:', error);
    res.status(500).json({ error: 'Error obteniendo grupo', details: error.message });
  }
});

/**
 * POST /api/modifier-groups
 * Crear nuevo grupo de modificadores
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, isRequired } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    const group = await prisma.modifierGroup.create({
      data: {
        name: name.trim(),
        description: description?.trim(),
        isRequired: isRequired ?? false,
        isActive: true
      }
    });

    console.log(`✅ Grupo de modificadores creado: ${group.name}`);
    res.status(201).json(group);
  } catch (error: any) {
    console.error('Error creando grupo:', error);
    res.status(500).json({ error: 'Error creando grupo', details: error.message });
  }
});

/**
 * PUT /api/modifier-groups/:id
 * Actualizar grupo de modificadores
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isRequired, isActive } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (isRequired !== undefined) updateData.isRequired = isRequired;
    if (isActive !== undefined) updateData.isActive = isActive;

    const group = await prisma.modifierGroup.update({
      where: { id },
      data: updateData,
      include: {
        modifiers: true
      }
    });

    console.log(`✅ Grupo actualizado: ${group.name}`);
    res.json(group);
  } catch (error: any) {
    console.error('Error actualizando grupo:', error);
    res.status(500).json({ error: 'Error actualizando grupo', details: error.message });
  }
});

/**
 * DELETE /api/modifier-groups/:id
 * Desactivar grupo (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene productos asignados
    const productsCount = await prisma.productModifierGroup.count({
      where: { 
        modifierGroupId: id,
        product: { isActive: true }
      }
    });

    if (productsCount > 0) {
      return res.status(400).json({
        error: 'No se puede desactivar',
        details: `Tiene ${productsCount} productos asignados. Desasigna primero.`
      });
    }

    // Soft delete del grupo y sus modificadores
    await prisma.$transaction([
      prisma.modifier.updateMany({
        where: { modifierGroupId: id },
        data: { isActive: false }
      }),
      prisma.modifierGroup.update({
        where: { id },
        data: { isActive: false }
      })
    ]);

    console.log(`✅ Grupo desactivado: ${id}`);
    res.json({ success: true, message: 'Grupo desactivado' });
  } catch (error: any) {
    console.error('Error desactivando grupo:', error);
    res.status(500).json({ error: 'Error desactivando grupo', details: error.message });
  }
});

export default router;
