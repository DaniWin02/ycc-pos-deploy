import express from 'express'
import { PrismaClient } from '@prisma/client'
import { validateRequiredFields, asyncHandler } from '../utils/validation'

const router = express.Router()
const prisma = new PrismaClient()

// ========================================
// OBTENER TODOS LOS PROVEEDORES
// ========================================
router.get('/', asyncHandler(async (req, res) => {
  const { search, city, minRating, isActive } = req.query

  const where: any = {}

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
      { contactPerson: { contains: search as string, mode: 'insensitive' } }
    ]
  }

  if (city) where.city = city
  if (minRating) where.rating = { gte: Number(minRating) }
  if (isActive !== undefined) where.isActive = isActive === 'true'

  const suppliers = await prisma.supplier.findMany({
    where,
    orderBy: { name: 'asc' }
  })

  res.json(suppliers)
}))

// ========================================
// OBTENER PROVEEDOR POR ID
// ========================================
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  const supplier = await prisma.supplier.findUnique({
    where: { id },
    include: {
      purchaseOrders: {
        orderBy: { createdAt: 'desc' },
        take: 10
      }
    }
  })

  if (!supplier) {
    return res.status(404).json({ error: 'Proveedor no encontrado' })
  }

  res.json(supplier)
}))

// ========================================
// CREAR PROVEEDOR
// ========================================
router.post('/', validateRequiredFields(['name']), asyncHandler(async (req, res) => {
  const {
    name,
    description,
    contactPerson,
    email,
    phone,
    address,
    city,
    state,
    country,
    postalCode,
    taxId,
    paymentTerms,
    deliveryDays,
    minimumOrder,
    isActive,
    notes,
    website
  } = req.body

  const supplier = await prisma.supplier.create({
    data: {
      name,
      description,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      paymentTerms,
      deliveryDays,
      minimumOrder: minimumOrder ? Number(minimumOrder) : null,
      isActive: isActive !== undefined ? isActive : true,
      notes,
      website
    }
  })

  res.status(201).json(supplier)
}))

// ========================================
// ACTUALIZAR PROVEEDOR
// ========================================
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  const {
    name,
    description,
    contactPerson,
    email,
    phone,
    address,
    city,
    state,
    country,
    postalCode,
    taxId,
    paymentTerms,
    deliveryDays,
    minimumOrder,
    isActive,
    notes,
    website
  } = req.body

  const supplier = await prisma.supplier.update({
    where: { id },
    data: {
      name,
      description,
      contactPerson,
      email,
      phone,
      address,
      city,
      state,
      country,
      postalCode,
      taxId,
      paymentTerms,
      deliveryDays,
      minimumOrder: minimumOrder ? Number(minimumOrder) : undefined,
      isActive,
      notes,
      website
    }
  })

  res.json(supplier)
}))

// ========================================
// ELIMINAR PROVEEDOR
// ========================================
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params

  await prisma.supplier.delete({
    where: { id }
  })

  res.json({ message: 'Proveedor eliminado correctamente' })
}))

export default router
