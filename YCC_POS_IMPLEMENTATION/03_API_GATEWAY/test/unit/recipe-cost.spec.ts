import { RecipeCostService } from '../../src/services/recipe-cost.service'
import { prisma } from '../setup'
import { productFactory, recipeFactory } from '../factories'

describe('RecipeCostService', () => {
  let recipeCostService: RecipeCostService
  let testProducts: any[]
  let testRecipe: any

  beforeEach(async () => {
    recipeCostService = new RecipeCostService(prisma)
    
    // Create test products with different costs
    testProducts = await productFactory.createMany(3, {
      stock: 100,
      price: 15.00,
      cost: 8.00
    })

    // Create recipe with ingredients
    testRecipe = await recipeFactory.create({ name: 'Test Recipe', servings: 4 })
    await prisma.recipeIngredient.createMany({
      data: [
        { recipeId: testRecipe.id, productId: testProducts[0].id, quantity: 2, unit: 'PIECE' },
        { recipeId: testRecipe.id, productId: testProducts[1].id, quantity: 1, unit: 'PIECE' }
      ]
    })
  })

  describe('calculateRecipeCost', () => {
    it('should calculate recipe cost correctly', async () => {
      const costData = await recipeCostService.calculateRecipeCost(testRecipe.id)

      expect(costData).toMatchObject({
        recipeId: testRecipe.id,
        recipeName: 'Test Recipe',
        totalCost: 24.00, // (2 * 8.00) + (1 * 8.00)
        costPerServing: 6.00 // 24.00 / 4 servings
      })

      expect(costData.ingredientCosts).toHaveLength(2)
      expect(costData.ingredientCosts[0]).toMatchObject({
        productId: testProducts[0].id,
        productName: testProducts[0].name,
        quantity: 2,
        unit: 'PIECE',
        unitCost: 8.00,
        totalCost: 16.00 // 2 * 8.00
      })
      expect(costData.ingredientCosts[1]).toMatchObject({
        productId: testProducts[1].id,
        productName: testProducts[1].name,
        quantity: 1,
        unit: 'PIECE',
        unitCost: 8.00,
        totalCost: 8.00 // 1 * 8.00
      })
    })

    it('should handle recipe with no ingredients', async () => {
      const emptyRecipe = await recipeFactory.create({ name: 'Empty Recipe', servings: 2 })

      const costData = await recipeCostService.calculateRecipeCost(emptyRecipe.id)

      expect(costData).toMatchObject({
        recipeId: emptyRecipe.id,
        recipeName: 'Empty Recipe',
        totalCost: 0,
        costPerServing: 0,
        ingredientCosts: []
      })
    })

    it('should throw error for non-existent recipe', async () => {
      await expect(recipeCostService.calculateRecipeCost('non-existent-id'))
        .rejects.toThrow('Recipe not found')
    })
  })

  describe('calculateMultipleRecipesCost', () => {
    it('should calculate costs for multiple recipes', async () => {
      // Create second recipe
      const secondRecipe = await recipeFactory.create({ name: 'Second Recipe', servings: 2 })
      await prisma.recipeIngredient.create({
        data: { recipeId: secondRecipe.id, productId: testProducts[2].id, quantity: 3, unit: 'PIECE' }
      })

      const costs = await recipeCostService.calculateMultipleRecipesCost([
        testRecipe.id,
        secondRecipe.id
      ])

      expect(costs).toHaveLength(2)
      expect(costs[0]).toMatchObject({
        recipeId: testRecipe.id,
        recipeName: 'Test Recipe',
        totalCost: 24.00,
        costPerServing: 6.00
      })
      expect(costs[1]).toMatchObject({
        recipeId: secondRecipe.id,
        recipeName: 'Second Recipe',
        totalCost: 24.00, // 3 * 8.00
        costPerServing: 12.00 // 24.00 / 2
      })
    })

    it('should handle empty recipe array', async () => {
      const costs = await recipeCostService.calculateMultipleRecipesCost([])

      expect(costs).toHaveLength(0)
    })
  })

  describe('getMostExpensiveRecipes', () => {
    it('should return recipes ordered by cost', async () => {
      // Create recipes with different costs
      const cheapRecipe = await recipeFactory.create({ name: 'Cheap Recipe' })
      await prisma.recipeIngredient.create({
        data: { recipeId: cheapRecipe.id, productId: testProducts[0].id, quantity: 1, unit: 'PIECE' }
      })

      const expensiveRecipe = await recipeFactory.create({ name: 'Expensive Recipe' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: expensiveRecipe.id, productId: testProducts[0].id, quantity: 5, unit: 'PIECE' },
          { recipeId: expensiveRecipe.id, productId: testProducts[1].id, quantity: 3, unit: 'PIECE' }
        ]
      })

      const expensiveRecipes = await recipeCostService.getMostExpensiveRecipes(3)

      expect(expensiveRecipes).toHaveLength(3)
      expect(expensiveRecipes[0].recipeName).toBe('Expensive Recipe')
      expect(expensiveRecipes[0].totalCost).toBe(64.00) // (5 * 8) + (3 * 8)
      expect(expensiveRecipes[1].recipeName).toBe('Test Recipe')
      expect(expensiveRecipes[1].totalCost).toBe(24.00)
      expect(expensiveRecipes[2].recipeName).toBe('Cheap Recipe')
      expect(expensiveRecipes[2].totalCost).toBe(8.00) // 1 * 8
    })

    it('should limit results as specified', async () => {
      // Create multiple recipes
      for (let i = 0; i < 5; i++) {
        const recipe = await recipeFactory.create({ name: `Recipe ${i}` })
        await prisma.recipeIngredient.create({
          data: { recipeId: recipe.id, productId: testProducts[0].id, quantity: i + 1, unit: 'PIECE' }
        })
      }

      const expensiveRecipes = await recipeCostService.getMostExpensiveRecipes(2)

      expect(expensiveRecipes).toHaveLength(2)
      expect(expensiveRecipes[0].totalCost).toBeGreaterThan(expensiveRecipes[1].totalCost)
    })
  })

  describe('analyzeCostVariation', () => {
    it('should analyze cost variation correctly', async () => {
      const newCosts = [
        { productId: testProducts[0].id, newCost: 10.00 }, // Increase from 8.00 to 10.00
        { productId: testProducts[1].id, newCost: 6.00 }  // Decrease from 8.00 to 6.00
      ]

      const analysis = await recipeCostService.analyzeCostVariation(testRecipe.id, newCosts)

      expect(analysis.currentCost).toBe(24.00) // (2 * 8) + (1 * 8)
      expect(analysis.newCost).toBe(26.00) // (2 * 10) + (1 * 6)
      expect(analysis.variation).toBe(2.00) // 26 - 24
      expect(analysis.variationPercentage).toBeCloseTo(8.33, 2) // (2 / 24) * 100

      expect(analysis.affectedIngredients).toHaveLength(2)
      expect(analysis.affectedIngredients[0]).toMatchObject({
        productId: testProducts[0].id,
        oldCost: 16.00, // 2 * 8
        newCost: 20.00, // 2 * 10
        variation: 4.00,
        variationPercentage: 25.00 // (4 / 16) * 100
      })
      expect(analysis.affectedIngredients[1]).toMatchObject({
        productId: testProducts[1].id,
        oldCost: 8.00, // 1 * 8
        newCost: 6.00, // 1 * 6
        variation: -2.00,
        variationPercentage: -25.00 // (-2 / 8) * 100
      })
    })

    it('should handle partial cost updates', async () => {
      const newCosts = [
        { productId: testProducts[0].id, newCost: 12.00 } // Only update first ingredient
      ]

      const analysis = await recipeCostService.analyzeCostVariation(testRecipe.id, newCosts)

      expect(analysis.currentCost).toBe(24.00) // (2 * 8) + (1 * 8)
      expect(analysis.newCost).toBe(32.00) // (2 * 12) + (1 * 8)
      expect(analysis.variation).toBe(8.00) // 32 - 24
      expect(analysis.affectedIngredients).toHaveLength(1)
    })

    it('should handle no cost variation', async () => {
      const newCosts = [
        { productId: testProducts[0].id, newCost: 8.00 }, // Same cost
        { productId: testProducts[1].id, newCost: 8.00 }  // Same cost
      ]

      const analysis = await recipeCostService.analyzeCostVariation(testRecipe.id, newCosts)

      expect(analysis.currentCost).toBe(24.00)
      expect(analysis.newCost).toBe(24.00)
      expect(analysis.variation).toBe(0)
      expect(analysis.variationPercentage).toBe(0)
    })
  })

  describe('getCostSummary', () => {
    it('should provide cost summary for all recipes', async () => {
      // Create additional recipes
      const cheapRecipe = await recipeFactory.create({ name: 'Cheap Recipe' })
      await prisma.recipeIngredient.create({
        data: { recipeId: cheapRecipe.id, productId: testProducts[0].id, quantity: 1, unit: 'PIECE' }
      })

      const expensiveRecipe = await recipeFactory.create({ name: 'Expensive Recipe' })
      await prisma.recipeIngredient.createMany({
        data: [
          { recipeId: expensiveRecipe.id, productId: testProducts[0].id, quantity: 5, unit: 'PIECE' },
          { recipeId: expensiveRecipe.id, productId: testProducts[1].id, quantity: 3, unit: 'PIECE' }
        ]
      })

      const summary = await recipeCostService.getCostSummary()

      expect(summary.totalRecipes).toBe(3)
      expect(summary.averageCost).toBeCloseTo(32.00, 2) // (24 + 8 + 64) / 3
      expect(summary.totalCostAll).toBe(96.00) // 24 + 8 + 64
      expect(summary.mostExpensive).toMatchObject({
        recipeName: 'Expensive Recipe',
        cost: 64.00
      })
      expect(summary.leastExpensive).toMatchObject({
        recipeName: 'Cheap Recipe',
        cost: 8.00
      })
    })

    it('should handle empty recipe database', async () => {
      // Clean up all recipes
      await prisma.recipe.deleteMany()

      const summary = await recipeCostService.getCostSummary()

      expect(summary).toMatchObject({
        totalRecipes: 0,
        averageCost: 0,
        mostExpensive: { recipeId: '', recipeName: '', cost: 0 },
        leastExpensive: { recipeId: '', recipeName: '', cost: 0 },
        totalCostAll: 0
      })
    })
  })
})
