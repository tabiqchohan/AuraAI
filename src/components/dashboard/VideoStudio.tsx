"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { VideoIcon, Loader2, Trash2, ChevronUp, ChevronDown, Download, Merge, Film, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useUser } from "@/hooks/useUser"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import type { FFmpeg } from "@ffmpeg/ffmpeg"

interface VideoGeneration {
  id: string
  output_url: string
  prompt: string
  created_at: string
}

export function VideoStudio() {
  const { user } = useUser()
  const [videos, setVideos] = useState<VideoGeneration[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [merging, setMerging] = useState(false)
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null)
  const [loadingFFmpeg, setLoadingFFmpeg] = useState(false)
  const [progress, setProgress] = useState("")

  useEffect(() => {
    if (!user) return
    const sb = createClient()
    const userId = user.id
    async function load() {
      setLoading(true)
      const { data } = await sb
        .from("generations")
        .select("id, output_url, prompt, created_at")
        .eq("user_id", userId)
        .eq("type", "video")
        .eq("status", "completed")
        .not("output_url", "is", null)
        .order("created_at", { ascending: false })
      setVideos((data as VideoGeneration[]) ?? [])
      setLoading(false)
    }
    load()
  }, [user])

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const moveUp = (id: string) => {
    setSelected((prev) => {
      const i = prev.indexOf(id)
      if (i <= 0) return prev
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next
    })
  }

  const moveDown = (id: string) => {
    setSelected((prev) => {
      const i = prev.indexOf(id)
      if (i === -1 || i >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next
    })
  }

  const loadFFmpeg = async () => {
    if (ffmpeg) return ffmpeg
    setLoadingFFmpeg(true)
    setProgress("Loading FFmpeg...")
    try {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg")
      const { fetchFile, toBlobURL } = await import("@ffmpeg/util")
      const base = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm"
      const coreURL = await toBlobURL(`${base}/ffmpeg-core.js`, "text/javascript")
      const wasmURL = await toBlobURL(`${base}/ffmpeg-core.wasm`, "application/wasm")
      const instance = new FFmpeg()
      await instance.load({ coreURL, wasmURL })
      setFfmpeg(instance)
      setLoadingFFmpeg(false)
      setProgress("")
      return instance
    } catch (err) {
      setLoadingFFmpeg(false)
      setProgress("")
      throw err
    }
  }

  const handleMerge = async () => {
    if (selected.length < 2) {
      toast.error("Select at least 2 videos to merge")
      return
    }

    setMerging(true)
    setProgress("Initializing...")

    try {
      const ff = await loadFFmpeg()
      const { fetchFile } = await import("@ffmpeg/util")

      const selectedVideos = selected.map((id) => videos.find((v) => v.id === id)!).filter(Boolean)

      for (let i = 0; i < selectedVideos.length; i++) {
        setProgress(`Downloading clip ${i + 1}/${selectedVideos.length}...`)
        const videoData = await fetchFile(selectedVideos[i].output_url)
        ff.writeFile(`clip${i}.mp4`, videoData)
      }

      const listContent = selectedVideos.map((_, i) => `file clip${i}.mp4`).join("\n")
      ff.writeFile("filelist.txt", new TextEncoder().encode(listContent))

      setProgress("Merging videos...")
      await ff.exec(["-f", "concat", "-safe", "0", "-i", "filelist.txt", "-c", "copy", "output.mp4"])

      setProgress("Preparing download...")
      const rawData = await ff.readFile("output.mp4")
      const blob = new Blob([rawData as BlobPart], { type: "video/mp4" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `merged-video-${Date.now()}.mp4`
      a.click()
      URL.revokeObjectURL(url)

      for (let i = 0; i < selectedVideos.length; i++) {
        ff.deleteFile(`clip${i}.mp4`)
      }
      ff.deleteFile("filelist.txt")
      ff.deleteFile("output.mp4")

      toast.success("Videos merged successfully!")
    } catch (err) {
      toast.error("Failed to merge videos: " + (err instanceof Error ? err.message : "Unknown error"))
    }

    setMerging(false)
    setProgress("")
  }

  const selectedVideos = selected.map((id) => videos.find((v) => v.id === id)!).filter(Boolean)

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Film className="h-5 w-5 text-purple-400" />
          Video Studio
        </CardTitle>
        <CardDescription>Select clips, reorder, and merge into one video</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {selected.length >= 2 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-purple-300 font-medium">{selected.length} clips selected</span>
              <span className="text-xs text-zinc-500">Total: ~{selected.length * 15} sec</span>
            </div>
            <div className="space-y-1.5 mb-3">
              {selectedVideos.map((v, i) => (
                <div key={v.id} className="flex items-center gap-2 p-2 rounded-lg bg-zinc-800/50">
                  <span className="text-xs text-zinc-500 w-5">{i + 1}.</span>
                  <span className="text-xs text-zinc-300 truncate flex-1">{v.prompt}</span>
                  <button type="button" onClick={() => moveUp(v.id)} disabled={i === 0} className="p-0.5 text-zinc-600 hover:text-zinc-300 disabled:opacity-30">
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => moveDown(v.id)} disabled={i === selectedVideos.length - 1} className="p-0.5 text-zinc-600 hover:text-zinc-300 disabled:opacity-30">
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" onClick={() => toggleSelect(v.id)} className="p-0.5 text-red-400 hover:text-red-300">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <Button
              onClick={handleMerge}
              disabled={merging || loadingFFmpeg}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl shadow-lg shadow-purple-600/20"
            >
              {merging || loadingFFmpeg ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{progress || "Loading FFmpeg..."}</>
              ) : (
                <><Merge className="h-4 w-4 mr-2" />Merge {selected.length} Clips</>
              )}
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-zinc-800/50 animate-pulse" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-600">
            <VideoIcon className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-sm">No videos generated yet</p>
            <p className="text-xs mt-1">Generate videos first, then merge them here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {videos.map((v, i) => (
              <motion.button
                key={v.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                type="button"
                onClick={() => toggleSelect(v.id)}
                className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all group ${
                  selected.includes(v.id) ? "border-purple-500 ring-2 ring-purple-500/30" : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <video
                  src={v.output_url}
                  className="w-full h-full object-cover"
                  muted
                  loop
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0 }}
                />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[10px] text-zinc-300 truncate">{v.prompt}</p>
                  <p className="text-[9px] text-zinc-600">{formatDate(v.created_at)}</p>
                </div>
                {selected.includes(v.id) && (
                  <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{selected.indexOf(v.id) + 1}</span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
