"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CREDITS_PER_GENERATION } from "@/lib/constants"
import { useUser } from "./useUser"

export function useCredits() {
  const { user, loading: userLoading } = useUser()
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)

  if (typeof window !== "undefined" && !supabaseRef.current) {
    try { supabaseRef.current = createClient() } catch {}
  }
  const supabase = supabaseRef.current

  useEffect(() => {
    if (!userLoading && user) {
      setCredits(user.credits)
      setLoading(false)
    } else if (!userLoading && !user) {
      setCredits(0)
      setLoading(false)
    }
  }, [user, userLoading])

  useEffect(() => {
    if (!user || !supabase) return

    let subscribed = false
    const channel = supabase.channel(`credits-${user.id}`)

    channel.on("postgres_changes",
      { event: "UPDATE", schema: "public", table: "users", filter: `id=eq.${user.id}` },
      (payload: any) => {
        const updated = payload.new as { credits?: number }
        if (updated.credits !== undefined) setCredits(updated.credits)
      }
    )

    channel.subscribe((status: string) => {
      subscribed = status === "SUBSCRIBED"
    })

    return () => {
      subscribed = false
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  const hasEnoughCredits = useCallback(
    (type: keyof typeof CREDITS_PER_GENERATION) => credits >= CREDITS_PER_GENERATION[type],
    [credits]
  )

  const deductCredits = useCallback(async (amount: number) => {
    if (!user || !supabase) return false
    const { error } = await supabase.rpc("deduct_credits", { user_id: user.id, amount })
    if (!error) setCredits((prev) => Math.max(0, prev - amount))
    return !error
  }, [user])

  return { credits, loading: loading || userLoading, hasEnoughCredits, deductCredits }
}
