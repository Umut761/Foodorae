"use client"

import { AnimatePresence, motion } from "framer-motion"
import { X, RotateCcw, Leaf } from "lucide-react"
import { useStore } from "@/lib/store"
import { CATEGORY_ICON, type FoodItem } from "@/lib/types"

export function HistorySheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { data, restoreUsed } = useStore()
  const used = data.pantry
    .filter((i) => i.isUsed)
    .sort((a, b) => +new Date(b.usedDate ?? 0) - +new Date(a.usedDate ?? 0))

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 34 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-line bg-surface"
          >
            <div className="flex items-start justify-between border-b border-line px-6 py-5">
              <div>
                <h2 className="font-serif text-2xl text-ink">Rescued history</h2>
                <p className="mt-0.5 text-sm text-ink-secondary">
                  Everything you cooked or used in time.
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

            {/* Impact banner */}
            <div className="mx-6 mt-5 flex items-center gap-4 rounded-2xl bg-accent-soft p-5">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent text-surface">
                <Leaf className="size-6" />
              </span>
              <div>
                <p className="font-serif text-3xl tnum text-accent">{used.length}</p>
                <p className="text-sm font-medium text-ink">items rescued from waste</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {used.length === 0 ? (
                <p className="mt-8 text-center text-sm text-ink-secondary">
                  Nothing rescued yet. Mark items as used to build your streak.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {used.map((item) => (
                    <HistoryRow key={item.id} item={item} onRestore={() => restoreUsed(item.id)} />
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}

function HistoryRow({ item, onRestore }: { item: FoodItem; onRestore: () => void }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-ground px-3.5 py-3">
      <span className="text-lg" aria-hidden>
        {CATEGORY_ICON[item.category]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-ink line-through decoration-expired/50">
          {item.name}
        </p>
        <p className="text-xs text-ink-secondary">
          {item.usedDate
            ? new Date(item.usedDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "Used"}
        </p>
      </div>
      <button
        onClick={onRestore}
        aria-label={`Restore ${item.name}`}
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-ink-secondary transition-colors hover:bg-surface hover:text-ink"
      >
        <RotateCcw className="size-3.5" />
        Restore
      </button>
    </li>
  )
}
