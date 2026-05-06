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

// POST /system/init-data - Inicializar datos del sistema (usuarios default, etc)
router.post('/init-data', async (req, res) => {
  try {
    console.log('🔄 Inicializando datos del sistema...');
    
    const results: any = {};
    
    // 1. Crear usuario ADMIN universal con PIN 0000
    const adminId = 'admin-universal';
    let admin = await prisma.user.findUnique({ where: { id: adminId } });
    
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          id: adminId,
          username: 'admin',
          email: 'admin@countryclub.com',
          passwordHash: '$2b$10$defaultHashForAdmin',
          firstName: 'Administrador',
          lastName: 'Universal',
          role: 'ADMIN',
          pin: '0000', // PIN universal
          isActive: true,
          canAccessPos: true,
          canAccessKds: true,
          canAccessAdmin: true
        }
      });
      results.adminCreated = true;
      console.log('✅ Usuario admin universal creado:', admin.id);
    } else {
      // Asegurar que tenga el PIN correcto
      if (admin.pin !== '0000') {
        admin = await prisma.user.update({
          where: { id: adminId },
          data: { pin: '0000' }
        });
        results.adminPinUpdated = true;
        console.log('✅ PIN de admin actualizado a 0000');
      }
      results.adminExists = true;
    }
    
    // 2. Crear usuarios adicionales del POS si no existen
    const posUsers = [
      { id: 'pos-admin', username: 'posadmin', firstName: 'Admin', lastName: 'POS', role: 'ADMIN', pin: '0000' },
      { id: 'kds-admin', username: 'kdsadmin', firstName: 'Admin', lastName: 'KDS', role: 'ADMIN', pin: '0000' }
    ];
    
    for (const userData of posUsers) {
      const existing = await prisma.user.findUnique({ where: { id: userData.id } });
      if (!existing) {
        await prisma.user.create({
          data: {
            id: userData.id,
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: `${userData.username}@pos.local`,
            passwordHash: '$2b$10$defaultHashForUser',
            role: userData.role as any,
            pin: userData.pin,
            isActive: true,
            canAccessPos: true,
            canAccessKds: true,
            canAccessAdmin: false
          }
        });
        results[`${userData.id}Created`] = true;
        console.log(`✅ Usuario ${userData.id} creado`);
      }
    }
    
    // 3. Crear store por defecto si no existe
    let store = await prisma.store.findFirst();
    if (!store) {
      store = await prisma.store.create({
        data: {
          id: 'store-main',
          name: 'Country Club Principal',
          address: 'Dirección Principal',
          phone: '0000000000',
          isActive: true
        }
      });
      results.storeCreated = true;
      console.log('✅ Store creado:', store.id);
    } else {
      results.storeExists = true;
    }
    
    // 4. Crear terminal por defecto si no existe
    let terminal = await prisma.terminal.findUnique({ where: { id: 'terminal-main' } });
    if (!terminal && store) {
      terminal = await prisma.terminal.create({
        data: {
          id: 'terminal-main',
          storeId: store.id,
          name: 'Terminal Principal',
          location: 'Caja Principal',
          isActive: true
        }
      });
      results.terminalCreated = true;
      console.log('✅ Terminal creada:', terminal.id);
    } else {
      results.terminalExists = true;
    }
    
    // 5. Crear usuarios para KDS
    const kdsUsers = [
      { id: 'chef-main', name: 'Chef Principal', pin: '1111', role: 'CHEF' },
      { id: 'cocinero-main', name: 'Cocinero', pin: '2222', role: 'COOK' },
      { id: 'barman-main', name: 'Barman', pin: '3333', role: 'BARTENDER' }
    ];
    
    for (const kdsUser of kdsUsers) {
      const existing = await prisma.user.findUnique({ where: { id: kdsUser.id } });
      if (!existing) {
        await prisma.user.create({
          data: {
            id: kdsUser.id,
            username: kdsUser.id,
            email: `${kdsUser.id}@kds.local`,
            passwordHash: '$2b$10$defaultHashForKDS',
            firstName: kdsUser.name.split(' ')[0],
            lastName: kdsUser.name.split(' ')[1] || '',
            role: kdsUser.role as any,
            pin: kdsUser.pin,
            isActive: true,
            canAccessPos: false,
            canAccessKds: true,
            canAccessAdmin: false
          }
        });
        results[`${kdsUser.id}Created`] = true;
      }
    }
    
    res.json({
      success: true,
      message: 'Datos inicializados correctamente',
      results,
      admin: {
        id: admin.id,
        username: admin.username,
        pin: admin.pin,
        role: admin.role
      }
    });
    
  } catch (error: any) {
    console.error('❌ Error inicializando datos:', error);
    res.status(500).json({
      error: 'Error inicializando datos',
      details: error.message,
      code: error.code
    });
  }
});

// GET /system/init-data - Obtener estado de inicialización
router.get('/init-data', async (req, res) => {
  try {
    const admin = await prisma.user.findUnique({
      where: { id: 'admin-universal' },
      select: { id: true, username: true, pin: true, role: true, isActive: true }
    });
    
    const posAdmin = await prisma.user.findUnique({
      where: { id: 'pos-admin' },
      select: { id: true, username: true, pin: true, role: true }
    });
    
    const kdsAdmin = await prisma.user.findUnique({
      where: { id: 'kds-admin' },
      select: { id: true, username: true, pin: true, role: true }
    });
    
    const store = await prisma.store.findFirst({ select: { id: true, name: true } });
    const terminal = await prisma.terminal.findUnique({ where: { id: 'terminal-main' }, select: { id: true, name: true } });
    
    res.json({
      initialized: !!admin,
      admin,
      posAdmin,
      kdsAdmin,
      store,
      terminal,
      message: admin ? 'Sistema inicializado' : 'Se requiere inicialización: POST /system/init-data'
    });
  } catch (error: any) {
    console.error('❌ Error verificando inicialización:', error);
    res.status(500).json({ error: 'Error verificando estado' });
  }
});

export default router;
