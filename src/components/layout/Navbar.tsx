"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@/hooks/useUser"
import { useCredits } from "@/hooks/useCredits"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  Sparkles,
  Menu,
  X,
  CreditCard,
  LogOut,
  User,
  Settings,
  LayoutDashboard,
  Sun,
  Moon,
} from "lucide-react"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/pricing", label: "Pricing" },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { user, loading } = useUser()
  const { credits } = useCredits()
  const { theme, setTheme } = useTheme()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            <span className="text-xl font-bold tracking-tight text-zinc-100">
              Aura<span className="text-purple-500">AI</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === link.href
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="hidden md:flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {loading ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-zinc-800" />
          ) : user ? (
            <>
              <Link
                href="/pricing"
                className="hidden sm:flex items-center gap-1.5 rounded-lg bg-purple-500/10 px-3 py-1.5 text-sm font-medium text-purple-400 hover:bg-purple-500/20 transition-all duration-200"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>{credits.toLocaleString()} credits</span>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg p-1 hover:bg-zinc-800 transition-all duration-200">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${user.email}`}
                        alt={user.email}
                      />
                      <AvatarFallback className="text-xs">
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-zinc-100 truncate">
                        {user.email}
                      </span>
                      <span className="text-xs text-zinc-500 font-normal">
                        {credits.toLocaleString()} credits remaining
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/generations" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      My Generations
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/login?signout=true" className="cursor-pointer text-red-400 focus:text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-800 bg-zinc-950 md:hidden">
          <div className="space-y-1 px-4 py-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  pathname === link.href
                    ? "text-purple-400 bg-purple-500/10"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-zinc-800">
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 rounded-lg transition-all duration-200"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
