"use client"

import { useState, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, ImageIcon, Film, Loader2, FileVideo } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  accept: string
  maxSizeMB?: number
  onFileSelect: (file: File) => void
  onClear: () => void
  previewUrl?: string | null
  type: "image" | "video"
  label?: string
}

export function FileUpload({
  accept,
  maxSizeMB = 10,
  onFileSelect,
  onClear,
  previewUrl,
  type,
  label,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleFile = useCallback(async (file: File) => {
    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      return
    }
    if (!file.type.startsWith(type === "image" ? "image/" : "video/")) {
      return
    }
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (data.url) {
        onFileSelect(file)
      }
    } catch {}
    setUploading(false)
  }, [maxSizeMB, onFileSelect, type])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>}
      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 group"
          >
            <div className="relative aspect-video">
              {type === "image" ? (
                <img src={previewUrl} alt="Upload preview" className="w-full h-full object-cover" />
              ) : (
                <video src={previewUrl} className="w-full h-full object-cover" controls />
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onClear() }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-6 text-center",
              dragOver
                ? "border-purple-500 bg-purple-600/5"
                : "border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-900/50"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              onChange={handleChange}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                <p className="text-xs text-zinc-500">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/50">
                  {type === "image" ? (
                    <ImageIcon className="h-5 w-5 text-zinc-500" />
                  ) : (
                    <FileVideo className="h-5 w-5 text-zinc-500" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-zinc-400">
                    <span className="text-purple-400 font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-[10px] text-zinc-600 mt-0.5">
                    {type === "image" ? "PNG, JPG, WEBP" : "MP4, WebM"} &middot; Max {maxSizeMB}MB
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}