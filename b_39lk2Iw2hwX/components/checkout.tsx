"use client"

import { useCallback, useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js"
import { createCheckoutSession } from "@/app/actions/stripe"

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

export function Checkout({ productId }: { productId: string }) {
  const [error, setError] = useState<string | null>(null)

  const fetchClientSecret = useCallback(async () => {
    try {
      const { clientSecret } = await createCheckoutSession(productId)
      if (!clientSecret) {
        throw new Error("Failed to create checkout session")
      }
      return clientSecret
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      throw err
    }
  }, [productId])

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
        {error}
      </div>
    )
  }

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
      <EmbeddedCheckout className="w-full" />
    </EmbeddedCheckoutProvider>
  )
}
