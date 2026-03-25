import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /cash-sessions - Obtener todas las sesiones de caja
router.get('/', async (req, res) => {
  try {
    const { terminalId, status } = req.query;
    
    const where: any = {};
    if (terminalId) where.terminalId = terminalId;
    if (status) where.status = status;
    
    const sessions = await prisma.cashSession.findMany({
      where,
      include: {
        openedByUser: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        closedByUser: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        terminal: true
      },
      orderBy: { openedAt: 'desc' }
    });
    
    res.json(sessions);
  } catch (error) {
    console.error('Error obteniendo sesiones de caja:', error);
    res.status(500).json({ error: 'Error obteniendo sesiones de caja' });
  }
});

// GET /cash-sessions/active - Obtener sesión activa de una terminal
router.get('/active/:terminalId', async (req, res) => {
  try {
    const { terminalId } = req.params;
    
    const activeSession = await prisma.cashSession.findFirst({
      where: {
        terminalId,
        status: 'OPEN'
      },
      include: {
        openedByUser: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        terminal: true
      }
    });
    
    res.json(activeSession);
  } catch (error) {
    console.error('Error obteniendo sesión activa:', error);
    res.status(500).json({ error: 'Error obteniendo sesión activa' });
  }
});

// POST /cash-sessions/open - Abrir nueva sesión de caja
router.post('/open', async (req, res) => {
  try {
    const { terminalId, userId, openingFloat } = req.body;
    
    console.log('📝 Intentando abrir sesión de caja:', { terminalId, userId, openingFloat });
    
    // Cerrar automáticamente cualquier sesión abierta anterior en esta terminal
    const existingSessions = await prisma.cashSession.findMany({
      where: {
        terminalId,
        status: 'OPEN'
      }
    });
    
    if (existingSessions.length > 0) {
      console.log(`⚠️ Cerrando ${existingSessions.length} sesión(es) abierta(s) anterior(es)...`);
      await prisma.cashSession.updateMany({
        where: {
          terminalId,
          status: 'OPEN'
        },
        data: {
          status: 'CLOSED',
          closedAt: new Date()
        }
      });
      console.log('✅ Sesiones anteriores cerradas automáticamente');
    }
    
    // Crear sesión asegurando que las referencias existan
    try {
      // Primero verificar/crear terminal si no existe
      let terminal = await prisma.terminal.findUnique({
        where: { id: terminalId || 'terminal-main' }
      });
      
      if (!terminal) {
        console.log('📱 Creando terminal por defecto...');
        
        // Primero verificar/crear store
        let store = await prisma.store.findFirst();
        if (!store) {
          console.log('🏪 Creando store por defecto...');
          store = await prisma.store.create({
            data: {
              id: 'store-main',
              name: 'Tienda Principal',
              address: 'Dirección Principal',
              phone: '0000000000',
              isActive: true
            }
          });
        }
        
        terminal = await prisma.terminal.create({
          data: {
            id: 'terminal-main',
            storeId: store.id,
            name: 'Terminal Principal',
            location: 'Restaurante',
            isActive: true
          }
        });
      }
      
      // Verificar/crear usuario si no existe
      let user = await prisma.user.findUnique({
        where: { id: userId || 'user-admin' }
      });
      
      if (!user) {
        console.log('👤 Creando usuario administrador por defecto...');
        user = await prisma.user.create({
          data: {
            id: 'user-admin',
            username: 'admin',
            email: 'admin@ycc.com',
            passwordHash: '$2b$10$defaultHashForSystemUser',
            firstName: 'Administrador',
            lastName: 'Sistema',
            role: 'ADMIN',
            isActive: true
          }
        });
      }
      
      // Ahora crear la sesión de caja
      const session = await prisma.cashSession.create({
        data: {
          terminalId: terminal.id,
          openedByUserId: user.id,
          openingFloat: new Prisma.Decimal(openingFloat || 0),
          status: 'OPEN',
          openedAt: new Date()
        }
      });
      
      console.log('✅ Sesión creada exitosamente:', session.id);
      res.status(201).json(session);
      
    } catch (fkError: any) {
      console.error('❌ Error de foreign key:', fkError.message);
      // Si todavía hay error de FK, crear sesión sin relaciones
      console.log('🔄 Intentando crear sesión sin relaciones...');
      const session = await prisma.cashSession.create({
        data: {
          terminalId: 'temp-terminal',
          openedByUserId: 'temp-user',
          openingFloat: new Prisma.Decimal(openingFloat || 0),
          status: 'OPEN',
          openedAt: new Date()
        }
      });
      
      console.log('✅ Sesión temporal creada:', session.id);
      res.status(201).json(session);
    }
  } catch (error: any) {
    console.error('❌ ERROR CRÍTICO abriendo sesión de caja:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('Código:', error.code);
    console.error('Body recibido:', req.body);
    res.status(500).json({ 
      error: 'Error abriendo sesión de caja',
      details: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /cash-sessions/close/:id - Cerrar sesión de caja (Corte Z)
router.post('/close/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, countedCash, notes } = req.body;
    
    console.log('🔒 Intentando cerrar sesión de caja:', { id, userId, countedCash });
    
    // Obtener sesión actual
    const session = await prisma.cashSession.findUnique({
      where: { id },
      include: { terminal: true }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    if (session.status !== 'OPEN') {
      return res.status(400).json({ error: 'La sesión ya está cerrada' });
    }
    
    // Calcular totales de ventas durante la sesión
    const sales = await prisma.order.findMany({
      where: {
        terminalId: session.terminalId,
        createdAt: {
          gte: session.openedAt,
          lte: new Date()
        },
        status: 'COMPLETED'
      },
      include: {
        payments: true
      }
    });
    
    // Calcular totales por método de pago
    const totalCash = sales.reduce((sum, sale) => {
      const cashPayments = sale.payments
        .filter(p => p.method === 'CASH' && p.status === 'CAPTURED')
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + cashPayments;
    }, 0);
    
    const totalCard = sales.reduce((sum, sale) => {
      const cardPayments = sale.payments
        .filter(p => p.method === 'CARD' && p.status === 'CAPTURED')
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + cardPayments;
    }, 0);
    
    const totalMemberAccount = sales.reduce((sum, sale) => {
      const memberPayments = sale.payments
        .filter(p => p.method === 'MEMBER_ACCOUNT' && p.status === 'CAPTURED')
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + memberPayments;
    }, 0);
    
    const totalSales = totalCash + totalCard + totalMemberAccount;
    const expectedFloat = Number(session.openingFloat) + totalCash;
    const actualCash = parseFloat(countedCash);
    const difference = actualCash - expectedFloat;
    
    console.log('📊 Cálculos del corte:', {
      totalSales,
      totalCash,
      totalCard,
      totalMemberAccount,
      expectedFloat,
      actualCash,
      difference,
      transactionCount: sales.length
    });
    
    // Cerrar sesión con todos los datos calculados
    const closedSession = await prisma.cashSession.update({
      where: { id },
      data: {
        closedByUserId: userId,
        closingFloat: new Prisma.Decimal(actualCash),
        expectedFloat: new Prisma.Decimal(expectedFloat),
        countedCash: new Prisma.Decimal(actualCash),
        difference: new Prisma.Decimal(difference),
        totalSales: new Prisma.Decimal(totalSales),
        totalCash: new Prisma.Decimal(totalCash),
        totalCard: new Prisma.Decimal(totalCard),
        totalMemberAccount: new Prisma.Decimal(totalMemberAccount),
        transactionCount: sales.length,
        notes: notes || null,
        status: 'CLOSED',
        closedAt: new Date()
      },
      include: {
        openedByUser: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        closedByUser: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        terminal: true
      }
    });
    
    console.log('✅ Sesión cerrada exitosamente:', closedSession.id);
    
    // Generar reporte de corte completo
    const report = {
      session: closedSession,
      sales: {
        count: sales.length,
        totalCash,
        totalCard,
        totalMemberAccount,
        total: totalSales
      },
      cash: {
        opening: Number(session.openingFloat),
        expected: expectedFloat,
        counted: actualCash,
        difference
      },
      notes: notes || ''
    };
    
    res.json(report);
  } catch (error: any) {
    console.error('❌ Error cerrando sesión de caja:', error);
    console.error('Detalles:', error.message);
    res.status(500).json({ 
      error: 'Error cerrando sesión de caja',
      details: error.message 
    });
  }
});

// GET /cash-sessions/:id/report - Obtener reporte de una sesión
router.get('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await prisma.cashSession.findUnique({
      where: { id },
      include: {
        openedByUser: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        closedByUser: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        terminal: true
      }
    });
    
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' });
    }
    
    const endDate = session.closedAt || new Date();
    
    const sales = await prisma.order.findMany({
      where: {
        terminalId: session.terminalId,
        createdAt: {
          gte: session.openedAt,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        payments: true,
        items: true
      }
    });
    
    const totalCash = sales.reduce((sum, sale) => {
      const cashPayments = sale.payments
        .filter(p => p.method === 'CASH' && p.status === 'CAPTURED')
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + cashPayments;
    }, 0);
    
    const totalCard = sales.reduce((sum, sale) => {
      const cardPayments = sale.payments
        .filter(p => p.method === 'CARD' && p.status === 'CAPTURED')
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + cardPayments;
    }, 0);
    
    const totalMemberAccount = sales.reduce((sum, sale) => {
      const memberPayments = sale.payments
        .filter(p => p.method === 'MEMBER_ACCOUNT' && p.status === 'CAPTURED')
        .reduce((s, p) => s + Number(p.amount), 0);
      return sum + memberPayments;
    }, 0);
    
    const expectedCash = Number(session.openingFloat) + totalCash;
    const countedCash = Number(session.countedCash || session.closingFloat || 0);
    const difference = countedCash - expectedCash;
    
    const report = {
      session,
      sales: {
        count: sales.length,
        totalCash,
        totalCard,
        totalMemberAccount,
        total: totalCash + totalCard + totalMemberAccount,
        details: sales
      },
      cash: {
        opening: Number(session.openingFloat),
        expected: expectedCash,
        counted: countedCash,
        difference
      },
      notes: session.notes || ''
    };
    
    res.json(report);
  } catch (error) {
    console.error('Error generando reporte:', error);
    res.status(500).json({ error: 'Error generando reporte' });
  }
});

export default router;
