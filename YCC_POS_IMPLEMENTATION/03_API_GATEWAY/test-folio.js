const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testFolio() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  
  const todayStart = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const todayEnd = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  
  console.log('Date prefix:', datePrefix);
  console.log('Range:', todayStart.toISOString(), 'to', todayEnd.toISOString());
  
  const todaySales = await prisma.order.findMany({
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
  
  console.log('Orders found:', todaySales.length);
  todaySales.forEach((s, i) => {
    console.log(`  ${i+1}. ${s.folio} - ${s.createdAt.toISOString()}`);
  });
  
  // Try to find max folio
  let maxNumber = 0;
  for (const sale of todaySales) {
    if (sale.folio && sale.folio.includes('-')) {
      const parts = sale.folio.split('-');
      const num = parseInt(parts[1]);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }
  }
  
  console.log('Max number found:', maxNumber, 'Next:', maxNumber + 1);
  
  const shortDate = datePrefix.substring(2);
  const folio = `${shortDate}-${String(maxNumber + 1).padStart(3, '0')}`;
  console.log('Folio to create:', folio);
  
  // Check if this folio already exists
  const existing = await prisma.order.findUnique({
    where: { folio }
  });
  
  if (existing) {
    console.log('❌ Folio already exists:', existing.folio);
    console.log('   Created at:', existing.createdAt.toISOString());
  } else {
    console.log('✅ Folio is available');
  }
  
  await prisma.$disconnect();
}

testFolio().catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
