"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import {
  Users,
  Image as ImageIcon,
  CreditCard,
  DollarSign,
  Search,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  VideoIcon,
  Sparkles,
  Tag,
  Shield,
  ShieldOff,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useUser } from "@/hooks/useUser"
import type { User, Generation, Coupon } from "@/types"
import { formatDate, formatCredits, formatPrice } from "@/lib/utils"

function getSupabase() {
  if (typeof window === "undefined") return null
  try { return createClient() } catch { return null }
}

interface AdminStats {
  totalUsers: number
  totalGenerations: number
  activeSubscriptions: number
  totalRevenue: number
}

export default function AdminPageContent() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "generations" | "coupons">("overview")

  useEffect(() => {
    if (!userLoading && (!user || !user.is_admin)) {
      router.push("/dashboard")
    }
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

        <div className="flex gap-1 mb-8 p-1 bg-zinc-900 rounded-lg w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-purple-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
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
                  {Array.from({ length: 8 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full bg-zinc-800" /></td>
                  ))}
                </tr>
              )) : users.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-zinc-500">No users found</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-300">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.is_admin ? (
                      <Shield className="h-4 w-4 text-purple-400" />
                    ) : (
                      <span className="text-zinc-600">-</span>
                    )}
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
          <DialogHeader>
            <DialogTitle>{adminTarget?.is_admin ? "Remove Admin" : "Make Admin"}</DialogTitle>
          </DialogHeader>
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
