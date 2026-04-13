const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Probando creación de orden con folio único...\n');

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  console.log(`📅 Fecha: ${today.toISOString()}`);
  console.log(`📅 Inicio del día: ${todayStart.toISOString()}`);
  console.log(`📅 Fin del día: ${todayEnd.toISOString()}\n`);

  // Obtener folios de hoy
  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: todayStart,
        lte: todayEnd
      }
    },
    select: {
      folio: true,
      createdAt: true
    }
  });

  console.log(`📋 Ventas encontradas hoy: ${todayOrders.length}`);
  todayOrders.forEach((o, i) => console.log(`  ${i + 1}. ${o.folio} - ${o.createdAt.toISOString()}`));

  // Calcular siguiente folio
  let maxNumber = 0;
  todayOrders.forEach(order => {
    if (order.folio.startsWith('#')) {
      const num = parseInt(order.folio.substring(1));
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  });

  const nextFolio = `#${String(maxNumber + 1).padStart(3, '0')}`;
  console.log(`\n🔢 Siguiente folio: ${nextFolio}\n`);

  // Intentar crear una orden de prueba
  console.log('📝 Intentando crear orden de prueba...');
  try {
    const testOrder = await prisma.order.create({
      data: {
        folio: nextFolio,
        totalAmount: 35,
        subtotal: 35,
        taxAmount: 0,
        status: 'PENDING',
        terminalId: 'terminal-main',
        createdByUserId: 'user-cashier',
        storeId: 'store-main',
        customerName: 'Test Script',
        items: {
          create: {
            productId: 'cmn94l5s90001txwq97ajuooq',
            productName: 'Coca Cola 600ml',
            sku: 'BEB-001',
            quantity: 1,
            unitPrice: 35,
            totalPrice: 35,
            taxAmount: 0,
            modifiers: '[]'
          }
        },
        payments: {
          create: {
            method: 'CASH',
            amount: 35,
            status: 'CAPTURED'
          }
        }
      },
      include: {
        items: true,
        payments: true
      }
    });

    console.log('✅ ¡Orden creada exitosamente!');
    console.log(`   ID: ${testOrder.id}`);
    console.log(`   Folio: ${testOrder.folio}`);
    console.log(`   Total: $${testOrder.totalAmount}\n`);

    // Limpiar la orden de prueba
    console.log('🗑️ Limpiando orden de prueba...');
    await prisma.order.delete({
      where: { id: testOrder.id }
    });
    console.log('✅ Orden de prueba eliminada\n');

  } catch (error) {
    console.error('❌ Error creando orden de prueba:');
    console.error(`   Código: ${error.code}`);
    console.error(`   Mensaje: ${error.message}`);
    console.error(`   Meta:`, error.meta);
    console.error(`   Stack: ${error.stack}`);
  }
}

main()
  .catch(e => {
    console.error('❌ Error fatal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
