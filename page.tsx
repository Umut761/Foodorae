"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Plus, Flame, Check, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, SectionLabel, Tag, MatchMeter } from "@/components/ui/primitives"
import { FoodFormModal } from "@/components/food-form-modal"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeDetailModal } from "@/components/recipe-detail-modal"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import { RECIPES } from "@/lib/recipes"
import {
  activePantry,
  matchAllRecipes,
  urgencyStatus,
  expirationLabel,
  daysRemaining,
  formatEditorialDate,
  totalCookMinutes,
} from "@/lib/food"
import { CATEGORY_ICON, type Recipe } from "@/lib/types"

export default function HomePage() {
  const { data, hydrated, markUsed, addMissingToShopping } = useStore()
  const { toast } = useToast()
  const [addOpen, setAddOpen] = useState(false)
  const [openRecipe, setOpenRecipe] = useState<Recipe | null>(null)

  const active = useMemo(() => activePantry(data.pantry), [data.pantry])

  const urgentCount = active.filter((i) => daysRemaining(i.expirationDate) <= 2).length
  const safeCount = active.filter((i) => {
    const d = daysRemaining(i.expirationDate)
    return d >= 3 && d <= 7
  }).length

  const matches = useMemo(
    () =>
      matchAllRecipes(RECIPES, data.pantry).sort(
        (a, b) => b.wasteReductionScore - a.wasteReductionScore,
      ),
    [data.pantry],
  )
  const spotlight = matches[0]
  const feed = matches.slice(1, 5)

  const expiringSoon = useMemo(
    () =>
      [...active]
        .filter((i) => daysRemaining(i.expirationDate) <= 3)
        .sort((a, b) => daysRemaining(a.expirationDate) - daysRemaining(b.expirationDate)),
    [active],
  )

  const recentlyAdded = useMemo(
    () =>
      [...active]
        .sort((a, b) => +new Date(b.addedDate) - +new Date(a.addedDate))
        .slice(0, 4),
    [active],
  )

  if (!hydrated) return <LoadingSkeleton />

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-secondary tnum">{formatEditorialDate()}</p>
          <h1 className="mt-1 font-serif text-3xl leading-tight text-ink text-balance md:text-4xl">
            Eat it before
            <br />
            you lose it.
          </h1>
        </div>
        <Button size="lg" onClick={() => setAddOpen(true)} className="shrink-0">
          <Plus className="size-4" />
          Add Food
        </Button>
      </header>

      {/* Urgency radar */}
      <section aria-label="Urgency overview" className="grid grid-cols-3 gap-3">
        <StatCard label="Urgent" value={urgentCount} hint="< 3 days" tone="urgent" />
        <StatCard label="Safe" value={safeCount} hint="4–7 days" tone="fresh" />
        <StatCard label="Tracked" value={active.length} hint="total items" tone="ink" />
      </section>

      {/* Spotlight */}
      {spotlight ? (
        <section aria-label="Use it first spotlight">
          <SectionLabel className="mb-3">Use it first · Spotlight</SectionLabel>
          <Card className="overflow-hidden">
            <div className="bg-ink px-5 py-4 text-surface">
              <div className="flex items-center gap-2 text-[var(--accent)]">
                <Flame className="size-4" />
                <span className="text-[0.7rem] font-medium uppercase tracking-[0.16em]">
                  Cooks your most urgent items
                </span>
              </div>
              <h2 className="mt-2 font-serif text-2xl leading-tight text-balance">
                {spotlight.recipe.title}
              </h2>
              <p className="mt-1 text-sm text-surface/70 text-pretty">
                {spotlight.recipe.subtitle}
              </p>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-ink tnum">
                  {spotlight.matchPercentage}% pantry match
                </span>
                <span className="tnum text-ink-secondary">
                  {totalCookMinutes(spotlight.recipe)} min ·{" "}
                  {spotlight.recipe.difficulty}
                </span>
              </div>
              <MatchMeter percentage={spotlight.matchPercentage} />
              <div className="mt-3 flex flex-wrap gap-1.5">
                {spotlight.matchedIngredients.slice(0, 5).map((m) => (
                  <Tag key={m.ingredient.name} variant="owned">
                    {m.ingredient.name}
                  </Tag>
                ))}
                {spotlight.missingIngredients.slice(0, 2).map((i) => (
                  <Tag key={i.name} variant="missing">
                    {i.name}
                  </Tag>
                ))}
              </div>
              <Button
                size="lg"
                className="mt-4 w-full"
                onClick={() => setOpenRecipe(spotlight.recipe)}
              >
                <Sparkles className="size-4" />
                Cook Tonight
              </Button>
            </div>
          </Card>
        </section>
      ) : null}

      {/* Expiring soon carousel */}
      {expiringSoon.length > 0 ? (
        <section aria-label="Expiring soon">
          <SectionLabel className="mb-3">Expiring soon · Act fast</SectionLabel>
          <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            {expiringSoon.map((item) => {
              const status = urgencyStatus(item.expirationDate)
              return (
                <motion.div
                  layout
                  key={item.id}
                  className="w-44 shrink-0 rounded-2xl border border-line bg-surface p-4"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl" aria-hidden>
                      {CATEGORY_ICON[item.category]}
                    </span>
                    <span
                      className={`text-[0.7rem] font-semibold ${
                        status === "Urgent" || status === "Expired"
                          ? "text-urgent"
                          : "text-warning"
                      }`}
                    >
                      {expirationLabel(item.expirationDate)}
                    </span>
                  </div>
                  <p className="mt-2 truncate font-medium text-ink">{item.name}</p>
                  <p className="tnum text-xs text-ink-secondary">{item.quantity}</p>
                  <button
                    onClick={() => {
                      markUsed(item.id)
                      toast(`Rescued ${item.name}!`)
                    }}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-accent-soft py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent hover:text-surface"
                  >
                    <Check className="size-3.5" />
                    Mark used
                  </button>
                </motion.div>
              )
            })}
          </div>
        </section>
      ) : null}

      {/* Suggested recipes */}
      {feed.length > 0 ? (
        <section aria-label="Suggested recipes">
          <SectionLabel className="mb-3">Suggested for your pantry</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            {feed.map((m) => (
              <RecipeCard
                key={m.recipe.id}
                match={m}
                onOpen={() => setOpenRecipe(m.recipe)}
                onAddMissing={() => {
                  const added = addMissingToShopping(
                    m.missingIngredients.map((i) => ({
                      name: i.name,
                      category: i.category,
                      quantity: i.quantity,
                    })),
                    m.recipe.title,
                  )
                  toast(
                    added > 0
                      ? `Added ${added} to shopping list`
                      : "Already on your list",
                    "info",
                  )
                }}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Recently added */}
      {recentlyAdded.length > 0 ? (
        <section aria-label="Recently added">
          <SectionLabel className="mb-3">Recently added</SectionLabel>
          <div className="flex flex-col gap-2">
            {recentlyAdded.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <span className="text-lg" aria-hidden>
                  {CATEGORY_ICON[item.category]}
                </span>
                <span className="flex-1 truncate text-sm font-medium text-ink">
                  {item.name}
                </span>
                <span className="tnum text-xs text-ink-secondary">
                  {expirationLabel(item.expirationDate)}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <FoodFormModal open={addOpen} onClose={() => setAddOpen(false)} />
      <RecipeDetailModal recipe={openRecipe} onClose={() => setOpenRecipe(null)} />
    </div>
  )
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: number
  hint: string
  tone: "urgent" | "fresh" | "ink"
}) {
  const toneCls = {
    urgent: "text-urgent",
    fresh: "text-fresh",
    ink: "text-ink",
  }[tone]
  return (
    <Card className="p-4">
      <p className={`font-serif text-3xl tnum ${toneCls}`}>{value}</p>
      <p className="mt-1 text-sm font-medium text-ink">{label}</p>
      <p className="text-xs text-ink-secondary">{hint}</p>
    </Card>
  )
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-16 w-2/3 animate-pulse rounded-2xl bg-surface" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-surface" />
    </div>
  )
}
