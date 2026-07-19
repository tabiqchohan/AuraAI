import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("users")
      .select("credits, total_generations, subscription_plan, subscription_status")
      .eq("id", user.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "Failed to fetch credits" }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Credits GET error:", error)
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

    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 })
    }

    const body = await request.json()
    const { user_id, amount, reason } = body

    if (!user_id || !amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid user_id or amount" }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: updatedUser, error } = await adminClient
      .from("users")
      .select("credits")
      .eq("id", user_id)
      .single()

    if (error || !updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { error: updateError } = await adminClient
      .from("users")
      .update({ credits: updatedUser.credits + amount })
      .eq("id", user_id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update credits" }, { status: 500 })
    }

    await adminClient.from("credit_logs").insert({
      user_id,
      amount,
      type: "admin_add",
      reason: reason || "Admin adjustment",
      created_at: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      previousCredits: updatedUser.credits,
      newCredits: updatedUser.credits + amount,
    })
  } catch (error) {
    console.error("Credits POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
