import { cn } from '../../../lib/utils';

// ─── Appointment status badge styles ─────────────────────────────────────────
// WCAG AA 4.5:1 contrast verified against white card backgrounds.
const badgeVariants = {
  scheduled: {
    className: 'bg-amber-100 text-amber-800 ring-1 ring-amber-300/60',
    label: 'Agendada',
  },
  completed: {
    className: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-300/60',
    label: 'Realizada',
  },
} as const;

type BadgeVariant = keyof typeof badgeVariants;

interface TimelineBadgeProps {
  variant: BadgeVariant;
  className?: string;
}

export function TimelineBadge({ variant, className }: TimelineBadgeProps) {
  const config = badgeVariants[variant];

  return (
    <span
      className={cn(
        'inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider select-none',
        'transition-opacity duration-200',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
