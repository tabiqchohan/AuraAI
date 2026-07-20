"use client"

import { motion } from "framer-motion"
import { Zap, Image, Video, CreditCard, Share2, Shield, Sparkles } from "lucide-react"

const features = [
  {
    icon: Image,
    title: "AI Image Generation",
    description: "Create stunning, photorealistic images from text prompts with state-of-the-art AI models like Flux and Stable Diffusion.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Video,
    title: "AI Video Generation",
    description: "Bring your ideas to life with AI-generated videos from simple text descriptions using Luma Ray and MiniMax.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get your generations in seconds with our optimized infrastructure and priority queue system for paid plans.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    icon: CreditCard,
    title: "HD & 4K Quality",
    description: "Export your creations in stunning HD and 4K resolution with crisp details and vibrant colors.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your generations instantly with a public gallery link or download them directly to your device.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your creations and data are encrypted and protected. We never share your content without permission.",
    gradient: "from-rose-500 to-pink-500",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export default function Features() {
  return (
    <section className="py-24 bg-black relative overflow-hidden" id="features">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.06),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(244,114,182,0.04),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-sm mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Features</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
            Everything you need to create{" "}
            <span className="text-gradient">
              amazing visuals
            </span>
          </h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-2xl mx-auto">
            Powerful AI tools at your fingertips. No complex setup required.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={i}
                variants={itemVariants}
                className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 transition-all duration-500 hover:border-zinc-700 hover:bg-zinc-900/50"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} p-0.5 mb-4`}>
                    <div className="w-full h-full rounded-[10px] bg-zinc-950 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}