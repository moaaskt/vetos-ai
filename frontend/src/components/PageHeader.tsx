import React from 'react'

type PageHeaderProps = {
  title: string
  description: string
  badge?: string
  action?: React.ReactNode
}

export function PageHeader({ title, description, badge, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-6 rounded-xl p-4 -mx-4 md:-mx-8 px-4 md:px-8">
      <div className="space-y-1.5">
        {badge && (
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary border border-primary/15">
            {badge}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {action}
      </div>
    </div>
  )
}
