import { PrismaClient } from '@prisma/client'

export class ProductFactory {
  constructor(private prisma: PrismaClient) {}

  private categoryCounter = 0
  private stationCounter = 0

  private async ensureCategory(name?: string) {
    const catName = name || `Test Category ${++this.categoryCounter}`
    const existing = await this.prisma.category.findFirst({ where: { name: catName } })
    if (existing) return existing
    return await this.prisma.category.create({
      data: { name: catName, description: 'Test category' }
    })
  }

  private async ensureStation(name?: string) {
    const stationName = name || `Test Station ${++this.stationCounter}`
    const existing = await this.prisma.station.findFirst({ where: { name: stationName } })
    if (existing) return existing
    return await this.prisma.station.create({
      data: { name: stationName, displayName: stationName, color: '#3B82F6' }
    })
  }

  async create(overrides: Partial<any> = {}) {
    const category = await this.ensureCategory(overrides.categoryName)
    const station = await this.ensureStation(overrides.stationName)

    const defaultProduct = {
      name: 'Test Product',
      description: 'Test Description',
      sku: `TEST-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      price: 10.99,
      cost: 5.50,
      taxRate: 0.16,
      trackInventory: true,
      currentStock: 100,
      minStockLevel: 10,
      unit: 'unidad',
      isActive: true,
      hasVariants: false,
      categoryId: category.id,
      stationId: station.id
    }

    const { categoryName, stationName, category, stock, minStock, ...restOverrides } = overrides
    const productData = {
      ...defaultProduct,
      ...restOverrides,
      currentStock: overrides.currentStock ?? overrides.stock ?? 100,
      minStockLevel: overrides.minStockLevel ?? overrides.minStock ?? 10
    }

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
        sku: `TEST-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`
      }))
    }
    return products
  }

  async createFood(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      name: overrides.name || 'Test Food',
      categoryName: 'Food',
      stationName: 'Cocina'
    })
  }

  async createBeverage(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      name: overrides.name || 'Test Beverage',
      categoryName: 'Beverages',
      stationName: 'Barra'
    })
  }

  async createWithLowStock(overrides: Partial<any> = {}) {
    return await this.create({
      ...overrides,
      currentStock: 5,
      minStockLevel: 10
    })
  }
}
