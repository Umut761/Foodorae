"use client"

import { motion } from "framer-motion"
import { Minus, Plus, Check, Trash2, Pencil } from "lucide-react"
import { UrgencyBadge } from "@/components/ui/primitives"
import { useStore } from "@/lib/store"
import { useToast } from "@/components/ui/toast"
import {
  urgencyStatus,
  expirationLabel,
} from "@/lib/food"
import { CATEGORY_ICON, type FoodItem } from "@/lib/types"

export function PantryItemRow({
  item,
  onEdit,
}: {
  item: FoodItem
  onEdit: (item: FoodItem) => void
}) {
  const { markUsed, deleteFoodItem, adjustQuantityNote } = useStore()
  const { toast } = useToast()
  const status = urgencyStatus(item.expirationDate)
  const hasNumber = /\d/.test(item.quantity)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3.5"
    >
      <span
        className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-ground text-xl"
        aria-hidden
      >
        {CATEGORY_ICON[item.category]}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium text-ink">{item.name}</p>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-secondary">
          <span className="tnum">{item.quantity}</span>
          <span aria-hidden>·</span>
          <UrgencyBadge status={status} label={expirationLabel(item.expirationDate)} />
        </div>
        {item.notes ? (
          <p className="mt-1 truncate text-xs italic text-ink-secondary">{item.notes}</p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        {hasNumber ? (
          <div className="flex items-center rounded-full border border-line">
            <button
              onClick={() => adjustQuantityNote(item.id, -1)}
              aria-label={`Decrease ${item.name} quantity`}
              className="p-1.5 text-ink-secondary transition-colors hover:text-ink"
            >
              <Minus className="size-3.5" />
            </button>
            <button
              onClick={() => adjustQuantityNote(item.id, 1)}
              aria-label={`Increase ${item.name} quantity`}
              className="p-1.5 text-ink-secondary transition-colors hover:text-ink"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        ) : null}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(item)}
            aria-label={`Edit ${item.name}`}
            className="rounded-full p-1.5 text-ink-secondary transition-colors hover:bg-ground hover:text-ink"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => {
              deleteFoodItem(item.id)
              toast(`Removed ${item.name}`, "info")
            }}
            aria-label={`Delete ${item.name}`}
            className="rounded-full p-1.5 text-ink-secondary transition-colors hover:bg-urgent-soft hover:text-urgent"
          >
            <Trash2 className="size-4" />
          </button>
          <button
            onClick={() => {
              markUsed(item.id)
              toast(`Rescued ${item.name}!`)
            }}
            aria-label={`Mark ${item.name} as used`}
            className="rounded-full bg-accent-soft p-1.5 text-accent transition-colors hover:bg-accent hover:text-surface"
          >
            <Check className="size-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
