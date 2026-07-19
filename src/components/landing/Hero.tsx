"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const floatingCards = [
  { gradient: "from-purple-600 to-pink-600", delay: 0, x: -120, y: -40 },
  { gradient: "from-blue-600 to-cyan-600", delay: 0.15, x: 120, y: -60 },
  { gradient: "from-orange-600 to-red-600", delay: 0.3, x: -80, y: 60 },
  { gradient: "from-emerald-600 to-teal-600", delay: 0.45, x: 80, y: 50 },
  { gradient: "from-violet-600 to-purple-600", delay: 0.6, x: 0, y: -90 },
]

const stats = [
  { label: "Users", value: "10K+" },
  { label: "Generations", value: "100K+" },
  { label: "Uptime", value: "99.9%" },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,50,200,0.15),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(220,30,120,0.1),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Creativity</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
              Generate Stunning
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Images & Videos
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
            Transform your ideas into breathtaking visuals with AuraAI. Powered by cutting-edge AI.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button
                size="xl"
                variant="premium"
                className="group text-base"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/gallery">
              <Button
                size="xl"
                variant="outline"
                className="text-base border-zinc-700 hover:bg-zinc-800/80"
              >
                See Gallery
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full max-w-3xl h-[300px] sm:h-[400px] mt-16"
        >
          {floatingCards.map((card, i) => (
            <motion.div
              key={i}
              className={cn(
                "absolute rounded-2xl bg-gradient-to-br w-40 h-28 sm:w-48 sm:h-32 shadow-2xl",
                card.gradient
              )}
              style={{
                left: "50%",
                top: "50%",
                marginLeft: -96,
                marginTop: -64,
              }}
              initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0.9, 1],
                scale: [0.5, 1, 1, 1.02, 1],
                x: [0, card.x, card.x + 10, card.x - 5, card.x],
                y: [0, card.y, card.y - 10, card.y + 5, card.y],
              }}
              transition={{
                duration: 1,
                delay: 0.5 + card.delay,
                ease: "easeOut",
                x: {
                  duration: 4,
                  delay: 1 + card.delay,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
                y: {
                  duration: 5,
                  delay: 1 + card.delay,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                },
              }}
            >
              <div className="w-full h-full rounded-2xl bg-white/10 backdrop-blur-sm p-4 flex flex-col justify-end">
                <div className="w-3/4 h-2 rounded-full bg-white/20 mb-2" />
                <div className="w-1/2 h-2 rounded-full bg-white/20" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-8 sm:gap-16 mt-8 py-8 border-t border-zinc-800 w-full max-w-2xl"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="text-sm text-zinc-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
