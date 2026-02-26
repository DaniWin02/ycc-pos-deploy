import { BaseEntity } from './index';

// Ingredientes para Recetas
export interface RecipeIngredient extends BaseEntity {
  name: string;
  description?: string;
  unit: string; // kg, g, l, ml, pcs, etc.
  currentCost: number;
  supplier?: string;
  supplierCode?: string;
  minStockLevel: number;
  currentStock: number;
  isActive: boolean;
  allergenInfo?: string[];
  storageInfo?: string;
  shelfLife?: number; // días
}

export interface RecipeIngredientCreateRequest {
  name: string;
  description?: string;
  unit: string;
  currentCost: number;
  supplier?: string;
  supplierCode?: string;
  minStockLevel?: number;
  currentStock?: number;
  isActive?: boolean;
  allergenInfo?: string[];
  storageInfo?: string;
  shelfLife?: number;
}

export interface RecipeIngredientUpdateRequest {
  name?: string;
  description?: string;
  unit?: string;
  currentCost?: number;
  supplier?: string;
  supplierCode?: string;
  minStockLevel?: number;
  currentStock?: number;
  isActive?: boolean;
  allergenInfo?: string[];
  storageInfo?: string;
  shelfLife?: number;
}

// Items de Receta
export interface RecipeItem extends BaseEntity {
  menuItemId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  cost?: number;
  notes?: string;
  isOptional: boolean;
  substitutionOptions?: RecipeSubstitution[];
  ingredient?: RecipeIngredient;
}

export interface RecipeItemCreateRequest {
  menuItemId: string;
  ingredientId: string;
  quantity: number;
  unit: string;
  cost?: number;
  notes?: string;
  isOptional?: boolean;
}

export interface RecipeItemUpdateRequest {
  ingredientId?: string;
  quantity?: number;
  unit?: string;
  cost?: number;
  notes?: string;
  isOptional?: boolean;
}

// Sustituciones en Recetas
export interface RecipeSubstitution extends BaseEntity {
  recipeItemId: string;
  substituteIngredientId: string;
  quantity: number;
  unit: string;
  costAdjustment: number; // porcentaje o valor fijo
  notes?: string;
  substituteIngredient?: RecipeIngredient;
}

export interface RecipeSubstitutionCreateRequest {
  recipeItemId: string;
  substituteIngredientId: string;
  quantity: number;
  unit: string;
  costAdjustment: number;
  notes?: string;
}

// Cálculo de Costos de Receta
export interface RecipeCostCalculation {
  menuItemId: string;
  totalRecipeCost: number;
  ingredientCosts: RecipeIngredientCost[];
  laborCost?: number;
  overheadCost?: number;
  totalCost: number;
  foodCostPercentage: number;
  margin: number;
  marginPercentage: number;
  status: FoodCostStatus;
  lastCalculated: Date;
}

export interface RecipeIngredientCost {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  costPercentage: number;
}

export interface RecipeCostPreview {
  recipeCost: number;
  foodCostPercentage: number;
  margin: number;
  marginPercentage: number;
  status: FoodCostStatus;
  ingredientBreakdown: RecipeIngredientCost[];
}

// Escalado de Recetas
export interface RecipeScaling {
  baseQuantity: number;
  targetQuantity: number;
  scaleFactor: number;
  scaledIngredients: ScaledRecipeIngredient[];
  scaledCost: number;
  scaledFoodCostPercentage: number;
}

export interface ScaledRecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  originalQuantity: number;
  scaledQuantity: number;
  unit: string;
  unitCost: number;
  scaledCost: number;
}

// Nutrición
export interface RecipeNutrition extends BaseEntity {
  menuItemId: string;
  calories: number;
  protein: number; // gramos
  carbs: number; // gramos
  fat: number; // gramos
  fiber: number; // gramos
  sodium: number; // mg
  sugar: number; // gramos
  cholesterol: number; // mg
  servingSize: string;
  allergens: string[];
  dietaryRestrictions: string[];
  lastUpdated: Date;
}

export interface RecipeNutritionCreateRequest {
  menuItemId: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  cholesterol: number;
  servingSize: string;
  allergens: string[];
  dietaryRestrictions: string[];
}

// Preparación
export interface RecipePreparationStep extends BaseEntity {
  menuItemId: string;
  stepNumber: number;
  title: string;
  description: string;
  preparationTime: number; // minutos
  cookingTime?: number; // minutos
  temperature?: number;
  equipment?: string[];
  tips?: string;
  images?: string[];
}

export interface RecipePreparationStepCreateRequest {
  menuItemId: string;
  stepNumber: number;
  title: string;
  description: string;
  preparationTime: number;
  cookingTime?: number;
  temperature?: number;
  equipment?: string[];
  tips?: string;
  images?: string[];
}

// Yield y Porciones
export interface RecipeYield extends BaseEntity {
  menuItemId: string;
  baseYield: number; // porciones base
  actualYield: number; // porciones reales
  yieldPercentage: number;
  wastePercentage: number;
  shrinkagePercentage: number;
  lastMeasured: Date;
}

export interface RecipeYieldCreateRequest {
  menuItemId: string;
  baseYield: number;
  actualYield: number;
  wastePercentage?: number;
  shrinkagePercentage?: number;
}

// Filtros y Búsqueda
export interface RecipeIngredientFilters {
  search?: string;
  unit?: string;
  supplier?: string;
  isActive?: boolean;
  lowStock?: boolean;
  allergen?: string;
}

export interface RecipeItemFilters {
  menuItemId?: string;
  ingredientId?: string;
  isOptional?: boolean;
}

// Respuestas de API
export interface RecipeIngredientListResponse {
  ingredients: RecipeIngredient[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RecipeItemListResponse {
  items: RecipeItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Data para UI
export interface RecipeIngredientFormData {
  name: string;
  description: string;
  unit: string;
  currentCost: number;
  supplier: string;
  supplierCode: string;
  minStockLevel: number;
  currentStock: number;
  isActive: boolean;
  allergenInfo: string[];
  storageInfo: string;
  shelfLife: number;
}

export interface RecipeItemFormData {
  ingredientId: string;
  quantity: number;
  unit: string;
  cost: number;
  notes: string;
  isOptional: boolean;
}

export interface RecipeNutritionFormData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
  cholesterol: number;
  servingSize: string;
  allergens: string[];
  dietaryRestrictions: string[];
}

// Enums
export enum FoodCostStatus {
  GOOD = 'good', // < 30%
  WARNING = 'warning', // 30-35%
  CRITICAL = 'critical' // > 35%
}

export enum RecipeUnit {
  GRAM = 'g',
  KILOGRAM = 'kg',
  MILLILITER = 'ml',
  LITER = 'l',
  PIECE = 'pcs',
  TABLESPOON = 'tbsp',
  TEASPOON = 'tsp',
  CUP = 'cup',
  OUNCE = 'oz',
  POUND = 'lb'
}

export enum DietaryRestriction {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  GLUTEN_FREE = 'gluten_free',
  DAIRY_FREE = 'dairy_free',
  NUT_FREE = 'nut_free',
  HALAL = 'halal',
  KOSHER = 'kosher'
}

export enum Allergen {
  MILK = 'milk',
  EGGS = 'eggs',
  FISH = 'fish',
  SHELLFISH = 'shellfish',
  TREE_NUTS = 'tree_nuts',
  PEANUTS = 'peanuts',
  WHEAT = 'wheat',
  SOYBEANS = 'soybeans',
  SESAME = 'sesame'
}

// Utilidades
export interface RecipeStats {
  totalRecipes: number;
  averageFoodCost: number;
  highFoodCostItems: number; // > 35%
  lowMarginItems: number; // < 20%
  totalIngredients: number;
  lowStockIngredients: number;
}
