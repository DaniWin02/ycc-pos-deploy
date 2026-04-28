import { AuthService } from '../../src/services/auth.service'
import { prisma } from '../setup'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock para variables de entorno
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'

describe('AuthService', () => {
  let authService: AuthService

  beforeEach(() => {
    authService = new AuthService(prisma)
  })

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10)
      const user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      const result = await authService.login('test@example.com', 'password123')

      expect(result).toMatchObject({
        user: {
          id: user.id,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      expect(result.token).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(typeof result.token).toBe('string')
      expect(typeof result.refreshToken).toBe('string')

      // Verify token structure
      const decoded = jwt.decode(result.token) as any
      expect(decoded.userId).toBe(user.id)
      expect(decoded.role).toBe('CASHIER')
    })

    it('should throw error for invalid email', async () => {
      await expect(authService.login('invalid@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should throw error for invalid password', async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10)
      await prisma.user.create({
        data: {
          username: 'testuser2',
          email: 'test@example.com',
          passwordHash: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      await expect(authService.login('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials')
    })

    it('should throw error for inactive user', async () => {
      // Create inactive user
      const hashedPassword = await bcrypt.hash('password123', 10)
      await prisma.user.create({
        data: {
          username: 'inactive',
          email: 'inactive@example.com',
          passwordHash: hashedPassword,
          firstName: 'Inactive',
          lastName: 'User',
          role: 'CASHIER',
          isActive: false
        }
      })

      await expect(authService.login('inactive@example.com', 'password123'))
        .rejects.toThrow('Account is disabled')
    })

    it('should update last login timestamp', async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('password123', 10)
      const user = await prisma.user.create({
        data: {
          username: 'testuser3',
          email: 'test@example.com',
          passwordHash: hashedPassword,
          firstName: 'Test',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      // Login
      await authService.login('test@example.com', 'password123')

      // Check last login was updated
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { lastLogin: true }
      })

      expect(updatedUser?.lastLogin).toBeInstanceOf(Date)
    })
  })

  describe('register', () => {
    it('should register new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        role: 'CASHIER'
      }

      const result = await authService.register(userData)

      expect(result).toMatchObject({
        user: {
          email: 'newuser@example.com',
          firstName: 'New',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      expect(result.token).toBeDefined()
      expect(result.refreshToken).toBeDefined()

      // Verify password was hashed
      const savedUser = await prisma.user.findUnique({
        where: { email: userData.email },
        select: { passwordHash: true }
      })

      expect(savedUser?.passwordHash).not.toBe(userData.password)
      expect(savedUser?.passwordHash.length).toBeGreaterThan(50) // bcrypt hash length
    })

    it('should use default role when not specified', async () => {
      const userData = {
        email: 'norole@example.com',
        password: 'password123',
        firstName: 'No',
        lastName: 'Role'
      }

      const result = await authService.register(userData)

      expect(result.user.role).toBe('CASHIER')
    })

    it('should throw error for existing email', async () => {
      // Create existing user
      const hashedPassword = await bcrypt.hash('password123', 10)
      await prisma.user.create({
        data: {
          username: 'existing',
          email: 'existing@example.com',
          passwordHash: hashedPassword,
          firstName: 'Existing',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      }

      await expect(authService.register(userData))
        .rejects.toThrow('Email already registered')
    })
  })

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          username: 'refresh',
          email: 'refresh@example.com',
          passwordHash: 'hashedpassword',
          firstName: 'Refresh',
          lastName: 'User',
          role: 'MANAGER',
          isActive: true
        }
      })

      // Generate refresh token
      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      )

      const result = await authService.refreshToken(refreshToken)

      expect(result.token).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(typeof result.token).toBe('string')
      expect(typeof result.refreshToken).toBe('string')

      // Verify new token structure
      const decoded = jwt.decode(result.token) as any
      expect(decoded.userId).toBe(user.id)
      expect(decoded.role).toBe('MANAGER')
    })

    it('should throw error for invalid refresh token', async () => {
      const invalidToken = 'invalid-token'

      await expect(authService.refreshToken(invalidToken))
        .rejects.toThrow('Invalid refresh token')
    })

    it('should throw error for wrong token type', async () => {
      // Generate access token instead of refresh token
      const accessToken = jwt.sign(
        { userId: 'user-id', role: 'CASHIER' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      )

      await expect(authService.refreshToken(accessToken))
        .rejects.toThrow('Invalid refresh token')
    })

    it('should throw error for inactive user', async () => {
      // Create inactive user
      const user = await prisma.user.create({
        data: {
          username: 'inactive2',
          email: 'inactive@example.com',
          passwordHash: 'hashedpassword',
          firstName: 'Inactive',
          lastName: 'User',
          role: 'CASHIER',
          isActive: false
        }
      })

      const refreshToken = jwt.sign(
        { userId: user.id, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET!,
        { expiresIn: '7d' }
      )

      await expect(authService.refreshToken(refreshToken))
        .rejects.toThrow('User not found or inactive')
    })
  })

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('oldpassword', 10)
      const user = await prisma.user.create({
        data: {
          username: 'changepass',
          email: 'changepass@example.com',
          passwordHash: hashedPassword,
          firstName: 'Change',
          lastName: 'Pass',
          role: 'CASHIER',
          isActive: true
        }
      })

      await authService.changePassword(user.id, 'oldpassword', 'newpassword123')

      // Verify password was changed
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true }
      })

      expect(updatedUser?.passwordHash).not.toBe(hashedPassword)

      // Verify new password works
      const isOldPasswordValid = await bcrypt.compare('oldpassword', updatedUser!.passwordHash)
      const isNewPasswordValid = await bcrypt.compare('newpassword123', updatedUser!.passwordHash)

      expect(isOldPasswordValid).toBe(false)
      expect(isNewPasswordValid).toBe(true)
    })

    it('should throw error for incorrect current password', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10)
      const user = await prisma.user.create({
        data: {
          username: 'wrongpass',
          email: 'wrongpass@example.com',
          passwordHash: hashedPassword,
          firstName: 'Wrong',
          lastName: 'Pass',
          role: 'CASHIER',
          isActive: true
        }
      })

      await expect(authService.changePassword(user.id, 'wrongpassword', 'newpassword'))
        .rejects.toThrow('Current password is incorrect')
    })

    it('should throw error for non-existent user', async () => {
      await expect(authService.changePassword('non-existent-id', 'oldpass', 'newpass'))
        .rejects.toThrow('User not found')
    })
  })

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      // Create test user
      const hashedPassword = await bcrypt.hash('oldpassword', 10)
      const user = await prisma.user.create({
        data: {
          username: 'reset',
          email: 'reset@example.com',
          passwordHash: hashedPassword,
          firstName: 'Reset',
          lastName: 'Pass',
          role: 'CASHIER',
          isActive: true
        }
      })

      await authService.resetPassword('reset@example.com', 'newpassword123')

      // Verify password was changed
      const updatedUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { passwordHash: true }
      })

      expect(updatedUser?.passwordHash).not.toBe(hashedPassword)

      // Verify new password works
      const isNewPasswordValid = await bcrypt.compare('newpassword123', updatedUser!.passwordHash)
      expect(isNewPasswordValid).toBe(true)
    })

    it('should throw error for non-existent user', async () => {
      await expect(authService.resetPassword('nonexistent@example.com', 'newpassword'))
        .rejects.toThrow('User not found')
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', async () => {
      // Create test user
      const user = await prisma.user.create({
        data: {
          username: 'verify',
          email: 'verify@example.com',
          passwordHash: 'hashedpassword',
          firstName: 'Verify',
          lastName: 'Token',
          role: 'ADMIN',
          isActive: true
        }
      })

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: 'ADMIN' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      )

      const result = await authService.verifyToken(token)

      expect(result).toMatchObject({
        userId: user.id,
        role: 'ADMIN',
        email: 'verify@example.com'
      })
    })

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid-token'

      await expect(authService.verifyToken(invalidToken))
        .rejects.toThrow('Invalid token')
    })

    it('should throw error for inactive user', async () => {
      // Create inactive user
      const user = await prisma.user.create({
        data: {
          username: 'inactive3',
          email: 'inactive@example.com',
          passwordHash: 'hashedpassword',
          firstName: 'Inactive',
          lastName: 'User',
          role: 'CASHIER',
          isActive: false
        }
      })

      const token = jwt.sign(
        { userId: user.id, role: 'CASHIER' },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      )

      await expect(authService.verifyToken(token))
        .rejects.toThrow('User not found or inactive')
    })
  })

  describe('getUserById', () => {
    it('should return user data', async () => {
      const user = await prisma.user.create({
        data: {
          username: 'getuser',
          email: 'getuser@example.com',
          passwordHash: 'hashedpassword',
          firstName: 'Get',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      const result = await authService.getUserById(user.id)

      expect(result).toMatchObject({
        id: user.id,
        email: 'getuser@example.com',
        firstName: 'Get',
        lastName: 'User',
        role: 'CASHIER',
        isActive: true
      })
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.lastLogin).toBeNull()
    })

    it('should throw error for non-existent user', async () => {
      await expect(authService.getUserById('non-existent-id'))
        .rejects.toThrow('User not found')
    })
  })

  describe('hasRole', () => {
    it('should return true for user with sufficient role', async () => {
      const admin = await prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@example.com',
          passwordHash: 'hashedpassword',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN',
          isActive: true
        }
      })

      const hasAdminRole = await authService.hasRole(admin.id, 'ADMIN')
      const hasManagerRole = await authService.hasRole(admin.id, 'MANAGER')
      const hasCashierRole = await authService.hasRole(admin.id, 'CASHIER')

      expect(hasAdminRole).toBe(true)
      expect(hasManagerRole).toBe(true)
      expect(hasCashierRole).toBe(true)
    })

    it('should return false for user with insufficient role', async () => {
      const cashier = await prisma.user.create({
        data: {
          username: 'cashier',
          email: 'cashier@example.com',
          passwordHash: 'hashedpassword',
          firstName: 'Cashier',
          lastName: 'User',
          role: 'CASHIER',
          isActive: true
        }
      })

      const hasAdminRole = await authService.hasRole(cashier.id, 'ADMIN')
      const hasManagerRole = await authService.hasRole(cashier.id, 'MANAGER')
      const hasCashierRole = await authService.hasRole(cashier.id, 'CASHIER')

      expect(hasAdminRole).toBe(false)
      expect(hasManagerRole).toBe(false)
      expect(hasCashierRole).toBe(true)
    })

    it('should return false for inactive user', async () => {
      const inactiveUser = await prisma.user.create({
        data: {
          username: 'inactive4',
          email: 'inactive@example.com',
          passwordHash: 'hashedpassword',
          firstName: 'Inactive',
          lastName: 'User',
          role: 'ADMIN',
          isActive: false
        }
      })

      const hasAdminRole = await authService.hasRole(inactiveUser.id, 'ADMIN')

      expect(hasAdminRole).toBe(false)
    })

    it('should return false for non-existent user', async () => {
      const hasRole = await authService.hasRole('non-existent-id', 'ADMIN')

      expect(hasRole).toBe(false)
    })
  })
})
