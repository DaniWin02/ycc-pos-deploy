const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Buscando órdenes con folio #001...\n');

  // Buscar todas las órdenes con folios que empiecen con #
  const allOrders = await prisma.order.findMany({
    where: {
      folio: {
        startsWith: '#'
      }
    },
    select: {
      id: true,
      folio: true,
      createdAt: true
    },
    orderBy: {
      folio: 'asc'
    }
  });

  console.log(`Total de órdenes con folios #: ${allOrders.length}\n`);
  
  // Mostrar todas
  allOrders.forEach((order, i) => {
    console.log(`${i + 1}. ${order.folio} - ${order.createdAt.toISOString()} - ${order.id}`);
  });

  // Contar por folio
  const folioCount = {};
  allOrders.forEach(order => {
    folioCount[order.folio] = (folioCount[order.folio] || 0) + 1;
  });

  // Mostrar duplicados
  const duplicates = Object.entries(folioCount).filter(([_, count]) => count > 1);
  
  if (duplicates.length > 0) {
    console.log('\n⚠️ Folios DUPLICADOS encontrados:\n');
    duplicates.forEach(([folio, count]) => {
      console.log(`  ${folio}: ${count} órdenes`);
    });
  } else {
    console.log('\n✅ No hay folios duplicados');
  }
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
