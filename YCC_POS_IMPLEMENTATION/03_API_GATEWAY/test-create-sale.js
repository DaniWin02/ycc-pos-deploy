const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreateSale() {
  console.log('=== Testing Sale Creation ===\n');
  
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  const todayStart = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const todayEnd = new Date(Date.UTC(year, now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
  
  console.log('Date:', datePrefix);
  console.log('Range:', todayStart.toISOString(), '->', todayEnd.toISOString());
  
  // Get max folio
  const todaySales = await prisma.order.findMany({
    where: { createdAt: { gte: todayStart, lte: todayEnd } },
    select: { folio: true }
  });
  
  console.log(`\nOrders today: ${todaySales.length}`);
  todaySales.slice(0, 5).forEach((s, i) => console.log(`  ${i+1}. ${s.folio}`));
  
  let maxNumber = 0;
  for (const sale of todaySales) {
    if (sale.folio && sale.folio.includes('-')) {
      const num = parseInt(sale.folio.split('-')[1]);
      if (!isNaN(num) && num > maxNumber) maxNumber = num;
    }
  }
  
  const shortDate = datePrefix.substring(2);
  const folio = `${shortDate}-${String(maxNumber + 1).padStart(3, '0')}`;
  console.log(`\nNext folio: ${folio}\n`);
  
  // Check terminal, store, user
  let terminal = await prisma.terminal.findFirst({ where: { isActive: true } });
  let store = await prisma.store.findFirst({ where: { isActive: true } });
  let user = await prisma.user.findFirst({ where: { isActive: true } });
  
  console.log('Terminal:', terminal?.id);
  console.log('Store:', store?.id);
  console.log('User:', user?.id);
  
  if (!terminal || !store || !user) {
    console.log('❌ Missing required entities');
    await prisma.$disconnect();
    return;
  }
  
  // Prepare order data
  const orderData = {
    totalAmount: 100,
    subtotal: 86.21,
    taxAmount: 13.79,
    status: 'PENDING',
    terminalId: terminal.id,
    createdByUserId: user.id,
    storeId: store.id,
    customerName: 'Test User',
    notes: null,
    items: {
      create: [{
        productId: 'test123',
        productName: 'Test Product',
        sku: 'TEST',
        quantity: '1',
        unitPrice: '100',
        totalPrice: '100',
        taxAmount: '0',
        modifiers: '[]'
      }]
    },
    payments: {
      create: {
        method: 'CASH',
        amount: '100',
        status: 'CAPTURED'
      }
    }
  };
  
  console.log('\nCreating order...');
  try {
    const order = await prisma.order.create({
      data: { ...orderData, folio },
      include: { items: true, payments: true }
    });
    console.log('✅ Order created:', order.folio);
  } catch (error) {
    console.error('❌ Error:', error.code);
    console.error('   Message:', error.message);
    console.error('   Target:', error.target);
    console.error('   Meta:', JSON.stringify(error.meta, null, 2));
  }
  
  await prisma.$disconnect();
}

testCreateSale().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
