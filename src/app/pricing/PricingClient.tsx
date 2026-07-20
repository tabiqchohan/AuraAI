"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PLANS } from "@/lib/constants"
import { formatPrice, formatPriceUSD, formatPricePKR, cn } from "@/lib/utils"
import { useUser } from "@/hooks/useUser"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

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

export function PricingClient() {
  const [yearly, setYearly] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("basic")
  const { user } = useUser()
  const router = useRouter()

  const getPrice = (plan: (typeof PLANS)[number]) => {
    if (plan.price === 0) return "Free"
    return yearly ? formatPrice(plan.price * 10) : formatPrice(plan.price)
  }

  const getPeriod = (plan: (typeof PLANS)[number]) => {
    if (plan.price === 0) return null
    return yearly ? "/yr" : "/mo"
  }

  const getMultiCurrencyPrices = (plan: (typeof PLANS)[number]) => {
    if (plan.price === 0) return null
    const p = plan.prices
    if (yearly) {
      return {
        USD: formatPriceUSD(p.USD * 10),
        INR: formatPrice(p.INR * 10),
        PKR: formatPricePKR(p.PKR * 10),
      }
    }
    return {
      USD: formatPriceUSD(p.USD),
      INR: formatPrice(p.INR),
      PKR: formatPricePKR(p.PKR),
    }
  }

  const getCreditsLabel = (plan: (typeof PLANS)[number]) => {
    const credits = plan.credits.toLocaleString()
    if (plan.price === 0) return `${credits} credits total`
    if (yearly) return `${credits} credits/mo (billed yearly)`
    return `${credits} credits/month`
  }

  const getButtonLabel = (plan: (typeof PLANS)[number]) => {
    if (!user) {
      return plan.price === 0 ? "Get Started" : "Subscribe"
    }
    if (user.subscription_plan === plan.id) return "Current Plan"
    return plan.price === 0 ? "Downgrade" : "Subscribe"
  }

  const isButtonDisabled = (plan: (typeof PLANS)[number]) => {
    return loadingPlan === plan.id || (!!user && user.subscription_plan === plan.id)
  }

  const getButtonVariant = (plan: (typeof PLANS)[number]): "premium" | "outline" | "secondary" => {
    if (plan.popular) return "premium"
    if (!!user && user.subscription_plan === plan.id) return "secondary"
    return "outline"
  }

  const handleAction = async (plan: (typeof PLANS)[number]) => {
    if (!user) {
      router.push("/signup")
      return
    }

    if (plan.id === "free") {
      router.push("/dashboard")
      return
    }

    if (user.subscription_plan === plan.id) {
      router.push("/dashboard")
      return
    }

    setLoadingPlan(plan.id)

    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId: plan.id, yearly }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || "Failed to create checkout session")
        return
      }

      if (data?.url) {
        window.location.href = data.url
      } else {
        toast.error("Failed to create checkout session")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <section className="py-24 px-4 bg-black relative overflow-hidden min-h-screen pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(120,50,200,0.08),transparent_50%)]" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple,{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              transparent pricing
            </span>
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Choose the plan that fits your needs. No hidden fees. Upgrade or cancel anytime.
          </p>

          <div className="flex items-center justify-center gap-3 mt-8">
            <Label
              htmlFor="billing-toggle"
              className={`text-sm cursor-pointer ${!yearly ? "text-zinc-100" : "text-zinc-500"}`}
            >
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={yearly}
              onCheckedChange={setYearly}
            />
            <Label
              htmlFor="billing-toggle"
              className={`text-sm cursor-pointer ${yearly ? "text-zinc-100" : "text-zinc-500"}`}
            >
              Yearly
              <span className="ml-1.5 text-purple-400 text-xs font-medium">
                (save 2 months)
              </span>
            </Label>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
        >
          {PLANS.map((plan) => (
            <motion.div
              key={plan.id}
              variants={cardVariants}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                "relative rounded-2xl border p-8 flex flex-col transition-all duration-300 cursor-pointer",
                selectedPlan === plan.id
                  ? "border-purple-500 bg-purple-500/5 shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)] md:scale-105"
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

              {user && user.subscription_plan === plan.id && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="success" className="text-xs px-3 py-1">
                    Current Plan
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">
                    {getPrice(plan)}
                  </span>
                  {getPeriod(plan) && (
                    <span className="text-zinc-500 text-sm">{getPeriod(plan)}</span>
                  )}
                </div>
                {getMultiCurrencyPrices(plan) && (
                  <div className="mt-2 space-y-0.5">
                    <p className="text-zinc-400 text-xs">
                      {getMultiCurrencyPrices(plan)!.USD} USD
                    </p>
                    <p className="text-zinc-500 text-xs">
                      {getMultiCurrencyPrices(plan)!.PKR} PKR
                    </p>
                  </div>
                )}
                <p className="mt-2 text-zinc-400 text-sm">
                  {getCreditsLabel(plan)}
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3">
                <Button
                  variant={getButtonVariant(plan)}
                  size="lg"
                  className="w-full"
                  disabled={isButtonDisabled(plan)}
                  onClick={() => handleAction(plan)}
                >
                  {loadingPlan === plan.id && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {getButtonLabel(plan)}
                </Button>

                {!user && (
                  <p className="text-xs text-zinc-500 text-center">
                    No credit card required for Free plan
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-zinc-500 text-sm">
            All plans include access to our community gallery and basic support.{" "}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
              Contact us
            </Link>{" "}
            for enterprise pricing.
          </p>
        </motion.div>
      </div>
    </section>
  )
}