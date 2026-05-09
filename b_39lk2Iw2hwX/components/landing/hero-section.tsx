import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Headshots</span>
            </div>
            
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Professional Headshots,{" "}
              <span className="text-primary">Powered by AI</span>
            </h1>
            
            <p className="mb-8 max-w-xl text-lg text-muted-foreground text-pretty">
              Transform your casual photos into stunning professional headshots in minutes. 
              No photoshoot required. Perfect for LinkedIn, resumes, and corporate profiles.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/sign-up">
                  Get Your Headshots
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/#pricing">View Pricing</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>100K+ headshots created</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Before/After comparison - Two examples */}
          <div className="relative flex flex-col gap-6">
            {/* Female Asian example */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/50 bg-card">
              <div className="absolute inset-0 grid grid-cols-2">
                {/* Before */}
                <div className="relative border-r border-border/50">
                  <Image
                    src="/images/before-female.jpg"
                    alt="Before - casual photo of woman"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                    Before
                  </div>
                </div>
                {/* After */}
                <div className="relative">
                  <Image
                    src="/images/after-female.jpg"
                    alt="After - professional AI headshot of woman"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 right-3 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                    After
                  </div>
                </div>
              </div>
              {/* Center divider */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary p-1.5">
                <ArrowRight className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>

            {/* Male Caucasian example */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-border/50 bg-card">
              <div className="absolute inset-0 grid grid-cols-2">
                {/* Before */}
                <div className="relative border-r border-border/50">
                  <Image
                    src="/images/before-male.jpg"
                    alt="Before - casual photo of man"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3 rounded-full bg-background/90 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                    Before
                  </div>
                </div>
                {/* After */}
                <div className="relative">
                  <Image
                    src="/images/after-male.jpg"
                    alt="After - professional AI headshot of man"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 right-3 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                    After
                  </div>
                </div>
              </div>
              {/* Center divider */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-background bg-primary p-1.5">
                <ArrowRight className="h-3 w-3 text-primary-foreground" />
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 rounded-xl border border-border bg-card p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Enhanced</p>
                  <p className="text-xs text-muted-foreground">Studio quality</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
