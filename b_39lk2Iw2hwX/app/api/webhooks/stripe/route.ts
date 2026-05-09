"use server"

import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session

      // Update order status to completed
      if (session.metadata?.order_id) {
        const { error } = await supabase
          .from("orders")
          .update({
            status: "completed",
            stripe_session_id: session.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.metadata.order_id)

        if (error) {
          console.error("Error updating order:", error)
        }
      }
      break
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session

      // Update order status to cancelled
      if (session.metadata?.order_id) {
        await supabase
          .from("orders")
          .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("id", session.metadata.order_id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
