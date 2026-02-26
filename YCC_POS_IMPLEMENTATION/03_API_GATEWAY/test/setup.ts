import { PrismaClient } from '@prisma/client'

// Prisma client para testing
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/ycc_pos_test'
    }
  }
})

// Setup global para todos los tests
beforeAll(async () => {
  // Conectar a la base de datos de test
  await prisma.$connect()
})

afterAll(async () => {
  // Desconectar de la base de datos
  await prisma.$disconnect()
})

// Limpiar la base de datos después de cada test
afterEach(async () => {
  // Ejecutar cleanup en orden para evitar foreign key constraints
  const tablenames = await prisma.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public'`
  
  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
      } catch (error) {
        console.log(`Error truncating ${tablename}:`, error)
      }
    }
  }
})

// Exportar prisma para usar en tests
export { prisma }

// Helper para crear transacciones y rollback automático
export const withTransaction = async (callback: (tx: PrismaClient) => Promise<void>) => {
  return await prisma.$transaction(async (tx) => {
    await callback(tx)
  })
}
