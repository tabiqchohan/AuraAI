"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"

const dashboardPaths = ["/dashboard", "/admin"]

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isDashboard = dashboardPaths.some((p) => pathname.startsWith(p))

  if (isDashboard) return <>{children}</>

  return (
    <>
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}