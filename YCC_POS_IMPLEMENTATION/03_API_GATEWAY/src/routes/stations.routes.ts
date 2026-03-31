import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/stations
 * Obtener todas las estaciones
 */
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;

    const where = includeInactive === 'true' ? {} : { isActive: true };

    const stations = await prisma.station.findMany({
      where,
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { displayName: 'asc' }
    });

    res.json(stations);
  } catch (error: any) {
    console.error('Error obteniendo estaciones:', error);
    res.status(500).json({ error: 'Error obteniendo estaciones', details: error.message });
  }
});

/**
 * GET /api/stations/:id
 * Obtener una estación específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const station = await prisma.station.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            image: true
          }
        }
      }
    });

    if (!station) {
      return res.status(404).json({ error: 'Estación no encontrada' });
    }

    res.json(station);
  } catch (error: any) {
    console.error('Error obteniendo estación:', error);
    res.status(500).json({ error: 'Error obteniendo estación', details: error.message });
  }
});

/**
 * POST /api/stations
 * Crear nueva estación
 */
router.post('/', async (req, res) => {
  try {
    const { name, displayName, color } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({ error: 'Nombre y nombre de visualización son requeridos' });
    }

    // Normalizar nombre
    const normalizedName = name
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    // Verificar si ya existe
    const existing = await prisma.station.findUnique({
      where: { name: normalizedName }
    });

    if (existing) {
      return res.status(409).json({ error: 'Ya existe una estación con ese nombre' });
    }

    const station = await prisma.station.create({
      data: {
        name: normalizedName,
        displayName,
        color: color || '#6B7280'
      }
    });

    console.log(`✅ Estación creada: ${station.displayName}`);
    res.status(201).json(station);
  } catch (error: any) {
    console.error('Error creando estación:', error);
    res.status(500).json({ error: 'Error creando estación', details: error.message });
  }
});

/**
 * PUT /api/stations/:id
 * Actualizar estación
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, color, isActive } = req.body;

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (color !== undefined) updateData.color = color;
    if (isActive !== undefined) updateData.isActive = isActive;

    const station = await prisma.station.update({
      where: { id },
      data: updateData
    });

    console.log(`✅ Estación actualizada: ${station.displayName}`);
    res.json(station);
  } catch (error: any) {
    console.error('Error actualizando estación:', error);
    res.status(500).json({ error: 'Error actualizando estación', details: error.message });
  }
});

/**
 * DELETE /api/stations/:id
 * Desactivar estación (soft delete)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar si tiene productos asignados
    const productsCount = await prisma.product.count({
      where: { stationId: id, isActive: true }
    });

    if (productsCount > 0) {
      return res.status(400).json({
        error: 'No se puede desactivar la estación',
        details: `Tiene ${productsCount} productos activos asignados`
      });
    }

    const station = await prisma.station.update({
      where: { id },
      data: { isActive: false }
    });

    console.log(`✅ Estación desactivada: ${station.displayName}`);
    res.json(station);
  } catch (error: any) {
    console.error('Error desactivando estación:', error);
    res.status(500).json({ error: 'Error desactivando estación', details: error.message });
  }
});

export default router;
