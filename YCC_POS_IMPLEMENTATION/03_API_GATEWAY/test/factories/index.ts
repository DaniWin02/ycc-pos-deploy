import { UserFactory } from './user.factory'
import { ProductFactory } from './product.factory'
import { RecipeFactory } from './recipe.factory'

// Importar prisma del setup
import { prisma } from '../setup'

// Exportar factory classes
export { UserFactory, ProductFactory, RecipeFactory }

// Exportar factory instances pre-configuradas
export const userFactory = new UserFactory(prisma)
export const productFactory = new ProductFactory(prisma)
export const recipeFactory = new RecipeFactory(prisma, productFactory)
