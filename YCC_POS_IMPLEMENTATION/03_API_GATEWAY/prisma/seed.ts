import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando datos iniciales para Admin Panel...');
  
  try {
    // 1. Crear usuarios
    console.log('👥 Creando usuarios...');
    const users = await Promise.all([
      prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
          username: 'admin',
          email: 'admin@yccpos.com',
          passwordHash: await bcrypt.hash('admin123', 12),
          firstName: 'Administrador',
          lastName: 'Sistema',
          role: 'ADMIN',
          isActive: true
        }
      }),
      prisma.user.upsert({
        where: { username: 'cajero1' },
        update: {},
        create: {
          username: 'cajero1',
          email: 'cajero1@yccpos.com',
          passwordHash: await bcrypt.hash('cajero123', 12),
          firstName: 'Juan',
          lastName: 'Pérez',
          role: 'CASHIER',
          isActive: true
        }
      }),
      prisma.user.upsert({
        where: { username: 'mesero1' },
        update: {},
        create: {
          username: 'mesero1',
          email: 'mesero1@yccpos.com',
          passwordHash: await bcrypt.hash('mesero123', 12),
          firstName: 'María',
          lastName: 'García',
          role: 'CASHIER',
          isActive: true
        }
      })
    ]);

    // 2. Crear tienda
    console.log('🏪 Creando tienda...');
    const store = await prisma.store.upsert({
      where: { id: 'store-main' },
      update: {},
      create: {
        id: 'store-main',
        name: 'Country Club Principal',
        address: 'Av. Principal 123, Ciudad',
        phone: '555-0001',
        isActive: true
      }
    });

    // 3. Crear terminal
    console.log('💻 Creando terminal...');
    const terminal = await prisma.terminal.upsert({
      where: { id: 'terminal-main' },
      update: {},
      create: {
        id: 'terminal-main',
        name: 'Terminal Principal',
        location: 'Barra Principal',
        storeId: store.id,
        isActive: true
      }
    });

    // 4. Crear categorías
    console.log('📁 Creando categorías...');
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Bebidas' },
        update: {},
        create: {
          name: 'Bebidas',
          description: 'Refrescos, jugos, aguas'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Comidas' },
        update: {},
        create: {
          name: 'Comidas',
          description: 'Hamburguesas, hot dogs, sandwiches'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Postres' },
        update: {},
        create: {
          name: 'Postres',
          description: 'Helados, pasteles, dulces'
        }
      })
    ]);

    // 5. Crear productos
    console.log('🛍️ Creando productos...');
    const products = await Promise.all([
      prisma.product.upsert({
        where: { sku: 'BEB-001' },
        update: {},
        create: {
          sku: 'BEB-001',
          name: 'Coca Cola 600ml',
          description: 'Refresco de cola',
          price: 25.00,
          currentStock: 100,
          categoryId: categories[0].id,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { sku: 'COM-001' },
        update: {},
        create: {
          sku: 'COM-001',
          name: 'Hamburguesa Clásica',
          description: 'Carne res, lechuga, tomate',
          price: 85.00,
          currentStock: 50,
          categoryId: categories[1].id,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { sku: 'COM-002' },
        update: {},
        create: {
          sku: 'COM-002',
          name: 'Papas Fritas',
          description: 'Papas crujientes con sal',
          price: 45.00,
          currentStock: 80,
          categoryId: categories[1].id,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { sku: 'POS-001' },
        update: {},
        create: {
          sku: 'POS-001',
          name: 'Helado de Vainilla',
          description: 'Helado cremoso',
          price: 35.00,
          currentStock: 40,
          categoryId: categories[2].id,
          isActive: true
        }
      }),
      prisma.product.upsert({
        where: { sku: 'BEB-002' },
        update: {},
        create: {
          sku: 'BEB-002',
          name: 'Agua Purificada',
          description: 'Agua 600ml',
          price: 20.00,
          currentStock: 150,
          categoryId: categories[0].id,
          isActive: true
        }
      })
    ]);

    // 6. Crear órdenes de ejemplo
    console.log('💰 Creando órdenes de ejemplo...');
    const orders = await Promise.all([
      prisma.order.create({
        data: {
          folio: `ORD-${Date.now().toString(36).toUpperCase()}`,
          totalAmount: 110.00,
          taxAmount: 17.60,
          subtotal: 92.40,
          status: 'COMPLETED',
          storeId: store.id,
          terminalId: terminal.id,
          createdByUserId: users[1].id,
          items: {
            create: [
              {
                productId: products[1].id,
                productName: products[1].name,
                sku: products[1].sku,
                quantity: 1,
                unitPrice: 85.00,
                totalPrice: 85.00,
                taxAmount: 13.60,
                modifiers: JSON.stringify([])
              },
              {
                productId: products[0].id,
                productName: products[0].name,
                sku: products[0].sku,
                quantity: 1,
                unitPrice: 25.00,
                totalPrice: 25.00,
                taxAmount: 4.00,
                modifiers: JSON.stringify([])
              }
            ]
          }
        }
      }),
      prisma.order.create({
        data: {
          folio: `ORD-${(Date.now() + 1).toString(36).toUpperCase()}`,
          totalAmount: 65.00,
          taxAmount: 10.40,
          subtotal: 54.60,
          status: 'COMPLETED',
          storeId: store.id,
          terminalId: terminal.id,
          createdByUserId: users[2].id,
          items: {
            create: [
              {
                productId: products[2].id,
                productName: products[2].name,
                sku: products[2].sku,
                quantity: 1,
                unitPrice: 45.00,
                totalPrice: 45.00,
                taxAmount: 7.20,
                modifiers: JSON.stringify([])
              },
              {
                productId: products[4].id,
                productName: products[4].name,
                sku: products[4].sku,
                quantity: 1,
                unitPrice: 20.00,
                totalPrice: 20.00,
                taxAmount: 3.20,
                modifiers: JSON.stringify([])
              }
            ]
          }
        }
      })
    ]);

    console.log('✅ Datos iniciales creados exitosamente!');
    console.log('📊 Resumen:');
    console.log(`   - Usuarios: ${users.length}`);
    console.log(`   - Tiendas: 1`);
    console.log(`   - Terminales: 1`);
    console.log(`   - Categorías: ${categories.length}`);
    console.log(`   - Productos: ${products.length}`);
    console.log(`   - Órdenes: ${orders.length}`);
    
  } catch (error) {
    console.error('❌ Error creando datos iniciales:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error('Error fatal en seed:', error);
    process.exit(1);
  });
