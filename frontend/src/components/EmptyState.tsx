import * as React from "react"
import { LucideIcon } from "lucide-react"
import { Button } from "./ui/button"

interface EmptyStateProps {
  title: string
  description: string
  icon: LucideIcon | React.ReactNode
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-lg border border-dashed border-border animate-in fade-in-0 duration-500">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
        {React.isValidElement(Icon) ? (
          Icon
        ) : (
          // @ts-ignore - Assuming it's a component like LucideIcon
          <Icon className="h-10 w-10 text-teal-400" />
        )}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
