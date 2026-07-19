import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { REFERRAL_CREDITS } from "@/lib/constants"

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select("referral_code, referred_by, credits")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Failed to fetch referral info" }, { status: 500 })
    }

    const { count: totalReferrals, error: countError } = await supabase
      .from("users")
      .select("id", { count: "exact", head: true })
      .eq("referred_by", profile.referral_code)

    if (countError) {
      return NextResponse.json({ error: "Failed to fetch referral stats" }, { status: 500 })
    }

    const { data: referredUsers } = await supabase
      .from("users")
      .select("id, email, created_at")
      .eq("referred_by", profile.referral_code)
      .order("created_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      referralCode: profile.referral_code,
      referredBy: profile.referred_by,
      totalReferrals: totalReferrals || 0,
      referralCreditsEarned: (totalReferrals || 0) * REFERRAL_CREDITS,
      currentCredits: profile.credits,
      referredUsers: referredUsers || [],
    })
  } catch (error) {
    console.error("Referral GET error:", error)
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
    const { code } = body

    if (!code) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 })
    }

    const referralCode = code.toUpperCase()

    const { data: profile } = await supabase
      .from("users")
      .select("referred_by, referral_code")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (profile.referred_by) {
      return NextResponse.json({ error: "Referral code already applied" }, { status: 400 })
    }

    if (profile.referral_code === referralCode) {
      return NextResponse.json({ error: "Cannot use your own referral code" }, { status: 400 })
    }

    const { data: referrer, error: referrerError } = await supabase
      .from("users")
      .select("id, credits")
      .eq("referral_code", referralCode)
      .single()

    if (referrerError || !referrer) {
      return NextResponse.json({ error: "Invalid referral code" }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({ referred_by: referralCode, credits: REFERRAL_CREDITS })
      .eq("id", user.id)

    if (updateError) {
      return NextResponse.json({ error: "Failed to apply referral code" }, { status: 500 })
    }

    const { error: referrerUpdateError } = await supabase
      .from("users")
      .update({ credits: referrer.credits + REFERRAL_CREDITS })
      .eq("id", referrer.id)

    if (referrerUpdateError) {
      console.error("Failed to credit referrer:", referrerUpdateError)
    }

    return NextResponse.json({
      success: true,
      creditsAwarded: REFERRAL_CREDITS,
      message: `Referral code applied! You received ${REFERRAL_CREDITS} credits.`,
    })
  } catch (error) {
    console.error("Referral POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
