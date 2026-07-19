import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("saved_prompts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch prompts" }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Prompts GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, prompt, negative_prompt, type } = body

    if (!title || !prompt || !type) {
      return NextResponse.json({ error: "Missing required fields: title, prompt, type" }, { status: 400 })
    }

    if (type !== "image" && type !== "video") {
      return NextResponse.json({ error: "Type must be 'image' or 'video'" }, { status: 400 })
    }

    const id = uuidv4()
    const { error: insertError } = await supabase.from("saved_prompts").insert({
      id,
      user_id: user.id,
      title,
      prompt,
      negative_prompt: negative_prompt || null,
      type,
    })

    if (insertError) {
      return NextResponse.json({ error: "Failed to save prompt" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Prompts POST error:", error)
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
      return NextResponse.json({ error: "Prompt ID is required" }, { status: 400 })
    }

    const { data: prompt, error: fetchError } = await supabase
      .from("saved_prompts")
      .select("user_id")
      .eq("id", id)
      .single()

    if (fetchError || !prompt) {
      return NextResponse.json({ error: "Prompt not found" }, { status: 404 })
    }

    if (prompt.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from("saved_prompts")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete prompt" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Prompts DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
