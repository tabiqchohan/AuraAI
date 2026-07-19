"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@/types"

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase] = useState(() => {
    if (typeof window === "undefined") return null
    try { return createClient() } catch { return null }
  })

  useEffect(() => {
    if (!supabase) { setLoading(false); return }
    const sb = supabase
    async function loadUser() {
      const { data: { user: authUser }, error: authError } = await sb.auth.getUser()
      if (authError || !authUser) {
        setLoading(false)
        return
      }
      const { data } = await sb
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single()
      if (data) setUser(data as User)
      setLoading(false)
    }

    loadUser()

    const { data: { subscription } } = sb.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null)
          setLoading(false)
          return
        }
        if (session?.user) {
          const { data } = await sb
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single()
          if (data) setUser(data as User)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}
