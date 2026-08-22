"use client"

import { cn } from "@/lib/utils"
import type { ReactNode } from "react"
import { urgencyTokens } from "@/lib/food"
import type { UrgencyStatus } from "@/lib/types"

export function SectionLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "text-[0.7rem] font-medium uppercase tracking-[0.18em] text-ink-secondary",
        className,
      )}
    >
      {children}
    </p>
  )
}

export function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(31,42,36,0.03)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function UrgencyBadge({
  status,
  label,
  className,
}: {
  status: UrgencyStatus
  label: string
  className?: string
}) {
  const t = urgencyTokens(status)
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tnum",
        t.bg,
        t.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", t.dot)} aria-hidden />
      {label}
    </span>
  )
}

export function Tag({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode
  variant?: "owned" | "missing" | "neutral" | "accent"
  className?: string
}) {
  const styles = {
    owned: "bg-accent-soft text-accent border-transparent",
    missing:
      "bg-transparent text-ink-secondary border-line border-dashed",
    neutral: "bg-ground text-ink-secondary border-line",
    accent: "bg-ink text-surface border-transparent",
  }[variant]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium",
        styles,
        className,
      )}
    >
      {children}
    </span>
  )
}

export function MatchMeter({
  percentage,
  className,
}: {
  percentage: number
  className?: string
}) {
  const color =
    percentage === 100
      ? "bg-accent"
      : percentage >= 60
        ? "bg-warning"
        : "bg-expired"
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-ground", className)}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const map: Record<string, string> = {
    Easy: "text-fresh",
    Medium: "text-warning",
    Advanced: "text-urgent",
  }
  return (
    <span className={cn("text-xs font-medium", map[difficulty] ?? "text-ink-secondary")}>
      {difficulty}
    </span>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-14 text-center">
      {icon ? <div className="mb-3 text-ink-secondary">{icon}</div> : null}
      <p className="font-serif text-xl text-ink">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-xs text-sm text-ink-secondary text-pretty">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
