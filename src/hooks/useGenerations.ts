"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Generation, GenerationStatus, GenerationType } from "@/types"

type UseGenerationsOptions = {
  limit?: number
  userId?: string
}

type FetchGenerationsParams = {
  page?: number
  status?: GenerationStatus
  type?: GenerationType
  public?: boolean
}

export function useGenerations(options: UseGenerationsOptions = {}) {
  const { limit = 12 } = options
  const [generations, setGenerations] = useState<Generation[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [supabase] = useState(() => {
    if (typeof window === "undefined") return null
    try { return createClient() } catch { return null }
  })

  const fetchGenerations = useCallback(
    async (params: FetchGenerationsParams = {}) => {
      const sb = supabase
      if (!sb) return { data: null, count: null }
      setLoading(true)
      const { page = 0, status, type, public: isPublic } = params
      const from = page * limit
      const to = from + limit - 1

      let query = sb
        .from("generations")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to)

      if (options.userId) query = query.eq("user_id", options.userId)
      if (status) query = query.eq("status", status)
      if (type) query = query.eq("type", type)
      if (isPublic !== undefined) query = query.eq("is_public", isPublic)

      const { data, count } = await query

      if (page === 0) {
        setGenerations((data as Generation[]) || [])
      } else {
        setGenerations((prev) => [...prev, ...((data as Generation[]) || [])])
      }

      if (count !== null) setHasMore(from + limit < count)
      setLoading(false)
      return { data: data as Generation[] | null, count }
    },
    [limit, options.userId]
  )

  const addGeneration = useCallback((generation: Generation) => {
    setGenerations((prev) => [generation, ...prev])
  }, [])

  const updateGeneration = useCallback(
    (id: string, updates: Partial<Generation>) => {
      setGenerations((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
      )
    },
    []
  )

  const removeGeneration = useCallback((id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const toggleLike = useCallback(async (generationId: string) => {
    const sb = supabase
    if (!sb) return
    const { data: { user: authUser } } = await sb.auth.getUser()
    if (!authUser) return

    const { data: existing } = await sb
      .from("likes")
      .select("id")
      .eq("user_id", authUser.id)
      .eq("generation_id", generationId)
      .maybeSingle()

    if (existing) {
      await sb.from("likes").delete().eq("id", existing.id)
      setGenerations((prev) =>
        prev.map((g) =>
          g.id === generationId
            ? { ...g, likes_count: Math.max(0, g.likes_count - 1) }
            : g
        )
      )
    } else {
      await sb.from("likes").insert({
        user_id: authUser.id,
        generation_id: generationId,
      })
      setGenerations((prev) =>
        prev.map((g) =>
          g.id === generationId
            ? { ...g, likes_count: g.likes_count + 1 }
            : g
        )
      )
    }
  }, [])

  return {
    generations,
    loading,
    hasMore,
    fetchGenerations,
    addGeneration,
    updateGeneration,
    removeGeneration,
    toggleLike,
  }
}
