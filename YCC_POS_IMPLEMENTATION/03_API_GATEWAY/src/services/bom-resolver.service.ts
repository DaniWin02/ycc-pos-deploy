import { PrismaClient } from '@prisma/client'

export class BomResolverService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Resuelve Bill of Materials (BOM) recursivo para una receta
   * @param recipeId ID de la receta
   * @param depth Profundidad máxima de recursión (default: 5)
   * @returns Lista de ingredientes con cantidades resueltas
   */
  async resolveBom(recipeId: string, depth: number = 5): Promise<Array<{
    productId: string
    productName: string
    quantity: number
    unit: string
    isRecipe: boolean
    depth: number
  }>> {
    if (depth <= 0) {
      throw new Error('Maximum recursion depth reached')
    }

    // Obtener ingredientes directos de la receta
    const ingredients = await this.prisma.recipeIngredient.findMany({
      where: { recipeId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            category: true
          }
        }
      }
    })

    const resolved: Array<any> = []

    for (const ingredient of ingredients) {
      // Check if the ingredient is a recipe
      const recipe = await this.prisma.recipe.findFirst({
        where: { name: ingredient.product.name }
      })

      if (recipe) {
        // Recursive case: ingredient is a recipe
        const subIngredients = await this.resolveBom(recipe.id, depth - 1)
        
        // Scale quantities based on the ingredient quantity
        const scaledSubIngredients = subIngredients.map(sub => ({
          ...sub,
          quantity: sub.quantity * ingredient.quantity,
          depth: depth
        }))

        resolved.push(...scaledSubIngredients)
      } else {
        // Base case: ingredient is a raw product
        resolved.push({
          productId: ingredient.productId,
          productName: ingredient.product.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          isRecipe: false,
          depth: depth
        })
      }
    }

    return resolved
  }

  /**
   * Calcula el costo total de una receta basado en su BOM
   * @param recipeId ID de la receta
   * @returns Costo total de la receta
   */
  async calculateRecipeCost(recipeId: string): Promise<number> {
    const bom = await this.resolveBom(recipeId)
    
    let totalCost = 0
    
    for (const ingredient of bom) {
      if (!ingredient.isRecipe) {
        const product = await this.prisma.product.findUnique({
          where: { id: ingredient.productId },
          select: { cost: true }
        })
        
        if (product) {
          totalCost += product.cost * ingredient.quantity
        }
      }
    }
    
    return totalCost
  }

  /**
   * Verifica disponibilidad de stock para una receta
   * @param recipeId ID de la receta
   * @param quantity Cantidad de recetas a preparar
   * @returns Lista de ingredientes con stock insuficiente
   */
  async checkStockAvailability(recipeId: string, quantity: number = 1): Promise<Array<{
    productId: string
    productName: string
    requiredQuantity: number
    availableQuantity: number
    shortage: number
  }>> {
    const bom = await this.resolveBom(recipeId)
    const shortages: Array<any> = []

    for (const ingredient of bom) {
      if (!ingredient.isRecipe) {
        const product = await this.prisma.product.findUnique({
          where: { id: ingredient.productId },
          select: { 
            name: true,
            stock: true 
          }
        })

        if (product) {
          const requiredQuantity = ingredient.quantity * quantity
          const shortage = Math.max(0, requiredQuantity - product.stock)

          if (shortage > 0) {
            shortages.push({
              productId: ingredient.productId,
              productName: product.name,
              requiredQuantity,
              availableQuantity: product.stock,
              shortage
            })
          }
        }
      }
    }

    return shortages
  }
}
