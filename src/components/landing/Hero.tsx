"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const stats = [
  { label: "Active Users", value: "10K+" },
  { label: "Generations", value: "100K+" },
  { label: "Uptime", value: "99.9%" },
]

const benefits = [
  "No credit card required",
  "100 free credits on signup",
  "Cancel anytime",
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,114,182,0.08),transparent_50%)]" />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-600 rounded-full blur-[96px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Creativity</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
              <span className="text-white">
                Generate Stunning
              </span>
              <br />
              <span className="text-gradient">
                AI Images & Videos
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-lg leading-relaxed">
              Transform your ideas into breathtaking visuals with AuraAI. Powered by cutting-edge AI models for image and video generation.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-start gap-4">
              <Link href="/signup">
                <Button size="xl" variant="premium" className="group text-base px-8 py-6 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/gallery">
                <Button size="xl" variant="outline" className="text-base border-zinc-700 hover:bg-zinc-800/80 px-8 py-6 text-lg">
                  View Gallery
                </Button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8"
            >
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-zinc-500">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-purple-400" />
                  </div>
                  {benefit}
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-3xl animate-pulse-glow" />

              <div className="relative z-10 space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="glass rounded-2xl p-6 ml-12"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-100">Image Generation</div>
                      <div className="text-xs text-zinc-500">Flux Schnell</div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-zinc-800/50 p-4">
                    <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
                      <span className="text-6xl"></span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="glass rounded-2xl p-6 mr-12 -mt-2"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-100">Video Generation</div>
                      <div className="text-xs text-zinc-500">Luma Ray</div>
                    </div>
                  </div>
                  <div className="rounded-xl bg-zinc-800/50 p-4">
                    <div className="w-full aspect-video rounded-lg bg-gradient-to-br from-blue-900/50 to-cyan-900/50 flex items-center justify-center">
                      <span className="text-6xl"></span>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="absolute -right-4 top-8 glass-light rounded-xl px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-zinc-900 flex items-center justify-center text-xs font-bold text-white">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-zinc-400">
                      <span className="text-purple-400 font-medium">1.2K+</span> creators
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex items-center justify-center gap-8 sm:gap-16 mt-20 pt-8 border-t border-zinc-800/50 max-w-2xl mx-auto"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-gradient">
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