"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

type SupabaseContextType = {
  user: User | null
  loading: boolean
  refreshUser: () => Promise<void>
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
})

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabase, setSupabase] = useState<ReturnType<typeof createClient> | null>(null)

  useEffect(() => {
    try {
      const client = createClient()
      setSupabase(client)
      client.auth.getUser().then(({ data: { user } }) => {
        setUser(user)
        setLoading(false)
      })
      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })
      return () => subscription.unsubscribe()
    } catch {
      setLoading(false)
    }
  }, [])

  const refreshUser = async () => {
    if (!supabase) return
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  return (
    <SupabaseContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  return useContext(SupabaseContext)
}
