import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// ========================================
// VERIFICAR DISPONIBILIDAD DE PRODUCTO
// ========================================
router.get('/check/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { quantity = 1 } = req.query

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    // Si no rastrea inventario, siempre está disponible
    if (!product.trackInventory) {
      return res.json({
        available: true,
        inStock: true,
        currentStock: null,
        message: 'Producto sin control de inventario'
      })
    }

    const requestedQty = Number(quantity)
    const available = product.currentStock >= requestedQty

    // Verificar ingredientes si tiene receta
    let ingredientsAvailable = true
    const missingIngredients: string[] = []

    if (product.recipe) {
      for (const recipeIng of product.recipe.ingredients) {
        const requiredQty = Number(recipeIng.quantity) * requestedQty
        if (Number(recipeIng.ingredient.currentStock) < requiredQty) {
          ingredientsAvailable = false
          missingIngredients.push(recipeIng.ingredient.name)
        }
      }
    }

    res.json({
      available: available && ingredientsAvailable,
      inStock: available,
      currentStock: Number(product.currentStock),
      requestedQuantity: requestedQty,
      minStockLevel: product.minStockLevel ? Number(product.minStockLevel) : null,
      ingredientsAvailable,
      missingIngredients: missingIngredients.length > 0 ? missingIngredients : null,
      message: !available 
        ? 'Stock insuficiente' 
        : !ingredientsAvailable 
        ? `Ingredientes faltantes: ${missingIngredients.join(', ')}`
        : 'Disponible'
    })
  } catch (error) {
    console.error('Error verificando disponibilidad:', error)
    res.status(500).json({ error: 'Error al verificar disponibilidad' })
  }
})

// ========================================
// DESCONTAR INVENTARIO (AL CONFIRMAR VENTA)
// ========================================
router.post('/consume', async (req, res) => {
  try {
    const { productId, quantity, orderId, userId } = req.body

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId y quantity son requeridos' })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        recipe: {
          include: {
            ingredients: true
          }
        }
      }
    })

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    // Si no rastrea inventario, no hacer nada
    if (!product.trackInventory) {
      return res.json({
        success: true,
        message: 'Producto sin control de inventario'
      })
    }

    const result = await prisma.$transaction(async (tx) => {
      // Descontar producto principal
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: {
            decrement: Number(quantity)
          }
        }
      })

      // Registrar movimiento
      await tx.inventoryMovement.create({
        data: {
          productId,
          type: 'OUT',
          quantity: Number(quantity),
          reason: 'Venta',
          reference: orderId || 'Sin referencia',
          storeId: 'store-1', // TODO: Obtener de contexto
          createdById: userId || 'system'
        }
      })

      // Descontar ingredientes si tiene receta
      if (product.recipe) {
        for (const recipeIng of product.recipe.ingredients) {
          const ingredientQty = Number(recipeIng.quantity) * Number(quantity)
          
          await tx.ingredient.update({
            where: { id: recipeIng.ingredientId },
            data: {
              currentStock: {
                decrement: ingredientQty
              }
            }
          })

          await tx.inventoryMovement.create({
            data: {
              productId,
              ingredientId: recipeIng.ingredientId,
              type: 'OUT',
              quantity: ingredientQty,
              reason: 'Producción',
              reference: orderId || 'Sin referencia',
              storeId: 'store-1',
              createdById: userId || 'system'
            }
          })
        }
      }

      // Verificar si necesita alerta de stock bajo
      if (updatedProduct.minStockLevel && updatedProduct.currentStock <= updatedProduct.minStockLevel) {
        const existingAlert = await tx.stockAlert.findFirst({
          where: {
            productId,
            isResolved: false,
            type: updatedProduct.currentStock <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
          }
        })

        if (!existingAlert) {
          await tx.stockAlert.create({
            data: {
              productId,
              type: updatedProduct.currentStock <= 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
              level: updatedProduct.currentStock,
              message: updatedProduct.currentStock <= 0 
                ? `${product.name} está agotado`
                : `${product.name} tiene stock bajo (${updatedProduct.currentStock} ${product.unit})`
            }
          })
        }
      }

      return updatedProduct
    })

    res.json({
      success: true,
      newStock: Number(result.currentStock),
      message: 'Inventario actualizado correctamente'
    })
  } catch (error) {
    console.error('Error descontando inventario:', error)
    res.status(500).json({ error: 'Error al descontar inventario' })
  }
})

// ========================================
// OBTENER ALERTAS DE INVENTARIO
// ========================================
router.get('/alerts', async (req, res) => {
  try {
    const { resolved = 'false' } = req.query

    const alerts = await prisma.stockAlert.findMany({
      where: {
        isResolved: resolved === 'true'
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            currentStock: true,
            minStockLevel: true,
            unit: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(alerts)
  } catch (error) {
    console.error('Error obteniendo alertas:', error)
    res.status(500).json({ error: 'Error al obtener alertas' })
  }
})

// ========================================
// RESOLVER ALERTA
// ========================================
router.put('/alerts/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params

    const alert = await prisma.stockAlert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    })

    res.json(alert)
  } catch (error) {
    console.error('Error resolviendo alerta:', error)
    res.status(500).json({ error: 'Error al resolver alerta' })
  }
})

// ========================================
// OBTENER PRODUCTOS CON STOCK BAJO
// ========================================
router.get('/low-stock', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        trackInventory: true,
        isActive: true,
        AND: [
          {
            currentStock: {
              lte: prisma.product.fields.minStockLevel
            }
          }
        ]
      },
      include: {
        category: true,
        stockAlerts: {
          where: {
            isResolved: false
          }
        }
      },
      orderBy: {
        currentStock: 'asc'
      }
    })

    res.json(products)
  } catch (error) {
    console.error('Error obteniendo productos con stock bajo:', error)
    res.status(500).json({ error: 'Error al obtener productos con stock bajo' })
  }
})

// ========================================
// AGREGAR STOCK (ENTRADA DE INVENTARIO)
// ========================================
router.post('/add-stock', async (req, res) => {
  try {
    const { productId, quantity, unitCost, reason, userId } = req.body

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'productId y quantity son requeridos' })
    }

    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.update({
        where: { id: productId },
        data: {
          currentStock: {
            increment: Number(quantity)
          }
        }
      })

      await tx.inventoryMovement.create({
        data: {
          productId,
          type: 'IN',
          quantity: Number(quantity),
          unitCost: unitCost ? Number(unitCost) : null,
          reason: reason || 'Entrada de inventario',
          storeId: 'store-1',
          createdById: userId || 'system'
        }
      })

      // Resolver alertas si el stock ahora es suficiente
      if (product.minStockLevel && product.currentStock > product.minStockLevel) {
        await tx.stockAlert.updateMany({
          where: {
            productId,
            isResolved: false
          },
          data: {
            isResolved: true,
            resolvedAt: new Date()
          }
        })
      }

      return product
    })

    res.json({
      success: true,
      newStock: Number(result.currentStock),
      message: 'Stock agregado correctamente'
    })
  } catch (error) {
    console.error('Error agregando stock:', error)
    res.status(500).json({ error: 'Error al agregar stock' })
  }
})

// ========================================
// OBTENER MOVIMIENTOS DE INVENTARIO
// ========================================
router.get('/movements', async (req, res) => {
  try {
    const { productId, type, startDate, endDate, limit = 50 } = req.query

    const where: any = {}

    if (productId) where.productId = productId
    if (type) where.type = type
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate as string)
      if (endDate) where.createdAt.lte = new Date(endDate as string)
    }

    const movements = await prisma.inventoryMovement.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            unit: true
          }
        },
        ingredient: {
          select: {
            name: true,
            unit: true
          }
        },
        createdBy: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: Number(limit)
    })

    res.json(movements)
  } catch (error) {
    console.error('Error obteniendo movimientos:', error)
    res.status(500).json({ error: 'Error al obtener movimientos' })
  }
})

export default router
