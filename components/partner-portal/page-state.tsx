import { Button } from "@/components/ui/button"

export function PageState({
  title,
  action,
  onRetry,
}: {
  title: string
  action?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border bg-white p-6 text-center">
      <p className="text-sm font-medium">{title}</p>
      {onRetry && (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          {action ?? "Réessayer"}
        </Button>
      )}
    </div>
  )
}

