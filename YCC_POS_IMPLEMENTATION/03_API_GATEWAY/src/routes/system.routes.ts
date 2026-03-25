import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// POST /system/reset-sessions - Limpiar sesiones y turnos activos
router.post('/reset-sessions', async (req, res) => {
  try {
    console.log('🔄 Limpiando sesiones y turnos activos...');
    
    // Cerrar todos los turnos activos
    const shiftsUpdated = await prisma.shift.updateMany({
      where: { status: 'ACTIVE' },
      data: {
        status: 'ENDED',
        endedAt: new Date()
      }
    });
    
    // Cerrar todas las sesiones de caja abiertas
    const sessionsUpdated = await prisma.cashSession.updateMany({
      where: { status: 'OPEN' },
      data: {
        status: 'CLOSED',
        closedAt: new Date()
      }
    });
    
    console.log(`✅ Turnos cerrados: ${shiftsUpdated.count}`);
    console.log(`✅ Sesiones cerradas: ${sessionsUpdated.count}`);
    
    res.json({
      success: true,
      message: 'Sesiones y turnos limpiados exitosamente',
      shiftsUpdated: shiftsUpdated.count,
      sessionsUpdated: sessionsUpdated.count
    });
  } catch (error: any) {
    console.error('❌ Error limpiando sesiones:', error);
    res.status(500).json({
      error: 'Error limpiando sesiones',
      details: error.message
    });
  }
});

// GET /system/status - Ver estado de sesiones y turnos
router.get('/status', async (req, res) => {
  try {
    const [activeShifts, openSessions, totalShifts, totalSessions] = await Promise.all([
      prisma.shift.count({ where: { status: 'ACTIVE' } }),
      prisma.cashSession.count({ where: { status: 'OPEN' } }),
      prisma.shift.count(),
      prisma.cashSession.count()
    ]);
    
    res.json({
      shifts: {
        active: activeShifts,
        total: totalShifts
      },
      sessions: {
        open: openSessions,
        total: totalSessions
      }
    });
  } catch (error: any) {
    console.error('❌ Error obteniendo estado:', error);
    res.status(500).json({
      error: 'Error obteniendo estado',
      details: error.message
    });
  }
});

export default router;
