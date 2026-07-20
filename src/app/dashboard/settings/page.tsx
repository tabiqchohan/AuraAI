"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/useUser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import {
  User, Mail, Bell, Trash2, Loader2, AlertTriangle, MessageSquare,
} from "lucide-react"
import Link from "next/link"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [displayName, setDisplayName] = useState(user?.email?.split("@")[0] || "")

  const handleSaveProfile = async () => {
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Profile updated successfully")
    setSaving(false)
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from("users").delete().eq("id", user?.id)
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Settings</h1>
        <p className="mt-1 text-sm text-zinc-500">Manage your account and preferences</p>
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
            <Input
              id="display-name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="bg-zinc-800/50 border-zinc-700 text-zinc-100"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-email" className="text-zinc-300">Email</Label>
            <Input
              id="settings-email"
              value={user?.email || ""}
              disabled
              className="bg-zinc-800/50 border-zinc-700 text-zinc-500 cursor-not-allowed"
            />
            <p className="text-xs text-zinc-600">Email cannot be changed</p>
          </div>
          <Button onClick={handleSaveProfile} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-400" />
            Notifications
          </CardTitle>
          <CardDescription className="text-zinc-400">Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Email notifications</p>
              <p className="text-xs text-zinc-500">Receive updates about your generations</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Marketing emails</p>
              <p className="text-xs text-zinc-500">Tips, updates, and offers</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-400" />
            Feedback
          </CardTitle>
          <CardDescription className="text-zinc-400">Help us improve AuraAI</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/feedback">
            <Button variant="outline" className="w-full border-zinc-700 justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Feedback
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-red-900/50 bg-red-900/10">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-400/60">
            Irreversible actions. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-100">Delete Account</p>
              <p className="text-xs text-zinc-500">Permanently delete your account and all data</p>
            </div>
            <Button
              variant="outline"
              className="border-red-900 text-red-400 hover:bg-red-900/20 hover:text-red-300"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Account</DialogTitle>
            <DialogDescription>
              This action is permanent and cannot be undone. All your data, generations, and credits will be deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-red-900/10 p-4 text-sm text-red-400">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              Warning: This will delete all your generations and account data.
            </div>
            <div className="space-y-2">
              <Label>Type <span className="font-bold text-red-400">DELETE</span> to confirm</Label>
              <Input
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="bg-zinc-800/50 border-red-900/50 text-zinc-100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== "DELETE" || deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}