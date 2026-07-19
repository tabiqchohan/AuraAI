"use client"

import { useCallback, useState } from "react"

export function useCopyToClipboard(resetDelayMs: number = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), resetDelayMs)
        return true
      } catch {
        setCopied(false)
        return false
      }
    },
    [resetDelayMs]
  )

  return { copy, copied }
}
