import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// ========================================
// OBTENER TODAS LAS ÓRDENES DE COMPRA
// ========================================
router.get('/', async (req, res) => {
  try {
    const { storeId, supplierId, status, dateFrom, dateTo } = req.query

    const where: any = {}

    if (storeId) where.storeId = storeId
    if (supplierId) where.supplierId = supplierId
    if (status) where.status = status

    if (dateFrom || dateTo) {
      where.orderDate = {}
      if (dateFrom) where.orderDate.gte = new Date(dateFrom as string)
      if (dateTo) where.orderDate.lte = new Date(dateTo as string)
    }

    const orders = await prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(orders)
  } catch (error) {
    console.error('Error obteniendo órdenes de compra:', error)
    res.status(500).json({ error: 'Error al obtener órdenes de compra' })
  }
})

// ========================================
// OBTENER ORDEN DE COMPRA POR ID
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: true
      }
    })

    if (!order) {
      return res.status(404).json({ error: 'Orden de compra no encontrada' })
    }

    res.json(order)
  } catch (error) {
    console.error('Error obteniendo orden de compra:', error)
    res.status(500).json({ error: 'Error al obtener orden de compra' })
  }
})

// ========================================
// CREAR ORDEN DE COMPRA
// ========================================
router.post('/', async (req, res) => {
  try {
    const {
      supplierId,
      storeId,
      expectedDeliveryDate,
      notes,
      internalNotes,
      items
    } = req.body

    if (!supplierId || !storeId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    // Calcular totales
    let subtotal = 0
    items.forEach((item: any) => {
      subtotal += Number(item.quantity) * Number(item.unitPrice)
    })

    const taxAmount = subtotal * 0.16
    const totalAmount = subtotal + taxAmount

    // Generar número de orden
    const count = await prisma.purchaseOrder.count()
    const orderNumber = `PO-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const order = await prisma.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId,
        storeId,
        expectedDeliveryDate: new Date(expectedDeliveryDate),
        subtotal,
        taxAmount,
        totalAmount,
        notes,
        internalNotes,
        createdBy: 'user-1', // TODO: Obtener del contexto
        items: {
          create: items.map((item: any) => ({
            ingredientId: item.ingredientId,
            quantity: Number(item.quantity),
            unit: item.unit,
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.quantity) * Number(item.unitPrice),
            remainingQuantity: Number(item.quantity),
            notes: item.notes
          }))
        }
      },
      include: {
        supplier: true,
        items: true
      }
    })

    res.status(201).json(order)
  } catch (error) {
    console.error('Error creando orden de compra:', error)
    res.status(500).json({ error: 'Error al crear orden de compra' })
  }
})

// ========================================
// ACTUALIZAR ORDEN DE COMPRA
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, notes, internalNotes } = req.body

    const order = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status,
        notes,
        internalNotes
      },
      include: {
        supplier: true,
        items: true
      }
    })

    res.json(order)
  } catch (error) {
    console.error('Error actualizando orden de compra:', error)
    res.status(500).json({ error: 'Error al actualizar orden de compra' })
  }
})

// ========================================
// RECIBIR ORDEN DE COMPRA
// ========================================
router.post('/:id/receive', async (req, res) => {
  try {
    const { id } = req.params
    const { receivedDate, receivedBy, items } = req.body

    const result = await prisma.$transaction(async (tx) => {
      // Actualizar orden
      const order = await tx.purchaseOrder.update({
        where: { id },
        data: {
          status: 'RECEIVED',
          actualDeliveryDate: new Date(receivedDate),
          receivedBy
        }
      })

      // Actualizar items y stock de ingredientes
      for (const item of items) {
        await tx.purchaseOrderItem.update({
          where: { id: item.purchaseOrderItemId },
          data: {
            receivedQuantity: Number(item.receivedQuantity)
          }
        })

        // Actualizar stock del ingrediente
        await tx.ingredient.update({
          where: { id: item.ingredientId },
          data: {
            currentStock: {
              increment: Number(item.receivedQuantity)
            }
          }
        })
      }

      return order
    })

    res.json(result)
  } catch (error) {
    console.error('Error recibiendo orden de compra:', error)
    res.status(500).json({ error: 'Error al recibir orden de compra' })
  }
})

// ========================================
// ELIMINAR ORDEN DE COMPRA
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.purchaseOrder.delete({
      where: { id }
    })

    res.json({ message: 'Orden de compra eliminada correctamente' })
  } catch (error) {
    console.error('Error eliminando orden de compra:', error)
    res.status(500).json({ error: 'Error al eliminar orden de compra' })
  }
})

export default router
