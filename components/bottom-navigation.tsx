"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Disc2,
  ChartBar,
  Box,
  Pointer,
  Users,
  Settings2,
  User2,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const mainLinks = [
  { href: "/home", label: "Dashboard", icon: LayoutDashboard },
  { href: "/promo", label: "Promo", icon: Disc2 },
  { href: "/produk", label: "Produk", icon: Box },
  { href: "/pilihan", label: "Pilihan", icon: ChartBar },
]

const moreLinks = [
  { href: "/poin", label: "Poin", icon: Pointer },
  { href: "/pelanggan", label: "Pelanggan", icon: Users },
  { href: "/staf", label: "Staf", icon: User2 },
  { href: "/settings", label: "Pengaturan", icon: Settings2 },
]

export function BottomNavigation() {
  const pathname = usePathname()
  const [showMore, setShowMore] = useState(false)

  return (
    <>
      {/* Overlay backdrop */}
      {showMore && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-in fade-in duration-200"
          onClick={() => setShowMore(false)}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.15)] rounded-t-2xl">
        {/* Expandable "More" panel */}
        <div
          className={cn(
            "grid transition-all duration-300 ease-in-out bg-background rounded-t-2xl",
            showMore
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-5 py-3 px-1 gap-y-3 border-b border-border">
              {moreLinks.map((link) => {
                const Icon = link.icon
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setShowMore(false)}
                    className={cn(
                      "flex flex-col items-center justify-center w-16 mx-auto py-1.5 rounded-xl transition-all duration-200",
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5 mb-1",
                        isActive ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[9px] font-medium text-center leading-tight",
                        isActive
                          ? "text-primary font-semibold"
                          : "text-muted-foreground"
                      )}
                    >
                      {link.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Main bottom bar */}
        <div className="grid grid-cols-5 py-2 px-1 relative z-10 bg-background rounded-t-2xl">
          {mainLinks.map((link) => {
            const Icon = link.icon
            const isActive =
              pathname === link.href ||
              (link.href !== "/home" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center w-16 mx-auto py-1 rounded-xl transition-all duration-200 relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-5 h-5 mb-1",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[9px] font-medium text-center leading-tight",
                    isActive
                      ? "text-primary font-semibold"
                      : "text-muted-foreground"
                  )}
                >
                  {link.label}
                </span>
              </Link>
            )
          })}

          {/* "More" button */}
          <button
            onClick={() => setShowMore(!showMore)}
            className={cn(
              "flex flex-col items-center justify-center w-16 mx-auto py-1 rounded-xl transition-all duration-200",
              showMore
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Menu className="w-5 h-5 mb-1" />
            <span
              className={cn(
                "text-[9px] font-medium text-center leading-tight",
                showMore
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              )}
            >
              Lainnya
            </span>
          </button>
        </div>
      </nav>
    </>
  )
}
