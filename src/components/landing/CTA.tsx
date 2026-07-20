"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const perks = [
  "100 free credits",
  "No credit card required",
  "Cancel anytime",
]

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-black to-pink-600/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.12),transparent_60%)]" />

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-purple-600 rounded-full blur-[96px]" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-pink-600 rounded-full blur-[96px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-sm mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get Started Today</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Ready to bring your{" "}
            <span className="text-gradient">
              ideas to life
            </span>
            ?
          </h2>

          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Join thousands of creators using AuraAI to generate stunning visuals. Start creating for free, upgrade when you need more.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
            {perks.map((perk, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-zinc-500">
                <Check className="w-4 h-4 text-purple-400" />
                {perk}
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link href="/signup">
              <Button size="xl" variant="premium" className="group text-base px-10 py-6 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}