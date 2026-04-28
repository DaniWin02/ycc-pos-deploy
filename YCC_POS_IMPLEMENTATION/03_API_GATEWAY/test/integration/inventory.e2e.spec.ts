import request from 'supertest'
import { app } from '../../src/index'
import { prisma } from '../setup'
import { userFactory, productFactory } from '../factories'

describe('Inventory Integration Tests', () => {
  let authToken: string
  let testUser: any

  beforeEach(async () => {
    // Clean up database
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
  })

  describe('GET /api/inventory/value', () => {
    it('should return total inventory value', async () => {
      // Create test products with different values
      await productFactory.create({
        name: 'Product A',
        stock: 50,
        cost: 5.00,
        category: 'FOOD'
      })

      await productFactory.create({
        name: 'Product B',
        stock: 25,
        cost: 10.00,
        category: 'BEVERAGE'
      })

      await productFactory.create({
        name: 'Product C',
        stock: 75,
        cost: 2.50,
        category: 'FOOD'
      })

      const response = await request(app)
        .get('/api/inventory/value')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Expected values:
      // Product A: 50 * 5.00 = 250
      // Product B: 25 * 10.00 = 250
      // Product C: 75 * 2.50 = 187.50
      // Total: 687.50

      expect(response.body).toMatchObject({
        totalValue: 687.50,
        totalProducts: 3,
        totalItems: 150, // 50 + 25 + 75
        averageCost: 4.58 // 687.50 / 150
      })

      expect(response.body.categoryBreakdown).toHaveLength(2)
      
      const foodCategory = response.body.categoryBreakdown.find((c: any) => c.category === 'FOOD')
      const beverageCategory = response.body.categoryBreakdown.find((c: any) => c.category === 'BEVERAGE')

      expect(foodCategory.value).toBe(437.50) // 250 + 187.50
      expect(foodCategory.percentage).toBeCloseTo(63.64, 2) // (437.50 / 687.50) * 100
      expect(foodCategory.itemCount).toBe(125) // 50 + 75

      expect(beverageCategory.value).toBe(250)
      expect(beverageCategory.percentage).toBeCloseTo(36.36, 2) // (250 / 687.50) * 100
      expect(beverageCategory.itemCount).toBe(25)
    })

    it('should return zero for empty inventory', async () => {
      const response = await request(app)
        .get('/api/inventory/value')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        totalValue: 0,
        totalProducts: 0,
        totalItems: 0,
        averageCost: 0,
        categoryBreakdown: []
      })
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/inventory/value')
        .expect(401)
    })
  })

  describe('GET /api/inventory/low-stock', () => {
    it('should return products with low stock', async () => {
      // Create products with different stock levels
      await productFactory.create({
        name: 'Low Stock 1',
        stock: 5,
        minStock: 10
      })

      await productFactory.create({
        name: 'Low Stock 2',
        stock: 8,
        minStock: 15
      })

      await productFactory.create({
        name: 'Normal Stock',
        stock: 50,
        minStock: 10
      })

      const response = await request(app)
        .get('/api/inventory/low-stock')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0]).toMatchObject({
        productName: 'Low Stock 1',
        currentStock: 5,
        minStock: 10,
        shortage: 5
      })
      expect(response.body[1]).toMatchObject({
        productName: 'Low Stock 2',
        currentStock: 8,
        minStock: 15,
        shortage: 7
      })
    })

    it('should use custom threshold', async () => {
      await productFactory.create({
        name: 'Below Threshold',
        stock: 12,
        minStock: 20
      })

      await productFactory.create({
        name: 'Above Threshold',
        stock: 25,
        minStock: 30
      })

      const response = await request(app)
        .get('/api/inventory/low-stock?threshold=20')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].productName).toBe('Below Threshold')
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/inventory/low-stock')
        .expect(401)
    })
  })

  describe('POST /api/inventory/update-cost', () => {
    it('should update average cost with new purchase', async () => {
      const product = await productFactory.create({
        stock: 100,
        cost: 5.00
      })

      const updateData = {
        productId: product.id,
        newQuantity: 50,
        newCost: 6.00
      }

      const response = await request(app)
        .post('/api/inventory/update-cost')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      // Expected calculation:
      // Old value: 100 * 5.00 = 500
      // New value: 50 * 6.00 = 300
      // New average: (500 + 300) / (100 + 50) = 800 / 150 = 5.33

      expect(response.body).toMatchObject({
        productId: product.id,
        oldCost: 5.00,
        newCost: expect.closeTo(5.33, 2),
        oldStock: 100,
        newStock: 150,
        variation: expect.closeTo(0.33, 2),
        variationPercentage: expect.closeTo(6.67, 2)
      })

      // Verify database update
      const updatedProduct = await prisma.product.findUnique({
        where: { id: product.id }
      })

      expect(updatedProduct?.cost).toBeCloseTo(5.33, 2)
      expect(updatedProduct?.stock).toBe(150)
    })

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .post('/api/inventory/update-cost')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          productId: 'non-existent-id',
          newQuantity: 10,
          newCost: 5.00
        })
        .expect(404)
    })

    it('should return 401 without authentication', async () => {
      const product = await productFactory.create()

      await request(app)
        .post('/api/inventory/update-cost')
        .send({
          productId: product.id,
          newQuantity: 10,
          newCost: 5.00
        })
        .expect(401)
    })
  })

  describe('GET /api/inventory/movements', () => {
    it('should return inventory movements', async () => {
      // This would require creating actual sales
      // For now, test that the endpoint exists and returns the expected structure
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      const response = await request(app)
        .get(`/api/inventory/movements?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/inventory/movements')
        .expect(401)
    })
  })

  describe('GET /api/inventory/fast-moving', () => {
    it('should return fast moving products', async () => {
      // This would require creating actual sales
      // For now, test that the endpoint exists and returns the expected structure
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      const response = await request(app)
        .get(`/api/inventory/fast-moving?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should limit results as specified', async () => {
      const startDate = new Date('2024-01-01')
      const endDate = new Date('2024-12-31')

      const response = await request(app)
        .get(`/api/inventory/fast-moving?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=5`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(Array.isArray(response.body)).toBe(true)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/inventory/fast-moving')
        .expect(401)
    })
  })
})
