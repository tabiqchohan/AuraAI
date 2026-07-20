"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { useCredits } from "@/hooks/useCredits"
import { cn } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Images,
  History,
  Bookmark,
  CreditCard,
  Settings,
  Shield,
  Sparkles,
  ChevronLeft,
  PanelRightOpen,
  User,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/gallery", label: "Gallery", icon: Images },
  { href: "/dashboard/generations", label: "My Generations", icon: History },
  { href: "/dashboard/prompts", label: "Saved Prompts", icon: Bookmark },
]

const bottomItems = [
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
]

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { user } = useUser()
  const { credits } = useCredits()

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed left-4 top-20 z-40 flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 lg:hidden"
      >
        <PanelRightOpen className="h-4 w-4" />
      </button>

      {collapsed && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setCollapsed(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-full flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-300",
          collapsed ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0 lg:w-60",
          className
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b border-zinc-800 px-4">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span className="text-lg font-bold tracking-tight text-zinc-100">
              Aura<span className="text-purple-500">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setCollapsed(false)}
            className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 lg:hidden"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setCollapsed(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}

          <Separator className="my-3" />

          {bottomItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setCollapsed(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}

          {user?.is_admin && (
            <>
              <Separator className="my-3" />
              <Link
                href="/admin"
                onClick={() => setCollapsed(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  pathname.startsWith("/admin")
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                <Shield className="h-4 w-4 shrink-0" />
                Admin Panel
              </Link>
            </>
          )}
        </nav>

        <div className="border-t border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage
                src={`https://avatar.vercel.sh/${user?.email || "user"}`}
                alt={user?.email || "User"}
              />
              <AvatarFallback className="text-xs">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">
                {user?.email || "Guest"}
              </p>
              <p className="text-xs text-purple-400">
                {credits.toLocaleString()} credits
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
