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
    <Card className="relative overflow-hidden border-purple-500/10 bg-gradient-to-br from-card/80 to-background/80 shadow-xl shadow-purple-600/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-600/15 via-transparent to-transparent" />
      <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-purple-600/10 blur-3xl" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-600/30">
            <Coins className="h-4 w-4 text-white" />
          </div>
          Credit Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <div className="flex items-baseline gap-2">
          <motion.span
            key={credits}
            initial={{ scale: 1.2, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl font-bold tracking-tight text-gradient"
          >
            <AnimatedCounter value={credits} />
          </motion.span>
          <span className="text-sm text-muted-foreground">credits available</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Usage</span>
            <span className="text-muted-foreground">{usagePercent}%</span>
          </div>
          <Progress
            value={usagePercent}
            className="h-2 bg-muted [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-pink-600"
          />
        </div>

        <div className="flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-muted/80 to-card/80 border border-accent/30 p-3.5 text-xs">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/10">
            <Zap className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-muted-foreground leading-relaxed">
            Each image costs <span className="text-purple-400 font-semibold">5</span> credits, videos cost{" "}
            <span className="text-purple-400 font-semibold">20</span> credits
          </div>
        </div>

        <Link href="/pricing">
          <Button
            className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40 transition-all duration-300"
            size="lg"
          >
            <Sparkles className="h-4 w-4" />
            Get More Credits
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
