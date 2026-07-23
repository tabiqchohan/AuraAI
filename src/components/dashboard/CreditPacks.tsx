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
    <Card className="border-zinc-800/50 bg-zinc-900/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="h-5 w-5 text-yellow-400" />
          Buy Credits
        </CardTitle>
        <CardDescription>One-time credit packs, no subscription needed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currency === "USD" ? "bg-purple-600/20 text-purple-300" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            USD $
          </button>
          <button
            type="button"
            onClick={() => setCurrency("PKR")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currency === "PKR" ? "bg-purple-600/20 text-purple-300" : "text-zinc-500 hover:text-zinc-300"
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
              className={`relative p-4 rounded-xl border transition-all ${
                pack.popular
                  ? "border-purple-500/40 bg-purple-600/5"
                  : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
              }`}
            >
              {pack.popular && (
                <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] font-medium text-white">
                  Best Value
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{pack.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    <Sparkles className="h-3 w-3 inline text-purple-400 mr-0.5" />
                    {formatCredits(pack.credits)} credits
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-zinc-100">{priceDisplay}</p>
                  <p className="text-[10px] text-zinc-600">{perCredit}/credit</p>
                </div>
              </div>
              <Button
                onClick={() => handleBuy(pack.id)}
                disabled={loading !== null}
                size="sm"
                className={`w-full mt-3 rounded-xl ${
                  pack.popular
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                    : "bg-zinc-800 hover:bg-zinc-700"
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
