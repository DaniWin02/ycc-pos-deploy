export { UserFactory } from './user.factory'
export { ProductFactory } from './product.factory'
export { RecipeFactory } from './recipe.factory'

// Importar prisma del setup
import { prisma } from '../setup'

// Exportar factory instances pre-configuradas
export const userFactory = new UserFactory(prisma)
export const productFactory = new ProductFactory(prisma)
export const recipeFactory = new RecipeFactory(prisma)
