import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// ========================================
// GET /customers - Listar clientes con filtros
// ========================================
router.get('/', async (req, res) => {
  try {
    const { type, search, isActive } = req.query;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (search) {
      const searchTerm = String(search);
      where.OR = [
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm } },
        { memberNumber: { contains: searchTerm } },
        { rfc: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        orders: {
          select: {
            id: true,
            folio: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,
            orderType: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        _count: {
          select: { orders: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedCustomers = customers.map(customer => ({
      id: customer.id,
      memberNumber: customer.memberNumber,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      rfc: customer.rfc,
      type: customer.type,
      balance: Number(customer.balance),
      creditLimit: Number(customer.creditLimit),
      notes: customer.notes,
      birthDate: customer.birthDate,
      isActive: customer.isActive,
      totalOrders: customer._count.orders,
      totalSpent: customer.orders
        .filter(o => o.paymentStatus === 'CAPTURED')
        .reduce((sum, o) => sum + Number(o.totalAmount), 0),
      recentOrders: customer.orders.slice(0, 5),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }));

    res.json(formattedCustomers);
  } catch (error) {
    console.error('Error obteniendo clientes:', error);
    res.status(500).json({
      error: 'Error obteniendo clientes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// GET /customers/:id - Detalle de un cliente
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          include: {
            items: {
              select: {
                id: true,
                productName: true,
                quantity: true,
                unitPrice: true,
                totalPrice: true
              }
            },
            payments: {
              select: {
                id: true,
                method: true,
                amount: true,
                status: true,
                createdAt: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const totalSpent = customer.orders
      .filter(o => o.paymentStatus === 'CAPTURED')
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    res.json({
      id: customer.id,
      memberNumber: customer.memberNumber,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      rfc: customer.rfc,
      type: customer.type,
      balance: Number(customer.balance),
      creditLimit: Number(customer.creditLimit),
      notes: customer.notes,
      birthDate: customer.birthDate,
      isActive: customer.isActive,
      totalOrders: customer.orders.length,
      totalSpent,
      orders: customer.orders.map(order => ({
        id: order.id,
        folio: order.folio,
        status: order.status,
        orderType: order.orderType,
        subtotal: Number(order.subtotal),
        taxAmount: Number(order.taxAmount),
        discountAmount: Number(order.discountAmount),
        totalAmount: Number(order.totalAmount),
        paymentStatus: order.paymentStatus,
        notes: order.notes,
        createdAt: order.createdAt,
        completedAt: order.completedAt,
        items: order.items,
        payments: order.payments
      })),
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    });
  } catch (error) {
    console.error('Error obteniendo cliente:', error);
    res.status(500).json({
      error: 'Error obteniendo cliente',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// GET /customers/:id/purchases - Historial completo de compras
// ========================================
router.get('/:id/purchases', async (req, res) => {
  try {
    const { id } = req.params;
    const { from, to, status } = req.query;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const where: any = { customerId: id };

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(String(from));
      if (to) where.createdAt.lte = new Date(String(to));
    }

    if (status) {
      where.paymentStatus = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        payments: true,
        createdBy: {
          select: { id: true, firstName: true, lastName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const summary = {
      totalOrders: orders.length,
      totalSpent: orders
        .filter(o => o.paymentStatus === 'CAPTURED')
        .reduce((sum, o) => sum + Number(o.totalAmount), 0),
      avgTicket: orders.length > 0
        ? orders.filter(o => o.paymentStatus === 'CAPTURED')
            .reduce((sum, o) => sum + Number(o.totalAmount), 0) /
          Math.max(1, orders.filter(o => o.paymentStatus === 'CAPTURED').length)
        : 0,
      byPaymentMethod: {} as Record<string, number>,
      byOrderType: {} as Record<string, number>
    };

    orders.forEach(o => {
      if (o.paymentStatus === 'CAPTURED') {
        const method = o.payments?.[0]?.method || 'UNKNOWN';
        summary.byPaymentMethod[method] = (summary.byPaymentMethod[method] || 0) + Number(o.totalAmount);
        summary.byOrderType[o.orderType] = (summary.byOrderType[o.orderType] || 0) + 1;
      }
    });

    res.json({
      customer: {
        id: customer.id,
        fullName: `${customer.firstName} ${customer.lastName}`,
        type: customer.type,
        memberNumber: customer.memberNumber
      },
      summary,
      purchases: orders.map(order => ({
        id: order.id,
        folio: order.folio,
        status: order.status,
        orderType: order.orderType,
        subtotal: Number(order.subtotal),
        taxAmount: Number(order.taxAmount),
        totalAmount: Number(order.totalAmount),
        paymentStatus: order.paymentStatus,
        items: order.items.map(item => ({
          id: item.id,
          productName: item.productName,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        })),
        payments: order.payments.map(p => ({
          method: p.method,
          amount: Number(p.amount),
          status: p.status
        })),
        createdBy: order.createdBy,
        createdAt: order.createdAt,
        completedAt: order.completedAt
      }))
    });
  } catch (error) {
    console.error('Error obteniendo historial de compras:', error);
    res.status(500).json({
      error: 'Error obteniendo historial de compras',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// POST /customers - Crear cliente
// ========================================
router.post('/', async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, address, rfc,
      type = 'CLIENTE', creditLimit = 0, notes, birthDate, memberNumber
    } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    }

    // Generar número de socio si es SOCIO y no se proporcionó
    let generatedMemberNumber = memberNumber;
    if (type === 'SOCIO' && !generatedMemberNumber) {
      const count = await prisma.customer.count({
        where: { type: 'SOCIO' }
      });
      generatedMemberNumber = `SOC-${String(count + 1).padStart(4, '0')}`;
    }

    const customer = await prisma.customer.create({
      data: {
        memberNumber: generatedMemberNumber,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        address: address || null,
        rfc: rfc || null,
        type,
        creditLimit,
        notes: notes || null,
        birthDate: birthDate ? new Date(birthDate) : null
      }
    });

    res.status(201).json({
      message: 'Cliente creado exitosamente',
      customer: {
        id: customer.id,
        memberNumber: customer.memberNumber,
        firstName: customer.firstName,
        lastName: customer.lastName,
        fullName: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        phone: customer.phone,
        type: customer.type,
        balance: Number(customer.balance),
        creditLimit: Number(customer.creditLimit),
        isActive: customer.isActive,
        createdAt: customer.createdAt
      }
    });
  } catch (error) {
    console.error('Error creando cliente:', error);
    if (error instanceof Error && error.message.includes('Unique')) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese email o número de socio' });
    }
    res.status(500).json({
      error: 'Error creando cliente',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// PUT /customers/:id - Actualizar cliente
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName, lastName, email, phone, address, rfc,
      type, creditLimit, balance, notes, birthDate, isActive, memberNumber
    } = req.body;

    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (rfc !== undefined) updateData.rfc = rfc;
    if (type !== undefined) updateData.type = type;
    if (creditLimit !== undefined) updateData.creditLimit = creditLimit;
    if (balance !== undefined) updateData.balance = balance;
    if (notes !== undefined) updateData.notes = notes;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (memberNumber !== undefined) updateData.memberNumber = memberNumber;
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: updateData
    });

    res.json({
      message: 'Cliente actualizado exitosamente',
      customer: {
        id: updatedCustomer.id,
        memberNumber: updatedCustomer.memberNumber,
        firstName: updatedCustomer.firstName,
        lastName: updatedCustomer.lastName,
        fullName: `${updatedCustomer.firstName} ${updatedCustomer.lastName}`,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        type: updatedCustomer.type,
        balance: Number(updatedCustomer.balance),
        creditLimit: Number(updatedCustomer.creditLimit),
        isActive: updatedCustomer.isActive,
        createdAt: updatedCustomer.createdAt,
        updatedAt: updatedCustomer.updatedAt
      }
    });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    if (error instanceof Error && error.message.includes('Unique')) {
      return res.status(409).json({ error: 'Ya existe un cliente con ese email o número de socio' });
    }
    res.status(500).json({
      error: 'Error actualizando cliente',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ========================================
// DELETE /customers/:id - Desactivar cliente
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } }
    });

    if (!customer) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    if (customer._count.orders > 0) {
      // Desactivar en vez de borrar si tiene órdenes
      await prisma.customer.update({
        where: { id },
        data: { isActive: false }
      });
      return res.json({ message: 'Cliente desactivado (tiene órdenes asociadas)' });
    }

    await prisma.customer.delete({ where: { id } });
    res.json({ message: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando cliente:', error);
    res.status(500).json({
      error: 'Error eliminando cliente',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
