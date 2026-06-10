import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Une erreur est survenue.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50/50 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-5 w-5 text-red-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-red-700">{message}</p>
        <p className="text-xs text-red-400 mt-0.5">Vérifiez votre connexion et réessayez</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <RefreshCw className="h-3 w-3" />
          Réessayer
        </button>
      )}
    </div>
  )
}
