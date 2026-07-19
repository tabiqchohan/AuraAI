import Link from "next/link"
import { Sparkles } from "lucide-react"

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
]

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-bold tracking-tight text-zinc-100">
            Aura<span className="text-purple-500">AI</span>
          </span>
        </div>

        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} AuraAI. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
