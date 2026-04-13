import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// ========================================
// OBTENER TODOS LOS REGISTROS DE DESPERDICIO
// ========================================
router.get('/', async (req, res) => {
  try {
    const { storeId, status, dateFrom, dateTo } = req.query

    const where: any = {}

    if (storeId) where.storeId = storeId
    if (status) where.status = status

    if (dateFrom || dateTo) {
      where.wasteDate = {}
      if (dateFrom) where.wasteDate.gte = new Date(dateFrom as string)
      if (dateTo) where.wasteDate.lte = new Date(dateTo as string)
    }

    const wasteRecords = await prisma.wasteRecord.findMany({
      where,
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(wasteRecords)
  } catch (error) {
    console.error('Error obteniendo registros de desperdicio:', error)
    res.status(500).json({ error: 'Error al obtener registros de desperdicio' })
  }
})

// ========================================
// OBTENER REGISTRO DE DESPERDICIO POR ID
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const wasteRecord = await prisma.wasteRecord.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!wasteRecord) {
      return res.status(404).json({ error: 'Registro de desperdicio no encontrado' })
    }

    res.json(wasteRecord)
  } catch (error) {
    console.error('Error obteniendo registro de desperdicio:', error)
    res.status(500).json({ error: 'Error al obtener registro de desperdicio' })
  }
})

// ========================================
// CREAR REGISTRO DE DESPERDICIO
// ========================================
router.post('/', async (req, res) => {
  try {
    const { storeId, reportedBy, reason, notes, items } = req.body

    if (!storeId || !reportedBy || !items || items.length === 0) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    // Calcular total
    let totalValue = 0
    items.forEach((item: any) => {
      totalValue += Number(item.quantity) * Number(item.unitCost)
    })

    // Generar número de desperdicio
    const count = await prisma.wasteRecord.count()
    const wasteNumber = `WASTE-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const wasteRecord = await prisma.wasteRecord.create({
      data: {
        wasteNumber,
        storeId,
        reportedBy,
        reason,
        notes,
        totalValue,
        items: {
          create: items.map((item: any) => ({
            ingredientId: item.ingredientId,
            quantity: Number(item.quantity),
            unit: item.unit,
            unitCost: Number(item.unitCost),
            totalCost: Number(item.quantity) * Number(item.unitCost),
            reason: item.reason,
            notes: item.notes
          }))
        }
      },
      include: {
        items: true
      }
    })

    // Descontar del inventario
    for (const item of items) {
      await prisma.ingredient.update({
        where: { id: item.ingredientId },
        data: {
          currentStock: {
            decrement: Number(item.quantity)
          }
        }
      })
    }

    res.status(201).json(wasteRecord)
  } catch (error) {
    console.error('Error creando registro de desperdicio:', error)
    res.status(500).json({ error: 'Error al crear registro de desperdicio' })
  }
})

// ========================================
// ACTUALIZAR REGISTRO DE DESPERDICIO
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, approvedBy, notes } = req.body

    const wasteRecord = await prisma.wasteRecord.update({
      where: { id },
      data: {
        status,
        approvedBy,
        notes
      },
      include: {
        items: true
      }
    })

    res.json(wasteRecord)
  } catch (error) {
    console.error('Error actualizando registro de desperdicio:', error)
    res.status(500).json({ error: 'Error al actualizar registro de desperdicio' })
  }
})

// ========================================
// ELIMINAR REGISTRO DE DESPERDICIO
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.wasteRecord.delete({
      where: { id }
    })

    res.json({ message: 'Registro de desperdicio eliminado correctamente' })
  } catch (error) {
    console.error('Error eliminando registro de desperdicio:', error)
    res.status(500).json({ error: 'Error al eliminar registro de desperdicio' })
  }
})

// ========================================
// OBTENER ESTADÍSTICAS DE DESPERDICIO
// ========================================
router.get('/stats/summary', async (req, res) => {
  try {
    const { storeId, dateFrom, dateTo } = req.query

    const where: any = { status: 'APPROVED' }

    if (storeId) where.storeId = storeId

    if (dateFrom || dateTo) {
      where.wasteDate = {}
      if (dateFrom) where.wasteDate.gte = new Date(dateFrom as string)
      if (dateTo) where.wasteDate.lte = new Date(dateTo as string)
    }

    const wasteRecords = await prisma.wasteRecord.findMany({
      where,
      include: {
        items: true
      }
    })

    // Calcular estadísticas
    const totalValue = wasteRecords.reduce((sum, record) => sum + Number(record.totalValue), 0)
    const totalRecords = wasteRecords.length

    // Agrupar por razón
    const byReason: any = {}
    wasteRecords.forEach(record => {
      record.items.forEach(item => {
        if (!byReason[item.reason]) {
          byReason[item.reason] = { count: 0, value: 0 }
        }
        byReason[item.reason].count++
        byReason[item.reason].value += Number(item.totalCost)
      })
    })

    res.json({
      totalValue,
      totalRecords,
      byReason
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas de desperdicio:', error)
    res.status(500).json({ error: 'Error al obtener estadísticas de desperdicio' })
  }
})

export default router
