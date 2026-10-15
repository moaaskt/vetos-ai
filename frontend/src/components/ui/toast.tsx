import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useEffect } from 'react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

interface ToastProps {
  toast: ToastMessage | null
  onDismiss: () => void
}

export function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      onDismiss()
    }, 4500)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  if (!toast) return null

  const typeConfig = {
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200',
      icon: CheckCircle,
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200',
      icon: AlertCircle,
      iconColor: 'text-rose-600 dark:text-rose-400',
    },
    info: {
      bg: 'bg-sky-500/10 border-sky-500/30 text-sky-800 dark:text-sky-200',
      icon: Info,
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
  }[toast.type]

  const Icon = typeConfig.icon

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${typeConfig.bg}`}
        role="alert"
      >
        <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${typeConfig.iconColor}`} />
        <div className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors p-0.5 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
