import { PrismaClient } from '@prisma/client'

export class InventoryService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calcula el costo promedio ponderado del inventario
   * @returns Costo promedio ponderado de todos los productos
   */
  async calculateAverageCost(): Promise<number> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        stock: true,
        cost: true
      }
    })

    if (products.length === 0) {
      return 0
    }

    // Calcular costo total ponderado por stock
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.stock * product.cost)
    }, 0)

    // Calcular stock total
    const totalStock = products.reduce((sum, product) => {
      return sum + product.stock
    }, 0)

    // Retornar costo promedio ponderado
    return totalStock > 0 ? totalValue / totalStock : 0
  }

  /**
   * Obtiene productos con bajo stock
   * @param threshold Umbral de bajo stock (default: minStock)
   * @returns Productos que necesitan reabastecimiento
   */
  async getLowStockProducts(threshold?: number): Promise<Array<{
    productId: string
    productName: string
    sku: string
    currentStock: number
    minStock: number
    shortage: number
    reorderPoint: number
    category: string
  }>> {
    const products = await this.prisma.product.findMany({
      where: { 
        isActive: true,
        stock: { lt: threshold ? threshold : undefined }
      },
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        minStock: true,
        category: true
      },
      orderBy: {
        stock: 'asc'
      }
    })

    return products.map(product => ({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      currentStock: product.stock,
      minStock: product.minStock,
      shortage: Math.max(0, product.minStock - product.stock),
      reorderPoint: product.minStock,
      category: product.category
    }))
  }

  /**
   * Obtiene valor total del inventario
   * @returns Valor total del inventario desglosado
   */
  async getInventoryValue(): Promise<{
    totalValue: number
    totalProducts: number
    totalItems: number
    averageCost: number
    categoryBreakdown: Array<{
      category: string
      value: number
      percentage: number
      itemCount: number
    }>
  }> {
    const products = await this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        category: true,
        stock: true,
        cost: true
      }
    })

    // Calcular valor total y estadísticas
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.stock * product.cost)
    }, 0)

    const totalProducts = products.length
    const totalItems = products.reduce((sum, product) => sum + product.stock, 0)
    const averageCost = totalItems > 0 ? totalValue / totalItems : 0

    // Calcular desglose por categoría
    const categoryMap = new Map<string, { value: number; itemCount: number }>()

    products.forEach(product => {
      const current = categoryMap.get(product.category) || { value: 0, itemCount: 0 }
      current.value += product.stock * product.cost
      current.itemCount += product.stock
      categoryMap.set(product.category, current)
    })

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      value: data.value,
      percentage: totalValue > 0 ? (data.value / totalValue) * 100 : 0,
      itemCount: data.itemCount
    })).sort((a, b) => b.value - a.value)

    return {
      totalValue,
      totalProducts,
      totalItems,
      averageCost,
      categoryBreakdown
    }
  }

  /**
   * Actualiza el costo promedio de un producto basado en nueva compra
   * @param productId ID del producto
   * @param newQuantity Cantidad comprada
   * @param newCost Costo de la compra
   * @returns Nuevo costo promedio
   */
  async updateAverageCost(
    productId: string, 
    newQuantity: number, 
    newCost: number
  ): Promise<{
    productId: string
    oldCost: number
    newCost: number
    oldStock: number
    newStock: number
    variation: number
    variationPercentage: number
  }> {
    // Obtener producto actual
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { stock: true, cost: true }
    })

    if (!product) {
      throw new Error('Product not found')
    }

    const oldCost = product.cost
    const oldStock = product.stock

    // Calcular nuevo costo promedio ponderado
    const totalOldValue = oldStock * oldCost
    const totalNewValue = newQuantity * newCost
    const newTotalStock = oldStock + newQuantity
    const newAverageCost = newTotalStock > 0 ? (totalOldValue + totalNewValue) / newTotalStock : newCost

    // Actualizar producto
    await this.prisma.product.update({
      where: { id: productId },
      data: {
        cost: newAverageCost,
        stock: { increment: newQuantity }
      }
    })

    const variation = newAverageCost - oldCost
    const variationPercentage = oldCost > 0 ? (variation / oldCost) * 100 : 0

    return {
      productId,
      oldCost,
      newCost: newAverageCost,
      oldStock,
      newStock: newTotalStock,
      variation,
      variationPercentage
    }
  }

  /**
   * Obtiene movimiento de inventario en un período
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @returns Movimientos de inventario
   */
  async getInventoryMovements(
    startDate: Date, 
    endDate: Date
  ): Promise<Array<{
      id: string
      productId: string
      productName: string
      movementType: 'IN' | 'OUT'
      quantity: number
      referenceType: string
      referenceId: string
      createdAt: Date
      userName: string
    }>> {
    // Esta sería una tabla de movimientos de inventario
    // Por ahora, simulamos con datos de ventas y compras
    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true }
            }
          }
        },
        user: {
          select: { firstName: true, lastName: true }
        }
      }
    })

    const movements = sales.flatMap(sale => 
      sale.items.map(item => ({
        id: `sale-${sale.id}-${item.id}`,
        productId: item.productId,
        productName: item.product.name,
        movementType: 'OUT' as const,
        quantity: item.quantity,
        referenceType: 'SALE',
        referenceId: sale.id,
        createdAt: sale.createdAt,
        userName: `${sale.user.firstName} ${sale.user.lastName}`
      }))
    )

    return movements.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  /**
   * Obtiene productos con mayor rotación
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param limit Límite de resultados
   * @returns Productos más vendidos
   */
  async getFastMovingProducts(
    startDate: Date,
    endDate: Date,
    limit: number = 10
  ): Promise<Array<{
      productId: string
      productName: string
      sku: string
      totalSold: number
      totalRevenue: number
      averageDailySales: number
      daysInPeriod: number
      category: string
    }>> {
    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, sku: true, category: true }
            }
          }
        }
      }
    })

    // Agrupar por producto
    const productMap = new Map<string, {
      productId: string
      productName: string
      sku: string
      totalSold: number
      totalRevenue: number
      category: string
    }>()

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productMap.get(item.productId) || {
          productId: item.productId,
          productName: item.product.name,
          sku: item.product.sku,
          totalSold: 0,
          totalRevenue: 0,
          category: item.product.category
        }

        existing.totalSold += item.quantity
        existing.totalRevenue += item.totalPrice
        productMap.set(item.productId, existing)
      })
    })

    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

    const products = Array.from(productMap.values())
      .map(product => ({
        ...product,
        averageDailySales: daysInPeriod > 0 ? product.totalSold / daysInPeriod : 0,
        daysInPeriod
      }))
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit)

    return products
  }
}
