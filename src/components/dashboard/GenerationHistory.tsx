"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  Download,
  Trash2,
  ImageIcon,
  VideoIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  FileImage,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn, formatDate, formatCredits } from "@/lib/utils"
import { useGenerations } from "@/hooks/useGenerations"
import { usePagination } from "@/hooks/usePagination"
import type { Generation, GenerationType, GenerationStatus } from "@/types"

const statusConfig: Record<
  GenerationStatus,
  { label: string; icon: React.ReactNode; variant: "default" | "secondary" | "success" | "destructive" | "warning" }
> = {
  pending: { label: "Pending", icon: <Clock className="h-3 w-3" />, variant: "secondary" },
  processing: { label: "Processing", icon: <Loader2 className="h-3 w-3 animate-spin" />, variant: "warning" },
  completed: { label: "Completed", icon: <CheckCircle2 className="h-3 w-3" />, variant: "success" },
  failed: { label: "Failed", icon: <XCircle className="h-3 w-3" />, variant: "destructive" },
}

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-lg border border-zinc-800/50 p-4">
          <Skeleton className="h-16 w-16 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-800/50">
        <FileImage className="h-10 w-10 text-zinc-600" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-300">No generations yet</h3>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">
        Your generated images and videos will appear here. Start by creating your first generation.
      </p>
    </div>
  )
}

export function GenerationHistory() {
  const [filterType, setFilterType] = useState<string>("all")
  const { generations, loading, fetchGenerations, removeGeneration } = useGenerations()
  const [totalCount, setTotalCount] = useState(0)

  const filtered = filterType === "all" ? generations : generations.filter((g) => g.type === filterType)

  const { currentPage, totalPages, from, to, pageNumbers, isFirstPage, isLastPage, goToPage, nextPage, prevPage } =
    usePagination({ totalItems: totalCount, itemsPerPage: 10 })

  useEffect(() => {
    const load = async () => {
      const params: { page?: number; type?: GenerationType } = { page: currentPage - 1 }
      if (filterType !== "all") params.type = filterType as GenerationType
      const result = await fetchGenerations(params)
      if (result?.count !== undefined && result?.count !== null) setTotalCount(result.count)
    }
    load()
  }, [currentPage, filterType, fetchGenerations])

  const handleDownload = (url: string) => {
    window.open(url, "_blank")
  }

  const handleDelete = async (id: string) => {
    removeGeneration(id)
    const supabase = (await import("@/lib/supabase/client")).createClient()
    await supabase.from("generations").delete().eq("id", id)
  }

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/40">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Generation History</CardTitle>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="image">
              <span className="flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5" /> Images
              </span>
            </SelectItem>
            <SelectItem value="video">
              <span className="flex items-center gap-2">
                <VideoIcon className="h-3.5 w-3.5" /> Videos
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {loading ? (
          <HistorySkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {filtered.map((gen) => {
                  const status = statusConfig[gen.status]
                  const previewUrl = gen.output_url || gen.output_urls?.[0]

                  return (
                    <motion.div
                      key={gen.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-4 rounded-lg border border-zinc-800/50 bg-zinc-900/30 p-3 transition-colors hover:border-zinc-700/50"
                    >
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-zinc-950">
                        {previewUrl ? (
                          gen.type === "image" ? (
                            <Image src={previewUrl} alt="" fill className="object-cover" sizes="64px" />
                          ) : (
                            <video src={previewUrl} className="h-full w-full object-cover" muted />
                          )
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            {gen.type === "image" ? (
                              <ImageIcon className="h-6 w-6 text-zinc-700" />
                            ) : (
                              <VideoIcon className="h-6 w-6 text-zinc-700" />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-zinc-200">{gen.prompt}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                          <Badge variant={gen.type === "image" ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                            {gen.type === "image" ? "Image" : "Video"}
                          </Badge>
                          <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
                            {status.icon}
                            <span className="ml-0.5">{status.label}</span>
                          </Badge>
                          <span>{formatCredits(gen.credits_used)} credits</span>
                          <span>&middot; {formatDate(gen.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-zinc-400 hover:text-zinc-200"
                          onClick={() => handleDownload(previewUrl)}
                          disabled={gen.status !== "completed" || !previewUrl}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={() => handleDelete(gen.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={prevPage}
                  disabled={isFirstPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {pageNumbers.map((page, idx) =>
                  page === "ellipsis" ? (
                    <span key={`e-${idx}`} className="px-1 text-xs text-zinc-600">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "ghost"}
                      size="icon"
                      className="h-8 w-8 text-xs"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={nextPage}
                  disabled={isLastPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
