import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-6">
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Subscription Successful!
          </h1>
          <p className="text-zinc-400 mb-8 leading-relaxed">
            Thank you for subscribing to AuraAI. Your account has been upgraded
            and you can now start generating with your new plan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/pricing">Manage Plan</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
