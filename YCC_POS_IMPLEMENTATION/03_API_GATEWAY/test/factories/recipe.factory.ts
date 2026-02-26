import { PrismaClient } from '@prisma/client'

export class RecipeFactory {
  constructor(private prisma: PrismaClient) {}

  async create(overrides: Partial<any> = {}) {
    const defaultRecipe = {
      name: 'Test Recipe',
      description: 'Test Recipe Description',
      instructions: 'Mix ingredients and cook',
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const recipeData = { ...defaultRecipe, ...overrides }

    return await this.prisma.recipe.create({
      data: recipeData
    })
  }

  async createWithIngredients(ingredients: Array<{productId: string, quantity: number}>, overrides: Partial<any> = {}) {
    const recipe = await this.create(overrides)

    // Create recipe ingredients
    for (const ingredient of ingredients) {
      await this.prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          productId: ingredient.productId,
          quantity: ingredient.quantity,
          unit: 'PIECE'
        }
      })
    }

    return recipe
  }

  async createSimple(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      name: 'Simple Recipe',
      prepTime: 10,
      cookTime: 20
    })
  }

  async createComplex(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      name: 'Complex Recipe',
      prepTime: 30,
      cookTime: 60,
      servings: 6
    })
  }
}
