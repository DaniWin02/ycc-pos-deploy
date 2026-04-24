/**
 * Integration Test Script for Product Management Features
 * Tests all CRUD operations for:
 * - Stations (KDS)
 * - Modifier Groups & Modifiers
 * - Product Variants
 * - Product-Modifier Assignments
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runIntegrationTests() {
  console.log('\n🧪 INTEGRATION TESTS - Product Management\n');
  
  const results: { name: string; status: 'PASS' | 'FAIL'; error?: string }[] = [];

  // Test 1: Create Station
  try {
    console.log('Test 1: Create KDS Station...');
    const station = await prisma.station.create({
      data: {
        name: 'test-cocina',
        displayName: 'Cocina Test',
        color: '#EF4444'
      }
    });
    console.log(`✅ Station created: ${station.displayName}`);
    results.push({ name: 'Create Station', status: 'PASS' });
    
    // Cleanup
    await prisma.station.delete({ where: { id: station.id } });
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    results.push({ name: 'Create Station', status: 'FAIL', error: error.message });
  }

  // Test 2: Create Modifier Group
  try {
    console.log('\nTest 2: Create Modifier Group...');
    const group = await prisma.modifierGroup.create({
      data: {
        name: 'Test Extras',
        description: 'Extras para testing',
        isRequired: false
      }
    });
    console.log(`✅ Modifier Group created: ${group.name}`);
    results.push({ name: 'Create Modifier Group', status: 'PASS' });
    
    // Test 3: Create Modifier
    console.log('\nTest 3: Create Modifier...');
    const modifier = await prisma.modifier.create({
      data: {
        modifierGroupId: group.id,
        name: 'Extra Queso',
        description: 'Queso extra',
        priceAdd: 15
      }
    });
    console.log(`✅ Modifier created: ${modifier.name}`);
    results.push({ name: 'Create Modifier', status: 'PASS' });
    
    // Cleanup
    await prisma.modifier.delete({ where: { id: modifier.id } });
    await prisma.modifierGroup.delete({ where: { id: group.id } });
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    results.push({ name: 'Create Modifier Group/Modifier', status: 'FAIL', error: error.message });
  }

  // Test 4: Create Product Variant
  try {
    console.log('\nTest 4: Create Product Variant...');
    
    // First get or create a product
    let product = await prisma.product.findFirst();
    if (!product) {
      const [category, station] = await Promise.all([
        prisma.category.findFirst(),
        prisma.station.findFirst()
      ]);
      
      if (!station) throw new Error('No station found');
      
      product = await prisma.product.create({
        data: {
          name: 'Test Product',
          sku: 'TEST-001',
          price: 100,
          station: { connect: { id: station.id } },
          category: category ? { connect: { id: category.id } } : undefined
        }
      });
    }
    
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: 'Grande',
        sku: 'TEST-001-GRANDE',
        price: 120,
        currentStock: 50
      }
    });
    console.log(`✅ Product Variant created: ${variant.name}`);
    results.push({ name: 'Create Product Variant', status: 'PASS' });
    
    // Cleanup
    await prisma.productVariant.delete({ where: { id: variant.id } });
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    results.push({ name: 'Create Product Variant', status: 'FAIL', error: error.message });
  }

  // Test 5: Create Product-Modifier Assignment
  try {
    console.log('\nTest 5: Create Product-Modifier Assignment...');
    
    // Get or create required entities
    let product = await prisma.product.findFirst();
    let group = await prisma.modifierGroup.findFirst();
    
    if (!product) throw new Error('No product found');
    if (!group) {
      group = await prisma.modifierGroup.create({
        data: { name: 'Test Group', isRequired: false }
      });
    }
    
    const assignment = await prisma.productModifierGroup.create({
      data: {
        productId: product.id,
        modifierGroupId: group.id
      }
    });
    console.log(`✅ Assignment created: ${product.name} -> ${group.name}`);
    results.push({ name: 'Create Product-Modifier Assignment', status: 'PASS' });
    
    // Cleanup
    await prisma.productModifierGroup.delete({ where: { id: assignment.id } });
  } catch (error: any) {
    console.error(`❌ Failed: ${error.message}`);
    results.push({ name: 'Create Assignment', status: 'FAIL', error: error.message });
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.name}`);
    if (r.error) console.log(`   Error: ${r.error}`);
  });
  
  console.log('\n' + '-'.repeat(50));
  console.log(`Total: ${results.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
  console.log('='.repeat(50) + '\n');
  
  return { passed, failed, total: results.length };
}

// Run if called directly
if (require.main === module) {
  runIntegrationTests()
    .then((result) => {
      process.exit(result.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('Test runner error:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { runIntegrationTests };
