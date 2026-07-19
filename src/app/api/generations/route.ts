import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Math.max(parseInt(searchParams.get("page") || "1"), 1)
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 1), 100)
    const offset = (page - 1) * limit
    const status = searchParams.get("status")
    const type = searchParams.get("type")
    const sort = searchParams.get("sort") || "created_at"
    const order = searchParams.get("order") || "desc"
    const search = searchParams.get("search")

    const allowedSortFields = ["created_at", "prompt", "type", "status", "credits_used", "likes_count"]
    const sortField = allowedSortFields.includes(sort) ? sort : "created_at"
    const sortOrder = order === "asc" ? "asc" : "desc"

    let query = supabase
      .from("generations")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)

    if (status) {
      const validStatuses = ["pending", "processing", "completed", "failed"]
      if (validStatuses.includes(status)) {
        query = query.eq("status", status)
      }
    }

    if (type) {
      if (type === "image" || type === "video") {
        query = query.eq("type", type)
      }
    }

    if (search) {
      query = query.ilike("prompt", `%${search}%`)
    }

    const { data, count, error } = await query
      .order(sortField, { ascending: sortOrder === "asc" })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch generations" }, { status: 500 })
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Generations GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 })
    }

    const { data: generation, error: fetchError } = await supabase
      .from("generations")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }

    if (generation.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from("generations")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete generation" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Generations DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
