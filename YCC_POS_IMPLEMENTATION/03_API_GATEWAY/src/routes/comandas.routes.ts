import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const router = Router();
// Usar PrismaClient con el schema de comandas
const prisma = new PrismaClient();

// GET /comandas - Obtener todas las comandas
router.get('/', async (req, res) => {
  try {
    console.log(' Iniciando GET /comandas');
    
    const comandas = await prisma.comanda.findMany({
      include: {
        items: true
      }
    });

    console.log(' Comandas encontradas:', comandas.length);

    const formattedComandas = comandas.map(comanda => ({
      id: comanda.id,
      folio: comanda.folio,
      cliente: comanda.cliente,
      mesa: comanda.mesa,
      domicilio: comanda.domicilio,
      telefono: comanda.telefono,
      tipo: comanda.tipo,
      estado: comanda.estado,
      prioridad: comanda.prioridad,
      items: comanda.items.map(item => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: Number(item.precio),
        notas: item.notas,
        estado: item.estado
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
      createdAt: comanda.createdAt,
      updatedAt: comanda.updatedAt,
      completedAt: comanda.completedAt
    }));

    console.log(' Comandas formateadas:', formattedComandas.length);
    res.json(formattedComandas);
  } catch (error) {
    console.error(' Error detallado obteniendo comandas:', error);
    res.status(500).json({ 
      error: 'Error obteniendo comandas',
      details: error.message 
    });
  }
});

// GET /comandas/:id - Obtener comanda específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const comanda = await prisma.comanda.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        sale: {
          select: {
            id: true,
            folio: true,
            totalAmount: true
          }
        }
      }
    });

    if (!comanda) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    const formattedComanda = {
      id: comanda.id,
      folio: comanda.folio,
      cliente: comanda.cliente,
      mesa: comanda.mesa,
      domicilio: comanda.domicilio,
      telefono: comanda.telefono,
      tipo: comanda.tipo,
      estado: comanda.estado,
      prioridad: comanda.prioridad,
      items: comanda.items.map(item => ({
        id: item.id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: Number(item.precio),
        notas: item.notas,
        estado: item.estado,
        image: item.image || item.product?.image
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
      orderId: comanda.orderId,
      createdAt: comanda.createdAt,
      updatedAt: comanda.updatedAt,
      completedAt: comanda.completedAt
    };

    res.json(formattedComanda);
  } catch (error) {
    console.error('Error obteniendo comanda:', error);
    res.status(500).json({ error: 'Error obteniendo comanda' });
  }
});

// POST /comandas - Crear nueva comanda
router.post('/', async (req, res) => {
  try {
    console.log('🔍 POST /comandas - Body recibido:', JSON.stringify(req.body, null, 2));
    
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

    console.log('📋 Datos parseados:', { cliente, mesa, tipo, prioridad, itemsCount: items?.length });

    // Validaciones básicas
    if (!cliente || !items || items.length === 0) {
      console.log('❌ Validación fallida: cliente o items faltantes');
      return res.status(400).json({ 
        error: 'Cliente y items son requeridos' 
      });
    }

    // Validar tipo y campos requeridos
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

    // Generar folio único
    const folio = `COM-${nanoid(6).toUpperCase()}`;
    console.log('📝 Folio generado:', folio);

    // Calcular total
    const total = items.reduce((sum: number, item: any) => 
      sum + (item.cantidad * item.precio), 0
    );
    console.log('💰 Total calculado:', total);

    // Crear comanda principal
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
        delivery: delivery || null
      }
    });

    console.log('✅ Comanda creada:', comanda.id);

    // Crear items de la comanda
    const itemsCreated = await Promise.all(
      items.map((item: any) => 
        prisma.comandaItem.create({
          data: {
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio,
            notas: item.notas || null,
            estado: 'PENDIENTE',
            image: item.image || null,
            comandaId: comanda.id
          }
        })
      )
    );

    console.log('✅ Items creados:', itemsCreated.length);

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
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: Number(item.precio),
          estado: item.estado
        })),
        total: Number(comanda.total),
        mesero: comanda.mesero,
        createdAt: comanda.createdAt
      }
    });
  } catch (error) {
    console.error('Error creando comanda:', error);
    res.status(500).json({ error: 'Error creando comanda' });
  }
});

// PUT /comandas/:id - Actualizar comanda
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      cliente,
      mesa,
      domicilio,
      telefono,
      tipo,
      prioridad,
      notas,
      mesero,
      delivery
    } = req.body;

    // Verificar que la comanda existe
    const comandaExistente = await prisma.comanda.findUnique({
      where: { id }
    });

    if (!comandaExistente) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    // No permitir actualizar si ya está entregada o cancelada
    if (comandaExistente.estado === 'ENTREGADO' || comandaExistente.estado === 'CANCELADO') {
      return res.status(400).json({ 
        error: 'No se puede modificar una comanda entregada o cancelada' 
      });
    }

    const updatedComanda = await prisma.comanda.update({
      where: { id },
      data: {
        cliente: cliente || undefined,
        mesa: mesa !== undefined ? mesa : undefined,
        domicilio: domicilio !== undefined ? domicilio : undefined,
        telefono: telefono !== undefined ? telefono : undefined,
        tipo: tipo || undefined,
        prioridad: prioridad || undefined,
        notas: notas !== undefined ? notas : undefined,
        mesero: mesero !== undefined ? mesero : undefined,
        delivery: delivery !== undefined ? delivery : undefined
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
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
        prioridad: updatedComanda.prioridad,
        items: updatedComanda.items.map(item => ({
          id: item.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: Number(item.precio),
          notas: item.notas,
          estado: item.estado,
          image: item.image || item.product?.image
        })),
        total: Number(updatedComanda.total),
        fecha: updatedComanda.createdAt.toISOString().split('T')[0],
        hora: updatedComanda.createdAt.toLocaleTimeString('es-MX', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        tiempoEspera: Math.floor((Date.now() - updatedComanda.createdAt.getTime()) / 60000),
        notas: updatedComanda.notas,
        mesero: updatedComanda.mesero,
        delivery: updatedComanda.delivery,
        saleId: updatedComanda.saleId,
        createdAt: updatedComanda.createdAt,
        updatedAt: updatedComanda.updatedAt,
        completedAt: updatedComanda.completedAt
      }
    });
  } catch (error) {
    console.error('Error actualizando comanda:', error);
    res.status(500).json({ error: 'Error actualizando comanda' });
  }
});

// PUT /comandas/:id/estado - Cambiar estado de comanda
router.put('/:id/estado', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, completedAt } = req.body;

    // Validar estado
    const estadosValidos = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO', 'CANCELADO'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    // Verificar que la comanda existe
    const comandaExistente = await prisma.comanda.findUnique({
      where: { id }
    });

    if (!comandaExistente) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    // Actualizar estado
    const updateData: any = { estado };
    
    if (estado === 'ENTREGADO') {
      updateData.completedAt = completedAt || new Date();
    } else if (estado === 'CANCELADO') {
      updateData.completedAt = new Date();
    }

    const updatedComanda = await prisma.comanda.update({
      where: { id },
      data: updateData,
      include: {
        items: true
      }
    });

    res.json({
      message: 'Estado actualizado exitosamente',
      comanda: {
        id: updatedComanda.id,
        folio: updatedComanda.folio,
        estado: updatedComanda.estado,
        completedAt: updatedComanda.completedAt,
        updatedAt: updatedComanda.updatedAt
      }
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

// PUT /comandas/:id/items/:itemId/estado - Cambiar estado de item
router.put('/:id/items/:itemId/estado', async (req, res) => {
  try {
    const { id, itemId } = req.params;
    const { estado } = req.body;

    // Validar estado
    const estadosValidos = ['PENDIENTE', 'PREPARANDO', 'LISTO'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ error: 'Estado no válido' });
    }

    // Verificar que el item existe y pertenece a la comanda
    const itemExistente = await prisma.comandaItem.findFirst({
      where: {
        id: itemId,
        comandaId: id
      }
    });

    if (!itemExistente) {
      return res.status(404).json({ error: 'Item no encontrado en la comanda' });
    }

    // Actualizar estado del item
    const updatedItem = await prisma.comandaItem.update({
      where: { id: itemId },
      data: { estado }
    });

    res.json({
      message: 'Estado del item actualizado exitosamente',
      item: {
        id: updatedItem.id,
        nombre: updatedItem.nombre,
        estado: updatedItem.estado,
        updatedAt: updatedItem.updatedAt
      }
    });
  } catch (error) {
    console.error('Error actualizando estado del item:', error);
    res.status(500).json({ error: 'Error actualizando estado del item' });
  }
});

// DELETE /comandas/:id - Eliminar comanda
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la comanda existe
    const comandaExistente = await prisma.comanda.findUnique({
      where: { id }
    });

    if (!comandaExistente) {
      return res.status(404).json({ error: 'Comanda no encontrada' });
    }

    // No permitir eliminar si ya está entregada
    if (comandaExistente.estado === 'ENTREGADO') {
      return res.status(400).json({ 
        error: 'No se puede eliminar una comanda entregada' 
      });
    }

    // Eliminar comanda (los items se eliminan en cascada)
    await prisma.comanda.delete({
      where: { id }
    });

    res.json({ message: 'Comanda eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando comanda:', error);
    res.status(500).json({ error: 'Error eliminando comanda' });
  }
});

// GET /comandas/estadisticas - Obtener estadísticas
router.get('/estadisticas', async (req, res) => {
  try {
    const { fecha } = req.query;
    
    const where: any = {};
    if (fecha) {
      const date = new Date(fecha as string);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      where.createdAt = {
        gte: startOfDay,
        lte: endOfDay
      };
    }

    // Obtener conteos por estado
    const [total, pendientes, preparando, listos, entregados, cancelados] = await Promise.all([
      prisma.comanda.count({ where }),
      prisma.comanda.count({ where: { ...where, estado: 'PENDIENTE' } }),
      prisma.comanda.count({ where: { ...where, estado: 'PREPARANDO' } }),
      prisma.comanda.count({ where: { ...where, estado: 'LISTO' } }),
      prisma.comanda.count({ where: { ...where, estado: 'ENTREGADO' } }),
      prisma.comanda.count({ where: { ...where, estado: 'CANCELADO' } })
    ]);

    // Obtener suma de totales
    const ventasResult = await prisma.comanda.aggregate({
      where: {
        ...where,
        estado: { in: ['ENTREGADO', 'LISTO'] }
      },
      _sum: {
        total: true
      }
    });

    // Obtener tiempo promedio de preparación
    const tiemposCompletados = await prisma.comanda.findMany({
      where: {
        ...where,
        completedAt: { not: null },
        estado: 'ENTREGADO'
      },
      select: {
        createdAt: true,
        completedAt: true
      }
    });

    const tiempoPromedio = tiemposCompletados.length > 0
      ? tiemposCompletados.reduce((sum, comanda) => {
          const tiempo = comanda.completedAt!.getTime() - comanda.createdAt.getTime();
          return sum + tiempo;
        }, 0) / tiemposCompletados.length / 60000 // Convertir a minutos
      : 0;

    const estadisticas = {
      total,
      pendientes,
      preparando,
      listos,
      entregados,
      cancelados,
      totalVentas: Number(ventasResult._sum.total || 0),
      tiempoPromedioPreparacion: Math.round(tiempoPromedio),
      fecha: fecha || new Date().toISOString().split('T')[0]
    };

    res.json(estadisticas);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error obteniendo estadísticas' });
  }
});

export default router;
