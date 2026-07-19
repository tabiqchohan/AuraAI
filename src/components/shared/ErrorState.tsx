import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ErrorState({
  message,
  onRetry,
}: {
  message: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h3 className="text-lg font-medium text-zinc-300 mb-2">Something went wrong</h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
