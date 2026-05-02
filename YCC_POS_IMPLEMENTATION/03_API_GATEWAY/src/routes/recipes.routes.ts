import express from 'express'
import { PrismaClient } from '@prisma/client'

const router = express.Router()
const prisma = new PrismaClient()

// ========================================
// OBTENER TODAS LAS RECETAS
// ========================================
router.get('/', async (req, res) => {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            category: true
          }
        },
        ingredients: {
          include: {
            ingredient: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    res.json(recipes)
  } catch (error) {
    console.error('Error obteniendo recetas:', error)
    res.status(500).json({ error: 'Error al obtener recetas' })
  }
})

// ========================================
// OBTENER RECETA POR ID
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        product: true,
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    })

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' })
    }

    res.json(recipe)
  } catch (error) {
    console.error('Error obteniendo receta:', error)
    res.status(500).json({ error: 'Error al obtener receta' })
  }
})

// ========================================
// OBTENER RECETA POR PRODUCTO
// ========================================
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params

    const recipe = await prisma.recipe.findUnique({
      where: { productId },
      include: {
        product: true,
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    })

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada para este producto' })
    }

    res.json(recipe)
  } catch (error) {
    console.error('Error obteniendo receta:', error)
    res.status(500).json({ error: 'Error al obtener receta' })
  }
})

// ========================================
// CREAR RECETA
// ========================================
router.post('/', async (req, res) => {
  try {
    const { productId, name, description, instructions, preparationTime, servings, ingredients } = req.body

    if (!productId || !name || !ingredients || ingredients.length === 0) {
      return res.status(400).json({ error: 'productId, name e ingredients son requeridos' })
    }

    // Verificar que el producto existe
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' })
    }

    // Verificar que no existe una receta para este producto
    const existingRecipe = await prisma.recipe.findUnique({
      where: { productId }
    })

    if (existingRecipe) {
      return res.status(400).json({ error: 'Ya existe una receta para este producto' })
    }

    // Calcular costo de la receta
    let totalCost = 0
    for (const ing of ingredients) {
      const ingredient = await prisma.ingredient.findUnique({
        where: { id: ing.ingredientId }
      })
      if (ingredient) {
        totalCost += Number(ingredient.currentCost) * Number(ing.quantity)
      }
    }

    const costPerServing = servings ? totalCost / servings : totalCost

    const recipe = await prisma.recipe.create({
      data: {
        productId,
        name,
        description,
        instructions,
        preparationTime,
        servings: servings || 1,
        costPerServing,
        ingredients: {
          create: ingredients.map((ing: any) => ({
            ingredientId: ing.ingredientId,
            quantity: Number(ing.quantity),
            unit: ing.unit,
            notes: ing.notes
          }))
        }
      },
      include: {
        product: true,
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    })

    res.status(201).json(recipe)
  } catch (error) {
    console.error('Error creando receta:', error)
    res.status(500).json({ error: 'Error al crear receta' })
  }
})

// ========================================
// ACTUALIZAR RECETA
// ========================================
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, instructions, preparationTime, servings, ingredients } = req.body

    const existingRecipe = await prisma.recipe.findUnique({
      where: { id }
    })

    if (!existingRecipe) {
      return res.status(404).json({ error: 'Receta no encontrada' })
    }

    // Calcular nuevo costo si se proporcionan ingredientes
    let costPerServing: any = existingRecipe.costPerServing
    if (ingredients && ingredients.length > 0) {
      let totalCost = 0
      for (const ing of ingredients) {
        const ingredient = await prisma.ingredient.findUnique({
          where: { id: ing.ingredientId }
        })
        if (ingredient) {
          totalCost += Number(ingredient.currentCost) * Number(ing.quantity)
        }
      }
      costPerServing = (servings || existingRecipe.servings) ? totalCost / (servings || existingRecipe.servings) : totalCost
    }

    const recipe = await prisma.$transaction(async (tx) => {
      // Eliminar ingredientes existentes si se proporcionan nuevos
      if (ingredients) {
        await tx.recipeIngredient.deleteMany({
          where: { recipeId: id }
        })
      }

      // Actualizar receta
      return await tx.recipe.update({
        where: { id },
        data: {
          name: name || existingRecipe.name,
          description,
          instructions,
          preparationTime,
          servings: servings || existingRecipe.servings,
          costPerServing: costPerServing as any,
          ingredients: ingredients ? {
            create: ingredients.map((ing: any) => ({
              ingredientId: ing.ingredientId,
              quantity: Number(ing.quantity),
              unit: ing.unit,
              notes: ing.notes
            }))
          } : undefined
        },
        include: {
          product: true,
          ingredients: {
            include: {
              ingredient: true
            }
          }
        }
      })
    })

    res.json(recipe)
  } catch (error) {
    console.error('Error actualizando receta:', error)
    res.status(500).json({ error: 'Error al actualizar receta' })
  }
})

// ========================================
// ELIMINAR RECETA
// ========================================
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await prisma.recipe.delete({
      where: { id }
    })

    res.json({ message: 'Receta eliminada correctamente' })
  } catch (error) {
    console.error('Error eliminando receta:', error)
    res.status(500).json({ error: 'Error al eliminar receta' })
  }
})

// ========================================
// CALCULAR COSTO DE PRODUCCIÓN
// ========================================
router.post('/calculate-cost', async (req, res) => {
  try {
    const { recipeId, quantity = 1 } = req.body

    if (!recipeId) {
      return res.status(400).json({ error: 'recipeId es requerido' })
    }

    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        product: true,
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    })

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' })
    }

    let totalCost = 0
    const ingredientsCost = []

    for (const recipeIng of recipe.ingredients) {
      const cost = Number(recipeIng.ingredient.currentCost) * Number(recipeIng.quantity) * Number(quantity)
      totalCost += cost
      
      ingredientsCost.push({
        name: recipeIng.ingredient.name,
        quantity: Number(recipeIng.quantity) * Number(quantity),
        unit: recipeIng.unit,
        unitCost: Number(recipeIng.ingredient.currentCost),
        totalCost: cost
      })
    }

    const costPerUnit = totalCost / (recipe.servings * Number(quantity))
    const sellingPrice = Number(recipe.product.price)
    const profit = sellingPrice - costPerUnit
    const profitMargin = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0

    res.json({
      recipeId: recipe.id,
      recipeName: recipe.name,
      productName: recipe.product.name,
      quantity: Number(quantity),
      servings: recipe.servings * Number(quantity),
      totalCost,
      costPerUnit,
      sellingPrice,
      profit,
      profitMargin: profitMargin.toFixed(2) + '%',
      ingredients: ingredientsCost
    })
  } catch (error) {
    console.error('Error calculando costo:', error)
    res.status(500).json({ error: 'Error al calcular costo' })
  }
})

// ========================================
// VERIFICAR DISPONIBILIDAD DE INGREDIENTES
// ========================================
router.get('/:id/check-ingredients', async (req, res) => {
  try {
    const { id } = req.params
    const { quantity = 1 } = req.query

    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            ingredient: true
          }
        }
      }
    })

    if (!recipe) {
      return res.status(404).json({ error: 'Receta no encontrada' })
    }

    const qty = Number(quantity)
    let allAvailable = true
    const ingredientsStatus = []

    for (const recipeIng of recipe.ingredients) {
      const requiredQty = Number(recipeIng.quantity) * qty
      const available = Number(recipeIng.ingredient.currentStock) >= requiredQty
      
      if (!available) allAvailable = false

      ingredientsStatus.push({
        name: recipeIng.ingredient.name,
        required: requiredQty,
        available: Number(recipeIng.ingredient.currentStock),
        unit: recipeIng.unit,
        sufficient: available
      })
    }

    res.json({
      recipeId: recipe.id,
      recipeName: recipe.name,
      requestedQuantity: qty,
      canProduce: allAvailable,
      ingredients: ingredientsStatus
    })
  } catch (error) {
    console.error('Error verificando ingredientes:', error)
    res.status(500).json({ error: 'Error al verificar ingredientes' })
  }
})

export default router
