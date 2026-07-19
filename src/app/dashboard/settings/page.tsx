"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, LogOut, Loader2 } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your account settings</p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <User className="h-5 w-5 text-purple-400" />
            Profile
          </CardTitle>
          <CardDescription className="text-zinc-400">Update your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display-name" className="text-zinc-300">Display Name</Label>
            <Input id="display-name" placeholder="Your name" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email" className="text-zinc-300">Email</Label>
            <Input id="settings-email" type="email" placeholder="you@example.com" className="bg-zinc-800/50 border-zinc-700 text-zinc-100 placeholder:text-zinc-500" />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}