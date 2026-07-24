"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ImageIcon, VideoIcon, Sparkles, Search, ChevronDown, ChevronUp, Crown, Lock, Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TEMPLATES, type Template } from "@/lib/constants"
import { useUser } from "@/hooks/useUser"
import type { GenerationType } from "@/types"

interface TemplatesGalleryProps {
  onSelect: (template: Template) => void
}

function TemplatePreview({ template }: { template: Template }) {
  const [imgError, setImgError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className="relative w-full aspect-[4/3] rounded-lg overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${template.previewColors?.[0] || "#1e1b4b"}, ${template.previewColors?.[1] || "#7c3aed"})` }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl opacity-40">{template.emoji}</span>
      </div>
      {template.type === "video" && (
        <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[9px] text-white">
          <Play className="h-2.5 w-2.5 fill-white" />
        </div>
      )}
    </div>
  )
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
        className="flex items-center justify-between w-full mb-3 group"
      >
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          Templates
          <span className="text-[10px] text-muted-foreground font-normal normal-case">({filtered.length})</span>
        </h3>
        <div className={`p-0.5 rounded transition-all duration-300 ${!collapsed ? "bg-purple-600/20 text-purple-400" : "text-muted-foreground group-hover:text-muted-foreground"}`}>
          {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </div>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden space-y-3"
          >
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === "all" ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-200 border border-purple-500/30 shadow-sm" : "bg-zinc-800/50 text-muted-foreground hover:text-card-foreground border border-transparent"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("image")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filter === "image" ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-200 border border-purple-500/30 shadow-sm" : "bg-zinc-800/50 text-muted-foreground hover:text-card-foreground border border-transparent"
                }`}
              >
                <ImageIcon className="h-3 w-3" /> Images
              </button>
              <button
                type="button"
                onClick={() => setFilter("video")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  filter === "video" ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-200 border border-purple-500/30 shadow-sm" : "bg-zinc-800/50 text-muted-foreground hover:text-card-foreground border border-transparent"
                }`}
              >
                <VideoIcon className="h-3 w-3" /> Videos
              </button>
              <button
                type="button"
                onClick={() => setShowPremium(!showPremium)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  showPremium ? "bg-gradient-to-r from-amber-600/20 to-orange-600/20 text-amber-200 border border-amber-500/30 shadow-sm" : "bg-zinc-800/50 text-muted-foreground hover:text-card-foreground border border-transparent"
                }`}
              >
                <Crown className="h-3 w-3" /> Premium
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 text-xs bg-card/50 border-border rounded-xl placeholder:text-muted-foreground focus:border-purple-500/30 focus:ring-1 focus:ring-purple-500/20 transition-all"
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
                  className={`flex flex-col items-start gap-1.5 p-2.5 rounded-xl border transition-all duration-300 text-left group relative ${
                    template.premium
                      ? "bg-gradient-to-br from-amber-900/15 to-amber-950/10 border-amber-500/20 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-600/10"
                      : "bg-card/50 border-border hover:border-purple-500/30 hover:bg-accent hover:shadow-lg hover:shadow-purple-600/5"
                  }`}
                >
                  {template.premium && !isPremium && (
                    <div className="absolute inset-0 rounded-xl bg-card/70 backdrop-blur-[2px] flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <span className="flex items-center gap-1.5 text-amber-400 text-xs font-medium bg-card/80 px-3 py-1.5 rounded-lg border border-amber-500/20">
                        <Lock className="h-3 w-3" /> Upgrade to access
                      </span>
                    </div>
                  )}
                  <TemplatePreview template={template} />
                  <div className="flex items-center gap-2 w-full px-0.5">
                    <span className="text-xs font-medium text-card-foreground truncate flex-1">{template.name}</span>
                    {template.premium && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-400 text-[9px] font-medium border border-amber-500/20">
                        <Crown className="h-2.5 w-2.5" /> Pro
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 px-0.5">{template.description}</p>
                </motion.button>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-2 py-8 text-center text-muted-foreground text-xs">No templates found</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}