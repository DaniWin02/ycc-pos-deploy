import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /sales/customer/:customerName - Obtener historial de pedidos por nombre de cliente
router.get('/customer/:customerName', async (req, res) => {
  try {
    const { customerName } = req.params;
    
    console.log(`🔍 Buscando historial de pedidos para cliente: ${customerName}`);
    
    const orders = await prisma.order.findMany({
      where: {
        customerName: {
          contains: customerName,
          mode: 'insensitive'
        }
      },
      include: {
        items: {
          select: {
            productName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true
          }
        },
        payments: {
          select: {
            method: true,
            amount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📋 Encontrados ${orders.length} pedidos para ${customerName}`);
    
    res.json({
      customerName,
      totalOrders: orders.length,
      orders: orders.map(order => ({
        id: order.id,
        folio: order.folio,
        totalAmount: Number(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt,
        items: order.items,
        paymentMethod: order.payments[0]?.method || 'N/A'
      }))
    });
  } catch (error) {
    console.error('❌ Error obteniendo historial de cliente:', error);
    res.status(500).json({ error: 'Error al obtener historial de pedidos' });
  }
});

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
    
    // Obtener información de productos para cada item (incluyendo stationId)
    const salesWithStations = await Promise.all(
      sales.map(async (sale) => {
        const itemsWithStations = await Promise.all(
          sale.items.map(async (item) => {
            const product = await prisma.product.findUnique({
              where: { id: item.productId },
              select: {
                id: true,
                stationId: true,
                station: {
                  select: {
                    id: true,
                    name: true,
                    displayName: true
                  }
                }
              }
            });
            
            return {
              ...item,
              stationId: product?.stationId,
              product: product
            };
          })
        );
        
        return {
          ...sale,
          items: itemsWithStations
        };
      })
    );
    
    console.log(`📊 Ventas obtenidas: ${salesWithStations.length}`);
    res.json(salesWithStations);
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
    
    // Generar folio diario (formato #001, #002, etc. que resetea cada día)
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    // Contar ventas del día actual
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    const todaySalesCount = await prisma.order.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });
    
    // Folio diario: #001, #002, #003, etc.
    const dailyNumber = todaySalesCount + 1;
    const folio = `#${String(dailyNumber).padStart(3, '0')}`;
    
    console.log(`📋 Generando folio diario: ${folio} (fecha: ${dateKey}, ventas hoy: ${todaySalesCount})`);
    
    // Crear venta con items y pago
    const sale = await prisma.order.create({
      data: {
        folio,
        totalAmount: parseFloat(totalAmount),
        subtotal: parseFloat(subtotal || totalAmount),
        taxAmount: parseFloat(taxAmount || 0),
        status: 'PENDING',
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
            modifiers: JSON.stringify(item.modifiers || []),
            stationId: item.stationId  // 👈 CRÍTICO: Guardar estación del item
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
    
    // AGRUPAR ITEMS POR ESTACIÓN Y EMITIR SOCKET.IO
    try {
      const io = req.app.get('io');
      if (io && items.length > 0) {
        // Agrupar items por estación
        const itemsByStation = new Map<string, any[]>();
        
        items.forEach((item: any) => {
          if (item.stationId) {
            if (!itemsByStation.has(item.stationId)) {
              itemsByStation.set(item.stationId, []);
            }
            itemsByStation.get(item.stationId)!.push({
              productId: item.productId,
              name: item.name,
              quantity: item.quantity,
              unitPrice: item.price || item.unitPrice,
              stationName: item.stationName
            });
          }
        });
        
        // Emitir evento a cada estación
        itemsByStation.forEach((stationItems, stationId) => {
          const stationName = stationItems[0]?.stationName || 'Estación';
          
          io.to(`station-${stationId}`).emit('order:new', {
            orderId: sale.id,
            folio: sale.folio,
            stationId,
            stationName,
            items: stationItems,
            customerName: sale.customerName || 'Mostrador',
            totalAmount: sale.totalAmount,
            createdAt: sale.createdAt,
            status: sale.status
          });
          
          console.log(`📡 Orden ${sale.folio} enviada a estación: ${stationName} (${stationItems.length} items)`);
        });
        
        // También emitir evento general para monitoreo
        io.emit('sale:created', {
          folio: sale.folio,
          totalAmount: sale.totalAmount,
          itemCount: items.length,
          stationCount: itemsByStation.size
        });
      }
    } catch (socketError) {
      console.warn('⚠️ Error emitiendo evento Socket.io:', socketError);
      // No fallar la venta si Socket.io falla
    }
    
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
