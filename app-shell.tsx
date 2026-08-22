"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ToastProvider } from "@/components/ui/toast"
import {
  Home,
  Refrigerator,
  ChefHat,
  ShoppingCart,
  Settings,
  Leaf,
} from "lucide-react"

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/pantry", label: "Pantry", icon: Refrigerator },
  { href: "/recipes", label: "Recipes", icon: ChefHat },
  { href: "/shopping", label: "Shopping", icon: ShoppingCart },
  { href: "/settings", label: "Settings", icon: Settings },
]

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname.startsWith(href)
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <ToastProvider>
      <div className="min-h-dvh md:flex">
        {/* Desktop side rail */}
        <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
          <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-accent text-surface">
              <Leaf className="size-5" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-serif text-lg text-ink">Foodorae</span>
              <span className="text-[0.65rem] uppercase tracking-[0.2em] text-ink-secondary">
                FreshMatch
              </span>
            </span>
          </Link>
          <nav className="flex flex-col gap-1">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = isActive(pathname, href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-ink-secondary hover:bg-ground hover:text-ink",
                  )}
                >
                  <Icon className="size-[1.15rem]" />
                  {label}
                </Link>
              )
            })}
          </nav>
          <p className="mt-auto px-3 text-xs leading-relaxed text-ink-secondary text-pretty">
            Works fully offline. Your pantry lives on this device.
          </p>
        </aside>

        {/* Main content */}
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-5 md:max-w-3xl md:px-8 md:pb-10 md:pt-8">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/90 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-2xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[0.65rem] font-medium transition-colors",
                  active ? "text-accent" : "text-ink-secondary",
                )}
              >
                <Icon className={cn("size-5", active && "fill-accent/10")} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>
    </ToastProvider>
  )
}
