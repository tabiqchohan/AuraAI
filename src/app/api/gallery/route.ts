import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 1), 100)
    const offset = (page - 1) * limit
    const search = searchParams.get("search")
    const sort = searchParams.get("sort") || "created_at"
    const order = searchParams.get("order") || "desc"
    const type = searchParams.get("type")

    const allowedSortFields = ["created_at", "likes_count", "prompt"]
    const sortField = allowedSortFields.includes(sort) ? sort : "created_at"
    const sortOrder = order === "asc" ? "asc" : "desc"

    let query = supabase
      .from("generations")
      .select("*, user:users(email)", { count: "exact" })
      .eq("is_public", true)
      .eq("status", "completed")

    if (search) {
      query = query.ilike("prompt", `%${search}%`)
    }

    if (type === "image" || type === "video") {
      query = query.eq("type", type)
    }

    const { data, count, error } = await query
      .order(sortField, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 })
    }

    let likedGenerationIds: string[] = []

    if (user) {
      const { data: likes } = await supabase
        .from("likes")
        .select("generation_id")
        .eq("user_id", user.id)
        .in(
          "generation_id",
          data?.map((g) => g.id) || []
        )

      if (likes) {
        likedGenerationIds = likes.map((l) => l.generation_id)
      }
    }

    const gallery = data?.map((gen) => ({
      ...gen,
      is_liked: likedGenerationIds.includes(gen.id),
    }))

    return NextResponse.json({
      data: gallery || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Gallery GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
