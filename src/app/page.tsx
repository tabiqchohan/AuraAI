import Hero from "@/components/landing/Hero"
import Features from "@/components/landing/Features"
import PricingSection from "@/components/landing/PricingSection"
import CTA from "@/components/landing/CTA"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <Features />
      <PricingSection />
      <CTA />
    </main>
  )
}
