import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const router = Router();
const prisma = new PrismaClient();

// GET /users - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        pin: true,
        canAccessPos: true,
        canAccessKds: true,
        canAccessAdmin: true,
        permissions: true,
        phone: true,
        avatar: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// GET /users/:id - Obtener un usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error obteniendo usuario' });
  }
});

// POST /users - Crear un nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { username, email, firstName, lastName, role, password, pin, canAccessPos, canAccessKds, canAccessAdmin, isActive } = req.body;
    
    // Hash de la contraseña con bcrypt (opcional si se proporciona)
    const passwordHash = password ? await bcrypt.hash(password, SALT_ROUNDS) : await bcrypt.hash('1234', SALT_ROUNDS);
    
    const user = await prisma.user.create({
      data: {
        username,
        email,
        firstName,
        lastName,
        role: role || 'CASHIER',
        passwordHash,
        pin: pin || null,
        canAccessPos: canAccessPos !== undefined ? canAccessPos : true,
        canAccessKds: canAccessKds !== undefined ? canAccessKds : false,
        canAccessAdmin: canAccessAdmin !== undefined ? canAccessAdmin : false,
        isActive: isActive !== undefined ? isActive : true
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        pin: true,
        canAccessPos: true,
        canAccessKds: true,
        canAccessAdmin: true,
        isActive: true,
        createdAt: true
      }
    });
    
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

// PUT /users/:id - Actualizar un usuario
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, firstName, lastName, role, password, pin, canAccessPos, canAccessKds, canAccessAdmin, isActive } = req.body;
    
    const updateData: any = {
      username,
      email,
      firstName,
      lastName,
      role,
      canAccessPos,
      canAccessKds,
      canAccessAdmin,
      isActive
    };
    
    // Solo actualizar contraseña si se proporciona
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    }
    
    // Solo actualizar PIN si se proporciona
    if (pin !== undefined) {
      updateData.pin = pin || null;
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        pin: true,
        canAccessPos: true,
        canAccessKds: true,
        canAccessAdmin: true,
        isActive: true,
        createdAt: true
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

// DELETE /users/:id - Eliminar un usuario (soft delete si tiene dependencias)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Primero verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: true,
            shifts: true,
            cashSessionsOpened: true,
            cashSessionsClosed: true,
            cashMovements: true,
            inventoryMovements: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // Verificar si tiene dependencias
    const hasDependencies = 
      user._count.orders > 0 ||
      user._count.shifts > 0 ||
      user._count.cashSessionsOpened > 0 ||
      user._count.cashSessionsClosed > 0 ||
      user._count.cashMovements > 0 ||
      user._count.inventoryMovements > 0;
    
    if (hasDependencies) {
      // Soft delete: marcar como inactivo en lugar de eliminar
      console.log(`📝 Usuario ${id} tiene dependencias. Realizando soft delete...`);
      
      await prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          username: `${user.username}_deleted_${Date.now()}`, // Evitar conflictos de username único
          email: `${user.email}_deleted_${Date.now()}` // Evitar conflictos de email único
        }
      });
      
      return res.json({ 
        message: 'Usuario desactivado exitosamente (tiene registros históricos asociados)',
        softDeleted: true,
        reason: 'El usuario tenía ventas, sesiones u otros registros asociados'
      });
    }
    
    // Si no tiene dependencias, eliminar físicamente
    await prisma.user.delete({
      where: { id }
    });
    
    console.log(`✅ Usuario ${id} eliminado físicamente`);
    res.json({ 
      message: 'Usuario eliminado exitosamente',
      softDeleted: false 
    });
    
  } catch (error: any) {
    console.error('Error eliminando usuario:', error);
    
    // Si es error de foreign key, intentar soft delete como fallback
    if (error.code === 'P2003' || error.code === 'P2014' || error.message?.includes('foreign key')) {
      try {
        console.log(`🔄 Intentando soft delete como fallback...`);
        const { id } = req.params;
        
        await prisma.user.update({
          where: { id },
          data: {
            isActive: false,
            username: `deleted_${id}_${Date.now()}`,
            email: `deleted_${id}_${Date.now()}@deleted.com`
          }
        });
        
        return res.json({ 
          message: 'Usuario desactivado exitosamente',
          softDeleted: true,
          reason: 'El usuario tenía registros asociados'
        });
      } catch (softError) {
        console.error('Error en soft delete fallback:', softError);
      }
    }
    
    res.status(500).json({ 
      error: 'Error eliminando usuario',
      details: error.message 
    });
  }
});

export default router;
