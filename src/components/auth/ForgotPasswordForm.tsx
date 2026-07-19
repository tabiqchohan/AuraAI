"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Mail, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [supabase] = useState(() => {
    try { return createClient() } catch { return null }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabase) return
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    toast.success("Check your email for the reset link")
    setLoading(false)
  }

  if (sent) {
    return (
      <Card className="w-full max-w-md mx-auto border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-600/10">
            <Mail className="h-6 w-6 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-100">Check your email</CardTitle>
          <CardDescription className="text-zinc-400">
            We&apos;ve sent a password reset link to <strong className="text-zinc-300">{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-zinc-500">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <button
              onClick={() => { setSent(false); setEmail("") }}
              className="font-medium text-purple-400 hover:text-purple-300 transition-colors bg-transparent border-none cursor-pointer"
            >
              try again
            </button>
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto border-zinc-800 bg-zinc-900/50 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/10">
          <Mail className="h-6 w-6 text-purple-500" />
        </div>
        <CardTitle className="text-2xl font-bold text-zinc-100">Forgot password?</CardTitle>
        <CardDescription className="text-zinc-400">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-purple-600 focus:ring-purple-600"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Send Reset Link
          </Button>
        </form>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
