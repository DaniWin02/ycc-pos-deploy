// Script para migrar datos de PostgreSQL local a Neon
const { PrismaClient } = require('@prisma/client');

// Prisma client para DB local
const prismaLocal = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_LOCAL
    }
  }
});

// Prisma client para Neon
const prismaNeon = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_NEON
    }
  }
});

async function migrateData() {
  try {
    console.log('🚀 Iniciando migración de datos...\n');

    // 1. Migrar usuarios
    console.log('📋 Migrando usuarios...');
    const users = await prismaLocal.user.findMany();
    for (const user of users) {
      await prismaNeon.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }
    console.log(`✅ ${users.length} usuarios migrados\n`);

    // 2. Migrar categorías
    console.log('📋 Migrando categorías...');
    const categories = await prismaLocal.category.findMany();
    for (const category of categories) {
      await prismaNeon.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      });
    }
    console.log(`✅ ${categories.length} categorías migradas\n`);

    // 3. Migrar productos
    console.log('📋 Migrando productos...');
    const products = await prismaLocal.product.findMany();
    for (const product of products) {
      await prismaNeon.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      });
    }
    console.log(`✅ ${products.length} productos migrados\n`);

    // 4. Migrar mesas
    console.log('📋 Migrando mesas...');
    const tables = await prismaLocal.table.findMany();
    for (const table of tables) {
      await prismaNeon.table.upsert({
        where: { id: table.id },
        update: table,
        create: table
      });
    }
    console.log(`✅ ${tables.length} mesas migradas\n`);

    // 5. Migrar comandas
    console.log('📋 Migrando comandas...');
    const orders = await prismaLocal.order.findMany();
    for (const order of orders) {
      await prismaNeon.order.upsert({
        where: { id: order.id },
        update: order,
        create: order
      });
    }
    console.log(`✅ ${orders.length} comandas migradas\n`);

    // 6. Migrar items de comandas
    console.log('📋 Migrando items de comandas...');
    const orderItems = await prismaLocal.orderItem.findMany();
    for (const item of orderItems) {
      await prismaNeon.orderItem.upsert({
        where: { id: item.id },
        update: item,
        create: item
      });
    }
    console.log(`✅ ${orderItems.length} items migrados\n`);

    // 7. Migrar pagos
    console.log('📋 Migrando pagos...');
    const payments = await prismaLocal.payment.findMany();
    for (const payment of payments) {
      await prismaNeon.payment.upsert({
        where: { id: payment.id },
        update: payment,
        create: payment
      });
    }
    console.log(`✅ ${payments.length} pagos migrados\n`);

    // 8. Migrar configuración de temas (si existe)
    try {
      console.log('📋 Migrando configuración de temas...');
      const themeConfigs = await prismaLocal.themeConfiguration.findMany();
      for (const config of themeConfigs) {
        await prismaNeon.themeConfiguration.upsert({
          where: { id: config.id },
          update: config,
          create: config
        });
      }
      console.log(`✅ ${themeConfigs.length} configuraciones de tema migradas\n`);
    } catch (e) {
      console.log('⚠️  Tabla themeConfiguration no existe, saltando...\n');
    }

    console.log('🎉 ¡Migración completada exitosamente!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prismaLocal.$disconnect();
    await prismaNeon.$disconnect();
  }
}

migrateData()
  .catch(console.error);
