"use client"

import { motion } from "framer-motion"
import { Zap, Image, Video, CreditCard, Share2, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const features = [
  {
    icon: Image,
    title: "AI Image Generation",
    description: "Create stunning, photorealistic images from text prompts with state-of-the-art AI models.",
  },
  {
    icon: Video,
    title: "AI Video Generation",
    description: "Bring your ideas to life with AI-generated videos from simple text descriptions.",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Get your generations in seconds with our optimized infrastructure and priority queue system.",
  },
  {
    icon: CreditCard,
    title: "HD Quality",
    description: "Export your creations in stunning HD and 4K resolution with crisp details.",
  },
  {
    icon: Share2,
    title: "Easy Sharing",
    description: "Share your generations instantly with a link or download them directly to your device.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your creations and data are encrypted and protected. We never share your content.",
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
    <section className="py-24 bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(120,50,200,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(220,30,120,0.05),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            Everything you need to create{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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
                className="group relative rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)]"
              >
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:bg-purple-500/20 transition-colors">
                    <Icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
