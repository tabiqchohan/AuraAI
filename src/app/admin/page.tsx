"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import {
  Users, Image as ImageIcon, CreditCard, DollarSign, Search, Loader2, Plus, Pencil, Trash2,
  CheckCircle2, XCircle, VideoIcon, Sparkles, Tag, Shield, ShieldOff, Cpu,
  ScrollText, Mail, Flag, Download, Gauge, ToggleLeft, Ban, Unlock, LayoutDashboard, TrendingUp,
  Activity, UserCheck, Eye, EyeOff, Send, Clock,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useUser } from "@/hooks/useUser"
import { toast } from "sonner"
import type { User, Generation, Coupon, SystemLog, FeatureFlag, RateLimit, AdminModel } from "@/types"
import { formatDate, formatCredits } from "@/lib/utils"

function getSupabase() {
  if (typeof window === "undefined") return null
  try { return createClient() } catch { return null }
}

interface AdminStats {
  totalUsers: number; totalGenerations: number; activeSubscriptions: number; totalRevenue: number
}

type TabId = "overview" | "users" | "generations" | "coupons" | "revenue" | "models" | "logs" | "email" | "moderation" | "export" | "ratelimits" | "features"

const tabConfig: { id: TabId; label: string; icon: any; color: string; desc: string }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, color: "from-purple-500 to-pink-500", desc: "Platform at a glance" },
  { id: "users", label: "Users", icon: Users, color: "from-blue-500 to-cyan-500", desc: "Manage accounts" },
  { id: "generations", label: "Generations", icon: Activity, color: "from-violet-500 to-purple-500", desc: "AI content" },
  { id: "revenue", label: "Revenue", icon: TrendingUp, color: "from-emerald-500 to-teal-500", desc: "Earnings" },
  { id: "models", label: "Models", icon: Cpu, color: "from-orange-500 to-red-500", desc: "AI engines" },
  { id: "moderation", label: "Moderation", icon: Flag, color: "from-rose-500 to-pink-500", desc: "Flagged content" },
  { id: "logs", label: "Logs", icon: ScrollText, color: "from-zinc-500 to-zinc-400", desc: "Activity trail" },
  { id: "email", label: "Email", icon: Mail, color: "from-sky-500 to-indigo-500", desc: "Broadcast" },
  { id: "ratelimits", label: "Rate Limits", icon: Gauge, color: "from-amber-500 to-yellow-500", desc: "Throttling" },
  { id: "features", label: "Features", icon: ToggleLeft, color: "from-lime-500 to-green-500", desc: "Feature flags" },
  { id: "export", label: "Export", icon: Download, color: "from-slate-500 to-zinc-500", desc: "Data export" },
  { id: "coupons", label: "Coupons", icon: Tag, color: "from-fuchsia-500 to-purple-500", desc: "Discounts" },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
}

function StatSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      <div className="h-4 w-24 bg-zinc-800 rounded" />
      <div className="h-8 w-32 bg-zinc-800 rounded" />
    </div>
  )
}

function PremiumBadge({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) {
  const styles: Record<string, string> = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    destructive: "bg-red-500/10 text-red-400 border-red-500/20",
    default: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    secondary: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    premium: "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/20",
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles[variant] || styles.default}`}>
      {children}
    </span>
  )
}

function PremiumCard({ children, className = "", gradient = false }: { children: React.ReactNode; className?: string; gradient?: boolean }) {
  return (
    <div className={`relative group ${className}`}>
      <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r from-purple-500/10 via-purple-500/5 to-pink-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient ? "opacity-100" : ""}`} />
      <Card className={`relative border-zinc-800/50 bg-zinc-900/60 backdrop-blur-sm overflow-hidden ${gradient ? "bg-gradient-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-900/80" : ""}`}>
        {children}
      </Card>
    </div>
  )
}

export default function AdminPageContent() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  useEffect(() => {
    if (!userLoading && (!user || !user.is_admin)) router.push("/dashboard")
  }, [user, userLoading, router])

  if (userLoading || !user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-3xl opacity-20 animate-pulse" />
          <Loader2 className="relative h-10 w-10 animate-spin text-purple-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
                Admin Panel
              </h1>
            </div>
            <p className="text-zinc-600 ml-11 text-sm">Manage your AuraAI platform</p>
          </div>
          <div className="flex items-center gap-3">
            <PremiumBadge variant="premium">
              <Shield className="h-3 w-3" />
              Admin
            </PremiumBadge>
            <Badge variant="outline" className="border-zinc-700 text-zinc-500 text-xs">{user.email}</Badge>
          </div>
        </div>

        <LayoutGroup>
          <div className="flex flex-wrap gap-1.5 mb-8 p-1.5 bg-zinc-900/50 backdrop-blur-sm border border-zinc-800/30 rounded-2xl w-fit">
            {tabConfig.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-zinc-800/80 text-zinc-100 shadow-lg shadow-black/20"
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="tab-bg"
                      className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/10 border border-purple-500/10"
                      transition={{ type: "spring" as const, stiffness: 380, damping: 30 }}
                    />
                  )}
                  <div className="relative z-10 flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${isActive ? "text-purple-400" : ""}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </LayoutGroup>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && <OverviewTab />}
            {activeTab === "users" && <UsersTab />}
            {activeTab === "generations" && <GenerationsTab />}
            {activeTab === "coupons" && <CouponsTab />}
            {activeTab === "revenue" && <RevenueTab />}
            {activeTab === "models" && <ModelsTab />}
            {activeTab === "logs" && <LogsTab />}
            {activeTab === "email" && <EmailTab />}
            {activeTab === "moderation" && <ModerationTab />}
            {activeTab === "export" && <ExportTab />}
            {activeTab === "ratelimits" && <RateLimitsTab />}
            {activeTab === "features" && <FeaturesTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

function OverviewTab() {
  const [supabase] = useState(getSupabase)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    async function load() {
      setLoading(true)
      const [u, g, s, r] = await Promise.all([
        sb.from("users").select("*", { count: "exact", head: true }),
        sb.from("generations").select("*", { count: "exact", head: true }),
        sb.from("users").select("*", { count: "exact", head: true }).eq("subscription_status", "active"),
        sb.from("generations").select("credits_used"),
      ])
      const revenue = ((r.data as Generation[] || []).reduce((sum, g) => sum + (g.credits_used || 0), 0)) * 0.5
      setStats({
        totalUsers: u.count || 0, totalGenerations: g.count || 0,
        activeSubscriptions: s.count || 0, totalRevenue: revenue,
      })
      setLoading(false)
    }
    load()
  }, [supabase])

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, gradient: "from-blue-500 to-cyan-500", change: "+12%", up: true },
    { label: "Generations", value: stats?.totalGenerations ?? 0, icon: Activity, gradient: "from-violet-500 to-purple-500", change: "+8%", up: true },
    { label: "Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: UserCheck, gradient: "from-emerald-500 to-teal-500", change: "+3%", up: true },
    { label: "Revenue", value: `₹${formatCredits(Math.round(stats?.totalRevenue ?? 0))}`, icon: TrendingUp, gradient: "from-amber-500 to-orange-500", change: "+18%", up: true },
  ]

  const quickStats = [
    { label: "Conversion Rate", value: "24%", icon: Activity },
    { label: "Avg. Daily Users", value: "156", icon: Users },
    { label: "Avg. Credits/Gen", value: "2.4", icon: Sparkles },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <PremiumCard gradient>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500">{card.label}</CardTitle>
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${card.gradient} p-2 flex items-center justify-center shadow-lg`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <StatSkeleton />
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-zinc-100">{card.value}</div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className={`text-xs ${card.up ? "text-emerald-400" : "text-red-400"}`}>
                          {card.change}
                        </span>
                        <span className="text-xs text-zinc-600">vs last month</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </PremiumCard>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} variants={itemVariants}>
              <PremiumCard>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-600">{s.label}</p>
                    <p className="text-lg font-semibold text-zinc-200">{s.value}</p>
                  </div>
                </CardContent>
              </PremiumCard>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function UsersTab() {
  const [supabase] = useState(getSupabase)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [adminTarget, setAdminTarget] = useState<User | null>(null)
  const [blockTarget, setBlockTarget] = useState<User | null>(null)
  const PAGE_SIZE = 15

  useEffect(() => {
    if (!supabase) return
    const sb = supabase; let cancelled = false
    async function load() {
      setLoading(true)
      const { data, count } = await sb.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(0, PAGE_SIZE - 1)
      if (!cancelled) { setUsers((data as User[]) ?? []); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  const handleSearch = async () => {
    if (!supabase) return; setLoading(true)
    let q = supabase.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(0, PAGE_SIZE - 1)
    if (search) q = q.ilike("email", `%${search}%`)
    const { data } = await q; setUsers((data as User[]) ?? []); setLoading(false)
  }

  const handleUpdateCredits = async (userId: string, credits: number) => {
    if (!supabase) return
    await supabase.from("users").update({ credits }).eq("id", userId)
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, credits } : u)))
    toast.success("Credits updated")
  }

  const handleToggleAdmin = async (target: User) => {
    if (!supabase) return
    const v = !target.is_admin
    await supabase.from("users").update({ is_admin: v }).eq("id", target.id)
    setUsers((prev) => prev.map((u) => u.id === target.id ? { ...u, is_admin: v } : u))
    setAdminTarget(null)
    toast.success(v ? "Admin privileges granted" : "Admin privileges removed")
  }

  const handleToggleBlock = async (target: User) => {
    if (!supabase) return
    const v = !target.blocked
    await supabase.from("users").update({ blocked: v }).eq("id", target.id)
    setUsers((prev) => prev.map((u) => u.id === target.id ? { ...u, blocked: v } : u))
    setBlockTarget(null)
    toast.success(v ? "User blocked" : "User unblocked")
  }

  const planBadge = (plan: string) => {
    const colors: Record<string, string> = { free: "secondary", basic: "default", pro: "success" }
    return <PremiumBadge variant={colors[plan] || "secondary"}>{plan}</PremiumBadge>
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Users</h2>
          <p className="text-sm text-zinc-600">Manage registered users and their credits</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
            <Input placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="w-64 pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-300 placeholder:text-zinc-600 rounded-xl" />
          </div>
          <Button onClick={handleSearch} variant="outline" className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 rounded-xl">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <PremiumCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                {["Email", "Role", "Status", "Credits", "Plan", "Referrals", "Joined", ""].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/30">
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800/50 rounded" /></td>
                  ))}
                </tr>
              )) : users.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-zinc-600">No users found</td></tr>
              ) : users.map((u, i) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors ${u.blocked ? "opacity-40" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center text-xs font-medium text-purple-400">
                        {u.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-zinc-300">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <PremiumBadge variant="premium"><Shield className="h-3 w-3" />Admin</PremiumBadge>
                    ) : (
                      <span className="text-zinc-600">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.blocked ? (
                      <div className="flex items-center gap-1.5 text-red-400"><Ban className="h-3.5 w-3.5" /><span className="text-xs">Blocked</span></div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-emerald-400"><div className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" /><span className="text-xs">Active</span></div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-zinc-300 font-mono">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      {formatCredits(u.credits)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{planBadge(u.subscription_plan)}</td>
                  <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{u.referred_by ? 1 : 0}</td>
                  <td className="px-4 py-3 text-zinc-600 text-xs whitespace-nowrap">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setBlockTarget(u)} className="hover:bg-zinc-800/50 rounded-lg">
                        {u.blocked ? <Unlock className="h-4 w-4 text-emerald-400" /> : <Ban className="h-4 w-4 text-red-400" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setAdminTarget(u)} className="hover:bg-zinc-800/50 rounded-lg">
                        {u.is_admin ? <ShieldOff className="h-4 w-4 text-red-400" /> : <Shield className="h-4 w-4 text-zinc-400" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const c = prompt("Credits:", String(u.credits))
                        if (c && !isNaN(parseInt(c))) handleUpdateCredits(u.id, parseInt(c))
                      }} className="hover:bg-zinc-800/50 rounded-lg text-xs text-zinc-400">Credits</Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      <Dialog open={!!adminTarget} onOpenChange={(o) => { if (!o) setAdminTarget(null) }}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-zinc-100">{adminTarget?.is_admin ? "Remove Admin" : "Make Admin"}</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400">{adminTarget?.is_admin ? `Remove admin privileges from ${adminTarget.email}?` : `Grant admin privileges to ${adminTarget?.email}?`}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminTarget(null)} className="border-zinc-700">Cancel</Button>
            <Button onClick={() => adminTarget && handleToggleAdmin(adminTarget)} className={adminTarget?.is_admin ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}>{adminTarget?.is_admin ? "Remove" : "Grant"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!blockTarget} onOpenChange={(o) => { if (!o) setBlockTarget(null) }}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-zinc-100">{blockTarget?.blocked ? "Unblock User" : "Block User"}</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400">{blockTarget?.blocked ? `Unblock ${blockTarget.email}?` : `Block ${blockTarget?.email}?`}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockTarget(null)} className="border-zinc-700">Cancel</Button>
            <Button onClick={() => blockTarget && handleToggleBlock(blockTarget)} className={blockTarget?.blocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}>{blockTarget?.blocked ? "Unblock" : "Block"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

function GenerationsTab() {
  const [supabase] = useState(getSupabase)
  const [generations, setGenerations] = useState<(Generation & { user?: { email: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!supabase) return; const sb = supabase; let cancelled = false
    async function load() {
      setLoading(true)
      let q = sb.from("generations").select("*, user:users(email)", { count: "exact" }).order("created_at", { ascending: false }).range(0, 14)
      if (search) q = q.ilike("prompt", `%${search}%`)
      if (typeFilter !== "all") q = q.eq("type", typeFilter)
      if (statusFilter !== "all") q = q.eq("status", statusFilter)
      const { data } = await q
      if (!cancelled) { setGenerations(data ?? []); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [supabase, search, typeFilter, statusFilter])

  const statusBadge = (status: string) => {
    const m: Record<string, string> = { completed: "success", processing: "warning", pending: "secondary", failed: "destructive" }
    return <PremiumBadge variant={m[status] || "secondary"}>{status}</PremiumBadge>
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Generations</h2>
          <p className="text-sm text-zinc-600">All AI generations on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search prompts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48 bg-zinc-900/50 border-zinc-800 rounded-xl" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300">
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      <PremiumCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                {["Preview", "Prompt", "Type", "Status", "User", "Credits", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/30">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800/50 rounded" /></td>
                  ))}
                </tr>
              )) : generations.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-zinc-600">No generations found</td></tr>
              ) : generations.map((g, i) => (
                <motion.tr key={g.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3">
                    {g.type === "image" && g.output_url ? (
                      <img src={g.output_url} alt="" className="h-10 w-10 rounded-lg object-cover ring-1 ring-zinc-700/50" />
                    ) : (
                      <div className="h-10 w-10 rounded-lg bg-zinc-800 flex items-center justify-center ring-1 ring-zinc-700/50"><VideoIcon className="h-5 w-5 text-zinc-600" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-300 max-w-[200px] truncate">{g.prompt}</td>
                  <td className="px-4 py-3"><PremiumBadge>{g.type}</PremiumBadge></td>
                  <td className="px-4 py-3">{statusBadge(g.status)}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{g.user?.email || "Unknown"}</td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{g.credits_used}</td>
                  <td className="px-4 py-3 text-zinc-600 text-xs whitespace-nowrap">{formatDate(g.created_at)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </motion.div>
  )
}

function CouponsTab() {
  const [supabase] = useState(getSupabase)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ code: "", discount: "", maxUses: "", expiresAt: "" })

  useEffect(() => {
    if (!supabase) return; const sb = supabase; let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await sb.from("coupons").select("*").order("created_at", { ascending: false })
      if (!cancelled) { setCoupons((data as Coupon[]) ?? []); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  const resetForm = () => { setForm({ code: "", discount: "", maxUses: "", expiresAt: "" }); setEditing(null) }

  const openCreate = () => { resetForm(); setShowDialog(true) }

  const openEdit = (c: Coupon) => {
    setEditing(c); setForm({ code: c.code, discount: c.discount_percent.toString(), maxUses: c.max_uses.toString(), expiresAt: c.expires_at.split("T")[0] }); setShowDialog(true)
  }

  const handleSave = async () => {
    if (!supabase) return; setSaving(true)
    const p = { code: form.code.toUpperCase(), discount_percent: parseInt(form.discount), max_uses: parseInt(form.maxUses), expires_at: form.expiresAt ? new Date(form.expiresAt).toISOString() : null }
    if (editing) await supabase.from("coupons").update(p).eq("id", editing.id)
    else await supabase.from("coupons").insert(p)
    setSaving(false); setShowDialog(false); resetForm()
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
    setCoupons((data as Coupon[]) ?? []); toast.success(editing ? "Coupon updated" : "Coupon created")
  }

  const handleDelete = async (coupon: Coupon) => {
    if (!supabase) return
    await supabase.from("coupons").delete().eq("id", coupon.id)
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id)); toast.success("Coupon deleted")
  }

  const handleToggleActive = async (coupon: Coupon) => {
    if (!supabase) return
    await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id)
    setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">Coupons</h2>
          <p className="text-sm text-zinc-600">Create and manage discount coupons</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl shadow-lg shadow-purple-600/20">
          <Plus className="h-4 w-4 mr-2" />Create Coupon
        </Button>
      </div>
      <PremiumCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                {["Code", "Discount", "Uses", "Expires", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/30">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800/50 rounded" /></td>
                  ))}
                </tr>
              )) : coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-zinc-600">No coupons yet</td></tr>
              ) : coupons.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3"><code className="px-2.5 py-1 bg-zinc-800/80 rounded-lg text-purple-400 text-xs font-mono border border-purple-500/10">{c.code}</code></td>
                  <td className="px-4 py-3 text-zinc-300 font-semibold">{c.discount_percent}%</td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-xs">{c.current_uses}/{c.max_uses}</td>
                  <td className="px-4 py-3 text-zinc-600 text-xs">{c.expires_at ? formatDate(c.expires_at) : "Never"}</td>
                  <td className="px-4 py-3"><PremiumBadge variant={c.is_active ? "success" : "secondary"}>{c.is_active ? "Active" : "Inactive"}</PremiumBadge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)} className="hover:bg-zinc-800/50 rounded-lg"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(c)} className="hover:bg-zinc-800/50 rounded-lg">{c.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}</Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c)} className="hover:bg-zinc-800/50 rounded-lg text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader><DialogTitle className="text-zinc-100">{editing ? "Edit Coupon" : "Create Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label className="text-zinc-400 text-xs">Coupon Code</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SUMMER50" className="bg-zinc-800/50 border-zinc-700 text-zinc-200 rounded-xl placeholder:text-zinc-600" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-zinc-400 text-xs">Discount %</Label><Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="50" className="bg-zinc-800/50 border-zinc-700 text-zinc-200 rounded-xl" /></div>
              <div className="space-y-2"><Label className="text-zinc-400 text-xs">Max Uses</Label><Input type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="100" className="bg-zinc-800/50 border-zinc-700 text-zinc-200 rounded-xl" /></div>
            </div>
            <div className="space-y-2"><Label className="text-zinc-400 text-xs">Expiry Date</Label><Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className="bg-zinc-800/50 border-zinc-700 text-zinc-200 rounded-xl" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)} className="border-zinc-700">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700 rounded-xl">{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editing ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}

function RevenueTab() {
  const [supabase] = useState(getSupabase)
  const [dailyData, setDailyData] = useState<{ date: string; revenue: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return; const sb = supabase
    async function load() {
      setLoading(true)
      const d = new Date(); d.setDate(d.getDate() - 30)
      const { data } = await sb.from("generations").select("credits_used, created_at").gte("created_at", d.toISOString()).order("created_at")
      if (!data) { setLoading(false); return }
      const daily: Record<string, { revenue: number; count: number }> = {}
      for (const g of data) {
        const day = g.created_at.split("T")[0]
        if (!daily[day]) daily[day] = { revenue: 0, count: 0 }
        daily[day].revenue += (g.credits_used || 0) * 0.5; daily[day].count += 1
      }
      setDailyData(Object.entries(daily).map(([date, d]) => ({ date, ...d })).sort((a, b) => a.date.localeCompare(b.date)))
      setLoading(false)
    }
    load()
  }, [supabase])

  const maxR = Math.max(...dailyData.map((d) => d.revenue), 1)
  const totalRevenue = dailyData.reduce((s, d) => s + d.revenue, 0)
  const totalGens = dailyData.reduce((s, d) => s + d.count, 0)

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100">Revenue Analytics</h2>
        <p className="text-sm text-zinc-600">Last 30 days performance</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PremiumCard gradient>
          <CardContent className="py-4">
            <p className="text-xs text-zinc-600">Total Revenue (30d)</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">₹{formatCredits(Math.round(totalRevenue))}</p>
          </CardContent>
        </PremiumCard>
        <PremiumCard gradient>
          <CardContent className="py-4">
            <p className="text-xs text-zinc-600">Total Generations (30d)</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{totalGens.toLocaleString()}</p>
          </CardContent>
        </PremiumCard>
        <PremiumCard gradient>
          <CardContent className="py-4">
            <p className="text-xs text-zinc-600">Avg. Revenue/Day</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">₹{dailyData.length ? Math.round(totalRevenue / dailyData.length) : 0}</p>
          </CardContent>
        </PremiumCard>
      </div>
      <PremiumCard>
        <CardContent className="p-6">
          {loading ? (
            <Skeleton className="h-64 w-full bg-zinc-800/50 rounded-xl" />
          ) : dailyData.length === 0 ? (
            <p className="text-zinc-600 text-center py-16">No revenue data yet</p>
          ) : (
            <div className="space-y-1.5">
              {dailyData.map((d) => (
                <div key={d.date} className="flex items-center gap-3 group">
                  <span className="text-[11px] text-zinc-600 w-20 shrink-0 font-mono">{d.date.slice(5)}</span>
                  <div className="flex-1 h-7 bg-zinc-800/50 rounded-lg overflow-hidden relative">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.revenue / maxR) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 rounded-lg relative"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
                    </motion.div>
                  </div>
                  <span className="text-xs text-zinc-400 w-20 text-right font-mono">₹{d.revenue.toFixed(0)}</span>
                  <span className="text-[11px] text-zinc-600 w-12 text-right">{d.count}</span>
                  <div className="h-2 w-2 rounded-full bg-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </PremiumCard>
    </motion.div>
  )
}

function ModelsTab() {
  const [supabase] = useState(getSupabase)
  const [models, setModels] = useState<AdminModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return; const sb = supabase
    async function load() {
      setLoading(true)
      const { data } = await sb.from("models").select("*").order("type").order("name")
      setModels((data as AdminModel[]) ?? []); setLoading(false)
    }
    load()
  }, [supabase])

  const handleToggle = async (m: AdminModel) => {
    if (!supabase) return
    await supabase.from("models").update({ enabled: !m.enabled }).eq("id", m.id)
    setModels((prev) => prev.map((x) => x.id === m.id ? { ...x, enabled: !x.enabled } : x))
  }

  const handleCostChange = async (m: AdminModel, cost: number) => {
    if (!supabase) return
    await supabase.from("models").update({ credit_cost: cost }).eq("id", m.id)
    setModels((prev) => prev.map((x) => x.id === m.id ? { ...x, credit_cost: cost } : x))
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Model Management</h2>
        <p className="text-sm text-zinc-600">Enable/disable AI models and configure pricing</p>
      </div>
      <PremiumCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                {["Model", "Type", "Provider", "Credit Cost", "Status", ""].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/30">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800/50 rounded" /></td>
                  ))}
                </tr>
              )) : models.map((m, i) => (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg ${m.type === "image" ? "bg-purple-500/10" : "bg-blue-500/10"} flex items-center justify-center`}>
                        {m.type === "image" ? <ImageIcon className="h-4 w-4 text-purple-400" /> : <VideoIcon className="h-4 w-4 text-blue-400" />}
                      </div>
                      <span className="text-zinc-200 font-medium">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><PremiumBadge>{m.type}</PremiumBadge></td>
                  <td className="px-4 py-3 text-zinc-600 text-xs">{m.provider}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Input type="number" min={1} value={m.credit_cost} onChange={(e) => handleCostChange(m, parseInt(e.target.value) || 1)} className="w-16 h-8 text-xs bg-zinc-800/50 border-zinc-700 rounded-lg text-center" />
                      <span className="text-xs text-zinc-600">credits</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><PremiumBadge variant={m.enabled ? "success" : "secondary"}>{m.enabled ? "Enabled" : "Disabled"}</PremiumBadge></td>
                  <td className="px-4 py-3 text-right">
                    <Switch checked={m.enabled} onCheckedChange={() => handleToggle(m)} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </motion.div>
  )
}

function LogsTab() {
  const [supabase] = useState(getSupabase)
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<string>("all")

  useEffect(() => {
    if (!supabase) return; const sb = supabase; let cancelled = false
    async function load() {
      setLoading(true)
      let q = sb.from("system_logs").select("*").order("created_at", { ascending: false }).limit(100)
      if (levelFilter !== "all") q = q.eq("level", levelFilter)
      const { data } = await q
      if (!cancelled) { setLogs((data as SystemLog[]) ?? []); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [supabase, levelFilter])

  const levelBadge = (level: string) => {
    const m: Record<string, string> = { info: "secondary", warn: "warning", error: "destructive", debug: "secondary" }
    return <PremiumBadge variant={m[level] || "secondary"}>{level}</PremiumBadge>
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-100">System Logs</h2>
          <p className="text-sm text-zinc-600">Monitor system activity and errors</p>
        </div>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-300">
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>
      <PremiumCard className="overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur-sm">
              <tr className="border-b border-zinc-800/50">
                {["Time", "Level", "Action", "Message", "User"].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left font-medium text-zinc-500 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/30">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800/50 rounded" /></td>
                  ))}
                </tr>
              )) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-16 text-center text-zinc-600">No logs yet</td></tr>
              ) : logs.map((log, i) => (
                <motion.tr key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-4 py-3 text-zinc-600 text-xs whitespace-nowrap font-mono">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3">{levelBadge(log.level)}</td>
                  <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-zinc-500 max-w-[280px] truncate text-xs">{log.message || "-"}</td>
                  <td className="px-4 py-3 text-zinc-600 text-xs font-mono">{log.user_id ? log.user_id.slice(0, 8) + "..." : "-"}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </motion.div>
  )
}

function EmailTab() {
  const [supabase] = useState(getSupabase)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [preview, setPreview] = useState(false)

  const handleSend = async () => {
    if (!supabase || !subject.trim() || !message.trim()) return; setSending(true)
    const { data: users } = await supabase.from("users").select("email")
    const emails = (users || []).map((u: any) => u.email).filter(Boolean)
    await supabase.from("system_logs").insert({ level: "info", action: "email_broadcast", message: `Broadcast: ${subject} to ${emails.length} users`, metadata: { subject, recipient_count: emails.length } })
    toast.success(`Logged! Would be sent to ${emails.length} users.`)
    setSubject(""); setMessage(""); setSending(false)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Email Broadcast</h2>
        <p className="text-sm text-zinc-600">Send email to all registered users</p>
      </div>
      <div className="max-w-2xl">
        <PremiumCard>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter email subject..." className="bg-zinc-800/50 border-zinc-700 text-zinc-200 rounded-xl placeholder:text-zinc-600" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider">Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your email message..." className="min-h-[200px] bg-zinc-800/50 border-zinc-700 text-zinc-200 rounded-xl placeholder:text-zinc-600" />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSend} disabled={!subject.trim() || !message.trim() || sending} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl shadow-lg shadow-purple-600/20">
                {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                Send to All Users
              </Button>
              <Button variant="outline" onClick={() => setPreview(!preview)} className="border-zinc-700 rounded-xl">
                {preview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                Preview
              </Button>
            </div>
            {preview && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                <div className="p-5 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                  <p className="text-sm font-medium text-zinc-300">Subject: {subject || "(no subject)"}</p>
                  <div className="mt-3 h-px bg-zinc-700/50" />
                  <p className="text-sm text-zinc-400 mt-3 whitespace-pre-wrap">{message || "(no message)"}</p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </PremiumCard>
      </div>
    </motion.div>
  )
}

function ModerationTab() {
  const [supabase] = useState(getSupabase)
  const [flagged, setFlagged] = useState<(Generation & { user?: { email: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return; const sb = supabase; let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await sb.from("generations").select("*, user:users(email)").eq("flagged", true).order("created_at", { ascending: false })
      if (!cancelled) { setFlagged(data ?? []); setLoading(false) }
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  const handleAction = async (id: string, action: "approve" | "delete") => {
    if (!supabase) return
    if (action === "approve") {
      await supabase.from("generations").update({ flagged: false, flagged_reason: null }).eq("id", id)
      setFlagged((prev) => prev.filter((g) => g.id !== id)); toast.success("Content approved")
    } else {
      await supabase.from("generations").delete().eq("id", id)
      setFlagged((prev) => prev.filter((g) => g.id !== id)); toast.success("Content deleted")
    }
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Content Moderation</h2>
        <p className="text-sm text-zinc-600">Review and manage flagged content</p>
      </div>
      <PremiumCard className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full bg-zinc-800/50 rounded-xl" />)}
          </div>
        ) : flagged.length === 0 ? (
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
              <Flag className="h-8 w-8 text-emerald-400" />
            </div>
            <p className="text-zinc-400 font-medium">All Clear</p>
            <p className="text-sm text-zinc-600 mt-1">No flagged content to review</p>
          </CardContent>
        ) : (
          <div className="divide-y divide-zinc-800/30">
            {flagged.map((g, i) => (
              <motion.div key={g.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 p-4 hover:bg-zinc-800/20 transition-colors">
                <div className="h-14 w-14 rounded-xl overflow-hidden ring-1 ring-zinc-700/50 shrink-0 bg-zinc-800">
                  {g.type === "image" && g.output_url ? (
                    <img src={g.output_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><VideoIcon className="h-6 w-6 text-zinc-600" /></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-200 truncate">{g.prompt}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-zinc-600">{g.user?.email || "Unknown"}</span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-xs text-zinc-600">{formatDate(g.created_at)}</span>
                    {g.flagged_reason && (
                      <>
                        <span className="text-zinc-700">·</span>
                        <span className="text-xs text-amber-400">{g.flagged_reason}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleAction(g.id, "approve")} className="border-emerald-700/50 text-emerald-400 hover:bg-emerald-900/20 rounded-lg text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleAction(g.id, "delete")} className="border-red-700/50 text-red-400 hover:bg-red-900/20 rounded-lg text-xs">
                    <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </PremiumCard>
    </motion.div>
  )
}

function ExportTab() {
  const [supabase] = useState(getSupabase)
  const [exporting, setExporting] = useState<string | null>(null)

  const exportCSV = async (table: string, filename: string) => {
    if (!supabase) return; setExporting(table)
    const { data } = await supabase.from(table).select("*")
    if (!data || data.length === 0) { toast.error("No data to export"); setExporting(null); return }
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((row: any) => Object.values(row).map((v) => {
      if (v === null || v === undefined) return ""
      const s = String(v)
      return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
    }).join(",")).join("\n")
    const blob = new Blob([`${headers}\n${rows}`], { type: "text/csv" })
    const url = URL.createObjectURL(blob); const a = document.createElement("a")
    a.href = url; a.download = `${table}_${new Date().toISOString().split("T")[0]}.csv`
    a.click(); URL.revokeObjectURL(url); setExporting(null); toast.success(`${table} exported`)
  }

  const tables = [
    { key: "users", label: "Users", icon: Users, desc: "User accounts data" },
    { key: "generations", label: "Generations", icon: Activity, desc: "AI generation records" },
    { key: "coupons", label: "Coupons", icon: Tag, desc: "Discount coupons" },
    { key: "system_logs", label: "System Logs", icon: ScrollText, desc: "Activity logs" },
  ]

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Export Data</h2>
        <p className="text-sm text-zinc-600">Download platform data as CSV</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tables.map((t, i) => {
          const Icon = t.icon
          return (
            <motion.div key={t.key} variants={itemVariants}>
              <PremiumCard>
                <CardContent className="flex flex-col items-center justify-center py-8 cursor-pointer" onClick={() => !exporting && exportCSV(t.key, t.key)}>
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-7 w-7 text-purple-400" />
                  </div>
                  <p className="text-sm font-medium text-zinc-300">{t.label}</p>
                  <p className="text-xs text-zinc-600 mt-1 mb-3">{t.desc}</p>
                  <Button variant="outline" size="sm" disabled={exporting === t.key} className="border-zinc-700 rounded-lg text-xs">
                    {exporting === t.key ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Download className="h-3 w-3 mr-1" />}
                    {exporting === t.key ? "Exporting..." : "Export CSV"}
                  </Button>
                </CardContent>
              </PremiumCard>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function RateLimitsTab() {
  const [supabase] = useState(getSupabase)
  const [limits, setLimits] = useState<RateLimit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return; const sb = supabase
    async function load() {
      setLoading(true)
      const { data } = await sb.from("rate_limits").select("*").order("plan")
      setLimits((data as RateLimit[]) ?? []); setLoading(false)
    }
    load()
  }, [supabase])

  const handleChange = async (id: string, field: string, value: number) => {
    if (!supabase) return
    await supabase.from("rate_limits").update({ [field]: value }).eq("id", id)
    setLimits((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l))
    toast.success("Rate limit updated")
  }

  const planGradients: Record<string, string> = {
    free: "from-zinc-600 to-zinc-500",
    basic: "from-blue-600 to-cyan-500",
    pro: "from-purple-600 to-pink-500",
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Rate Limits</h2>
        <p className="text-sm text-zinc-600">Configure rate limits per subscription plan</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 bg-zinc-800/50 rounded-2xl" />
        )) : limits.map((l, i) => (
          <motion.div key={l.id} variants={itemVariants}>
            <PremiumCard gradient>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${planGradients[l.plan] || "from-zinc-600 to-zinc-500"} p-2.5 flex items-center justify-center shadow-lg`}>
                    <Gauge className="h-5 w-5 text-white" />
                  </div>
                  <PremiumBadge variant={l.plan === "pro" ? "premium" : l.plan === "basic" ? "default" : "secondary"}>{l.plan}</PremiumBadge>
                </div>
                <CardTitle className="text-zinc-100 capitalize mt-3">{l.plan} Plan</CardTitle>
                <CardDescription>Rate limits for {l.plan} subscribers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-600 flex items-center gap-1.5"><Activity className="h-3 w-3" />Max Daily Generations</Label>
                  <Input type="number" value={l.max_daily_generations} onChange={(e) => handleChange(l.id, "max_daily_generations", parseInt(e.target.value) || 0)} className="bg-zinc-800/50 border-zinc-700 rounded-lg text-zinc-200" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-600 flex items-center gap-1.5"><Clock className="h-3 w-3" />Max Concurrent</Label>
                  <Input type="number" value={l.max_concurrent} onChange={(e) => handleChange(l.id, "max_concurrent", parseInt(e.target.value) || 0)} className="bg-zinc-800/50 border-zinc-700 rounded-lg text-zinc-200" />
                </div>
              </CardContent>
            </PremiumCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function FeaturesTab() {
  const [supabase] = useState(getSupabase)
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return; const sb = supabase
    async function load() {
      setLoading(true)
      const { data } = await sb.from("feature_flags").select("*").order("label")
      setFlags((data as FeatureFlag[]) ?? []); setLoading(false)
    }
    load()
  }, [supabase])

  const handleToggle = async (flag: FeatureFlag) => {
    if (!supabase) return
    await supabase.from("feature_flags").update({ enabled: !flag.enabled, updated_at: new Date().toISOString() }).eq("id", flag.id)
    setFlags((prev) => prev.map((f) => f.id === flag.id ? { ...f, enabled: !f.enabled } : f))
    toast.success(`${flag.label} ${flag.enabled ? "disabled" : "enabled"}`)
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-zinc-100">Feature Flags</h2>
        <p className="text-sm text-zinc-600">Toggle platform features on/off</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 bg-zinc-800/50 rounded-2xl" />
        )) : flags.map((flag, i) => (
          <motion.div key={flag.id} variants={itemVariants}>
            <PremiumCard>
              <CardContent className="flex items-center justify-between py-5">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${flag.enabled ? "bg-emerald-500/10" : "bg-zinc-800/50"} flex items-center justify-center`}>
                    <ToggleLeft className={`h-5 w-5 ${flag.enabled ? "text-emerald-400" : "text-zinc-600"}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{flag.label}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{flag.description}</p>
                  </div>
                </div>
                <Switch checked={flag.enabled} onCheckedChange={() => handleToggle(flag)} />
              </CardContent>
            </PremiumCard>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}