"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Loader2, Zap, Tag } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CREDIT_PACKS } from "@/lib/constants"
import { formatCredits, formatPriceUSD, formatPricePKR } from "@/lib/utils"
import { toast } from "sonner"

export function CreditPacks() {
  const [loading, setLoading] = useState<string | null>(null)
  const [currency, setCurrency] = useState<"USD" | "PKR">("USD")

  const handleBuy = async (packId: string) => {
    if (loading) return
    setLoading(packId)
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "credits", packId, currency }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || "Failed to create checkout")
      }
    } catch {
      toast.error("Something went wrong")
    }
    setLoading(null)
  }

  return (
    <Card className="relative overflow-hidden border-purple-500/10 bg-zinc-900/40 shadow-xl shadow-purple-600/5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-pink-600/5 via-transparent to-transparent" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg shadow-yellow-600/30">
            <Zap className="h-4 w-4 text-white" />
          </div>
          Buy Credits
        </CardTitle>
        <CardDescription>One-time credit packs, no subscription needed</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10 space-y-3">
        <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-xl w-fit border border-zinc-700/30">
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currency === "USD" ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            USD $
          </button>
          <button
            type="button"
            onClick={() => setCurrency("PKR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currency === "PKR" ? "bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-purple-200 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            PKR ₹
          </button>
        </div>

        {CREDIT_PACKS.map((pack, i) => {
          const priceDisplay = currency === "PKR" ? formatPricePKR(pack.prices.PKR) : formatPriceUSD(pack.prices.USD)
          const perCredit = currency === "PKR" ? formatPricePKR(pack.prices.PKR / pack.credits) : formatPriceUSD(pack.prices.USD / pack.credits)
          return (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative p-4 rounded-xl border transition-all duration-300 group ${
                pack.popular
                  ? "border-purple-500/40 bg-gradient-to-b from-purple-600/10 to-purple-600/5 shadow-lg shadow-purple-600/10"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-800/50"
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-2.5 -right-2.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-semibold text-white shadow-lg shadow-purple-600/40 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Best Value
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{pack.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    <Sparkles className="h-3 w-3 inline text-purple-400 mr-0.5" />
                    {formatCredits(pack.credits)} credits
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gradient">{priceDisplay}</p>
                  <p className="text-[10px] text-zinc-600">{perCredit}/credit</p>
                </div>
              </div>
              <Button
                onClick={() => handleBuy(pack.id)}
                disabled={loading !== null}
                size="sm"
                className={`w-full rounded-xl transition-all duration-300 ${
                  pack.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/40"
                    : "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/50"
                }`}
              >
                {loading === pack.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Tag className="h-4 w-4 mr-2" />}
                {loading === pack.id ? "Processing..." : `Buy ${pack.name}`}
              </Button>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
