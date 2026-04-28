import { PrismaClient } from '@prisma/client'
import { ProductFactory } from './product.factory'

export class RecipeFactory {
  constructor(private prisma: PrismaClient, private productFactory: ProductFactory) {}

  async create(overrides: Partial<any> = {}) {
    // Recipe requires a product (productId is unique and required)
    const product = overrides.productId
      ? undefined
      : await this.productFactory.create({ name: overrides.name || 'Test Recipe Product' })

    const defaultRecipe = {
      name: 'Test Recipe',
      description: 'Test Recipe Description',
      instructions: 'Mix ingredients and cook',
      preparationTime: 15,
      servings: 4,
      isActive: true,
      productId: overrides.productId || product.id
    }

    const { ...restOverrides } = overrides
    const recipeData = { ...defaultRecipe, ...restOverrides, productId: defaultRecipe.productId }

    return await this.prisma.recipe.create({
      data: recipeData
    })
  }

  async createWithIngredients(ingredients: Array<{ingredientId: string, quantity: number, unit?: string}>, overrides: Partial<any> = {}) {
    const recipe = await this.create(overrides)

    // Create recipe ingredients
    for (const ingredient of ingredients) {
      await this.prisma.recipeIngredient.create({
        data: {
          recipeId: recipe.id,
          ingredientId: ingredient.ingredientId,
          quantity: ingredient.quantity,
          unit: ingredient.unit || 'unidad'
        }
      })
    }

    return recipe
  }

  async createSimple(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      name: 'Simple Recipe',
      preparationTime: 10
    })
  }

  async createComplex(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      name: 'Complex Recipe',
      preparationTime: 30,
      servings: 6
    })
  }
}
