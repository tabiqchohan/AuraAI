"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Film, ChevronDown, ChevronUp } from "lucide-react"
import { CreditBalance } from "@/components/dashboard/CreditBalance"
import { GenerationForm } from "@/components/dashboard/GenerationForm"
import { GenerationGrid } from "@/components/dashboard/GenerationGrid"
import { VideoStudio } from "@/components/dashboard/VideoStudio"
import { CreditPacks } from "@/components/dashboard/CreditPacks"
import { Separator } from "@/components/ui/separator"

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
      transition={{ duration: 0.3 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Generate stunning AI images and videos
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <div className="space-y-8">
          <GenerationForm initialPrompt={initialPrompt} />
          <Separator className="bg-zinc-800" />

          <div>
            <button
              type="button"
              onClick={() => setShowStudio(!showStudio)}
              className="flex items-center justify-between w-full mb-6"
            >
              <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
                <Film className="h-5 w-5 text-purple-400" />
                Video Studio
              </h2>
              {showStudio ? <ChevronUp className="h-5 w-5 text-zinc-600" /> : <ChevronDown className="h-5 w-5 text-zinc-600" />}
            </button>
            {showStudio && <VideoStudio />}
          </div>

          <Separator className="bg-zinc-800" />
          <div>
            <h2 className="mb-6 text-xl font-semibold text-zinc-100">Your Generations</h2>
            <GenerationGrid key={refreshKey} />
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