import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// ========================================
// OBTENER TODOS LOS CONTEOS FÍSICOS
// ========================================
router.get('/', async (req, res) => {
  try {
    const { storeId, status, dateFrom, dateTo } = req.query

    const where: any = {}

    if (storeId) where.storeId = storeId
    if (status) where.status = status

    if (dateFrom || dateTo) {
      where.countDate = {}
      if (dateFrom) where.countDate.gte = new Date(dateFrom as string)
      if (dateTo) where.countDate.lte = new Date(dateTo as string)
    }

    const counts = await prisma.physicalCount.findMany({
      where,
      include: {
        items: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(counts)
  } catch (error) {
    console.error('Error obteniendo conteos físicos:', error)
    res.status(500).json({ error: 'Error al obtener conteos físicos' })
  }
})

// ========================================
// OBTENER CONTEO FÍSICO POR ID
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const count = await prisma.physicalCount.findUnique({
      where: { id },
      include: {
        items: true
      }
    })

    if (!count) {
      return res.status(404).json({ error: 'Conteo físico no encontrado' })
    }

    res.json(count)
  } catch (error) {
    console.error('Error obteniendo conteo físico:', error)
    res.status(500).json({ error: 'Error al obtener conteo físico' })
  }
})

// ========================================
// CREAR CONTEO FÍSICO
// ========================================
router.post('/', async (req, res) => {
  try {
    const { storeId, countDate, notes, items } = req.body

    if (!storeId || !countDate) {
      return res.status(400).json({ error: 'Datos incompletos' })
    }

    // Generar número de conteo
    const count = await prisma.physicalCount.count()
    const countNumber = `COUNT-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`

    const physicalCount = await prisma.physicalCount.create({
      data: {
        countNumber,
        storeId,
        countDate: new Date(countDate),
        notes,
        totalItems: items?.length || 0,
        items: items ? {
          create: items.map((item: any) => ({
            ingredientId: item.ingredientId,
            expectedQuantity: Number(item.expectedQuantity),
            unit: item.unit,
            unitCost: Number(item.unitCost),
            notes: item.notes
          }))
        } : undefined
      },
      include: {
        items: true
      }
    })

    res.status(201).json(physicalCount)
  } catch (error) {
    console.error('Error creando conteo físico:', error)
    res.status(500).json({ error: 'Error al crear conteo físico' })
  }
})

// ========================================
// ACTUALIZAR CONTEO FÍSICO
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status, countedBy, reviewedBy, notes, items } = req.body

    const result = await prisma.$transaction(async (tx) => {
      // Actualizar items si se proporcionan
      if (items) {
        for (const item of items) {
          await tx.physicalCountItem.update({
            where: { id: item.id },
            data: {
              countedQuantity: item.countedQuantity ? Number(item.countedQuantity) : undefined,
              varianceQuantity: item.varianceQuantity ? Number(item.varianceQuantity) : undefined,
              varianceValue: item.varianceValue ? Number(item.varianceValue) : undefined,
              notes: item.notes
            }
          })
        }
      }

      // Calcular varianzas totales
      const allItems = await tx.physicalCountItem.findMany({
        where: { physicalCountId: id }
      })

      let totalVariance = 0
      let countedItems = 0

      allItems.forEach(item => {
        if (item.countedQuantity !== null) {
          countedItems++
          if (item.varianceValue) {
            totalVariance += Number(item.varianceValue)
          }
        }
      })

      // Actualizar conteo
      const count = await tx.physicalCount.update({
        where: { id },
        data: {
          status,
          countedBy,
          reviewedBy,
          notes,
          countedItems,
          varianceAmount: totalVariance,
          startedAt: status === 'IN_PROGRESS' ? new Date() : undefined,
          completedAt: status === 'COMPLETED' ? new Date() : undefined
        },
        include: {
          items: true
        }
      })

      return count
    })

    res.json(result)
  } catch (error) {
    console.error('Error actualizando conteo físico:', error)
    res.status(500).json({ error: 'Error al actualizar conteo físico' })
  }
})

// ========================================
// ELIMINAR CONTEO FÍSICO
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.physicalCount.delete({
      where: { id }
    })

    res.json({ message: 'Conteo físico eliminado correctamente' })
  } catch (error) {
    console.error('Error eliminando conteo físico:', error)
    res.status(500).json({ error: 'Error al eliminar conteo físico' })
  }
})

export default router
