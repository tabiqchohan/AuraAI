"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Film, ChevronDown, ChevronUp, Sparkles, Wand2 } from "lucide-react"
import { CreditBalance } from "@/components/dashboard/CreditBalance"
import { GenerationForm } from "@/components/dashboard/GenerationForm"
import { GenerationGrid } from "@/components/dashboard/GenerationGrid"
import { VideoStudio } from "@/components/dashboard/VideoStudio"
import { CreditPacks } from "@/components/dashboard/CreditPacks"

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [initialPrompt, setInitialPrompt] = useState<string | undefined>(undefined)
  const [showStudio, setShowStudio] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const promptParam = params.get("prompt")
    if (promptParam) {
      setInitialPrompt(promptParam)
    }
  }, [])

  const handleGenerationSuccess = () => {
    setRefreshKey((k) => k + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 via-zinc-900/50 to-zinc-950 p-6 sm:p-8 border border-purple-500/10">
        <div className="pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-pink-600/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-600/30">
              <Wand2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gradient">
              Dashboard
            </h1>
          </div>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Generate stunning AI images and videos, manage your credits, and explore creative templates
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <GenerationForm initialPrompt={initialPrompt} />

          <div>
            <h2 className="mb-5 text-xl font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <span className="text-gradient">Your Generations</span>
            </h2>
            <GenerationGrid key={refreshKey} />
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowStudio(!showStudio)}
              className="group flex items-center justify-between w-full p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-purple-500/20 transition-all duration-300"
            >
              <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20">
                  <Film className="h-5 w-5 text-purple-400" />
                </div>
                Video Studio
              </h2>
              <div className={`p-1.5 rounded-lg transition-all duration-300 ${showStudio ? "bg-purple-600/20 text-purple-400" : "text-zinc-600 group-hover:text-zinc-400"}`}>
                {showStudio ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </button>
            {showStudio && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="mt-4"
              >
                <VideoStudio />
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="lg:sticky lg:top-8 space-y-6">
            <CreditBalance />
            <CreditPacks />
          </div>
        </div>
      </div>
    </motion.div>
  )
}