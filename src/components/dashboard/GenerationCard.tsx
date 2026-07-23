"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Download,
  Heart,
  Trash2,
  Share2,
  ImageIcon,
  VideoIcon,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn, formatDate, formatCredits } from "@/lib/utils"
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

interface GenerationCardProps {
  generation: Generation
  onDelete?: (id: string) => void
  onLike?: (id: string) => void
  onDownload?: (url: string) => void
  onShare?: (generation: Generation) => void
}

export function GenerationCard({ generation, onDelete, onLike, onDownload, onShare }: GenerationCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [liked, setLiked] = useState(false)

  const status = statusConfig[generation.status]
  const isImage = generation.type === "image"
  const previewUrl = generation.output_url || generation.output_urls?.[0]

  const handleLike = () => {
    setLiked(!liked)
    onLike?.(generation.id)
  }

  const handleDownload = () => {
    if (previewUrl) onDownload?.(previewUrl)
  }

  const handleShare = () => {
    onShare?.(generation)
  }

  const handleDelete = () => {
    onDelete?.(generation.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className="group relative overflow-hidden border-zinc-800/50 bg-zinc-900/40 hover:border-purple-500/30 transition-all duration-500 hover:shadow-xl hover:shadow-purple-600/10">
        <div className="relative aspect-square overflow-hidden bg-zinc-950">
          {previewUrl && !imageError ? (
            <>
              {isImage ? (
                <Image
                  src={previewUrl}
                  alt={generation.prompt}
                  fill
                  className={cn(
                    "object-cover transition-all duration-700 group-hover:scale-110",
                    imageLoaded ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <video
                  src={previewUrl}
                  className="h-full w-full object-cover"
                  muted
                  loop
                  autoPlay
                  playsInline
                  onLoadedData={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              )}
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950">
              {isImage ? (
                <ImageIcon className="h-12 w-12 text-zinc-700" />
              ) : (
                <VideoIcon className="h-12 w-12 text-zinc-700" />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-1 group-hover:translate-y-0">
            <Badge variant={isImage ? "default" : "secondary"} className="text-[10px] px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border-0">
              {isImage ? <ImageIcon className="h-3 w-3 mr-1" /> : <VideoIcon className="h-3 w-3 mr-1" />}
              {isImage ? "Image" : "Video"}
            </Badge>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-y-1 group-hover:translate-y-0">
            <Badge variant={status.variant} className="text-[10px] px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border-0 shadow-lg">
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 p-3 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
            <Button
              size="icon"
              className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 text-zinc-200 shadow-lg"
              onClick={handleDownload}
              disabled={generation.status !== "completed"}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 shadow-lg",
                liked ? "text-red-400" : "text-zinc-200"
              )}
              onClick={handleLike}
              disabled={generation.status !== "completed"}
              title="Like"
            >
              <Heart className={cn("h-4 w-4", liked && "fill-red-400")} />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 text-zinc-200 shadow-lg"
              onClick={handleShare}
              disabled={generation.status !== "completed"}
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 text-red-400 hover:text-red-300 shadow-lg"
              onClick={handleDelete}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-3.5 space-y-2">
          <p className="text-sm text-zinc-300 line-clamp-2 leading-snug group-hover:text-zinc-200 transition-colors">{generation.prompt}</p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">{formatDate(generation.created_at)}</span>
            <span className="flex items-center gap-1 rounded-md bg-purple-600/10 px-2 py-0.5">
              <span className="text-purple-400 font-semibold">{formatCredits(generation.credits_used)}</span>
              <span className="text-purple-400/70">credits</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
