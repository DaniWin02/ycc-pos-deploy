import { BomResolverService } from '../../src/services/bom-resolver.service'
import { prisma } from '../setup'
import { userFactory, productFactory, recipeFactory } from '../factories'

describe('BomResolverService', () => {
  let bomService: BomResolverService

  beforeEach(() => {
    bomService = new BomResolverService(prisma)
  })

  describe('resolveBom', () => {
    it('should resolve simple recipe with direct ingredients', async () => {
      // Create ingredients
      const tomato = await productFactory.create({ name: 'Tomato', cost: 0.50 })
      const lettuce = await productFactory.create({ name: 'Lettuce', cost: 0.30 })
      
      // Create recipe with direct ingredients
      const salad = await recipeFactory.create({ name: 'Simple Salad' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: salad.id, productId: tomato.id, quantity: 2, unit: 'PIECE' },
          { recipeId: salad.id, productId: lettuce.id, quantity: 1, unit: 'PIECE' }
        ]
      })

      const bom = await bomService.resolveBom(salad.id)

      expect(bom).toHaveLength(2)
      expect(bom).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            productId: tomato.id,
            productName: 'Tomato',
            quantity: 2,
            unit: 'PIECE',
            isRecipe: false
          }),
          expect.objectContaining({
            productId: lettuce.id,
            productName: 'Lettuce',
            quantity: 1,
            unit: 'PIECE',
            isRecipe: false
          })
        ])
      )
    })

    it('should resolve nested recipe recursively', async () => {
      // Create base ingredients
      const flour = await productFactory.create({ name: 'Flour', cost: 0.20 })
      const water = await productFactory.create({ name: 'Water', cost: 0.05 })
      const tomato = await productFactory.create({ name: 'Tomato', cost: 0.50 })

      // Create dough recipe
      const dough = await recipeFactory.create({ name: 'Pizza Dough' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: dough.id, productId: flour.id, quantity: 2, unit: 'CUP' },
          { recipeId: dough.id, productId: water.id, quantity: 1, unit: 'CUP' }
        ]
      })

      // Create pizza recipe using dough
      const pizza = await recipeFactory.create({ name: 'Pizza' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: pizza.id, productId: dough.id, quantity: 1, unit: 'PIECE' },
          { recipeId: pizza.id, productId: tomato.id, quantity: 3, unit: 'PIECE' }
        ]
      })

      const bom = await bomService.resolveBom(pizza.id)

      expect(bom).toHaveLength(3)
      expect(bom).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            productId: flour.id,
            productName: 'Flour',
            quantity: 2, // 1 dough * 2 flour
            isRecipe: false
          }),
          expect.objectContaining({
            productId: water.id,
            productName: 'Water',
            quantity: 1, // 1 dough * 1 water
            isRecipe: false
          }),
          expect.objectContaining({
            productId: tomato.id,
            productName: 'Tomato',
            quantity: 3,
            isRecipe: false
          })
        ])
      )
    })

    it('should handle multiple levels of recursion', async () => {
      // Create base ingredient
      const flour = await productFactory.create({ name: 'Flour', cost: 0.20 })

      // Create dough
      const dough = await recipeFactory.create({ name: 'Dough' })
      await prisma.recipeIngredient.create({
        data: { recipeId: dough.id, productId: flour.id, quantity: 2, unit: 'CUP' }
      })

      // Create bread using dough
      const bread = await recipeFactory.create({ name: 'Bread' })
      await prisma.recipeIngredient.create({
        data: { recipeId: bread.id, productId: dough.id, quantity: 1, unit: 'PIECE' }
      })

      // Create sandwich using bread
      const sandwich = await recipeFactory.create({ name: 'Sandwich' })
      await prisma.recipeIngredient.create({
        data: { recipeId: sandwich.id, productId: bread.id, quantity: 2, unit: 'PIECE' }
      })

      const bom = await bomService.resolveBom(sandwich.id)

      expect(bom).toHaveLength(1)
      expect(bom[0]).toEqual(
        expect.objectContaining({
          productId: flour.id,
          productName: 'Flour',
          quantity: 4, // 2 bread * 1 dough * 2 flour
          isRecipe: false
        })
      )
    })

    it('should throw error for maximum recursion depth', async () => {
      // Create ingredient
      const flour = await productFactory.create({ name: 'Flour', cost: 0.20 })

      // Create circular reference (recipe that uses itself)
      const circularRecipe = await recipeFactory.create({ name: 'Circular Recipe' })
      await prisma.recipeIngredient.create({
        data: { recipeId: circularRecipe.id, productId: circularRecipe.id, quantity: 1, unit: 'PIECE' }
      })

      await expect(bomService.resolveBom(circularRecipe.id, 1))
        .rejects.toThrow('Maximum recursion depth reached')
    })

    it('should handle empty recipe', async () => {
      const emptyRecipe = await recipeFactory.create({ name: 'Empty Recipe' })

      const bom = await bomService.resolveBom(emptyRecipe.id)

      expect(bom).toHaveLength(0)
    })

    it('should scale quantities correctly for nested recipes', async () => {
      // Create base ingredients
      const flour = await productFactory.create({ name: 'Flour', cost: 0.20 })
      const sugar = await productFactory.create({ name: 'Sugar', cost: 0.10 })

      // Create dough recipe
      const dough = await recipeFactory.create({ name: 'Dough' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: dough.id, productId: flour.id, quantity: 2, unit: 'CUP' },
          { recipeId: dough.id, productId: sugar.id, quantity: 1, unit: 'CUP' }
        ]
      })

      // Create final recipe using multiple dough portions
      const cake = await recipeFactory.create({ name: 'Cake' })
      await prisma.recipeIngredient.create({
        data: { recipeId: cake.id, productId: dough.id, quantity: 3, unit: 'PIECE' }
      })

      const bom = await bomService.resolveBom(cake.id)

      expect(bom).toHaveLength(2)
      expect(bom).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            productId: flour.id,
            productName: 'Flour',
            quantity: 6, // 3 dough * 2 flour
            isRecipe: false
          }),
          expect.objectContaining({
            productId: sugar.id,
            productName: 'Sugar',
            quantity: 3, // 3 dough * 1 sugar
            isRecipe: false
          })
        ])
      )
    })
  })

  describe('calculateRecipeCost', () => {
    it('should calculate cost for simple recipe', async () => {
      // Create ingredients with known costs
      const tomato = await productFactory.create({ name: 'Tomato', cost: 0.50 })
      const lettuce = await productFactory.create({ name: 'Lettuce', cost: 0.30 })
      
      // Create recipe
      const salad = await recipeFactory.create({ name: 'Simple Salad' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: salad.id, productId: tomato.id, quantity: 2, unit: 'PIECE' },
          { recipeId: salad.id, productId: lettuce.id, quantity: 1, unit: 'PIECE' }
        ]
      })

      const cost = await bomService.calculateRecipeCost(salad.id)

      expect(cost).toBe(1.30) // (2 * 0.50) + (1 * 0.30)
    })

    it('should calculate cost for nested recipe', async () => {
      // Create base ingredients
      const flour = await productFactory.create({ name: 'Flour', cost: 0.20 })
      const water = await productFactory.create({ name: 'Water', cost: 0.05 })
      const tomato = await productFactory.create({ name: 'Tomato', cost: 0.50 })

      // Create dough
      const dough = await recipeFactory.create({ name: 'Pizza Dough' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: dough.id, productId: flour.id, quantity: 2, unit: 'CUP' },
          { recipeId: dough.id, productId: water.id, quantity: 1, unit: 'CUP' }
        ]
      })

      // Create pizza
      const pizza = await recipeFactory.create({ name: 'Pizza' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: pizza.id, productId: dough.id, quantity: 1, unit: 'PIECE' },
          { recipeId: pizza.id, productId: tomato.id, quantity: 3, unit: 'PIECE' }
        ]
      })

      const cost = await bomService.calculateRecipeCost(pizza.id)

      expect(cost).toBe(1.15) // (2 * 0.20) + (1 * 0.05) + (3 * 0.50)
    })
  })

  describe('checkStockAvailability', () => {
    it('should report no shortages for sufficient stock', async () => {
      // Create ingredients with sufficient stock
      const tomato = await productFactory.create({ name: 'Tomato', stock: 10 })
      const lettuce = await productFactory.create({ name: 'Lettuce', stock: 5 })
      
      // Create recipe
      const salad = await recipeFactory.create({ name: 'Simple Salad' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: salad.id, productId: tomato.id, quantity: 2, unit: 'PIECE' },
          { recipeId: salad.id, productId: lettuce.id, quantity: 1, unit: 'PIECE' }
        ]
      })

      const shortages = await bomService.checkStockAvailability(salad.id, 2)

      expect(shortages).toHaveLength(0)
    })

    it('should report shortages for insufficient stock', async () => {
      // Create ingredients with insufficient stock
      const tomato = await productFactory.create({ name: 'Tomato', stock: 3 })
      const lettuce = await productFactory.create({ name: 'Lettuce', stock: 1 })
      
      // Create recipe
      const salad = await recipeFactory.create({ name: 'Simple Salad' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: salad.id, productId: tomato.id, quantity: 2, unit: 'PIECE' },
          { recipeId: salad.id, productId: lettuce.id, quantity: 1, unit: 'PIECE' }
        ]
      })

      const shortages = await bomService.checkStockAvailability(salad.id, 2)

      expect(shortages).toHaveLength(2)
      expect(shortages).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            productId: tomato.id,
            productName: 'Tomato',
            requiredQuantity: 4, // 2 recipes * 2 tomatoes
            availableQuantity: 3,
            shortage: 1
          }),
          expect.objectContaining({
            productId: lettuce.id,
            productName: 'Lettuce',
            requiredQuantity: 2, // 2 recipes * 1 lettuce
            availableQuantity: 1,
            shortage: 1
          })
        ])
      )
    })
  })
})
