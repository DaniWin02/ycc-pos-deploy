import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Datos iniciales para desarrollo
const seedData = {
  users: [
    {
      username: 'admin',
      email: 'admin@ycc.com',
      password: 'admin123',
      firstName: 'Administrador',
      lastName: 'Sistema',
      role: 'ADMIN'
    },
    {
      username: 'cajero1',
      email: 'cajero1@ycc.com',
      password: 'cajero123',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'CASHIER'
    },
    {
      username: 'cocinero1',
      email: 'cocinero1@ycc.com',
      password: 'cocinero123',
      firstName: 'María',
      lastName: 'García',
      role: 'KITCHEN'
    }
  ],
  
  stores: [
    {
      name: 'Country Club Mérida',
      address: 'Calle Principal #123, Mérida, Yucatán',
      phone: '+52 999 123 4567'
    }
  ],
  
  terminals: [
    {
      storeId: 'store_1',
      name: 'Terminal Principal',
      location: 'Barra Principal'
    },
    {
      storeId: 'store_1',
      name: 'Terminal Terraza',
      location: 'Área Terraza'
    }
  ],
  
  categories: [
    {
      name: 'Bebidas',
      description: 'Todas las bebidas alcoholicas y no alcohólicas'
    },
    {
      name: 'Comidas',
      description: 'Platillos principales del menú'
    },
    {
      name: 'Postres',
      description: 'Dulces y postres'
    }
  ],
  
  products: [
    {
      sku: 'BEB-001',
      name: 'Coca Cola 600ml',
      description: 'Refresco de cola',
      categoryId: 'cat_1',
      price: 25.00,
      cost: 15.50,
      taxRate: 0.16,
      currentStock: 100,
      minStockLevel: 20
    },
    {
      sku: 'COM-001',
      name: 'Hamburguesa Clásica',
      description: 'Hamburguesa con carne de res',
      categoryId: 'cat_2',
      price: 85.00,
      cost: 45.00,
      taxRate: 0.16,
      currentStock: 50,
      minStockLevel: 10
    },
    {
      sku: 'POS-001',
      name: 'Papas Fritas',
      description: 'Papas fritas con sal',
      categoryId: 'cat_2',
      price: 45.00,
      cost: 20.00,
      taxRate: 0.16,
      currentStock: 80,
      minStockLevel: 15
    }
  ],
  
  ingredients: [
    {
      name: 'Carne de Res',
      description: 'Carne de res premium para hamburguesas',
      unit: 'kg',
      currentCost: 120.00
    },
    {
      name: 'Papas',
      description: 'Papas para freír',
      unit: 'kg',
      currentCost: 25.00
    }
  ],
  
  modifierGroups: [
    {
      name: 'Adicionales Hamburguesa',
      description: 'Ingredientes adicionales para hamburguesas',
      isRequired: false
    },
    {
      name: 'Salsas',
      description: 'Opciones de salsas',
      isRequired: false
    }
  ],
  
  modifiers: [
    {
      modifierGroupId: 'mod_group_1',
      name: 'Queso Extra',
      description: 'Queso cheddar adicional',
      priceAdd: 10.00
    },
    {
      modifierGroupId: 'mod_group_1',
      name: 'Tocino',
      description: 'Tocino extra',
      priceAdd: 8.00
    },
    {
      modifierGroupId: 'mod_group_2',
      name: 'Mayonesa',
      description: 'Mayonesa',
      priceAdd: 5.00
    },
    {
      modifierGroupId: 'mod_group_2',
      name: 'Kétchup',
      description: 'Kétchup picante',
      priceAdd: 5.00
    }
  ]
};

async function main() {
  console.log('🌱 Iniciando seed de base de datos YCC POS...');
  
  try {
    // Crear usuarios con passwords hasheadas
    const usersWithPasswords = await Promise.all(
      seedData.users.map(async (user) => {
        const passwordHash = await bcrypt.hash(user.password, 12);
        return {
          ...user,
          passwordHash
        };
      })
    );
    
    // Insertar datos en orden de dependencia
    await prisma.userRole.createMany({
      data: [
        { name: 'ADMIN', permissions: JSON.stringify({ all: true }) },
        { name: 'CASHIER', permissions: JSON.stringify({ sales: true, payments: true }) },
        { name: 'MANAGER', permissions: JSON.stringify({ sales: true, payments: true, reports: true }) },
        { name: 'KITCHEN', permissions: JSON.stringify({ kds: true }) }
      ]
    });
    
    await prisma.user.createMany({
      data: usersWithPasswords
    });
    
    await prisma.store.createMany({
      data: seedData.stores
    });
    
    await prisma.terminal.createMany({
      data: seedData.terminals
    });
    
    await prisma.category.createMany({
      data: seedData.categories
    });
    
    await prisma.product.createMany({
      data: seedData.products
    });
    
    await prisma.ingredient.createMany({
      data: seedData.ingredients
    });
    
    await prisma.modifierGroup.createMany({
      data: seedData.modifierGroups
    });
    
    await prisma.modifier.createMany({
      data: seedData.modifiers
    });
    
    console.log('✅ Seed completado exitosamente');
    console.log('📊 Datos creados:');
    console.log(`  - ${usersWithPasswords.length} usuarios`);
    console.log(`  - ${seedData.stores.length} tiendas`);
    console.log(`  - ${seedData.terminals.length} terminales`);
    console.log(`  - ${seedData.categories.length} categorías`);
    console.log(`  - ${seedData.products.length} productos`);
    console.log(`  - ${seedData.ingredients.length} ingredientes`);
    console.log(`  - ${seedData.modifierGroups.length} grupos de modificadores`);
    console.log(`  - ${seedData.modifiers.length} modificadores`);
    
  } catch (error) {
    console.error('❌ Error en seed:', error);
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
