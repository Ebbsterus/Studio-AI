import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { PRODUCTS } from "@/lib/products"

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Choose the plan that fits your needs. All plans include high-resolution downloads and commercial usage rights.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {PRODUCTS.map((product) => (
            <Card
              key={product.id}
              className={`relative flex flex-col ${
                product.popular
                  ? "border-primary bg-card shadow-lg shadow-primary/10"
                  : "border-border bg-card/50"
              }`}
            >
              {product.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">${product.priceInCents / 100}</span>
                  <span className="text-muted-foreground"> / one-time</span>
                </div>
                
                <div className="mb-4 rounded-lg bg-muted/50 p-3 text-center">
                  <span className="text-2xl font-semibold text-primary">{product.headshotCount}</span>
                  <span className="ml-1 text-muted-foreground">AI headshots</span>
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
              
              <CardFooter>
                <Button
                  className="w-full"
                  variant={product.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href={`/auth/sign-up?plan=${product.id}`}>
                    Get Started
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <p className="mt-12 text-center text-sm text-muted-foreground">
          All plans include a 100% satisfaction guarantee. Not happy? We&apos;ll refund you.
        </p>
      </div>
    </section>
  )
}
