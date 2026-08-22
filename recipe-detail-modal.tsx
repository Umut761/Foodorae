"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X, Clock, Users, Check, Plus, ChefHat, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tag, MatchMeter, DifficultyBadge } from "@/components/ui/primitives"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import { matchRecipe, totalCookMinutes } from "@/lib/food"
import { CATEGORY_ICON, type Recipe } from "@/lib/types"

export function RecipeDetailModal({
  recipe,
  onClose,
}: {
  recipe: Recipe | null
  onClose: () => void
}) {
  const { data, markUsed, addMissingToShopping } = useStore()
  const { toast } = useToast()

  const match = recipe ? matchRecipe(recipe, data.pantry) : null
  const matchedNames = new Set(
    match?.matchedIngredients.map((m) => m.ingredient.name) ?? [],
  )

  function cookedThis() {
    if (!match) return
    let count = 0
    for (const m of match.matchedIngredients) {
      if (!m.ingredient.isPantryStaple) {
        markUsed(m.pantryItem.id)
        count++
      }
    }
    toast(
      count > 0
        ? `Nice! ${count} ${count === 1 ? "item" : "items"} marked as used`
        : "Enjoy your meal!",
    )
    onClose()
  }

  function addMissing() {
    if (!recipe || !match) return
    const added = addMissingToShopping(
      match.missingIngredients.map((i) => ({
        name: i.name,
        category: i.category,
        quantity: i.quantity,
      })),
      recipe.title,
    )
    toast(
      added > 0
        ? `Added ${added} ${added === 1 ? "item" : "items"} to shopping list`
        : "Already on your shopping list",
      "info",
    )
  }

  return (
    <AnimatePresence>
      {recipe && match ? (
        <div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="relative z-10 max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-line bg-surface md:rounded-3xl"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-surface/95 px-6 pb-4 pt-6 backdrop-blur">
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <ChefHat className="size-4 text-accent" />
                  <span className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink-secondary">
                    {recipe.mealType}
                  </span>
                </div>
                <h2 className="font-serif text-2xl leading-tight text-ink text-balance">
                  {recipe.title}
                </h2>
                <p className="mt-1 text-sm text-ink-secondary text-pretty">
                  {recipe.subtitle}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-1.5 text-ink-secondary transition-colors hover:bg-ground hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex flex-col gap-6 px-6 py-6">
              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-secondary">
                <span className="inline-flex items-center gap-1.5 tnum">
                  <Clock className="size-4" />
                  {totalCookMinutes(recipe)} min
                </span>
                <span className="inline-flex items-center gap-1.5 tnum">
                  <Users className="size-4" />
                  {recipe.servings} servings
                </span>
                <DifficultyBadge difficulty={recipe.difficulty} />
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {recipe.tags.map((t) => (
                  <Tag key={t} variant={t === "Zero Waste Hero" ? "accent" : "neutral"}>
                    {t}
                  </Tag>
                ))}
              </div>

              {/* Match summary */}
              <div className="rounded-2xl bg-ground p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">Pantry match</span>
                  <span className="tnum font-semibold text-ink">
                    {match.matchPercentage}% ·{" "}
                    {match.matchedIngredients.length} of {recipe.ingredients.length}
                  </span>
                </div>
                <MatchMeter percentage={match.matchPercentage} />
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="mb-3 font-serif text-lg text-ink">Ingredients</h3>
                <ul className="flex flex-col gap-2">
                  {recipe.ingredients.map((ing) => {
                    const owned = matchedNames.has(ing.name)
                    return (
                      <li
                        key={ing.name}
                        className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
                      >
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                            owned ? "bg-accent text-surface" : "bg-ground text-ink-secondary"
                          }`}
                        >
                          {owned ? (
                            <Check className="size-3.5" />
                          ) : (
                            <span aria-hidden>{CATEGORY_ICON[ing.category]}</span>
                          )}
                        </span>
                        <span className="flex-1 text-sm text-ink">{ing.name}</span>
                        <span className="tnum text-xs text-ink-secondary">{ing.quantity}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="mb-3 font-serif text-lg text-ink">Method</h3>
                <ol className="flex flex-col gap-3">
                  {recipe.instructions.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="tnum flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                        {i + 1}
                      </span>
                      <p className="pt-0.5 text-sm leading-relaxed text-ink text-pretty">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tip */}
              <div className="flex gap-3 rounded-2xl border border-line bg-warning-soft/60 p-4">
                <Lightbulb className="size-4 shrink-0 text-warning" />
                <p className="text-sm leading-relaxed text-ink text-pretty">{recipe.tips}</p>
              </div>
            </div>

            {/* Sticky actions */}
            <div className="sticky bottom-0 flex gap-3 border-t border-line bg-surface/95 px-6 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
              {match.missingIngredients.length > 0 ? (
                <Button variant="outline" size="lg" className="flex-1" onClick={addMissing}>
                  <Plus className="size-4" />
                  Add {match.missingIngredients.length} missing
                </Button>
              ) : null}
              <Button size="lg" className="flex-1" onClick={cookedThis}>
                <Check className="size-4" />
                I Cooked This
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
