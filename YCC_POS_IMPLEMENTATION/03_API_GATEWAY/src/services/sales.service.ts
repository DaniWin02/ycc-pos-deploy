import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class SalesService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Crea una nueva venta y deduce el inventario
   * @param saleData Datos de la venta
   * @returns Venta creada con detalles
   */
  async createSale(saleData: {
    customerId?: string
    userId: string
    terminalId: string
    items: Array<{
      productId: string
      quantity: number
      unitPrice: number
      modifiers?: Array<{
        productId: string
        quantity: number
        unitPrice: number
      }>
    }>
    paymentMethod: 'CASH' | 'CARD' | 'TRANSFER'
    discount?: number
    tax?: number
  }) {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Calcular totales
      let subtotal = 0
      const saleItems: any[] = []

      for (const item of saleData.items) {
        const itemTotal = item.unitPrice * item.quantity
        subtotal += itemTotal

        // Verificar stock disponible
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { stock: true, name: true }
        })

        if (!product) {
          throw new Error(`Product ${item.productId} not found`)
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`)
        }

        // Deduct stock
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        })

        // Create sale item
        const saleItem = await tx.saleItem.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: itemTotal
          }
        })

        saleItems.push(saleItem)

        // Process modifiers if any
        if (item.modifiers) {
          for (const modifier of item.modifiers) {
            const modifierProduct = await tx.product.findUnique({
              where: { id: modifier.productId },
              select: { stock: true, name: true }
            })

            if (!modifierProduct) {
              throw new Error(`Modifier product ${modifier.productId} not found`)
            }

            if (modifierProduct.stock < modifier.quantity) {
              throw new Error(`Insufficient stock for modifier ${modifierProduct.name}`)
            }

            // Deduct modifier stock
            await tx.product.update({
              where: { id: modifier.productId },
              data: { stock: { decrement: modifier.quantity } }
            })

            // Create modifier item
            await tx.saleItemModifier.create({
              data: {
                saleItemId: saleItem.id,
                productId: modifier.productId,
                quantity: modifier.quantity,
                unitPrice: modifier.unitPrice,
                totalPrice: modifier.unitPrice * modifier.quantity
              }
            })

            subtotal += modifier.unitPrice * modifier.quantity
          }
        }
      }

      // 2. Aplicar descuento
      const discountAmount = saleData.discount || 0
      const discountedSubtotal = subtotal - discountAmount

      // 3. Calcular tax (16% IVA)
      const taxRate = saleData.tax || 0.16
      const taxAmount = discountedSubtotal * taxRate

      // 4. Calcular total
      const totalAmount = discountedSubtotal + taxAmount

      // 5. Crear venta
      const sale = await tx.sale.create({
        data: {
          customerId: saleData.customerId,
          userId: saleData.userId,
          terminalId: saleData.terminalId,
          status: 'COMPLETED',
          subtotal,
          discountAmount,
          taxAmount,
          totalAmount,
          paymentMethod: saleData.paymentMethod,
          items: {
            connect: saleItems.map(item => ({ id: item.id }))
          }
        },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, sku: true }
              },
              modifiers: {
                include: {
                  product: {
                    select: { name: true, sku: true }
                  }
                }
              }
            }
          },
          customer: {
            select: { name: true, email: true }
          },
          user: {
            select: { firstName: true, lastName: true }
          }
        }
      })

      return sale
    })
  }

  /**
   * Cancela una venta y devuelve el inventario
   * @param saleId ID de la venta
   * @param reason Motivo de cancelación
   */
  async cancelSale(saleId: string, reason: string) {
    return await this.prisma.$transaction(async (tx) => {
      // Get sale with items
      const sale = await tx.sale.findUnique({
        where: { id: saleId },
        include: {
          items: {
            include: {
              modifiers: true
            }
          }
        }
      })

      if (!sale) {
        throw new Error('Sale not found')
      }

      if (sale.status === 'CANCELLED') {
        throw new Error('Sale is already cancelled')
      }

      // Return inventory for main items
      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })

        // Return inventory for modifiers
        for (const modifier of item.modifiers) {
          await tx.product.update({
            where: { id: modifier.productId },
            data: { stock: { increment: modifier.quantity } }
          })
        }
      }

      // Update sale status
      const cancelledSale = await tx.sale.update({
        where: { id: saleId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelReason: reason
        }
      })

      return cancelledSale
    })
  }

  /**
   * Obtiene ventas por período
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param userId ID del usuario (opcional)
   */
  async getSalesByPeriod(startDate: Date, endDate: Date, userId?: string) {
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (userId) {
      where.userId = userId
    }

    return await this.prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              select: { name: true, category: true }
            }
          }
        },
        customer: {
          select: { name: true, email: true }
        },
        user: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }

  /**
   * Obtiene estadísticas de ventas
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   */
  async getSalesStats(startDate: Date, endDate: Date) {
    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      select: {
        totalAmount: true,
        subtotal: true,
        taxAmount: true,
        discountAmount: true,
        paymentMethod: true,
        createdAt: true
      }
    })

    const totalSales = sales.length
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
    const totalSubtotal = sales.reduce((sum, sale) => sum + sale.subtotal, 0)
    const totalTax = sales.reduce((sum, sale) => sum + sale.taxAmount, 0)
    const totalDiscount = sales.reduce((sum, sale) => sum + sale.discountAmount, 0)
    const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0

    // Group by payment method
    const paymentMethodStats = sales.reduce((acc, sale) => {
      const method = sale.paymentMethod
      if (!acc[method]) {
        acc[method] = { count: 0, total: 0 }
      }
      acc[method].count++
      acc[method].total += sale.totalAmount
      return acc
    }, {} as Record<string, { count: number; total: number }>)

    return {
      totalSales,
      totalRevenue,
      totalSubtotal,
      totalTax,
      totalDiscount,
      averageOrderValue,
      paymentMethodStats
    }
  }

  /**
   * Obtiene productos más vendidos
   * @param startDate Fecha de inicio
   * @param endDate Fecha de fin
   * @param limit Límite de resultados
   */
  async getTopProducts(startDate: Date, endDate: Date, limit: number = 10) {
    const sales = await this.prisma.saleItem.findMany({
      where: {
        sale: {
          createdAt: {
            gte: startDate,
            lte: endDate
          },
          status: 'COMPLETED'
        }
      },
      include: {
        product: {
          select: { name: true, sku: true, category: true }
        }
      }
    })

    // Aggregate by product
    const productStats = sales.reduce((acc, item) => {
      const productId = item.productId
      if (!acc[productId]) {
        acc[productId] = {
          productId,
          productName: item.product.name,
          sku: item.product.sku,
          category: item.product.category,
          totalSold: 0,
          totalRevenue: 0
        }
      }
      acc[productId].totalSold += item.quantity
      acc[productId].totalRevenue += item.totalPrice
      return acc
    }, {} as Record<string, any>)

    // Sort by total revenue and limit
    return Object.values(productStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit)
  }
}
