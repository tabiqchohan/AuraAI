import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLANS } from "@/lib/constants"
import type { PlanId } from "@/types"
import Stripe from "stripe"


export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error("Webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const supabase = createAdminClient()

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const planId = session.metadata?.plan_id
        const credits = session.metadata?.credits

        if (!userId) {
          return NextResponse.json({ error: "Missing user_id" }, { status: 400 })
        }

        if (planId) {
          const plan = PLANS.find((p) => p.id === (planId as PlanId))
          if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 })

          const subscriptionEnd = new Date()
          subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1)

          await supabase.from("users").update({
            stripe_customer_id: session.customer as string,
            subscription_status: "active",
            subscription_plan: planId as PlanId,
            subscription_end_date: subscriptionEnd.toISOString(),
            credits: plan.credits,
          }).eq("id", userId)
        } else if (credits) {
          const { data: user } = await supabase
            .from("users")
            .select("credits")
            .eq("id", userId)
            .single()

          await supabase.from("users").update({
            stripe_customer_id: session.customer as string,
            credits: (user?.credits || 0) + parseInt(credits),
          }).eq("id", userId)
        }

        break
      }

      case "invoice.paid": {
        const invoice = event.data.object as any
        const subscriptionId = typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id

        if (!subscriptionId) break

        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.user_id
          const planId = subscription.metadata?.plan_id

          if (!userId || !planId) break

          const plan = PLANS.find((p) => p.id === (planId as PlanId))
          if (!plan) break

          const subData = subscription as any
          const subscriptionEnd = new Date((subData.current_period_end as number) * 1000)

          const { data: user } = await supabase
            .from("users")
            .select("credits")
            .eq("id", userId)
            .single()

          await supabase.from("users").update({
            subscription_status: "active",
            subscription_end_date: subscriptionEnd.toISOString(),
            credits: (user?.credits || 0) + plan.credits,
          }).eq("id", userId)
        } catch (err) {
          console.error("Error processing invoice.paid:", err)
        }

        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.user_id

        if (!userId) break

        await supabase.from("users").update({
          subscription_status: "inactive",
          subscription_plan: "free",
          subscription_end_date: null,
        }).eq("id", userId)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
