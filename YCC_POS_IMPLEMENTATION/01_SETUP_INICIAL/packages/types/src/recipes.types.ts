// Recipe and Food Cost Types for YCC POS

export interface Recipe {
  id: string
  name: string
  description?: string
  category: RecipeCategory
  imageUrl?: string
  prepTime?: number // in minutes
  cookTime?: number // in minutes
  servings: number
  difficulty: RecipeDifficulty
  isActive: boolean
  price: number
  foodCost?: number
  foodCostPercentage?: number
  theoreticalCost?: number
  ingredients: RecipeIngredient[]
  subRecipes: RecipeSubRecipe[]
  instructions: RecipeInstruction[]
  allergens: Allergen[]
  nutritionalInfo?: NutritionalInfo
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface RecipeIngredient {
  id: string
  recipeId: string
  ingredientId: string
  ingredient: any // Ingredient type from inventory
  quantity: number
  unit: string
  unitCost?: number
  totalCost?: number
  isOptional: boolean
  notes?: string
  order: number
}

export interface RecipeSubRecipe {
  id: string
  recipeId: string
  subRecipeId: string
  subRecipe: Recipe
  quantity: number
  unit: string
  unitCost?: number
  totalCost?: number
  order: number
}

export interface RecipeInstruction {
  id: string
  recipeId: string
  step: number
  title?: string
  description: string
  time?: number // in minutes
  temperature?: number // in celsius
  imageUrl?: string
}

export interface RecipeCategory {
  id: string
  name: string
  description?: string
  parentId?: string
  children?: RecipeCategory[]
  order: number
  isActive: boolean
}

export enum RecipeDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum Allergen {
  GLUTEN = 'GLUTEN',
  DAIRY = 'DAIRY',
  EGGS = 'EGGS',
  FISH = 'FISH',
  SHELLFISH = 'SHELLFISH',
  TREE_NUTS = 'TREE_NUTS',
  PEANUTS = 'PEANUTS',
  SOY = 'SOY',
  SESAME = 'SESAME'
}

export interface NutritionalInfo {
  calories: number
  protein: number // in grams
  carbohydrates: number // in grams
  fat: number // in grams
  fiber: number // in grams
  sugar: number // in grams
  sodium: number // in milligrams
  cholesterol?: number // in milligrams
  saturatedFat?: number // in grams
  transFat?: number // in grams
  vitaminA?: number // in IU
  vitaminC?: number // in milligrams
  calcium?: number // in milligrams
  iron?: number // in milligrams
}

// Food Cost Analysis Types
export interface FoodCostAnalysis {
  id: string
  recipeId: string
  recipe: Recipe
  storeId: string
  theoreticalCost: number
  actualCost: number
  variance: number
  variancePercentage: number
  ingredientCosts: IngredientCostBreakdown[]
  subRecipeCosts: SubRecipeCostBreakdown[]
  laborCost?: number
  overheadCost?: number
  totalCost: number
  targetFoodCostPercentage: number
  actualFoodCostPercentage: number
  analysisDate: Date
  period: FoodCostPeriod
}

export interface IngredientCostBreakdown {
  ingredientId: string
  ingredient: any // Ingredient type
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  costPercentage: number
  lastUpdated: Date
}

export interface SubRecipeCostBreakdown {
  subRecipeId: string
  subRecipe: Recipe
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  costPercentage: number
  ingredientBreakdown: IngredientCostBreakdown[]
}

export enum FoodCostPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY'
}

// AVT (Actual vs Theoretical) Analysis
export interface AVTAnalysis {
  id: string
  recipeId: string
  recipe: Recipe
  storeId: string
  period: AVTPeriod
  theoreticalUsage: TheoreticalUsage
  actualUsage: ActualUsage
  variance: AVTVariance
  ingredientVariances: IngredientVariance[]
  totalVarianceAmount: number
  totalVariancePercentage: number
  analysisDate: Date
  createdBy: string
}

export interface TheoreticalUsage {
  totalQuantityProduced: number
  totalIngredientCost: number
  ingredientUsages: TheoreticalIngredientUsage[]
}

export interface TheoreticalIngredientUsage {
  ingredientId: string
  ingredient: any
  theoreticalQuantity: number
  unit: string
  unitCost: number
  totalCost: number
}

export interface ActualUsage {
  totalQuantityProduced: number
  totalIngredientCost: number
  ingredientUsages: ActualIngredientUsage[]
}

export interface ActualIngredientUsage {
  ingredientId: string
  ingredient: any
  actualQuantity: number
  unit: string
  unitCost: number
  totalCost: number
}

export interface AVTVariance {
  quantityVariance: number
  costVariance: number
  percentageVariance: number
  isPositive: boolean // positive variance = good (less usage than theoretical)
}

export interface IngredientVariance {
  ingredientId: string
  ingredient: any
  theoreticalQuantity: number
  actualQuantity: number
  quantityVariance: number
  unitCost: number
  costVariance: number
  percentageVariance: number
  isPositive: boolean
}

export enum AVTPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

// Recipe Cost Calculation Types
export interface RecipeCostCalculation {
  recipeId: string
  storeId: string
  ingredientCosts: CalculatedIngredientCost[]
  subRecipeCosts: CalculatedSubRecipeCost[]
  totalIngredientCost: number
  totalSubRecipeCost: number
  totalCost: number
  costPerServing: number
  foodCostPercentage: number
  lastCalculated: Date
}

export interface CalculatedIngredientCost {
  ingredientId: string
  ingredient: any
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  costPercentage: number
}

export interface CalculatedSubRecipeCost {
  subRecipeId: string
  subRecipe: Recipe
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  costPercentage: number
  ingredientBreakdown: CalculatedIngredientCost[]
}

// Recipe Management Types
export interface RecipeCreateRequest {
  name: string
  description?: string
  categoryId: string
  prepTime?: number
  cookTime?: number
  servings: number
  difficulty: RecipeDifficulty
  price: number
  ingredients: Omit<RecipeIngredient, 'id' | 'recipeId'>[]
  subRecipes: Omit<RecipeSubRecipe, 'id' | 'recipeId'>[]
  instructions: Omit<RecipeInstruction, 'id' | 'recipeId'>[]
  allergens: Allergen[]
  nutritionalInfo?: NutritionalInfo
}

export interface RecipeUpdateRequest {
  name?: string
  description?: string
  categoryId?: string
  prepTime?: number
  cookTime?: number
  servings?: number
  difficulty?: RecipeDifficulty
  price?: number
  isActive?: boolean
  ingredients?: Omit<RecipeIngredient, 'id' | 'recipeId'>[]
  subRecipes?: Omit<RecipeSubRecipe, 'id' | 'recipeId'>[]
  instructions?: Omit<RecipeInstruction, 'id' | 'recipeId'>[]
  allergens?: Allergen[]
  nutritionalInfo?: NutritionalInfo
}

export interface RecipeFilters {
  search?: string
  categoryId?: string
  difficulty?: RecipeDifficulty
  allergen?: Allergen
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
  minFoodCost?: number
  maxFoodCost?: number
  createdBy?: string
  dateFrom?: Date
  dateTo?: Date
}

// Recipe Search and Autocomplete
export interface RecipeSearchResult {
  id: string
  name: string
  description?: string
  category: string
  imageUrl?: string
  prepTime?: number
  cookTime?: number
  servings: number
  difficulty: RecipeDifficulty
  price: number
  foodCost?: number
  relevanceScore: number
}

export interface RecipeSearchFilters {
  query: string
  limit?: number
  includeInactive?: boolean
  categoryIds?: string[]
  excludeIds?: string[]
}

// Recipe Cost History
export interface RecipeCostHistory {
  id: string
  recipeId: string
  storeId: string
  cost: number
  foodCostPercentage: number
  ingredientCosts: IngredientCostBreakdown[]
  changeReason: CostChangeReason
  changedBy: string
  changedAt: Date
}

export enum CostChangeReason {
  INGREDIENT_PRICE_CHANGE = 'INGREDIENT_PRICE_CHANGE',
  RECIPE_MODIFICATION = 'RECIPE_MODIFICATION',
  UNIT_CONVERSION_UPDATE = 'UNIT_CONVERSION_UPDATE',
  SUPPLIER_CHANGE = 'SUPPLIER_CHANGE',
  SYSTEM_CORRECTION = 'SYSTEM_CORRECTION',
  MANUAL_ADJUSTMENT = 'MANUAL_ADJUSTMENT'
}

// Recipe Performance Metrics
export interface RecipePerformanceMetrics {
  recipeId: string
  recipe: Recipe
  period: PerformancePeriod
  totalOrders: number
  totalRevenue: number
  totalCost: number
  grossProfit: number
  profitMargin: number
  foodCostVariance: number
  popularityScore: number
  averageOrderSize: number
  peakHours: number[]
  topSellingDays: string[]
}

export enum PerformancePeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

// Recipe Version Control
export interface RecipeVersion {
  id: string
  recipeId: string
  version: number
  name: string
  description?: string
  ingredients: RecipeIngredient[]
  subRecipes: RecipeSubRecipe[]
  instructions: RecipeInstruction[]
  price: number
  foodCost: number
  isActive: boolean
  changeLog: string
  createdBy: string
  createdAt: Date
}

export interface RecipeVersionComparison {
  currentVersion: RecipeVersion
  previousVersion: RecipeVersion
  ingredientChanges: IngredientChange[]
  costChanges: CostChange[]
  instructionChanges: InstructionChange[]
}

export interface IngredientChange {
  ingredientId: string
  ingredient: any
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED'
  oldValue?: {
    quantity: number
    unit: string
    unitCost: number
  }
  newValue?: {
    quantity: number
    unit: string
    unitCost: number
  }
  costImpact: number
}

export interface CostChange {
  component: 'INGREDIENT' | 'SUB_RECIPE' | 'TOTAL'
  oldValue: number
  newValue: number
  changeAmount: number
  changePercentage: number
}

export interface InstructionChange {
  instructionId: string
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED'
  oldStep?: number
  newStep?: number
  oldDescription?: string
  newDescription?: string
}
