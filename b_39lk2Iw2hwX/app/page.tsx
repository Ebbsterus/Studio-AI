import { Header } from "@/components/header"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { PricingSection } from "@/components/landing/pricing-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}
