import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { PLANS, CREDIT_PACKS } from "@/lib/constants"
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
    const { type, planId, packId, currency, couponCode } = body

    const { data: profile } = await supabase
      .from("users")
      .select("stripe_customer_id, email")
      .eq("id", user.id)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: profile?.email || user.email,
        metadata: { user_id: user.id },
      })
      customerId = customer.id
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", user.id)
    }

    if (type === "subscription") {
      if (!planId) return NextResponse.json({ error: "Plan ID is required" }, { status: 400 })
      const plan = PLANS.find((p) => p.id === (planId as PlanId))
      if (!plan || !plan.priceId) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

      const sessionParams: any = {
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: plan.priceId, quantity: 1 }],
        success_url: `${request.headers.get("origin") || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${request.headers.get("origin") || "http://localhost:3000"}/pricing`,
        metadata: { user_id: user.id, plan_id: planId },
        subscription_data: { metadata: { user_id: user.id, plan_id: planId } },
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
            const sc = await stripe.coupons.create({ percent_off: coupon.discount_percent, duration: "once" })
            sessionParams.discounts = [{ coupon: sc.id }]
          }
        }
      }

      const session = await stripe.checkout.sessions.create(sessionParams)
      return NextResponse.json({ url: session.url, sessionId: session.id })
    }

    if (type === "credits") {
      if (!packId) return NextResponse.json({ error: "Pack ID is required" }, { status: 400 })
      const pack = CREDIT_PACKS.find((p) => p.id === packId)
      if (!pack) return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 })

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        line_items: [{
          price_data: {
            currency: currency === "PKR" ? "pkr" : "usd",
            product_data: {
              name: `${pack.name} - ${pack.credits} Credits`,
              description: `One-time purchase of ${pack.credits} credits for AuraAI`,
            },
            unit_amount: currency === "PKR" ? pack.prices.PKR * 100 : pack.prices.USD * 100,
          },
          quantity: 1,
        }],
        success_url: `${request.headers.get("origin") || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}&type=credits&pack=${packId}`,
        cancel_url: `${request.headers.get("origin") || "http://localhost:3000"}/dashboard`,
        metadata: { user_id: user.id, credits: pack.credits.toString(), pack_id: packId },
        payment_intent_data: { metadata: { user_id: user.id, credits: pack.credits.toString(), pack_id: packId } },
      })

      return NextResponse.json({ url: session.url, sessionId: session.id })
    }

    return NextResponse.json({ error: "Invalid purchase type" }, { status: 400 })
  } catch (error) {
    console.error("Create checkout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
