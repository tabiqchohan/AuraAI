import { Sidebar } from "@/components/layout/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Sidebar />
      <main className="lg:pl-60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-24">
          {children}
        </div>
      </main>
    </div>
  )
}