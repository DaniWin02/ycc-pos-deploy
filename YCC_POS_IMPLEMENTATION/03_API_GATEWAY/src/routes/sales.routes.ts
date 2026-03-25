import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /sales - Obtener todas las ventas
router.get('/', async (req, res) => {
  try {
    const { status, terminalId, startDate, endDate } = req.query;
    
    const where: any = {};
    if (status) where.status = status;
    if (terminalId) where.terminalId = terminalId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    const sales = await prisma.order.findMany({
      where,
      include: {
        items: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        terminal: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Ventas obtenidas: ${sales.length}`);
    res.json(sales);
  } catch (error: any) {
    console.error('❌ Error obteniendo ventas:', error);
    res.status(500).json({ 
      error: 'Error obteniendo ventas',
      details: error.message 
    });
  }
});

// GET /sales/:id - Obtener venta específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sale = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        terminal: true,
        payments: true
      }
    });
    
    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    res.json(sale);
  } catch (error: any) {
    console.error('❌ Error obteniendo venta:', error);
    res.status(500).json({ 
      error: 'Error obteniendo venta',
      details: error.message 
    });
  }
});

// POST /sales - Crear nueva venta
router.post('/', async (req, res) => {
  try {
    const { 
      items, 
      totalAmount, 
      subtotal, 
      taxAmount, 
      paymentMethod, 
      cashReceived, 
      change,
      terminalId, 
      userId,
      customerName,
      notes
    } = req.body;
    
    console.log('💰 Creando nueva venta:', { totalAmount, items: items?.length, paymentMethod });
    
    // Validaciones
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
    }
    
    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({ error: 'El monto total debe ser mayor a 0' });
    }
    
    // Generar folio único
    const folio = `SALE-${Date.now().toString(36).toUpperCase()}`;
    
    // Crear venta con items y pago
    const sale = await prisma.order.create({
      data: {
        folio,
        totalAmount: parseFloat(totalAmount),
        subtotal: parseFloat(subtotal || totalAmount),
        taxAmount: parseFloat(taxAmount || 0),
        status: 'COMPLETED',
        terminalId: terminalId || 'terminal-main',
        createdByUserId: userId || 'user-cashier',
        storeId: 'store-main',
        customerName: customerName || null,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId || item.id,
            productName: item.name,
            sku: item.sku || `SKU-${item.id}`,
            quantity: String(item.quantity),
            unitPrice: String(item.unitPrice || item.price),
            totalPrice: String(item.quantity * (item.unitPrice || item.price)),
            taxAmount: String(item.taxAmount || 0),
            modifiers: JSON.stringify(item.modifiers || [])
          }))
        },
        payments: {
          create: {
            method: paymentMethod || 'CASH',
            amount: String(totalAmount),
            status: 'CAPTURED'
          }
        }
      },
      include: {
        items: true,
        payments: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        terminal: true
      }
    });
    
    console.log('✅ Venta creada exitosamente:', sale.folio);
    
    // TODO: Emitir evento WebSocket para KDS
    // io.emit('sale:created', sale);
    
    res.status(201).json(sale);
  } catch (error: any) {
    console.error('❌ ERROR CRÍTICO creando venta:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('Body recibido:', req.body);
    res.status(500).json({ 
      error: 'Error creando venta',
      details: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// PUT /sales/:id - Actualizar estado de venta (para KDS)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    console.log('🔄 Actualizando venta:', { id, status });
    
    const sale = await prisma.order.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined,
        updatedAt: new Date()
      },
      include: {
        items: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        terminal: true,
        payments: true
      }
    });
    
    console.log('✅ Venta actualizada:', sale.folio);
    
    // TODO: Emitir evento WebSocket
    // io.emit('sale:updated', sale);
    
    res.json(sale);
  } catch (error: any) {
    console.error('❌ Error actualizando venta:', error);
    res.status(500).json({ 
      error: 'Error actualizando venta',
      details: error.message 
    });
  }
});

// GET /sales/stats/summary - Estadísticas de ventas
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    const [totalSales, salesCount, avgSale] = await Promise.all([
      prisma.order.aggregate({
        where,
        _sum: { totalAmount: true }
      }),
      prisma.order.count({ where }),
      prisma.order.aggregate({
        where,
        _avg: { totalAmount: true }
      })
    ]);
    
    res.json({
      totalSales: totalSales._sum.totalAmount || 0,
      salesCount,
      averageSale: avgSale._avg.totalAmount || 0
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ 
      error: 'Error obteniendo estadísticas',
      details: error.message 
    });
  }
});

export default router;
