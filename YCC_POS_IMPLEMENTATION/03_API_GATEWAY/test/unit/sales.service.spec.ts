import { SalesService } from '../../src/services/sales.service'
import { prisma } from '../setup'
import { userFactory, productFactory } from '../factories'

describe('SalesService', () => {
  let salesService: SalesService
  let testUser: any
  let testProducts: any[]

  beforeEach(async () => {
    salesService = new SalesService(prisma)
    testUser = await userFactory.createCashier()
    testProducts = await productFactory.createMany(3, {
      stock: 10,
      price: 10.00,
      cost: 5.00
    })
  })

  describe('createSale', () => {
    it('should create sale with single item and deduct stock', async () => {
      const saleData = {
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 2,
          unitPrice: 10.00
        }],
        paymentMethod: 'CASH' as const
      }

      const sale = await salesService.createSale(saleData)

      expect(sale).toMatchObject({
        userId: testUser.id,
        terminalId: 'TERM-001',
        status: 'COMPLETED',
        subtotal: 20.00,
        discountAmount: 0,
        taxAmount: 3.20,
        totalAmount: 23.20,
        paymentMethod: 'CASH'
      })

      expect(sale.items).toHaveLength(1)
      expect(sale.items[0]).toMatchObject({
        productId: testProducts[0].id,
        quantity: 2,
        unitPrice: 10.00,
        totalPrice: 20.00
      })

      // Verify stock deduction
      const updatedProduct = await prisma.product.findUnique({
        where: { id: testProducts[0].id }
      })
      expect(updatedProduct?.stock).toBe(8) // 10 - 2
    })

    it('should create sale with multiple items', async () => {
      const saleData = {
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [
          {
            productId: testProducts[0].id,
            quantity: 2,
            unitPrice: 10.00
          },
          {
            productId: testProducts[1].id,
            quantity: 1,
            unitPrice: 15.00
          }
        ],
        paymentMethod: 'CARD' as const
      }

      const sale = await salesService.createSale(saleData)

      expect(sale.subtotal).toBe(35.00) // (2 * 10) + (1 * 15)
      expect(sale.totalAmount).toBe(40.60) // 35 + (35 * 0.16)
      expect(sale.items).toHaveLength(2)

      // Verify stock deduction for both items
      const updatedProduct1 = await prisma.product.findUnique({
        where: { id: testProducts[0].id }
      })
      const updatedProduct2 = await prisma.product.findUnique({
        where: { id: testProducts[1].id }
      })
      expect(updatedProduct1?.stock).toBe(8) // 10 - 2
      expect(updatedProduct2?.stock).toBe(9) // 10 - 1
    })

    it('should create sale with modifiers', async () => {
      // Create modifier product
      const modifierProduct = await productFactory.create({
        name: 'Extra Cheese',
        price: 2.00,
        stock: 5
      })

      const saleData = {
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 1,
          unitPrice: 10.00,
          modifiers: [{
            productId: modifierProduct.id,
            quantity: 1,
            unitPrice: 2.00
          }]
        }],
        paymentMethod: 'CASH' as const
      }

      const sale = await salesService.createSale(saleData)

      expect(sale.subtotal).toBe(12.00) // 10 + 2
      expect(sale.totalAmount).toBe(13.92) // 12 + (12 * 0.16)
      expect(sale.items).toHaveLength(1)
      expect(sale.items[0].modifiers).toHaveLength(1)

      // Verify stock deduction for main item and modifier
      const updatedMainProduct = await prisma.product.findUnique({
        where: { id: testProducts[0].id }
      })
      const updatedModifierProduct = await prisma.product.findUnique({
        where: { id: modifierProduct.id }
      })
      expect(updatedMainProduct?.stock).toBe(9) // 10 - 1
      expect(updatedModifierProduct?.stock).toBe(4) // 5 - 1
    })

    it('should apply discount correctly', async () => {
      const saleData = {
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 2,
          unitPrice: 10.00
        }],
        paymentMethod: 'CASH' as const,
        discount: 5.00
      }

      const sale = await salesService.createSale(saleData)

      expect(sale.subtotal).toBe(20.00)
      expect(sale.discountAmount).toBe(5.00)
      expect(sale.taxAmount).toBe(2.40) // (20 - 5) * 0.16
      expect(sale.totalAmount).toBe(17.40) // 15 + 2.40
    })

    it('should throw error for insufficient stock', async () => {
      // Create product with low stock
      const lowStockProduct = await productFactory.create({ stock: 1 })

      const saleData = {
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: lowStockProduct.id,
          quantity: 5, // Requesting more than available
          unitPrice: 10.00
        }],
        paymentMethod: 'CASH' as const
      }

      await expect(salesService.createSale(saleData))
        .rejects.toThrow('Insufficient stock')
    })

    it('should throw error for non-existent product', async () => {
      const saleData = {
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: 'non-existent-id',
          quantity: 1,
          unitPrice: 10.00
        }],
        paymentMethod: 'CASH' as const
      }

      await expect(salesService.createSale(saleData))
        .rejects.toThrow('Product non-existent-id not found')
    })
  })

  describe('cancelSale', () => {
    it('should cancel sale and return inventory', async () => {
      // Create a sale first
      const saleData = {
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 3,
          unitPrice: 10.00
        }],
        paymentMethod: 'CASH' as const
      }

      const sale = await salesService.createSale(saleData)

      // Verify stock was deducted
      let updatedProduct = await prisma.product.findUnique({
        where: { id: testProducts[0].id }
      })
      expect(updatedProduct?.stock).toBe(7) // 10 - 3

      // Cancel the sale
      const cancelledSale = await salesService.cancelSale(sale.id, 'Customer request')

      expect(cancelledSale.status).toBe('CANCELLED')
      expect(cancelledSale.cancelReason).toBe('Customer request')
      expect(cancelledSale.cancelledAt).toBeInstanceOf(Date)

      // Verify inventory was returned
      updatedProduct = await prisma.product.findUnique({
        where: { id: testProducts[0].id }
      })
      expect(updatedProduct?.stock).toBe(10) // Back to original stock
    })

    it('should throw error when cancelling already cancelled sale', async () => {
      // Create and cancel a sale
      const saleData = {
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 1,
          unitPrice: 10.00
        }],
        paymentMethod: 'CASH' as const
      }

      const sale = await salesService.createSale(saleData)
      await salesService.cancelSale(sale.id, 'Test cancellation')

      // Try to cancel again
      await expect(salesService.cancelSale(sale.id, 'Second attempt'))
        .rejects.toThrow('Sale is already cancelled')
    })

    it('should throw error for non-existent sale', async () => {
      await expect(salesService.cancelSale('non-existent-id', 'Test'))
        .rejects.toThrow('Sale not found')
    })
  })

  describe('getSalesByPeriod', () => {
    it('should return sales within date range', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      // Create sales
      await salesService.createSale({
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 1,
          unitPrice: 10.00
        }],
        paymentMethod: 'CASH'
      })

      await salesService.createSale({
        userId: testUser.id,
        terminalId: 'TERM-002',
        items: [{
          productId: testProducts[1].id,
          quantity: 1,
          unitPrice: 15.00
        }],
        paymentMethod: 'CARD'
      })

      const sales = await salesService.getSalesByPeriod(startDate, endDate)

      expect(sales).toHaveLength(2)
      expect(sales[0]).toMatchObject({
        userId: testUser.id,
        status: 'COMPLETED'
      })
    })

    it('should filter by user ID', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      // Create sales with different users
      const otherUser = await userFactory.create({ email: 'other@test.com' })

      await salesService.createSale({
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 1,
          unitPrice: 10.00
        }],
        paymentMethod: 'CASH'
      })

      await salesService.createSale({
        userId: otherUser.id,
        terminalId: 'TERM-002',
        items: [{
          productId: testProducts[1].id,
          quantity: 1,
          unitPrice: 15.00
        }],
        paymentMethod: 'CARD'
      })

      const sales = await salesService.getSalesByPeriod(startDate, endDate, testUser.id)

      expect(sales).toHaveLength(1)
      expect(sales[0].userId).toBe(testUser.id)
    })
  })

  describe('getSalesStats', () => {
    it('should calculate sales statistics correctly', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      // Create multiple sales
      await salesService.createSale({
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 2,
          unitPrice: 10.00
        }],
        paymentMethod: 'CASH'
      })

      await salesService.createSale({
        userId: testUser.id,
        terminalId: 'TERM-002',
        items: [{
          productId: testProducts[1].id,
          quantity: 1,
          unitPrice: 15.00
        }],
        paymentMethod: 'CARD'
      })

      const stats = await salesService.getSalesStats(startDate, endDate)

      expect(stats.totalSales).toBe(2)
      expect(stats.totalRevenue).toBe(43.40) // 23.20 + 20.20
      expect(stats.totalSubtotal).toBe(35.00) // 20 + 15
      expect(stats.totalTax).toBe(5.60) // 3.20 + 2.40
      expect(stats.averageOrderValue).toBe(21.70) // 43.40 / 2
      expect(stats.paymentMethodStats).toEqual({
        CASH: { count: 1, total: 23.20 },
        CARD: { count: 1, total: 20.20 }
      })
    })

    it('should return zero stats for no sales', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-01-31')

      const stats = await salesService.getSalesStats(startDate, endDate)

      expect(stats.totalSales).toBe(0)
      expect(stats.totalRevenue).toBe(0)
      expect(stats.averageOrderValue).toBe(0)
      expect(stats.paymentMethodStats).toEqual({})
    })
  })

  describe('getTopProducts', () => {
    it('should return top selling products', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      // Create sales with different quantities
      await salesService.createSale({
        userId: testUser.id,
        terminalId: 'TERM-001',
        items: [
          {
            productId: testProducts[0].id,
            quantity: 5,
            unitPrice: 10.00
          },
          {
            productId: testProducts[1].id,
            quantity: 2,
            unitPrice: 15.00
          }
        ],
        paymentMethod: 'CASH'
      })

      await salesService.createSale({
        userId: testUser.id,
        terminalId: 'TERM-002',
        items: [{
          productId: testProducts[0].id,
          quantity: 3,
          unitPrice: 10.00
        }],
        paymentMethod: 'CARD'
      })

      const topProducts = await salesService.getTopProducts(startDate, endDate, 2)

      expect(topProducts).toHaveLength(2)
      expect(topProducts[0]).toMatchObject({
        productId: testProducts[0].id,
        totalSold: 8, // 5 + 3
        totalRevenue: 80.00 // 8 * 10
      })
      expect(topProducts[1]).toMatchObject({
        productId: testProducts[1].id,
        totalSold: 2,
        totalRevenue: 30.00 // 2 * 15
      })
    })

    it('should limit results as specified', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      // Create sales for all products
      for (const product of testProducts) {
        await salesService.createSale({
          userId: testUser.id,
          terminalId: 'TERM-001',
          items: [{
            productId: product.id,
            quantity: 1,
            unitPrice: 10.00
          }],
          paymentMethod: 'CASH'
        })
      }

      const topProducts = await salesService.getTopProducts(startDate, endDate, 2)

      expect(topProducts).toHaveLength(2)
    })
  })
})
