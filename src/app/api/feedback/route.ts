import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message, rating } = body

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from("feedback").insert({
      name: name || null,
      email: email || null,
      message,
      rating: rating || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Feedback insert error:", error)
      return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}