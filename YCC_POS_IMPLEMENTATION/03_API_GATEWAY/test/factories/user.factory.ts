import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export class UserFactory {
  constructor(private prisma: PrismaClient) {}

  async create(overrides: Partial<any> = {}) {
    const defaultUser = {
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      firstName: 'Test',
      lastName: 'User',
      role: 'CASHIER',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const userData = { ...defaultUser, ...overrides }

    return await this.prisma.user.create({
      data: userData
    })
  }

  async createMany(count: number, overrides: Partial<any> = {}) {
    const users = []
    for (let i = 0; i < count; i++) {
      users.push(await this.create({
        ...overrides,
        email: `test${i}@example.com`,
        firstName: `Test${i}`,
        lastName: `User${i}`
      }))
    }
    return users
  }

  async createAdmin(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      email: 'admin@example.com',
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'User'
    })
  }

  async createCashier(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      email: 'cashier@example.com',
      role: 'CASHIER',
      firstName: 'Cashier',
      lastName: 'User'
    })
  }
}
