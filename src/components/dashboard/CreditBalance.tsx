"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion, useInView, animate } from "framer-motion"
import { Sparkles, Coins, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useCredits } from "@/hooks/useCredits"
import { formatCredits } from "@/lib/utils"
import { FREE_CREDITS_ON_SIGNUP } from "@/lib/constants"

function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [displayed, setDisplayed] = useState(0)

  useEffect(() => {
    if (!inView) return
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (latest) => setDisplayed(Math.round(latest)),
    })
    return () => controls.stop()
  }, [inView, value, duration])

  return <span ref={ref}>{formatCredits(displayed)}</span>
}

export function CreditBalance() {
  const { credits, loading } = useCredits()
  const usagePercent = Math.min(100, Math.round((credits / FREE_CREDITS_ON_SIGNUP) * 100))

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden border-zinc-800/50 bg-gradient-to-br from-zinc-900/80 to-zinc-950/80">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Coins className="h-5 w-5 text-purple-400" />
          Credit Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-1">
          <motion.span
            key={credits}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold tracking-tight text-zinc-100"
          >
            <AnimatedCounter value={credits} />
          </motion.span>
          <span className="text-sm text-zinc-500">credits</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Usage</span>
            <span>{usagePercent}%</span>
          </div>
          <Progress value={usagePercent} className="h-2" />
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-zinc-800/50 p-3 text-xs text-zinc-400">
          <Zap className="h-4 w-4 text-yellow-500 shrink-0" />
          <span>
            Each image generation costs <span className="text-purple-400 font-medium">5</span> credits, videos cost{" "}
            <span className="text-purple-400 font-medium">20</span> credits
          </span>
        </div>

        <Link href="/pricing">
          <Button variant="premium" className="w-full gap-2" size="lg">
            <Sparkles className="h-4 w-4" />
            Buy Credits
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
