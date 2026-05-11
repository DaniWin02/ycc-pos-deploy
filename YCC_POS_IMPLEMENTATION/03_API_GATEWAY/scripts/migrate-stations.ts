import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Normalizar nombre de estación
const normalizeStationName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

// Detectar estación por nombre de producto
const detectStation = (productName: string, categoryName?: string): string => {
  const name = productName.toLowerCase();
  const category = categoryName?.toLowerCase() || '';

  // Bar / Bebidas
  if (
    name.includes('coca') ||
    name.includes('pepsi') ||
    name.includes('refresco') ||
    name.includes('bebida') ||
    name.includes('cerveza') ||
    name.includes('vino') ||
    name.includes('agua') ||
    name.includes('jugo') ||
    name.includes('limonada') ||
    category.includes('bebida') ||
    category.includes('bar')
  ) {
    return 'bar';
  }

  // Parrilla / Carnes
  if (
    name.includes('hamburguesa') ||
    name.includes('carne') ||
    name.includes('bistec') ||
    name.includes('asada') ||
    name.includes('pollo') ||
    name.includes('costilla') ||
    name.includes('chorizo') ||
    name.includes('salchicha') ||
    category.includes('parrilla') ||
    category.includes('carne')
  ) {
    return 'parrilla';
  }

  // Cocina Fría / Ensaladas
  if (
    name.includes('ensalada') ||
    name.includes('fruta') ||
    name.includes('yogurt') ||
    name.includes('cereal') ||
    name.includes('sandwich') ||
    category.includes('ensalada') ||
    category.includes('fria')
  ) {
    return 'cocina-fria';
  }

  // Cocina Caliente / Platillos
  if (
    name.includes('sopa') ||
    name.includes('pasta') ||
    name.includes('arroz') ||
    name.includes('guisado') ||
    name.includes('frijol') ||
    category.includes('caliente') ||
    category.includes('platillo')
  ) {
    return 'cocina-caliente';
  }

  // Postres
  if (
    name.includes('pastel') ||
    name.includes('helado') ||
    name.includes('postre') ||
    name.includes('flan') ||
    name.includes('pay') ||
    category.includes('postre')
  ) {
    return 'postres';
  }

  // Default: cocina general
  return 'cocina-general';
};

// Estaciones predefinidas
const DEFAULT_STATIONS = [
  { name: 'bar', displayName: 'Bar', color: '#059669' }, // Verde Country Club
  { name: 'parrilla', displayName: 'Parrilla', color: '#EF4444' },
  { name: 'cocina-fria', displayName: 'Cocina Fría', color: '#10B981' },
  { name: 'cocina-caliente', displayName: 'Cocina Caliente', color: '#F59E0B' },
  { name: 'postres', displayName: 'Postres', color: '#EC4899' },
  { name: 'cocina-general', displayName: 'Cocina General', color: '#6B7280' },
];

async function migrateStations() {
  console.log('🚀 Iniciando migración de estaciones...\n');

  try {
    // 1. Crear estaciones predefinidas
    console.log('📍 Paso 1: Creando estaciones predefinidas...');
    const stationMap = new Map<string, string>();

    for (const station of DEFAULT_STATIONS) {
      const existing = await prisma.station.findUnique({
        where: { name: station.name },
      });

      if (existing) {
        console.log(`   ✓ Estación "${station.displayName}" ya existe`);
        stationMap.set(station.name, existing.id);
      } else {
        const created = await prisma.station.create({
          data: station,
        });
        console.log(`   ✓ Estación "${station.displayName}" creada`);
        stationMap.set(station.name, created.id);
      }
    }

    // 2. Obtener todos los productos
    console.log('\n📦 Paso 2: Analizando productos existentes...');
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    console.log(`   Encontrados ${products.length} productos`);

    // 3. Asignar estación a cada producto
    console.log('\n🔄 Paso 3: Asignando estaciones a productos...');
    let assigned = 0;
    let errors = 0;

    for (const product of products) {
      try {
        // Detectar estación apropiada
        const detectedStation = detectStation(
          product.name,
          product.category?.name
        );
        const stationId = stationMap.get(detectedStation);

        if (!stationId) {
          console.error(`   ❌ No se encontró estación para: ${product.name}`);
          errors++;
          continue;
        }

        // Actualizar producto
        await prisma.product.update({
          where: { id: product.id },
          data: { stationId },
        });

        console.log(
          `   ✓ ${product.name} → ${DEFAULT_STATIONS.find((s) => s.name === detectedStation)?.displayName}`
        );
        assigned++;
      } catch (error: any) {
        console.error(`   ❌ Error con producto ${product.name}:`, error.message);
        errors++;
      }
    }

    // 4. Resumen
    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRACIÓN COMPLETADA');
    console.log('='.repeat(60));
    console.log(`Estaciones creadas: ${DEFAULT_STATIONS.length}`);
    console.log(`Productos asignados: ${assigned}`);
    console.log(`Errores: ${errors}`);
    console.log('='.repeat(60));

    // 5. Mostrar distribución por estación
    console.log('\n📊 Distribución de productos por estación:');
    for (const station of DEFAULT_STATIONS) {
      const count = await prisma.product.count({
        where: { stationId: stationMap.get(station.name) },
      });
      console.log(`   ${station.displayName}: ${count} productos`);
    }
  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateStations()
  .then(() => {
    console.log('\n✅ Script completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });
