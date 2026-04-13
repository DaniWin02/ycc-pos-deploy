const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando folios duplicados...\n');

  // Obtener todas las ventas
  const allOrders = await prisma.order.findMany({
    select: {
      id: true,
      folio: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  console.log(`Total de órdenes: ${allOrders.length}\n`);

  // Agrupar por folio
  const folioCount = {};
  allOrders.forEach(order => {
    if (!folioCount[order.folio]) {
      folioCount[order.folio] = [];
    }
    folioCount[order.folio].push(order);
  });

  // Mostrar folios duplicados
  const duplicates = Object.entries(folioCount).filter(([_, orders]) => orders.length > 1);
  
  if (duplicates.length > 0) {
    console.log('⚠️ Folios duplicados encontrados:\n');
    duplicates.forEach(([folio, orders]) => {
      console.log(`Folio ${folio}: ${orders.length} veces`);
      orders.forEach(order => {
        console.log(`  - ${order.id} (${order.createdAt.toISOString()})`);
      });
    });
  } else {
    console.log('✅ No hay folios duplicados');
  }

  // Mostrar folios de hoy
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const todayOrders = allOrders.filter(o => 
    o.createdAt >= todayStart && o.createdAt <= todayEnd
  );

  console.log(`\n📅 Ventas hoy (${today.toISOString().split('T')[0]}): ${todayOrders.length}`);
  todayOrders.forEach(order => {
    console.log(`  - ${order.folio} - ${order.createdAt.toISOString()}`);
  });

  // Mostrar máximo número de folio de hoy
  let maxNumber = 0;
  todayOrders.forEach(order => {
    if (order.folio.startsWith('#')) {
      const num = parseInt(order.folio.substring(1));
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  });

  console.log(`\n🔢 Máximo folio de hoy: #${String(maxNumber).padStart(3, '0')}`);
  console.log(`🔢 Siguiente folio debería ser: #${String(maxNumber + 1).padStart(3, '0')}`);
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
