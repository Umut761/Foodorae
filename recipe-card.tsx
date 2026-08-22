"use client"

import { Clock, Plus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, Tag, MatchMeter, DifficultyBadge } from "@/components/ui/primitives"
import { totalCookMinutes } from "@/lib/food"
import type { RecipePantryMatch } from "@/lib/types"

export function RecipeCard({
  match,
  onOpen,
  onAddMissing,
}: {
  match: RecipePantryMatch
  onOpen: () => void
  onAddMissing: () => void
}) {
  const { recipe } = match
  const ownedNames = match.matchedIngredients.map((m) => m.ingredient.name)

  return (
    <Card className="flex flex-col p-5">
      <button onClick={onOpen} className="text-left">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-ink-secondary">
            {recipe.mealType}
          </span>
          {match.isCompleteMatch ? (
            <span className="rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold text-surface">
              Ready to cook
            </span>
          ) : null}
        </div>
        <h3 className="font-serif text-xl leading-tight text-ink text-balance">
          {recipe.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-secondary text-pretty">
          {recipe.subtitle}
        </p>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-secondary">
        <span className="inline-flex items-center gap-1.5 tnum">
          <Clock className="size-4" />
          {totalCookMinutes(recipe)} min
        </span>
        <DifficultyBadge difficulty={recipe.difficulty} />
      </div>

      {/* Match meter */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="font-medium text-ink">
            <span className="tnum">{match.matchPercentage}%</span> Match
          </span>
          <span className="tnum text-ink-secondary">
            {match.matchedIngredients.length} of {recipe.ingredients.length} ingredients
          </span>
        </div>
        <MatchMeter percentage={match.matchPercentage} />
      </div>

      {/* Ingredient breakdown */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {ownedNames.slice(0, 4).map((n) => (
          <Tag key={n} variant="owned">
            {n}
          </Tag>
        ))}
        {match.missingIngredients.slice(0, 3).map((i) => (
          <Tag key={i.name} variant="missing">
            {i.name}
          </Tag>
        ))}
        {ownedNames.length + match.missingIngredients.length > 7 ? (
          <Tag variant="neutral">
            +{ownedNames.length + match.missingIngredients.length - 7}
          </Tag>
        ) : null}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {match.missingIngredients.length > 0 ? (
          <Button variant="outline" size="sm" className="flex-1" onClick={onAddMissing}>
            <Plus className="size-3.5" />
            Add {match.missingIngredients.length} missing
          </Button>
        ) : null}
        <Button
          variant={match.missingIngredients.length > 0 ? "secondary" : "default"}
          size="sm"
          className="flex-1"
          onClick={onOpen}
        >
          View recipe
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </Card>
  )
}
