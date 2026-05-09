import Link from "next/link"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getCheckoutSession } from "@/app/actions/stripe"
import { getProductById } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { CheckCircle2, ArrowRight } from "lucide-react"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  
  if (!session_id) {
    redirect("/dashboard")
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const session = await getCheckoutSession(session_id)
  
  if (session.payment_status !== "paid") {
    redirect("/dashboard")
  }

  const productId = session.metadata?.productId || "basic"
  const headshotCount = parseInt(session.metadata?.headshotCount || "5")
  const product = getProductById(productId)

  // Create order in database
  const { error } = await supabase.from("orders").insert({
    user_id: user.id,
    plan_id: productId,
    plan_name: product?.name || "Basic",
    headshot_count: headshotCount,
    price_cents: session.amount_total || 0,
    status: "paid",
    stripe_session_id: session_id,
  })

  if (error) {
    console.error("Error creating order:", error)
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
        <Card className="w-full max-w-md border-border bg-card text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
              Your order has been confirmed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">You purchased</p>
              <p className="text-xl font-semibold">
                {product?.name} - {headshotCount} AI Headshots
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Now it&apos;s time to upload your photos so we can generate your professional headshots.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full" asChild>
              <Link href="/upload">
                Upload Photos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
