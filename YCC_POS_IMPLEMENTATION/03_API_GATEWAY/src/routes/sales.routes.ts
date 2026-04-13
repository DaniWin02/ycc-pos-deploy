import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Helper function para obtener el máximo número de folio del día - OPTIMIZED
async function getNextFolioNumber(todayStart: Date, todayEnd: Date): Promise<number> {
  // Usar aggregate con count es más eficiente que traer todos los registros
  const countResult = await prisma.order.count({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd
      }
    }
  });

  console.log(`📊 getNextFolioNumber:`);
  console.log(`   Rango: ${todayStart.toISOString()} a ${todayEnd.toISOString()}`);
  console.log(`   Total de ventas hoy: ${countResult}`);

  if (countResult === 0) {
    console.log(`   ✅ No hay ventas hoy, iniciando desde 1`);
    return 1;
  }

  // Si hay ventas, obtener solo los folios necesarios (limitado)
  // Asumimos que no habrá más de 1000 ventas por día
  const todaySales = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd
      }
    },
    select: {
      folio: true
    },
    orderBy: {
      folio: 'desc'
    },
    take: 100 // Solo traemos los últimos 100 folios
  });

  console.log(`   📋 Analizando ${todaySales.length} folios recientes`);

  // Encontrar el número máximo del formato YYMMDD-NNN
  let maxNumber = 0;
  for (const sale of todaySales) {
    if (sale.folio && sale.folio.includes('-')) {
      const parts = sale.folio.split('-');
      const num = parseInt(parts[1]);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }

  // Si no encontramos un número válido, usar el conteo total
  if (maxNumber === 0) {
    maxNumber = countResult;
  }

  console.log(`   ✅ Máximo número encontrado: ${maxNumber}, siguiente: ${maxNumber + 1}`);
  return maxNumber + 1;
}

// Generar folio único con reintento usando transacción
async function createOrderWithUniqueFolio(orderData: any, todayStart: Date, todayEnd: Date, datePrefix: string) {
  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      // Obtener el siguiente número de folio disponible
      const nextNumber = await getNextFolioNumber(todayStart, todayEnd);
      // Formato de folio: YYMMDD-NNN (ej: 260412-001)
      const shortDate = datePrefix.substring(2); // YYMMDD de YYYYMMDD
      const folio = `${shortDate}-${String(nextNumber).padStart(3, '0')}`;

      console.log(`📋 Intentando crear orden con folio: ${folio} (intento ${attempts + 1}/${maxAttempts})`);
      
      // Verificar si el folio ya existe antes de crear
      const existingFolio = await prisma.order.findUnique({ where: { folio } });
      if (existingFolio) {
        console.log(`   ❌ Folio ya existe: ${folio} (id: ${existingFolio.id})`);
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 50));
        continue;
      }
      console.log(`   ✅ Folio disponible, creando orden...`);

      // Intentar crear la orden con este folio
      const order = await prisma.order.create({
        data: {
          ...orderData,
          folio
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

      console.log(`✅ Orden creada exitosamente con folio: ${folio}`);
      return order;
    } catch (error: any) {
      // Si es error de folio duplicado, reintentar
      if (error.code === 'P2002') {
        attempts++;
        const detailedError = `⚠️ P2002 Folio duplicado | Attempt ${attempts}/${maxAttempts} | Target: ${error.target} | Meta: ${JSON.stringify(error.meta)} | Folio: ${folio}`;
        console.log(detailedError);

        // En el tercer intento, lanzar error con detalles
        if (attempts >= maxAttempts) {
          throw new Error(detailedError);
        }

        // Esperar solo 50ms antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 50));
        continue;
      }
      // Otro tipo de error, lanzar inmediatamente con detalles
      console.error(`❌ Error creando orden (código: ${error.code}):`);
      console.error(`   Mensaje:`, error.message);
      console.error(`   Meta:`, error.meta);
      console.error(`   Stack:`, error.stack);
      throw error;
    }
  }

  throw new Error('No se pudo generar un folio único después de múltiples intentos');
}

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
    
    // Generar folio con fecha UTC para consistencia con la base de datos
    const now = new Date();

    // Usar UTC para evitar problemas de zona horaria
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    // Inicio y fin del día en UTC para búsquedas precisas
    const todayStart = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
    const todayEnd = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));

    console.log(`💰 Creando venta para fecha UTC: ${datePrefix}`);
    console.log(`   Rango UTC: ${todayStart.toISOString()} a ${todayEnd.toISOString()}`);

    // Preparar datos de la orden
    const orderData = {
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
          stationId: item.stationId
        }))
      },
      payments: {
        create: {
          method: paymentMethod || 'CASH',
          amount: String(totalAmount),
          status: 'CAPTURED'
        }
      }
    };

    // Crear orden con folio único usando la función especializada
    // Ahora usa folios con formato: YYMMDD-001, YYMMDD-002, etc.
    let sale;
    try {
      sale = await createOrderWithUniqueFolio(orderData, todayStart, todayEnd, datePrefix);
    } catch (error: any) {
      console.error('❌ Error creando orden con folio único:', error.message);
      console.error('   Código:', error.code);
      console.error('   Target:', error.target);
      console.error('   Meta:', JSON.stringify(error.meta, null, 2));
      console.error('   Stack:', error.stack);
      
      // Return detailed error for debugging
      throw new Error(`${error.message} | Code: ${error.code} | Target: ${error.target} | Meta: ${JSON.stringify(error.meta)}`);
    }
    
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

// PUT /sales/:id - Actualizar venta (estado, notas, método de pago)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, paymentMethod } = req.body;
    
    console.log('🔄 Actualizando venta:', { id, status, paymentMethod });
    
    // Verificar que la venta existe
    const existingSale = await prisma.order.findUnique({
      where: { id },
      include: { 
        payments: true,
        items: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        terminal: true
      }
    });
    
    if (!existingSale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    // Si se proporciona un nuevo método de pago, actualizar SOLO el pago
    if (paymentMethod) {
      // Mapear valores del frontend a valores válidos del enum Prisma
      const paymentMethodMap: Record<string, string> = {
        'CASH': 'CASH',
        'CREDIT_CARD': 'CARD',
        'DEBIT_CARD': 'CARD',
        'CARD': 'CARD',
        'MEMBER_ACCOUNT': 'MEMBER_ACCOUNT',
        'TRANSFER': 'CARD'
      };
      
      const mappedPaymentMethod = paymentMethodMap[paymentMethod] || 'CASH';
      console.log(`🔄 Mapeando método de pago: ${paymentMethod} → ${mappedPaymentMethod}`);
      
      if (existingSale.payments && existingSale.payments.length > 0) {
        // Actualizar el primer pago encontrado
        const paymentId = existingSale.payments[0].id;
        
        try {
          await prisma.payment.update({
            where: { id: paymentId },
            data: { 
              method: mappedPaymentMethod as any
            }
          });
          console.log('✅ Método de pago actualizado:', mappedPaymentMethod);
        } catch (paymentError: any) {
          console.error('❌ Error actualizando pago:', paymentError);
          return res.status(500).json({ 
            error: 'Error actualizando método de pago',
            details: paymentError.message 
          });
        }
      } else {
        // Si no hay pagos, crear uno nuevo
        try {
          await prisma.payment.create({
            data: {
              orderId: id,
              method: mappedPaymentMethod as any,
              amount: existingSale.totalAmount,
              status: 'CAPTURED'
            }
          });
          console.log('✅ Pago creado:', mappedPaymentMethod);
        } catch (paymentError: any) {
          console.error('❌ Error creando pago:', paymentError);
          return res.status(500).json({ 
            error: 'Error creando pago',
            details: paymentError.message 
          });
        }
      }
    }
    
    // Preparar datos a actualizar en la orden
    const updateData: any = {};
    
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;
    
    // Solo actualizar la orden si hay cambios
    let updatedSale = existingSale;
    if (Object.keys(updateData).length > 0) {
      updatedSale = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          items: true,
          createdBy: {
            select: { id: true, firstName: true, lastName: true, username: true }
          },
          terminal: true,
          payments: true
        }
      });
    } else {
      // Si solo se actualizó el pago, recargar la venta con los pagos actualizados
      updatedSale = await prisma.order.findUnique({
        where: { id },
        include: {
          items: true,
          createdBy: {
            select: { id: true, firstName: true, lastName: true, username: true }
          },
          terminal: true,
          payments: true
        }
      }) || existingSale;
    }
    
    console.log('✅ Venta actualizada:', updatedSale.folio);
    
    res.json(updatedSale);
  } catch (error: any) {
    console.error('❌ Error actualizando venta:', error);
    res.status(500).json({ 
      error: 'Error actualizando venta',
      details: error.message,
      stack: error.stack
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

// GET /sales/folios/stats - Obtener estadísticas de folios
router.get('/folios/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    const totalSales = await prisma.order.count({ where });
    
    // Obtener folios agrupados por día
    const salesByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where,
      _count: { id: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Agrupar por día
    const foliosByDay = salesByDay.reduce((acc: any, sale) => {
      const date = new Date(sale.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += sale._count.id;
      return acc;
    }, {});
    
    res.json({
      totalSales,
      foliosByDay,
      dateRange: {
        start: startDate || 'all',
        end: endDate || 'all'
      }
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo estadísticas de folios:', error);
    res.status(500).json({ 
      error: 'Error obteniendo estadísticas',
      details: error.message 
    });
  }
});

// DELETE /sales/folios/history - Eliminar historial de folios por rango de fechas
router.delete('/folios/history', async (req, res) => {
  try {
    const { startDate, endDate, confirm } = req.body;
    
    // Validación de confirmación
    if (confirm !== true) {
      return res.status(400).json({ 
        error: 'Debe confirmar la eliminación enviando confirm: true' 
      });
    }
    
    // Validación de fechas
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Debe proporcionar startDate y endDate' 
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({ 
        error: 'La fecha de inicio debe ser anterior a la fecha de fin' 
      });
    }
    
    console.log(`🗑️ Eliminando ventas entre ${start.toISOString()} y ${end.toISOString()}`);
    
    // Contar ventas a eliminar
    const countToDelete = await prisma.order.count({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    });
    
    if (countToDelete === 0) {
      return res.json({
        message: 'No se encontraron ventas en el rango especificado',
        deletedCount: 0
      });
    }
    
    // Eliminar en transacción
    const result = await prisma.$transaction(async (tx) => {
      // Primero eliminar items de las órdenes
      const deletedItems = await tx.orderItem.deleteMany({
        where: {
          order: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        }
      });
      
      // Luego eliminar pagos
      const deletedPayments = await tx.payment.deleteMany({
        where: {
          order: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        }
      });
      
      // Finalmente eliminar las órdenes
      const deletedOrders = await tx.order.deleteMany({
        where: {
          createdAt: {
            gte: start,
            lte: end
          }
        }
      });
      
      return {
        deletedOrders: deletedOrders.count,
        deletedItems: deletedItems.count,
        deletedPayments: deletedPayments.count
      };
    });
    
    console.log(`✅ Eliminadas ${result.deletedOrders} ventas con sus items y pagos`);
    
    res.json({
      message: 'Historial de folios eliminado exitosamente',
      deletedCount: result.deletedOrders,
      details: result,
      dateRange: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    });
  } catch (error: any) {
    console.error('❌ Error eliminando historial de folios:', error);
    res.status(500).json({ 
      error: 'Error eliminando historial',
      details: error.message 
    });
  }
});

export default router;
