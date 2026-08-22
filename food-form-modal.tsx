"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import {
  FOOD_CATEGORIES,
  CATEGORY_ICON,
  type FoodCategory,
  type FoodItem,
} from "@/lib/types"
import { isoInDays } from "@/lib/food"
import { cn } from "@/lib/utils"

function toDateInput(iso: string): string {
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

export function FoodFormModal({
  open,
  onClose,
  editItem,
}: {
  open: boolean
  onClose: () => void
  editItem?: FoodItem | null
}) {
  const { addFoodItem, updateFoodItem } = useStore()
  const { toast } = useToast()

  const [name, setName] = useState("")
  const [category, setCategory] = useState<FoodCategory>("Produce")
  const [quantity, setQuantity] = useState("")
  const [expiration, setExpiration] = useState(toDateInput(isoInDays(7)))
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (!open) return
    if (editItem) {
      setName(editItem.name)
      setCategory(editItem.category)
      setQuantity(editItem.quantity)
      setExpiration(toDateInput(editItem.expirationDate))
      setNotes(editItem.notes ?? "")
    } else {
      setName("")
      setCategory("Produce")
      setQuantity("")
      setExpiration(toDateInput(isoInDays(7)))
      setNotes("")
    }
  }, [open, editItem])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const expIso = new Date(`${expiration}T00:00:00`).toISOString()
    if (editItem) {
      updateFoodItem(editItem.id, {
        name: name.trim(),
        category,
        quantity: quantity.trim() || "1",
        expirationDate: expIso,
        notes: notes.trim() || undefined,
      })
      toast(`Updated ${name.trim()}`)
    } else {
      addFoodItem({
        name: name.trim(),
        category,
        quantity: quantity.trim() || "1",
        expirationDate: expIso,
        notes: notes.trim() || undefined,
      })
      toast(`Added ${name.trim()} to pantry`)
    }
    onClose()
  }

  return (
    <AnimatePresence>
      {open ? (
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
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="relative z-10 max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 md:rounded-3xl"
          >
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl text-ink">
                  {editItem ? "Edit item" : "Add food"}
                </h2>
                <p className="mt-0.5 text-sm text-ink-secondary">
                  {editItem
                    ? "Update the details for this pantry item."
                    : "Track something new before it slips away."}
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

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Field label="Name">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Baby Spinach"
                  className={inputCls}
                />
              </Field>

              <Field label="Category">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {FOOD_CATEGORIES.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setCategory(c)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-center text-[0.7rem] font-medium transition-colors",
                        category === c
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-line bg-ground text-ink-secondary hover:border-ink/20",
                      )}
                    >
                      <span className="text-base leading-none">{CATEGORY_ICON[c]}</span>
                      <span className="leading-tight">{c}</span>
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Quantity">
                  <input
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="1 tub, 200g…"
                    className={inputCls}
                  />
                </Field>
                <Field label="Expires">
                  <input
                    type="date"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value)}
                    className={cn(inputCls, "tnum")}
                  />
                </Field>
              </div>

              <Field label="Notes (optional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything worth remembering…"
                  rows={2}
                  className={cn(inputCls, "resize-none")}
                />
              </Field>

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button type="submit" size="lg" className="flex-1">
                  {editItem ? "Save changes" : "Add to pantry"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

const inputCls =
  "w-full rounded-xl border border-line bg-ground px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-secondary/60 focus:border-accent focus:bg-surface"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-ink-secondary">
        {label}
      </span>
      {children}
    </label>
  )
}
