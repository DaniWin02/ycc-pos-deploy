import request from 'supertest'
import { app } from '../../src/index'
import { prisma } from '../setup'
import { userFactory } from '../factories'

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    // Clean up database
    await prisma.user.deleteMany()
  })

  describe('POST /api/auth/login', () => {
    it('should login and return tokens', async () => {
      // Create test user
      const user = await userFactory.create({
        email: 'test@example.com',
        passwordHash: await (await import('bcryptjs')).hash('password123', 10)
      })

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200)

      expect(response.body).toMatchObject({
        user: {
          id: user.id,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      expect(response.body.token).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()
    })

    it('should return 401 for invalid credentials', async () => {
      await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        })
        .expect(401)
    })
  })

  describe('POST /api/auth/register', () => {
    it('should register new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'New',
          lastName: 'User'
        })
        .expect(201)

      expect(response.body).toMatchObject({
        user: {
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      expect(response.body.token).toBeDefined()
    })

    it('should return 400 for duplicate email', async () => {
      // Create existing user
      await userFactory.create({
        email: 'existing@example.com'
      })

      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User'
        })
        .expect(400)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should refresh token successfully', async () => {
      // Create and login user
      const user = await userFactory.create()
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        })

      const refreshToken = loginResponse.body.refreshToken

      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body.token).toBeDefined()
      expect(response.body.refreshToken).toBeDefined()
      expect(response.body.token).not.toBe(loginResponse.body.token)
    })

    it('should return 401 for invalid refresh token', async () => {
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token', async () => {
      // Create and login user
      const user = await userFactory.create()
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        })

      const token = loginResponse.body.token

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toMatchObject({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      })
    })

    it('should return 401 without token', async () => {
      await request(app)
        .get('/api/auth/me')
        .expect(401)
    })

    it('should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      // Create and login user
      const user = await userFactory.create()
      
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'password123'
        })

      const token = loginResponse.body.token

      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      // Verify token is no longer valid
      await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
    })
  })
})
