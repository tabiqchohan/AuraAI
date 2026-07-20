"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ImageIcon, VideoIcon, Search, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { GenerationCard } from "@/components/dashboard/GenerationCard"
import type { GalleryGeneration } from "@/types"
import { formatDistanceToNow } from "date-fns"

export default function GalleryPage() {
  const [generations, setGenerations] = useState<GalleryGeneration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    fetchGallery()
  }, [typeFilter])

  const fetchGallery = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (typeFilter !== "all") params.set("type", typeFilter)
      params.set("sort", "created_at")
      params.set("order", "desc")
      params.set("limit", "50")

      const res = await fetch(`/api/gallery?${params}`)
      const json = await res.json()
      setGenerations(json.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchGallery()
  }

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Community Gallery</h1>
        <p className="mt-1 text-sm text-zinc-500">Explore creations from the AuraAI community</p>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 text-zinc-100"
          />
          <Button type="submit" variant="outline" className="border-zinc-700">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex gap-1 p-1 bg-zinc-900 rounded-lg w-fit">
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
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/40">
              <Skeleton className="aspect-square rounded-none" />
              <div className="p-3 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : generations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-900/20 to-zinc-900">
            <Sparkles className="h-12 w-12 text-purple-500/50" />
          </div>
          <h3 className="text-lg font-medium text-zinc-400">No generations yet</h3>
          <p className="mt-1 text-sm text-zinc-600">Be the first to create and share!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {generations.map((gen) => (
            <GenerationCard key={gen.id} generation={gen} />
          ))}
        </div>
      )}
    </motion.div>
  )
}