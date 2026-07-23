import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { PricingClient } from "./PricingClient"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <Navbar />
      <PricingClient />
      <Footer />
    </div>
  )
}
