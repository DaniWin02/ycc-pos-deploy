const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Insertando datos de prueba...')

  // Store
  await prisma.store.upsert({
    where: { id: 'store-1' },
    update: {},
    create: {
      id: 'store-1',
      name: 'YCC Main Store',
      address: 'Av. Principal 123',
      phone: '555-1234',
      isActive: true
    }
  })

  // Terminal
  await prisma.terminal.upsert({
    where: { id: 'terminal-1' },
    update: {},
    create: {
      id: 'terminal-1',
      storeId: 'store-1',
      name: 'Terminal 1',
      location: 'Main Counter',
      isActive: true
    }
  })

  // User
  await prisma.user.upsert({
    where: { id: 'user-1' },
    update: {},
    create: {
      id: 'user-1',
      username: 'admin',
      email: 'admin@ycc.com',
      passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true
    }
  })

  // Categories
  const catBebidas = await prisma.category.upsert({
    where: { id: 'cat-bebidas' },
    update: {},
    create: {
      id: 'cat-bebidas',
      name: 'Bebidas',
      description: 'Bebidas y refrescos',
      isActive: true
    }
  })

  const catComida = await prisma.category.upsert({
    where: { id: 'cat-comida' },
    update: {},
    create: {
      id: 'cat-comida',
      name: 'Comida',
      description: 'Platillos principales',
      isActive: true
    }
  })

  const catPostres = await prisma.category.upsert({
    where: { id: 'cat-postres' },
    update: {},
    create: {
      id: 'cat-postres',
      name: 'Postres',
      description: 'Postres y dulces',
      isActive: true
    }
  })

  // Products
  const products = [
    { id: 'prod-1', sku: 'BEB-001', name: 'Coca Cola', description: 'Refresco 355ml', categoryId: catBebidas.id, price: 25.00, cost: 12.00 },
    { id: 'prod-2', sku: 'BEB-002', name: 'Agua Mineral', description: 'Agua 500ml', categoryId: catBebidas.id, price: 15.00, cost: 8.00 },
    { id: 'prod-3', sku: 'BEB-003', name: 'Jugo Naranja', description: 'Jugo natural 300ml', categoryId: catBebidas.id, price: 35.00, cost: 18.00 },
    { id: 'prod-4', sku: 'COM-001', name: 'Hamburguesa Clásica', description: 'Con queso y papas', categoryId: catComida.id, price: 120.00, cost: 60.00 },
    { id: 'prod-5', sku: 'COM-002', name: 'Pizza Margarita', description: 'Pizza mediana', categoryId: catComida.id, price: 150.00, cost: 75.00 },
    { id: 'prod-6', sku: 'COM-003', name: 'Ensalada César', description: 'Con pollo y aderezo', categoryId: catComida.id, price: 95.00, cost: 45.00 },
    { id: 'prod-7', sku: 'POS-001', name: 'Pastel Chocolate', description: 'Rebanada', categoryId: catPostres.id, price: 55.00, cost: 25.00 },
    { id: 'prod-8', sku: 'POS-002', name: 'Helado Vainilla', description: '2 bolas', categoryId: catPostres.id, price: 45.00, cost: 20.00 }
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        taxRate: 0.16,
        trackInventory: true,
        currentStock: 100,
        minStockLevel: 10,
        isActive: true
      }
    })
  }

  console.log('✅ Datos insertados correctamente!')
  console.log(`   - 1 Store`)
  console.log(`   - 1 Terminal`)
  console.log(`   - 1 User`)
  console.log(`   - 3 Categories`)
  console.log(`   - ${products.length} Products`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
