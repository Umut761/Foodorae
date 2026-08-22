export type FoodCategory =
  | "Produce"
  | "Dairy"
  | "Meat & Poultry"
  | "Seafood"
  | "Pantry & Grains"
  | "Bakery"
  | "Frozen"
  | "Beverages"
  | "Condiments"
  | "Snacks"
  | "Other"

export const FOOD_CATEGORIES: FoodCategory[] = [
  "Produce",
  "Dairy",
  "Meat & Poultry",
  "Seafood",
  "Pantry & Grains",
  "Bakery",
  "Frozen",
  "Beverages",
  "Condiments",
  "Snacks",
  "Other",
]

export const CATEGORY_ICON: Record<FoodCategory, string> = {
  Produce: "🥬",
  Dairy: "🥛",
  "Meat & Poultry": "🍗",
  Seafood: "🐟",
  "Pantry & Grains": "🌾",
  Bakery: "🍞",
  Frozen: "❄️",
  Beverages: "🧃",
  Condiments: "🫙",
  Snacks: "🥨",
  Other: "📦",
}

export type UrgencyStatus = "Expired" | "Urgent" | "ExpiringSoon" | "Fresh"

export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  quantity: string
  expirationDate: string // ISO
  addedDate: string // ISO
  notes?: string
  isUsed: boolean
  usedDate?: string // ISO, set when marked used
}

export type Difficulty = "Easy" | "Medium" | "Advanced"

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Quick Snack" | "Baking"

export type RecipeTag =
  | "Vegetarian"
  | "High Protein"
  | "Gluten Free"
  | "Quick & Easy"
  | "Budget Friendly"
  | "Zero Waste Hero"

export interface RecipeIngredient {
  name: string
  quantity: string
  category: FoodCategory
  isPantryStaple: boolean
}

export interface Recipe {
  id: string
  title: string
  subtitle: string
  prepMinutes: number
  cookMinutes: number
  servings: number
  difficulty: Difficulty
  mealType: MealType
  tags: RecipeTag[]
  ingredients: RecipeIngredient[]
  instructions: string[]
  tips: string
}

export interface RecipePantryMatch {
  recipe: Recipe
  matchedIngredients: { ingredient: RecipeIngredient; pantryItem: FoodItem }[]
  missingIngredients: RecipeIngredient[]
  matchPercentage: number
  wasteReductionScore: number
  isCompleteMatch: boolean
}

export interface ShoppingItem {
  id: string
  name: string
  category: FoodCategory
  quantity: string
  isPurchased: boolean
  notes?: string
  recipeSourceTitle?: string
}

export interface UserPreferences {
  alert7Days: boolean
  alert3Days: boolean
  alert1Day: boolean
  alertExpired: boolean
  defaultSort: "expiration" | "name" | "category"
}

export interface AppData {
  pantry: FoodItem[]
  shopping: ShoppingItem[]
  preferences: UserPreferences
  version: number
}
