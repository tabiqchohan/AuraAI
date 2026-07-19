import { Inbox } from "lucide-react"

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Inbox className="h-12 w-12 text-zinc-600 mb-4" />
      <h3 className="text-lg font-medium text-zinc-300 mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 mb-4 max-w-md">{description}</p>
      {action}
    </div>
  )
}
