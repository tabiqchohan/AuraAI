"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageIcon, VideoIcon, Sparkles, Search, ChevronDown, ChevronUp, Crown, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TEMPLATES, type Template } from "@/lib/constants"
import { useUser } from "@/hooks/useUser"
import type { GenerationType } from "@/types"

interface TemplatesGalleryProps {
  onSelect: (template: Template) => void
}

export function TemplatesGallery({ onSelect }: TemplatesGalleryProps) {
  const { user } = useUser()
  const [filter, setFilter] = useState<GenerationType | "all">("all")
  const [search, setSearch] = useState("")
  const [collapsed, setCollapsed] = useState(false)
  const [showPremium, setShowPremium] = useState(true)

  const isPremium = user?.subscription_plan === "pro" || user?.subscription_plan === "basic"

  const filtered = TEMPLATES.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false
    if (!showPremium && t.premium) return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleSelect = (template: Template) => {
    if (template.premium && !isPremium) {
      window.location.href = "/pricing"
      return
    }
    onSelect(template)
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full mb-3"
      >
        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          Templates
        </h3>
        {collapsed ? <ChevronDown className="h-4 w-4 text-zinc-600" /> : <ChevronUp className="h-4 w-4 text-zinc-600" />}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === "all" ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("image")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filter === "image" ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                <ImageIcon className="h-3 w-3" /> Images
              </button>
              <button
                type="button"
                onClick={() => setFilter("video")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filter === "video" ? "bg-purple-600/20 text-purple-300 border border-purple-500/30" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                <VideoIcon className="h-3 w-3" /> Videos
              </button>
              <button
                type="button"
                onClick={() => setShowPremium(!showPremium)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  showPremium ? "bg-amber-600/20 text-amber-300 border border-amber-500/30" : "bg-zinc-800/50 text-zinc-500 hover:text-zinc-300 border border-transparent"
                }`}
              >
                <Crown className="h-3 w-3" /> Premium
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-600" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-xs bg-zinc-900/50 border-zinc-800 rounded-xl placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {filtered.map((template, i) => (
                <motion.button
                  key={template.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  type="button"
                  onClick={() => handleSelect(template)}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-xl border transition-all text-left group relative ${
                    template.premium
                      ? "bg-gradient-to-br from-amber-900/10 to-amber-950/10 border-amber-500/20 hover:border-amber-500/40"
                      : "bg-zinc-900/50 border-zinc-800/50 hover:border-purple-500/30 hover:bg-zinc-800/50"
                  }`}
                >
                  {template.premium && !isPremium && (
                    <div className="absolute inset-0 rounded-xl bg-zinc-900/60 backdrop-blur-[1px] flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
                        <Lock className="h-3 w-3" /> Upgrade to access
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-lg">{template.emoji}</span>
                    <span className="text-xs font-medium text-zinc-300 truncate flex-1">{template.name}</span>
                    {template.premium && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[9px] font-medium border border-amber-500/20">
                        <Crown className="h-2.5 w-2.5" /> Pro
                      </span>
                    )}
                    {template.type === "video" ? (
                      <VideoIcon className="h-3 w-3 text-blue-400 shrink-0" />
                    ) : (
                      <ImageIcon className="h-3 w-3 text-purple-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-600 line-clamp-1">{template.description}</p>
                  <span className="text-[10px] text-zinc-700 group-hover:text-purple-400/70 transition-colors">
                    {template.premium && !isPremium ? "Upgrade to use" : "Click to use"}
                  </span>
                </motion.button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-2 py-8 text-center text-zinc-600 text-xs">No templates found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
