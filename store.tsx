"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type {
  AppData,
  FoodItem,
  ShoppingItem,
  UserPreferences,
} from "./types"
import { seedAppData, DEFAULT_PREFERENCES, DATA_VERSION } from "./seed"
import { isoInDays, uid } from "./food"

const STORAGE_KEY = "foodorae:data:v1"

interface StoreValue {
  data: AppData
  hydrated: boolean
  // pantry
  addFoodItem: (item: Omit<FoodItem, "id" | "addedDate" | "isUsed">) => void
  updateFoodItem: (id: string, patch: Partial<FoodItem>) => void
  deleteFoodItem: (id: string) => void
  markUsed: (id: string) => void
  restoreUsed: (id: string) => void
  adjustQuantityNote: (id: string, delta: number) => void
  // shopping
  addShoppingItem: (item: Omit<ShoppingItem, "id" | "isPurchased">) => void
  togglePurchased: (id: string) => void
  deleteShoppingItem: (id: string) => void
  moveCheckedToPantry: () => number
  addMissingToShopping: (
    items: { name: string; category: FoodItem["category"]; quantity: string }[],
    recipeTitle: string,
  ) => number
  // preferences + data mgmt
  updatePreferences: (patch: Partial<UserPreferences>) => void
  exportJSON: () => string
  importSampleData: () => void
  resetPantry: () => void
}

const StoreContext = createContext<StoreValue | null>(null)

function loadInitial(): AppData {
  return seedAppData()
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(loadInitial)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from localStorage on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AppData
        if (parsed && Array.isArray(parsed.pantry)) {
          setData({
            pantry: parsed.pantry,
            shopping: parsed.shopping ?? [],
            preferences: { ...DEFAULT_PREFERENCES, ...parsed.preferences },
            version: parsed.version ?? DATA_VERSION,
          })
        }
      }
    } catch {
      // ignore corrupt storage, keep seed
    }
    setHydrated(true)
  }, [])

  // Persist whenever data changes (after hydration).
  useEffect(() => {
    if (!hydrated) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // storage full / unavailable — app still works in-memory
    }
  }, [data, hydrated])

  const addFoodItem = useCallback<StoreValue["addFoodItem"]>((item) => {
    setData((prev) => ({
      ...prev,
      pantry: [
        { ...item, id: uid(), addedDate: new Date().toISOString(), isUsed: false },
        ...prev.pantry,
      ],
    }))
  }, [])

  const updateFoodItem = useCallback<StoreValue["updateFoodItem"]>((id, patch) => {
    setData((prev) => ({
      ...prev,
      pantry: prev.pantry.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }))
  }, [])

  const deleteFoodItem = useCallback<StoreValue["deleteFoodItem"]>((id) => {
    setData((prev) => ({ ...prev, pantry: prev.pantry.filter((i) => i.id !== id) }))
  }, [])

  const markUsed = useCallback<StoreValue["markUsed"]>((id) => {
    setData((prev) => ({
      ...prev,
      pantry: prev.pantry.map((i) =>
        i.id === id ? { ...i, isUsed: true, usedDate: new Date().toISOString() } : i,
      ),
    }))
  }, [])

  const restoreUsed = useCallback<StoreValue["restoreUsed"]>((id) => {
    setData((prev) => ({
      ...prev,
      pantry: prev.pantry.map((i) =>
        i.id === id ? { ...i, isUsed: false, usedDate: undefined } : i,
      ),
    }))
  }, [])

  // Adjust the leading number inside a quantity string (best-effort).
  const adjustQuantityNote = useCallback<StoreValue["adjustQuantityNote"]>((id, delta) => {
    setData((prev) => ({
      ...prev,
      pantry: prev.pantry.map((i) => {
        if (i.id !== id) return i
        const match = i.quantity.match(/(\d+(?:\.\d+)?)/)
        if (!match) return i
        const current = parseFloat(match[1])
        const next = Math.max(0, current + delta)
        const nextStr = Number.isInteger(next) ? String(next) : next.toFixed(1)
        return { ...i, quantity: i.quantity.replace(match[1], nextStr) }
      }),
    }))
  }, [])

  const addShoppingItem = useCallback<StoreValue["addShoppingItem"]>((item) => {
    setData((prev) => ({
      ...prev,
      shopping: [{ ...item, id: uid(), isPurchased: false }, ...prev.shopping],
    }))
  }, [])

  const togglePurchased = useCallback<StoreValue["togglePurchased"]>((id) => {
    setData((prev) => ({
      ...prev,
      shopping: prev.shopping.map((i) =>
        i.id === id ? { ...i, isPurchased: !i.isPurchased } : i,
      ),
    }))
  }, [])

  const deleteShoppingItem = useCallback<StoreValue["deleteShoppingItem"]>((id) => {
    setData((prev) => ({ ...prev, shopping: prev.shopping.filter((i) => i.id !== id) }))
  }, [])

  const moveCheckedToPantry = useCallback<StoreValue["moveCheckedToPantry"]>(() => {
    let moved = 0
    setData((prev) => {
      const checked = prev.shopping.filter((i) => i.isPurchased)
      moved = checked.length
      if (moved === 0) return prev
      const newPantry: FoodItem[] = checked.map((s) => ({
        id: uid(),
        name: s.name,
        category: s.category,
        quantity: s.quantity || "1",
        expirationDate: isoInDays(7),
        addedDate: new Date().toISOString(),
        notes: s.notes,
        isUsed: false,
      }))
      return {
        ...prev,
        pantry: [...newPantry, ...prev.pantry],
        shopping: prev.shopping.filter((i) => !i.isPurchased),
      }
    })
    return moved
  }, [])

  const addMissingToShopping = useCallback<StoreValue["addMissingToShopping"]>(
    (items, recipeTitle) => {
      let added = 0
      setData((prev) => {
        const existingNames = new Set(
          prev.shopping.map((s) => s.name.toLowerCase().trim()),
        )
        const toAdd: ShoppingItem[] = []
        for (const it of items) {
          if (existingNames.has(it.name.toLowerCase().trim())) continue
          toAdd.push({
            id: uid(),
            name: it.name,
            category: it.category,
            quantity: it.quantity,
            isPurchased: false,
            recipeSourceTitle: recipeTitle,
          })
          existingNames.add(it.name.toLowerCase().trim())
        }
        added = toAdd.length
        if (added === 0) return prev
        return { ...prev, shopping: [...toAdd, ...prev.shopping] }
      })
      return added
    },
    [],
  )

  const updatePreferences = useCallback<StoreValue["updatePreferences"]>((patch) => {
    setData((prev) => ({ ...prev, preferences: { ...prev.preferences, ...patch } }))
  }, [])

  const exportJSON = useCallback<StoreValue["exportJSON"]>(() => {
    return JSON.stringify(data, null, 2)
  }, [data])

  const importSampleData = useCallback<StoreValue["importSampleData"]>(() => {
    setData(seedAppData())
  }, [])

  const resetPantry = useCallback<StoreValue["resetPantry"]>(() => {
    setData((prev) => ({
      ...prev,
      pantry: [],
      shopping: [],
    }))
  }, [])

  const value = useMemo<StoreValue>(
    () => ({
      data,
      hydrated,
      addFoodItem,
      updateFoodItem,
      deleteFoodItem,
      markUsed,
      restoreUsed,
      adjustQuantityNote,
      addShoppingItem,
      togglePurchased,
      deleteShoppingItem,
      moveCheckedToPantry,
      addMissingToShopping,
      updatePreferences,
      exportJSON,
      importSampleData,
      resetPantry,
    }),
    [
      data,
      hydrated,
      addFoodItem,
      updateFoodItem,
      deleteFoodItem,
      markUsed,
      restoreUsed,
      adjustQuantityNote,
      addShoppingItem,
      togglePurchased,
      deleteShoppingItem,
      moveCheckedToPantry,
      addMissingToShopping,
      updatePreferences,
      exportJSON,
      importSampleData,
      resetPantry,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
