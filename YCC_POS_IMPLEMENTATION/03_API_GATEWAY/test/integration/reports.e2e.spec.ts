import request from 'supertest'
import { app } from '../../src/index'
import { prisma } from '../setup'
import { userFactory, productFactory } from '../factories'

describe('Reports Integration Tests', () => {
  let authToken: string
  let testUser: any

  beforeEach(async () => {
    // Clean up database
    await prisma.sale.deleteMany()
    await prisma.product.deleteMany()
    await prisma.user.deleteMany()

    // Create test user and get auth token
    testUser = await userFactory.createAdmin()
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'password123'
      })
    
    authToken = loginResponse.body.token

    // Create test products
    await productFactory.createMany(5, {
      stock: 100,
      price: 15.99,
      cost: 8.00,
      category: 'FOOD'
    })
  })

  describe('GET /api/reports/sales', () => {
    it('should return sales report', async () => {
      // Create some test sales
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/sales')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            terminalId: `TERM-00${i + 1}`,
            items: [{
              productId: (await prisma.product.findFirst()).id,
              quantity: 2,
              unitPrice: 15.99
            }],
            paymentMethod: i % 2 === 0 ? 'CASH' : 'CARD'
          })
      }

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const response = await request(app)
        .get(`/api/reports/sales?startDate=${yesterday.toISOString()}&endDate=${today.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        totalSales: 3,
        totalRevenue: expect.any(Number),
        averageOrderValue: expect.any(Number),
        paymentMethodStats: {
          CASH: { count: 2, total: expect.any(Number) },
          CARD: { count: 1, total: expect.any(Number) }
        }
      })

      expect(response.body.sales).toHaveLength(3)
      expect(response.body.sales[0]).toMatchObject({
        status: 'COMPLETED',
        paymentMethod: expect.any(String)
      })
    })

    it('should filter by date range', async () => {
      const today = new Date()
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)

      const response = await request(app)
        .get(`/api/reports/sales?startDate=${lastWeek.toISOString()}&endDate=${today.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        totalSales: expect.any(Number),
        totalRevenue: expect.any(Number)
      })
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/reports/sales')
        .expect(401)
    })
  })

  describe('GET /api/reports/inventory', () => {
    it('should return inventory report', async () => {
      // Update some products to have different values
      const products = await prisma.product.findMany()
      
      await prisma.product.update({
        where: { id: products[0].id },
        data: { stock: 50, cost: 5.00 }
      })

      await prisma.product.update({
        where: { id: products[1].id },
        data: { stock: 25, cost: 12.00 }
      })

      await prisma.product.update({
        where: { id: products[2].id },
        data: { stock: 75, cost: 3.50 }
      })

      const response = await request(app)
        .get('/api/reports/inventory')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        totalValue: expect.any(Number),
        totalProducts: 5,
        totalItems: expect.any(Number),
        averageCost: expect.any(Number)
      })

      expect(response.body.categoryBreakdown).toHaveLength(1)
      expect(response.body.categoryBreakdown[0]).toMatchObject({
        category: 'FOOD',
        value: expect.any(Number),
        percentage: expect.any(Number),
        itemCount: expect.any(Number)
      })

      expect(response.body.lowStockProducts).toBeInstanceOf(Array)
      expect(response.body.fastMovingProducts).toBeInstanceOf(Array)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/reports/inventory')
        .expect(401)
    })
  })

  describe('GET /api/reports/products', () => {
    it('should return top products report', async () => {
      // Create sales to generate product statistics
      const products = await prisma.product.findMany()
      
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/sales')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            terminalId: `TERM-00${i + 1}`,
            items: [{
              productId: products[i % products.length].id,
              quantity: (i + 1) * 2,
              unitPrice: 15.99
            }],
            paymentMethod: 'CASH'
          })
      }

      const today = new Date()
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)

      const response = await request(app)
        .get(`/api/reports/products?startDate=${lastWeek.toISOString()}&endDate=${today.toISOString()}&limit=5`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body).toHaveLength(5)

      // Check structure of top products
      if (response.body.length > 0) {
        expect(response.body[0]).toMatchObject({
          productId: expect.any(String),
          productName: expect.any(String),
          totalSold: expect.any(Number),
          totalRevenue: expect.any(Number),
          averageDailySales: expect.any(Number),
          category: expect.any(String)
        })
      }
    })

    it('should limit results as specified', async () => {
      const today = new Date()
      const lastWeek = new Date(today)
      lastWeek.setDate(lastWeek.getDate() - 7)

      const response = await request(app)
        .get(`/api/reports/products?startDate=${lastWeek.toISOString()}&endDate=${today.toISOString()}&limit=3`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
      expect(response.body.length).toBeLessThanOrEqual(3)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/reports/products')
        .expect(401)
    })
  })

  describe('GET /api/reports/financial', () => {
    it('should return financial summary', async () => {
      // Create sales with different payment methods
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/sales')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            terminalId: `TERM-00${i + 1}`,
            items: [{
              productId: (await prisma.product.findFirst()).id,
              quantity: 1,
              unitPrice: 15.99
            }],
            paymentMethod: i % 3 === 0 ? 'CASH' : i % 3 === 1 ? 'CARD' : 'TRANSFER'
          })
      }

      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      const response = await request(app)
        .get(`/api/reports/financial?startDate=${yesterday.toISOString()}&endDate=${today.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        totalRevenue: expect.any(Number),
        totalTax: expect.any(Number),
        totalDiscount: expect.any(Number),
        netRevenue: expect.any(Number),
        paymentBreakdown: {
          CASH: { count: expect.any(Number), amount: expect.any(Number) },
          CARD: { count: expect.any(Number), amount: expect.any(Number) },
          TRANSFER: { count: expect.any(Number), amount: expect.any(Number) }
        }
      })
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/reports/financial')
        .expect(401)
    })
  })

  describe('GET /api/reports/dashboard', () => {
    it('should return dashboard summary', async () => {
      // Create some activity
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/sales')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            terminalId: `TERM-00${i + 1}`,
            items: [{
              productId: (await prisma.product.findFirst()).id,
              quantity: 1,
              unitPrice: 15.99
            }],
            paymentMethod: 'CASH'
          })
      }

      const response = await request(app)
        .get('/api/reports/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        todaySales: expect.any(Number),
        todayRevenue: expect.any(Number),
        totalProducts: 5,
        lowStockCount: expect.any(Number),
        recentSales: expect.any(Array),
        topProducts: expect.any(Array)
      })

      expect(response.body.todaySales).toBe(5)
      expect(response.body.todayRevenue).toBeGreaterThan(0)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/reports/dashboard')
        .expect(401)
    })
  })
})
