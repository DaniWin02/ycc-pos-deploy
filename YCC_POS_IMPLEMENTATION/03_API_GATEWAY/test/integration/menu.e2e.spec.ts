import request from 'supertest'
import { app } from '../../src/index'
import { prisma } from '../setup'
import { userFactory, productFactory } from '../factories'

describe('Menu Integration Tests', () => {
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

  describe('GET /api/menu/products', () => {
    it('should return active products', async () => {
      // Create test products
      await productFactory.createMany(3, {
        isActive: true,
        price: 10.99,
        stock: 50
      })

      const response = await request(app)
        .get('/api/menu/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(3)
      expect(response.body[0]).toMatchObject({
        name: expect.any(String),
        price: expect.any(Number),
        category: expect.any(String),
        isActive: true
      })
    })

    it('should not return inactive products', async () => {
      // Create active and inactive products
      await productFactory.create({ isActive: true })
      await productFactory.create({ isActive: false })

      const response = await request(app)
        .get('/api/menu/products')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(1)
      expect(response.body[0].isActive).toBe(true)
    })

    it('should filter by category', async () => {
      // Create products in different categories
      await productFactory.create({ category: 'FOOD' })
      await productFactory.create({ category: 'FOOD' })
      await productFactory.create({ category: 'BEVERAGE' })

      const response = await request(app)
        .get('/api/menu/products?category=FOOD')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveLength(2)
      expect(response.body[0].category).toBe('FOOD')
      expect(response.body[1].category).toBe('FOOD')
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/menu/products')
        .expect(401)
    })
  })

  describe('GET /api/menu/products/:id', () => {
    it('should return product by ID', async () => {
      const product = await productFactory.create({
        name: 'Test Product',
        price: 15.99,
        category: 'FOOD'
      })

      const response = await request(app)
        .get(`/api/menu/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: product.id,
        name: 'Test Product',
        price: 15.99,
        category: 'FOOD'
      })
    })

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .get('/api/menu/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should return 401 without authentication', async () => {
      const product = await productFactory.create()

      await request(app)
        .get(`/api/menu/products/${product.id}`)
        .expect(401)
    })
  })

  describe('POST /api/menu/products', () => {
    it('should create new product', async () => {
      const productData = {
        name: 'New Product',
        description: 'Test description',
        price: 12.99,
        cost: 6.50,
        category: 'FOOD',
        sku: 'NEW-001',
        stock: 100,
        minStock: 10
      }

      const response = await request(app)
        .post('/api/menu/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201)

      expect(response.body).toMatchObject({
        name: 'New Product',
        description: 'Test description',
        price: 12.99,
        cost: 6.50,
        category: 'FOOD',
        sku: 'NEW-001',
        stock: 100,
        minStock: 10,
        isActive: true
      })

      expect(response.body.id).toBeDefined()
      expect(response.body.createdAt).toBeDefined()
    })

    it('should return 403 for non-admin user', async () => {
      // Create cashier user
      const cashier = await userFactory.createCashier()
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: cashier.email,
          password: 'password123'
        })
      
      const cashierToken = loginResponse.body.token

      await request(app)
        .post('/api/menu/products')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          name: 'Test Product',
          price: 10.99,
          category: 'FOOD'
        })
        .expect(403)
    })

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/menu/products')
        .send({
          name: 'Test Product',
          price: 10.99,
          category: 'FOOD'
        })
        .expect(401)
    })
  })

  describe('PUT /api/menu/products/:id', () => {
    it('should update existing product', async () => {
      const product = await productFactory.create({
        name: 'Original Name',
        price: 10.99
      })

      const updateData = {
        name: 'Updated Name',
        price: 15.99,
        description: 'Updated description'
      }

      const response = await request(app)
        .put(`/api/menu/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(response.body).toMatchObject({
        id: product.id,
        name: 'Updated Name',
        price: 15.99,
        description: 'Updated description'
      })

      expect(response.body.updatedAt).toBeDefined()
    })

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .put('/api/menu/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          price: 15.99
        })
        .expect(404)
    })

    it('should return 403 for non-admin user', async () => {
      const product = await productFactory.create()
      const cashier = await userFactory.createCashier()
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: cashier.email,
          password: 'password123'
        })
      
      const cashierToken = loginResponse.body.token

      await request(app)
        .put(`/api/menu/products/${product.id}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          name: 'Updated Name',
          price: 15.99
        })
        .expect(403)
    })
  })

  describe('DELETE /api/menu/products/:id', () => {
    it('should delete product (soft delete)', async () => {
      const product = await productFactory.create({
        isActive: true
      })

      await request(app)
        .delete(`/api/menu/products/${product.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      // Verify product is deactivated
      const deletedProduct = await prisma.product.findUnique({
        where: { id: product.id }
      })

      expect(deletedProduct?.isActive).toBe(false)
    })

    it('should return 404 for non-existent product', async () => {
      await request(app)
        .delete('/api/menu/products/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404)
    })

    it('should return 403 for non-admin user', async () => {
      const product = await productFactory.create()
      const cashier = await userFactory.createCashier()
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: cashier.email,
          password: 'password123'
        })
      
      const cashierToken = loginResponse.body.token

      await request(app)
        .delete(`/api/menu/products/${product.id}`)
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(403)
    })
  })
})
