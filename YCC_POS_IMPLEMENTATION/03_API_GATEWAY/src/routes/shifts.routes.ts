import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /shifts/start - Iniciar turno
router.post('/start', async (req, res) => {
  try {
    const { userId, terminalId } = req.body;
    
    console.log('🕐 Iniciando turno:', { userId, terminalId });
    
    // Cerrar automáticamente cualquier turno activo anterior del usuario
    const activeShifts = await prisma.shift.findMany({
      where: {
        userId,
        status: 'ACTIVE'
      }
    });
    
    if (activeShifts.length > 0) {
      console.log(`⚠️ Cerrando ${activeShifts.length} turno(s) activo(s) anterior(es)...`);
      await prisma.shift.updateMany({
        where: {
          userId,
          status: 'ACTIVE'
        },
        data: {
          status: 'ENDED',
          endedAt: new Date()
        }
      });
      console.log('✅ Turnos anteriores cerrados automáticamente');
    }
    
    // Crear nuevo turno
    const shift = await prisma.shift.create({
      data: {
        userId,
        terminalId,
        status: 'ACTIVE',
        startedAt: new Date()
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
      }
    });
    
    console.log('✅ Turno iniciado:', shift.id);
    res.status(201).json(shift);
  } catch (error: any) {
    console.error('❌ ERROR CRÍTICO iniciando turno:');
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('Código:', error.code);
    console.error('Body recibido:', req.body);
    res.status(500).json({ 
      error: 'Error iniciando turno',
      details: error.message,
      code: error.code,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /shifts/end/:id - Finalizar turno
router.post('/end/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    console.log('🛑 Finalizando turno:', id);
    
    const shift = await prisma.shift.findUnique({
      where: { id }
    });
    
    if (!shift) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    
    if (shift.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'El turno ya está finalizado' });
    }
    
    // Verificar que no haya sesiones de caja abiertas
    const openSessions = await prisma.cashSession.findMany({
      where: {
        shiftId: id,
        status: 'OPEN'
      }
    });
    
    if (openSessions.length > 0) {
      return res.status(400).json({ 
        error: 'Debes cerrar todas las sesiones de caja antes de finalizar el turno',
        openSessions: openSessions.length
      });
    }
    
    // Calcular totales del turno
    const sessions = await prisma.cashSession.findMany({
      where: { shiftId: id }
    });
    
    const totalSales = sessions.reduce((sum, s) => sum + Number(s.totalSales || 0), 0);
    const transactionCount = sessions.reduce((sum, s) => sum + (s.transactionCount || 0), 0);
    
    // Finalizar turno
    const endedShift = await prisma.shift.update({
      where: { id },
      data: {
        status: 'ENDED',
        endedAt: new Date(),
        totalSales,
        transactionCount,
        notes: notes || null
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
      }
    });
    
    console.log('✅ Turno finalizado:', endedShift.id);
    res.json(endedShift);
  } catch (error: any) {
    console.error('❌ Error finalizando turno:', error);
    res.status(500).json({ 
      error: 'Error finalizando turno',
      details: error.message 
    });
  }
});

// GET /shifts/current/:userId - Obtener turno actual de un usuario
router.get('/current/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      console.log(`⚠️ Usuario no encontrado: ${userId}`);
      return res.status(404).json({ 
        error: 'Usuario no encontrado',
        message: `El usuario ${userId} no existe en la base de datos. Ejecute /api/init-data para crear los usuarios por defecto.`
      });
    }
    
    const currentShift = await prisma.shift.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        cashSessions: {
          where: { status: 'OPEN' }
        }
      }
    });
    
    res.json(currentShift);
  } catch (error: any) {
    console.error('❌ Error obteniendo turno actual:', error);
    res.status(500).json({ 
      error: 'Error obteniendo turno actual',
      details: error.message 
    });
  }
});

// GET /shifts - Obtener todos los turnos
router.get('/', async (req, res) => {
  try {
    const { userId, status, terminalId } = req.query;
    
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;
    if (terminalId) where.terminalId = terminalId;
    
    const shifts = await prisma.shift.findMany({
      where,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true }
        }
      },
      orderBy: { startedAt: 'desc' }
    });
    
    res.json(shifts);
  } catch (error: any) {
    console.error('❌ Error obteniendo turnos:', error);
    res.status(500).json({ 
      error: 'Error obteniendo turnos',
      details: error.message 
    });
  }
});

// GET /shifts/:id/report - Obtener reporte de un turno
router.get('/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    
    const shift = await prisma.shift.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, username: true }
        },
        cashSessions: {
          include: {
            terminal: true
          }
        }
      }
    });
    
    if (!shift) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    
    const report = {
      shift,
      summary: {
        duration: shift.endedAt 
          ? Math.floor((shift.endedAt.getTime() - shift.startedAt.getTime()) / 1000 / 60) 
          : null,
        totalSales: Number(shift.totalSales || 0),
        transactionCount: shift.transactionCount || 0,
        sessionsCount: shift.cashSessions.length
      }
    };
    
    res.json(report);
  } catch (error: any) {
    console.error('❌ Error generando reporte de turno:', error);
    res.status(500).json({ 
      error: 'Error generando reporte de turno',
      details: error.message 
    });
  }
});

export default router;
