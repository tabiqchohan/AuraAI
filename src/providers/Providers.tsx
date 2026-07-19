"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { SupabaseProvider } from "./SupabaseProvider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <SupabaseProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid #27272a",
              color: "#f4f4f5",
            },
          }}
        />
      </SupabaseProvider>
    </ThemeProvider>
  )
}
