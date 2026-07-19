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
      <Card className="group overflow-hidden border-zinc-800/50 bg-zinc-900/40 hover:border-zinc-700/50 transition-all duration-300">
        <div className="relative aspect-square overflow-hidden bg-zinc-950">
          {previewUrl && !imageError ? (
            <>
              {isImage ? (
                <Image
                  src={previewUrl}
                  alt={generation.prompt}
                  fill
                  className={cn(
                    "object-cover transition-all duration-500 group-hover:scale-105",
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
            <div className="flex h-full items-center justify-center">
              {isImage ? (
                <ImageIcon className="h-12 w-12 text-zinc-700" />
              ) : (
                <VideoIcon className="h-12 w-12 text-zinc-700" />
              )}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute top-2 left-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant={isImage ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
              {isImage ? <ImageIcon className="h-3 w-3 mr-1" /> : <VideoIcon className="h-3 w-3 mr-1" />}
              {isImage ? "Image" : "Video"}
            </Badge>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-zinc-200"
              onClick={handleDownload}
              disabled={generation.status !== "completed"}
              title="Download"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-8 w-8 rounded-full bg-black/50 hover:bg-black/70",
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
              variant="ghost"
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-zinc-200"
              onClick={handleShare}
              disabled={generation.status !== "completed"}
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-red-400 hover:text-red-300"
              onClick={handleDelete}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-3 space-y-2">
          <p className="text-sm text-zinc-300 line-clamp-2 leading-snug">{generation.prompt}</p>
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>{formatDate(generation.created_at)}</span>
            <span className="flex items-center gap-1">
              <span className="text-purple-400 font-medium">{formatCredits(generation.credits_used)}</span>
              credits
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
