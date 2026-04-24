import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const router = Router();
const prisma = new PrismaClient();

// ========================================
// GET /comandas - Obtener comandas con filtros
// ========================================
router.get('/', async (req, res) => {
  try {
    const { station, estado, tipo, asignadoA } = req.query;
    
    const where: any = {};
    
    if (estado) {
      where.estado = estado;
    }
    
    if (tipo) {
      where.tipo = tipo;
    }
    
    if (asignadoA) {
      where.asignadoAUserId = asignadoA;
    }

    const comandas = await prisma.comanda.findMany({
      where,
      include: {
        items: true,
        asignadoA: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Filtrar por estación si se especifica
    let filteredComandas = comandas;
    if (station) {
      filteredComandas = comandas.filter(comanda => 
        comanda.items.some(item => item.station === station)
      );
    }

    const formattedComandas = filteredComandas.map(comanda => ({
      id: comanda.id,
      folio: comanda.folio,
      cliente: comanda.cliente,
      mesa: comanda.mesa,
      domicilio: comanda.domicilio,
      telefono: comanda.telefono,
      tipo: comanda.tipo,
      estado: comanda.estado,
      prioridad: comanda.prioridad,
      items: comanda.items
        .filter(item => !station || item.station === station)
        .map(item => ({
          id: item.id,
          productId: item.productId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: Number(item.precio),
          notas: item.notas,
          estado: item.estado,
          station: item.station,
          image: item.image,
          preparadoPor: item.preparadoPor,
          recogidoPor: item.recogidoPor,
          readyAt: item.readyAt,
          pickedAt: item.pickedAt
        })),
      total: Number(comanda.total),
      fecha: comanda.createdAt.toISOString().split('T')[0],
      hora: comanda.createdAt.toLocaleTimeString('es-MX', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      tiempoEspera: Math.floor((Date.now() - comanda.createdAt.getTime()) / 60000),
      notas: comanda.notas,
      mesero: comanda.mesero,
      delivery: comanda.delivery,
      asignadoA: comanda.asignadoA,
      createdAt: comanda.createdAt,
      updatedAt: comanda.updatedAt,
      completedAt: comanda.completedAt,
      estimatedTime: comanda.estimatedTime
    }));

    res.json(formattedComandas);
  } catch (error) {
    console.error('Error obteniendo comandas:', error);
    res.status(500).json({ 
      error: 'Error obteniendo comandas',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// GET /comandas/disponibles - Comandas disponibles para asignar a meseros
// ========================================
router.get('/disponibles', async (req, res) => {
  try {
    const { tipo = 'MESA' } = req.query;

    const comandas = await prisma.comanda.findMany({
      where: {
        tipo: tipo as any,
        estado: 'LISTO',
        asignadoAUserId: null // Sin asignar
      },
      include: {
        items: {
          where: {
            estado: 'LISTO'
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const formattedComandas = comandas.map(comanda => ({
      id: comanda.id,
      folio: comanda.folio,
      cliente: comanda.cliente,
      mesa: comanda.mesa,
      domicilio: comanda.domicilio,
      tipo: comanda.tipo,
      items: comanda.items.map(item => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        estado: item.estado
      })),
      total: Number(comanda.total),
      tiempoEspera: Math.floor((Date.now() - comanda.createdAt.getTime()) / 60000),
      createdAt: comanda.createdAt
    }));

    res.json(formattedComandas);
  } catch (error) {
    console.error('Error obteniendo comandas disponibles:', error);
    res.status(500).json({ error: 'Error obteniendo comandas disponibles' });
  }
});

// ========================================
// POST /comandas - Crear comanda con estaciones
// ========================================
router.post('/', async (req, res) => {
  try {
    const {
      cliente,
      mesa,
      domicilio,
      telefono,
      tipo = 'MESA',
      prioridad = 'MEDIA',
      items,
      notas,
      mesero,
      delivery
    } = req.body;

    if (!cliente || !items || items.length === 0) {
      return res.status(400).json({ 
        error: 'Cliente y items son requeridos' 
      });
    }

    if (tipo === 'MESA' && !mesa) {
      return res.status(400).json({ 
        error: 'Para tipo MESA, el número de mesa es requerido' 
      });
    }

    if (tipo === 'DOMICILIO' && (!domicilio || !telefono)) {
      return res.status(400).json({ 
        error: 'Para tipo DOMICILIO, domicilio y teléfono son requeridos' 
      });
    }

    const folio = `COM-${nanoid(6).toUpperCase()}`;
    const total = items.reduce((sum: number, item: any) => 
      sum + (item.cantidad * item.precio), 0
    );

    // Obtener información de productos para asignar estaciones
    const productIds = items
      .filter((item: any) => item.productId)
      .map((item: any) => item.productId);

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds }
      },
      select: {
        id: true,
        station: true,
        preparationTime: true
      }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    // Crear comanda
    const comanda = await prisma.comanda.create({
      data: {
        folio,
        cliente,
        mesa: mesa || null,
        domicilio: domicilio || null,
        telefono: telefono || null,
        tipo,
        prioridad,
        total,
        notas: notas || null,
        mesero: mesero || null,
        delivery: delivery || null,
        estimatedTime: Math.max(...items.map((item: any) => {
          const product = productMap.get(item.productId);
          return product?.preparationTime || 15;
        }))
      }
    });

    // Crear items con estación asignada
    const itemsCreated = await Promise.all(
      items.map((item: any) => {
        const product = productMap.get(item.productId);
        
        return prisma.comandaItem.create({
          data: {
            productId: item.productId || null,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio,
            notas: item.notas || null,
            estado: 'PENDIENTE',
            image: item.image || null,
            station: product?.station || 'COCINA_PRINCIPAL',
            comandaId: comanda.id
          }
        });
      })
    );

    res.status(201).json({
      message: 'Comanda creada exitosamente',
      comanda: {
        id: comanda.id,
        folio: comanda.folio,
        cliente: comanda.cliente,
        mesa: comanda.mesa,
        tipo: comanda.tipo,
        estado: comanda.estado,
        prioridad: comanda.prioridad,
        items: itemsCreated.map(item => ({
          id: item.id,
          productId: item.productId,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: Number(item.precio),
          estado: item.estado,
          station: item.station
        })),
        total: Number(comanda.total),
        estimatedTime: comanda.estimatedTime,
        createdAt: comanda.createdAt
      }
    });
  } catch (error) {
    console.error('Error creando comanda:', error);
    res.status(500).json({ 
      error: 'Error creando comanda',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// PUT /comandas/:id - Editar comanda
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente, mesa, domicilio, telefono, tipo, notas, mesero } = req.body;

    const comanda = await prisma.comanda.findUnique({
      where: { id }
    });

    if (!comanda) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    if (comanda.estado === 'ENTREGADO' || comanda.estado === 'CANCELADO') {
      return res.status(400).json({ error: 'No se puede editar una comanda entregada o cancelada' });
    }

    const updatedComanda = await prisma.comanda.update({
      where: { id },
      data: {
        cliente: cliente || comanda.cliente,
        mesa: mesa !== undefined ? mesa : comanda.mesa,
        domicilio: domicilio !== undefined ? domicilio : comanda.domicilio,
        telefono: telefono !== undefined ? telefono : comanda.telefono,
        tipo: tipo || comanda.tipo,
        notas: notas !== undefined ? notas : comanda.notas,
        mesero: mesero !== undefined ? mesero : comanda.mesero
      },
      include: {
        items: true,
        asignadoA: {
          select: { id: true, firstName: true, lastName: true, role: true }
        }
      }
    });

    res.json({
      message: 'Comanda actualizada exitosamente',
      comanda: {
        id: updatedComanda.id,
        folio: updatedComanda.folio,
        cliente: updatedComanda.cliente,
        mesa: updatedComanda.mesa,
        domicilio: updatedComanda.domicilio,
        telefono: updatedComanda.telefono,
        tipo: updatedComanda.tipo,
        estado: updatedComanda.estado,
        notas: updatedComanda.notas,
        mesero: updatedComanda.mesero
      }
    });
  } catch (error) {
    console.error('Error editando comanda:', error);
    res.status(500).json({
      error: 'Error editando comanda',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// PUT /comandas/:id/estado - Cambiar estado de comanda
// ========================================
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'Estado requerido' });
    }

    const validEstados = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGANDO', 'ENTREGADO', 'CANCELADO'];
    if (!validEstados.includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido', validEstados });
    }

    const comanda = await prisma.comanda.findUnique({
      where: { id }
    });

    if (!comanda) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    const updateData: any = { estado };
    if (estado === 'ENTREGADO' || estado === 'CANCELADO') {
      updateData.completedAt = new Date();
    }

    const updatedComanda = await prisma.comanda.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        asignadoA: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    // Emitir evento Socket.io
    const io = req.app?.get('io');
    if (io) {
      io.emit('comanda:updated', {
        id: updatedComanda.id,
        folio: updatedComanda.folio,
        estado: updatedComanda.estado,
        updatedAt: updatedComanda.updatedAt
      });
    }

    res.json({
      message: 'Estado actualizado exitosamente',
      comanda: {
        id: updatedComanda.id,
        folio: updatedComanda.folio,
        estado: updatedComanda.estado,
        completedAt: updatedComanda.completedAt
      }
    });
  } catch (error) {
    console.error('Error actualizando estado de comanda:', error);
    res.status(500).json({
      error: 'Error actualizando estado',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// PUT /comandas/:id/items/:itemId/marcar-listo
// ========================================
router.put('/:id/items/:itemId/marcar-listo', async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { userId } = req.body;

    const item = await prisma.comandaItem.findFirst({
      where: {
        id: itemId,
        comandaId: id
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const updatedItem = await prisma.comandaItem.update({
      where: { id: itemId },
      data: {
        estado: 'LISTO',
        preparadoPor: userId,
        readyAt: new Date()
      }
    });

    // Verificar si todos los items están listos para actualizar la comanda
    const allItems = await prisma.comandaItem.findMany({
      where: { comandaId: id }
    });

    const allReady = allItems.every(i => i.estado === 'LISTO' || i.estado === 'RECOGIDO' || i.estado === 'ENTREGADO');

    if (allReady) {
      await prisma.comanda.update({
        where: { id },
        data: { estado: 'LISTO' }
      });
    }

    res.json({
      message: 'Item marcado como listo',
      item: {
        id: updatedItem.id,
        nombre: updatedItem.nombre,
        estado: updatedItem.estado,
        readyAt: updatedItem.readyAt
      }
    });
  } catch (error) {
    console.error('Error marcando item como listo:', error);
    res.status(500).json({ error: 'Error marcando item como listo' });
  }
});

// ========================================
// PUT /comandas/:id/asignar-mesero
// ========================================
router.put('/:id/asignar-mesero', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId es requerido' });
    }

    const comanda = await prisma.comanda.findUnique({
      where: { id }
    });

    if (!comanda) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    if (comanda.asignadoAUserId) {
      return res.status(400).json({ 
        error: 'Esta comanda ya está asignada a otro mesero' 
      });
    }

    if (comanda.estado !== 'LISTO') {
      return res.status(400).json({ 
        error: 'Solo se pueden asignar comandas que estén listas' 
      });
    }

    const updatedComanda = await prisma.comanda.update({
      where: { id },
      data: {
        asignadoAUserId: userId,
        estado: 'ENTREGANDO'
      },
      include: {
        asignadoA: {
          select: {
            id: true,
            firstName: true,
            lastName: true
          }
        },
        items: true
      }
    });

    res.json({
      message: 'Comanda asignada exitosamente',
      comanda: {
        id: updatedComanda.id,
        folio: updatedComanda.folio,
        estado: updatedComanda.estado,
        asignadoA: updatedComanda.asignadoA
      }
    });
  } catch (error) {
    console.error('Error asignando comanda:', error);
    res.status(500).json({ error: 'Error asignando comanda' });
  }
});

// ========================================
// PUT /comandas/:id/confirmar-entrega
// ========================================
router.put('/:id/confirmar-entrega', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const comanda = await prisma.comanda.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!comanda) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    if (comanda.asignadoAUserId !== userId) {
      return res.status(403).json({ 
        error: 'Solo el mesero asignado puede confirmar la entrega' 
      });
    }

    // Marcar todos los items como entregados
    await prisma.comandaItem.updateMany({
      where: { comandaId: id },
      data: {
        estado: 'ENTREGADO',
        recogidoPor: userId,
        pickedAt: new Date()
      }
    });

    const updatedComanda = await prisma.comanda.update({
      where: { id },
      data: {
        estado: 'ENTREGADO',
        completedAt: new Date()
      }
    });

    res.json({
      message: 'Entrega confirmada exitosamente',
      comanda: {
        id: updatedComanda.id,
        folio: updatedComanda.folio,
        estado: updatedComanda.estado,
        completedAt: updatedComanda.completedAt
      }
    });
  } catch (error) {
    console.error('Error confirmando entrega:', error);
    res.status(500).json({ error: 'Error confirmando entrega' });
  }
});

// ========================================
// PUT /comandas/:id/cancelar
// ========================================
router.put('/:id/cancelar', async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo, userId } = req.body;

    const comanda = await prisma.comanda.findUnique({
      where: { id }
    });

    if (!comanda) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    if (comanda.estado === 'ENTREGADO') {
      return res.status(400).json({ 
        error: 'No se puede cancelar una comanda ya entregada' 
      });
    }

    const updatedComanda = await prisma.comanda.update({
      where: { id },
      data: {
        estado: 'CANCELADO',
        completedAt: new Date(),
        notas: motivo ? `${comanda.notas || ''}\nCANCELADO: ${motivo}` : comanda.notas
      }
    });

    res.json({
      message: 'Comanda cancelada exitosamente',
      comanda: {
        id: updatedComanda.id,
        folio: updatedComanda.folio,
        estado: updatedComanda.estado,
        completedAt: updatedComanda.completedAt
      }
    });
  } catch (error) {
    console.error('Error cancelando comanda:', error);
    res.status(500).json({ error: 'Error cancelando comanda' });
  }
});

// ========================================
// GET /comandas/mis-asignadas/:userId
// ========================================
router.get('/mis-asignadas/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { estado } = req.query;

    const where: any = {
      asignadoAUserId: userId
    };

    if (estado) {
      where.estado = estado;
    } else {
      where.estado = { in: ['ENTREGANDO', 'LISTO'] };
    }

    const comandas = await prisma.comanda.findMany({
      where,
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedComandas = comandas.map(comanda => ({
      id: comanda.id,
      folio: comanda.folio,
      cliente: comanda.cliente,
      mesa: comanda.mesa,
      domicilio: comanda.domicilio,
      tipo: comanda.tipo,
      estado: comanda.estado,
      items: comanda.items.map(item => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        estado: item.estado
      })),
      total: Number(comanda.total),
      tiempoEspera: Math.floor((Date.now() - comanda.createdAt.getTime()) / 60000),
      createdAt: comanda.createdAt
    }));

    res.json(formattedComandas);
  } catch (error) {
    console.error('Error obteniendo comandas asignadas:', error);
    res.status(500).json({ error: 'Error obteniendo comandas asignadas' });
  }
});

export default router;
