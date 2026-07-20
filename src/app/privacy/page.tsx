export default function PrivacyPage() {
  return (
    <>
      <main className="min-h-screen pt-24 pb-16 px-4 bg-black">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <div className="space-y-6 text-zinc-400">
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">1. Information We Collect</h2>
              <p>We collect information you provide when creating an account, including your email address and name. We also collect data about your usage of our AI generation services.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">2. How We Use Your Information</h2>
              <p>Your information is used to provide and improve our AI generation services, process payments, and communicate with you about your account.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">3. Data Storage</h2>
              <p>Your generated images and videos are stored securely. You can delete your generations at any time from your dashboard.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">4. Third-Party Services</h2>
              <p>We use third-party services including Stripe for payments and Replicate for AI processing. Your data is handled according to their respective privacy policies.</p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-zinc-200 mb-3">5. Contact</h2>
              <p>If you have any questions about this privacy policy, please contact us through our contact page.</p>
            </section>
          </div>
        </div>
      </main>
    </>
  )
}