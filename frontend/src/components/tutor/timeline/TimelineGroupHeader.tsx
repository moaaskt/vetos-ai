interface TimelineGroupHeaderProps {
  /** Formatted month/year string, e.g. "Julho de 2026" */
  label: string;
}

export function TimelineGroupHeader({ label }: TimelineGroupHeaderProps) {
  return (
    <div className="flex items-center gap-3 pt-2 pb-1" role="separator">
      <div className="h-px flex-1 bg-gradient-to-r from-border/80 to-transparent" />
      <h3 className="text-[11px] font-bold text-muted-foreground/70 tracking-widest uppercase whitespace-nowrap select-none">
        {label}
      </h3>
      <div className="h-px flex-1 bg-gradient-to-l from-border/80 to-transparent" />
    </div>
  );
}
