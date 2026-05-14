import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Servicio para gestión automática de sesiones de caja
 */

/**
 * Cierra automáticamente todas las sesiones de caja abiertas
 * que tengan más de 24 horas de antigüedad
 */
export async function autoCloseOldSessions() {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Buscar sesiones abiertas con más de 24 horas
    const oldSessions = await prisma.cashSession.findMany({
      where: {
        status: 'OPEN',
        openedAt: {
          lt: twentyFourHoursAgo
        }
      },
      include: {
        terminal: true,
        openedByUser: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    if (oldSessions.length === 0) {
      console.log('✅ No hay sesiones antiguas para cerrar');
      return { closed: 0, sessions: [] };
    }

    console.log(`⚠️ Encontradas ${oldSessions.length} sesiones antiguas para cerrar automáticamente`);

    const closedSessions = [];

    for (const session of oldSessions) {
      try {
        // Calcular totales de ventas durante la sesión
        const sales = await prisma.order.findMany({
          where: {
            terminalId: session.terminalId,
            createdAt: {
              gte: session.openedAt,
              lte: new Date()
            },
            status: 'DELIVERED'
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

        // Cerrar sesión automáticamente
        const closedSession = await prisma.cashSession.update({
          where: { id: session.id },
          data: {
            status: 'CLOSED',
            closedAt: new Date(),
            closedByUserId: session.openedByUserId, // Usar el mismo usuario que abrió
            totalCash: new Prisma.Decimal(totalCash),
            totalCard: new Prisma.Decimal(totalCard),
            totalMemberAccount: new Prisma.Decimal(totalMemberAccount),
            totalSales: new Prisma.Decimal(totalSales),
            expectedFloat: new Prisma.Decimal(expectedFloat),
            countedCash: new Prisma.Decimal(expectedFloat), // Asumir que el conteo es correcto
            difference: new Prisma.Decimal(0), // Sin diferencia en cierre automático
            notes: `Cierre automático por sesión antigua (>24h). Abierta: ${session.openedAt.toLocaleString()}`
          }
        });

        closedSessions.push(closedSession);
        console.log(`✅ Sesión ${session.id} cerrada automáticamente (Terminal: ${session.terminal?.name || session.terminalId})`);
      } catch (error) {
        console.error(`❌ Error cerrando sesión ${session.id}:`, error);
      }
    }

    return {
      closed: closedSessions.length,
      sessions: closedSessions
    };
  } catch (error) {
    console.error('❌ Error en autoCloseOldSessions:', error);
    throw error;
  }
}

/**
 * Cierra todas las sesiones abiertas al final del día (cierre diario)
 * Se ejecuta típicamente a medianoche o al inicio del siguiente día laboral
 */
export async function closeDailySessions() {
  try {
    const openSessions = await prisma.cashSession.findMany({
      where: {
        status: 'OPEN'
      },
      include: {
        terminal: true,
        openedByUser: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    if (openSessions.length === 0) {
      console.log('✅ No hay sesiones abiertas para cierre diario');
      return { closed: 0, sessions: [] };
    }

    console.log(`🌙 Iniciando cierre diario de ${openSessions.length} sesión(es)`);

    const closedSessions = [];

    for (const session of openSessions) {
      try {
        // Calcular totales de ventas durante la sesión
        const sales = await prisma.order.findMany({
          where: {
            terminalId: session.terminalId,
            createdAt: {
              gte: session.openedAt,
              lte: new Date()
            },
            status: 'DELIVERED'
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

        // Cerrar sesión
        const closedSession = await prisma.cashSession.update({
          where: { id: session.id },
          data: {
            status: 'CLOSED',
            closedAt: new Date(),
            closedByUserId: session.openedByUserId,
            totalCash: new Prisma.Decimal(totalCash),
            totalCard: new Prisma.Decimal(totalCard),
            totalMemberAccount: new Prisma.Decimal(totalMemberAccount),
            totalSales: new Prisma.Decimal(totalSales),
            expectedFloat: new Prisma.Decimal(expectedFloat),
            countedCash: new Prisma.Decimal(expectedFloat),
            difference: new Prisma.Decimal(0),
            notes: `Cierre diario automático. Abierta: ${session.openedAt.toLocaleString()}`
          }
        });

        closedSessions.push(closedSession);
        console.log(`✅ Sesión ${session.id} cerrada en cierre diario (Terminal: ${session.terminal?.name || session.terminalId})`);
      } catch (error) {
        console.error(`❌ Error cerrando sesión ${session.id} en cierre diario:`, error);
      }
    }

    return {
      closed: closedSessions.length,
      sessions: closedSessions
    };
  } catch (error) {
    console.error('❌ Error en closeDailySessions:', error);
    throw error;
  }
}

/**
 * Limpia sesiones de caja antiguas (más de 30 días)
 * Mantiene solo las últimas 30 días para rendimiento
 */
export async function cleanupOldSessions() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await prisma.cashSession.deleteMany({
      where: {
        status: 'CLOSED',
        closedAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    console.log(`🧹 Limpiadas ${result.count} sesiones antiguas (>30 días)`);
    return { deleted: result.count };
  } catch (error) {
    console.error('❌ Error en cleanupOldSessions:', error);
    throw error;
  }
}
