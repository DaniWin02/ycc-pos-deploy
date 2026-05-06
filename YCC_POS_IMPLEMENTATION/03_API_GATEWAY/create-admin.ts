import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Creando usuario admin universal...');
  
  const adminId = 'admin-universal';
  
  // Verificar si ya existe
  const existing = await prisma.user.findUnique({ where: { id: adminId } });
  
  if (existing) {
    console.log('✅ Usuario admin ya existe:', existing.id);
    // Actualizar PIN si es necesario
    if (existing.pin !== '0000') {
      await prisma.user.update({
        where: { id: adminId },
        data: { pin: '0000' }
      });
      console.log('✅ PIN actualizado a 0000');
    }
    return;
  }
  
  // Crear usuario admin
  const admin = await prisma.user.create({
    data: {
      id: adminId,
      username: 'admin',
      email: 'admin@countryclub.com',
      passwordHash: '$2b$10$defaultHashForAdmin',
      firstName: 'Administrador',
      lastName: 'Universal',
      role: 'ADMIN',
      pin: '0000',
      isActive: true,
      canAccessPos: true,
      canAccessKds: true,
      canAccessAdmin: true
    }
  });
  
  console.log('✅ Usuario admin creado:', admin.id);
  console.log('   PIN: 0000');
  console.log('   Acceso: POS, KDS, Admin Panel');
}

main()
  .catch(e => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
