"use server"

import { stripe } from "@/lib/stripe"
import { getProductById } from "@/lib/products"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function createCheckoutSession(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const product = getProductById(productId)
  if (!product) {
    throw new Error("Product not found")
  }

  // Create order in database first
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      plan_id: product.id,
      plan_name: product.name,
      headshot_count: product.headshotCount,
      price_cents: product.priceInCents,
      status: "pending",
    })
    .select()
    .single()

  if (orderError) {
    throw new Error("Failed to create order")
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded" as any,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${product.name} - ${product.headshotCount} AI Headshots`,
            description: product.description,
          },
          unit_amount: product.priceInCents,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
    metadata: {
      userId: user.id,
      productId: product.id,
      orderId: order.id,
      headshotCount: product.headshotCount.toString(),
    },
  })

  return { clientSecret: session.client_secret, orderId: order.id }
}

export async function getCheckoutSession(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId)
  return session
}
