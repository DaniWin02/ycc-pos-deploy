import request from 'supertest'
import { app } from '../../src/index'
import { prisma, userFactory, productFactory } from '../factories'

describe('Sales Integration Tests', () => {
  let authToken: string
  let testUser: any
  let testProducts: any[]

  beforeEach(async () => {
    // Clean up database
    await prisma.sale.deleteMany()
    await prisma.saleItem.deleteMany()
    await prisma.product.deleteMany()
    await prisma.user.deleteMany()

    // Create test user and get auth token
    testUser = await userFactory.createCashier()
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      })
    
    authToken = loginResponse.body.token

    // Create test products
    testProducts = await productFactory.createMany(3, {
      stock: 100,
      price: 10.99,
      cost: 5.50
    })
  })

  describe('POST /api/sales', () => {
    it('should create sale successfully', async () => {
      const saleData = {
        terminalId: 'TERM-001',
        items: [
          {
            productId: testProducts[0].id,
            quantity: 2,
            unitPrice: 10.99
          },
          {
            productId: testProducts[1].id,
            quantity: 1,
            unitPrice: 12.99
          }
        ],
        paymentMethod: 'CASH'
      }

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData)
        .expect(201)

      expect(response.body).toMatchObject({
        userId: testUser.id,
        terminalId: 'TERM-001',
        status: 'COMPLETED',
        subtotal: 34.97, // (2 * 10.99) + (1 * 12.99)
        discountAmount: 0,
        taxAmount: 5.60, // 34.97 * 0.16
        totalAmount: 40.57, // 34.97 + 5.60
        paymentMethod: 'CASH'
      })

      expect(response.body.items).toHaveLength(2)
      expect(response.body.items[0]).toMatchObject({
        productId: testProducts[0].id,
        quantity: 2,
        unitPrice: 10.99,
        totalPrice: 21.98
      })

      // Verify stock was deducted
      const updatedProduct1 = await prisma.product.findUnique({
        where: { id: testProducts[0].id }
      })
      const updatedProduct2 = await prisma.product.findUnique({
        where: { id: testProducts[1].id }
      })

      expect(updatedProduct1?.stock).toBe(98) // 100 - 2
      expect(updatedProduct2?.stock).toBe(99) // 100 - 1
    })

    it('should handle sale with modifiers', async () => {
      // Create modifier product
      const modifierProduct = await productFactory.create({
        name: 'Extra Cheese',
        price: 2.00,
        stock: 50
      })

      const saleData = {
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 1,
          unitPrice: 10.99,
          modifiers: [{
            productId: modifierProduct.id,
            quantity: 1,
            unitPrice: 2.00
          }]
        }],
        paymentMethod: 'CARD'
      }

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData)
        .expect(201)

      expect(response.body.subtotal).toBe(12.99) // 10.99 + 2.00
      expect(response.body.items[0].modifiers).toHaveLength(1)
      expect(response.body.items[0].modifiers[0]).toMatchObject({
        productId: modifierProduct.id,
        quantity: 1,
        unitPrice: 2.00,
        totalPrice: 2.00
      })
    })

    it('should apply discount correctly', async () => {
      const saleData = {
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 2,
          unitPrice: 10.99
        }],
        paymentMethod: 'CASH',
        discount: 5.00
      }

      const response = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData)
        .expect(201)

      expect(response.body.subtotal).toBe(21.98)
      expect(response.body.discountAmount).toBe(5.00)
      expect(response.body.taxAmount).toBe(2.72) // (21.98 - 5.00) * 0.16
      expect(response.body.totalAmount).toBe(19.70) // 16.98 + 2.72
    })

    it('should return 400 for insufficient stock', async () => {
      // Create product with low stock
      const lowStockProduct = await productFactory.create({ stock: 1 })

      const saleData = {
        terminalId: 'TERM-001',
        items: [{
          productId: lowStockProduct.id,
          quantity: 5, // Requesting more than available
          unitPrice: 10.99
        }],
        paymentMethod: 'CASH'
      }

      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send(saleData)
        .expect(400)
    })

    it('should return 401 without authentication', async () => {
      const saleData = {
        terminalId: 'TERM-001',
        items: [{
          productId: testProducts[0].id,
          quantity: 1,
          unitPrice: 10.99
        }],
        paymentMethod: 'CASH'
      }

      await request(app)
        .post('/api/sales')
        .send(saleData)
        .expect(401)
    })
  })

  describe('GET /api/sales', () => {
    it('should return sales for authenticated user', async () => {
      // Create some sales
      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          terminalId: 'TERM-001',
          items: [{
            productId: testProducts[0].id,
            quantity: 1,
            unitPrice: 10.99
          }],
          paymentMethod: 'CASH'
        })

      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          terminalId: 'TERM-002',
          items: [{
            productId: testProducts[1].id,
            quantity: 2,
            unitPrice: 12.99
          }],
          paymentMethod: 'CARD'
        })

      const response = await request(app)
        .get('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toMatchObject({
        userId: testUser.id,
        status: 'COMPLETED'
      })
    })

    it('should filter by date range', async () => {
      // Create a sale
      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          terminalId: 'TERM-001',
          items: [{
            productId: testProducts[0].id,
            quantity: 1,
            unitPrice: 10.99
          }],
          paymentMethod: 'CASH'
        })

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const response = await request(app)
        .get(`/api/sales?startDate=${yesterday.toISOString()}&endDate=${today.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(1)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/sales')
        .expect(401)
    })
  })

  describe('POST /api/sales/:id/cancel', () => {
    it('should cancel sale and restore inventory', async () => {
      // Create a sale first
      const saleResponse = await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          terminalId: 'TERM-001',
          items: [{
            productId: testProducts[0].id,
            quantity: 3,
            unitPrice: 10.99
          }],
          paymentMethod: 'CASH'
        })

      const saleId = saleResponse.body.id

      // Verify stock was deducted
      let updatedProduct = await prisma.product.findUnique({
        where: { id: testProducts[0].id }
      })
      expect(updatedProduct?.stock).toBe(97) // 100 - 3

      // Cancel the sale
      const response = await request(app)
        .post(`/api/sales/${saleId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Customer request' })
        .expect(200)

      expect(response.body.status).toBe('CANCELLED')
      expect(response.body.cancelReason).toBe('Customer request')

      // Verify inventory was restored
      updatedProduct = await prisma.product.findUnique({
        where: { id: testProducts[0].id }
      })
      expect(updatedProduct?.stock).toBe(100) // Back to original stock
    })

    it('should return 404 for non-existent sale', async () => {
      await request(app)
        .post('/api/sales/non-existent-id/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test' })
        .expect(404)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/sales/some-id/cancel')
        .send({ reason: 'Test' })
        .expect(401)
    })
  })

  describe('GET /api/sales/stats', () => {
    it('should return sales statistics', async () => {
      // Create multiple sales
      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          terminalId: 'TERM-001',
          items: [{
            productId: testProducts[0].id,
            quantity: 1,
            unitPrice: 10.99
          }],
          paymentMethod: 'CASH'
        })

      await request(app)
        .post('/api/sales')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          terminalId: 'TERM-002',
          items: [{
            productId: testProducts[1].id,
            quantity: 2,
            unitPrice: 12.99
          }],
          paymentMethod: 'CARD'
        })

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const response = await request(app)
        .get(`/api/sales/stats?startDate=${yesterday.toISOString()}&endDate=${today.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        totalSales: 2,
        totalRevenue: expect.any(Number),
        averageOrderValue: expect.any(Number),
        paymentMethodStats: {
          CASH: { count: 1, total: expect.any(Number) },
          CARD: { count: 1, total: expect.any(Number) }
        }
      })
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/sales/stats')
        .expect(401)
    })
  })
})
