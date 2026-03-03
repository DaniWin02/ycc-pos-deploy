// Script simple para insertar datos de prueba usando fetch
const API_URL = 'http://localhost:3004'

async function insertTestData() {
  console.log('🌱 Insertando datos de prueba vía API...')
  
  // Nota: Como el API actual es simple, vamos a insertar datos directamente
  // usando Prisma desde el mismo script
  
  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://postgres:1111@localhost:5432/ycc_pos'
      }
    }
  })
  
  try {
    // Store
    await prisma.store.create({
      data: {
        id: 'store-1',
        name: 'YCC Main Store',
        address: 'Av. Principal 123',
        phone: '555-1234'
      }
    }).catch(() => console.log('Store ya existe'))

    // Terminal
    await prisma.terminal.create({
      data: {
        id: 'terminal-1',
        storeId: 'store-1',
        name: 'Terminal 1',
        location: 'Main Counter'
      }
    }).catch(() => console.log('Terminal ya existe'))

    // User
    await prisma.user.create({
      data: {
        id: 'user-1',
        username: 'admin',
        email: 'admin@ycc.com',
        passwordHash: '$2a$10$abcdefghijklmnopqrstuv',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN'
      }
    }).catch(() => console.log('User ya existe'))

    // Categories
    await prisma.category.create({
      data: { id: 'cat-bebidas', name: 'Bebidas', description: 'Bebidas y refrescos' }
    }).catch(() => console.log('Categoría Bebidas ya existe'))

    await prisma.category.create({
      data: { id: 'cat-comida', name: 'Comida', description: 'Platillos principales' }
    }).catch(() => console.log('Categoría Comida ya existe'))

    await prisma.category.create({
      data: { id: 'cat-postres', name: 'Postres', description: 'Postres y dulces' }
    }).catch(() => console.log('Categoría Postres ya existe'))

    // Products
    const products = [
      { id: 'prod-1', sku: 'BEB-001', name: 'Coca Cola', categoryId: 'cat-bebidas', price: 25.00, cost: 12.00 },
      { id: 'prod-2', sku: 'BEB-002', name: 'Agua Mineral', categoryId: 'cat-bebidas', price: 15.00, cost: 8.00 },
      { id: 'prod-3', sku: 'BEB-003', name: 'Jugo Naranja', categoryId: 'cat-bebidas', price: 35.00, cost: 18.00 },
      { id: 'prod-4', sku: 'COM-001', name: 'Hamburguesa Clásica', categoryId: 'cat-comida', price: 120.00, cost: 60.00 },
      { id: 'prod-5', sku: 'COM-002', name: 'Pizza Margarita', categoryId: 'cat-comida', price: 150.00, cost: 75.00 },
      { id: 'prod-6', sku: 'COM-003', name: 'Ensalada César', categoryId: 'cat-comida', price: 95.00, cost: 45.00 },
      { id: 'prod-7', sku: 'POS-001', name: 'Pastel Chocolate', categoryId: 'cat-postres', price: 55.00, cost: 25.00 },
      { id: 'prod-8', sku: 'POS-002', name: 'Helado Vainilla', categoryId: 'cat-postres', price: 45.00, cost: 20.00 }
    ]

    for (const p of products) {
      await prisma.product.create({
        data: {
          ...p,
          currentStock: 100,
          minStockLevel: 10
        }
      }).catch(() => console.log(`Producto ${p.name} ya existe`))
    }

    console.log('✅ Datos insertados!')
    
    // Verificar
    const count = await prisma.product.count()
    console.log(`📦 Total productos en DB: ${count}`)
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

insertTestData()
