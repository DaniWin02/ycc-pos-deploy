import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/modifiers
 * Obtener todos los modificadores (opciones)
 */
router.get('/', async (req, res) => {
  try {
    const { groupId, includeInactive } = req.query;

    const where: any = {};
    
    if (groupId) {
      where.modifierGroupId = groupId;
    }
    
    if (includeInactive !== 'true') {
      where.isActive = true;
    }

    const modifiers = await prisma.modifier.findMany({
      where,
      include: {
        modifierGroup: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(modifiers);
  } catch (error: any) {
    console.error('Error obteniendo modificadores:', error);
    res.status(500).json({ error: 'Error obteniendo modificadores', details: error.message });
  }
});

/**
 * GET /api/modifiers/:id
 * Obtener un modificador específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const modifier = await prisma.modifier.findUnique({
      where: { id },
      include: {
        modifierGroup: true
      }
    });

    if (!modifier) {
      return res.status(404).json({ error: 'Modificador no encontrado' });
    }

    res.json(modifier);
  } catch (error: any) {
    console.error('Error obteniendo modificador:', error);
    res.status(500).json({ error: 'Error obteniendo modificador', details: error.message });
  }
});

/**
 * POST /api/modifiers
 * Crear nuevo modificador (opción)
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, priceAdd, modifierGroupId, sortOrder, isAvailable } = req.body;

    if (!name || !modifierGroupId) {
      return res.status(400).json({ error: 'Nombre y grupo son requeridos' });
    }

    // Verificar que el grupo existe
    const group = await prisma.modifierGroup.findUnique({
      where: { id: modifierGroupId }
    });

    if (!group) {
      return res.status(404).json({ error: 'Grupo de modificadores no encontrado' });
    }

    const modifier = await prisma.modifier.create({
      data: {
        id: `${modifierGroupId}-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
        name: name.trim(),
        description: description?.trim(),
        priceAdd: priceAdd ?? 0,
        modifierGroupId,
        isActive: true,
      }
    });

    console.log(`✅ Modificador creado: ${modifier.name} (+$${modifier.priceAdd})`);
    res.status(201).json(modifier);
  } catch (error: any) {
    console.error('Error creando modificador:', error);
    res.status(500).json({ error: 'Error creando modificador', details: error.message });
  }
});

/**
 * PUT /api/modifiers/:id
 * Actualizar modificador
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priceAdd, sortOrder, isActive, isAvailable } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim();
    if (priceAdd !== undefined) updateData.priceAdd = priceAdd;
    if (isActive !== undefined) updateData.isActive = isActive;

    const modifier = await prisma.modifier.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ Modificador actualizado: ${modifier.name}`);
    res.json(modifier);
  } catch (error: any) {
    console.error('Error actualizando modificador:', error);
    res.status(500).json({ error: 'Error actualizando modificador', details: error.message });
  }
});

/**
 * DELETE /api/modifiers/:id
 * Desactivar modificador (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const modifier = await prisma.modifier.update({
      where: { id },
      data: { isActive: false }
    });

    console.log(`✅ Modificador desactivado: ${modifier.name}`);
    res.json({ success: true, message: 'Modificador desactivado' });
  } catch (error: any) {
    console.error('Error desactivando modificador:', error);
    res.status(500).json({ error: 'Error desactivando modificador', details: error.message });
  }
});

export default router;
