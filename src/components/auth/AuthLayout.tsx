import Link from "next/link"
import { Sparkles } from "lucide-react"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950 to-zinc-950" />
      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="h-8 w-8 text-purple-500" />
          <span className="text-2xl font-bold tracking-tight text-zinc-100">
            Aura<span className="text-purple-500">AI</span>
          </span>
        </Link>
        {children}
        <p className="mt-8 text-center text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} AuraAI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
