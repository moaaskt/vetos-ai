import { cn } from '../../../lib/utils';

interface SummaryCardProps {
  icon: string;
  label: string;
  value: string;
  /** If true, spans 2 columns on sm+ screens */
  wide?: boolean;
}

export function SummaryCard({ icon, label, value, wide }: SummaryCardProps) {
  return (
    <div
      className={cn(
        'group/card relative p-4 rounded-xl border border-border/70 bg-background/60',
        'flex flex-col justify-between gap-2',
        'transition-all duration-300',
        'hover:bg-white hover:border-primary/20 hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)]',
        wide && 'sm:col-span-2',
      )}
    >
      {/* Subtle accent line on hover */}
      <div className="absolute top-0 left-3 right-3 h-px bg-gradient-to-r from-transparent via-primary/0 to-transparent group-hover/card:via-primary/30 transition-all duration-500" />

      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden="true">{icon}</span>
        <span className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">
          {label}
        </span>
      </div>
      <span className="text-sm font-bold text-foreground leading-snug">
        {value}
      </span>
    </div>
  );
}
