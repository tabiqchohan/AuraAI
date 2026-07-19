import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 px-4 bg-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          <div className="space-y-6 text-zinc-400">
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">1. Acceptance of Terms</h2>
              <p>By using AuraAI, you agree to these terms of service. If you do not agree, please do not use our services.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">2. Service Description</h2>
              <p>AuraAI provides AI-powered image and video generation services. We reserve the right to modify or discontinue services at any time.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">3. User Responsibilities</h2>
              <p>You agree not to use our services for generating illegal, harmful, or inappropriate content. You are responsible for maintaining the confidentiality of your account.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">4. Payments & Refunds</h2>
              <p>Subscription payments are processed through Stripe. Refunds are handled on a case-by-case basis. Contact us for any billing issues.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">5. Limitation of Liability</h2>
              <p>AuraAI is not liable for any damages arising from the use of our services. Our AI generation service is provided as-is.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}