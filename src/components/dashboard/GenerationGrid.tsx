"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ImageIcon,
  VideoIcon,
  ArrowUpDown,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GenerationCard } from "./GenerationCard"
import { useGenerations } from "@/hooks/useGenerations"
import type { Generation, GenerationType } from "@/types"

type SortMode = "date" | "popularity"

function GridSkeleton() {
  return (
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
  )
}

function EmptyGrid() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-900/20 to-zinc-900">
        <Sparkles className="h-12 w-12 text-purple-500/50" />
      </div>
      <h3 className="text-xl font-semibold text-zinc-300">No generations yet</h3>
      <p className="mt-2 max-w-md text-sm text-zinc-500">
        Your creative journey starts here. Use the form above to generate your first AI-powered image or video.
      </p>
    </div>
  )
}

interface GenerationGridProps {
  filterType?: "all" | GenerationType
  onDelete?: (id: string) => void
  onLike?: (id: string) => void
  onDownload?: (url: string) => void
  onShare?: (generation: Generation) => void
}

export function GenerationGrid({
  filterType: externalFilter,
  onDelete,
  onLike,
  onDownload,
  onShare,
}: GenerationGridProps) {
  const [internalFilter, setInternalFilter] = useState<string>("all")
  const [sort, setSort] = useState<SortMode>("date")
  const { generations, loading, fetchGenerations, toggleLike, removeGeneration } = useGenerations()

  const activeFilter = externalFilter || internalFilter
  const isExternal = externalFilter !== undefined

  useEffect(() => {
    fetchGenerations({ page: 0 })
  }, [fetchGenerations])

  const filtered = activeFilter === "all"
    ? [...generations]
    : generations.filter((g) => g.type === activeFilter)

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "popularity") return b.likes_count - a.likes_count
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  const handleLike = async (id: string) => {
    await toggleLike(id)
    onLike?.(id)
  }

  const handleDelete = (id: string) => {
    removeGeneration(id)
    onDelete?.(id)
  }

  const handleDownload = (url: string) => {
    window.open(url, "_blank")
    onDownload?.(url)
  }

  const handleShare = (generation: Generation) => {
    if (navigator.share) {
      navigator.share({
        title: "Check out my AI generation!",
        text: generation.prompt,
        url: generation.output_url,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(generation.output_url)
    }
    onShare?.(generation)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {!isExternal && (
          <Tabs value={activeFilter} onValueChange={setInternalFilter}>
            <TabsList>
              <TabsTrigger value="all" className="gap-1.5">
                All
              </TabsTrigger>
              <TabsTrigger value="image" className="gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" /> Images
              </TabsTrigger>
              <TabsTrigger value="video" className="gap-1.5">
                <VideoIcon className="h-3.5 w-3.5" /> Videos
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setSort(sort === "date" ? "popularity" : "date")}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sort === "date" ? "Newest" : "Popular"}
        </Button>
      </div>

      {loading ? (
        <GridSkeleton />
      ) : sorted.length === 0 ? (
        <EmptyGrid />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sorted.map((gen) => (
              <GenerationCard
                key={gen.id}
                generation={gen}
                onDelete={handleDelete}
                onLike={handleLike}
                onDownload={handleDownload}
                onShare={handleShare}
              />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
