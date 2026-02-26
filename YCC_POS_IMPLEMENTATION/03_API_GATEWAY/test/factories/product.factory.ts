import { PrismaClient } from '@prisma/client'

export class ProductFactory {
  constructor(private prisma: PrismaClient) {}

  async create(overrides: Partial<any> = {}) {
    const defaultProduct = {
      name: 'Test Product',
      description: 'Test Description',
      sku: 'TEST-001',
      price: 10.99,
      cost: 5.50,
      category: 'FOOD',
      isActive: true,
      stock: 100,
      minStock: 10,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const productData = { ...defaultProduct, ...overrides }

    return await this.prisma.product.create({
      data: productData
    })
  }

  async createMany(count: number, overrides: Partial<any> = {}) {
    const products = []
    for (let i = 0; i < count; i++) {
      products.push(await this.create({
        ...overrides,
        name: `Test Product ${i}`,
        sku: `TEST-${String(i).padStart(3, '0')}`
      }))
    }
    return products
  }

  async createFood(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      name: 'Test Food',
      category: 'FOOD',
      sku: 'FOOD-001'
    })
  }

  async createBeverage(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      name: 'Test Beverage',
      category: 'BEVERAGE',
      sku: 'BEV-001'
    })
  }

  async createWithLowStock(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      stock: 5,
      minStock: 10
    })
  }
}
