import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { PLANS } from "@/lib/constants"
import type { PlanId } from "@/types"

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { planId, couponCode } = body as { planId: string; couponCode?: string }

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
    }

    const plan = PLANS.find((p) => p.id === (planId as PlanId))
    if (!plan || !plan.priceId) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe!.customers.create({
        email: profile?.email || user.email,
        metadata: { user_id: user.id },
      })
      customerId = customer.id

      await supabase
        .from("users")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)
    }

    const sessionParams: any = {
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${request.headers.get("origin") || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin") || "http://localhost:3000"}/pricing`,
      metadata: { user_id: user.id, plan_id: planId },
      subscription_data: {
        metadata: { user_id: user.id, plan_id: planId },
      },
    }

    if (couponCode) {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("is_active", true)
        .single()

      if (coupon) {
        const now = new Date()
        const expiresAt = new Date(coupon.expires_at)

        if (expiresAt > now && coupon.current_uses < coupon.max_uses) {
          const stripeCoupon = await stripe.coupons.create({
            percent_off: coupon.discount_percent,
            duration: "once",
          })

          sessionParams.discounts = [{ coupon: stripeCoupon.id }]
        }
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (error) {
    console.error("Create checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}