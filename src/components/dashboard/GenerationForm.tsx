"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronDown,
  ChevronUp,
  Sparkles,
  ImageIcon,
  VideoIcon,
  AlertTriangle,
  Zap,
  Loader2,
  Lock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn, formatCredits } from "@/lib/utils"
import { IMAGE_MODELS, VIDEO_MODELS, ASPECT_RATIOS, STYLES, CREDITS_PER_GENERATION, VIDEO_DURATION_OPTIONS, ADDON_FEATURES, type Template } from "@/lib/constants"
import { useCredits } from "@/hooks/useCredits"
import { useUser } from "@/hooks/useUser"
import { toast } from "sonner"
import type { GenerationType } from "@/types"
import { TemplatesGallery } from "./TemplatesGallery"

export function GenerationForm({ initialPrompt }: { initialPrompt?: string }) {
  const { user } = useUser()
  const { credits, hasEnoughCredits, deductCredits } = useCredits()
  const [type, setType] = useState<GenerationType>("image")
  const [prompt, setPrompt] = useState(initialPrompt || "")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [showNegative, setShowNegative] = useState(false)
  const [model, setModel] = useState(IMAGE_MODELS[0].id)
  const [aspectRatio, setAspectRatio] = useState("1:1")
  const [style, setStyle] = useState("none")
  const [batchCount, setBatchCount] = useState(1)
  const [width, setWidth] = useState(1024)
  const [height, setHeight] = useState(1024)
  const [isGenerating, setIsGenerating] = useState(false)
  const [duration, setDuration] = useState(5)
  const [enableUpscale, setEnableUpscale] = useState(false)
  const [enableRemoveBg, setEnableRemoveBg] = useState(false)
  const [enableVoiceover, setEnableVoiceover] = useState(false)

  const isSubscribed = user?.subscription_plan === "basic" || user?.subscription_plan === "pro"
  const models = type === "image" ? IMAGE_MODELS : VIDEO_MODELS
  const baseCost = CREDITS_PER_GENERATION[type] * batchCount
  const addonCost = (enableUpscale ? CREDITS_PER_GENERATION.upscale * batchCount : 0)
    + (enableRemoveBg ? CREDITS_PER_GENERATION.removeBg * batchCount : 0)
    + (enableVoiceover ? CREDITS_PER_GENERATION.voiceover : 0)
  const creditCost = baseCost + addonCost
  const canGenerate = prompt.trim().length > 0 && hasEnoughCredits(type) && !isGenerating
  const selectedRatio = ASPECT_RATIOS.find((r) => r.value === aspectRatio)
  const isCustom = aspectRatio === "custom"

  const handleTemplateSelect = (template: Template) => {
    setType(template.type)
    setModel(template.model)
    setStyle(template.style)
    setAspectRatio(template.aspectRatio)
    setPrompt(template.examplePrompt)
    const ratio = ASPECT_RATIOS.find((r) => r.value === template.aspectRatio)
    if (ratio) { setWidth(ratio.width); setHeight(ratio.height) }
    setDuration(10)
  }

  const handleTypeChange = (value: string) => {
    const newType = value as GenerationType
    setType(newType)
    const newModel = newType === "image" ? IMAGE_MODELS[0].id : VIDEO_MODELS[0].id
    setModel(newModel)
    setDuration(5)
  }

  const handleAspectRatioChange = (value: string) => {
    setAspectRatio(value)
    const ratio = ASPECT_RATIOS.find((r) => r.value === value)
    if (ratio) {
      setWidth(ratio.width)
      setHeight(ratio.height)
    }
  }

  const handleSubmit = async () => {
    if (!canGenerate) return

    setIsGenerating(true)
    const deducted = await deductCredits(creditCost)
    if (!deducted) {
      toast.error("Failed to deduct credits. Please try again.")
      setIsGenerating(false)
      return
    }

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          negativePrompt: negativePrompt.trim() || undefined,
          type,
          model,
          aspectRatio,
          style: style === "none" ? undefined : style,
          width: isCustom ? width : selectedRatio?.width,
          height: isCustom ? height : selectedRatio?.height,
          batchCount,
          duration,
          aspect_ratio: aspectRatio,
          upscale: enableUpscale,
          removeBg: enableRemoveBg,
          voiceover: enableVoiceover,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Generation failed" }))
        throw new Error(error.message || "Generation failed")
      }

      toast.success("Generation started successfully!", {
        description: `Creating ${batchCount > 1 ? `${batchCount} ` : ""}${type}(s) with your prompt.`,
      })

      setPrompt("")
      setNegativePrompt("")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className="border-zinc-800/50 bg-zinc-900/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Create New Generation
        </CardTitle>
        <CardDescription>
          Describe what you want to create and let AI bring it to life
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs value={type} onValueChange={handleTypeChange} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="image" className="flex-1 gap-2">
              <ImageIcon className="h-4 w-4" />
              Image
            </TabsTrigger>
            <TabsTrigger value="video" className="flex-1 gap-2">
              <VideoIcon className="h-4 w-4" />
              Video
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="generation-prompt">Prompt</Label>
          <Textarea
            id="generation-prompt"
            placeholder="A serene mountain landscape at sunset..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[110px] resize-y"
            disabled={isGenerating}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowNegative(!showNegative)}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showNegative ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Negative Prompt
          </button>
          <AnimatePresence>
            {showNegative && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2">
                  <Textarea
                    placeholder="Things to avoid in the generation..."
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="min-h-[80px] resize-y"
                    disabled={isGenerating}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <TemplatesGallery onSelect={handleTemplateSelect} />

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={setModel} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Style</Label>
            <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Aspect Ratio</Label>
          <div className="grid grid-cols-5 gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.value}
                type="button"
                onClick={() => handleAspectRatioChange(ratio.value)}
                disabled={isGenerating}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border px-2 py-2.5 text-xs transition-all duration-200",
                  aspectRatio === ratio.value
                    ? "border-purple-600 bg-purple-600/10 text-purple-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                )}
              >
                <span className="font-medium">{ratio.label.split(" ")[0]}</span>
                <span className="text-[10px] opacity-70 mt-0.5">
                  {ratio.label.split(" ")[1]?.replace(/[()]/g, "")}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {isCustom && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-2 gap-4 overflow-hidden"
            >
              <div className="space-y-2">
                <Label>Width (px)</Label>
                <Input
                  type="number"
                  min={256}
                  max={4096}
                  step={64}
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label>Height (px)</Label>
                <Input
                  type="number"
                  min={256}
                  max={4096}
                  step={64}
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  disabled={isGenerating}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <Label>Batch Count</Label>
          <div className="flex gap-2">
            {[1, 2, 4].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => setBatchCount(count)}
                disabled={isGenerating}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm font-medium transition-all duration-200",
                  batchCount === count
                    ? "border-purple-600 bg-purple-600/10 text-purple-300"
                    : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                )}
              >
                {count}x
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-zinc-500 uppercase tracking-wider">Add-ons</Label>
          <div className="grid grid-cols-3 gap-2">
            {ADDON_FEATURES.map((f) => {
              const isAvailable = !f.premiumOnly || isSubscribed
              const isOn = f.id === "upscale" ? enableUpscale : f.id === "removeBg" ? enableRemoveBg : f.id === "voiceover" ? enableVoiceover : false
              const toggle = () => {
                if (!isAvailable) { window.location.href = "/pricing"; return }
                if (f.id === "upscale") setEnableUpscale(!enableUpscale)
                else if (f.id === "removeBg") setEnableRemoveBg(!enableRemoveBg)
                else if (f.id === "voiceover") setEnableVoiceover(!enableVoiceover)
              }
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={toggle}
                  className={`p-2.5 rounded-xl border text-left transition-all ${isOn ? "border-purple-500/40 bg-purple-600/10" : isAvailable ? "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700" : "border-zinc-800/30 bg-zinc-900/30 opacity-50"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-sm">{f.icon}</span>
                    <span className="text-[11px] font-medium text-zinc-300 truncate">{f.name}</span>
                    {f.premiumOnly && !isSubscribed && <Lock className="h-2.5 w-2.5 text-amber-400 shrink-0" />}
                  </div>
                  <p className="text-[9px] text-zinc-600 line-clamp-1">{f.description}</p>
                  {f.creditCost > 0 && <p className="text-[9px] text-purple-400/70 mt-0.5">+{f.creditCost} credits</p>}
                </button>
              )
            })}
          </div>
        </div>

        {type === "video" && (
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex gap-2">
              {VIDEO_DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={cn(
                    "flex-1 rounded-lg border py-2 text-sm font-medium transition-all duration-200",
                    duration === opt.value
                      ? "border-purple-600 bg-purple-600/10 text-purple-300"
                      : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!canGenerate}
            size="xl"
            className="w-full gap-2 text-base"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate {type === "image" ? "Image" : "Video"}
              </>
            )}
          </Button>

          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-yellow-500" />
              <span>
                Balance: <span className="text-purple-400 font-medium">{formatCredits(credits)}</span> credits &middot;
                Cost: <span className="text-purple-400 font-medium">{creditCost}</span> credits
              </span>
            </div>
            {!hasEnoughCredits(type) && (
              <div className="flex items-center gap-1 text-red-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Insufficient credits</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
