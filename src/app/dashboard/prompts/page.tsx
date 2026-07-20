"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Bookmark, Trash2, ImageIcon, VideoIcon, Sparkles, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/useUser"
import { formatDate } from "@/lib/utils"
import { toast } from "sonner"
import type { SavedPrompt } from "@/types"

export default function SavedPromptsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [prompts, setPrompts] = useState<SavedPrompt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadPrompts()
  }, [user])

  const loadPrompts = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("saved_prompts")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
    setPrompts((data as SavedPrompt[]) || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("saved_prompts").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete")
    } else {
      setPrompts((prev) => prev.filter((p) => p.id !== id))
      toast.success("Deleted")
    }
  }

  const handleUsePrompt = (prompt: SavedPrompt) => {
    router.push(`/dashboard?prompt=${encodeURIComponent(prompt.prompt)}&type=${prompt.type || "image"}`)
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Saved Prompts</h1>
        <p className="mt-1 text-sm text-zinc-500">Your collection of favorite prompts</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full bg-zinc-800 rounded-xl" />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-900/20 to-zinc-900">
            <Bookmark className="h-12 w-12 text-purple-500/50" />
          </div>
          <h3 className="text-lg font-medium text-zinc-400">No saved prompts</h3>
          <p className="mt-1 text-sm text-zinc-600">Save prompts to reuse them later</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prompts.map((prompt) => (
            <div key={prompt.id} className="rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-5 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-zinc-100">{prompt.title}</h3>
                    {prompt.type && (
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {prompt.type === "image" ? <ImageIcon className="h-3 w-3 mr-1" /> : <VideoIcon className="h-3 w-3 mr-1" />}
                        {prompt.type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2">{prompt.prompt}</p>
                  {prompt.negative_prompt && (
                    <p className="text-xs text-zinc-600 mt-1 line-clamp-1">Negative: {prompt.negative_prompt}</p>
                  )}
                  <p className="text-xs text-zinc-600 mt-2">{formatDate(prompt.created_at)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="outline" size="sm" className="border-zinc-700 text-xs" onClick={() => handleUsePrompt(prompt)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Use
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(prompt.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}