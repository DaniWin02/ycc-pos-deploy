import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /cash-movements - Obtener movimientos de caja
router.get('/', async (req, res) => {
  try {
    const { cashSessionId, shiftId, userId, type, startDate, endDate } = req.query;
    
    const where: any = {};
    if (cashSessionId) where.cashSessionId = cashSessionId;
    if (shiftId) where.shiftId = shiftId;
    if (userId) where.userId = userId;
    if (type) where.type = type;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    const movements = await prisma.cashMovement.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        cashSession: {
          select: { id: true, terminalId: true, openedAt: true, closedAt: true }
        },
        shift: {
          select: { id: true, startedAt: true, endedAt: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(movements);
  } catch (error: any) {
    console.error('❌ Error obteniendo movimientos:', error);
    res.status(500).json({ 
      error: 'Error obteniendo movimientos de caja',
      details: error.message 
    });
  }
});

// POST /cash-movements - Registrar movimiento de caja
router.post('/', async (req, res) => {
  try {
    const { 
      cashSessionId, 
      shiftId, 
      userId, 
      type, 
      amount, 
      paymentMethod, 
      reference, 
      description 
    } = req.body;
    
    console.log('💰 Registrando movimiento de caja:', { type, amount, description });
    
    if (!userId || !type || !amount || !description) {
      return res.status(400).json({ 
        error: 'Faltan campos requeridos: userId, type, amount, description' 
      });
    }
    
    const movement = await prisma.cashMovement.create({
      data: {
        cashSessionId: cashSessionId || null,
        shiftId: shiftId || null,
        userId,
        type,
        amount: new Prisma.Decimal(amount),
        paymentMethod: paymentMethod || null,
        reference: reference || null,
        description
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
      }
    });
    
    console.log('✅ Movimiento registrado:', movement.id);
    res.status(201).json(movement);
  } catch (error: any) {
    console.error('❌ Error registrando movimiento:', error);
    res.status(500).json({ 
      error: 'Error registrando movimiento de caja',
      details: error.message 
    });
  }
});

// GET /cash-movements/summary - Obtener resumen de movimientos
router.get('/summary', async (req, res) => {
  try {
    const { cashSessionId, shiftId, startDate, endDate } = req.query;
    
    const where: any = {};
    if (cashSessionId) where.cashSessionId = cashSessionId;
    if (shiftId) where.shiftId = shiftId;
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate as string);
      if (endDate) where.createdAt.lte = new Date(endDate as string);
    }
    
    const movements = await prisma.cashMovement.findMany({
      where
    });
    
    const summary = {
      total: movements.length,
      byType: {
        SALE: movements.filter(m => m.type === 'SALE').reduce((sum, m) => sum + Number(m.amount), 0),
        OPENING: movements.filter(m => m.type === 'OPENING').reduce((sum, m) => sum + Number(m.amount), 0),
        CLOSING: movements.filter(m => m.type === 'CLOSING').reduce((sum, m) => sum + Number(m.amount), 0),
        WITHDRAWAL: movements.filter(m => m.type === 'WITHDRAWAL').reduce((sum, m) => sum + Number(m.amount), 0),
        DEPOSIT: movements.filter(m => m.type === 'DEPOSIT').reduce((sum, m) => sum + Number(m.amount), 0),
        ADJUSTMENT: movements.filter(m => m.type === 'ADJUSTMENT').reduce((sum, m) => sum + Number(m.amount), 0)
      },
      byPaymentMethod: {
        CASH: movements.filter(m => m.paymentMethod === 'CASH').reduce((sum, m) => sum + Number(m.amount), 0),
        CARD: movements.filter(m => m.paymentMethod === 'CARD').reduce((sum, m) => sum + Number(m.amount), 0),
        MEMBER_ACCOUNT: movements.filter(m => m.paymentMethod === 'MEMBER_ACCOUNT').reduce((sum, m) => sum + Number(m.amount), 0)
      }
    };
    
    res.json(summary);
  } catch (error: any) {
    console.error('❌ Error generando resumen:', error);
    res.status(500).json({ 
      error: 'Error generando resumen de movimientos',
      details: error.message 
    });
  }
});

export default router;
