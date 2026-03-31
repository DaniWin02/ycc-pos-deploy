import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/orders
 * Obtener órdenes con filtros opcionales
 */
router.get('/', async (req, res) => {
  try {
    const { status, station, limit = '50' } = req.query;

    const where: any = {};

    // Filtrar por estado(s)
    if (status) {
      const statuses = (status as string).split(',').map(s => s.trim().toUpperCase());
      where.status = { in: statuses };
    }

    // Filtrar por estación (a través de los items)
    let orders;
    if (station) {
      orders = await prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: true,
          terminal: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string)
      });

      // Nota: Filtrado por estación deshabilitado temporalmente
      // hasta que se agregue la relación product al schema
      // orders = orders.filter(order => 
      //   order.items.some(item => 
      //     item.product?.category?.station === station
      //   )
      // );
    } else {
      orders = await prisma.order.findMany({
        where,
        include: {
          items: true,
          customer: true,
          terminal: true,
          createdBy: true
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string)
      });
    }

    res.json(orders);
  } catch (error: any) {
    console.error('Error obteniendo órdenes:', error);
    res.status(500).json({ error: 'Error obteniendo órdenes', details: error.message });
  }
});

/**
 * GET /api/orders/:id
 * Obtener una orden específica
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        customer: true,
        terminal: true,
        createdBy: true,
        payments: true
      }
    });

    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json(order);
  } catch (error: any) {
    console.error('Error obteniendo orden:', error);
    res.status(500).json({ error: 'Error obteniendo orden', details: error.message });
  }
});

/**
 * PATCH /api/orders/:id/status
 * Cambiar estado de una orden
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Estado requerido' });
    }

    // Validar estado
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Estado inválido', 
        validStatuses 
      });
    }

    // Preparar datos de actualización
    const updateData: any = { status }
    if (status === 'DELIVERED') {
      updateData.completedAt = new Date()
    }
    
    console.log(`📝 Actualizando orden ${id} a estado: ${status}`)
    
    // Actualizar orden
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        customer: true,
        terminal: true
      }
    });

    // Emitir evento Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('order:updated', {
        id: order.id,
        folio: order.folio,
        status: order.status,
        items: order.items,
        updatedAt: order.updatedAt
      });

      console.log(`📡 Socket.io: order:updated emitido para orden ${order.folio}`);
    }

    res.json(order);
  } catch (error: any) {
    console.error('❌ Error actualizando estado de orden:', error);
    console.error('❌ Error completo:', JSON.stringify(error, null, 2));
    res.status(500).json({ 
      error: 'Error actualizando estado', 
      details: error.message,
      code: error.code 
    });
  }
});

/**
 * PATCH /api/orders/:id/items/:itemId/status
 * Cambiar estado de un item específico
 */
router.patch('/:id/items/:itemId/status', async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Estado requerido' });
    }

    // Validar estado
    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Estado inválido', 
        validStatuses 
      });
    }

    // Actualizar item
    const item = await prisma.orderItem.update({
      where: { id: itemId },
      data: { status }
    });

    // Obtener orden completa
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true
      }
    });

    // Emitir evento Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('order:updated', {
        id: order?.id,
        folio: order?.folio,
        status: order?.status,
        items: order?.items,
        updatedAt: order?.updatedAt
      });

      console.log(`📡 Socket.io: order:updated emitido para item ${itemId}`);
    }

    res.json(item);
  } catch (error: any) {
    console.error('Error actualizando estado de item:', error);
    res.status(500).json({ error: 'Error actualizando estado de item', details: error.message });
  }
});

export default router;
