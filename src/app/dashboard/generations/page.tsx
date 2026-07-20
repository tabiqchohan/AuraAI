"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ImageIcon, VideoIcon, Sparkles, Trash2, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/useUser"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Generation } from "@/types"

const statusColors: Record<string, string> = {
  completed: "bg-green-500/10 text-green-400",
  processing: "bg-yellow-500/10 text-yellow-400",
  pending: "bg-zinc-500/10 text-zinc-400",
  failed: "bg-red-500/10 text-red-400",
}

export default function MyGenerationsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    if (!user) return
    loadGenerations()
  }, [user, typeFilter])

  const loadGenerations = async () => {
    setLoading(true)
    const supabase = createClient()
    let query = supabase
      .from("generations")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })

    if (typeFilter !== "all") query = query.eq("type", typeFilter)

    const { data } = await query
    setGenerations((data as Generation[]) || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("generations").delete().eq("id", id)
    if (error) {
      toast.error("Failed to delete")
    } else {
      setGenerations((prev) => prev.filter((g) => g.id !== id))
      toast.success("Deleted")
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">My Generations</h1>
        <p className="mt-1 text-sm text-zinc-500">All your AI creations in one place</p>
      </div>

      <div className="mb-6 flex gap-1 p-1 bg-zinc-900 rounded-lg w-fit">
        {["all", "image", "video"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              typeFilter === t ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {t === "image" && <ImageIcon className="h-3.5 w-3.5" />}
            {t === "video" && <VideoIcon className="h-3.5 w-3.5" />}
            {t === "all" && <Sparkles className="h-3.5 w-3.5" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full bg-zinc-800 rounded-xl" />
          ))}
        </div>
      ) : generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-900/20 to-zinc-900">
            <Sparkles className="h-12 w-12 text-purple-500/50" />
          </div>
          <h3 className="text-lg font-medium text-zinc-400">No generations yet</h3>
          <p className="mt-1 text-sm text-zinc-600">Create your first image or video</p>
        </div>
      ) : (
        <div className="space-y-3">
          {generations.map((gen) => (
            <div key={gen.id} className="flex items-center gap-4 rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 hover:border-zinc-700 transition-colors">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
                {gen.output_url ? (
                  gen.type === "image" ? (
                    <img src={gen.output_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <VideoIcon className="h-6 w-6" />
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700">
                    {gen.type === "image" ? <ImageIcon className="h-6 w-6" /> : <VideoIcon className="h-6 w-6" />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{gen.prompt}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-[10px] capitalize">{gen.type}</Badge>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${statusColors[gen.status] || ""}`}>{gen.status}</span>
                  <span className="text-[10px] text-zinc-600">{formatDate(gen.created_at)}</span>
                  <span className="text-[10px] text-zinc-600">{gen.credits_used} credits</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard?prompt=${encodeURIComponent(gen.prompt)}`)} title="Re-generate with this prompt">
                  <RefreshCw className="h-4 w-4 text-zinc-400 hover:text-purple-400" />
                </Button>
                {gen.output_url && (
                  <Button variant="ghost" size="icon" asChild>
                    <a href={gen.output_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => handleDelete(gen.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}