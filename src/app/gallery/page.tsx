"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import {
  Heart,
  ImageIcon,
  VideoIcon,
  Search,
  Loader2,
  X,
  Sparkles,
  ArrowUpDown,
  Eye,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/useDebounce"
import { useUser } from "@/hooks/useUser"
import type { GalleryGeneration, GenerationType } from "@/types"

const ITEMS_PER_PAGE = 12

type SortMode = "newest" | "popular"
type TypeFilter = "all" | GenerationType

export default function GalleryPage() {
  const [supabase] = useState(() => {
    try { return createClient() } catch { return null }
  })
  const { user } = useUser()
  const [generations, setGenerations] = useState<GalleryGeneration[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all")
  const [sort, setSort] = useState<SortMode>("newest")
  const [previewGen, setPreviewGen] = useState<GalleryGeneration | null>(null)
  const debouncedSearch = useDebounce(search, 400)
  useEffect(() => {
    if (!supabase) return
    const sb = supabase
    let cancelled = false
    async function load() {
      const from = 0
      const to = ITEMS_PER_PAGE - 1
      setLoading(true)

      let query = sb
        .from("generations")
        .select("*, user:users(email)", { count: "exact" })
        .eq("is_public", true)
        .eq("status", "completed")
        .range(from, to)

      if (typeFilter !== "all") query = query.eq("type", typeFilter)
      if (debouncedSearch) query = query.ilike("prompt", `%${debouncedSearch}%`)
      if (sort === "newest") {
        query = query.order("created_at", { ascending: false })
      } else {
        query = query.order("likes_count", { ascending: false })
      }

      const { data, count, error } = await query
      if (cancelled) return

      if (error) {
        console.error("Error fetching gallery:", error)
        setLoading(false)
        return
      }

      const items = (data as unknown as GalleryGeneration[]) || []

      if (user) {
        const genIds = items.map((g) => g.id)
        if (genIds.length > 0) {
          const { data: likes } = await sb
            .from("likes")
            .select("generation_id")
            .eq("user_id", user.id)
            .in("generation_id", genIds)
          if (likes && !cancelled) {
            const liked = new Set(likes.map((l) => l.generation_id))
            setLikedIds((prev) => {
              const next = new Set(prev)
              liked.forEach((id) => next.add(id))
              return next
            })
          }
        }
      }

      if (!cancelled) {
        setGenerations(items)
        if (count !== null) setHasMore(from + ITEMS_PER_PAGE < count)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [supabase, user, typeFilter, debouncedSearch, sort])

  const handleLoadMore = async () => {
    if (!supabase) return
    const sb = supabase
    const nextPage = page + 1
    setPage(nextPage)
    setLoadingMore(true)
    const from = nextPage * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    let query = sb
      .from("generations")
      .select("*, user:users(email)", { count: "exact" })
      .eq("is_public", true)
      .eq("status", "completed")
      .range(from, to)

    if (typeFilter !== "all") query = query.eq("type", typeFilter)
    if (debouncedSearch) query = query.ilike("prompt", `%${debouncedSearch}%`)
    if (sort === "newest") {
      query = query.order("created_at", { ascending: false })
    } else {
      query = query.order("likes_count", { ascending: false })
    }

    const { data, count, error } = await query
    if (error) {
      console.error("Error loading more:", error)
      setLoadingMore(false)
      return
    }

    const items = (data as unknown as GalleryGeneration[]) || []

    if (user) {
      const genIds = items.map((g) => g.id)
      if (genIds.length > 0) {
        const { data: likes } = await sb
          .from("likes")
          .select("generation_id")
          .eq("user_id", user.id)
          .in("generation_id", genIds)
        if (likes) {
          const liked = new Set(likes.map((l) => l.generation_id))
          setLikedIds((prev) => {
            const next = new Set(prev)
            liked.forEach((id) => next.add(id))
            return next
          })
        }
      }
    }

    setGenerations((prev) => [...prev, ...items])
    if (count !== null) setHasMore(from + ITEMS_PER_PAGE < count)
    setLoadingMore(false)
  }

  const handleToggleLike = async (generationId: string) => {
    if (!user || !supabase) return
    const sb = supabase

    const isLiked = likedIds.has(generationId)

    if (isLiked) {
      await sb
        .from("likes")
        .delete()
        .eq("user_id", user.id)
        .eq("generation_id", generationId)

      setLikedIds((prev) => {
        const next = new Set(prev)
        next.delete(generationId)
        return next
      })
      setGenerations((prev) =>
        prev.map((g) =>
          g.id === generationId
            ? { ...g, likes_count: Math.max(0, g.likes_count - 1) }
            : g
        )
      )
    } else {
      await sb.from("likes").insert({
        user_id: user.id,
        generation_id: generationId,
      })

      setLikedIds((prev) => {
        const next = new Set(prev)
        next.add(generationId)
        return next
      })
      setGenerations((prev) =>
        prev.map((g) =>
          g.id === generationId
            ? { ...g, likes_count: g.likes_count + 1 }
            : g
        )
      )
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
              Gallery
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Explore AI-generated art from the community
            </p>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                placeholder="Search prompts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-9"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded-lg border border-zinc-800 p-0.5 bg-zinc-900/50">
                {(["all", "image", "video"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                      typeFilter === t
                        ? "bg-zinc-800 text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {t === "image" && <ImageIcon className="h-3.5 w-3.5" />}
                    {t === "video" && <VideoIcon className="h-3.5 w-3.5" />}
                    {t === "all" ? "All" : t === "image" ? "Images" : "Videos"}
                  </button>
                ))}
              </div>

              <Select
                value={sort}
                onValueChange={(v: SortMode) => setSort(v)}
              >
                <SelectTrigger className="w-[130px]">
                  <ArrowUpDown className="mr-2 h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most Liked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-900/40"
                >
                  <Skeleton className="aspect-square rounded-none" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : generations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-900/20 to-zinc-900">
                <Sparkles className="h-12 w-12 text-purple-500/50" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-300">
                No generations found
              </h3>
              <p className="mt-2 max-w-md text-sm text-zinc-500">
                {debouncedSearch
                  ? "Try a different search term or filter"
                  : "No public generations yet. Be the first to share!"}
              </p>
            </div>
          ) : (
            <>
              <AnimatePresence mode="popLayout">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {generations.map((gen, i) => (
                    <motion.div
                      key={gen.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: (i % ITEMS_PER_PAGE) * 0.02 }}
                    >
                      <Card className="group overflow-hidden border-zinc-800/50 bg-zinc-900/40 hover:border-zinc-700/50 transition-all duration-300 cursor-pointer"
                        onClick={() => setPreviewGen(gen)}
                      >
                        <div className="relative aspect-square overflow-hidden bg-zinc-950">
                          {gen.type === "image" ? (
                            <Image
                              src={gen.output_url}
                              alt={gen.prompt}
                              fill
                              className="object-cover transition-all duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />
                          ) : (
                            <video
                              src={gen.output_url}
                              className="h-full w-full object-cover"
                              muted
                              loop
                              autoPlay
                              playsInline
                            />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute top-2 left-2">
                            <Badge
                              variant={gen.type === "image" ? "default" : "secondary"}
                              className="text-[10px] px-1.5 py-0.5"
                            >
                              {gen.type === "image" ? (
                                <ImageIcon className="h-3 w-3 mr-1" />
                              ) : (
                                <VideoIcon className="h-3 w-3 mr-1" />
                              )}
                              {gen.type === "image" ? "Image" : "Video"}
                            </Badge>
                          </div>
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-zinc-300">
                              <Eye className="h-3 w-3" />
                              Preview
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          <p className="text-sm text-zinc-300 line-clamp-2 leading-snug">
                            {gen.prompt}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 text-zinc-500 min-w-0">
                              <span className="truncate max-w-[120px]">
                                {gen.user?.email?.split("@")[0] ?? "Anonymous"}
                              </span>
                              <span className="text-zinc-700">&bull;</span>
                              <span className="whitespace-nowrap">
                                {formatDistanceToNow(new Date(gen.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleLike(gen.id)
                              }}
                              className={cn(
                                "flex items-center gap-1 rounded-full px-2 py-0.5 transition-all duration-200",
                                likedIds.has(gen.id)
                                  ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
                                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
                              )}
                            >
                              <Heart
                                className={cn(
                                  "h-3.5 w-3.5",
                                  likedIds.has(gen.id) && "fill-red-400"
                                )}
                              />
                              <span>{gen.likes_count}</span>
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="min-w-[160px]"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </main>

      <Dialog open={!!previewGen} onOpenChange={(open) => !open && setPreviewGen(null)}>
        <DialogContent className="max-w-4xl w-[90vw] p-0 overflow-hidden bg-zinc-900 border-zinc-800">
          <DialogTitle className="sr-only">
            {previewGen?.prompt ?? "Generation preview"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Full size preview of the AI generation
          </DialogDescription>
          {previewGen && (
            <div className="relative">
              {previewGen.type === "image" ? (
                <div className="relative max-h-[80vh] w-full">
                  <Image
                    src={previewGen.output_url}
                    alt={previewGen.prompt}
                    width={previewGen.width || 1024}
                    height={previewGen.height || 1024}
                    className="w-full h-auto max-h-[80vh] object-contain"
                    priority
                  />
                </div>
              ) : (
                <video
                  src={previewGen.output_url}
                  className="w-full max-h-[80vh] object-contain"
                  controls
                  autoPlay
                  playsInline
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-12">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-zinc-100 line-clamp-2">
                      {previewGen.prompt}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                      <Badge
                        variant={previewGen.type === "image" ? "default" : "secondary"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {previewGen.type === "image" ? "Image" : "Video"}
                      </Badge>
                      <span>
                        {previewGen.user?.email?.split("@")[0] ?? "Anonymous"}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(previewGen.created_at), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {previewGen.likes_count}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={likedIds.has(previewGen.id) ? "default" : "outline"}
                    className={cn(
                      "shrink-0 gap-1.5",
                      likedIds.has(previewGen.id) && "bg-red-600 hover:bg-red-700 border-red-600"
                    )}
                    onClick={() => handleToggleLike(previewGen.id)}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        likedIds.has(previewGen.id) && "fill-white"
                      )}
                    />
                    {likedIds.has(previewGen.id) ? "Liked" : "Like"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
