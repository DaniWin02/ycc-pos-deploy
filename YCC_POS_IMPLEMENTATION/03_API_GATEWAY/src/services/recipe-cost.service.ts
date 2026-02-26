import { PrismaClient } from '@prisma/client'

export class RecipeCostService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calcula el costo de una receta basado en sus ingredientes
   * @param recipeId ID de la receta
   * @returns Costo detallado de la receta
   */
  async calculateRecipeCost(recipeId: string): Promise<{
    recipeId: string
    recipeName: string
    totalCost: number
    costPerServing: number
    ingredientCosts: Array<{
      productId: string
      productName: string
      quantity: number
      unit: string
      unitCost: number
      totalCost: number
    }>
  }> {
    // Obtener receta con ingredientes
    const recipe = await this.prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            product: {
              select: { name: true, cost: true }
            }
          }
        }
      }
    })

    if (!recipe) {
      throw new Error('Recipe not found')
    }

    if (!recipe.ingredients || recipe.ingredients.length === 0) {
      return {
        recipeId,
        recipeName: recipe.name,
        totalCost: 0,
        costPerServing: 0,
        ingredientCosts: []
      }
    }

    // Calcular costo por ingrediente
    const ingredientCosts = recipe.ingredients.map(ingredient => ({
      productId: ingredient.productId,
      productName: ingredient.product.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      unitCost: ingredient.product.cost,
      totalCost: ingredient.quantity * ingredient.product.cost
    }))

    // Calcular costo total
    const totalCost = ingredientCosts.reduce((sum, ingredient) => sum + ingredient.totalCost, 0)

    // Calcular costo por porción
    const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0

    return {
      recipeId,
      recipeName: recipe.name,
      totalCost,
      costPerServing,
      ingredientCosts
    }
  }

  /**
   * Calcula el costo de múltiples recetas
   * @param recipeIds Array de IDs de recetas
   * @returns Array de costos de recetas
   */
  async calculateMultipleRecipesCost(recipeIds: string[]): Promise<Array<{
    recipeId: string
    recipeName: string
    totalCost: number
    costPerServing: number
  }>> {
    const costs = await Promise.all(
      recipeIds.map(recipeId => this.calculateRecipeCost(recipeId))
    )

    return costs.map(cost => ({
      recipeId: cost.recipeId,
      recipeName: cost.recipeName,
      totalCost: cost.totalCost,
      costPerServing: cost.costPerServing
    }))
  }

  /**
   * Obtiene recetas con mayor costo
   * @param limit Límite de resultados
   * @returns Recetas ordenadas por costo descendente
   */
  async getMostExpensiveRecipes(limit: number = 10): Promise<Array<{
    recipeId: string
    recipeName: string
    totalCost: number
    costPerServing: number
    ingredientCount: number
  }>> {
    const recipes = await this.prisma.recipe.findMany({
      where: { isActive: true },
      include: {
        ingredients: {
          include: {
            product: {
              select: { cost: true }
            }
          }
        }
      },
      take: limit * 2 // Obtener más para filtrar después
    })

    // Calcular costos y ordenar
    const recipesWithCost = recipes
      .map(recipe => {
        const ingredientCosts = recipe.ingredients.map(ingredient => 
          ingredient.quantity * ingredient.product.cost
        )
        const totalCost = ingredientCosts.reduce((sum, cost) => sum + cost, 0)
        const costPerServing = recipe.servings > 0 ? totalCost / recipe.servings : 0

        return {
          recipeId: recipe.id,
          recipeName: recipe.name,
          totalCost,
          costPerServing,
          ingredientCount: recipe.ingredients.length
        }
      })
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, limit)

    return recipesWithCost
  }

  /**
   * Analiza variación de costos de recetas
   * @param recipeId ID de la receta
   * @param newCosts Nuevos costos de ingredientes
   * @returns Comparación de costos
   */
  async analyzeCostVariation(
    recipeId: string, 
    newCosts: Array<{ productId: string; newCost: number }>
  ): Promise<{
    currentCost: number
    newCost: number
    variation: number
    variationPercentage: number
    affectedIngredients: Array<{
      productId: string
      productName: string
      oldCost: number
      newCost: number
      variation: number
      variationPercentage: number
    }>
  }> {
    // Obtener costo actual
    const currentCostData = await this.calculateRecipeCost(recipeId)
    const currentCost = currentCostData.totalCost

    // Calcular nuevo costo
    let newTotalCost = 0
    const affectedIngredients = []

    for (const ingredient of currentCostData.ingredientCosts) {
      const newCostData = newCosts.find(nc => nc.productId === ingredient.productId)
      
      if (newCostData) {
        const oldIngredientCost = ingredient.totalCost
        const newIngredientCost = ingredient.quantity * newCostData.newCost
        const variation = newIngredientCost - oldIngredientCost
        const variationPercentage = (variation / oldIngredientCost) * 100

        affectedIngredients.push({
          productId: ingredient.productId,
          productName: ingredient.productName,
          oldCost: oldIngredientCost,
          newCost: newIngredientCost,
          variation,
          variationPercentage
        })

        newTotalCost += newIngredientCost
      } else {
        newTotalCost += ingredient.totalCost
      }
    }

    const variation = newTotalCost - currentCost
    const variationPercentage = (variation / currentCost) * 100

    return {
      currentCost,
      newCost: newTotalCost,
      variation,
      variationPercentage,
      affectedIngredients
    }
  }

  /**
   * Obtiene resumen de costos de todas las recetas
   * @returns Estadísticas de costos
   */
  async getCostSummary(): Promise<{
    totalRecipes: number
    averageCost: number
    mostExpensive: { recipeId: string; recipeName: string; cost: number }
    leastExpensive: { recipeId: string; recipeName: string; cost: number }
    totalCostAll: number
  }> {
    const recipes = await this.prisma.recipe.findMany({
      where: { isActive: true },
      include: {
        ingredients: {
          include: {
            product: {
              select: { cost: true }
            }
          }
        }
      }
    })

    if (recipes.length === 0) {
      return {
        totalRecipes: 0,
        averageCost: 0,
        mostExpensive: { recipeId: '', recipeName: '', cost: 0 },
        leastExpensive: { recipeId: '', recipeName: '', cost: 0 },
        totalCostAll: 0
      }
    }

    // Calcular costos
    const recipesWithCost = recipes.map(recipe => {
      const ingredientCosts = recipe.ingredients.map(ingredient => 
        ingredient.quantity * ingredient.product.cost
      )
      return {
        recipeId: recipe.id,
        recipeName: recipe.name,
        cost: ingredientCosts.reduce((sum, cost) => sum + cost, 0)
      }
    })

    // Calcular estadísticas
    const costs = recipesWithCost.map(r => r.cost)
    const totalCostAll = costs.reduce((sum, cost) => sum + cost, 0)
    const averageCost = totalCostAll / recipes.length

    const sortedByCost = recipesWithCost.sort((a, b) => a.cost - b.cost)
    const leastExpensive = sortedByCost[0]
    const mostExpensive = sortedByCost[sortedByCost.length - 1]

    return {
      totalRecipes: recipes.length,
      averageCost,
      mostExpensive: {
        recipeId: mostExpensive.recipeId,
        recipeName: mostExpensive.recipeName,
        cost: mostExpensive.cost
      },
      leastExpensive: {
        recipeId: leastExpensive.recipeId,
        recipeName: leastExpensive.recipeName,
        cost: leastExpensive.cost
      },
      totalCostAll
    }
  }
}
