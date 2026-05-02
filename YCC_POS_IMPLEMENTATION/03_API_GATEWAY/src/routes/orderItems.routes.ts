import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// PATCH /order-items/:id/status - Actualizar estado de un item individual
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    // Validar que el status sea válido
    const validStatuses = ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    // Actualizar el item
    const updatedItem = await prisma.orderItem.update({
      where: { id },
      data: { 
        status,
        updatedAt: new Date()
      }
    });
    
    console.log(`✅ Item actualizado: ${id} → ${status}`);
    
    // Verificar si todos los items de la orden están DELIVERED
    const order = await prisma.order.findUnique({
      where: { id: updatedItem.orderId },
      include: { items: true }
    });
    
    if (order) {
      const allDelivered = order.items.every(item => item.status === 'COMPLETED');
      const anyReady = order.items.some(item => item.status === 'READY');
      const anyPreparing = order.items.some(item => item.status === 'PREPARING');
      
      let newOrderStatus = order.status;
      
      if (allDelivered) {
        newOrderStatus = 'DELIVERED';
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            status: 'DELIVERED',
            completedAt: new Date()
          }
        });
        console.log(`✅ Orden completa: ${order.id} → DELIVERED`);
      } else if (anyReady) {
        newOrderStatus = 'READY';
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'READY' }
        });
      } else if (anyPreparing) {
        newOrderStatus = 'PREPARING';
        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PREPARING' }
        });
      }
    }
    
    res.json(updatedItem);
  } catch (error: any) {
    console.error('❌ Error actualizando item:', error);
    res.status(500).json({ 
      error: 'Error actualizando item',
      details: error.message 
    });
  }
});

// GET /order-items/:id - Obtener item específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const item = await prisma.orderItem.findUnique({
      where: { id },
      include: {
        order: true
      }
    });
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    
    res.json(item);
  } catch (error: any) {
    console.error('❌ Error obteniendo item:', error);
    res.status(500).json({ 
      error: 'Error obteniendo item',
      details: error.message 
    });
  }
});

export default router;
