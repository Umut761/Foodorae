import type { AppData, FoodItem, ShoppingItem, UserPreferences } from "./types"
import { isoInDays } from "./food"

export const DATA_VERSION = 1

export const DEFAULT_PREFERENCES: UserPreferences = {
  alert7Days: true,
  alert3Days: true,
  alert1Day: true,
  alertExpired: true,
  defaultSort: "expiration",
}

export function seedPantry(): FoodItem[] {
  const addedFallback = isoInDays(-2)
  const items: Omit<FoodItem, "id">[] = [
    {
      name: "Baby Spinach",
      category: "Produce",
      quantity: "1 bag (150g)",
      expirationDate: isoInDays(1),
      addedDate: isoInDays(-2),
      notes: "Getting a little limp — use first.",
      isUsed: false,
    },
    {
      name: "Bananas",
      category: "Produce",
      quantity: "4 pieces",
      expirationDate: isoInDays(1),
      addedDate: isoInDays(-4),
      notes: "Going spotty, great for baking.",
      isUsed: false,
    },
    {
      name: "Whole Milk",
      category: "Dairy",
      quantity: "1 carton",
      expirationDate: isoInDays(2),
      addedDate: isoInDays(-3),
      isUsed: false,
    },
    {
      name: "Chicken Breast",
      category: "Meat & Poultry",
      quantity: "2 fillets",
      expirationDate: isoInDays(2),
      addedDate: isoInDays(-1),
      isUsed: false,
    },
    {
      name: "Eggs",
      category: "Dairy",
      quantity: "6 pieces",
      expirationDate: isoInDays(3),
      addedDate: isoInDays(-5),
      isUsed: false,
    },
    {
      name: "Sourdough Bread",
      category: "Bakery",
      quantity: "1/2 loaf",
      expirationDate: isoInDays(4),
      addedDate: isoInDays(-2),
      notes: "Perfect for French toast.",
      isUsed: false,
    },
    {
      name: "Greek Yogurt",
      category: "Dairy",
      quantity: "1 tub (500g)",
      expirationDate: isoInDays(5),
      addedDate: isoInDays(-1),
      isUsed: false,
    },
    {
      name: "Cheddar Cheese",
      category: "Dairy",
      quantity: "1 block (200g)",
      expirationDate: isoInDays(10),
      addedDate: isoInDays(-6),
      isUsed: false,
    },
    {
      name: "Garlic",
      category: "Produce",
      quantity: "1 bulb",
      expirationDate: isoInDays(21),
      addedDate: isoInDays(-8),
      isUsed: false,
    },
    {
      name: "Olive Oil",
      category: "Condiments",
      quantity: "1 bottle",
      expirationDate: isoInDays(180),
      addedDate: isoInDays(-30),
      isUsed: false,
    },
    {
      name: "Pasta",
      category: "Pantry & Grains",
      quantity: "500g box",
      expirationDate: isoInDays(240),
      addedDate: isoInDays(-20),
      isUsed: false,
    },
    {
      name: "Canned Tomatoes",
      category: "Pantry & Grains",
      quantity: "2 cans",
      expirationDate: isoInDays(365),
      addedDate: isoInDays(-15),
      isUsed: false,
    },
  ]
  void addedFallback
  return items.map((item, idx) => ({ ...item, id: `seed-${idx}` }))
}

export function seedShopping(): ShoppingItem[] {
  return [
    { id: "shop-0", name: "Feta Cheese", category: "Dairy", quantity: "1 block", isPurchased: false },
    { id: "shop-1", name: "Fresh Basil", category: "Produce", quantity: "1 bunch", isPurchased: false },
    { id: "shop-2", name: "Rolled Oats", category: "Pantry & Grains", quantity: "1 bag", isPurchased: true },
  ]
}

export function seedAppData(): AppData {
  return {
    pantry: seedPantry(),
    shopping: seedShopping(),
    preferences: { ...DEFAULT_PREFERENCES },
    version: DATA_VERSION,
  }
}
