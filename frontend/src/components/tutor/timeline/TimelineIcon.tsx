import { cn } from '../../../lib/utils';

// ─── Semantic tone tokens ────────────────────────────────────────────────────
// Colors chosen to meet WCAG AA (4.5:1) on a white card background.
// Hue references are aligned with the DESIGN.md OKLCH palette.
const toneStyles: Record<string, { bg: string; text: string }> = {
  blue:    { bg: 'bg-blue-100',    text: 'text-blue-700'    },
  green:   { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  amber:   { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  red:     { bg: 'bg-red-100',     text: 'text-red-700'     },
  purple:  { bg: 'bg-violet-100',  text: 'text-violet-700'  },
  neutral: { bg: 'bg-gray-100',    text: 'text-gray-600'    },
};

function getTone(tone?: string) {
  return toneStyles[tone ?? 'neutral'] ?? toneStyles.neutral;
}

interface TimelineIconProps {
  icon: string;
  tone?: string;
  title: string;
  /** Semantic label for the category, e.g. "Consulta", "Vacinação" */
  categoryLabel?: string;
}

export function TimelineIcon({ icon, tone, title, categoryLabel }: TimelineIconProps) {
  const t = getTone(tone);

  return (
    <div
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-full text-lg flex-shrink-0',
        'ring-4 ring-white shadow-sm',
        'transition-all duration-300 group-hover:scale-110 group-hover:shadow-md',
        t.bg,
        t.text,
      )}
      aria-label={`${categoryLabel ?? 'Evento'}: ${title}`}
      role="img"
    >
      {icon}
    </div>
  );
}
