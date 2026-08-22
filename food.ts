import type {
  FoodItem,
  Recipe,
  RecipeIngredient,
  RecipePantryMatch,
  UrgencyStatus,
} from "./types"

const MS_PER_DAY = 1000 * 60 * 60 * 24

export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function daysRemaining(expirationDate: string): number {
  const exp = new Date(expirationDate)
  exp.setHours(0, 0, 0, 0)
  return Math.round((exp.getTime() - startOfToday().getTime()) / MS_PER_DAY)
}

export function urgencyStatus(expirationDate: string): UrgencyStatus {
  const d = daysRemaining(expirationDate)
  if (d < 0) return "Expired"
  if (d <= 1) return "Urgent"
  if (d <= 3) return "ExpiringSoon"
  return "Fresh"
}

export function expirationLabel(expirationDate: string): string {
  const d = daysRemaining(expirationDate)
  if (d < 0) return `Expired ${Math.abs(d)}d ago`
  if (d === 0) return "Today!"
  if (d === 1) return "Tomorrow!"
  return `${d} days left`
}

/** Tailwind-ready color tokens for a given urgency status. */
export function urgencyTokens(status: UrgencyStatus): {
  text: string
  bg: string
  dot: string
} {
  switch (status) {
    case "Expired":
      return { text: "text-expired", bg: "bg-[var(--accent-soft)]", dot: "bg-expired" }
    case "Urgent":
      return { text: "text-urgent", bg: "bg-urgent-soft", dot: "bg-urgent" }
    case "ExpiringSoon":
      return { text: "text-warning", bg: "bg-warning-soft", dot: "bg-warning" }
    case "Fresh":
      return { text: "text-fresh", bg: "bg-accent-soft", dot: "bg-fresh" }
  }
}

export function activePantry(pantry: FoodItem[]): FoodItem[] {
  return pantry.filter((i) => !i.isUsed)
}

/** Loose token-based match between a recipe ingredient and a pantry item name. */
function nameMatches(ingredientName: string, pantryName: string): boolean {
  const a = ingredientName.toLowerCase().trim()
  const b = pantryName.toLowerCase().trim()
  if (a === b) return true
  if (a.includes(b) || b.includes(a)) return true
  const aTokens = a.split(/\s+/).filter((t) => t.length > 2)
  const bTokens = b.split(/\s+/).filter((t) => t.length > 2)
  return aTokens.some((t) => bTokens.some((u) => u === t || u.includes(t) || t.includes(u)))
}

const URGENCY_WEIGHT: Record<UrgencyStatus, number> = {
  Urgent: 40,
  Expired: 25,
  ExpiringSoon: 20,
  Fresh: 5,
}

export function matchRecipe(recipe: Recipe, pantry: FoodItem[]): RecipePantryMatch {
  const active = activePantry(pantry)
  const matchedIngredients: RecipePantryMatch["matchedIngredients"] = []
  const missingIngredients: RecipeIngredient[] = []

  for (const ing of recipe.ingredients) {
    const found = active.find((p) => nameMatches(ing.name, p.name))
    if (found) {
      matchedIngredients.push({ ingredient: ing, pantryItem: found })
    } else {
      missingIngredients.push(ing)
    }
  }

  const total = recipe.ingredients.length || 1
  const matchPercentage = Math.round((matchedIngredients.length / total) * 100)

  // Waste reduction score: reward matching urgent/expiring items heavily.
  let wasteReductionScore = matchPercentage
  for (const m of matchedIngredients) {
    wasteReductionScore += URGENCY_WEIGHT[urgencyStatus(m.pantryItem.expirationDate)]
  }

  return {
    recipe,
    matchedIngredients,
    missingIngredients,
    matchPercentage,
    wasteReductionScore,
    isCompleteMatch: matchPercentage === 100,
  }
}

export function matchAllRecipes(recipes: Recipe[], pantry: FoodItem[]): RecipePantryMatch[] {
  return recipes.map((r) => matchRecipe(r, pantry))
}

export function totalCookMinutes(recipe: Recipe): number {
  return recipe.prepMinutes + recipe.cookMinutes
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Returns an ISO string for a date N days from today (at local midnight). */
export function isoInDays(days: number): string {
  const d = startOfToday()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

export function formatEditorialDate(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}
