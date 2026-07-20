"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Users, Image as ImageIcon, CreditCard, DollarSign, Search, Loader2, Plus, Pencil, Trash2,
  CheckCircle2, XCircle, VideoIcon, Sparkles, Tag, Shield, ShieldOff, BarChart3, Cpu,
  ScrollText, Mail, Flag, Download, Gauge, ToggleLeft, Ban, Unlock,
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

export default function AdminPageContent() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabId>("overview")

  useEffect(() => {
    if (!userLoading && (!user || !user.is_admin)) router.push("/dashboard")
  }, [user, userLoading, router])

  if (userLoading || !user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: Sparkles },
    { id: "users" as const, label: "Users", icon: Users },
    { id: "generations" as const, label: "Generations", icon: ImageIcon },
    { id: "revenue" as const, label: "Revenue", icon: DollarSign },
    { id: "models" as const, label: "Models", icon: Cpu },
    { id: "moderation" as const, label: "Moderation", icon: Flag },
    { id: "logs" as const, label: "Logs", icon: ScrollText },
    { id: "email" as const, label: "Email", icon: Mail },
    { id: "ratelimits" as const, label: "Rate Limits", icon: Gauge },
    { id: "features" as const, label: "Features", icon: ToggleLeft },
    { id: "export" as const, label: "Export", icon: Download },
    { id: "coupons" as const, label: "Coupons", icon: Tag },
  ]

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Admin Panel</h1>
            <p className="text-zinc-500 mt-1">Manage your AuraAI platform</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-8 p-1 bg-zinc-900 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

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
      </div>
    </div>
  )
}

function OverviewTab() {
  const [supabase] = useState(getSupabase)
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    async function loadStats() {
      setLoadingStats(true)
      const [usersCount, gensCount, subsCount, revenueResult] = await Promise.all([
        sb.from("users").select("*", { count: "exact", head: true }),
        sb.from("generations").select("*", { count: "exact", head: true }),
        sb.from("users").select("*", { count: "exact", head: true }).eq("subscription_status", "active"),
        sb.from("generations").select("credits_used"),
      ])
      const totalRevenue = (revenueResult.data as Generation[] || []).reduce((sum, g) => sum + (g.credits_used || 0), 0) * 0.5
      setStats({
        totalUsers: usersCount.count || 0,
        totalGenerations: gensCount.count || 0,
        activeSubscriptions: subsCount.count || 0,
        totalRevenue,
      })
      setLoadingStats(false)
    }
    loadStats()
  }, [supabase])

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-400" },
    { label: "Total Generations", value: stats?.totalGenerations ?? 0, icon: ImageIcon, color: "text-purple-400" },
    { label: "Active Subscriptions", value: stats?.activeSubscriptions ?? 0, icon: CreditCard, color: "text-green-400" },
    { label: "Estimated Revenue", value: `₹${formatCredits(Math.round(stats?.totalRevenue ?? 0))}`, icon: DollarSign, color: "text-yellow-400" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="border-zinc-800/50 bg-zinc-900/40">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">{card.label}</CardTitle>
              <Icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <Skeleton className="h-8 w-24 bg-zinc-800" />
              ) : (
                <div className="text-3xl font-bold text-zinc-100">{card.value}</div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function UsersTab() {
  const [supabase] = useState(getSupabase)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [hasMore, setHasMore] = useState(true)
  const [adminTarget, setAdminTarget] = useState<User | null>(null)
  const [blockTarget, setBlockTarget] = useState<User | null>(null)
  const PAGE_SIZE = 15

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data, count } = await sb.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(0, PAGE_SIZE - 1)
      if (cancelled) return
      setUsers((data as User[]) ?? [])
      if (count !== null) setHasMore(PAGE_SIZE < count)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  const handleSearch = async () => {
    if (!supabase) return
    setLoading(true)
    let query = supabase.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(0, PAGE_SIZE - 1)
    if (search) query = query.ilike("email", `%${search}%`)
    const { data, count } = await query
    setUsers((data as User[]) ?? [])
    if (count !== null) setHasMore(PAGE_SIZE < count)
    setLoading(false)
  }

  const handleUpdateCredits = async (userId: string, credits: number) => {
    if (!supabase) return
    await supabase.from("users").update({ credits }).eq("id", userId)
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, credits } : u)))
  }

  const handleToggleAdmin = async (target: User) => {
    if (!supabase) return
    const newAdmin = !target.is_admin
    await supabase.from("users").update({ is_admin: newAdmin }).eq("id", target.id)
    setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, is_admin: newAdmin } : u)))
    setAdminTarget(null)
  }

  const handleToggleBlock = async (target: User) => {
    if (!supabase) return
    const newBlocked = !target.blocked
    await supabase.from("users").update({ blocked: newBlocked }).eq("id", target.id)
    setUsers((prev) => prev.map((u) => (u.id === target.id ? { ...u, blocked: newBlocked } : u)))
    setBlockTarget(null)
  }

  const planBadge = (plan: string) => {
    const colors: Record<string, string> = { free: "secondary", basic: "default", pro: "success" }
    return <Badge variant={(colors[plan] as any) || "secondary"} className="capitalize text-[10px]">{plan}</Badge>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Users</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage registered users and their credits</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="w-64" />
          <Button variant="outline" size="icon" onClick={handleSearch}><Search className="h-4 w-4" /></Button>
        </div>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Admin</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Blocked</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Credits</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Plan</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Referrals</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Joined</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  {Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800" /></td>
                  ))}
                </tr>
              )) : users.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-zinc-500">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors ${u.blocked ? "opacity-50" : ""}`}>
                  <td className="px-4 py-3 text-zinc-300">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.is_admin ? <Shield className="h-4 w-4 text-purple-400" /> : <span className="text-zinc-600">-</span>}
                  </td>
                  <td className="px-4 py-3">
                    {u.blocked ? <Ban className="h-4 w-4 text-red-400" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-zinc-300">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      {formatCredits(u.credits)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{planBadge(u.subscription_plan)}</td>
                  <td className="px-4 py-3">
                    {u.subscription_status === "active" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-zinc-600" />}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{u.referred_by ? 1 : 0}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setBlockTarget(u)} title={u.blocked ? "Unblock User" : "Block User"}>
                        {u.blocked ? <Unlock className="h-4 w-4 text-green-400" /> : <Ban className="h-4 w-4 text-red-400" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setAdminTarget(u)} title={u.is_admin ? "Remove Admin" : "Make Admin"}>
                        {u.is_admin ? <ShieldOff className="h-4 w-4 text-red-400" /> : <Shield className="h-4 w-4 text-zinc-400" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const newCredits = prompt("Enter new credit amount:", String(u.credits))
                        if (newCredits && !isNaN(parseInt(newCredits))) handleUpdateCredits(u.id, parseInt(newCredits))
                      }}>Edit Credits</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={!!adminTarget} onOpenChange={(o) => { if (!o) setAdminTarget(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{adminTarget?.is_admin ? "Remove Admin" : "Make Admin"}</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400">
            {adminTarget?.is_admin
              ? `Remove admin privileges from ${adminTarget.email}?`
              : `Grant admin privileges to ${adminTarget?.email}?`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdminTarget(null)}>Cancel</Button>
            <Button onClick={() => adminTarget && handleToggleAdmin(adminTarget)} className={adminTarget?.is_admin ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"}>
              {adminTarget?.is_admin ? "Remove Admin" : "Make Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!blockTarget} onOpenChange={(o) => { if (!o) setBlockTarget(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{blockTarget?.blocked ? "Unblock User" : "Block User"}</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-400">
            {blockTarget?.blocked
              ? `Unblock ${blockTarget.email}? They will be able to use the platform again.`
              : `Block ${blockTarget?.email}? They will not be able to use the platform.`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockTarget(null)}>Cancel</Button>
            <Button onClick={() => blockTarget && handleToggleBlock(blockTarget)} className={blockTarget?.blocked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}>
              {blockTarget?.blocked ? "Unblock" : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GenerationsTab() {
  const [supabase] = useState(getSupabase)
  const [generations, setGenerations] = useState<(Generation & { user?: { email: string } })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 15

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    let cancelled = false
    async function load() {
      setLoading(true)
      let query = sb.from("generations").select("*, user:users(email)", { count: "exact" }).order("created_at", { ascending: false }).range(0, PAGE_SIZE - 1)
      if (search) query = query.ilike("prompt", `%${search}%`)
      if (typeFilter !== "all") query = query.eq("type", typeFilter)
      if (statusFilter !== "all") query = query.eq("status", statusFilter)
      const { data, count } = await query
      if (cancelled) return
      setGenerations(data ?? [])
      if (count !== null) setHasMore(PAGE_SIZE < count)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [supabase, search, typeFilter, statusFilter])

  const statusBadge = (status: string) => {
    const config: Record<string, "default" | "success" | "destructive" | "warning" | "secondary"> = {
      completed: "success", processing: "warning", pending: "secondary", failed: "destructive",
    }
    return <Badge variant={config[status] ?? "secondary"} className="capitalize text-[10px]">{status}</Badge>
  }

  const typeBadge = (type: string) => (
    <Badge variant={type === "image" ? "default" : "secondary"} className="text-[10px] capitalize">
      {type === "image" ? <ImageIcon className="h-3 w-3 mr-1" /> : <VideoIcon className="h-3 w-3 mr-1" />}
      {type}
    </Badge>
  )

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Generations</h1>
          <p className="mt-1 text-sm text-zinc-500">View all AI generations on the platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search prompts..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-48" />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300">
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300">
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Preview</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Prompt</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">User</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Credits</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800" /></td>
                  ))}
                </tr>
              )) : generations.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-zinc-500">No generations found</td></tr>
              ) : generations.map((g) => (
                <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    {g.type === "image" && g.output_url ? (
                      <img src={g.output_url} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-zinc-800 flex items-center justify-center"><VideoIcon className="h-5 w-5 text-zinc-600" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-300 max-w-[200px] truncate">{g.prompt}</td>
                  <td className="px-4 py-3">{typeBadge(g.type)}</td>
                  <td className="px-4 py-3">{statusBadge(g.status)}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{g.user?.email || "Unknown"}</td>
                  <td className="px-4 py-3 text-zinc-300">{g.credits_used}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(g.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function CouponsTab() {
  const [supabase] = useState(getSupabase)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [saving, setSaving] = useState(false)
  const [formCode, setFormCode] = useState("")
  const [formDiscount, setFormDiscount] = useState("")
  const [formMaxUses, setFormMaxUses] = useState("")
  const [formExpiresAt, setFormExpiresAt] = useState("")

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data } = await sb.from("coupons").select("*").order("created_at", { ascending: false })
      if (cancelled) return
      setCoupons((data as Coupon[]) ?? [])
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [supabase])

  const resetForm = () => {
    setFormCode(""); setFormDiscount(""); setFormMaxUses(""); setFormExpiresAt(""); setEditingCoupon(null)
  }

  const openCreate = () => { resetForm(); setShowDialog(true) }

  const openEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon); setFormCode(coupon.code); setFormDiscount(coupon.discount_percent.toString())
    setFormMaxUses(coupon.max_uses.toString()); setFormExpiresAt(coupon.expires_at.split("T")[0]); setShowDialog(true)
  }

  const handleSave = async () => {
    if (!supabase) return
    setSaving(true)
    const payload = {
      code: formCode.toUpperCase(), discount_percent: parseInt(formDiscount, 10),
      max_uses: parseInt(formMaxUses, 10), expires_at: formExpiresAt ? new Date(formExpiresAt).toISOString() : null,
    }
    if (editingCoupon) {
      await supabase.from("coupons").update(payload).eq("id", editingCoupon.id)
    } else {
      await supabase.from("coupons").insert(payload)
    }
    setSaving(false); setShowDialog(false); resetForm()
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
    setCoupons((data as Coupon[]) ?? [])
  }

  const handleDelete = async (coupon: Coupon) => {
    if (!supabase) return
    await supabase.from("coupons").delete().eq("id", coupon.id)
    setCoupons((prev) => prev.filter((c) => c.id !== coupon.id))
  }

  const handleToggleActive = async (coupon: Coupon) => {
    if (!supabase) return
    await supabase.from("coupons").update({ is_active: !coupon.is_active }).eq("id", coupon.id)
    setCoupons((prev) => prev.map((c) => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c))
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Coupons</h1>
          <p className="mt-1 text-sm text-zinc-500">Create and manage discount coupons</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Create Coupon</Button>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Code</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Discount</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Uses</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Expires</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800" /></td>
                  ))}
                </tr>
              )) : coupons.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500">No coupons yet</td></tr>
              ) : coupons.map((coupon) => (
                <tr key={coupon.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3"><code className="px-2 py-1 bg-zinc-800 rounded text-purple-400 text-xs font-mono">{coupon.code}</code></td>
                  <td className="px-4 py-3 text-zinc-300">{coupon.discount_percent}%</td>
                  <td className="px-4 py-3 text-zinc-300">{coupon.current_uses}/{coupon.max_uses}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{coupon.expires_at ? formatDate(coupon.expires_at) : "Never"}</td>
                  <td className="px-4 py-3"><Badge variant={coupon.is_active ? "success" : "secondary"} className="text-[10px]">{coupon.is_active ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(coupon)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleToggleActive(coupon)}>{coupon.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2"><Label>Coupon Code</Label><Input value={formCode} onChange={(e) => setFormCode(e.target.value.toUpperCase())} placeholder="SUMMER50" /></div>
            <div className="space-y-2"><Label>Discount Percentage</Label><Input type="number" value={formDiscount} onChange={(e) => setFormDiscount(e.target.value)} placeholder="50" /></div>
            <div className="space-y-2"><Label>Max Uses</Label><Input type="number" value={formMaxUses} onChange={(e) => setFormMaxUses(e.target.value)} placeholder="100" /></div>
            <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={formExpiresAt} onChange={(e) => setFormExpiresAt(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}{editingCoupon ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RevenueTab() {
  const [supabase] = useState(getSupabase)
  const [dailyData, setDailyData] = useState<{ date: string; revenue: number; count: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    async function load() {
      setLoading(true)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { data } = await sb.from("generations").select("credits_used, created_at").gte("created_at", thirtyDaysAgo.toISOString()).order("created_at")
      if (!data) { setLoading(false); return }
      const daily: Record<string, { revenue: number; count: number }> = {}
      for (const g of data) {
        const day = g.created_at.split("T")[0]
        if (!daily[day]) daily[day] = { revenue: 0, count: 0 }
        daily[day].revenue += (g.credits_used || 0) * 0.5
        daily[day].count += 1
      }
      const chartData = Object.entries(daily).map(([date, d]) => ({ date, ...d })).sort((a, b) => a.date.localeCompare(b.date))
      setDailyData(chartData)
      setLoading(false)
    }
    load()
  }, [supabase])

  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue), 1)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Revenue Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">Daily revenue from AI generations (last 30 days)</p>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/40 p-6">
        {loading ? (
          <Skeleton className="h-64 w-full bg-zinc-800" />
        ) : dailyData.length === 0 ? (
          <p className="text-zinc-500 text-center py-12">No revenue data yet</p>
        ) : (
          <div className="space-y-2">
            {dailyData.map((d) => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-24 shrink-0">{d.date.slice(5)}</span>
                <div className="flex-1 h-6 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500"
                    style={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-300 w-20 text-right">₹{d.revenue.toFixed(0)}</span>
                <span className="text-xs text-zinc-500 w-16 text-right">({d.count})</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function ModelsTab() {
  const [supabase] = useState(getSupabase)
  const [models, setModels] = useState<AdminModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    async function load() {
      setLoading(true)
      const { data } = await sb.from("models").select("*").order("type").order("name")
      setModels((data as AdminModel[]) ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleToggle = async (model: AdminModel) => {
    if (!supabase) return
    await supabase.from("models").update({ enabled: !model.enabled }).eq("id", model.id)
    setModels((prev) => prev.map((m) => m.id === model.id ? { ...m, enabled: !m.enabled } : m))
  }

  const handleCostChange = async (model: AdminModel, cost: number) => {
    if (!supabase) return
    await supabase.from("models").update({ credit_cost: cost }).eq("id", model.id)
    setModels((prev) => prev.map((m) => m.id === model.id ? { ...m, credit_cost: cost } : m))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Model Management</h1>
        <p className="mt-1 text-sm text-zinc-500">Enable/disable AI models and configure pricing</p>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Model</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Type</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Provider</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Credit Cost</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800" /></td>
                  ))}
                </tr>
              )) : models.map((m) => (
                <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-300 font-medium">{m.name}</td>
                  <td className="px-4 py-3"><Badge variant={m.type === "image" ? "default" : "secondary"} className="text-[10px] capitalize">{m.type}</Badge></td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{m.provider}</td>
                  <td className="px-4 py-3">
                    <Input
                      type="number" min={1} value={m.credit_cost}
                      onChange={(e) => handleCostChange(m, parseInt(e.target.value) || 1)}
                      className="w-20 h-8 text-sm"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={m.enabled ? "success" : "secondary"} className="text-[10px]">{m.enabled ? "Enabled" : "Disabled"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(m)}>
                      {m.enabled ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-400" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function LogsTab() {
  const [supabase] = useState(getSupabase)
  const [logs, setLogs] = useState<SystemLog[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<string>("all")

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    async function load() {
      setLoading(true)
      let query = sb.from("system_logs").select("*").order("created_at", { ascending: false }).limit(100)
      if (levelFilter !== "all") query = query.eq("level", levelFilter)
      const { data } = await query
      setLogs((data as SystemLog[]) ?? [])
      setLoading(false)
    }
    load()
  }, [supabase, levelFilter])

  const levelBadge = (level: string) => {
    const colors: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
      info: "secondary", warn: "warning", error: "destructive", debug: "secondary",
    }
    return <Badge variant={colors[level] || "secondary"} className="text-[10px] capitalize">{level}</Badge>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">System Logs</h1>
          <p className="mt-1 text-sm text-zinc-500">Monitor system activity and errors</p>
        </div>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-300">
          <option value="all">All Levels</option>
          <option value="info">Info</option>
          <option value="warn">Warning</option>
          <option value="error">Error</option>
        </select>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-zinc-900">
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Time</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Level</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Action</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Message</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">User</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800" /></td>
                  ))}
                </tr>
              )) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-zinc-500">No logs yet</td></tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{formatDate(log.created_at)}</td>
                  <td className="px-4 py-3">{levelBadge(log.level)}</td>
                  <td className="px-4 py-3 text-zinc-300 font-mono text-xs">{log.action}</td>
                  <td className="px-4 py-3 text-zinc-400 max-w-[300px] truncate">{log.message || "-"}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{log.user_id ? log.user_id.slice(0, 8) + "..." : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function EmailTab() {
  const [supabase] = useState(getSupabase)
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [preview, setPreview] = useState(false)

  const handleSend = async () => {
    if (!supabase || !subject.trim() || !message.trim()) return
    setSending(true)
    const { data: users } = await supabase.from("users").select("email")
    const emails = (users || []).map((u: any) => u.email).filter(Boolean)
    await supabase.from("system_logs").insert({
      level: "info", action: "email_broadcast",
      message: `Broadcast email sent to ${emails.length} users. Subject: ${subject}`,
      metadata: { subject, recipient_count: emails.length },
    })
    toast.success(`Email broadcast logged! Would be sent to ${emails.length} users.`)
    setSubject(""); setMessage(""); setSending(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Email Broadcast</h1>
        <p className="mt-1 text-sm text-zinc-500">Send email to all registered users</p>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/40 max-w-2xl">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter email subject..." className="bg-zinc-800/50 border-zinc-700" />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your email message..." className="min-h-[200px] bg-zinc-800/50 border-zinc-700" />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSend} disabled={!subject.trim() || !message.trim() || sending} className="bg-purple-600 hover:bg-purple-700">
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
              Send to All Users
            </Button>
            <Button variant="outline" onClick={() => setPreview(!preview)}>Preview</Button>
          </div>
          {preview && (
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-sm font-medium text-zinc-300">Subject: {subject || "(no subject)"}</p>
              <p className="text-sm text-zinc-400 mt-2 whitespace-pre-wrap">{message || "(no message)"}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ModerationTab() {
  const [supabase] = useState(getSupabase)
  const [flagged, setFlagged] = useState<(Generation & { user?: { email: string } })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    async function load() {
      setLoading(true)
      const { data } = await sb.from("generations").select("*, user:users(email)").eq("flagged", true).order("created_at", { ascending: false })
      setFlagged(data ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleUnflag = async (id: string) => {
    if (!supabase) return
    await supabase.from("generations").update({ flagged: false, flagged_reason: null }).eq("id", id)
    setFlagged((prev) => prev.filter((g) => g.id !== id))
    toast.success("Content un-flagged")
  }

  const handleDelete = async (id: string) => {
    if (!supabase) return
    await supabase.from("generations").delete().eq("id", id)
    setFlagged((prev) => prev.filter((g) => g.id !== id))
    toast.success("Content deleted")
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Content Moderation</h1>
        <p className="mt-1 text-sm text-zinc-500">Review and manage flagged content</p>
      </div>
      <Card className="border-zinc-800/50 bg-zinc-900/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Preview</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Prompt</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">User</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Reason</th>
                <th className="px-4 py-3 text-left font-medium text-zinc-500">Date</th>
                <th className="px-4 py-3 text-right font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-800/50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800" /></td>
                  ))}
                </tr>
              )) : flagged.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-zinc-500">No flagged content</td></tr>
              ) : flagged.map((g) => (
                <tr key={g.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    {g.type === "image" && g.output_url ? (
                      <img src={g.output_url} alt="" className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="h-10 w-10 rounded bg-zinc-800 flex items-center justify-center"><VideoIcon className="h-5 w-5 text-zinc-600" /></div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-300 max-w-[200px] truncate">{g.prompt}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{g.user?.email || "Unknown"}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs max-w-[150px] truncate">{g.flagged_reason || "N/A"}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">{formatDate(g.created_at)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleUnflag(g.id)} className="text-green-400">Approve</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(g.id)} className="text-red-400"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

function ExportTab() {
  const [supabase] = useState(getSupabase)
  const [exporting, setExporting] = useState<string | null>(null)

  const exportCSV = async (table: string, filename: string) => {
    if (!supabase) return
    setExporting(table)
    const { data } = await supabase.from(table).select("*")
    if (!data || data.length === 0) {
      toast.error("No data to export")
      setExporting(null)
      return
    }
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map((row: any) =>
      Object.values(row).map((v) => {
        if (v === null || v === undefined) return ""
        const s = String(v)
        return s.includes(",") || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
      }).join(",")
    ).join("\n")
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `${table}_export_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(null)
    toast.success(`${table} exported successfully`)
  }

  const tables = [
    { key: "users", label: "Users", icon: Users },
    { key: "generations", label: "Generations", icon: ImageIcon },
    { key: "coupons", label: "Coupons", icon: Tag },
    { key: "system_logs", label: "System Logs", icon: ScrollText },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Export Data</h1>
        <p className="mt-1 text-sm text-zinc-500">Download platform data as CSV</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tables.map((t) => {
          const Icon = t.icon
          return (
            <Card key={t.key} className="border-zinc-800/50 bg-zinc-900/40 hover:border-zinc-700 transition-colors cursor-pointer" onClick={() => !exporting && exportCSV(t.key, t.key)}>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Icon className="h-10 w-10 text-purple-400 mb-3" />
                <p className="text-sm font-medium text-zinc-300">{t.label}</p>
                <p className="text-xs text-zinc-600 mt-1">
                  {exporting === t.key ? "Exporting..." : "Click to export CSV"}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function RateLimitsTab() {
  const [supabase] = useState(getSupabase)
  const [limits, setLimits] = useState<RateLimit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    async function load() {
      setLoading(true)
      const { data } = await sb.from("rate_limits").select("*").order("plan")
      setLimits((data as RateLimit[]) ?? [])
      setLoading(false)
    }
    load()
  }, [supabase])

  const handleLimitChange = async (id: string, field: string, value: number) => {
    if (!supabase) return
    await supabase.from("rate_limits").update({ [field]: value }).eq("id", id)
    setLimits((prev) => prev.map((l) => l.id === id ? { ...l, [field]: value } : l))
    toast.success("Rate limit updated")
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Rate Limits</h1>
        <p className="mt-1 text-sm text-zinc-500">Configure rate limits per subscription plan</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {loading ? Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 bg-zinc-800 rounded-xl" />
        )) : limits.map((l) => (
          <Card key={l.id} className="border-zinc-800/50 bg-zinc-900/40">
            <CardHeader>
              <CardTitle className="text-zinc-100 capitalize">{l.plan} Plan</CardTitle>
              <CardDescription>Rate limits for {l.plan} subscribers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Max Daily Generations</Label>
                <Input type="number" value={l.max_daily_generations} onChange={(e) => handleLimitChange(l.id, "max_daily_generations", parseInt(e.target.value) || 0)} className="bg-zinc-800/50 border-zinc-700" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-zinc-500">Max Concurrent Generations</Label>
                <Input type="number" value={l.max_concurrent} onChange={(e) => handleLimitChange(l.id, "max_concurrent", parseInt(e.target.value) || 0)} className="bg-zinc-800/50 border-zinc-700" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function FeaturesTab() {
  const [supabase] = useState(getSupabase)
  const [flags, setFlags] = useState<FeatureFlag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    async function load() {
      setLoading(true)
      const { data } = await sb.from("feature_flags").select("*").order("label")
      setFlags((data as FeatureFlag[]) ?? [])
      setLoading(false)
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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Feature Flags</h1>
        <p className="mt-1 text-sm text-zinc-500">Toggle platform features on/off</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 bg-zinc-800 rounded-xl" />
        )) : flags.map((flag) => (
          <Card key={flag.id} className="border-zinc-800/50 bg-zinc-900/40">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="text-sm font-medium text-zinc-200">{flag.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{flag.description}</p>
              </div>
              <Switch checked={flag.enabled} onCheckedChange={() => handleToggle(flag)} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
