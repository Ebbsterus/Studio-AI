import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProductById, PRODUCTS } from "@/lib/products"
import { Checkout } from "@/components/checkout"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    planId: product.id,
  }))
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>
}) {
  const { planId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const product = getProductById(planId)
  if (!product) {
    redirect("/#pricing")
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order summary */}
          <div>
            <h1 className="mb-2 text-3xl font-bold">Complete Your Order</h1>
            <p className="mb-8 text-muted-foreground">
              You&apos;re one step away from professional AI headshots
            </p>

            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>{product.name} Plan</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 flex items-baseline justify-between border-b border-border pb-6">
                  <div>
                    <span className="text-3xl font-bold">${product.priceInCents / 100}</span>
                    <span className="text-muted-foreground"> one-time</span>
                  </div>
                  <div className="rounded-lg bg-primary/10 px-3 py-1 text-primary">
                    {product.headshotCount} headshots
                  </div>
                </div>
                <ul className="space-y-3">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Stripe checkout */}
          <div className="rounded-xl border border-border bg-card p-6">
            <Checkout productId={planId} />
          </div>
        </div>
      </main>
    </div>
  )
}
