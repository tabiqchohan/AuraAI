"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/useUser"
import { useCredits } from "@/hooks/useCredits"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Mail, CreditCard, Calendar, Shield, LogOut, Settings, Loader2, Sparkles } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

export default function ProfilePage() {
  const { user, loading } = useUser()
  const { credits } = useCredits()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  if (!user) return null

  const planBadge = (plan: string) => {
    const colors: Record<string, "default" | "success" | "secondary"> = {
      free: "secondary", basic: "default", pro: "success",
    }
    return <Badge variant={colors[plan] || "secondary"} className="capitalize">{plan}</Badge>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Profile</h1>
        <p className="mt-1 text-sm text-zinc-500">Your account information and settings</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <User className="h-5 w-5 text-purple-400" />
                Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://avatar.vercel.sh/${user.email}`} alt={user.email} />
                  <AvatarFallback className="text-lg">{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-semibold text-zinc-100">{user.email?.split("@")[0]}</h2>
                  <p className="text-sm text-zinc-500">{user.email}</p>
                </div>
              </div>

              <Separator className="bg-zinc-800" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Email</p>
                    <p className="text-sm font-medium text-zinc-100">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Plan</p>
                    <div>{planBadge(user.subscription_plan)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Credits</p>
                    <p className="text-sm font-medium text-zinc-100">{credits.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">Joined</p>
                    <p className="text-sm font-medium text-zinc-100">{formatDate(user.created_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="text-zinc-100 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full justify-start border-zinc-700">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="outline" className="w-full justify-start border-zinc-700">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Manage Subscription
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start border-zinc-700 text-red-400 hover:text-red-300 hover:border-red-900"
                onClick={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="mr-2 h-4 w-4" />
                )}
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {user.is_admin && (
            <Card className="border-purple-800/50 bg-purple-900/20">
              <CardHeader>
                <CardTitle className="text-purple-300 flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Admin Access
                </CardTitle>
                <CardDescription className="text-purple-400/60">You have administrator privileges</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin">
                  <Button variant="premium" className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Open Admin Panel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}