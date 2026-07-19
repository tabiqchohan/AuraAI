import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { v4 as uuidv4 } from "uuid"

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Unauthorized", status: 401 }
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single()

  if (!profile?.is_admin) {
    return { error: "Forbidden: Admins only", status: 403 }
  }

  return { adminClient: createAdminClient() }
}

export async function GET() {
  try {
    const result = await requireAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const { data, error } = await result.adminClient
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
    }

    return NextResponse.json({ data: data || [] })
  } catch (error) {
    console.error("Coupons GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const result = await requireAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const body = await request.json()
    const { code, discount_percent, max_uses, expires_at } = body

    if (!code || !discount_percent || !max_uses || !expires_at) {
      return NextResponse.json(
        { error: "Missing required fields: code, discount_percent, max_uses, expires_at" },
        { status: 400 }
      )
    }

    if (discount_percent < 1 || discount_percent > 100) {
      return NextResponse.json({ error: "Discount percent must be between 1 and 100" }, { status: 400 })
    }

    if (max_uses < 1) {
      return NextResponse.json({ error: "Max uses must be at least 1" }, { status: 400 })
    }

    const existingCode = code.toUpperCase()

    const { data: existing } = await result.adminClient
      .from("coupons")
      .select("id")
      .eq("code", existingCode)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 409 })
    }

    const id = uuidv4()
    const { error: insertError } = await result.adminClient.from("coupons").insert({
      id,
      code: existingCode,
      discount_percent,
      max_uses,
      current_uses: 0,
      expires_at,
      is_active: true,
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("Coupons POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const result = await requireAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const body = await request.json()
    const { id, code, discount_percent, max_uses, expires_at, is_active } = body

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
    }

    const { data: existing } = await result.adminClient
      .from("coupons")
      .select("id")
      .eq("id", id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}
    if (code) updates.code = code.toUpperCase()
    if (discount_percent !== undefined) {
      if (discount_percent < 1 || discount_percent > 100) {
        return NextResponse.json({ error: "Discount percent must be between 1 and 100" }, { status: 400 })
      }
      updates.discount_percent = discount_percent
    }
    if (max_uses !== undefined) {
      if (max_uses < 1) {
        return NextResponse.json({ error: "Max uses must be at least 1" }, { status: 400 })
      }
      updates.max_uses = max_uses
    }
    if (expires_at) updates.expires_at = expires_at
    if (is_active !== undefined) updates.is_active = is_active

    const { error: updateError } = await result.adminClient
      .from("coupons")
      .update(updates)
      .eq("id", id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Coupons PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const result = await requireAdmin()
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 })
    }

    const { data: existing } = await result.adminClient
      .from("coupons")
      .select("id")
      .eq("id", id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    const { error: deleteError } = await result.adminClient
      .from("coupons")
      .delete()
      .eq("id", id)

    if (deleteError) {
      return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Coupons DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
