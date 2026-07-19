"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CTA() {
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-black to-pink-600/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.15),transparent_60%)]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
            Ready to bring your{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              ideas to life
            </span>
            ?
          </h2>

          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Join thousands of creators using AuraAI to generate stunning visuals. Start creating for free.
          </p>

          <div className="mt-8">
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
          </div>
        </motion.div>
      </div>
    </section>
  )
}
