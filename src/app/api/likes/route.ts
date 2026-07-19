import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { generation_id } = body

    if (!generation_id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 })
    }

    const { data: generation } = await supabase
      .from("generations")
      .select("id, is_public, status")
      .eq("id", generation_id)
      .single()

    if (!generation) {
      return NextResponse.json({ error: "Generation not found" }, { status: 404 })
    }

    if (!generation.is_public || generation.status !== "completed") {
      return NextResponse.json({ error: "Cannot like this generation" }, { status: 400 })
    }

    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("generation_id", generation_id)
      .maybeSingle()

    if (existingLike) {
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id)

      if (deleteError) {
        return NextResponse.json({ error: "Failed to unlike" }, { status: 500 })
      }

      await supabase.rpc("decrement_likes", { generation_id })

      return NextResponse.json({ liked: false })
    }

    const { error: insertError } = await supabase
      .from("likes")
      .insert({ user_id: user.id, generation_id })

    if (insertError) {
      return NextResponse.json({ error: "Failed to like" }, { status: 500 })
    }

    await supabase.rpc("increment_likes", { generation_id })

    return NextResponse.json({ liked: true })
  } catch (error) {
    console.error("Likes POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const generation_id = searchParams.get("generation_id")

    if (!generation_id) {
      return NextResponse.json({ error: "Generation ID is required" }, { status: 400 })
    }

    const { data: like } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", user.id)
      .eq("generation_id", generation_id)
      .maybeSingle()

    return NextResponse.json({ liked: !!like })
  } catch (error) {
    console.error("Likes GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
