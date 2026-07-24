"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PLANS } from "@/lib/constants"
import { formatPrice, formatPriceUSD, formatPricePKR, formatCredits } from "@/lib/utils"
import { cn } from "@/lib/utils"

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export default function PricingSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,50,200,0.08),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Simple,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              transparent pricing
            </span>
          </h2>
          <p className="mt-4 text-zinc-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col transition-all duration-300",
                plan.popular
                  ? "border-purple-500 bg-purple-500/5 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] scale-105 md:scale-110"
                  : "border-zinc-800 bg-zinc-900/50 backdrop-blur-sm hover:border-zinc-700"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="text-xs px-4 py-1">
                    Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    {plan.id === "free" ? "Free" : formatPriceUSD(plan.prices.USD)}
                  </span>
                  {plan.id !== "free" && (
                    <span className="text-zinc-500 text-sm">/mo</span>
                  )}
                </div>
                {plan.id !== "free" && (
                  <div className="mt-2 space-y-0.5">
                    <p className="text-zinc-400 text-xs">
                      {formatPriceUSD(plan.prices.USD)} USD
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {formatPricePKR(plan.prices.PKR)} PKR
                    </p>
                  </div>
                )}
                <p className="mt-2 text-zinc-400 text-sm">
                  {formatCredits(plan.credits)} credits
                  {plan.id === "free" ? " one-time" : " per month"}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.id === "free" ? "/signup" : "/pricing"}>
                <Button
                  variant={plan.popular ? "premium" : "outline"}
                  className={cn(
                    "w-full",
                    !plan.popular && "border-zinc-700 hover:bg-zinc-800"
                  )}
                  size="lg"
                >
                  {plan.id === "free" ? "Get Started" : "Subscribe"}
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
