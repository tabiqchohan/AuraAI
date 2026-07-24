"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "sonner"
import { useTheme } from "next-themes"
import { SupabaseProvider } from "./SupabaseProvider"

function ThemedToaster() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? "#18181b" : "#ffffff",
          border: isDark ? "1px solid #27272a" : "1px solid #e4e4e7",
          color: isDark ? "#f4f4f5" : "#09090b",
        },
      }}
    />
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={true}>
      <SupabaseProvider>
        {children}
        <ThemedToaster />
      </SupabaseProvider>
    </ThemeProvider>
  )
}
